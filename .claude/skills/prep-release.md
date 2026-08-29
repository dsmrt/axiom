---
name: prep-release
description: Create changeset files and open a PR to prep changes for release in this pnpm monorepo
---

You are prepping changes in the `dsmrt/axiom` pnpm monorepo for release using `@changesets/cli`.

## Packages in this repo

- `@dsmrt/axiom-config` — `config/`
- `@dsmrt/axiom-aws-sdk` — `aws-sdk/`
- `@dsmrt/axiom-cli` — `cli/`

## Workflow

### 1. Identify changed packages

Run `git diff main...HEAD --name-only` to see which files changed. Map file paths to packages:
- `config/` → `@dsmrt/axiom-config`
- `aws-sdk/` → `@dsmrt/axiom-aws-sdk`
- `cli/` → `@dsmrt/axiom-cli`

### 2. Choose bump types

Ask the user if unclear; otherwise infer from the changes:
- **patch** — bug fixes, non-breaking internal changes
- **minor** — new features that are backwards-compatible
- **major** — breaking changes

### 3. Create changeset files

Create one `.changeset/<slug>.md` per logical change group (one file per PR is typical):

```markdown
---
"@dsmrt/axiom-config": patch
"@dsmrt/axiom-cli": patch
---

fix: short description of what changed
```

- Use kebab-case slugs that describe the change (e.g., `env-var-support.md`, `params-get-path.md`)
- Only list packages that actually changed
- Write the description as a conventional commit message (`fix:`, `feat:`, etc.)

### 4. Commit and push

Stage the changeset files and any uncommitted source changes, then commit:

```
git add .changeset/<slug>.md [other changed files]
git commit -m "fix: <description>"
git push -u origin <branch>
```

### 5. Open a PR

```
gh pr create --title "<short title>" --body "$(cat <<'EOF'
## Summary
- <bullet points of changes>

## Test plan
- [ ] Tests pass: `pnpm test`
- [ ] Type check: `pnpm build`
EOF
)"
```

## After merge

Once the PR merges to `main`, the `changesets/action` CI workflow will automatically open a "Version Packages" PR. Merging that PR bumps versions and publishes to npm.

## Notes

- Never commit directly to `main`
- The release CI uses Node 22 with `pnpm install --frozen-lockfile` — don't change `pnpm-lock.yaml` in isolation
- Run `pnpm test` before opening a PR to verify nothing is broken
