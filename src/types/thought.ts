export interface DynamicThought {
	id: string; // Unique ID, e.g. Qzone tid
	content: string; // Text content
	published: number; // Timestamp (ms)
	images?: string[]; // Array of image URLs
	source?: string; // e.g. "qzone"
	device?: string; // e.g. "iPhone 15 Pro"
	author?: {
		name?: string;
		uin?: string;
		avatar?: string;
	};
	createdAt?: number; // Sync timestamp (ms)
}
