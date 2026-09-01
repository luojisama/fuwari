import type { AstroIntegration } from "@swup/astro";

export interface PagefindSearchResult {
	results: Array<{
		data: () => Promise<SearchResult>;
	}>;
}

export interface PagefindApi {
	options: (options: { excerptLength?: number }) => Promise<void>;
	init: () => Promise<void>;
	search: (query: string) => Promise<PagefindSearchResult>;
}

declare global {
	interface Window {
		// type from '@swup/astro' is incorrect
		swup: AstroIntegration;
		pagefind?: PagefindApi;
	}
}

export interface SearchResult {
	url: string;
	meta: {
		title: string;
	};
	excerpt: string;
	content?: string;
	word_count?: number;
	filters?: Record<string, unknown>;
	anchors?: Array<{
		element: string;
		id: string;
		text: string;
		location: number;
	}>;
	weighted_locations?: Array<{
		weight: number;
		balanced_score: number;
		location: number;
	}>;
	locations?: number[];
	raw_content?: string;
	raw_url?: string;
	sub_results?: SearchResult[];
}
