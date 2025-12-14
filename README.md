<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./images/axiom-dark-mode.svg">
  <source media="(prefers-color-scheme: light)" srcset="./images/axiom-light-mode.svg">
  <img alt="Axiom logo" src="./images/axiom-light-mode.svg">
</picture>

# Axiom

> An AWS-focused configuration manager for managing multi-environment deployments with support for AWS SSM Parameter Store

Axiom simplifies managing configuration across multiple AWS environments, accounts, and regions. It provides a powerful CLI for managing SSM parameters and a flexible configuration system that supports JavaScript, TypeScript, and JSON config files.

## 📦 Packages

This monorepo contains three npm packages:

- **`@dsmrt/axiom-cli`** - CLI tool for managing configs and SSM parameters
- **`@dsmrt/axiom-config`** - Configuration loader library
- **`@dsmrt/axiom-aws-sdk`** - AWS SDK utilities for parameter management

## ✨ Features

- 🌍 **Multi-environment support** - Manage configs for dev, staging, prod, etc.
- 🔐 **SSM Parameter Management** - Get, set, and delete AWS SSM parameters
- 📝 **Multiple config formats** - Support for `.js`, `.ts`, `.mts`, `.mjs`, and `.json`
- 🎯 **Type-safe configs** - Full TypeScript support with type inference
- 🔄 **Config inheritance** - Environment-specific configs inherit from base config
- 🚀 **AWS native** - Built for AWS workflows with credential caching

---

## 🚀 Getting Started

### Installation

Install the CLI globally or as a dev dependency:

```bash
# Global installation
npm install -g @dsmrt/axiom-cli

# Or as a project dependency
npm install --save-dev @dsmrt/axiom-cli
```

For programmatic usage, install the config library:

```bash
npm install @dsmrt/axiom-config
```

---

## 📝 Configuration Files

Axiom uses configuration files to define your AWS infrastructure settings. These files are named `.axiom.<format>` and support multiple formats.

### Supported File Formats

- `.axiom.js` - CommonJS JavaScript
- `.axiom.mjs` - ES Module JavaScript
- `.axiom.ts` - TypeScript (requires Node.js 22+ with `--experimental-strip-types`)
- `.axiom.mts` - ES Module TypeScript
- `.axiom.json` - JSON format

### Base Configuration Structure

Create a base configuration file (e.g., `.axiom.ts`) in your project root:

```typescript
// .axiom.ts
import type { Config } from "@dsmrt/axiom-config";

const config: Config = {
  name: "my-app",
  env: "prod",
  aws: {
    account: "123456789012",
    region: "us-east-1",
    profile: "my-aws-profile",
    baseParameterPath: "/my-app/prod",
  },
  // Optional: customize the production environment name (defaults to "prod")
  prodEnvName: "production",
};

export default config;
```

### Environment-Specific Configurations

Create environment-specific configs that inherit from the base config:

```typescript
// .axiom.dev.ts
import type { Config } from "@dsmrt/axiom-config";

const config: Config = {
  name: "my-app",
  env: "dev",
  aws: {
    account: "987654321098",
    region: "us-west-2",
    profile: "dev-profile",
    baseParameterPath: "/my-app/dev",
  },
};

export default config;
```

```typescript
// .axiom.staging.ts
import type { Config } from "@dsmrt/axiom-config";

const config: Config = {
  name: "my-app",
  env: "staging",
  aws: {
    account: "111222333444",
    region: "us-east-1",
    profile: "staging-profile",
    baseParameterPath: "/my-app/staging",
  },
};

export default config;
```

### Configuration Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | ✅ | Application name |
| `env` | `string` | ✅ | Environment name (e.g., "dev", "staging", "prod") |
| `aws.account` | `string` | ✅ | AWS account ID |
| `aws.region` | `string` | ✅ | AWS region (e.g., "us-east-1") |
| `aws.profile` | `string` | ✅ | AWS CLI profile name |
| `aws.baseParameterPath` | `string` | ✅ | Base path for SSM parameters |
| `prodEnvName` | `string` | ❌ | Production environment name (defaults to "prod") |

### Custom Configuration Properties

You can extend the base config with custom properties:

```typescript
// .axiom.ts
import type { Config } from "@dsmrt/axiom-config";

interface MyAppConfig {
  database: {
    host: string;
    port: number;
  };
  features: {
    enableNewUI: boolean;
  };
}

const config: Config<MyAppConfig> = {
  name: "my-app",
  env: "prod",
  aws: {
    account: "123456789012",
    region: "us-east-1",
    profile: "prod-profile",
    baseParameterPath: "/my-app/prod",
  },
  database: {
    host: "prod-db.example.com",
    port: 5432,
  },
  features: {
    enableNewUI: true,
  },
};

export default config;
```

### Configuration Methods

The loaded config includes helper methods:

#### `isProd(): boolean`

Returns `true` if the current environment is production:

```typescript
import { loadConfig } from "@dsmrt/axiom-config";

const config = await loadConfig({ env: "prod" });
console.log(config.isProd()); // true

const devConfig = await loadConfig({ env: "dev" });
console.log(devConfig.isProd()); // false
```

#### `asParameterPath(name: string): string`

Converts a parameter name to a full SSM parameter path:

```typescript
const config = await loadConfig({ env: "prod" });
// If baseParameterPath is "/my-app/prod"
console.log(config.asParameterPath("api-key"));
// Output: "/my-app/prod/api-key"
```

---

## 🖥️ CLI Usage

The Axiom CLI provides commands for viewing configs and managing SSM parameters.

### Global Options

Available for all commands:

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--env` | `-e` | Environment name (loads `.axiom.<env>.ts`) | Uses base config |
| `--debug` | `-d` | Enable debug output to stderr | `false` |
| `--help` | `-h` | Show help | - |
| `--version` | `-v` | Show version | - |

### Commands

#### `axiom init`

Initialize Axiom configuration files in your project with an interactive setup wizard.

**Usage:**
```bash
axiom init [options]
```

**Options:**
| Option | Type | Description |
|--------|------|-------------|
| `--name` | string | Project name (defaults to interactive prompt) |
| `--account` | string | AWS account ID (defaults to interactive prompt) |
| `--region` | string | AWS region (defaults to interactive prompt) |
| `--profile` | string | AWS profile name (defaults to interactive prompt) |
| `--custom-types` | boolean | Create custom types file for extending config |
| `--force` / `-f` | boolean | Overwrite existing config files |

**Interactive Mode (Recommended):**
```bash
axiom init
```

This will prompt you for:
- Project name
- AWS account ID (with validation)
- AWS region
- AWS profile name
- Whether to create custom types file

**Non-Interactive Mode:**
```bash
# Provide all options via CLI flags
axiom init \
  --name "my-app" \
  --account "123456789012" \
  --region "us-west-2" \
  --profile "production" \
  --custom-types true \
  --force
```

**Created Files:**

1. **`.axiom.ts`** - Base production configuration
   ```typescript
   import type { Config } from "@dsmrt/axiom-config";

   const config: Config = {
     name: "my-app",
     env: "prod",
     aws: {
       account: "123456789012",
       region: "us-west-2",
       profile: "production",
     },
     baseParameterPath: "/my-app/prod",
   };

   export default config;
   ```

2. **`.axiom.dev.ts`** - Development environment overrides
   ```typescript
   import type { Config } from "@dsmrt/axiom-config";

   const config: Partial<Config> = {
     env: "dev",
     baseParameterPath: undefined, // Auto-generated as /{name}/dev
   };

   export default config;
   ```

3. **`axiom.config.d.ts`** (optional) - Custom configuration types
   ```typescript
   export interface CustomConfig {
     // Add your custom properties here
     // Example:
     // apiUrl: string;
     // maxRetries: number;
   }
   ```

**With Custom Types:**

When you create custom types, your `.axiom.ts` will include type extensions:

```typescript
import type { Config } from "@dsmrt/axiom-config";
import type { CustomConfig } from "./axiom.config";

type AxiomConfig = Config & CustomConfig;

const config: AxiomConfig = {
  name: "my-app",
  env: "prod",
  aws: {
    account: "123456789012",
    region: "us-west-2",
    profile: "production",
  },
  baseParameterPath: "/my-app/prod",

  // Your custom properties (type-safe!)
  apiUrl: "https://api.example.com",
  maxRetries: 3,
};

export default config;
```

**Next Steps After Init:**
1. Edit `.axiom.ts` to customize your base configuration
2. Edit `.axiom.dev.ts` to customize development settings
3. If created, edit `axiom.config.d.ts` to add custom properties
4. Run `axiom config` to verify your configuration
5. Add `.axiom*.ts` files to your version control
6. Consider creating additional environment configs (`.axiom.staging.ts`, `.axiom.prod.ts`, etc.)

---

#### `axiom config`

Display the loaded configuration for an environment.

**Usage:**
```bash
axiom config [--env <environment>]
```

**Examples:**
```bash
# Show production config (base .axiom.ts)
axiom config

# Show development config (.axiom.dev.ts)
axiom config --env dev

# Show staging config (.axiom.staging.ts)
axiom config --env staging
```

**Output:**
```json
{
  "name": "my-app",
  "env": "prod",
  "aws": {
    "account": "123456789012",
    "region": "us-east-1",
    "profile": "prod-profile",
    "baseParameterPath": "/my-app/prod"
  }
}
```

---

### `axiom params` - Parameter Management

Manage AWS SSM parameters with the `params` subcommand group.

#### `axiom params get [path]`

Retrieve parameters from AWS SSM Parameter Store.

**Usage:**
```bash
axiom params get [path] [--env <environment>]
```

**Arguments:**
- `path` (optional) - Specific parameter path (absolute or relative to base path)

**Examples:**
```bash
# Get all parameters under the base path for production
axiom params get

# Get all parameters for dev environment
axiom params get --env dev

# Get a specific parameter (relative path)
axiom params get database/password --env prod

# Get a specific parameter (absolute path)
axiom params get /my-app/prod/api-key
```

**Output:**
```
/my-app/prod/database/host    prod-db.example.com
/my-app/prod/database/password    ••••••••••
/my-app/prod/api-key    sk_live_••••••••••
```

---

#### `axiom params set <path> <value>`

Create or update an SSM parameter.

**Usage:**
```bash
axiom params set <path> <value> [options]
```

**Arguments:**
- `path` (required) - Parameter path (absolute or relative to base path)
- `value` (required) - Parameter value

**Options:**
| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--env` | `-e` | `string` | - | Environment name |
| `--force` | `-f` | `boolean` | `false` | Skip confirmation prompt |
| `--secure` | - | `boolean` | `true` | Save as SecureString (encrypted) |
| `--overwrite` | - | `boolean` | `true` | Overwrite if parameter exists |

**Examples:**
```bash
# Set a secure parameter (with confirmation)
axiom params set database/password "mySecurePassword123" --env prod

# Set a non-secure parameter without confirmation
axiom params set app/version "1.2.3" --force --secure=false --env dev

# Set parameter with absolute path
axiom params set /my-app/staging/api-url "https://api.staging.example.com" --env staging

# Fail if parameter already exists
axiom params set new-param "value" --overwrite=false --env dev
```

**Interactive prompt (when `--force` is not used):**
```
? Are you sure you want to set 'database/password'? (Y/n)
```

**Output:**
```
Version: 3
```

---

#### `axiom params delete <path>`

Delete an SSM parameter.

**Usage:**
```bash
axiom params delete <path> [options]
```

**Arguments:**
- `path` (required) - Parameter path (absolute or relative to base path)

**Options:**
| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--env` | `-e` | `string` | - | Environment name |
| `--force` | `-f` | `boolean` | `false` | Skip confirmation prompt |

**Examples:**
```bash
# Delete a parameter (with confirmation)
axiom params delete old-api-key --env prod

# Delete without confirmation
axiom params delete temp-setting --force --env dev

# Delete with absolute path
axiom params delete /my-app/staging/deprecated-value --env staging
```

**Interactive prompt (when `--force` is not used):**
```
? Are you sure you want to delete '/my-app/prod/old-api-key'? (Y/n)
```

**Safety:**
- Cannot delete the base parameter path itself
- Always shows full path in confirmation prompts

**Output:**
```
👍
```

---

## 🐛 Debugging

Axiom provides comprehensive debug output to help troubleshoot configuration loading and CLI operations.

### Enable Debug Mode

There are two ways to enable debug output:

#### 1. Using the `--debug` Flag (CLI Only)

Add the `--debug` or `-d` flag to any CLI command:

```bash
# Debug config loading
axiom config --debug
axiom config --env dev --debug

# Debug parameter operations
axiom params get --debug
axiom params set myParam "value" --debug
axiom params delete oldParam --debug
```

#### 2. Using Environment Variable (CLI and Programmatic)

Set the `AXIOM_DEBUG` environment variable:

```bash
# Enable debug for CLI commands
AXIOM_DEBUG=1 axiom config --env dev
AXIOM_DEBUG=true axiom params get

# Enable debug in your Node.js application
AXIOM_DEBUG=1 node your-app.js
```

### Debug Output Examples

When debug mode is enabled, you'll see detailed information about what Axiom is doing:

#### Config Loading Debug Output

```bash
$ axiom config --env dev --debug

[axiom:cli] Config command handler called with env: dev
[axiom:cli] Loading config with env: dev
[axiom:config] Loading config with options: {"env":"dev","hasOverrides":false}
[axiom:config] Looking for base config file...
[axiom:config] Searching for config files: .axiom.json, .axiom.js, .axiom.mjs, .axiom.ts, .axiom.mts from current directory
[axiom:config] Found config file: /Users/you/project/.axiom.ts
[axiom:config] Loading base config from: /Users/you/project/.axiom.ts
[axiom:config] Attempting to import config from: /Users/you/project/.axiom.ts
[axiom:config] Loading TypeScript/ESM config file: /Users/you/project/.axiom.ts
[axiom:config] Successfully loaded TS/ESM config with name: my-app
[axiom:config] Base config loaded: my-app (env: prod)
[axiom:config] Looking for environment-specific config for: dev
[axiom:config] Searching for config files: .axiom.dev.json, .axiom.dev.js, .axiom.dev.mjs, .axiom.dev.ts, .axiom.dev.mts from current directory
[axiom:config] Found config file: /Users/you/project/.axiom.dev.ts
[axiom:config] Loading env config from: /Users/you/project/.axiom.dev.ts
[axiom:config] Attempting to import config from: /Users/you/project/.axiom.dev.ts
[axiom:config] Loading TypeScript/ESM config file: /Users/you/project/.axiom.dev.ts
[axiom:config] Successfully loaded TS/ESM config with name: my-app
[axiom:config] Env config loaded: my-app (env: dev)
[axiom:config] Merged env config with overrides
[axiom:config] Final config: my-app (env: dev, isProd: false)
[axiom:cli] Config loaded successfully, outputting as JSON
```

#### Parameter Get Debug Output

```bash
$ axiom params get database/password --debug

[axiom:cli] Get command handler called with path: database/password, env: undefined
[axiom:config] Loading config with options: {"hasOverrides":false}
[axiom:config] Looking for base config file...
[axiom:config] Found config file: /Users/you/project/.axiom.ts
[axiom:config] Successfully loaded config with name: my-app
[axiom:cli] Config loaded, base parameter path: /my-app/prod
[axiom:cli] Creating SSM client with region: us-east-1, profile: prod-profile
[axiom:cli] Fetching parameters from: /my-app/prod/database/password
[axiom:cli] Retrieved 1 parameter(s)
```

#### Parameter Set Debug Output

```bash
$ axiom params set api-key "sk_live_abc123" --debug --force

[axiom:cli] Set command handler called with path: api-key, value: [REDACTED], options: {"force":true,"secure":true,"overwrite":true}
[axiom:config] Loading config...
[axiom:config] Successfully loaded config: my-app
[axiom:cli] Config loaded, base parameter path: /my-app/prod
[axiom:cli] Full parameter path: /my-app/prod/api-key
[axiom:cli] Skipping confirmation (--force flag set)
[axiom:cli] Creating SSM client with region: us-east-1, profile: prod-profile
[axiom:cli] Setting parameter as SecureString
[axiom:cli] Parameter set successfully, version: 3
```

### What Debug Output Shows

Debug output helps you understand:

- ✅ **Config file discovery** - Which files Axiom is searching for and finding
- ✅ **Config loading process** - How base and environment-specific configs are loaded and merged
- ✅ **Path resolution** - How parameter paths are resolved from relative to absolute
- ✅ **AWS operations** - SSM client creation and parameter operations
- ✅ **Error context** - Debug messages appear before errors to show what was attempted
- ✅ **Merge behavior** - How environment-specific configs override base config values

### Debug in Programmatic Usage

When using `@dsmrt/axiom-config` in your code, enable debug output with the environment variable:

```typescript
// Enable debug output
process.env.AXIOM_DEBUG = "true";

import { loadConfig } from "@dsmrt/axiom-config";

const config = await loadConfig({ env: "dev" });
// Debug messages will be printed to stderr
```

### Troubleshooting Tips

If you're experiencing issues:

1. **Config not found**: Debug output shows which files are being searched and where
   ```bash
   axiom config --debug
   # Look for "[axiom:config] Searching for config files: ..."
   ```

2. **Wrong environment loaded**: Debug shows config merge process
   ```bash
   axiom config --env dev --debug
   # Look for "[axiom:config] Env config loaded: ..."
   ```

3. **Parameter path issues**: Debug shows full resolved paths
   ```bash
   axiom params get myParam --debug
   # Look for "[axiom:cli] Full parameter path: ..."
   ```

4. **AWS credential issues**: Debug shows which profile and region are used
   ```bash
   axiom params get --debug
   # Look for "[axiom:cli] Creating SSM client with region: ..., profile: ..."
   ```

### Debug Output Location

Debug messages are written to **stderr** (not stdout), which means:
- They won't interfere with JSON output or piped commands
- They can be redirected separately: `axiom config --debug 2>debug.log`
- They won't appear in automated scripts unless stderr is captured

---

## 📚 Programmatic Usage

Use `@dsmrt/axiom-config` in your Node.js applications:

### Basic Usage

```typescript
import { loadConfig } from "@dsmrt/axiom-config";

// Load production config (base .axiom.ts)
const config = await loadConfig();
console.log(config.env); // "prod"
console.log(config.aws.region); // "us-east-1"

// Load dev config (.axiom.dev.ts)
const devConfig = await loadConfig({ env: "dev" });
console.log(devConfig.env); // "dev"
console.log(devConfig.aws.account); // dev account ID
```

### Using `loadConfigByEnv`

For simpler cases where you only need to specify the environment, use the `loadConfigByEnv` helper:

```typescript
import { loadConfigByEnv } from "@dsmrt/axiom-config";

// Load dev config - simpler than loadConfig({ env: "dev" })
const devConfig = await loadConfigByEnv("dev");
console.log(devConfig.env); // "dev"
console.log(devConfig.isProd()); // false

// Load staging config
const stagingConfig = await loadConfigByEnv("staging");
console.log(stagingConfig.env); // "staging"
```

You can also pass additional options:

```typescript
import { loadConfigByEnv } from "@dsmrt/axiom-config";

// With custom working directory
const config = await loadConfigByEnv("dev", {
  cwd: "/path/to/project",
});

// With overrides
const configWithOverrides = await loadConfigByEnv("prod", {
  overrides: {
    aws: {
      region: "eu-west-1",
    },
  },
});
```

### With Custom Properties

```typescript
import { loadConfig } from "@dsmrt/axiom-config";

interface MyAppConfig {
  database: {
    host: string;
    port: number;
  };
}

const config = await loadConfig<MyAppConfig>({ env: "prod" });

// TypeScript knows about custom properties
console.log(config.database.host); // "prod-db.example.com"
console.log(config.isProd()); // true
```

### With Overrides

```typescript
import { loadConfig } from "@dsmrt/axiom-config";

const config = await loadConfig({
  env: "dev",
  overrides: {
    aws: {
      region: "us-west-1", // Override specific properties
    },
  },
});

console.log(config.aws.region); // "us-west-1"
```

### Load from Subdirectory

```typescript
import { loadConfig } from "@dsmrt/axiom-config";
import { resolve } from "node:path";

const config = await loadConfig({
  env: "dev",
  cwd: resolve(__dirname, "packages/api"),
});
```

### Using with AWS SDK

```typescript
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { fromIni } from "@aws-sdk/credential-providers";
import { loadConfig } from "@dsmrt/axiom-config";

const config = await loadConfig({ env: "prod" });

const client = new SSMClient({
  region: config.aws.region,
  credentials: fromIni({ profile: config.aws.profile }),
});

const result = await client.send(
  new GetParameterCommand({
    Name: config.asParameterPath("api-key"),
    WithDecryption: true,
  })
);

console.log(result.Parameter?.Value);
```

---

## 💡 Best Practices

### 1. **Use TypeScript Configs**

TypeScript configs provide type safety and IntelliSense:

```typescript
// .axiom.ts
import type { Config } from "@dsmrt/axiom-config";

const config: Config = {
  // TypeScript will validate your config structure
  name: "my-app",
  env: "prod",
  aws: {
    account: "123456789012",
    region: "us-east-1",
    profile: "prod-profile",
    baseParameterPath: "/my-app/prod",
  },
};

export default config;
```

### 2. **Keep Secrets in SSM**

Never commit secrets to your config files. Store them in SSM:

```typescript
// ❌ Bad: secrets in config
const config = {
  apiKey: "sk_live_abc123", // Don't do this!
};

// ✅ Good: reference SSM parameters
const config = await loadConfig({ env: "prod" });
const apiKey = await getParameter(config.asParameterPath("api-key"));
```

### 3. **Use Environment-Specific Configs**

Keep environment-specific settings in separate files:

```
.axiom.ts         # Base/production config
.axiom.dev.ts     # Development overrides
.axiom.staging.ts # Staging overrides
.axiom.test.ts    # Test overrides
```

### 4. **Organize Parameters by Service**

Structure your SSM parameters hierarchically:

```
/my-app/prod/
  ├── database/
  │   ├── host
  │   ├── password
  │   └── port
  ├── api/
  │   ├── key
  │   └── secret
  └── features/
      └── new-ui-enabled
```

### 5. **Use Secure Parameters for Sensitive Data**

Always use `--secure=true` (the default) for sensitive values:

```bash
# Secure parameter (encrypted with AWS KMS)
axiom params set database/password "secret" --env prod

# Non-secure only for non-sensitive data
axiom params set app/version "1.0.0" --secure=false --env prod
```

---

## 🏗️ Real-World Examples

### AWS CDK Integration

```typescript
// lib/my-stack.ts
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { loadConfig } from "@dsmrt/axiom-config";

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const config = await loadConfig({ env: process.env.ENV });

    // Use config values in your CDK stack
    this.account = config.aws.account;
    this.region = config.aws.region;

    // Reference SSM parameters
    const apiKey = StringParameter.fromStringParameterName(
      this,
      "ApiKey",
      config.asParameterPath("api-key")
    );
  }
}
```

### Express.js Application

```typescript
// src/config.ts
import { loadConfig } from "@dsmrt/axiom-config";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { fromIni } from "@aws-sdk/credential-providers";

interface AppConfig {
  port: number;
  logLevel: string;
}

export async function initConfig() {
  const config = await loadConfig<AppConfig>({
    env: process.env.NODE_ENV
  });

  const client = new SSMClient({
    region: config.aws.region,
    credentials: fromIni({ profile: config.aws.profile }),
  });

  // Load secrets from SSM
  const dbPassword = await client.send(
    new GetParameterCommand({
      Name: config.asParameterPath("database/password"),
      WithDecryption: true,
    })
  );

  return {
    ...config,
    database: {
      password: dbPassword.Parameter?.Value,
    },
  };
}

// src/app.ts
import express from "express";
import { initConfig } from "./config";

const app = express();
const config = await initConfig();

app.listen(config.port, () => {
  console.log(`Server running in \${config.env} mode on port \${config.port}`);
});
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubActions
          aws-region: us-east-1

      - name: Install dependencies
        run: npm ci

      - name: View production config
        run: npx axiom config --env prod

      - name: Update version parameter
        run: |
          VERSION=\$(jq -r .version package.json)
          npx axiom params set app/version "\$VERSION" --force --env prod

      - name: Deploy
        run: npm run deploy
```

---

## 🔧 Requirements

- **Node.js**: 18+ (Node.js 22+ recommended for native TypeScript support)
- **AWS CLI**: Configured with appropriate profiles
- **AWS Permissions**: IAM permissions for SSM Parameter Store operations

---

## 📄 License

MIT © [Damien Smrt](https://dsmrt.com)

---

## 🙏 Acknowledgements

- [Nate Iler](https://github.com/nateiler)
- [Go Mondo](https://www.go-mondo.com)
- [Flipbox Digital](https://www.flipboxdigital.com)

---

## 🐛 Issues & Contributing

Found a bug or want to contribute? Visit our [GitHub repository](https://github.com/dsmrt/axiom) to:

- Report issues
- Submit pull requests
- View the source code
- Read contribution guidelines

---

## 📚 API Documentation

For detailed API documentation, see the TypeScript definitions in each package:

- [`@dsmrt/axiom-config` API](./config/src/index.ts)
- [`@dsmrt/axiom-cli` API](./cli/src/index.ts)
- [`@dsmrt/axiom-aws-sdk` API](./aws-sdk/src/index.ts)
