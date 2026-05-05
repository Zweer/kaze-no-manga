---
name: qa
description: "Diff-aware QA — analyze changes, verify coverage, produce health score. Use after implementation, before shipping."
---

# QA

**Cognitive mode: QA Lead**

Read the diff. Know what changed. Verify it works. Score it.

## Trigger

Invoke with: `qa`, `qa check`, or `test this`

## Pre-flight

Detect context:
- On feature branch → diff-aware mode (diff against default branch)
- No changes → report "nothing to test"
- User provided a path → focused mode on that path

## Workflow

### 1. Identify What Changed

```bash
DEFAULT=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo main)
git diff $DEFAULT...HEAD --stat
git diff $DEFAULT...HEAD --name-only
```

Classify changed files:
- **Source**: `packages/**/*.ts`, `apps/**/*.ts`
- **Config**: `biome.json`, `tsconfig.json`, `vitest.config.ts`
- **Infra**: `infra/**/*.ts`, `infra/resolvers/**/*.js`
- **Tests**: `**/*.test.ts`

### 2. Verify Test Coverage

For each changed source file:
- Does a corresponding test file exist?
- Do existing tests cover the changed code paths?
- Are edge cases tested (empty input, invalid args, missing files)?

### 3. Run Checks

```bash
npm test
npm run lint
```

### 4. Check for Regressions

- Files that import from changed modules
- Shared utilities used across multiple packages
- AppSync resolvers that reference changed types

## Output Format

```markdown
# QA Report: {branch}

## Health Score: {0-100}/100

## Summary
- Changed: {N} files (+{N} -{N} lines)
- Source files: {N} | Tests: {N} | Configs: {N}
- Test coverage: {N}/{N} changed source files have tests
- Status: ✅ Ship-ready / ⚠️ Fix before shipping / ❌ Blocked

## Issues

### [CRITICAL] {title}
- File: `{path}`
- Problem: {description}
- Impact: {what breaks}
- Fix: {suggestion}

## Verified OK
- ✅ {area}: {what was checked}

## Next Step
- Fix issues → `code review` → ship
```

## Health Score

- Start at 100
- Critical: -25 | High: -15 | Medium: -5 | Low: -2
- Ship-ready: >= 80
