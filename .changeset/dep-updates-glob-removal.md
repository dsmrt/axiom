---
"@dsmrt/axiom-config": patch
"@dsmrt/axiom-aws-sdk": patch
"@dsmrt/axiom-cli": patch
---

chore: remove glob dependency, update AWS SDK and tooling deps

Replace glob with native node:fs existsSync for config file discovery.
Bump @aws-sdk/* from 3.716 to 3.1127, @biomejs/biome to 2.5.12, tsup to 8.5.1.
