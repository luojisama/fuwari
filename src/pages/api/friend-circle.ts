import { allFriendLinks } from "@constants/friends";
import type { APIRoute } from "astro";
import Parser from "rss-parser";
import sanitizeHtml from "sanitize-html";

export const prerender = false;

type RssItem = {
	title?: string;
	link?: string;
	pubDate?: string;
	isoDate?: string;
	content?: string;
	contentSnippet?: string;
	summary?: string;
	guid?: string;
	[key: string]: unknown;
};

type FriendCircleItem = {
	title: string;
	link: string;
	published: string;
	description: string;
	siteTitle: string;
	siteurl: string;
	avatar: string;
};

const parser = new Parser<Record<string, unknown>, RssItem>();
const FEED_TIMEOUT_MS = 8000;
const SELF_SITE_URL = "https://blog.shiro.team";

function normalizeUrl(value: string) {
	return value.replace(/\/+$/, "");
}

function normalizeText(value?: string) {
	if (!value) return "";
	return sanitizeHtml(value, {
		allowedTags: [],
		allowedAttributes: {},
	})
		.replace(/\s+/g, " ")
		.trim();
}

function getItemDate(item: RssItem) {
	const value = item.isoDate || item.pubDate;
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

function getItemDescription(item: RssItem) {
	const encoded = item["content:encoded"];
	const description =
		item.contentSnippet ||
		item.summary ||
		item.content ||
		(typeof encoded === "string" ? encoded : "");
	return normalizeText(description).slice(0, 160);
}

async function fetchFeedText(feedUrl: string) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);
	try {
		const response = await fetch(feedUrl, {
			signal: controller.signal,
			headers: {
				"User-Agent": "Mozilla/5.0 FriendCircle RSS Reader",
			},
		});
		if (!response.ok) {
			throw new Error(`Feed request failed: ${response.status}`);
		}
		return await response.text();
	} finally {
		clearTimeout(timer);
	}
}

async function fetchFriendPosts(
	friend: (typeof allFriendLinks)[number],
): Promise<FriendCircleItem[]> {
	if (!friend.rssurl) return [];

	try {
		const feedText = await fetchFeedText(friend.rssurl);
		const feed = await parser.parseString(feedText);
		return feed.items
			.map((item) => {
				const publishedAt = getItemDate(item);
				const title = normalizeText(item.title);
				const link = item.link || item.guid || "";
				if (!publishedAt || !title || !link) return null;
				return {
					title,
					link,
					published: publishedAt.toISOString(),
					description: getItemDescription(item),
					siteTitle: friend.title,
					siteurl: friend.siteurl,
					avatar: friend.imgurl,
				};
			})
			.filter((item): item is FriendCircleItem => item !== null);
	} catch (error) {
		console.warn(`Friend feed failed: ${friend.title}`, error);
		return [];
	}
}

export const GET: APIRoute = async () => {
	const friends = allFriendLinks.filter(
		(friend) =>
			friend.rssurl &&
			!friend.isSelf &&
			normalizeUrl(friend.siteurl) !== normalizeUrl(SELF_SITE_URL),
	);
	const posts = (await Promise.all(friends.map(fetchFriendPosts))).flat();
	const items = posts
		.sort(
			(a, b) =>
				new Date(b.published).getTime() - new Date(a.published).getTime(),
		)
		.slice(0, 5);

	return new Response(
		JSON.stringify({
			generatedAt: new Date().toISOString(),
			items,
		}),
		{
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "s-maxage=1800, stale-while-revalidate=3600",
			},
		},
	);
};
