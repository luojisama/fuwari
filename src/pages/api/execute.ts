import type { APIRoute } from "astro";

export const prerender = false;

// 简单的内存缓存
let runtimesCache:
	| { language: string; version: string; aliases: string[] }[]
	| null = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

// Fallback runtimes in case Piston API is down or fetch fails
const FALLBACK_RUNTIMES = [
	{
		language: "python",
		version: "3.10.0",
		aliases: ["py", "py3", "python3", "python3.10"],
	},
	{
		language: "javascript",
		version: "18.15.0",
		aliases: ["js", "node", "node.js"],
	},
	{ language: "typescript", version: "5.0.3", aliases: ["ts", "node-ts"] },
	{ language: "go", version: "1.19.0", aliases: ["golang"] },
	{ language: "rust", version: "1.68.2", aliases: ["rs"] },
	{ language: "cpp", version: "10.2.0", aliases: ["c++", "g++"] },
	{ language: "c", version: "10.2.0", aliases: ["gcc"] },
	{ language: "java", version: "15.0.2", aliases: [] },
];

async function getRuntimes() {
	const now = Date.now();
	if (runtimesCache && now - lastFetchTime < CACHE_TTL) {
		return runtimesCache;
	}

	try {
		console.log("[API] Fetching Piston runtimes...");
		const response = await fetch("https://emkc.org/api/v2/piston/runtimes");
		if (!response.ok) {
			throw new Error(`Failed to fetch runtimes: ${response.statusText}`);
		}
		const data = await response.json();
		runtimesCache = data;
		lastFetchTime = now;
		console.log("[API] Runtimes cached.");
		return data;
	} catch (error) {
		console.error("Error fetching Piston runtimes:", error);
		// Use fallback if cache is empty
		return runtimesCache || FALLBACK_RUNTIMES;
	}
}

export const POST: APIRoute = async ({ request }) => {
	console.log("[API] /api/execute called");

	// Simple security: Check Referer/Origin
	const origin = request.headers.get("origin");
	const referer = request.headers.get("referer");
	const allowedHost = "shiro.team"; // From astro.config.mjs site config

	// Allow local development
	const isLocal =
		origin?.includes("localhost") ||
		origin?.includes("127.0.0.1") ||
		referer?.includes("localhost");

	// Relaxed check: Just ensure it's not from a completely different domain if possible,
	// but for now, since Vercel previews have dynamic URLs, we might want to be permissive or strictly check production.
	// Let's just log it for now to avoid breaking previews.
	// console.log(`[API] Request from: ${origin || referer}`);

	try {
		const body = await request.json();
		const { code, language, stdin } = body;
		console.log(`[API] Executing ${language}`);

		if (!code || !language) {
			return new Response(
				JSON.stringify({ error: "Code and language are required" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const runtimes = await getRuntimes();
		const targetLang = language.toLowerCase();

		// 查找匹配的运行时
		const runtime = runtimes.find(
			(r: any) =>
				r.language === targetLang ||
				(r.aliases && r.aliases.includes(targetLang)),
		);

		if (!runtime) {
			return new Response(
				JSON.stringify({ error: `Unsupported language: ${language}` }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// 调用 Piston API 执行代码
		// 默认注入一些换行符作为 stdin，防止 input() 等待用户输入导致挂起
		// Piston 的 stdin 参数如果不传，input() 可能会抛出 EOFError 或无限等待
		const response = await fetch("https://emkc.org/api/v2/piston/execute", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				language: runtime.language,
				version: runtime.version,
				files: [{ content: code }],
				stdin: body.stdin || "\n\n\n\n\n", // 默认提供足够的换行符
			}),
		});

		const result = await response.json();

		// 简单的格式化返回结果
		// Piston 返回结构: { run: { stdout, stderr, code, signal, output }, language, version }
		return new Response(JSON.stringify(result), {
			status: response.status,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: "Internal Server Error",
				details: String(error),
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
};
