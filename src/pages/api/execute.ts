import type { APIRoute } from "astro";
import {
	type CanonicalRunLanguage,
	type ExecuteResponse,
	normalizeExecutableCode,
	normalizeRunLanguage,
} from "../../utils/code-runner";

export const prerender = false;

type WandboxCompiler = {
	name: string;
	version: string;
	language: string;
};

type WandboxResult = {
	status?: string | number;
	signal?: string;
	compiler_output?: string;
	compiler_error?: string;
	compiler_message?: string;
	program_output?: string;
	program_error?: string;
	program_message?: string;
};

const CACHE_TTL = 1000 * 60 * 60 * 24;
const MAX_CODE_LENGTH = 20_000;
const MAX_STDIN_LENGTH = 5_000;
const MAX_OUTPUT_LENGTH = 12_000;
const EXECUTION_TIMEOUT_MS = 15_000;
const REQUEST_WINDOW_MS = 60_000;
const REQUEST_LIMIT = 20;
const WANDBOX_API_BASE = (
	import.meta.env.WANDBOX_API_BASE || "https://wandbox.org/api"
).replace(/\/$/, "");
const JSON_HEADERS = {
	"Content-Type": "application/json",
	"Cache-Control": "no-store",
};

const FALLBACK_COMPILERS: WandboxCompiler[] = [
	{ name: "cpython-3.12.7", version: "3.12.7", language: "Python" },
	{ name: "openjdk-jdk-22+36", version: "jdk-22+36", language: "Java" },
	{ name: "mono-6.12.0.199", version: "6.12.0.199", language: "C#" },
];

const PREFERRED_COMPILERS: Record<CanonicalRunLanguage, string[]> = {
	python: [
		"cpython-3.12.7",
		"cpython-3.13.8",
		"cpython-3.11.10",
		"cpython-3.10.15",
	],
	java: ["openjdk-jdk-22+36", "openjdk-jdk-21+35"],
	csharp: ["mono-6.12.0.199", "mono-5.20.1.34"],
};

let compilerCache: WandboxCompiler[] | null = null;
let lastCompilerFetchTime = 0;
const requestBuckets = new Map<string, { count: number; resetAt: number }>();

function json(status: number, payload: ExecuteResponse) {
	return new Response(JSON.stringify(payload), {
		status,
		headers: JSON_HEADERS,
	});
}

function truncateOutput(value: string): string {
	if (value.length <= MAX_OUTPUT_LENGTH) return value;
	return `${value.slice(0, MAX_OUTPUT_LENGTH)}\n... output truncated ...`;
}

function errorPayload(
	error: string,
	language: CanonicalRunLanguage | null = null,
	version: string | null = null,
): ExecuteResponse {
	const message = truncateOutput(error);
	return {
		ok: false,
		language,
		version,
		output: message,
		stdout: "",
		stderr: message,
		exitCode: null,
		signal: null,
		error: message,
	};
}

function getClientId(request: Request): string {
	return (
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		request.headers.get("x-real-ip") ||
		"local"
	);
}

function checkRateLimit(request: Request): boolean {
	const now = Date.now();
	for (const [clientId, bucket] of requestBuckets) {
		if (bucket.resetAt <= now) requestBuckets.delete(clientId);
	}

	const clientId = getClientId(request);
	const bucket = requestBuckets.get(clientId);

	if (!bucket || bucket.resetAt <= now) {
		requestBuckets.set(clientId, {
			count: 1,
			resetAt: now + REQUEST_WINDOW_MS,
		});
		return true;
	}

	if (bucket.count >= REQUEST_LIMIT) return false;
	bucket.count++;
	return true;
}

async function fetchWithTimeout(
	input: RequestInfo | URL,
	init: RequestInit,
	timeoutMs: number,
) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	try {
		return await fetch(input, {
			...init,
			signal: controller.signal,
		});
	} finally {
		clearTimeout(timeout);
	}
}

async function getCompilers(): Promise<WandboxCompiler[]> {
	const now = Date.now();
	if (compilerCache && now - lastCompilerFetchTime < CACHE_TTL) {
		return compilerCache;
	}

	try {
		const response = await fetchWithTimeout(
			`${WANDBOX_API_BASE}/list.json`,
			{ method: "GET" },
			EXECUTION_TIMEOUT_MS,
		);
		if (!response.ok) throw new Error(response.statusText);

		const data = (await response.json()) as unknown;
		if (!Array.isArray(data)) throw new Error("Invalid compiler list");

		compilerCache = data as WandboxCompiler[];
		lastCompilerFetchTime = now;
		return compilerCache;
	} catch (_error) {
		return compilerCache || FALLBACK_COMPILERS;
	}
}

function findCompiler(
	language: CanonicalRunLanguage,
	compilers: WandboxCompiler[],
): WandboxCompiler | null {
	for (const name of PREFERRED_COMPILERS[language]) {
		const compiler = compilers.find((item) => item.name === name);
		if (compiler) return compiler;
	}

	const languageName =
		language === "csharp" ? "c#" : language === "java" ? "java" : "python";

	return (
		compilers.find((compiler) => {
			if (compiler.language.toLowerCase() !== languageName) return false;
			if (language === "csharp") return compiler.name.startsWith("mono-");
			if (language === "python") return compiler.name.startsWith("cpython-3.");
			return true;
		}) ?? null
	);
}

function stringifyResultValue(value: unknown): string {
	return typeof value === "string" ? value : "";
}

function parseStatus(status: unknown): number | null {
	if (typeof status === "number") return status;
	if (typeof status === "string" && status.trim()) {
		const value = Number.parseInt(status, 10);
		return Number.isNaN(value) ? null : value;
	}
	return null;
}

function toExecuteResponse(
	result: WandboxResult,
	language: CanonicalRunLanguage,
	compiler: WandboxCompiler,
	serviceOk: boolean,
): ExecuteResponse {
	const status = parseStatus(result.status);
	const signal = stringifyResultValue(result.signal) || null;
	const stdout = stringifyResultValue(result.program_output);
	const stderr = [result.compiler_error, result.program_error]
		.map(stringifyResultValue)
		.filter(Boolean)
		.join("\n");
	const output =
		[result.compiler_message, result.program_message]
			.map(stringifyResultValue)
			.filter(Boolean)
			.join("\n") ||
		stdout ||
		stderr;
	const ok = serviceOk && status === 0 && !signal;
	const version = compiler.version || compiler.name;

	return {
		ok,
		language,
		version,
		output: truncateOutput(output),
		stdout: truncateOutput(stdout),
		stderr: truncateOutput(stderr),
		exitCode: status,
		signal,
		error: ok ? undefined : truncateOutput(output || "Execution failed."),
	};
}

function getWandboxOptions(language: CanonicalRunLanguage) {
	if (language === "java") {
		return {
			"compiler-option-raw": "-encoding\nUTF-8",
			"runtime-option-raw": "-Dfile.encoding=UTF-8",
		};
	}

	return {
		"compiler-option-raw": "",
		"runtime-option-raw": "",
	};
}

export const POST: APIRoute = async ({ request }) => {
	if (!checkRateLimit(request)) {
		return json(
			429,
			errorPayload(
				"Too many execution requests. Please wait a minute and try again.",
			),
		);
	}

	const body = (await request.json().catch(() => null)) as {
		code?: unknown;
		language?: unknown;
		stdin?: unknown;
	} | null;

	if (!body || typeof body.code !== "string" || !body.language) {
		return json(400, errorPayload("Code and language are required."));
	}

	const language = normalizeRunLanguage(body.language);
	if (!language) {
		return json(
			400,
			errorPayload(`Unsupported language: ${String(body.language)}`),
		);
	}

	const stdin = typeof body.stdin === "string" ? body.stdin : "";
	if (body.code.length > MAX_CODE_LENGTH) {
		return json(
			413,
			errorPayload(
				`Code is too long. Limit is ${MAX_CODE_LENGTH} characters.`,
				language,
			),
		);
	}
	if (stdin.length > MAX_STDIN_LENGTH) {
		return json(
			413,
			errorPayload(
				`Input is too long. Limit is ${MAX_STDIN_LENGTH} characters.`,
				language,
			),
		);
	}

	const normalized = normalizeExecutableCode(body.code, language);
	if (!normalized) {
		return json(400, errorPayload("Unsupported language.", language));
	}

	const compiler = findCompiler(normalized.language, await getCompilers());
	if (!compiler) {
		return json(
			400,
			errorPayload(`Compiler not available: ${normalized.language}`, language),
		);
	}

	const options = getWandboxOptions(normalized.language);

	try {
		const response = await fetchWithTimeout(
			`${WANDBOX_API_BASE}/compile.json`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					compiler: compiler.name,
					code: normalized.code,
					stdin: stdin || "\n\n\n\n\n",
					save: false,
					...options,
				}),
			},
			EXECUTION_TIMEOUT_MS,
		);
		const result = (await response.json().catch(() => ({
			program_message: response.statusText,
			status: response.status,
		}))) as WandboxResult;
		const payload = toExecuteResponse(
			result,
			normalized.language,
			compiler,
			response.ok,
		);

		return json(response.ok ? 200 : response.status, payload);
	} catch (error) {
		const message =
			error instanceof DOMException && error.name === "AbortError"
				? "Execution service timed out."
				: "Execution service is unavailable.";
		return json(504, errorPayload(message, language));
	}
};
