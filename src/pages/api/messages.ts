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
	const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
	const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(
		/\/$/,
		"",
	);
	return { apiKey, model, baseUrl };
}

async function moderateMessageContent(input: {
	nickname: string;
	content: string;
	website?: string;
}): Promise<ModerationResult> {
	const { apiKey, model, baseUrl } = getOpenAIConfig();

	// If not configured, skip moderation but keep endpoint available.
	if (!apiKey) {
		console.warn("[messages] OPENAI_API_KEY not configured, skip moderation.");
		return { allowed: true };
	}

	const moderationPrompt = `你是一个留言审核器。请严格判断以下内容是否包含禁止内容：
- 色情/淫秽
- 赌博
- 毒品
- 恐怖主义
- 暴力（宣扬、煽动、明确威胁）

只返回 JSON，格式如下：
{"allowed": true/false, "category": "none|porn|gambling|drugs|terrorism|violence", "reason": "简短原因"}

判断标准：
- 只要明显涉及上述类别之一，就 allowed=false。
- 正常技术讨论、日常表达、非攻击性语句应 allowed=true。`;

	const userPayload = {
		nickname: input.nickname,
		website: input.website || "",
		content: input.content,
	};

	const response = await fetch(`${baseUrl}/chat/completions`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model,
			temperature: 0,
			response_format: { type: "json_object" },
			messages: [
				{ role: "system", content: moderationPrompt },
				{ role: "user", content: JSON.stringify(userPayload) },
			],
		}),
	});

	if (!response.ok) {
		throw new Error(`Moderation API failed: ${response.status}`);
	}

	const data = await response.json();
	const content = data?.choices?.[0]?.message?.content;
	if (!content || typeof content !== "string") {
		throw new Error("Moderation API returned empty content");
	}

	let parsed: { allowed?: boolean; reason?: string; category?: string } = {};
	try {
		parsed = JSON.parse(content);
	} catch {
		throw new Error("Moderation result is not valid JSON");
	}

	return {
		allowed: parsed.allowed !== false,
		reason: parsed.reason || undefined,
		category: parsed.category || undefined,
	};
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
	console.log("POST /api/messages called");
	try {
		const body = await request.json();
		console.log("Request body:", body);
		const { nickname, content, email, website, parentId, slug } = body;

		// Parse User Agent
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
			return new Response(JSON.stringify({ error: "昵称和内容不能为空" }), {
				status: 400,
				headers: {
					"Content-Type": "application/json",
				},
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
					error: "留言未通过审核，请勿发布黄赌毒恐暴相关内容",
					category: moderation.category || "unknown",
					reason: moderation.reason || "内容触发审核策略",
				}),
				{
					status: 403,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		}

		// Determine avatar
		let avatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${nickname}`;
		if (email) {
			// Check if email is a QQ number or QQ email
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
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		console.error("Error in POST /api/messages:", error);
		return new Response(JSON.stringify({ error: "服务器内部错误" }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
};
