export type SupportedRunLanguage = "java" | "python" | "py" | "csharp" | "cs";
export type CanonicalRunLanguage = "java" | "python" | "csharp";

export interface ExecuteRequest {
	code: string;
	language: SupportedRunLanguage;
	stdin?: string;
}

export interface ExecuteResponse {
	ok: boolean;
	language: CanonicalRunLanguage | null;
	version: string | null;
	output: string;
	stdout: string;
	stderr: string;
	exitCode: number | null;
	signal: string | null;
	error?: string;
}

export interface NormalizedExecutableCode {
	code: string;
	language: CanonicalRunLanguage;
	fileName: string;
}

const JAVA_UTF8_STDOUT =
	"System.setOut(new java.io.PrintStream(System.out, true, java.nio.charset.StandardCharsets.UTF_8));";
const CSHARP_UTF8_STDOUT =
	"Console.OutputEncoding = System.Text.Encoding.UTF8;";

export function normalizeRunLanguage(
	language: unknown,
): CanonicalRunLanguage | null {
	if (typeof language !== "string") return null;
	const normalized = language.trim().toLowerCase();
	if (normalized === "python" || normalized === "py") return "python";
	if (normalized === "java") return "java";
	if (normalized === "csharp" || normalized === "cs") return "csharp";
	return null;
}

function splitJavaImports(code: string) {
	const imports: string[] = [];
	const body: string[] = [];

	for (const line of code.split("\n")) {
		const trimmed = line.trim();
		if (trimmed.startsWith("package ")) {
			const semicolonIndex = line.indexOf(";");
			if (semicolonIndex >= 0) {
				const rest = line.slice(semicolonIndex + 1).trimStart();
				if (rest) body.push(rest);
			}
			continue;
		}
		if (trimmed.startsWith("import ")) {
			const semicolonIndex = line.indexOf(";");
			if (semicolonIndex >= 0) {
				imports.push(line.slice(0, semicolonIndex + 1));
				const rest = line.slice(semicolonIndex + 1).trimStart();
				if (rest) body.push(rest);
			} else {
				imports.push(line);
			}
		} else {
			body.push(line);
		}
	}

	return {
		imports: imports.join("\n"),
		body: body.join("\n").trim(),
	};
}

function demoteJavaPublicTypes(code: string): string {
	return code.replace(
		/\bpublic\s+(?=(?:abstract\s+|final\s+)?(?:class|interface|enum)\s+\w+)/g,
		"",
	);
}

function indentBlock(code: string, indent: string): string {
	return code
		.split("\n")
		.map((line) => (line ? `${indent}${line}` : ""))
		.join("\n");
}

function countJavaBraces(line: string): number {
	return (line.match(/{/g) ?? []).length - (line.match(/}/g) ?? []).length;
}

function splitJavaTypesAndStatements(code: string) {
	const typeLines: string[] = [];
	const statementLines: string[] = [];
	let inType = false;
	let depth = 0;

	for (const line of code.split("\n")) {
		const trimmed = line.trim();
		const startsType =
			/^(?:public\s+)?(?:abstract\s+|final\s+)?(?:class|interface|enum)\s+\w+/.test(
				trimmed,
			);

		if (!inType && startsType) {
			inType = true;
			typeLines.push(line);
			depth = countJavaBraces(line);
			if (depth <= 0) inType = false;
			continue;
		}

		if (inType) {
			typeLines.push(line);
			depth += countJavaBraces(line);
			if (depth <= 0) inType = false;
			continue;
		}

		statementLines.push(line);
	}

	return {
		typeCode: typeLines.join("\n").trim(),
		statementCode: statementLines.join("\n").trim(),
	};
}

function normalizeJavaCode(code: string): NormalizedExecutableCode {
	const { imports, body } = splitJavaImports(code);
	const hasMain = /\bstatic\s+void\s+main\s*\(/.test(body);
	const hasTopLevelType = /\b(class|interface|enum)\s+\w+/.test(body);
	const prefix = imports ? `${imports}\n\n` : "";

	if (hasMain) {
		return {
			code: `${prefix}${demoteJavaPublicTypes(body)}`,
			language: "java",
			fileName: "Main.java",
		};
	}

	if (hasTopLevelType) {
		const { typeCode, statementCode } = splitJavaTypesAndStatements(body);
		return {
			code: `${prefix}${demoteJavaPublicTypes(typeCode)}\n\nclass Main {\n\tpublic static void main(String[] args) {\n\t\t${JAVA_UTF8_STDOUT}\n${indentBlock(statementCode, "\t\t")}\n\t}\n}`,
			language: "java",
			fileName: "Main.java",
		};
	}

	return {
		code: `${prefix}class Main {\n\tpublic static void main(String[] args) {\n\t\t${JAVA_UTF8_STDOUT}\n${indentBlock(body, "\t\t")}\n\t}\n}`,
		language: "java",
		fileName: "Main.java",
	};
}

function splitCSharpUsings(code: string) {
	const usings = new Set<string>();
	const body: string[] = [];

	for (const line of code.split("\n")) {
		const trimmed = line.trim();
		if (/^using\s+[\w.]+\s*;/.test(trimmed)) {
			usings.add(trimmed);
		} else {
			body.push(line);
		}
	}

	usings.add("using System;");
	return {
		usings: Array.from(usings).join("\n"),
		body: body.join("\n").trim(),
	};
}

function countCSharpBraces(line: string): number {
	return (line.match(/{/g) ?? []).length - (line.match(/}/g) ?? []).length;
}

function splitCSharpTypesAndStatements(code: string) {
	const typeLines: string[] = [];
	const statementLines: string[] = [];
	let inType = false;
	let depth = 0;

	for (const line of code.split("\n")) {
		const trimmed = line.trim();
		const startsType =
			/^(?:(?:public|internal|private|protected|abstract|sealed|static|partial)\s+)*(?:namespace|class|struct|interface|enum|record)\s+\w+/.test(
				trimmed,
			);

		if (!inType && startsType) {
			inType = true;
			typeLines.push(line);
			depth = countCSharpBraces(line);
			if (depth <= 0) inType = false;
			continue;
		}

		if (inType) {
			typeLines.push(line);
			depth += countCSharpBraces(line);
			if (depth <= 0) inType = false;
			continue;
		}

		statementLines.push(line);
	}

	return {
		typeCode: typeLines.join("\n").trim(),
		statementCode: statementLines.join("\n").trim(),
	};
}

function normalizeCSharpCode(code: string): NormalizedExecutableCode {
	const { usings, body } = splitCSharpUsings(code);
	const hasMain = /\b(?:static\s+)?(?:void|int|Task)\s+Main\s*\(/.test(body);
	const hasTypeOrNamespace =
		/\b(namespace|class|struct|interface|enum|record)\s+\w+/.test(body);

	if (hasMain) {
		return {
			code: `${usings}\n${body}`,
			language: "csharp",
			fileName: "Program.cs",
		};
	}

	if (hasTypeOrNamespace) {
		const { typeCode, statementCode } = splitCSharpTypesAndStatements(body);
		return {
			code: `${usings}\n\n${typeCode}\n\npublic class __Runner {\n\tpublic static void Main(string[] args) {\n\t\t${CSHARP_UTF8_STDOUT}\n${indentBlock(statementCode, "\t\t")}\n\t}\n}`,
			language: "csharp",
			fileName: "Program.cs",
		};
	}

	return {
		code: `${usings}\n\npublic class Program {\n\tpublic static void Main(string[] args) {\n\t\t${CSHARP_UTF8_STDOUT}\n${indentBlock(body, "\t\t")}\n\t}\n}`,
		language: "csharp",
		fileName: "Program.cs",
	};
}

export function normalizeExecutableCode(
	code: string,
	language: unknown,
): NormalizedExecutableCode | null {
	const normalizedLanguage = normalizeRunLanguage(language);
	if (!normalizedLanguage) return null;

	const normalizedCode = code.replace(/\r\n?/g, "\n").trim();
	if (normalizedLanguage === "java") return normalizeJavaCode(normalizedCode);
	if (normalizedLanguage === "csharp") {
		return normalizeCSharpCode(normalizedCode);
	}

	return {
		code: normalizedCode,
		language: "python",
		fileName: "main.py",
	};
}
