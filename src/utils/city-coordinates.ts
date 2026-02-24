// Lat/Lng mapping for cities mentioned in the travel plan
// This object acts as a CACHE to speed up build times and avoid hitting API rate limits.
// You do NOT need to manually add coordinates here for new cities.
// Just add new cities to 'EXTRA_CITIES' below or your travel.md file, and the system will fetch coordinates automatically.
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
	上海: { lat: 31.2304, lng: 121.4737 },
	广州: { lat: 23.1291, lng: 113.2644 },
	长沙: { lat: 28.2282, lng: 112.9388 },
	杭州: { lat: 30.2741, lng: 120.1551 },
	南京: { lat: 32.0603, lng: 118.7969 },
	武汉: { lat: 30.5928, lng: 114.3055 },
	昆明: { lat: 24.8801, lng: 102.8329 },
	普洱: { lat: 22.777, lng: 100.9709 },
	桂林: { lat: 25.2345, lng: 110.18 },
	湛江: { lat: 21.2707, lng: 110.3594 },
	佛山: { lat: 23.0215, lng: 113.1214 },
};

// List of cities to display on the map that are not in the travel markdown.
// Just add the city name here (e.g., "Chengdu"), and coordinates will be automatically fetched during build.
export const EXTRA_CITIES: string[] = ["绍兴", "湘潭"];
