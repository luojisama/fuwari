import type { APIRoute } from "astro";
import { addLike, getLikes } from "../../utils/local-db";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
	const slug = url.searchParams.get("slug");
	if (!slug) {
		return new Response(JSON.stringify({ error: "Missing slug" }), {
			status: 400,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	const likes = await getLikes(slug);
	return new Response(JSON.stringify({ likes }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
};

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json();
		const { slug } = body;

		if (!slug) {
			return new Response(JSON.stringify({ error: "Missing slug" }), {
				status: 400,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}

		const likes = await addLike(slug);
		return new Response(JSON.stringify({ likes }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		console.error("Error in POST /api/like:", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
};
