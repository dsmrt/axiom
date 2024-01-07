<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../images/axiom-dark-mode.svg">
  <source media="(prefers-color-scheme: light)" srcset="../images/axiom-light-mode.svg">
  <img alt="Axiom logo" src="./images/axiom-light-mode.svg">
</picture>

# Axiom - Config

> An AWS focused config manager

This package focuses on the config part of axiom

## Features
- Customize your application's config type interface
- load config based on environment
- Multiple environments/accounts/regions
- Secrets with SSM Parameters

## Getting Started

### Install Config

```bash
npm install @dsmrt/axiom-config
```

### Config Usage

#### Example

1. Add your config to the base of your project 

Your project file structure

```
.
├── .axiom.dev.js
├── .axiom.js
├── README.md
├── package.json
├── src
│   └── config.ts
│   └── index.ts
└── tsconfig.json
```

Prod Config

```js
// .axiom.js
const config = {
  name: "my-prod-app",
  env: "prod",
  aws: {
    account: "prod-account",
    profile: "prod-profile",
    region: "us-east-1",
    // baseParameterPath can be used to secrets using ssm parameters (secure strings)
    baseParameterPath: "/my-app/prod",
  },
};
module.exports = config;
```

Dev Config

```js
// .axiom.dev.js

const config = {
  name: "my-prod-app",
  env: "dev",
  aws: {
    account: "dev-account",
    profile: "dev-profile",
    region: "us-north-1",
    baseParameterPath: "/my-app/dev",
  },
};

module.exports = config;
```

Adding configs for your application based on your needs

```typescript
// ./config.ts
// within your code

import { Config } from "@dsmrt/axiom-config"

export interface MyAppConfig extends Config {
    appDomain: string;
    appAcmCertArn: string;
}

```

Load the config within AWS CDK or your node application

```typescript
import { MyAppConfig } from "./config"
import { loadConfig } from "@dsmrt/axiom-config"

const config = loadConfig<MyAppConfig>();

//  or for dev
const config = loadConfig<MyAppConfig>({
    env: "dev"
});

console.log(config.appDomain);
```

## Acknowledgements

- [Nate Iler](https://github.com/nateiler)
- [Flipbox Digital](https://www.flipboxdigital.com)
- [Go Mondo](https://www.flipboxdigital.com)
