# Testing Guide

This project uses **Vitest** for unit and integration testing, with **React Testing Library** for component tests.

## Running Tests

```bash
# Run tests in watch mode (recommended for development)
pnpm test

# Run tests once
pnpm test:run

# Run tests with UI
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage

# Run tests in watch mode for specific file
pnpm test habits.test.ts
```

## Test Structure

```
tests/
├── setup.ts                 # Global test setup and mocks
├── actions/                 # Server action tests
│   ├── habits.test.ts
│   ├── goals.test.ts
│   └── routines.test.ts
├── components/              # Component tests
│   ├── Button.test.tsx
│   └── Card.test.tsx
└── utils/                   # Test utilities
    └── test-helpers.ts      # Mock data and helpers
```

## Writing Tests

### Server Action Tests

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Action Name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something', async () => {
    // Arrange
    const input = { /* test data */ };
    
    // Act
    const result = await someAction(input);
    
    // Assert
    expect(result.success).toBe(true);
  });
});
```

### Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Mock Data

Use test helpers for consistent mock data:

```typescript
import { createMockHabit, createMockGoal } from '@/tests/utils/test-helpers';

const habit = createMockHabit({ name: 'Custom Name' });
const goal = createMockGoal({ status: 'completed' });
```

## Coverage

Coverage reports are generated in `coverage/` directory.

Target coverage goals:
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Mock External Dependencies**: Database, auth, APIs
3. **Test Behavior, Not Implementation**: Focus on what users see
4. **Use Descriptive Test Names**: "should do X when Y"
5. **Clean Up**: Use `beforeEach` and `afterEach`
6. **Avoid Testing Implementation Details**: Test public API
7. **Test Edge Cases**: Empty states, errors, boundaries

## Common Patterns

### Testing Authenticated Actions

```typescript
mockAuth.mockResolvedValue({ user: { id: 'test-user' } });
const result = await action();
expect(result.success).toBe(true);
```

### Testing Validation Errors

```typescript
const result = await action({ invalid: 'data' });
expect(result.success).toBe(false);
expect(result.error).toContain('validation');
```

### Testing User Interactions

```typescript
const { user } = render(<Component />);
await user.click(screen.getByRole('button'));
expect(screen.getByText('Result')).toBeInTheDocument();
```

## Debugging Tests

```bash
# Run specific test file
pnpm test habits.test.ts

# Run tests matching pattern
pnpm test -- --grep "createHabit"

# Show console logs
pnpm test -- --reporter=verbose
```

## Continuous Integration

Tests run automatically on:
- Every commit (pre-commit hook)
- Pull requests
- Before deployment

All tests must pass before merging.
