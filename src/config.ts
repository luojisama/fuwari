import type {
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "白咲のblog",
	subtitle: "歇斯底里是崩溃，底里歇斯是美味",
	lang: "zh_CN", // 可选值: 'en', 'zh_CN', 'zh_TW', 'ja', 'ko', 'es', 'th'
	themeColor: {
		hue: 220, // 主题色默认色相值，范围 0-360。例如红色为0，蓝绿色为200，青色为250，粉色为345
		fixed: false, // 是否对访客隐藏主题色选择器
	},
	banner: {
		enable: true,
		src: "assets/images/banner.jpg", // 图片路径相对于/src目录。若以'/'开头则表示相对于/public目录
		position: "center", // 类似CSS的object-position属性，仅支持'top'、'center'、'bottom'，默认为'center'
		credit: {
			enable: false, // 是否显示图片版权信息
			text: "", // 需要显示的版权文字
			url: "", // （可选）图片原作品或作者页面的链接
		},
	},
	toc: {
		enable: true, // 在文章右侧显示目录
		depth: 2, // 目录显示的最大标题层级，取值范围1-3
	},
	weather: {
		enable: true,
		stationCode: "IayMy", // 上海
		position: "sticky-top",
	},
	favicon: [
		// 保留空数组则使用默认favicon
		{
			src: "/avatar.png", // favicon路径，相对于/public目录
			//   theme: 'light',              // （可选）'light'或'dark'，仅在需要为不同模式设置不同图标时使用
			//   sizes: '32x32',              // （可选）图标尺寸，仅在需要设置不同尺寸图标时使用
		},
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "留言",
			url: "/messages/",
		},
		LinkPreset.Friends,
		LinkPreset.Thoughts,
		{
			name: "更多",
			url: "#",
			children: [
				{
					name: "好物清单",
					url: "/products/",
				},
				{
					name: "网站导航",
					url: "https://nav.shiro.team/",
					external: true,
				},
				{
					name: "GitHub",
					url: "https://github.com/saicaca/fuwari",
					external: true,
				},
			],
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/avatar.png", // 图片路径相对于/src目录。若以'/'开头则表示相对于/public目录
	name: "白咲雫",
	bio: "歇斯底里是崩溃，底里歇斯是美味.",
	links: [
		{
			name: "Twitter",
			icon: "fa6-brands:twitter", // 图标代码查询：https://icones.js.org/
			// 如果使用未包含的图标集需要先安装：`pnpm add @iconify-json/<图标集名称>`
			url: "https://x.com/shizuku__191981",
		},
		{
			name: "Steam",
			icon: "fa6-brands:steam",
			url: "https://steamcommunity.com/id/shirosakishizuku/",
		},
		{
			name: "QQ",
			icon: "fa6-brands:qq",
			url: "https://qm.qq.com/q/BdkE3VO22s",
		},
		{
			name: "BiliBili",
			icon: "fa6-brands:bilibili",
			url: "https://space.bilibili.com/187685621",
		},
		{
			name: "github",
			icon: "fa6-brands:github",
			url: "https://github.com/luojisama",
		},
		{
			name: "行程",
			icon: "fa6-solid:plane",
			url: "/travel/",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};
