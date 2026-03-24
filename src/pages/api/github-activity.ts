import type { APIRoute } from "astro";

export const prerender = false;

type GithubUser = {
	login: string;
	avatar_url: string;
	html_url: string;
	name: string;
	bio: string;
	public_repos: number;
	followers: number;
	following: number;
	created_at: string;
};

type GithubRepo = {
	name: string;
	html_url: string;
	description: string;
	language: string;
	stargazers_count: number;
	forks_count: number;
	updated_at: string;
};

type GithubEvent = {
	type: string;
	created_at: string;
	payload?: {
		commits?: Array<unknown>;
	};
};

type GithubActivityResponse = {
	user: GithubUser | null;
	repos: GithubRepo[];
	yearlyCommitCount: number;
};

const CURRENT_YEAR = new Date().getFullYear();
const CACHE_TTL = 1000 * 60 * 60;
const cacheStore = new Map<
	string,
	{
		expireAt: number;
		payload: GithubActivityResponse;
	}
>();

function getGithubHeaders() {
	const token = process.env.GITHUB_ACTIVITY_TOKEN || process.env.GITHUB_TOKEN;
	return {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
		...(token ? { Authorization: `Bearer ${token}` } : {}),
	};
}

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const username = (url.searchParams.get("username") || "luojisama").trim();
	if (!username) {
		return new Response(JSON.stringify({ error: "username 不能为空" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}
	const now = Date.now();
	const cached = cacheStore.get(username);
	// 强制禁用服务端缓存，确保展示最新数据，也可以通过恢复下面这行来启用缓存
	const useCache = false;
	if (useCache && cached && cached.expireAt > now) {
		return new Response(JSON.stringify(cached.payload), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	}
	try {
		const headers = getGithubHeaders();

		const [userRes, reposRes, contribsRes] = await Promise.all([
			fetch(`https://api.github.com/users/${username}`, { headers }),
			fetch(
				`https://api.github.com/users/${username}/repos?sort=pushed&direction=desc&per_page=20`,
				{ headers },
			),
			fetch(`https://github-contributions-api.deno.dev/${username}.json`),
		]);
		if (!userRes.ok) {
			const detail = await userRes.text();
			return new Response(
				JSON.stringify({
					error: "获取 Github 用户失败",
					details: detail,
				}),
				{
					status: userRes.status,
					headers: { "Content-Type": "application/json" },
				},
			);
		}
		const user = (await userRes.json()) as GithubUser;
		const repos = reposRes.ok
			? ((await reposRes.json()) as GithubRepo[]).slice(0, 4)
			: [];
			
		let yearlyCommitCount = 0;
		if (contribsRes.ok) {
			try {
				const contribData = await contribsRes.json();
				// 这个接口的 totalContributions 就是用户主页的当年总数
				yearlyCommitCount = contribData.totalContributions || 0;
			} catch (e) {
				console.error("Failed to parse contributions:", e);
			}
		}

		const payload: GithubActivityResponse = {
			user,
			repos,
			yearlyCommitCount,
		};
		cacheStore.set(username, {
			expireAt: now + CACHE_TTL,
			payload,
		});
		return new Response(JSON.stringify(payload), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: "获取 Github 数据失败",
				details: String(error),
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
};
