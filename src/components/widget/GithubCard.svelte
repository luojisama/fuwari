<script lang="ts">
    import Icon from "@iconify/svelte";
    import { onMount } from "svelte";

    type GithubUser = {
        login: string;
        avatar_url: string;
        html_url: string;
        name: string;
        bio: string;
        public_repos: number;
        followers: number;
        following: number;
        created_at: string;
    };

    type GithubRepo = {
        name: string;
        html_url: string;
        description: string;
        language: string;
        stargazers_count: number;
        forks_count: number;
        updated_at: string;
    };

    let userData: GithubUser | null = null;
    let reposData: GithubRepo[] = [];
    let loading = true;

    const CACHE_KEY = "github_cache_data";
    const CACHE_TIME_KEY = "github_cache_time";
    const ONE_HOUR = 60 * 60 * 1000;

    async function fetchData(force = false) {
        const now = Date.now();
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        const cachedData = localStorage.getItem(CACHE_KEY);

        if (
            !force &&
            cachedTime &&
            cachedData &&
            now - Number.parseInt(cachedTime) < ONE_HOUR
        ) {
            try {
                const parsed = JSON.parse(cachedData);
                userData = parsed.user;
                reposData = parsed.repos;
                loading = false;
                return;
            } catch (e) {
                localStorage.removeItem(CACHE_KEY);
                localStorage.removeItem(CACHE_TIME_KEY);
            }
        }

        loading = true;
        try {
            const [userRes, reposRes] = await Promise.all([
                fetch("https://api.github.com/users/luojisama"),
                fetch("https://api.github.com/users/luojisama/repos?sort=pushed&direction=desc&per_page=6")
            ]);

            if (userRes.ok) userData = await userRes.json();
            if (reposRes.ok) reposData = await reposRes.json();

            if (userData || reposData.length > 0) {
                localStorage.setItem(
                    CACHE_KEY,
                    JSON.stringify({
                        user: userData,
                        repos: reposData,
                    })
                );
                localStorage.setItem(CACHE_TIME_KEY, now.toString());
            }
        } catch (e) {
            console.error("Failed to fetch Github data", e);
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

    function formatDate(dateStr: string) {
        const date = new Date(dateStr);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    const languageColors: Record<string, string> = {
        TypeScript: "#3178c6",
        JavaScript: "#f1e05a",
        Python: "#3572A5",
        Vue: "#41b883",
        Svelte: "#ff3e00",
        HTML: "#e34c26",
        CSS: "#563d7c",
        Astro: "#ff5a03",
        Shell: "#89e051",
        Java: "#b07219",
        Go: "#00ADD8",
        Rust: "#dea584",
    };

    function getProxyUrl(url: string) {
        if (!url) return "";
        return `https://wsrv.nl/?url=${encodeURIComponent(url)}`;
    }
</script>

<div class="card-base p-6 mt-4 transition-all duration-300 hover:shadow-lg border border-neutral-100 dark:border-neutral-800">
    <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2 font-bold text-xl text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-5 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.4rem]"
        >
            Github Activity
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
            <a href="https://github.com/luojisama" target="_blank" class="btn-regular p-2 rounded-lg text-sm flex items-center gap-2 active:scale-95 transition">
                <Icon icon="fa6-brands:github" class="text-lg" />
                <span>个人主页</span>
            </a>
        </div>
    </div>

    {#if loading}
        <div class="flex flex-col items-center justify-center py-10 gap-3">
            <Icon icon="eos-icons:bubble-loading" class="text-4xl text-[var(--primary)]" />
            <div class="text-neutral-400 animate-pulse text-sm">正在同步 Github 数据...</div>
        </div>
    {:else if userData}
        <div class="flex items-center gap-5 mb-8 p-4 rounded-2xl bg-neutral-50/50 dark:bg-neutral-800/30">
            <div class="relative group">
                <img src={getProxyUrl(userData.avatar_url)} 
                     alt={userData.login} 
                     class="w-20 h-20 rounded-2xl shadow-lg transition-transform group-hover:scale-105" />
            </div>
            <div class="flex-1 min-w-0">
                <div class="font-bold text-2xl text-neutral-800 dark:text-neutral-100 truncate mb-1">
                    {userData.name || userData.login}
                </div>
                <div class="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                    {userData.bio || "No bio available"}
                </div>
                <div class="flex flex-wrap gap-4 text-xs text-neutral-600 dark:text-neutral-400">
                    <div class="flex items-center gap-1">
                        <Icon icon="octicon:repo" />
                        <span>{userData.public_repos} Repos</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <Icon icon="octicon:people" />
                        <span>{userData.followers} Followers</span>
                    </div>
                </div>
            </div>
        </div>

        {#if reposData.length > 0}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each reposData as repo}
                    <a href={repo.html_url} target="_blank" class="flex flex-col p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50 hover:border-[var(--primary)] transition-colors group h-full">
                        <div class="flex items-center justify-between mb-2">
                            <div class="font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-[var(--primary)] transition-colors truncate">
                                {repo.name}
                            </div>
                            <div class="text-xs text-neutral-400">
                                {formatDate(repo.updated_at)}
                            </div>
                        </div>
                        <div class="text-xs text-neutral-500 dark:text-neutral-400 mb-3 line-clamp-2 h-8">
                            {repo.description || "No description"}
                        </div>
                        <div class="mt-auto flex items-center justify-between text-xs text-neutral-500">
                            <div class="flex items-center gap-3">
                                {#if repo.language}
                                    <div class="flex items-center gap-1">
                                        <span class="w-2 h-2 rounded-full" style="background-color: {languageColors[repo.language] || '#ccc'}"></span>
                                        {repo.language}
                                    </div>
                                {/if}
                                <div class="flex items-center gap-1">
                                    <Icon icon="octicon:star" />
                                    {repo.stargazers_count}
                                </div>
                                <div class="flex items-center gap-1">
                                    <Icon icon="octicon:repo-forked" />
                                    {repo.forks_count}
                                </div>
                            </div>
                        </div>
                    </a>
                {/each}
            </div>
        {/if}
    {:else}
        <div class="flex flex-col items-center justify-center py-10 text-neutral-400 text-sm italic gap-3">
            <Icon icon="material-symbols:error-outline" class="text-3xl text-neutral-300" />
            <span>暂时无法获取 Github 数据</span>
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