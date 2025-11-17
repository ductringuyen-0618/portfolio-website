# Testing Quick Reference Guide

## 🚨 IMPORTANT: Git Workflow

**⚠️ NEVER work directly on `main` branch!**

Always create a feature branch first:
```powershell
# Load helper script (PowerShell)
. .\scripts\git-workflow.ps1
nfb "your-feature-name"
```

See [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) for complete details.

---

## 🚀 Quick Start

```bash
# Run tests
npm test

# Watch mode (development)
npm run test:watch

# Coverage report
npm run test:coverage

# Visual UI
npm run test:ui
```

## ✅ Definition of Done Checklist

Before marking any task as complete:

- [ ] ✅ **Work on feature branch** (never on main!)
- [ ] ✅ All tests pass
- [ ] ✅ Code coverage ≥ 80%
- [ ] ✅ TypeScript compiles with zero errors
- [ ] ✅ ESLint passes with no errors
- [ ] ✅ Functions have JSDoc comments
- [ ] ✅ No console.log statements
- [ ] ✅ Meaningful variable names
- [ ] ✅ Error handling implemented
- [ ] ✅ Pull Request created and reviewed

**Remember: Code without passing tests is NOT done!**

## 📝 Test Template

### Component Test
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  describe('Rendering', () => {
    it('should render correctly with required props', () => {
      // Arrange
      const props = { title: 'Test' };
      
      // Act
      render(<ComponentName {...props} />);
      
      // Assert
      expect(screen.getByText('Test')).toBeTruthy();
    });
  });
});
```

### Utility Function Test
```typescript
import { describe, it, expect } from 'vitest';
import { functionName } from './fileName';

describe('functionName', () => {
  it('should return expected result when given valid input', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = functionName(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

## 🎯 Common Test Patterns

### User Interaction
```typescript
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();
await user.click(screen.getByRole('button'));
await user.type(screen.getByRole('textbox'), 'Hello');
```

### Async Operations
```typescript
import { waitFor } from '@testing-library/react';

await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeTruthy();
});
```

### Mocking
```typescript
import { vi } from 'vitest';

// Mock function
const mockFn = vi.fn().mockReturnValue('value');

// Mock module
vi.mock('./module', () => ({
  exportedFn: vi.fn(),
}));
```

## 🏗️ Naming Conventions

### Variables
```typescript
// ✅ Good
const isAuthenticated = true;
const hasPermission = false;
const userList = [];
const MAX_ITEMS = 100;

// ❌ Bad
const authenticated = true;  // Missing 'is'
const permission = false;    // Unclear
const list = [];            // Too generic
const maxItems = 100;       // Should be UPPER_CASE
```

### Functions
```typescript
// ✅ Good
function calculateTotal(items: Item[]): number {}
function fetchUserData(id: string): Promise<User> {}
function validateEmail(email: string): boolean {}
const handleClick = () => {};

// ❌ Bad
function total(items: Item[]): number {}        // Not descriptive
function userData(id: string): Promise<User> {} // Missing verb
function email(email: string): boolean {}       // Not clear
const onClick = () => {};                       // Use 'handle' prefix
```

### Components
```typescript
// ✅ Good
function UserProfile() {}
function NavigationBar() {}
const ProductCard: React.FC<Props> = () => {};

// ❌ Bad
function userprofile() {}      // Wrong case
function Navigation_Bar() {}   // No underscores
const product_card = () => {}; // Wrong case
```

## 📊 Coverage Commands

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
# Open coverage/index.html after running coverage
```

## 🔧 Debugging

```typescript
// Print DOM structure
import { screen } from '@testing-library/react';
screen.debug();

// Run only one test
it.only('should run this test', () => {});

// Skip a test
it.skip('should skip this test', () => {});
```

## 💡 Best Practices

1. **Test behavior, not implementation**
   - ✅ Test what users see and do
   - ❌ Don't test internal state or methods

2. **Keep tests simple and focused**
   - ✅ One concept per test
   - ❌ Don't test multiple things in one test

3. **Use descriptive test names**
   - ✅ `should show error when email is invalid`
   - ❌ `test email validation`

4. **Mock external dependencies**
   - ✅ Mock APIs, localStorage, external libraries
   - ❌ Don't make real API calls in tests

5. **Follow AAA pattern**
   - Arrange (setup)
   - Act (execute)
   - Assert (verify)

## 🚫 Common Mistakes

### ❌ Don't
```typescript
// Testing implementation details
expect(component.state.value).toBe('test');

// Multiple concepts in one test
it('should do everything', () => {
  // Tests 5 different things
});

// Shallow assertions
expect(result).toBeTruthy(); // When you could be more specific
```

### ✅ Do
```typescript
// Test user-visible behavior
expect(screen.getByText('Success')).toBeTruthy();

// One concept per test
it('should show success message when form submits', () => {});

// Specific assertions
expect(result).toBe('expected value');
expect(result).toEqual({ id: 1, name: 'Test' });
```

## 📚 Quick Links

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Project Copilot Instructions](.github/copilot-instructions.md)

## 🆘 Getting Help

1. Check test examples in `/src/**/*.test.{ts,tsx}`
2. Review `/src/test/README.md`
3. Read Copilot instructions: `.github/copilot-instructions.md`
4. Consult team documentation

---

**Remember: Tests first, implementation second. If tests don't pass, the task isn't done!**
