<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

// 接收外部传入的 class 和 style
let className = "";
export { className as class };
export let style = "";

// 可以在这里配置博主的位置（经纬度）
const OWNER_LOCATION = {
    lat: 24.8801, // 昆明
    lon: 102.8329,
    name: "白咲雫"
};

let weatherData = {
        temp: 0,
        weatherCode: 0,
        address: "未知星球",
        distance: 0,
        hitokoto: "正在加载...",
        poeticGreeting: ""
    };

    let loading = true;
    let error = "";
    let isEditing = false;
    let tempAddress = "";

    // WMO Weather interpretation codes (WW)
    function getWeatherIcon(code: number, isNight: boolean) {
    const iconMap: Record<number, string> = {
        0: isNight ? "weather-night" : "weather-sunny",
        1: isNight ? "weather-night-partly-cloudy" : "weather-partly-cloudy",
        2: isNight ? "weather-night-partly-cloudy" : "weather-partly-cloudy",
        3: "weather-cloudy",
        45: "weather-fog",
        48: "weather-fog",
        51: "weather-pouring",
        53: "weather-pouring",
        55: "weather-pouring",
        61: "weather-rainy",
        63: "weather-rainy",
        65: "weather-rainy",
        71: "weather-snowy",
        73: "weather-snowy",
        75: "weather-snowy",
        80: "weather-rainy",
        81: "weather-rainy",
        82: "weather-rainy",
        95: "weather-lightning-rainy",
        96: "weather-lightning-rainy",
        99: "weather-lightning-rainy",
    };
    return `mdi:${iconMap[code] || "weather-cloudy"}`;
}

function getWeatherDesc(code: number) {
    const descMap: Record<number, string> = {
        0: "晴", 1: "多云", 2: "多云", 3: "阴",
        45: "雾", 48: "凇", 51: "毛毛雨", 53: "毛毛雨", 55: "毛毛雨",
        61: "小雨", 63: "中雨", 65: "大雨", 66: "冻雨", 67: "冻雨",
        71: "小雪", 73: "中雪", 75: "大雪", 77: "雪粒",
        80: "阵雨", 81: "阵雨", 82: "阵雨",
        85: "阵雪", 86: "阵雪",
        95: "雷雨", 96: "雷雨", 99: "雷雨"
    };
    return descMap[code] || "未知";
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 6) return "夜深了，早点休息";
    if (hour < 9) return "早上好，一日之计在于晨";
    if (hour < 12) return "上午好，加油工作";
    if (hour < 14) return "中午好，记得午休";
    if (hour < 17) return "下午好，饮茶先啦";
    if (hour < 19) return "傍晚好，享受夕阳";
    if (hour < 22) return "晚上好，放松一下";
    return "夜深了，早点休息";
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
}

// Convert Traditional Chinese to Simplified Chinese (Simple mapping)
    function toSimplified(str: string) {
        if (!str) return str;
        return str
            .replace(/區/g, "区")
            .replace(/縣/g, "县")
            .replace(/號/g, "号")
            .replace(/樓/g, "楼")
            .replace(/門/g, "门")
            .replace(/裡/g, "里")
            .replace(/灣/g, "湾")
            .replace(/臺/g, "台")
            .replace(/雲/g, "云")
            .replace(/龍/g, "龙")
            .replace(/崗/g, "岗")
            .replace(/東/g, "东")
            .replace(/南/g, "南") // No change needed usually but kept for pattern
            .replace(/西/g, "西")
            .replace(/北/g, "北")
            .replace(/廣/g, "广")
            .replace(/場/g, "场")
            .replace(/園/g, "园")
            .replace(/亞/g, "亚")
            .replace(/馬/g, "马")
            .replace(/島/g, "岛")
            .replace(/國/g, "国")
            .replace(/省/g, "省")
            .replace(/市/g, "市")
            .replace(/麒/g, "麒") // No simplified diff
            .replace(/麟/g, "麟"); // No simplified diff
    }

    function getPoeticGreeting(province: string, city: string) {
        let posdesc = "带我去你的城市逛逛吧！";
        switch (province) {
            case "北京市": posdesc = "北——京——欢迎你~~~"; break;
            case "天津市": posdesc = "讲段相声吧"; break;
            case "河北省": posdesc = "山势巍巍成壁垒，天下雄关铁马金戈由此向，无限江山"; break;
            case "山西省": posdesc = "展开坐具长三尺，已占山河五百余"; break;
            case "内蒙古自治区": posdesc = "天苍苍，野茫茫，风吹草低见牛羊"; break;
            case "辽宁省": posdesc = "我想吃烤鸡架！"; break;
            case "吉林省": posdesc = "状元阁就是东北烧烤之王"; break;
            case "黑龙江省": posdesc = "很喜欢哈尔滨大剧院"; break;
            case "上海市": posdesc = "众所周知，中国只有两个城市"; break;
            case "江苏省":
                if (city === "南京市") posdesc = "这是我挺想去的城市啦";
                else if (city === "苏州市") posdesc = "上有天堂，下有苏杭";
                else posdesc = "散装是必须要散装的";
                break;
            case "浙江省": posdesc = "东风渐绿西湖柳，雁已还人未南归"; break;
            case "河南省":
                if (city === "郑州市") posdesc = "豫州之域，天地之中";
                else if (city === "洛阳市") posdesc = "洛阳牡丹甲天下";
                else if (city === "开封市") posdesc = "刚正不阿包青天";
                else posdesc = "可否带我品尝河南烩面啦？";
                break;
            case "安徽省": posdesc = "蚌埠住了，芜湖起飞"; break;
            case "福建省": posdesc = "井邑白云间，岩城远带山"; break;
            case "江西省": posdesc = "落霞与孤鹜齐飞，秋水共长天一色"; break;
            case "山东省": posdesc = "遥望齐州九点烟，一泓海水杯中泻"; break;
            case "湖北省":
                if (city === "武汉市") posdesc = "邀游武汉感恩有您。";
                else if (city === "恩施土家族苗族自治州") posdesc = "欢迎来到我的故乡，仙居恩施 天上人间。";
                else posdesc = "天上九头鸟，地上湖北佬。";
                break;
            case "湖南省": posdesc = "74751，长沙斯塔克"; break;
            case "广东省":
                if (city === "广州市") posdesc = "看小蛮腰，喝早茶了嘛~";
                else if (city === "深圳市") posdesc = "今天你逛商场了嘛~";
                else if (city === "阳江市") posdesc = "阳春合水！博主家乡~ 欢迎来玩~";
                else posdesc = "来两斤福建人~";
                break;
            case "广西壮族自治区": posdesc = "桂林山水甲天下"; break;
            case "海南省": posdesc = "朝观日出逐白浪，夕看云起收霞光"; break;
            case "四川省": posdesc = "康康川妹子"; break;
            case "贵州省": posdesc = "茅台，学生，再塞200"; break;
            case "云南省": posdesc = "玉龙飞舞云缠绕，万仞冰川直耸天"; break;
            case "西藏自治区": posdesc = "躺在茫茫草原上，仰望蓝天"; break;
            case "陕西省": posdesc = "来份臊子面加馍"; break;
            case "甘肃省": posdesc = "羌笛何须怨杨柳，春风不度玉门关"; break;
            case "青海省": posdesc = "牛肉干和老酸奶都好好吃"; break;
            case "宁夏回族自治区": posdesc = "大漠孤烟直，长河落日圆"; break;
            case "新疆维吾尔自治区": posdesc = "驼铃古道丝绸路，胡马犹闻唐汉风"; break;
            case "台湾省": posdesc = "我在这头，大陆在那头"; break;
            case "香港特别行政区": posdesc = "永定贼有残留地鬼嚎，迎击光非岁玉"; break;
            case "澳门特别行政区": posdesc = "性感荷官，在线发牌"; break;
            case "重庆市": posdesc = "勒是雾都"; break;
        }
        return posdesc;
    }

    function jsonp(url: string, callbackName: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            const name = `jsonp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            script.src = `${url}&callback=${name}`;
            script.async = true;
            
            (window as any)[name] = (data: any) => {
                document.body.removeChild(script);
                delete (window as any)[name];
                resolve(data);
            };
            
            script.onerror = () => {
                document.body.removeChild(script);
                delete (window as any)[name];
                reject(new Error('JSONP request failed'));
            };
            
            document.body.appendChild(script);
        });
    }

    async function saveManualLocation() {
        if (!tempAddress.trim()) {
            isEditing = false;
            return;
        }

        loading = true;
        try {
            // Forward Geocoding to get coords for the manual address
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(tempAddress)}&format=json&limit=1&accept-language=zh-CN`,
                { headers: { "User-Agent": "FuwariBlog/1.0" } }
            );
            const data = await res.json();
            
            if (data && data.length > 0) {
                const manualLoc = {
                    name: toSimplified(tempAddress), // User input name
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon)
                };
                localStorage.setItem("manual_location_v1", JSON.stringify(manualLoc));
                isEditing = false;
                fetchInfo(); // Reload with new location
            } else {
                alert("找不到这个地址，请尝试输入更详细的地址（如：云南省普洱市）");
                isEditing = false;
                loading = false;
            }
        } catch (e) {
            console.error("Geocoding failed", e);
            alert("地址解析失败，请稍后重试");
            isEditing = false;
            loading = false;
        }
    }

    function startEditing() {
        tempAddress = weatherData.address;
        isEditing = true;
        // Focus will be handled by Svelte action or simple timeout if needed, 
        // but simple toggle is enough for now.
    }

    async function fetchInfo() {
    try {
        loading = true;

        // Force clear cache every time to ensure fresh location check
        localStorage.removeItem("weather_data_cache_v5");
        
        // 1. Get Location
        let lat, lon;
        let address = "未知位置";
        let detailedAddress = "";
        let isManual = false;
        let poeticGreeting = "";

        // Check for manual location first
        const manualLocStr = localStorage.getItem("manual_location_v1");
        if (manualLocStr) {
            try {
                const manualLoc = JSON.parse(manualLocStr);
                lat = manualLoc.lat;
                lon = manualLoc.lon;
                address = manualLoc.name;
                detailedAddress = manualLoc.name;
                isManual = true;
            } catch (e) {
                console.error("Invalid manual location", e);
                localStorage.removeItem("manual_location_v1");
            }
        }

        if (!isManual) {
            // Priority 1: Tencent Map API (via JSONP)
            try {
                // Using the key found in Ylanw's public repo
                const tencentRes = await jsonp(
                    "https://apis.map.qq.com/ws/location/v1/ip?key=V5FBZ-MICEU-SH2VE-4433X-XLJL7-A7BUY&output=jsonp",
                    "callback" // Tencent uses 'callback' param by default for JSONP wrapping
                );
                
                if (tencentRes && tencentRes.status === 0) {
                    lat = tencentRes.result.location.lat;
                    lon = tencentRes.result.location.lng;
                    
                    const adInfo = tencentRes.result.ad_info;
                    address = adInfo.city || adInfo.province;
                    detailedAddress = `${adInfo.province} ${adInfo.city} ${adInfo.district}`.trim();
                    poeticGreeting = getPoeticGreeting(adInfo.province, adInfo.city);
                } else {
                    throw new Error("Tencent API returned error status");
                }
            } catch (e) {
                console.warn("Tencent API failed, trying fallbacks...", e);
                
                // IP Geolocation fallback
                try {
                    // Strategy: Race multiple free IP APIs to get the fastest result
                    // api.ip.sb is usually accurate for coords
                    const geoRes = await fetch("https://api.ip.sb/geoip", {
                        referrerPolicy: "no-referrer"
                    });
                    const geoData = await geoRes.json();
                    lat = geoData.latitude;
                    lon = geoData.longitude;
                } catch (e2) {
                    console.warn("Primary geo API failed, trying fallback...");
                    try {
                        // Fallback: ipapi.co
                        const geoRes = await fetch("https://ipapi.co/json/");
                        const geoData = await geoRes.json();
                        lat = geoData.latitude;
                        lon = geoData.longitude;
                    } catch (e3) {
                        console.error("All geo APIs failed");
                    }
                }
            }
        }

        if (!lat || !lon) {
            throw new Error("无法获取位置信息");
        }

        // 2. Get Address Name (Reverse Geocoding) - Only if not manual AND address not set by Tencent
        if (!isManual && address === "未知位置") {
            try {
                // Priority 1: OpenStreetMap (High detail)
                const addressRes = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=zh-CN`,
                    { headers: { "User-Agent": "FuwariBlog/1.0" } }
                );
                if (addressRes.ok) {
                    const addressData = await addressRes.json();
                    address = addressData.address.city || addressData.address.state || addressData.address.country || address;
                    detailedAddress = `${addressData.address.state || ''} ${addressData.address.city || ''} ${addressData.address.district || ''}`.trim();
                } else {
                    throw new Error("OSM failed");
                }
            } catch (e) {
                console.warn("OSM failed, trying BigDataCloud...");
                try {
                    // Priority 2: BigDataCloud (Good fallback with language support)
                    const bdcRes = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`
                    );
                    const bdcData = await bdcRes.json();
                    address = bdcData.city || bdcData.principalSubdivision || bdcData.countryName;
                    detailedAddress = `${bdcData.principalSubdivision || ''} ${bdcData.city || ''} ${bdcData.locality || ''}`.trim();
                } catch (e2) {
                    console.warn("BigDataCloud failed");
                }
            }
        }

        // Clean up address (remove duplicates like "Shanghai Shanghai")
        if (detailedAddress) {
            const parts = detailedAddress.split(' ');
            const uniqueParts = [...new Set(parts)];
            detailedAddress = uniqueParts.join(' ');
        }
        if (!detailedAddress) detailedAddress = address;

        // Convert to Simplified Chinese
        detailedAddress = toSimplified(detailedAddress);
        address = toSimplified(address);

        // 3. Get Weather (OpenMeteo)
        const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
        );
        const weatherJson = await weatherRes.json();
        
        // 4. Get Hitokoto (Poem)
        let hitokoto = "今天也是充满希望的一天";
        try {
            const hitokotoRes = await fetch("https://v1.hitokoto.cn/?c=i"); // c=i is for poetry
            if (hitokotoRes.ok) {
                const hitokotoJson = await hitokotoRes.json();
                hitokoto = hitokotoJson.hitokoto;
            }
        } catch (e) {
            console.warn("Hitokoto API failed");
        }

        // 5. Calculate Distance
        const dist = getDistance(lat, lon, OWNER_LOCATION.lat, OWNER_LOCATION.lon);

        weatherData = {
            temp: Math.round(weatherJson.current.temperature_2m),
            weatherCode: weatherJson.current.weather_code,
            address: detailedAddress || address,
            distance: dist,
            hitokoto: hitokoto,
            poeticGreeting: poeticGreeting
        };

        // Save to cache (v4)
        localStorage.setItem("weather_data_cache_v4", JSON.stringify({
            data: weatherData,
            timestamp: Date.now()
        }));

    } catch (e) {
        console.error(e);
        error = "获取天气信息失败";
    } finally {
        loading = false;
    }
}

onMount(() => {
    fetchInfo();
});
</script>

<div class={`card-base p-4 w-full h-full min-h-[160px] flex flex-col justify-between text-sm ${className}`} {style}>
    {#if loading}
        <div class="animate-pulse flex flex-col gap-3 h-full justify-center">
            <div class="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            <div class="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            <div class="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded"></div>
        </div>
    {:else if error}
        <div class="flex items-center justify-center h-full text-neutral-400">
            <Icon icon="material-symbols:error-outline" class="text-2xl mr-2" />
            {error}
        </div>
    {:else}
        <!-- Greeting -->
        <div class="flex items-start gap-2">
            <div class="font-bold text-neutral-900 dark:text-neutral-100 leading-relaxed">
                欢迎来自 
                {#if isEditing}
                    <input 
                        type="text" 
                        bind:value={tempAddress} 
                        on:keydown={(e) => e.key === 'Enter' && saveManualLocation()}
                        on:blur={saveManualLocation}
                        class="bg-white dark:bg-neutral-800 border border-[var(--primary)] rounded px-1 w-32 outline-none"
                        autofocus
                    />
                {:else}
                    <span 
                        class="text-[var(--primary)] cursor-pointer hover:underline decoration-dashed underline-offset-4" 
                        title="点击修改位置"
                        on:click={startEditing}
                    >
                        {weatherData.address}
                    </span>
                {/if}
                的小伙伴，{getGreeting()}！
                {#if weatherData.poeticGreeting}
                    <span class="block mt-1 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                        {weatherData.poeticGreeting}
                    </span>
                {/if}
            </div>
        </div>

        <!-- Distance & Poem -->
        <div class="text-neutral-500 dark:text-neutral-400 leading-relaxed mt-2">
            你距离 <span class="font-bold text-neutral-800 dark:text-neutral-200">{OWNER_LOCATION.name}</span> 约有 <span class="font-bold text-[var(--primary)]">{weatherData.distance}</span> 公里，{weatherData.hitokoto}
        </div>

        <!-- Weather Status -->
        <div class="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <div class="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                <Icon icon={getWeatherIcon(weatherData.weatherCode, new Date().getHours() >= 18 || new Date().getHours() < 6)} class="text-xl" />
                <span>{getWeatherDesc(weatherData.weatherCode)}</span>
            </div>
            <div class="font-bold text-lg text-neutral-800 dark:text-neutral-100">
                {weatherData.temp}°C
            </div>
        </div>
    {/if}
</div>

<style>
    .card-base {
        border-radius: var(--radius-large);
        background-color: var(--card-bg);
    }
</style>
