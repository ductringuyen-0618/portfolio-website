# Test Documentation

## Overview

This directory contains test setup files and utilities for the portfolio website project. The testing framework uses **Vitest** with React Testing Library following enterprise-grade standards.

## Test Structure

```
src/
├── test/
│   ├── setup.ts        # Global test setup and configuration
│   ├── testUtils.ts    # Reusable test utilities and helpers
│   └── README.md       # This file
├── **/*.test.tsx       # Component tests
└── **/*.test.ts        # Utility/function tests
```

## Running Tests

### Available Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with UI dashboard
npm run test:ui
```

### Coverage Thresholds

The project enforces minimum coverage thresholds:
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

## Writing Tests

### Test File Naming

- Component tests: `ComponentName.test.tsx`
- Utility tests: `utilityName.test.ts`
- Place test files next to the source files they test

### Test Structure (AAA Pattern)

```typescript
describe('ComponentName or FeatureName', () => {
  describe('specificBehavior', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange - Set up test data and conditions
      const input = setupTestData();
      
      // Act - Execute the code being tested
      const result = functionUnderTest(input);
      
      // Assert - Verify the expected outcome
      expect(result).toBe(expected);
    });
  });
});
```

### Best Practices

1. **One concept per test** - Each test should verify one specific behavior
2. **Descriptive names** - Use clear, specific test names
3. **Arrange-Act-Assert** - Follow AAA pattern consistently
4. **Independent tests** - Tests should not depend on each other
5. **Mock external dependencies** - Isolate unit under test
6. **Test behavior, not implementation** - Focus on what, not how

## Testing Components

### Basic Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeTruthy();
  });
});
```

### Testing User Interactions

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText('Click me'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Testing with Router

```typescript
import { renderWithRouter } from '@/test/testUtils';

describe('Navigation', () => {
  it('should navigate to correct route', () => {
    const { getByText } = renderWithRouter(<Navigation />);
    expect(getByText('Home')).toBeTruthy();
  });
});
```

## Testing Utilities

### Using Test Utils

```typescript
import {
  renderWithRouter,
  createMockUser,
  wait,
  createMockResponse,
} from '@/test/testUtils';

// Render with router wrapper
const { getByText } = renderWithRouter(<MyComponent />);

// Create mock data
const user = createMockUser({ name: 'John' });

// Wait for async operations
await wait(100);

// Mock API responses
const response = createMockResponse({ data: 'test' });
```

## Mocking

### Mocking Functions

```typescript
import { vi } from 'vitest';

const mockFn = vi.fn();
mockFn.mockReturnValue('test');
mockFn.mockResolvedValue('async test');
```

### Mocking Modules

```typescript
vi.mock('@/utils/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'test' }),
}));
```

### Mocking Browser APIs

```typescript
// Mock localStorage (already in setup.ts)
const mockStorage = createMockLocalStorage();
Object.defineProperty(window, 'localStorage', { value: mockStorage });

// Mock fetch
global.fetch = vi.fn().mockResolvedValue(createMockResponse({ data: 'test' }));
```

## Common Testing Patterns

### Testing Async Functions

```typescript
it('should fetch data successfully', async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});
```

### Testing Error Handling

```typescript
it('should handle errors gracefully', async () => {
  const mockFetch = vi.fn().mockRejectedValue(new Error('API Error'));
  
  await expect(fetchData()).rejects.toThrow('API Error');
});
```

### Testing Conditional Rendering

```typescript
it('should show loading state', () => {
  const { rerender } = render(<MyComponent isLoading={true} />);
  expect(screen.getByText('Loading...')).toBeTruthy();
  
  rerender(<MyComponent isLoading={false} />);
  expect(screen.queryByText('Loading...')).toBeNull();
});
```

## Debugging Tests

### Running Single Test

```typescript
it.only('should run only this test', () => {
  // This test will run in isolation
});
```

### Skipping Tests

```typescript
it.skip('should skip this test', () => {
  // This test will be skipped
});
```

### Debug Output

```typescript
import { screen, debug } from '@testing-library/react';

// Print DOM structure
screen.debug();

// Print specific element
screen.debug(screen.getByText('Test'));
```

## CI/CD Integration

Tests run automatically in CI/CD pipeline. All tests must pass before merge.

### Pre-commit Checks (Optional)

Add Husky pre-commit hook to run tests:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test"
    }
  }
}
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Troubleshooting

### Tests Timing Out

Increase timeout in specific test:
```typescript
it('should handle long operation', async () => {
  // Test code
}, 10000); // 10 second timeout
```

### Cannot Find Module Errors

Check path aliases in `vitest.config.ts`:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Mock Not Working

Ensure mocks are defined before imports:
```typescript
vi.mock('./module');
import { functionToTest } from './module';
```

## Support

For questions or issues with tests, please:
1. Check this documentation
2. Review existing test examples
3. Consult Vitest/React Testing Library docs
4. Ask team members
