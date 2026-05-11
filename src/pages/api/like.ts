import type { APIRoute } from "astro";
import { addLike, getLikes } from "../../utils/local-db";

export const GET: APIRoute = async ({ url }) => {
	const slug = url.searchParams.get("slug");
	if (!slug) {
		return new Response("Missing slug", { status: 400 });
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
	const body = await request.json();
	const { slug } = body;

	if (!slug) {
		return new Response("Missing slug", { status: 400 });
	}

	const likes = await addLike(slug);
	return new Response(JSON.stringify({ likes }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
};
