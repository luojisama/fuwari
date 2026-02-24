<script lang="ts">
import Icon from "@iconify/svelte";
import { createEventDispatcher, onMount } from "svelte";

export let parentId: string | undefined = undefined;
export let placeholder = "说点什么吧... (支持 Markdown 和 ||隐藏内容||)";
export let autofocus = false;
export let slug = "message-board";

const dispatch = createEventDispatcher();

let nickname = "";
let email = "";
let website = "";
let content = "";
let submitting = false;
let contentTextarea: HTMLTextAreaElement;

// Reactive avatar preview
$: avatarPreview =
	email && (email.match(/^\d{5,11}$/) || email.match(/^\d{5,11}@qq\.com$/))
		? `https://q1.qlogo.cn/g?b=qq&nk=${email.replace(/@qq\.com$/, "")}&s=100`
		: `https://api.dicebear.com/7.x/identicon/svg?seed=${nickname || "anonymous"}`;

onMount(() => {
	nickname = localStorage.getItem("message_nickname") || "";
	email = localStorage.getItem("message_email") || "";
	website = localStorage.getItem("message_website") || "";

	if (autofocus && contentTextarea) {
		contentTextarea.focus();
	}
});

$: if (typeof localStorage !== "undefined") {
	if (nickname) localStorage.setItem("message_nickname", nickname);
	if (email) localStorage.setItem("message_email", email);
	if (website) localStorage.setItem("message_website", website);
}

async function handleSubmit() {
	if (!nickname.trim() || !content.trim()) return;
	submitting = true;
	try {
		const res = await fetch("/api/messages/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				nickname,
				content,
				email,
				website,
				parentId,
				slug,
			}),
		});

		const data = await res.json();
		if (res.ok) {
			content = ""; // Clear content
			dispatch("success", data);
		} else {
			alert(data.error || "发送失败，请重试");
		}
	} catch (e) {
		console.error("Failed to post message", e);
		alert("发送失败，请检查网络连接");
	} finally {
		submitting = false;
	}
}
</script>

<div class="flex flex-col gap-4">
    <div class="flex flex-col sm:flex-row gap-4">
        <div class="w-16 h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0 border border-neutral-200 dark:border-neutral-700 shadow-sm self-start">
            <img 
                src={avatarPreview} 
                alt="Avatar" 
                class="w-full h-full object-cover transition-all duration-500"
            />
        </div>
        <div class="flex-1 flex flex-col gap-3">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input 
                    type="text" 
                    bind:value={nickname}
                    placeholder="昵称 (必填)"
                    class="w-full px-4 py-2 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white dark:focus:bg-black transition-all text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
                    maxlength="20"
                />
                <input 
                    type="text" 
                    bind:value={email}
                    placeholder="QQ号 / 邮箱 (可选)"
                    class="w-full px-4 py-2 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white dark:focus:bg-black transition-all text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
                    maxlength="50"
                />
                <input 
                    type="text" 
                    bind:value={website}
                    placeholder="个人网站 (可选)"
                    class="w-full px-4 py-2 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white dark:focus:bg-black transition-all text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
                    maxlength="100"
                />
            </div>
            <textarea 
                bind:this={contentTextarea}
                bind:value={content}
                {placeholder}
                rows="3"
                class="w-full px-4 py-2 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white dark:focus:bg-black transition-all resize-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
                maxlength="500"
            ></textarea>
        </div>
    </div>
    
    <div class="flex justify-end">
        <button 
            on:click={handleSubmit}
            disabled={submitting || !nickname || !content}
            class="btn-primary px-6 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {#if submitting}
                <Icon icon="eos-icons:loading" />
                <span>发送中...</span>
            {:else}
                <Icon icon="fa6-solid:paper-plane" />
                <span>发送</span>
            {/if}
        </button>
    </div>
</div>

<style>
    .btn-primary {
        background-color: var(--primary);
        color: white;
    }
    .btn-primary:hover {
        background-color: var(--primary-hover);
    }
</style>
