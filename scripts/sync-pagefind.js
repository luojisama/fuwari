import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceDir = path.resolve(root, "dist", "client", "pagefind");
const staticDir = path.resolve(root, ".vercel", "output", "static");
const targetDir = path.join(staticDir, "pagefind");
const requiredFiles = ["pagefind.js", "pagefind-entry.json"];

function assertDirectory(directory, label) {
	if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
		throw new Error(
			`[sync-pagefind] ${label} directory is missing: ${directory}`,
		);
	}
}

function assertFiles(directory, label) {
	for (const filename of requiredFiles) {
		const file = path.join(directory, filename);
		if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
			throw new Error(`[sync-pagefind] ${label} file is missing: ${file}`);
		}
		if (fs.statSync(file).size === 0) {
			throw new Error(`[sync-pagefind] ${label} file is empty: ${file}`);
		}
	}
}

try {
	assertDirectory(sourceDir, "source Pagefind");
	assertFiles(sourceDir, "source Pagefind");
	assertDirectory(staticDir, "Vercel static output");

	fs.rmSync(targetDir, { recursive: true, force: true });
	fs.cpSync(sourceDir, targetDir, { recursive: true });
	assertFiles(targetDir, "copied Pagefind");

	console.log(`[sync-pagefind] Copied ${sourceDir} -> ${targetDir}`);
} catch (error) {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
}
