import type { APIRoute } from "astro";

export const prerender = false;

// 简单的内存缓存
let runtimesCache:
	| { language: string; version: string; aliases: string[] }[]
	| null = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

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
		// 如果失败且没有缓存，返回空数组或抛出
		return runtimesCache || [];
	}
}

export const POST: APIRoute = async ({ request }) => {
	console.log("[API] /api/execute called");
	try {
		const body = await request.json();
		const { code, language } = body;
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
		const response = await fetch("https://emkc.org/api/v2/piston/execute", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				language: runtime.language,
				version: runtime.version,
				files: [{ content: code }],
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
