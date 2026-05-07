/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

interface Window {
	_codeRunnerBound?: boolean;
}

interface ImportMetaEnv {
	readonly WANDBOX_API_BASE?: string;
}

declare module "nodemailer";
