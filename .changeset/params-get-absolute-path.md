---
"@dsmrt/axiom-cli": patch
---

fix: `axiom params get` now respects the positional path argument

The `[path]` positional was documented but silently ignored — the command
always fetched from `baseParameterPath`. Now delegates to `buildPath()`:

- `axiom params get` → uses `baseParameterPath` from config
- `axiom params get /` → fetches from SSM root `/`
- `axiom params get /prod` → absolute path, bypasses config base
- `axiom params get myService` → relative, resolves to `<baseParameterPath>/myService`
