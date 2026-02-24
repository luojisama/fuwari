<script lang="ts">
import { onMount } from "svelte";

export let travelData: {
	date: string;
	city: string;
	name: string; // The city name in Chinese
	lat: number;
	lng: number;
	event: string;
	status: string;
}[] = [];

export let markerConfig = {
	color: "oklch(0.75 0.14 var(--hue))",
	fillColor: "white",
	size: 24,
	borderWidth: 4,
};

let mapContainer: HTMLElement;
  // biome-ignore lint/suspicious/noExplicitAny: Leaflet map instance
  let map: any;

  onMount(() => {
	// Load Leaflet CSS
	if (!document.getElementById("leaflet-css")) {
		const link = document.createElement("link");
		link.id = "leaflet-css";
		link.rel = "stylesheet";
		link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
		link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
		link.crossOrigin = "";
		document.head.appendChild(link);
	}

	// Load Leaflet JS
	if (!document.getElementById("leaflet-js")) {
		const script = document.createElement("script");
		script.id = "leaflet-js";
		script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
		script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
		script.crossOrigin = "";
		script.onload = initMap;
		document.head.appendChild(script);
	} else {
		// If script already loaded, just init
		// @ts-ignore
		if (window.L) {
			initMap();
		} else {
			// Wait for it to load if it's currently loading
			document.getElementById("leaflet-js")?.addEventListener("load", initMap);
		}
	}

	return () => {
		if (map) {
			map.remove();
		}
	};
});

function initMap() {
	// @ts-ignore
	const L = window.L;
	if (!L || !mapContainer) return;

	// Check if map is already initialized
	if (map) return;

	map = L.map(mapContainer).setView([35.8617, 104.1954], 4); // Center of China

	// Map Tile Providers - Switch here if map is not loading
	const tileProviders = {
		// Option 1: CartoDB Voyager (Original - Clean, Light) - May be slow in China
		cartoVoyager: {
			url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
			attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
		},
		// Option 2: GeoQ Community (Best for China - Fast, English/Chinese)
		geoqCommunity: {
			url: "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}",
			attr: '地图数据 &copy; <a href="http://www.geoq.cn/">GeoQ</a>'
		},
		// Option 3: GeoQ PurplishBlue (Dark/Cool style)
		geoqBlue: {
			url: "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
			attr: '地图数据 &copy; <a href="http://www.geoq.cn/">GeoQ</a>'
		},
		// Option 4: ArcGIS World Street Map (Reliable Global)
		arcgis: {
			url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
			attr: 'Tiles &copy; Esri'
		},
		// Option 5: GaoDe (AMap) - Most reliable in China (GCJ-02 coordinates)
		amap: {
			url: "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
			attr: '&copy; <a href="https://ditu.amap.com/">高德地图</a>',
			subdomains: "1234"
		},
		// Option 6: Tencent Map (GCJ-02 coordinates)
		tencent: {
			url: "https://rt{s}.map.gtimg.com/tile?z={z}&x={x}&y={y}&styleid=1&version=298",
			attr: '&copy; <a href="https://map.qq.com/">腾讯地图</a>',
			subdomains: "0123"
		}
	};

	// Use GaoDe (AMap) as the default for best domestic accessibility
	const activeProvider = tileProviders.amap;

	L.tileLayer(
		activeProvider.url,
		{
			attribution: activeProvider.attr,
			subdomains: activeProvider.subdomains || "abcd",
			maxZoom: 18,
		},
	).addTo(map);

	// Custom Icon Style matching Fuwari theme
	const createCustomIcon = () => {
		const markerHtml = `
            <div style="
                width: ${markerConfig.size}px;
                height: ${markerConfig.size}px;
                background-color: ${markerConfig.color};
                border: ${markerConfig.borderWidth}px solid ${markerConfig.fillColor};
                border-radius: 50%;
                box-shadow: 0 0 4px rgba(0,0,0,0.3);
                position: relative;
            ">
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 4px;
                    height: 4px;
                    background-color: white;
                    border-radius: 50%;
                "></div>
            </div>
        `;

		return L.divIcon({
			className: "custom-marker",
			html: markerHtml,
			iconSize: [markerConfig.size, markerConfig.size],
			iconAnchor: [markerConfig.size / 2, markerConfig.size / 2],
			popupAnchor: [0, -markerConfig.size / 2],
		});
	};

	const customIcon = createCustomIcon();
	const markers = [];

	for (const item of travelData) {
		if (!item.lat || !item.lng) continue;

		const marker = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(
			map,
		);
		markers.push(marker);

		const popupContent = `
        <div class="text-sm font-sans">
          <h3 class="font-bold text-lg mb-1 text-[var(--primary)]">${item.name} (${item.city})</h3>
          <p class="mb-1 text-gray-600"><b>时间:</b> ${item.date}</p>
          <p class="mb-1 text-gray-600"><b>事项:</b> ${item.event}</p>
          <p class="mb-0"><b>状态:</b> <span class="${item.status === "已完成" ? "text-green-600 font-medium" : "text-orange-500 font-medium"}">${item.status}</span></p>
        </div>
      `;

		marker.bindPopup(popupContent);
	}

	if (markers.length > 0) {
		const group = L.featureGroup(markers);
		map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 8 });
	}
}
</script>

<div class="w-full h-[600px] rounded-xl overflow-hidden shadow-lg z-0 relative" bind:this={mapContainer}>
  <!-- Map will be rendered here -->
</div>

<style>
  /* Ensure map tiles are below other content if needed */
  :global(.leaflet-container) {
    font-family: inherit;
    z-index: 0;
  }
</style>
