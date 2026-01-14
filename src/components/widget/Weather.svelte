<script lang="ts">
	import Icon from "@iconify/svelte";
	import { onMount } from "svelte";

	export let stationCode: string = "WwcJd";

	let loading = true;
	let error = "";
	let weatherData: any = null;

	const mapNmcImgToIcon = (imgCode: number | string, isNight: boolean) => {
		const code = Number(imgCode);
		// Simplified mapping based on NMC codes
		switch (code) {
			case 0:
				return isNight ? "material-symbols:clear-night" : "material-symbols:sunny";
			case 1:
				return isNight
					? "material-symbols:partly-cloudy-night"
					: "material-symbols:partly-cloudy-day";
			case 2:
				return "material-symbols:cloud";
			case 18:
				return "material-symbols:foggy";
			case 53:
				return "material-symbols:haze";
			case 3:
			case 7:
			case 8:
			case 9:
			case 10:
			case 11:
			case 12:
				return "material-symbols:rainy";
			case 4:
			case 5:
				return "material-symbols:thunderstorm";
			case 6:
			case 13:
			case 14:
			case 15:
			case 16:
			case 17:
				return "material-symbols:weather-snowy";
			default:
				return "material-symbols:cloud";
		}
	};

	const fetchWeather = async () => {
		try {
			loading = true;
			const res = await fetch(
				`https://www.nmc.cn/rest/weather?stationid=${stationCode}`,
			);
			const data = await res.json();

			if (data.code !== 0 || !data.data) {
				throw new Error("Failed to load weather data");
			}

			const real = data.data.real;
			const tempchart = data.data.tempchart;

			// Find today's forecast for min/max
			const today = new Date();
			const yyyy = today.getFullYear();
			const mm = String(today.getMonth() + 1).padStart(2, "0");
			const dd = String(today.getDate()).padStart(2, "0");
			const dateStr = `${yyyy}/${mm}/${dd}`;

			const todayForecast =
				tempchart.find((item: any) => item.time === dateStr) || {};

			// Determine if it's night based on local time
			const hour = new Date().getHours();
			const isNight = hour < 6 || hour >= 18;

			weatherData = {
				temp: real.weather.temperature,
				info: real.weather.info,
				icon: mapNmcImgToIcon(real.weather.img, isNight),
				location: real.station.city,
				max: todayForecast.max_temp ?? "-",
				min: todayForecast.min_temp ?? "-",
			};
		} catch (e) {
			console.error(e);
			error = "Failed to load weather";
		} finally {
			loading = false;
		}
	};

	onMount(() => {
		fetchWeather();
	});
</script>

<div class="weather-container w-full h-full flex flex-col items-center justify-center gap-2 p-2">
    {#if loading}
        <div class="animate-pulse flex flex-col items-center gap-2">
            <div class="h-8 w-8 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
            <div class="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
        </div>
    {:else if error}
        <div class="text-sm text-neutral-500">{error}</div>
    {:else if weatherData}
        <div class="flex items-center gap-4">
            <Icon icon={weatherData.icon} class="text-4xl text-[var(--primary)]" />
            <div class="flex flex-col">
                <span class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{weatherData.temp}°C</span>
                <div class="text-xs text-neutral-500 dark:text-neutral-400 flex gap-2">
                    <span>H: {weatherData.max}°</span>
                    <span>L: {weatherData.min}°</span>
                </div>
                <span class="text-xs text-neutral-500 dark:text-neutral-400">{weatherData.location} | {weatherData.info}</span>
            </div>
        </div>
    {/if}
</div>
