<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

type FriendCircleItem = {
	title: string;
	link: string;
	published: string;
	description: string;
	siteTitle: string;
	siteurl: string;
	avatar: string;
};

type FriendCircleResponse = {
	items?: FriendCircleItem[];
};

let items: FriendCircleItem[] = [];
let loading = true;
let failed = false;

const skeletonRows = Array.from({ length: 3 });

function formatDate(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return new Intl.DateTimeFormat("zh-CN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
}

onMount(async () => {
	try {
		const response = await fetch(`/api/friend-circle/?t=${Date.now()}`);
		if (!response.ok) {
			throw new Error(`Friend circle api failed: ${response.status}`);
		}
		const data: FriendCircleResponse = await response.json();
		items = Array.isArray(data.items) ? data.items : [];
	} catch (error) {
		console.error("Failed to fetch friend circle", error);
		failed = true;
	} finally {
		loading = false;
	}
});
</script>

<section class="card-base mt-4 px-6 md:px-9 py-6 relative overflow-hidden">
    <div class="flex items-center justify-between gap-4 mb-5">
        <div class="font-accent font-bold transition text-xl text-90 relative ml-3
            before:w-1 before:h-5 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.35rem]"
        >
            友链朋友圈
        </div>
        <div class="hidden sm:block transition text-50 text-sm font-medium">最近 5 篇新文章</div>
    </div>

    {#if loading}
        <div class="divide-y divide-dashed divide-black/10 dark:divide-white/[0.15]">
            {#each skeletonRows as _}
                <div class="flex gap-4 py-4 first:pt-0 last:pb-0 animate-pulse">
                    <div class="w-12 h-12 rounded-lg bg-black/10 dark:bg-white/10 flex-shrink-0"></div>
                    <div class="flex-1 min-w-0 space-y-3">
                        <div class="w-32 h-3 rounded bg-black/10 dark:bg-white/10"></div>
                        <div class="w-3/4 h-4 rounded bg-black/10 dark:bg-white/10"></div>
                        <div class="w-full h-3 rounded bg-black/10 dark:bg-white/10"></div>
                    </div>
                </div>
            {/each}
        </div>
    {:else if items.length > 0}
        <div class="divide-y divide-dashed divide-black/10 dark:divide-white/[0.15]">
            {#each items as item}
                <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="group flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                >
                    <img
                        src={item.avatar}
                        alt={`${item.siteTitle} 头像`}
                        class="w-12 h-12 rounded-lg object-cover bg-zinc-200 dark:bg-zinc-900 flex-shrink-0"
                    />
                    <div class="flex-1 min-w-0">
                        <div class="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                            <span class="transition text-50 text-sm font-medium">{item.siteTitle}</span>
                            <span class="text-[var(--meta-divider)] text-sm">/</span>
                            <time class="transition text-50 text-xs" datetime={item.published}>{formatDate(item.published)}</time>
                        </div>
                        <div class="font-bold transition text-90 group-hover:text-[var(--primary)] line-clamp-1">
                            {item.title}
                        </div>
                        {#if item.description}
                            <p class="transition text-75 text-sm mt-1 line-clamp-2">
                                {item.description}
                            </p>
                        {/if}
                    </div>
                    <div class="hidden sm:flex btn-regular w-11 h-11 rounded-lg bg-[var(--enter-btn-bg)] group-hover:bg-[var(--enter-btn-bg-hover)] group-active:bg-[var(--enter-btn-bg-active)] group-active:scale-95 flex-shrink-0 transition">
                        <Icon icon="material-symbols:chevron-right-rounded" class="transition text-[var(--primary)] text-3xl m-auto" />
                    </div>
                </a>
            {/each}
        </div>
    {:else}
        <div class="flex flex-col items-center justify-center py-8 text-center">
            <Icon icon={failed ? "material-symbols:error-outline-rounded" : "material-symbols:rss-feed-rounded"} class="text-4xl text-[var(--primary)] mb-3" />
            <div class="transition text-50 text-sm">暂时没有可展示的新文章</div>
        </div>
    {/if}
</section>
