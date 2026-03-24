import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import type { APIRoute } from "astro";
import { UAParser } from "ua-parser-js";
import type { Message } from "../../types/message";
import { addMessage, getMessages } from "../../utils/local-db";

export const prerender = false;

type GitHubNotifyConfig = {
	enabled: boolean;
	owner?: string;
	repo?: string;
	token?: string;
	appId?: string;
	privateKey?: string;
	installationId?: string;
};

let octokitClient: Octokit | null = null;

function getGitHubNotifyConfig(): GitHubNotifyConfig {
	const token = process.env.MESSAGES_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
	const owner = process.env.MESSAGES_REPO_OWNER;
	const repo = process.env.MESSAGES_REPO_NAME;
	const appId = process.env.GITHUB_APP_ID;
	const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
	const installationId = process.env.GITHUB_APP_INSTALLATION_ID;
	const appAuthReady = !!appId && !!privateKey && !!installationId;
	const tokenAuthReady = !!token;
	const enabled = !!owner && !!repo && (appAuthReady || tokenAuthReady);
	return {
		enabled,
		owner,
		repo,
		token,
		appId,
		privateKey,
		installationId,
	};
}

function getOctokitClient(cfg: GitHubNotifyConfig): Octokit {
	if (octokitClient) return octokitClient;
	if (cfg.appId && cfg.privateKey && cfg.installationId) {
		octokitClient = new Octokit({
			authStrategy: createAppAuth,
			auth: {
				appId: cfg.appId,
				privateKey: cfg.privateKey.replace(/\\n/g, "\n"),
				installationId: cfg.installationId,
			},
		});
		return octokitClient;
	}
	octokitClient = new Octokit({
		auth: cfg.token,
	});
	return octokitClient;
}

function truncateText(text: string, max = 30): string {
	if (text.length <= max) return text;
	return `${text.slice(0, max)}...`;
}

function buildGitHubBody(input: {
	nickname: string;
	email?: string;
	website?: string;
	content: string;
	ua?: string;
	slug?: string;
	createdAt: string;
}): string {
	const lines = [
		"---",
		`name: ${JSON.stringify(input.nickname)}`,
		`created_at: ${JSON.stringify(input.createdAt)}`,
	];
	if (input.email) lines.push(`email: ${JSON.stringify(input.email)}`);
	if (input.website) lines.push(`website: ${JSON.stringify(input.website)}`);
	if (input.slug) lines.push(`slug: ${JSON.stringify(input.slug)}`);
	if (input.ua) lines.push(`ua: ${JSON.stringify(input.ua)}`);
	lines.push("---", "", input.content);
	return lines.join("\n");
}

async function createGitHubIssue(input: {
	nickname: string;
	content: string;
	email?: string;
	website?: string;
	ua?: string;
	slug?: string;
}): Promise<number> {
	const cfg = getGitHubNotifyConfig();
	if (!cfg.enabled || !cfg.owner || !cfg.repo) {
		throw new Error("GitHub notify not configured");
	}
	const title = `${input.nickname}: ${truncateText(input.content.replace(/\s+/g, " "))}`;
	const body = buildGitHubBody({
		...input,
		createdAt: new Date().toISOString(),
	});
	const octokit = getOctokitClient(cfg);
	const { data } = await octokit.issues.create({
		owner: cfg.owner,
		repo: cfg.repo,
		title,
		body,
		labels: ["message"],
	});
	return Number(data.number);
}

async function createGitHubComment(
	issueNumber: number,
	input: {
		nickname: string;
		content: string;
		email?: string;
		website?: string;
		ua?: string;
		slug?: string;
	},
): Promise<number> {
	const cfg = getGitHubNotifyConfig();
	if (!cfg.enabled || !cfg.owner || !cfg.repo) {
		throw new Error("GitHub notify not configured");
	}
	const body = buildGitHubBody({
		...input,
		createdAt: new Date().toISOString(),
	});
	const octokit = getOctokitClient(cfg);
	const { data } = await octokit.issues.createComment({
		owner: cfg.owner,
		repo: cfg.repo,
		issue_number: issueNumber,
		body,
	});
	return Number(data.id);
}

function findMessageById(id: string, messages: Message[]): Message | undefined {
	return messages.find((item) => item.id === id);
}

function findRootMessageForReply(
	parentId: string,
	messages: Message[],
): Message | undefined {
	let current = findMessageById(parentId, messages);
	while (current?.parentId) {
		current = findMessageById(current.parentId, messages);
	}
	return current;
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
		const allMessages = await getMessages();

		const uaString = request.headers.get("user-agent") || "";
		const parser = new UAParser(uaString);
		const browser = parser.getBrowser();
		const os = parser.getOS();
		const device = parser.getDevice();

		const browserName = browser.name
			? `${browser.name} ${browser.major || browser.version || ""}`.trim()
			: undefined;
		const osName = os.name
			? `${os.name} ${os.version || ""}`.trim()
			: undefined;
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

		let githubIssueNumber: number | undefined;
		let githubCommentId: number | undefined;
		if (getGitHubNotifyConfig().enabled) {
			try {
				if (parentId) {
					const root = findRootMessageForReply(parentId, allMessages);
					if (root?.githubIssueNumber) {
						githubIssueNumber = root.githubIssueNumber;
						githubCommentId = await createGitHubComment(
							root.githubIssueNumber,
							{
								nickname: nickname.slice(0, 20),
								content: content.slice(0, 500),
								email: email ? email.slice(0, 50) : undefined,
								website: finalWebsite,
								ua: uaString,
								slug,
							},
						);
					}
				} else {
					githubIssueNumber = await createGitHubIssue({
						nickname: nickname.slice(0, 20),
						content: content.slice(0, 500),
						email: email ? email.slice(0, 50) : undefined,
						website: finalWebsite,
						ua: uaString,
						slug,
					});
				}
			} catch (error) {
				console.error("GitHub notify failed:", error);
			}
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
			githubIssueNumber,
			githubCommentId,
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
