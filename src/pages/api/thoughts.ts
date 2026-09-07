import type { APIRoute } from "astro";
import type { DynamicThought } from "../../types/thought";
import { getThoughts, saveThoughts } from "../../utils/local-db";

export const prerender = false;

// Read sync secret from environment variables
const SYNC_SECRET =
	process.env.THOUGHTS_SYNC_SECRET ||
	process.env.SYNC_SECRET ||
	process.env.FORWARD_PROXY_TOKEN ||
	"luoji114514";

function verifyAuth(request: Request): boolean {
	// Check Authorization header
	const authHeader = request.headers.get("Authorization");
	if (authHeader) {
		const token = authHeader.replace(/^Bearer\s+/i, "").trim();
		if (token && token === SYNC_SECRET) return true;
	}

	// Check x-sync-secret header
	const secretHeader = request.headers.get("x-sync-secret");
	if (secretHeader && secretHeader === SYNC_SECRET) return true;

	// Check URL query param
	const url = new URL(request.url);
	const secretParam = url.searchParams.get("secret");
	if (secretParam && secretParam === SYNC_SECRET) return true;

	return false;
}

const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization, x-sync-secret",
};

export const OPTIONS: APIRoute = async () => {
	return new Response(null, {
		status: 204,
		headers: CORS_HEADERS,
	});
};

export const GET: APIRoute = async ({ request }) => {
	try {
		const url = new URL(request.url);
		const limit = Number.parseInt(url.searchParams.get("limit") || "0");
		const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1"));
		const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "0");

		const allThoughts = await getThoughts();

		let result = allThoughts;
		if (limit > 0) {
			result = result.slice(0, limit);
		} else if (pageSize > 0) {
			const start = (page - 1) * pageSize;
			result = result.slice(start, start + pageSize);
		}

		return new Response(
			JSON.stringify({
				success: true,
				total: allThoughts.length,
				data: result,
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json",
					...CORS_HEADERS,
				},
			},
		);
	} catch (error) {
		console.error("Error in GET /api/thoughts:", error);
		return new Response(
			JSON.stringify({ success: false, error: "Internal server error" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json", ...CORS_HEADERS },
			},
		);
	}
};

export const POST: APIRoute = async ({ request }) => {
	try {
		if (!verifyAuth(request)) {
			return new Response(
				JSON.stringify({ success: false, error: "Unauthorized" }),
				{
					status: 401,
					headers: { "Content-Type": "application/json", ...CORS_HEADERS },
				},
			);
		}

		const body = await request.json();
		let rawList: unknown[] = [];

		if (Array.isArray(body)) {
			rawList = body;
		} else if (body && Array.isArray(body.thoughts)) {
			rawList = body.thoughts;
		} else if (body && body.id && body.content) {
			rawList = [body];
		} else {
			return new Response(
				JSON.stringify({
					success: false,
					error: "Invalid body format. Expected an array or { thoughts: [] }",
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json", ...CORS_HEADERS },
				},
			);
		}

		const validThoughts: DynamicThought[] = [];
		for (const item of rawList as Partial<DynamicThought>[]) {
			if (!item || typeof item !== "object") continue;
			if (!item.id || typeof item.id !== "string") continue;
			if (!item.content || typeof item.content !== "string") continue;

			let published = Number(item.published);
			if (Number.isNaN(published) || published <= 0) {
				published = Date.now();
			}

			validThoughts.push({
				id: String(item.id).trim(),
				content: String(item.content).trim(),
				published,
				images: Array.isArray(item.images)
					? item.images.filter((img) => typeof img === "string")
					: [],
				source: item.source || "qzone",
				device: item.device || "",
				author: item.author || {
					name: "Shirosaki",
					uin: "2534316454",
					avatar: "https://q.qlogo.cn/headimg_dl?dst_uin=2534316454&spec=640",
				},
				createdAt: Date.now(),
			});
		}

		if (validThoughts.length === 0) {
			return new Response(
				JSON.stringify({
					success: true,
					added: 0,
					total: (await getThoughts()).length,
					message: "No valid thoughts provided to sync.",
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json", ...CORS_HEADERS },
				},
			);
		}

		const res = await saveThoughts(validThoughts);

		return new Response(
			JSON.stringify({
				success: true,
				added: res.added,
				total: res.total,
				message: `Successfully processed ${validThoughts.length} items: ${res.added} added, total ${res.total}.`,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json", ...CORS_HEADERS },
			},
		);
	} catch (error) {
		console.error("Error in POST /api/thoughts:", error);
		return new Response(
			JSON.stringify({ success: false, error: "Internal server error" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json", ...CORS_HEADERS },
			},
		);
	}
};
