# Git convention

## Repository root

Work and commit **inside this directory** (`idemgate/`), not the parent folder.

## Conventional Commits

Format:

```
<type>: <short imperative summary>
```

- Subject ≤72 characters, no trailing period.
- One purpose per commit; prefer many small commits.
- Optional body only when needed.

### Types

| Type | Use for |
|------|---------|
| `feat` | New user-facing capability or API behavior |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `test` | Tests only |
| `chore` | Build, tooling, Docker, deps, repo hygiene |
| `refactor` | Code change with no behavior change |
| `perf` | Performance improvement |

### Good

```
feat: add lease token to claim response
fix: reclaim race on expired IN_PROGRESS
docs: document fail-closed policy
test: add concurrent claim coverage
chore: add Dockerfile and Compose
```

### Bad

```
Update stuff
WIP
feat: Fixed bugs and also refactored docs
Add lease token to claim response.
```

## Forbidden trailers

**Never** add:

- `Co-authored-by:` / `Co-Authored-By:`
- Cursor / AI co-author footers
- Other generated AI trailers unless explicitly requested

Author is the human developer only.

## Branches

- `master` / `main` — stable
- `feat/<short-name>`
- `fix/<short-name>`
- `docs/<short-name>`
- `chore/<short-name>`

## Commit-msg hook

`.githooks/commit-msg` rejects `Co-authored-by` lines.

Enable once per clone:

```bash
git config core.hooksPath .githooks
```

## Do not

- `git commit --amend` unless fixing your own unpushed tip commit
- Force-push to `master` / `main`
- Commit secrets
- Add `Co-authored-by` or AI co-author trailers
