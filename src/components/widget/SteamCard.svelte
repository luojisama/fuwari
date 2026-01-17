<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

type SteamProfile = {
	profile_url?: string;
	avatar?: { full?: string; medium?: string };
	persona_name?: string;
	persona_state?: number;
	persona_state_desc?: string;
	game_info?: string | { name?: string; title?: string } | null;
	account_age_years?: number;
	account_age_years_desc?: string;
	time_created?: string;
};

type SteamGame = {
	store_url?: string;
	name?: string;
	image?: { header?: string; icon?: string };
	playtime?: {
		total_minutes?: number;
		recent_desc?: string;
		total_desc?: string;
	};
};

type CS2Item = {
	asset_id: string;
	name: string;
	icon_url: string;
	rarity: string;
	rarity_color: string;
	type: string;
	market_hash_name: string;
};

let profileData: SteamProfile | null = null;
let gamesData: SteamGame[] = [];
let inventoryData: CS2Item[] = [];
let loading = true;

const CACHE_KEY = "steam_cache_data";
const CACHE_TIME_KEY = "steam_cache_time";
const ONE_DAY = 24 * 60 * 60 * 1000;

const rarityOrder: Record<string, number> = {
	"非凡": 7,
	"隐秘级": 6,
	"保密级": 5,
	"受限级": 4,
	"军规级": 3,
	"工业级": 2,
	"普通级": 1,
};

async function fetchData(force = false) {
	const now = Date.now();
	const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
	const cachedData = localStorage.getItem(CACHE_KEY);

	if (
		!force &&
		cachedTime &&
		cachedData &&
		now - Number.parseInt(cachedTime) < ONE_DAY
	) {
		try {
			const parsed = JSON.parse(cachedData) as {
				profile?: SteamProfile;
				games?: SteamGame[];
				inventory?: CS2Item[];
			};
			profileData = parsed.profile ?? null;
			gamesData = Array.isArray(parsed.games) ? parsed.games : [];
			inventoryData = Array.isArray(parsed.inventory) ? parsed.inventory : [];
			loading = false;
			return;
		} catch (e) {
			localStorage.removeItem(CACHE_KEY);
			localStorage.removeItem(CACHE_TIME_KEY);
		}
	}

	loading = true;
	try {
		// Use the provided APIs
		const [profileRes, gamesRes, inventoryRes] = await Promise.all([
			fetch("https://api.viki.moe/steam/76561199251859222"),
			fetch("https://api.viki.moe/steam/shirosakishizuku/games"),
			fetch("https://api.viki.moe/steam/76561199251859222/cs2/inventory"),
		]);

		if (profileRes.ok) profileData = (await profileRes.json()) as SteamProfile;
		if (gamesRes.ok) {
			const allGames = (await gamesRes.json()) as unknown;
			if (Array.isArray(allGames)) {
				gamesData = (allGames as SteamGame[])
					.sort(
						(a: SteamGame, b: SteamGame) =>
							(b.playtime?.total_minutes || 0) -
							(a.playtime?.total_minutes || 0),
					)
					.slice(0, 6);
			}
		}
		if (inventoryRes.ok) {
			const allInventory = (await inventoryRes.json()) as CS2Item[];
			if (Array.isArray(allInventory)) {
				inventoryData = allInventory
					.sort((a, b) => {
						const rarityA = rarityOrder[a.rarity] || 0;
						const rarityB = rarityOrder[b.rarity] || 0;
						return rarityB - rarityA;
					})
					.slice(0, 20);
			}
		}

		if (profileData || gamesData.length > 0 || inventoryData.length > 0) {
			localStorage.setItem(
				CACHE_KEY,
				JSON.stringify({
					profile: profileData,
					games: gamesData,
					inventory: inventoryData,
				}),
			);
			localStorage.setItem(CACHE_TIME_KEY, now.toString());
		}
	} catch (e) {
		console.error("Failed to fetch Steam data", e);
	} finally {
		loading = false;
	}
}

function handleRefresh() {
	fetchData(true);
}

onMount(() => {
	fetchData();
});

function getStatusColor(state: number, is_playing: boolean) {
	if (is_playing) return "text-green-500";
	switch (state) {
		case 1:
			return "text-blue-400"; // Online
		case 0:
			return "text-neutral-400"; // Offline
		case 3:
			return "text-amber-400"; // Away
		default:
			return "text-blue-400";
	}
}

function getStatusText(profile: SteamProfile) {
	if (profile.game_info) {
		if (typeof profile.game_info === "string") {
			return `正在玩: ${profile.game_info}`;
		}
		if (typeof profile.game_info === "object" && profile.game_info !== null) {
			return `正在玩: ${profile.game_info.name || profile.game_info.title || "未知游戏"}`;
		}
	}
	return profile.persona_state_desc || "未知状态";
}
</script>

<div class="card-base p-6 mt-4 transition-all duration-300 hover:shadow-lg border border-neutral-100 dark:border-neutral-800">
    <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2 font-bold text-xl text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-5 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.4rem]"
        >
            Steam 最近玩过
        </div>
        <div class="flex items-center gap-2">
            <button 
                on:click={handleRefresh}
                class="btn-regular p-2 rounded-lg text-sm flex items-center gap-2 active:scale-95 transition disabled:opacity-50"
                disabled={loading}
                title="刷新数据"
            >
                <Icon icon="fa6-solid:rotate" class={loading ? 'animate-spin' : ''} />
            </button>
            {#if profileData?.profile_url}
                <a href={profileData.profile_url} target="_blank" class="btn-regular p-2 rounded-lg text-sm flex items-center gap-2 active:scale-95 transition">
                    <Icon icon="fa6-brands:steam" class="text-lg" />
                    <span>个人主页</span>
                </a>
            {/if}
        </div>
    </div>

    {#if loading}
        <div class="flex flex-col items-center justify-center py-10 gap-3">
            <Icon icon="eos-icons:bubble-loading" class="text-4xl text-[var(--primary)]" />
            <div class="text-neutral-400 animate-pulse text-sm">正在同步 Steam 数据...</div>
        </div>
    {:else if profileData}
        <div class="flex items-center gap-5 mb-8 p-4 rounded-2xl bg-neutral-50/50 dark:bg-neutral-800/30">
            <div class="relative group">
                <img src={profileData.avatar?.full ?? profileData.avatar?.medium ?? ""} 
                     alt={profileData.persona_name ?? "Steam Avatar"} 
                     class="w-20 h-20 rounded-2xl shadow-lg transition-transform group-hover:scale-105" />
                <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-neutral-900 
                    {profileData.persona_state === 0 ? 'bg-neutral-400' : (profileData.game_info ? 'bg-green-500' : 'bg-blue-400')} shadow-sm"></div>
            </div>
            <div class="flex-1 min-w-0">
                <div class="font-bold text-2xl text-neutral-800 dark:text-neutral-100 truncate mb-1">
                    {profileData.persona_name}
                </div>
                <div class="flex items-center gap-2">
                    <span class="flex h-2 w-2 rounded-full {profileData.persona_state === 0 ? 'bg-neutral-400' : (profileData.game_info ? 'bg-green-500 animate-pulse' : 'bg-blue-400')}"></span>
                    <span class="text-sm font-medium {getStatusColor(profileData.persona_state ?? 0, !!profileData.game_info)} transition-colors">
                        {getStatusText(profileData)}
                    </span>
                </div>
                {#if profileData.account_age_years}
                    <div class="mt-1 text-xs text-neutral-500 dark:text-neutral-400 flex gap-2">
                        <span title="注册时间: {profileData.time_created}" class="flex items-center gap-1">
                            <Icon icon="fa6-solid:calendar-day" />
                            {profileData.account_age_years_desc || `${profileData.account_age_years} 年`}
                        </span>
                    </div>
                {/if}
            </div>
        </div>

        {#if gamesData && gamesData.length > 0}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each gamesData.slice(0, 4) as game}
                    <a href={game.store_url} target="_blank" class="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50 hover:border-[var(--primary)] transition-colors group">
                        <div class="relative overflow-hidden rounded-lg w-28 h-12 bg-neutral-100 dark:bg-neutral-700 flex-shrink-0">
                            {#if game.image?.header}
                                <img src={game.image.header} 
                                     alt={game.name} class="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            {:else if game.image?.icon}
                                <img src={game.image.icon} 
                                     alt={game.name} class="w-full h-full object-cover" />
                            {:else}
                                <div class="w-full h-full flex items-center justify-center">
                                    <Icon icon="fa6-solid:gamepad" class="text-neutral-400 text-xl" />
                                </div>
                            {/if}
                        </div>
                        <div class="min-w-0 flex-1">
                            <div class="text-sm font-bold text-neutral-700 dark:text-neutral-200 truncate group-hover:text-[var(--primary)] transition-colors" title={game.name}>
                                {game.name}
                            </div>
                            <div class="flex items-center gap-3 mt-1">
                                {#if game.playtime?.recent_desc}
                                    <div class="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                                        <Icon icon="material-symbols:schedule" />
                                        近两周: {game.playtime.recent_desc}
                                    </div>
                                {/if}
                                {#if game.playtime?.total_desc}
                                    <div class="text-[10px] text-neutral-400">
                                        总计: {game.playtime.total_desc}
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </a>
                {/each}
            </div>
        {:else}
            <div class="flex flex-col items-center justify-center py-6 text-neutral-400 text-sm italic gap-2">
                <Icon icon="material-symbols:History-rounded" class="text-2xl" />
                <span>最近没玩过什么游戏呢...</span>
            </div>
        {/if}

        {#if inventoryData && inventoryData.length > 0}
            <div class="mt-8">
                <div class="flex items-center gap-2 mb-4 font-bold text-lg text-neutral-800 dark:text-neutral-200">
                    <Icon icon="fa6-solid:briefcase" class="text-[var(--primary)]" />
                    CS2 库存精选
                </div>
                <div class="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {#each inventoryData as item}
                        <div class="group relative aspect-square rounded-lg bg-neutral-100 dark:bg-neutral-800 border-2 transition-all hover:scale-110 hover:z-10 cursor-help"
                             style="border-color: #{item.rarity_color || 'transparent'}"
                             title="{item.name} ({item.rarity})">
                            <img src={item.icon_url} alt={item.name} class="w-full h-full object-contain p-1" />
                            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-end justify-center p-1">
                                <span class="text-[8px] text-white text-center leading-tight truncate w-full">{item.name}</span>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    {:else}
        <div class="flex flex-col items-center justify-center py-10 text-neutral-400 text-sm italic gap-3">
            <Icon icon="material-symbols:error-outline" class="text-3xl text-neutral-300" />
            <span>暂时无法获取 Steam 数据，请稍后再试</span>
        </div>
    {/if}
</div>

<style>
    .card-base {
        border-radius: var(--radius-large);
        background-color: var(--card-bg);
    }
    .btn-regular {
        background-color: var(--btn-regular-bg);
        color: var(--btn-content);
    }
    .btn-regular:hover {
        background-color: var(--btn-regular-bg-hover);
    }
</style>
