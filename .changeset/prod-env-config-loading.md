---
"@dsmrt/axiom-config": patch
---

fix: prod env uses no-suffix config file, falls back to .axiom.prod.*

When the active env equals `prodEnvName` (default `"prod"`), `loadConfig` now
treats the bare config file (`.axiom.js` / `.axiom.json` / `.axiom.ts`) as the
complete prod config and no longer also tries to load `.axiom.prod.*` on top of
it. `.axiom.prod.*` is only consulted as a fallback when no no-suffix file
exists. `ENV=prod` and `--env prod` no longer throw when only a bare config
file is present.
