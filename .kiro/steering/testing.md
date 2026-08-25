# Testing

## Rule

Every wave ships with 100% test coverage for what it introduces.
A wave is NOT done until tests pass and coverage is met.

## Frameworks

- **Vitest** for unit and integration tests
- **Playwright** for E2E tests (user flows in real browser)
- v8 coverage provider for Vitest

## Structure

Test files colocated with source: `*.test.ts` next to the file being tested.
E2E tests in `e2e/` directory at project root.

### Unit/Integration Pattern (AAA)
```typescript
import { describe, it, expect } from 'vitest';

describe('FeatureName', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = doSomething(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### E2E Pattern
```typescript
import { test, expect } from '@playwright/test';

test('user can search for manga', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox').fill('one piece');
  await expect(page.getByRole('list')).toContainText('One Piece');
});
```

## Coverage

- Unit: `vitest --coverage` with v8 provider — 100% of new code per wave
- E2E: every user-facing flow introduced in the wave has a Playwright test

## Mocking

- Mock: external APIs, network, file system
- Don't mock: internal functions, pure utilities

## Best Practices

- Use `should` in test names
- Each test independent — no shared mutable state
- Use `beforeEach` for setup
- Test edge cases: empty values, null/undefined, boundaries
