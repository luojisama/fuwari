export interface Message {
	id: string;
	slug?: string;
	parentId?: string;
	nickname: string;
	content: string;
	email?: string;
	website?: string;
	avatar: string;
	createdAt: number;
	replies?: Message[];
	os?: string;
	browser?: string;
	device?: string;
}
