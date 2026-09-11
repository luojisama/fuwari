<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import type { DynamicThought } from "../types/thought";
import ThoughtActions from "./ThoughtActions.svelte";

export let showQzoneDefault = true;

let thoughts: DynamicThought[] = [];
let loading = true;
let showQzone = showQzoneDefault;
let likesMap: Record<string, number> = {};
let commentCountsMap: Record<string, number> = {};

onMount(async () => {
	// 读取本地缓存的用户偏好设置
	try {
		const saved = localStorage.getItem("show_qzone_thoughts");
		if (saved !== null) {
			showQzone = saved === "true";
		} else {
			showQzone = showQzoneDefault;
		}
	} catch (e) {
		showQzone = showQzoneDefault;
	}

	try {
		const res = await fetch("/api/thoughts/?limit=50");
		if (res.ok) {
			const json = await res.json();
			if (json.success && Array.isArray(json.data)) {
				thoughts = json.data;

				// 批量获取点赞数与评论数，避免多次单独发起网络请求
				const thoughtIds = thoughts.map((t) => `thought-${t.id}`);
				if (thoughtIds.length > 0) {
					fetch(`/api/like?slugs=${encodeURIComponent(thoughtIds.join(","))}`)
						.then((r) => (r.ok ? r.json() : null))
						.then((d) => {
							if (d?.likes) likesMap = d.likes;
						})
						.catch(() => {});

					fetch("/api/messages/?counts=1&prefix=thought-")
						.then((r) => (r.ok ? r.json() : null))
						.then((d) => {
							if (d) commentCountsMap = d;
						})
						.catch(() => {});
				}
			}
		}
	} catch (e) {
		console.error("Failed to fetch dynamic thoughts:", e);
	} finally {
		loading = false;
	}
});

function toggleQzone() {
	showQzone = !showQzone;
	try {
		localStorage.setItem("show_qzone_thoughts", String(showQzone));
	} catch (e) {}
}

function formatDateTime(timestamp: number): string {
	const date = new Date(timestamp);
	const yyyy = date.getFullYear();
	const mm = (date.getMonth() + 1).toString().padStart(2, "0");
	const dd = date.getDate().toString().padStart(2, "0");
	const hh = date.getHours().toString().padStart(2, "0");
	const min = date.getMinutes().toString().padStart(2, "0");
	const ss = date.getSeconds().toString().padStart(2, "0");
	return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

$: qzoneCount = thoughts.filter((t) => t.source === "qzone").length;
$: filteredThoughts = thoughts.filter((t) => showQzone || t.source !== "qzone");
</script>

{#if thoughts.length > 0}
	<!-- 顶部过滤开关控制器 -->
	{#if qzoneCount > 0}
		<div class="relative pl-8 mb-6 flex items-center justify-between text-xs text-50">
			<div class="flex items-center gap-2">
				<span class="font-medium text-75">动态说说</span>
				<span class="text-[11px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-50">
					共 {filteredThoughts.length} 条
				</span>
			</div>
			<button
				type="button"
				on:click={toggleQzone}
				class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all duration-200 border cursor-pointer active:scale-95 {showQzone ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium' : 'border-black/10 dark:border-white/10 text-50 hover:text-75 bg-transparent'}"
				title={showQzone ? "点击隐藏QQ空间同步说说" : "点击展示QQ空间同步说说"}
			>
				<span class="w-1.5 h-1.5 rounded-full transition-colors {showQzone ? 'bg-amber-500' : 'bg-gray-400'}"></span>
				<span>{showQzone ? "展示QQ空间" : "已隐藏QQ空间"}</span>
			</button>
		</div>
	{/if}

	{#if filteredThoughts.length > 0}
		<div class="space-y-8 mb-8">
			{#each filteredThoughts as thought (thought.id)}
				<div class="relative pl-8">
					<div
						class="absolute left-0 top-2 w-4 h-4 rounded-full bg-[var(--card-bg)] border-2 border-[var(--primary)] z-10"
					></div>
					<div class="flex flex-col gap-2">
						<div class="flex items-center gap-2">
							<span class="text-sm text-50 font-mono">
								{formatDateTime(thought.published)}
							</span>
							{#if thought.source === "qzone"}
								<span
									class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium"
									title="同步自 QQ 空间说说"
								>
									<svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
										<path
											d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z"
										/>
									</svg>
									QQ空间
								</span>
							{/if}
							{#if thought.device}
								<span class="text-xs text-50 hidden sm:inline font-mono">
									来自 {thought.device}
								</span>
							{/if}
						</div>

						<div
							class="bg-[var(--btn-plain-bg-hover)] rounded-xl px-4 py-3 text-75 shadow-sm border border-[var(--line-color)] transition hover:border-[var(--primary)]/30"
						>
							<div class="whitespace-pre-wrap break-words leading-relaxed text-[0.95rem] text-75 text-black/75 dark:text-white/85">
								{thought.content}
							</div>

							{#if thought.images && thought.images.length > 0}
								<div
									class="grid gap-2 mt-3 {thought.images.length === 1
										? 'grid-cols-1 max-w-sm'
										: thought.images.length === 2 || thought.images.length === 4
											? 'grid-cols-2 max-w-md'
											: 'grid-cols-3 max-w-lg'}"
								>
									{#each thought.images as imgUrl}
										<a
											href={imgUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="group overflow-hidden rounded-lg aspect-square bg-[var(--card-bg)] border border-[var(--line-color)]"
										>
											<img
												src={imgUrl}
												alt="说说配图"
												loading="lazy"
												referrerpolicy="no-referrer"
												class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
											/>
										</a>
									{/each}
								</div>
							{/if}

							<!-- 点赞与留言操作栏 -->
							<ThoughtActions
								thoughtId={thought.id}
								initialLikes={likesMap[`thought-${thought.id}`]}
								initialComments={commentCountsMap[`thought-${thought.id}`]}
							/>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
{/if}
