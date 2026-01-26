<script lang="ts">
import { onMount } from "svelte";
import Icon from "@iconify/svelte";
import MessageEditor from "./MessageEditor.svelte";
import MessageItem from "./MessageItem.svelte";
import type { Message } from "../types/message";

export let slug = "message-board";

let messages: Message[] = [];
let loading = true;
let showSuccess = false;

async function fetchMessages() {
    loading = true;
    try {
        const res = await fetch(`/api/messages/?slug=${slug}`);
        if (res.ok) {
            const rawMessages: Message[] = await res.json();
            
            // Build tree
            const messageMap = new Map<string, Message>();
            rawMessages.forEach(m => {
                m.replies = [];
                messageMap.set(m.id, m);
            });
            
            const rootMessages: Message[] = [];
            rawMessages.forEach(m => {
                if (m.parentId && messageMap.has(m.parentId)) {
                    messageMap.get(m.parentId)!.replies!.push(m);
                } else {
                    rootMessages.push(m);
                }
            });
            
            // Sort root messages by newest first
            rootMessages.sort((a, b) => b.createdAt - a.createdAt);
            
            // Sort replies by oldest first (chronological conversation)
            rawMessages.forEach(m => {
                if (m.replies) {
                    m.replies.sort((a, b) => a.createdAt - b.createdAt);
                }
            });
            
            messages = rootMessages;
        }
    } catch (e) {
        console.error("Failed to fetch messages", e);
    } finally {
        loading = false;
    }
}

function handleSuccess(e: CustomEvent) {
    // Add the new message to the list or refresh
    // If it's a root message (no parentId), we can prepend it.
    // If it's a reply, it's complicated to update locally without re-fetching or traversing.
    // Re-fetching is safer and easier.
    
    // Show success toast
    showSuccess = true;
    setTimeout(() => {
        showSuccess = false;
    }, 3000);
    
    fetchMessages();
}

onMount(() => {
    fetchMessages();
});
</script>

<div class="flex flex-col gap-8">
    <!-- Success Notification -->
    {#if showSuccess}
        <div class="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce-in">
            <Icon icon="fa6-solid:check" />
            <span>发送成功！</span>
        </div>
    {/if}

    <!-- Input Area -->
    <div class="card-base p-6 border border-neutral-100 dark:border-neutral-800">
        <div class="flex items-center gap-2 mb-4 font-bold text-lg text-neutral-900 dark:text-neutral-100">
            <Icon icon="fa6-solid:pen-to-square" class="text-[var(--primary)]" />
            留下你的足迹
        </div>
        
        <MessageEditor on:success={handleSuccess} {slug} />
    </div>

    <!-- Message List -->
    <div class="flex flex-col gap-4">
        {#if loading}
            <div class="flex justify-center py-10">
                <Icon icon="eos-icons:loading" class="text-3xl text-neutral-400" />
            </div>
        {:else if messages.length === 0}
            <div class="flex flex-col items-center justify-center py-10 text-neutral-400 gap-2">
                <Icon icon="fa6-solid:comment-slash" class="text-3xl" />
                <span>还没有留言，快来抢沙发吧！</span>
            </div>
        {:else}
            {#each messages as msg (msg.id)}
                <MessageItem message={msg} on:replySuccess={handleSuccess} {slug} />
            {/each}
        {/if}
    </div>
</div>

<style>
    .card-base {
        border-radius: var(--radius-large);
        background-color: var(--card-bg);
    }
    @keyframes bounce-in {
        0% { transform: translateY(-20px); opacity: 0; }
        50% { transform: translateY(5px); }
        100% { transform: translateY(0); opacity: 1; }
    }
    .animate-bounce-in {
        animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    /* Markdown Styles */
    :global(.markdown-content p) {
        margin-bottom: 0.5em;
    }
    :global(.markdown-content p:last-child) {
        margin-bottom: 0;
    }
    :global(.markdown-content a) {
        color: var(--primary);
        text-decoration: underline;
    }
    :global(.markdown-content ul), :global(.markdown-content ol) {
        margin-left: 1.5em;
        margin-bottom: 0.5em;
    }
    :global(.markdown-content ul) {
        list-style-type: disc;
    }
    :global(.markdown-content ol) {
        list-style-type: decimal;
    }
    :global(.markdown-content blockquote) {
        border-left: 3px solid var(--primary);
        padding-left: 1em;
        margin-left: 0;
        margin-bottom: 0.5em;
        color: #666;
    }
    :global(.dark .markdown-content blockquote) {
        color: #aaa;
    }
    :global(.markdown-content code) {
        background-color: rgba(0, 0, 0, 0.1);
        padding: 0.2em 0.4em;
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.9em;
    }
    :global(.dark .markdown-content code) {
        background-color: rgba(255, 255, 255, 0.1);
    }
    :global(.markdown-content pre) {
        background-color: #f5f5f5;
        padding: 1em;
        border-radius: 8px;
        overflow-x: auto;
        margin-bottom: 0.5em;
    }
    :global(.dark .markdown-content pre) {
        background-color: #1a1a1a;
    }
    :global(.markdown-content pre code) {
        background-color: transparent;
        padding: 0;
    }
    :global(.markdown-content .spoiler) {
        background-color: #000;
        color: #000;
        padding: 0 4px;
        border-radius: 4px;
        cursor: pointer;
        transition: color 0.3s;
    }
    :global(.dark .markdown-content .spoiler) {
        background-color: #fff;
        color: #fff;
    }
    :global(.markdown-content .spoiler:hover) {
        color: #fff;
    }
    :global(.dark .markdown-content .spoiler:hover) {
        color: #000;
    }
</style>
