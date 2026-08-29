---
"@dsmrt/axiom-config": patch
"@dsmrt/axiom-cli": patch
---

fix: support `ENV` environment variable for selecting config

`ENV=dev axiom params get` now loads `.axiom.dev.js` (equivalent to `--env dev`).

**`@dsmrt/axiom-config`**: `loadConfig` falls back to `process.env.ENV` when no `env` is passed, so library consumers also benefit.

**`@dsmrt/axiom-cli`**: middleware maps `ENV` → `argv.env` at parse time so all subcommands see the resolved value. Priority order: `--env` flag > `AXIOM_ENV` > `ENV`.
