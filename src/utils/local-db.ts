import fs from "node:fs";
import path from "node:path";
import { createClient } from "@vercel/kv";
import type { Message } from "../types/message";

const DB_PATH = path.join(process.cwd(), "data", "messages.json");
const IS_VERCEL =
	!!((process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) || process.env.REDIS_URL);

// Initialize Vercel KV client
const kv = IS_VERCEL
	? createClient({
			url: process.env.KV_REST_API_URL || process.env.REDIS_URL!,
			token: process.env.KV_REST_API_TOKEN || "",
		})
	: null;

// Ensure data directory exists for local dev
if (!IS_VERCEL && !fs.existsSync(path.dirname(DB_PATH))) {
	fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Initialize DB file if not exists for local dev
if (!IS_VERCEL && !fs.existsSync(DB_PATH)) {
	fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

export async function getMessages(slug?: string): Promise<Message[]> {
	try {
		let messages: Message[] = [];
		if (IS_VERCEL) {
			messages = (await kv!.get<Message[]>("messages")) || [];
		} else if (fs.existsSync(DB_PATH)) {
			const data = fs.readFileSync(DB_PATH, "utf-8");
			messages = JSON.parse(data);
		}

		if (slug) {
			return messages.filter((m) => m.slug === slug);
		}
		return messages;
	} catch (error) {
		console.error("Failed to get messages:", error);
		return [];
	}
}

export async function addMessage(
	message: Omit<Message, "id" | "createdAt">,
): Promise<Message> {
	// Always get ALL messages when adding
	const messages = await getMessages();
	const newMessage: Message = {
		...message,
		id: Math.random().toString(36).substring(2, 9),
		createdAt: Date.now(),
	};
	messages.unshift(newMessage); // Add to top

	// Limit to 2000 messages total for now to prevent infinite growth
	if (messages.length > 2000) {
		messages.pop();
	}

	if (IS_VERCEL) {
		await kv!.set("messages", messages);
	} else {
		fs.writeFileSync(DB_PATH, JSON.stringify(messages, null, 2));
	}
	return newMessage;
}
