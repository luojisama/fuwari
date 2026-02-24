// Geocoding utility using OpenStreetMap Nominatim API
// This is primarily for build-time resolution of city coordinates.
// Nominatim Usage Policy: https://operations.osmfoundation.org/policies/nominatim/
// - No heavy uses (an absolute maximum of 1 request per second).
// - Provide a valid HTTP Referer or User-Agent identifying the application.

import { CITY_COORDINATES } from "./city-coordinates";

export async function getCityCoordinates(
	cityName: string,
): Promise<{ lat: number; lng: number } | null> {
	// 1. Check local cache (hardcoded list) first
	if (CITY_COORDINATES[cityName]) {
		return CITY_COORDINATES[cityName];
	}

	// Try without "City" suffix if present
	const cleanName = cityName.replace(/市$/, "");
	if (CITY_COORDINATES[cleanName]) {
		return CITY_COORDINATES[cleanName];
	}

	// 2. Fetch from Nominatim API if not found
	try {
		console.log(`Fetching coordinates for: ${cityName}`);
		// Add a small delay to be polite to the API if calling multiple times in a loop
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Use Photon Komoot API as an alternative to Nominatim (often faster/more reliable for simple queries)
		// https://photon.komoot.io/
		const response = await fetch(
			`https://photon.komoot.io/api/?q=${encodeURIComponent(cityName)}&limit=1`,
			{
				headers: {
					"User-Agent": "FuwariBlog-TravelMap/1.0",
				},
			},
		);

		if (!response.ok) {
			console.error(
				`Failed to fetch coordinates for ${cityName}: ${response.statusText}`,
			);
			return null;
		}

		const data = await response.json();
		if (data?.features && data.features.length > 0) {
			const coords = data.features[0].geometry.coordinates;
			const result = {
				lat: coords[1], // Photon returns [lon, lat]
				lng: coords[0],
			};
			console.log(`Resolved ${cityName} to`, result);
			return result;
		}
	} catch (error) {
		console.error(`Error fetching coordinates for ${cityName}:`, error);

		// Fallback to Nominatim if Photon fails
		try {
			console.log(`Falling back to Nominatim for: ${cityName}`);
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`,
				{
					headers: {
						"User-Agent": "FuwariBlog-TravelMap/1.0",
					},
				},
			);
			if (response.ok) {
				const data = await response.json();
				if (data && data.length > 0) {
					const result = {
						lat: Number.parseFloat(data[0].lat),
						lng: Number.parseFloat(data[0].lon),
					};
					console.log(`Resolved ${cityName} to`, result);
					return result;
				}
			}
		} catch (e) {
			console.error(`Fallback failed for ${cityName}:`, e);
		}
	}

	return null;
}
