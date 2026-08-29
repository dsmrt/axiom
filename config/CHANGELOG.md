# @dsmrt/axiom-config

## 1.2.5

### Patch Changes

- 0459ce3: fix(ci): restore NPM_TOKEN auth — pnpm publish does not support npm Trusted Publishers OIDC

## 1.2.4

### Patch Changes

- 762e5c6: chore: test npm Trusted Publisher OIDC publish flow

## 1.2.3

### Patch Changes

- 31ae74a: fix(ci): move --provenance into changeset-publish script to avoid pnpm arg-passthrough bug

## 1.2.2

### Patch Changes

- 5549ab3: fix: upgrade release CI to Node 22 with frozen lockfile
- 6ac6d26: fix: support `ENV` environment variable for selecting config

  `ENV=dev axiom params get` now loads `.axiom.dev.js` (equivalent to `--env dev`).

  **`@dsmrt/axiom-config`**: `loadConfig` falls back to `process.env.ENV` when no `env` is passed, so library consumers also benefit.

  **`@dsmrt/axiom-cli`**: middleware maps `ENV` → `argv.env` at parse time so all subcommands see the resolved value. Priority order: `--env` flag > `AXIOM_ENV` > `ENV`.

## 1.2.1

### Patch Changes

- c941d5d: fix init cli command; fix loadConfigByEnv to allow undefined env

## 1.2.0

### Minor Changes

- 5edaee0: load config by env

## 1.1.0

### Minor Changes

- b1a56bc: adding debug logging to the cli and config packages

## 1.0.0

### Major Changes

- d767a0e: Making loadConfig return a promise; adding typescript config support and better esm/mjs/mts support; better docs

## 0.2.3

### Patch Changes

- f4c9e19: fix: remove debug and fix testing

## 0.2.2

### Patch Changes

- f23a8f2: fixing inheretance
- f23a8f2: fix load config return with custom interfaces

## 0.2.1

### Patch Changes

- 90d88c8: fix load config return with custom interfaces

## 0.2.0

### Minor Changes

- 7aa81f2: fixing issues with publishing the package with changesets

## 0.1.1

### Patch Changes

- fe5cfa4: fixing npm readme image

## 0.1.0

### Minor Changes

- c3ffa47: Updating build and publishing tools to use tsup for esm support and @changesets/cli

### Patch Changes

- 533b167: trying to figure out changeset
