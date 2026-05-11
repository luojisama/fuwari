<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

interface Props {
	slug: string;
}

let { slug }: Props = $props();

let likes = $state(0);
let liked = $state(false);
let loading = $state(true);
let animating = $state(false);

onMount(async () => {
	// Check if already liked in localStorage
	const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
	liked = likedPosts.includes(slug);

	try {
		const res = await fetch(`/api/like?slug=${encodeURIComponent(slug)}`);
		if (res.ok) {
			const data = await res.json();
			likes = data.likes;
		}
	} catch (e) {
		console.error("Failed to fetch likes", e);
	} finally {
		loading = false;
	}
});

async function handleLike() {
	if (liked || animating) return;

	animating = true;
	liked = true;

	try {
		const res = await fetch("/api/like", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ slug }),
		});

		if (res.ok) {
			const data = await res.json();
			likes = data.likes;

			// Save to localStorage
			const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
			likedPosts.push(slug);
			localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
		}
	} catch (e) {
		console.error("Failed to post like", e);
		liked = false; // Rollback
	} finally {
		setTimeout(() => {
			animating = false;
		}, 500);
	}
}
</script>

<div class="flex items-center justify-center">
    <button
        onclick={handleLike}
        class="btn-card group relative flex h-[3.75rem] items-center justify-center gap-3 overflow-hidden rounded-2xl px-6 font-bold transition-all active:scale-95 disabled:cursor-default"
        class:liked={liked}
        disabled={liked || loading}
        aria-label={i18n(I18nKey.likes)}
    >
        <div class="relative flex items-center justify-center">
            <Icon
                icon={liked ? "material-symbols:favorite-rounded" : "material-symbols:favorite-outline-rounded"}
                class="text-[1.5rem] transition-all duration-300 {liked ? 'text-red-500 scale-110' : 'text-[var(--primary)] group-hover:scale-110'}"
            />
            {#if animating}
                <div class="absolute inset-0 animate-ping rounded-full bg-red-500/50"></div>
            {/if}
        </div>
        
        <div class="flex flex-col items-start leading-none">
            <span class="text-sm text-black/50 dark:text-white/50">{i18n(I18nKey.likes)}</span>
            <span class="text-lg text-black/75 dark:text-white/75">
                {#if loading}
                    <Icon icon="eos-icons:loading" class="animate-spin" />
                {:else}
                    {likes}
                {/if}
            </span>
        </div>
    </button>
</div>

<style>
    .liked {
        cursor: default;
    }
    :global(.btn-card) {
        background-color: var(--card-bg);
    }
</style>
