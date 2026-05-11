import fs from "node:fs";
import path from "node:path";
import { createClient } from "@vercel/kv";
import Redis from "ioredis";
import type { Message } from "../types/message";

const DB_PATH = path.join(process.cwd(), "data", "messages.json");

// Determine which client to use
const USE_VERCEL_KV = !!(
	process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);
const USE_REDIS_URL = !USE_VERCEL_KV && !!process.env.REDIS_URL;
const IS_REMOTE = USE_VERCEL_KV || USE_REDIS_URL;

// Initialize clients
let kvClient: ReturnType<typeof createClient> | null = null;
let redisClient: Redis | null = null;

if (USE_VERCEL_KV) {
	kvClient = createClient({
		url: process.env.KV_REST_API_URL!,
		token: process.env.KV_REST_API_TOKEN!,
	});
} else if (USE_REDIS_URL) {
	// Use ioredis for standard connection strings (e.g. redis://...)
	// This works for Vercel Redis integrations that only provide REDIS_URL
	try {
		redisClient = new Redis(process.env.REDIS_URL!);
		redisClient.on("error", (err) => {
			console.error("Redis connection error:", err);
		});
	} catch (e) {
		console.error("Failed to initialize Redis client:", e);
	}
}

// Ensure data directory exists for local dev (fallback)
if (!IS_REMOTE && !fs.existsSync(path.dirname(DB_PATH))) {
	fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Initialize DB file if not exists for local dev (fallback)
if (!IS_REMOTE && !fs.existsSync(DB_PATH)) {
	fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

export async function getMessages(slug?: string): Promise<Message[]> {
	try {
		let messages: Message[] = [];
		if (USE_VERCEL_KV && kvClient) {
			messages = (await kvClient.get<Message[]>("messages")) || [];
		} else if (USE_REDIS_URL && redisClient) {
			const raw = await redisClient.get("messages");
			messages = raw ? JSON.parse(raw) : [];
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

	if (USE_VERCEL_KV && kvClient) {
		await kvClient.set("messages", messages);
	} else if (USE_REDIS_URL && redisClient) {
		await redisClient.set("messages", JSON.stringify(messages));
	} else {
		fs.writeFileSync(DB_PATH, JSON.stringify(messages, null, 2));
	}
	return newMessage;
}

export async function getLikes(slug: string): Promise<number> {
	try {
		if (USE_VERCEL_KV && kvClient) {
			const val = await kvClient.hget<number>("likes", slug);
			return val || 0;
		}
		if (USE_REDIS_URL && redisClient) {
			const val = await redisClient.hget("likes", slug);
			return val ? Number.parseInt(val) : 0;
		}
		if (fs.existsSync(LIKES_PATH)) {
			const data = fs.readFileSync(LIKES_PATH, "utf-8");
			const likes = JSON.parse(data);
			return likes[slug] || 0;
		}
		return 0;
	} catch (error) {
		console.error("Failed to get likes:", error);
		return 0;
	}
}

export async function addLike(slug: string): Promise<number> {
	try {
		if (USE_VERCEL_KV && kvClient) {
			const val = await kvClient.hincrby("likes", slug, 1);
			console.log(`Like added (KV) for ${slug}: ${val}`);
			return val;
		}
		if (USE_REDIS_URL && redisClient) {
			const val = await redisClient.hincrby("likes", slug, 1);
			console.log(`Like added (Redis) for ${slug}: ${val}`);
			return val;
		}
		let likes: Record<string, number> = {};
		if (fs.existsSync(LIKES_PATH)) {
			const data = fs.readFileSync(LIKES_PATH, "utf-8");
			likes = JSON.parse(data);
		}
		likes[slug] = (likes[slug] || 0) + 1;
		fs.writeFileSync(LIKES_PATH, JSON.stringify(likes, null, 2));
		console.log(`Like added (Local) for ${slug}: ${likes[slug]}`);
		return likes[slug];
	} catch (error) {
		console.error("Failed to add like:", error);
		return 0;
	}
}
