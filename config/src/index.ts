import { readFileSync } from 'fs'
import { sync as findUpSync } from 'find-up'

export interface AwsConfigs {
    account: string;
    region: string;
    profile: string;
    baseParameterPath: string;
}

export interface Config {
    name: string;
    env: string;
    aws: AwsConfigs;
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
    return JSON.parse(
      readFileSync(path).toString()
    ) as Config
  }
  if (/\.(m)?[j|t]s$/.test(path)) {
    return require(path) as Config
  }

  throw new Error(`Path not found: {path}`)
}

export const loadConfig = (input?: LoadConfigInput): Config => {
    // get the base file
    const baseConfigFile = configPath(input)

    const baseConfig = importConfigFromPath(baseConfigFile)

    let overrides = input?.overrides || {}

    // get the environment file 
    if(input?.env) {
        const devConfig = importConfigFromPath(configPath(input))
        overrides = {...devConfig, ...overrides,}
    }
    // merge env file
    return {...baseConfig, ...overrides}
}

export const configPath = (input?: LoadConfigInput): string => {
    const envIndicator = input?.env ? `.${input.env}` : ''
    const p = findUpSync([
        `.axiom${envIndicator}.json`,
        `.axiom${envIndicator}.js`,
        `.axiom${envIndicator}.mjs`,
        `.axiom${envIndicator}.ts`,
        `.axiom${envIndicator}.mts`,
    ], { cwd: input?.cwd })

    if(p === undefined)
        throw new Error(`Axiom config files not found: .axiom${envIndicator}.json, .axiom${envIndicator}.js .axiom${envIndicator}.ts`)

    return p
}
