<script context="module" lang="ts">
    import MarkdownIt from "markdown-it";
    import sanitizeHtml from "sanitize-html";

    const md = new MarkdownIt({
        html: true,
        breaks: true,
        linkify: true,
    });

    const sanitizeOptions = {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "details", "summary", "span", "h1", "h2"]),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ["src", "alt", "title"],
            span: ["class"],
        },
        allowedClasses: {
            span: ["spoiler"],
        },
    };

    function renderContent(text: string) {
        // Process spoilers: ||text|| -> <span class="spoiler">text</span>
        const withSpoilers = text.replace(/\|\|(.*?)\|\|/g, '<span class="spoiler">$1</span>');
        
        const rawHtml = md.render(withSpoilers);
        
        return sanitizeHtml(rawHtml, sanitizeOptions);
    }
</script>

<script lang="ts">
import Icon from "@iconify/svelte";
import type { Message } from "../types/message";
import MessageEditor from "./MessageEditor.svelte";
import { createEventDispatcher } from "svelte";

export let message: Message;
export let depth = 0;
export let slug = "message-board";

const dispatch = createEventDispatcher();
let showReply = false;

function timeAgo(timestamp: number) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "刚刚";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    return `${days}天前`;
}

function handleReplySuccess(e: CustomEvent) {
    showReply = false;
    dispatch("replySuccess", e.detail);
}
</script>

<div class="flex flex-col gap-4">
    <div class="card-base p-4 border border-neutral-100 dark:border-neutral-800 transition-all hover:shadow-md">
        <div class="flex gap-4">
            <div class="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0 mt-1">
                <img src={message.avatar} alt={message.nickname} class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                    <div class="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        {#if message.website}
                            <a href={message.website} target="_blank" rel="noopener noreferrer" class="hover:text-[var(--primary)] transition-colors flex items-center gap-1 group">
                                {message.nickname}
                                <Icon icon="fa6-solid:link" class="text-xs opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400" />
                            </a>
                        {:else}
                            {message.nickname}
                        {/if}
                        <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-200/50 dark:bg-neutral-700/50 text-neutral-500">
                            Lv.1
                        </span>
                    </div>
                    <div class="flex items-center gap-3">
                        {#if message.os || message.browser}
                            <div class="hidden sm:flex items-center gap-1.5 text-[11px] text-neutral-400/80 bg-neutral-100 dark:bg-neutral-800/50 px-2 py-0.5 rounded-md mr-1">
                                {#if message.device}
                                    <span class="flex items-center gap-1">
                                        <Icon icon="fa6-solid:mobile" class="text-[10px]" />
                                        {message.device}
                                    </span>
                                {/if}
                                {#if message.os}
                                    <span class="flex items-center gap-1">
                                        {#if !message.device}
                                            <Icon icon="fa6-solid:laptop" class="text-[10px]" />
                                        {/if}
                                        {message.os}
                                    </span>
                                {/if}
                                {#if message.browser}
                                    <span class="flex items-center gap-1">
                                        <Icon icon="fa6-solid:globe" class="text-[10px]" />
                                        {message.browser}
                                    </span>
                                {/if}
                            </div>
                        {/if}
                        <div class="text-xs text-neutral-400">
                            {timeAgo(message.createdAt)}
                        </div>
                        <button 
                            class="text-xs text-neutral-400 hover:text-[var(--primary)] transition-colors flex items-center gap-1"
                            on:click={() => showReply = !showReply}
                        >
                            <Icon icon="fa6-solid:reply" />
                            {showReply ? '取消回复' : '回复'}
                        </button>
                    </div>
                </div>
                <div class="mt-2 text-neutral-800 dark:text-neutral-200 text-sm leading-relaxed custom-md">
                    {@html renderContent(message.content)}
                </div>
                
                <!-- Reply Editor -->
                {#if showReply}
                    <div class="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 animate-fade-in">
                        <MessageEditor 
                            parentId={message.id} 
                            placeholder={`回复 @${message.nickname}...`}
                            autofocus={true}
                            on:success={handleReplySuccess}
                            {slug}
                        />
                    </div>
                {/if}
            </div>
        </div>
    </div>

    <!-- Nested Replies -->
    {#if message.replies && message.replies.length > 0}
        <div class="flex flex-col gap-4 pl-8 border-l-2 border-neutral-100 dark:border-neutral-800 ml-4">
            {#each message.replies as reply (reply.id)}
                <svelte:self message={reply} depth={depth + 1} on:replySuccess {slug} />
            {/each}
        </div>
    {/if}
</div>

<style>
    .card-base {
        border-radius: var(--radius-large);
        background-color: var(--card-bg);
    }
    .animate-fade-in {
        animation: fade-in 0.3s ease-out;
    }
    @keyframes fade-in {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
</style>
