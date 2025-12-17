import { readFileSync } from "node:fs";
import { globSync } from "glob";

// Debug utility - controlled by AXIOM_DEBUG environment variable
const isDebugEnabled = () =>
	process.env.AXIOM_DEBUG === "true" || process.env.AXIOM_DEBUG === "1";

const debug = (message: string, ...args: unknown[]) => {
	if (isDebugEnabled()) {
		console.error(`[axiom:config] ${message}`, ...args);
	}
};

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
	debug(`Attempting to import config from: ${path}`);

	if (/\.json$/.test(path)) {
		debug(`Loading JSON config file: ${path}`);
		try {
			const config = JSON.parse(readFileSync(path).toString()) as Config;
			debug(`Successfully loaded JSON config with name: ${config.name}`);
			return config;
		} catch (error) {
			debug(`Failed to parse JSON config: ${error}`);
			throw error;
		}
	}

	// Use dynamic import for TypeScript (.ts, .mts) files to support Node 22+ native TS
	// also use dynamic import if mjs
	if (/\.((m)?ts|mjs)$/.test(path)) {
		debug(`Loading TypeScript/ESM config file: ${path}`);
		try {
			const loaded = await import(path);
			const config = (loaded.default || loaded) as Config;
			debug(`Successfully loaded TS/ESM config with name: ${config.name}`);
			return config;
		} catch (error) {
			debug(`Failed to import TS/ESM config: ${error}`);
			throw error;
		}
	}

	// Use require for JavaScript files (.js, .mjs)
	if (/\.(m)?js$/.test(path)) {
		debug(`Loading JavaScript config file: ${path}`);
		try {
			const loaded = require(path);
			const config = (loaded.default || loaded) as Config;
			debug(`Successfully loaded JS config with name: ${config.name}`);
			return config;
		} catch (error) {
			debug(`Failed to require JS config: ${error}`);
			throw error;
		}
	}

	debug(`Unsupported file type: ${path}`);
	throw new Error(`Unsupported file type or path not found: ${path}`);
};

export const loadConfigByEnv = async <T extends object>(
	env?: string,
	options?: Omit<LoadConfigInput, "env">,
): Promise<ConfigContainer & T> => {
	return await loadConfig({ env: env, ...options });
};

export const loadConfig = async <T extends object>(
	input?: LoadConfigInput,
): Promise<ConfigContainer & T> => {
	debug(
		`Loading config with options:`,
		JSON.stringify({
			env: input?.env,
			cwd: input?.cwd,
			hasOverrides: !!input?.overrides,
		}),
	);

	// get the base file
	debug(`Looking for base config file...`);
	const baseConfigFile = configPath({
		...input,
		env: undefined,
	});

	debug(`Loading base config from: ${baseConfigFile}`);
	const baseConfig = await importConfigFromPath(baseConfigFile);
	debug(`Base config loaded: ${baseConfig.name} (env: ${baseConfig.env})`);

	let overrides = input?.overrides || {};

	// get the environment file
	if (input?.env) {
		debug(`Looking for environment-specific config for: ${input.env}`);
		const envConfigPath = configPath(input);
		debug(`Loading env config from: ${envConfigPath}`);
		const devConfig = await importConfigFromPath(envConfigPath);
		debug(`Env config loaded: ${devConfig.name} (env: ${devConfig.env})`);
		overrides = mergeDeep(devConfig, overrides);
		debug(`Merged env config with overrides`);
	}

	const configObject = mergeDeep(baseConfig, overrides);
	debug(
		`Final config: ${configObject.name} (env: ${configObject.env}, isProd: ${configObject.env === (configObject.prodEnvName || "prod")})`,
	);

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
	const extensions = ["json", "js", "mjs", "ts", "mts"];

	// Build glob pattern for all extensions
	const pattern = `.axiom${envIndicator}.{${extensions.join(",")}}`;

	debug(
		`Searching for config files with pattern: ${pattern}`,
		input?.cwd ? `from ${input.cwd}` : "from current directory",
	);

	// Search from the specified cwd or current directory, going up the directory tree
	const cwd = input?.cwd || process.cwd();
	let currentDir = cwd;
	let found: string | undefined;

	// Walk up the directory tree until we find a config file or reach the root
	while (true) {
		const matches = globSync(pattern, {
			cwd: currentDir,
			absolute: true,
			nodir: true,
		});

		if (matches.length > 0) {
			// Return the first match (prioritized by extension order)
			found = matches[0];
			break;
		}

		// Move up one directory
		const parent = require("node:path").dirname(currentDir);
		if (parent === currentDir) {
			// Reached the root directory
			break;
		}
		currentDir = parent;
	}

	if (found === undefined) {
		debug(`Config file not found! Searched for pattern: ${pattern}`);
		throw new Error(
			`Axiom config files not found: .axiom${envIndicator}.json, .axiom${envIndicator}.js .axiom${envIndicator}.ts`,
		);
	}

	debug(`Found config file: ${found}`);
	return found;
};
