import { readFileSync } from "fs";
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
    return this.env == this.prodEnvName;
  }

  public asParameterPath(name: string): string {
    return (
      this.aws.baseParameterPath.replace(new RegExp("/+$"), "") + `/${name}`
    );
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
export const importConfigFromPath = (path: string): Config => {
  if (/\.json$/.test(path)) {
    return JSON.parse(readFileSync(path).toString()) as Config;
  }
  if (/\.(m)?[j|t]s$/.test(path)) {
    // Register ts-node for TypeScript files if not already registered
    if (/\.tsx?$/.test(path)) {
      try {
        // Check if ts-node is already registered
        if (!process[Symbol.for("ts-node.register.instance")]) {
          require("ts-node").register({
            transpileOnly: true,
            compilerOptions: {
              module: "commonjs",
              esModuleInterop: true,
            },
          });
        }
      } catch (error) {
        throw new Error(
          `TypeScript files require ts-node to be installed. Run: pnpm add -D ts-node`,
        );
      }
    }
    /* eslint-disable */
    // Clear the require cache for this path to ensure fresh loading
    delete require.cache[require.resolve(path)];
    const loaded = require(path);
    // Handle both default exports and module.exports
    return (loaded.default || loaded) as Config;
  }

  throw new Error(`Path not found: {path}`);
};

export const loadConfig = <T extends object>(
  input?: LoadConfigInput,
): ConfigContainer & T => {
  // get the base file
  const baseConfigFile = configPath({
    ...input,
    env: undefined,
  });

  const baseConfig = importConfigFromPath(baseConfigFile);

  let overrides = input?.overrides || {};

  // get the environment file
  if (input?.env) {
    const devConfig = importConfigFromPath(configPath(input));
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
