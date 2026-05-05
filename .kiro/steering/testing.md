# Testing

## Framework

- **Vitest** for all tests (NOT Jest, Mocha, or others)
- Configuration in `vitest.config.ts` at root
- v8 coverage provider

## Structure

Test files colocated with source: `*.test.ts` next to the file being tested.

### Pattern (AAA)
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

## Mocking

- Mock: external APIs, network, file system
- Don't mock: internal functions, pure utilities

## Best Practices

- Use `should` in test names
- Each test independent — no shared mutable state
- Use `beforeEach` for setup
- Test edge cases: empty values, null/undefined, boundaries
