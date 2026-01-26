import type { APIRoute } from "astro";
import { addMessage, getMessages } from "../../utils/local-db";

export const prerender = false;

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

		if (!nickname || !content) {
			return new Response(JSON.stringify({ error: "昵称和内容不能为空" }), {
				status: 400,
			});
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
			nickname: nickname.slice(0, 20), // Limit nickname length
			content: content.slice(0, 500), // Limit content length
			email: email ? email.slice(0, 50) : undefined,
			website: finalWebsite,
			avatar,
			parentId,
			slug,
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
		});
	}
};
