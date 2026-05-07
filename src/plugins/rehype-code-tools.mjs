import { h } from "hastscript";
import { visit } from "unist-util-visit";

const RUN_LANGS = new Set(["java", "python", "py", "csharp", "cs"]);

const LANG_LABELS = {
	java: "Java",
	python: "Python",
	py: "Python",
	csharp: "C#",
	cs: "C#",
};

function getClassName(properties = {}) {
	const className = properties.className ?? properties.class ?? "";
	return Array.isArray(className) ? className.join(" ") : String(className);
}

function getLanguage(node) {
	const properties = node.properties ?? {};
	if (typeof properties.dataLanguage === "string")
		return properties.dataLanguage;
	if (typeof properties["data-language"] === "string") {
		return properties["data-language"];
	}

	const preClass = getClassName(properties);
	const preMatch = preClass.match(/language-([\w-]+)/);
	if (preMatch) return preMatch[1];

	const code = node.children?.find(
		(child) => child.type === "element" && child.tagName === "code",
	);
	const codeClass = getClassName(code?.properties);
	const codeMatch = codeClass.match(/language-([\w-]+)/);
	return codeMatch?.[1] ?? "";
}

function getText(node) {
	if (!node) return "";
	if (node.type === "text") return node.value;
	if (!Array.isArray(node.children)) return "";
	return node.children.map((child) => getText(child)).join("");
}

function isInputSnippet(language, code) {
	const normalized = language.toLowerCase();
	if (normalized === "python" || normalized === "py") {
		return /\binput\s*\(/.test(code);
	}
	if (normalized === "java") {
		return /\bScanner\b|System\.in/.test(code);
	}
	if (normalized === "csharp" || normalized === "cs") {
		return /\bConsole\.Read(Line|Key)\s*\(/.test(code);
	}
	return false;
}

function icon(paths) {
	return h(
		"svg",
		{
			viewBox: "0 -960 960 960",
			width: "18",
			height: "18",
			"aria-hidden": "true",
			fill: "currentColor",
		},
		paths.map((d) => h("path", { d })),
	);
}

function toolButton(action, title, iconPaths) {
	return h(
		"button",
		{
			type: "button",
			class: `code-tool-btn code-tool-${action}`,
			title,
			"aria-label": title,
			"data-run-action": action,
		},
		[icon(iconPaths)],
	);
}

function stdinSubmitButton() {
	return h(
		"button",
		{
			type: "button",
			class: "code-tool-btn code-tool-run code-stdin-submit",
			title: "Submit input",
			"aria-label": "Submit input",
			"data-run-action": "submit-input",
		},
		[
			icon([
				"M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Z",
			]),
		],
	);
}

function createToolbar(language, canRun) {
	const buttons = [
		toolButton("copy", "Copy code", [
			"M368.37-237.37q-34.48 0-58.74-24.26-24.26-24.26-24.26-58.74v-474.26q0-34.48 24.26-58.74 24.26-24.26 58.74-24.26h378.26q34.48 0 58.74 24.26 24.26 24.26 24.26 58.74v474.26q0 34.48-24.26 58.74-24.26 24.26-58.74 24.26H368.37Zm0-83h378.26v-474.26H368.37v474.26Zm-155 238q-34.48 0-58.74-24.26-24.26-24.26-24.26-58.74v-515.76q0-17.45 11.96-29.48 11.97-12.02 29.33-12.02t29.54 12.02q12.17 12.03 12.17 29.48v515.76h419.76q17.45 0 29.48 11.96 12.02 11.97 12.02 29.33t-12.02 29.54q-12.03 12.17-29.48 12.17H213.37Z",
		]),
	];

	if (canRun) {
		buttons.unshift(
			toolButton("run", "Run code", ["M320-200v-560l440 280-440 280Z"]),
			toolButton("edit", "Edit code", [
				"M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 17l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Z",
			]),
			toolButton("stdin", "Input", [
				"M160-200q-33 0-56.5-23.5T80-280v-400q0-33 23.5-56.5T160-760h640q33 0 56.5 23.5T880-680v400q0 33-23.5 56.5T800-200H160Zm0-80h640v-400H160v400Zm80-80h80v-80h-80v80Zm120 0h80v-80h-80v80Zm120 0h80v-80h-80v80Zm120 0h120v-80H600v80ZM240-520h80v-80h-80v80Zm120 0h80v-80h-80v80Zm120 0h80v-80h-80v80Zm120 0h120v-80H600v80Z",
			]),
		);
	}

	return h(
		"div",
		{
			class: "code-block-toolbar",
			"data-pagefind-ignore": "true",
		},
		[
			language
				? h(
						"span",
						{ class: "code-block-language" },
						LANG_LABELS[language] ?? language,
					)
				: null,
			...buttons,
		].filter(Boolean),
	);
}

export function rehypeCodeTools() {
	return (tree) => {
		visit(tree, "element", (node, index, parent) => {
			if (
				node.tagName !== "pre" ||
				typeof index !== "number" ||
				!parent ||
				(parent.tagName === "div" &&
					getClassName(parent.properties).includes("code-block"))
			) {
				return;
			}

			const language = getLanguage(node).toLowerCase();
			const canRun = RUN_LANGS.has(language);
			const code = getText(node);
			const needsStdin = canRun && isInputSnippet(language, code);

			node.properties = {
				...(node.properties ?? {}),
				tabindex: node.properties?.tabindex ?? "0",
			};

			parent.children[index] = h(
				"div",
				{
					class: "code-block",
					"data-code-runner": "",
					"data-run-language": language,
					"data-can-run": canRun ? "true" : "false",
					"data-needs-stdin": needsStdin ? "true" : "false",
				},
				[
					createToolbar(language, canRun),
					node,
					canRun
						? h("textarea", {
								class: "code-run-editor",
								"data-run-editor": "",
								hidden: true,
								spellcheck: "false",
								"aria-label": "Editable code",
							})
						: null,
					canRun
						? h(
								"div",
								{
									class: "code-run-stdin-panel",
									"data-run-stdin-panel": "",
									hidden: !needsStdin,
								},
								[
									h(
										"textarea",
										{
											class: "code-run-stdin",
											"data-run-stdin": "",
											spellcheck: "false",
											rows: "2",
											placeholder: "Current input, Enter to submit",
											"aria-label": "Input stdin",
										},
										"",
									),
									stdinSubmitButton(),
								],
							)
						: null,
					canRun
						? h(
								"div",
								{
									class: "code-run-output",
									"data-run-output": "",
									hidden: true,
									role: "status",
									"aria-live": "polite",
								},
								"",
							)
						: null,
				].filter(Boolean),
			);
		});
	};
}
