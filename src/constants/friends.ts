export type FriendLink = {
	title: string;
	imgurl: string;
	desc: string;
	siteurl: string;
	tags: string[];
	rssurl?: string;
	isSelf?: boolean;
};

export const myFriendLinkItem: FriendLink = {
	title: "白咲のBLOG",
	imgurl: "https://blog.shiro.team/avatar.png",
	desc: "歇斯底里是崩溃，底里歇斯是美味.",
	siteurl: "https://blog.shiro.team",
	tags: [" "],
	isSelf: true,
};

export const myFriendLink: string = `{
	title: "${myFriendLinkItem.title}",
	imgurl: "${myFriendLinkItem.imgurl}",
	desc: "${myFriendLinkItem.desc}",
	siteurl: "${myFriendLinkItem.siteurl}",
	tags: [" "],
},`;

export const friendLinks: FriendLink[] = [
	{
		title: "Astro",
		imgurl: "https://avatars.githubusercontent.com/u/44914786?s=48&v=4",
		desc: "The web framework for content-driven websites. ⭐️ Star to support our work!",
		siteurl: "https://github.com/withastro/astro",
		tags: [" "],
	},
	{
		title: "时歌的博客",
		imgurl: "https://www.lapis.cafe/avatar.webp",
		desc: "理解以真实为本，但真实本身并不会自动呈现",
		siteurl: "https://www.lapis.cafe",
		tags: [" "],
		rssurl: "https://www.lapis.cafe/rss.xml",
	},
	{
		title: "𝙕𝙚𝙡𝙡𝙤𝙣的博客",
		imgurl: "https://www.zellon.top/avatar.jpg",
		desc: "告别过去，是为了走向未来",
		siteurl: "https://www.zellon.top",
		tags: [" "],
		rssurl: "https://www.zellon.top/rss.xml",
	},
	{
		title: "mikann_OWQ",
		imgurl: "https://mikann.fun/avatar.webp",
		desc: "是一位超级无敌可爱美少女",
		siteurl: "https://www.mikann.fun",
		tags: [" "],
		rssurl: "https://www.mikann.fun/rss.xml",
	},
	{
		title: "Viki 写东西的地方",
		imgurl: "https://blog.viki.moe/avatar.png",
		desc: "生活需要记录。",
		siteurl: "https://blog.viki.moe",
		tags: [" "],
		rssurl: "https://blog.viki.moe/rss",
	},
];

export const allFriendLinks: FriendLink[] = [myFriendLinkItem, ...friendLinks];
