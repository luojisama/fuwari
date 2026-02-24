// src/utils/travel-parser.ts
import fs from "node:fs";
import path from "node:path";

export interface TravelEntry {
	date: string;
	city: string;
	event: string;
	status: string;
}

export function parseTravelMarkdown(content: string): TravelEntry[] {
	const lines = content.split("\n");
	const tableStart = lines.findIndex((line) =>
		line.trim().startsWith("| 时间"),
	);

	if (tableStart === -1) {
		return [];
	}

	// Skip header and separator (lines[tableStart] and lines[tableStart + 1])
	const dataRows = lines.slice(tableStart + 2);

	const entries: TravelEntry[] = [];

	for (const row of dataRows) {
		if (!row.trim().startsWith("|")) {
			break; // End of table
		}

		const cols = row
			.split("|")
			.map((c) => c.trim())
			.filter((c) => c !== "");
		if (cols.length >= 4) {
			entries.push({
				date: cols[0],
				city: cols[1],
				event: cols[2],
				status: cols[3],
			});
		}
	}

	return entries;
}
