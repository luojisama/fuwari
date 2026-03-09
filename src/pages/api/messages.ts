import type { APIRoute } from "astro";
import { UAParser } from "ua-parser-js";
import { addMessage, getMessages } from "../../utils/local-db";

export const prerender = false;

type ModerationResult = {
	allowed: boolean;
	reason?: string;
	category?: string;
};

function getOpenAIConfig() {
	const apiKey = process.env.OPENAI_API_KEY;
	const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(
		/\/$/,
		"",
	);
	const moderationModel = process.env.OPENAI_MODERATION_MODEL || "omni-moderation-latest";
	const chatModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
	return { apiKey, baseUrl, moderationModel, chatModel };
}

function mapCategoryFromModeration(categories: Record<string, boolean>): string {
	if (categories?.sexual) return "porn";
	if (categories?.["sexual/minors"]) return "porn";
	if (categories?.violence) return "violence";
	if (categories?.["violence/graphic"]) return "violence";
	if (categories?.["self-harm"]) return "violence";
	if (categories?.["self-harm/intent"]) return "violence";
	if (categories?.["self-harm/instructions"]) return "violence";
	if (categories?.harassment) return "violence";
	if (categories?.["harassment/threatening"]) return "violence";
	if (categories?.hate) return "violence";
	if (categories?.["hate/threatening"]) return "violence";
	if (categories?.illicit) return "drugs";
	if (categories?.["illicit/violent"]) return "terrorism";
	return "unknown";
}

function containsPolicyCategory(text: string): ModerationResult {
	const normalized = text.toLowerCase();
	if (/porn|sex|adult|nsfw|escort/.test(normalized)) {
		return { allowed: false, category: "porn", reason: "Contains sexual content" };
	}
	if (/gambl|casino|bet|lottery|bookmaker/.test(normalized)) {
		return {
			allowed: false,
			category: "gambling",
			reason: "Contains gambling content",
		};
	}
	if (/drug|heroin|cocaine|meth|fentanyl|traffick/.test(normalized)) {
		return { allowed: false, category: "drugs", reason: "Contains drug content" };
	}
	if (/terror|extremis|bomb attack|hostage|isis/.test(normalized)) {
		return {
			allowed: false,
			category: "terrorism",
			reason: "Contains terrorism content",
		};
	}
	if (/kill|shoot|stab|behead|violent|massacre|attack plan/.test(normalized)) {
		return { allowed: false, category: "violence", reason: "Contains violent content" };
	}
	return { allowed: true, category: "none" };
}

async function moderateWithOpenAIModerations(inputText: string): Promise<ModerationResult> {
	const { apiKey, baseUrl, moderationModel } = getOpenAIConfig();
	const response = await fetch(`${baseUrl}/moderations`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: moderationModel,
			input: inputText,
		}),
	});

	if (!response.ok) {
		throw new Error(`Moderations API failed: ${response.status}`);
	}

	const data = await response.json();
	const result = data?.results?.[0];
	if (!result) {
		throw new Error("Moderations API returned empty result");
	}

	const flagged = !!result.flagged;
	if (!flagged) {
		return { allowed: true, category: "none" };
	}

	const category = mapCategoryFromModeration(result.categories || {});
	if (category !== "unknown") {
		if (["porn", "gambling", "drugs", "terrorism", "violence"].includes(category)) {
			return { allowed: false, category, reason: "Flagged by moderation model" };
		}
		return { allowed: true, category: "none" };
	}

	return { allowed: true, category: "none" };
}

async function moderateWithChatCompletion(input: {
	nickname: string;
	content: string;
	website?: string;
}): Promise<ModerationResult> {
	const { apiKey, baseUrl, chatModel } = getOpenAIConfig();
	const moderationPrompt =
		"You are a content moderation classifier. Only check: porn, gambling, drugs, terrorism, violence. Return JSON only with keys: allowed, category, reason.";

	const response = await fetch(`${baseUrl}/chat/completions`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: chatModel,
			temperature: 0,
			response_format: { type: "json_object" },
			messages: [
				{ role: "system", content: moderationPrompt },
				{
					role: "user",
					content: JSON.stringify({
						nickname: input.nickname,
						website: input.website || "",
						content: input.content,
					}),
				},
			],
		}),
	});

	if (!response.ok) {
		throw new Error(`Chat moderation failed: ${response.status}`);
	}

	const data = await response.json();
	const messageContent = data?.choices?.[0]?.message?.content;
	if (!messageContent || typeof messageContent !== "string") {
		throw new Error("Chat moderation returned empty content");
	}

	let parsed: { allowed?: boolean; reason?: string; category?: string } = {};
	try {
		parsed = JSON.parse(messageContent);
	} catch {
		throw new Error("Chat moderation result is not valid JSON");
	}

	return {
		allowed: parsed.allowed !== false,
		reason: parsed.reason || undefined,
		category: parsed.category || undefined,
	};
}

async function moderateMessageContent(input: {
	nickname: string;
	content: string;
	website?: string;
}): Promise<ModerationResult> {
	const { apiKey } = getOpenAIConfig();
	if (!apiKey) {
		return {
			allowed: false,
			category: "config",
			reason: "Moderation is not configured: OPENAI_API_KEY missing",
		};
	}

	const plainRuleCheck = containsPolicyCategory(
		`${input.nickname}\n${input.website || ""}\n${input.content}`,
	);
	if (!plainRuleCheck.allowed) {
		return plainRuleCheck;
	}

	const moderationInput = `nickname: ${input.nickname}\nwebsite: ${input.website || ""}\ncontent: ${input.content}`;

	try {
		return await moderateWithOpenAIModerations(moderationInput);
	} catch (e) {
		console.warn("[messages] /moderations unavailable, fallback to chat:", e);
	}

	try {
		return await moderateWithChatCompletion(input);
	} catch (e) {
		console.error("[messages] moderation fallback failed:", e);
		return {
			allowed: false,
			category: "service",
			reason: "Moderation service unavailable",
		};
	}
}

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const slug = url.searchParams.get("slug") || undefined;
	const messages = await getMessages(slug);
	return new Response(JSON.stringify(messages), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
};

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json();
		const { nickname, content, email, website, parentId, slug } = body;

		const uaString = request.headers.get("user-agent") || "";
		const parser = new UAParser(uaString);
		const browser = parser.getBrowser();
		const os = parser.getOS();
		const device = parser.getDevice();

		const browserName = browser.name
			? `${browser.name} ${browser.major || browser.version || ""}`.trim()
			: undefined;
		const osName = os.name ? `${os.name} ${os.version || ""}`.trim() : undefined;
		const deviceName = device.model
			? `${device.vendor || ""} ${device.model}`.trim()
			: undefined;

		if (!nickname || !content) {
			return new Response(JSON.stringify({ error: "Nickname and content are required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const moderation = await moderateMessageContent({
			nickname: String(nickname),
			content: String(content),
			website: website ? String(website) : undefined,
		});

		if (!moderation.allowed) {
			return new Response(
				JSON.stringify({
					error: moderation.reason || "Comment rejected by moderation",
					category: moderation.category || "unknown",
				}),
				{
					status: 403,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		let avatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${nickname}`;
		if (email) {
			const qqMatch = email.match(/^(\d{5,11})(@qq\.com)?$/);
			if (qqMatch) {
				const qq = qqMatch[1];
				avatar = `https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=100`;
			}
		}

		let finalWebsite = website ? website.slice(0, 100) : undefined;
		if (
			finalWebsite &&
			!finalWebsite.startsWith("http://") &&
			!finalWebsite.startsWith("https://")
		) {
			finalWebsite = `https://${finalWebsite}`;
		}

		const newMessage = await addMessage({
			nickname: nickname.slice(0, 20),
			content: content.slice(0, 500),
			email: email ? email.slice(0, 50) : undefined,
			website: finalWebsite,
			avatar,
			parentId,
			slug,
			os: osName,
			browser: browserName,
			device: deviceName,
		});

		return new Response(JSON.stringify(newMessage), {
			status: 201,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error in POST /api/messages:", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
