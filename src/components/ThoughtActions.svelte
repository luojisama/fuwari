<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import type { Message } from "../types/message";
import MessageEditor from "./MessageEditor.svelte";
import MessageItem from "./MessageItem.svelte";

export let thoughtId: string;
export let initialLikes: number | undefined = undefined;
export let initialComments: number | undefined = undefined;

const slug = `thought-${thoughtId}`;

let likes = initialLikes ?? 0;
let liked = false;
let likeAnimating = false;
let likesFetched = initialLikes !== undefined;

let commentCount = initialComments ?? 0;
let commentsFetched = initialComments !== undefined;

let showComments = false;
let commentsLoading = false;
let comments: Message[] = [];
let hasLoadedCommentsList = false;

onMount(async () => {
	// 检查是否已点赞
	try {
		const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
		liked = likedPosts.includes(slug);
	} catch (e) {
		liked = false;
	}

	// 若未传入初始点赞数，则异步请求获取
	if (!likesFetched) {
		try {
			const res = await fetch(`/api/like?slug=${encodeURIComponent(slug)}`);
			if (res.ok) {
				const data = await res.json();
				likes = data.likes || 0;
				likesFetched = true;
			}
		} catch (e) {
			console.error("Failed to fetch likes for", slug, e);
		}
	}

	// 若未传入初始评论数，则异步请求获取
	if (!commentsFetched) {
		try {
			const res = await fetch(
				`/api/messages/?slug=${encodeURIComponent(slug)}`,
			);
			if (res.ok) {
				const rawList: Message[] = await res.json();
				commentCount = Array.isArray(rawList) ? rawList.length : 0;
				commentsFetched = true;
			}
		} catch (e) {
			console.error("Failed to fetch comment count for", slug, e);
		}
	}
});

// 响应外部传入属性更新
$: if (initialLikes !== undefined && !likesFetched) {
	likes = initialLikes;
	likesFetched = true;
}
$: if (initialComments !== undefined && !commentsFetched) {
	commentCount = initialComments;
	commentsFetched = true;
}

async function handleLike() {
	if (liked || likeAnimating) return;

	likeAnimating = true;
	liked = true;
	likes += 1;

	try {
		const res = await fetch("/api/like", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ slug }),
		});

		if (res.ok) {
			const data = await res.json();
			likes = data.likes;
			try {
				const likedPosts = JSON.parse(
					localStorage.getItem("likedPosts") || "[]",
				);
				if (!likedPosts.includes(slug)) {
					likedPosts.push(slug);
					localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
				}
			} catch (e) {}
		} else {
			liked = false;
			likes = Math.max(0, likes - 1);
		}
	} catch (e) {
		console.error("Failed to like", e);
		liked = false;
		likes = Math.max(0, likes - 1);
	} finally {
		setTimeout(() => {
			likeAnimating = false;
		}, 500);
	}
}

async function fetchComments() {
	commentsLoading = true;
	try {
		const res = await fetch(`/api/messages/?slug=${encodeURIComponent(slug)}`);
		if (res.ok) {
			const rawMessages: Message[] = await res.json();
			commentCount = rawMessages.length;

			// 构建树形回复结构
			const messageMap = new Map<string, Message>();
			for (const m of rawMessages) {
				m.replies = [];
				messageMap.set(m.id, m);
			}

			const rootMessages: Message[] = [];
			for (const m of rawMessages) {
				if (m.parentId && messageMap.has(m.parentId)) {
					const parent = messageMap.get(m.parentId);
					if (parent?.replies) {
						parent.replies.push(m);
					}
				} else {
					rootMessages.push(m);
				}
			}

			// 按时间倒序排序主评论
			rootMessages.sort((a, b) => b.createdAt - a.createdAt);

			// 子回复按时间正序
			for (const m of rawMessages) {
				if (m.replies) {
					m.replies.sort((a, b) => a.createdAt - b.createdAt);
				}
			}

			comments = rootMessages;
			hasLoadedCommentsList = true;
		}
	} catch (e) {
		console.error("Failed to load comments for", slug, e);
	} finally {
		commentsLoading = false;
	}
}

function toggleComments() {
	showComments = !showComments;
	if (showComments && !hasLoadedCommentsList) {
		fetchComments();
	}
}

function handleCommentSuccess() {
	commentCount += 1;
	fetchComments();
}
</script>

<div class="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5">
    <!-- 交互操作条 -->
    <div class="flex items-center justify-between text-xs text-50">
        <div class="flex items-center gap-2 sm:gap-4">
            <!-- 点赞按钮 -->
            <button
                type="button"
                on:click={handleLike}
                disabled={liked}
                class="flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 group {liked ? 'text-red-500 font-medium cursor-default' : 'hover:text-red-500'}"
                title={liked ? "已点赞" : "点个赞"}
            >
                <div class="relative flex items-center justify-center">
                    <Icon
                        icon={liked ? "material-symbols:favorite-rounded" : "material-symbols:favorite-outline-rounded"}
                        class="text-sm transition-transform duration-200 {liked ? 'text-red-500 scale-110' : 'group-hover:scale-110 group-hover:text-red-500'}"
                    />
                    {#if likeAnimating}
                        <div class="absolute inset-0 animate-ping rounded-full bg-red-500/50"></div>
                    {/if}
                </div>
                <span>{likes > 0 ? likes : "赞"}</span>
            </button>

            <!-- 留言按钮 -->
            <button
                type="button"
                on:click={toggleComments}
                class="flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--primary)] active:scale-95 {showComments ? 'text-[var(--primary)] bg-[var(--primary)]/10 font-medium' : ''}"
                title="查看与发表留言"
            >
                <Icon
                    icon={showComments ? "material-symbols:chat-bubble-rounded" : "material-symbols:chat-bubble-outline-rounded"}
                    class="text-sm"
                />
                <span>{commentCount > 0 ? `${commentCount}` : "留言"}</span>
            </button>
        </div>

        {#if showComments}
            <button
                type="button"
                on:click={() => showComments = false}
                class="text-[11px] text-50 hover:text-75 transition-colors px-1 py-0.5"
            >
                收起留言
            </button>
        {/if}
    </div>

    <!-- 展开的专属留言区 -->
    {#if showComments}
        <div class="mt-3 pt-3 border-t border-black/5 dark:border-white/5 space-y-4 animate-fade-in">
            <!-- 留言输入框 -->
            <div class="bg-[var(--card-bg)] rounded-xl p-3 border border-black/5 dark:border-white/5 shadow-sm">
                <div class="flex items-center gap-1.5 text-xs text-75 font-bold mb-2">
                    <Icon icon="fa6-solid:pen-to-square" class="text-[var(--primary)]" />
                    <span>对这条小事发表留言</span>
                </div>
                <MessageEditor
                    {slug}
                    placeholder="分享你的看法... (支持 Markdown、表情)"
                    on:success={handleCommentSuccess}
                />
            </div>

            <!-- 留言列表 -->
            {#if commentsLoading}
                <div class="flex justify-center py-6">
                    <Icon icon="eos-icons:loading" class="text-2xl text-30 animate-spin" />
                </div>
            {:else if comments.length === 0}
                <div class="text-center py-5 text-xs text-50 flex items-center justify-center gap-1.5">
                    <Icon icon="fa6-solid:comment-dots" class="text-sm" />
                    <span>暂无留言，快来发第一条评论吧！</span>
                </div>
            {:else}
                <div class="space-y-3">
                    {#each comments as msg (msg.id)}
                        <MessageItem
                            message={msg}
                            {slug}
                            on:replySuccess={handleCommentSuccess}
                        />
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    @keyframes fade-in {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
        animation: fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
</style>
