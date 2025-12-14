import { readFileSync } from "node:fs";
import { sync as findUpSync } from "find-up";

export interface AwsConfigs {
	account: string;
	region: string;
	profile: string;
	baseParameterPath: string;
}

export interface BaseConfig {
	name: string;
	env: string;
	aws: AwsConfigs;
	prodEnvName?: string;
}

export type Config<T = object> = T & BaseConfig;

interface ConfigMethods {
	isProd(): boolean;
	asParameterPath(name: string): string;
}

export class ConfigContainer implements BaseConfig, ConfigMethods {
	readonly name: string;
	readonly env: string;
	readonly aws: AwsConfigs;
	readonly prodEnvName?: string = "prod";

	constructor(config: BaseConfig) {
		this.name = config.name;
		this.env = config.env;
		this.aws = config.aws;
		this.prodEnvName ??= config.prodEnvName;
		for (const prop in config) {
			// @ts-expect-error due to the interface being dynamic, we can't predict their properties
			this[prop] = config[prop];
		}
	}

	public isProd(): boolean {
		return this.env === this.prodEnvName;
	}

	public asParameterPath(name: string): string {
		return `${this.aws.baseParameterPath.replace(/\/+$/, "")}/${name}`;
	}
}

export interface LoadConfigInput {
	/**
	 * defaults to prod
	 */
	env?: string;
	/**
	 * Override configs
	 */
	overrides?: Config;
	/**
	 * Load config from a sub directory
	 */
	cwd?: string;
}

// TODO - Add validation here
export const importConfigFromPath = async (path: string): Promise<Config> => {
	if (/\.json$/.test(path)) {
		return JSON.parse(readFileSync(path).toString()) as Config;
	}

	// Use dynamic import for TypeScript (.ts, .mts) files to support Node 22+ native TS
	// also use dynamic import if mjs
	if (/\.((m)?ts|mjs)$/.test(path)) {
		const loaded = await import(path);
		// Handle both default exports and named exports
		return (loaded.default || loaded) as Config;
	}

	// Use require for JavaScript files (.js, .mjs)
	if (/\.(m)?js$/.test(path)) {
		const loaded = require(path);
		return (loaded.default || loaded) as Config;
	}

	throw new Error(`Unsupported file type or path not found: ${path}`);
};

export const loadConfig = async <T extends object>(
	input?: LoadConfigInput,
): Promise<ConfigContainer & T> => {
	// get the base file
	const baseConfigFile = configPath({
		...input,
		env: undefined,
	});

	const baseConfig = await importConfigFromPath(baseConfigFile);
	let overrides = input?.overrides || {};

	// get the environment file
	if (input?.env) {
		const devConfig = await importConfigFromPath(configPath(input));
		overrides = mergeDeep(devConfig, overrides);
	}

	const configObject = mergeDeep(baseConfig, overrides);

	// merge env file
	return new ConfigContainer(configObject) as ConfigContainer & T;
};

/**
 * Simple object check.
 */
export function isObject(item: unknown) {
	return item && typeof item === "object" && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 */

// biome-ignore lint/suspicious/noExplicitAny: needs to be any for now
export function mergeDeep(target: any, ...sources: any[]) {
	if (!sources.length) return target;
	const source = sources.shift();

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key]) Object.assign(target, { [key]: {} });
				mergeDeep(target[key], source[key]);
			} else {
				Object.assign(target, { [key]: source[key] });
			}
		}
	}

	return mergeDeep(target, ...sources);
}

export const configPath = (input?: LoadConfigInput): string => {
	const envIndicator = input?.env ? `.${input.env}` : "";
	const p = findUpSync(
		[
			`.axiom${envIndicator}.json`,
			`.axiom${envIndicator}.js`,
			`.axiom${envIndicator}.mjs`,
			`.axiom${envIndicator}.ts`,
			`.axiom${envIndicator}.mts`,
		],
		{ cwd: input?.cwd },
	);

	if (p === undefined)
		throw new Error(
			`Axiom config files not found: .axiom${envIndicator}.json, .axiom${envIndicator}.js .axiom${envIndicator}.ts`,
		);

	return p;
};
