# GitHub Copilot Instructions - Enterprise-Grade Standards

## Project Overview
React TypeScript portfolio website with AI-powered knowledge base features. This project follows enterprise-grade development practices with strict quality gates.

---

## Git Workflow - Branch Strategy

### ⚠️ CRITICAL: Never Work Directly on Main Branch

**All development MUST happen on feature branches. Direct commits to `main` are prohibited.**

### Branch Creation Workflow

Before starting any new feature or change:

1. **Check GitHub CLI Authentication**
   ```bash
   gh auth status
   ```
   If not authenticated, run:
   ```bash
   gh auth login
   ```

2. **Create Feature Branch**
   ```bash
   # Ensure you're on main and up to date
   git checkout main
   git pull origin main
   
   # Create and switch to feature branch
   git checkout -b feature/your-feature-name
   ```

3. **Push Branch to Remote**
   ```bash
   git push -u origin feature/your-feature-name
   ```

### Branch Naming Conventions

Use descriptive branch names with prefixes:

- `feature/` - New features (e.g., `feature/add-user-authentication`)
- `fix/` - Bug fixes (e.g., `fix/login-error-handling`)
- `refactor/` - Code refactoring (e.g., `refactor/simplify-api-client`)
- `test/` - Adding or updating tests (e.g., `test/add-component-tests`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)
- `perf/` - Performance improvements (e.g., `perf/optimize-search`)

### Example Workflow

```bash
# 1. Start new feature
git checkout main
git pull origin main
git checkout -b feature/add-semantic-search

# 2. Make changes and commit
git add .
git commit -m "feat(search): implement semantic search with TF-IDF"

# 3. Push to remote
git push -u origin feature/add-semantic-search

# 4. Create Pull Request using GitHub CLI
gh pr create --title "Add semantic search functionality" --body "Implements TF-IDF based semantic search"

# 5. After PR approval, merge via GitHub UI or CLI
gh pr merge --squash
```

### Automated Branch Creation Helper

When starting work, use this automation:

```bash
# PowerShell function to create feature branch
function New-FeatureBranch {
    param(
        [Parameter(Mandatory=$true)]
        [string]$BranchName,
        [string]$Prefix = "feature"
    )
    
    # Check GH CLI auth
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  GitHub CLI not authenticated. Please run: gh auth login" -ForegroundColor Yellow
        return
    }
    
    # Update main
    git checkout main
    git pull origin main
    
    # Create and push branch
    $fullBranchName = "$Prefix/$BranchName"
    git checkout -b $fullBranchName
    git push -u origin $fullBranchName
    
    Write-Host "✅ Created and pushed branch: $fullBranchName" -ForegroundColor Green
}

# Usage:
# New-FeatureBranch "add-user-profile"
# New-FeatureBranch "fix-login-bug" -Prefix "fix"
```

### Pull Request Requirements

Before creating a PR, ensure:

- [ ] All tests pass (`npm test`)
- [ ] Code coverage meets threshold (80%+)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Commits follow conventional commit format
- [ ] Branch is up to date with main
- [ ] Documentation updated if needed

### Creating Pull Requests

```bash
# Interactive PR creation
gh pr create

# With details
gh pr create \
  --title "feat(auth): add OAuth2 login" \
  --body "Implements Google OAuth2 authentication flow" \
  --assignee @me \
  --label "feature,enhancement"

# Draft PR for work in progress
gh pr create --draft
```

### Merging Strategy

- **Squash and merge** - Preferred for feature branches (clean history)
- **Rebase and merge** - For keeping detailed commit history
- **Never merge directly** - Always use Pull Requests

---

## 🚨 CRITICAL: Commit Workflow

### Before EVERY Commit - Run This Checklist

**NEVER commit code without running these checks first:**

```bash
# 1. Run all tests
npm test

# 2. Check TypeScript compilation
npm run type-check

# 3. Check linting
npm run lint

# 4. Only if ALL pass, then commit
git add .
git commit -m "type(scope): message"
git push
```

### The Golden Rule

```
❌ WRONG WORKFLOW:
   Write code → Commit → Discover tests fail → Fix → Commit again

✅ CORRECT WORKFLOW:
   Write code → Test → Fix until tests pass → Commit once
```

**Why this matters:**
- Broken commits pollute git history
- Makes bisecting bugs difficult
- Wastes CI/CD resources
- Unprofessional development practice
- Violates Definition of Done

### Test-Driven Development (TDD) Flow

**Recommended approach:**

1. **Write/update tests first** (optional but recommended)
2. **Write implementation code**
3. **Run tests continuously** (`npm run test:watch`)
4. **Fix until all tests pass**
5. **Run full validation suite**:
   ```bash
   npm test && npm run type-check && npm run lint
   ```
6. **Only then commit**

### Pre-Commit Checklist Script

Add this to your workflow:

```bash
# pre-commit-check.sh (or .ps1 for PowerShell)
npm test || exit 1
npm run type-check || exit 1
npm run lint || exit 1
echo "✅ All checks passed! Safe to commit."
```

---

## Definition of Done (DoD)

**A task is ONLY considered complete when:**

1. ✅ **Work on feature branch** - Never commit directly to main
2. ✅ **All tests pass BEFORE commit** - Run tests, fix issues, then commit
3. ✅ **Code coverage meets threshold** - Minimum 80% coverage for new code
4. ✅ **TypeScript compilation succeeds** - Zero TypeScript errors BEFORE commit
5. ✅ **ESLint passes** - No linting errors BEFORE commit
6. ✅ **Code reviewed via PR** - Pull request reviewed and approved
7. ✅ **Documentation updated** - JSDoc comments, README updates as needed
8. ✅ **Performance validated** - No performance regressions introduced

**Critical Rules:**
- ❌ Never work directly on `main` branch
- ❌ Never commit without running tests first
- ❌ Never commit code with failing tests
- ❌ Never commit code with TypeScript errors
- ❌ Code without passing tests is NOT production-ready
- ✅ Always create feature branch before making changes
- ✅ Always run full test suite before committing
- ✅ Always use Pull Requests for merging
- ✅ Test → Fix → Pass → Then Commit (in that order!)

---

## Code Quality Standards

### TypeScript Configuration
- **Strict mode enabled** - No implicit any, strict null checks
- **Path aliases** - Use `@/` for src imports
- **Explicit return types** - All exported functions must have return types
- **No `any` types** - Use `unknown` and type guards instead
- **Prefer interfaces** over type aliases for object shapes

### Testing Requirements

#### Test Coverage Targets
- **Unit Tests**: 80%+ coverage for utilities, services, hooks
- **Component Tests**: 70%+ coverage for React components
- **Integration Tests**: Critical user flows must be tested
- **E2E Tests**: Main user journeys (optional but recommended)

#### Test Structure
```typescript
describe('ComponentName or FeatureName', () => {
  describe('specificFunctionOrBehavior', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange
      const input = setupTestData();
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

#### Test Naming Convention
- Use descriptive test names: `should return filtered results when search query matches multiple entries`
- Group related tests with `describe` blocks
- Use `it.skip()` for temporarily disabled tests (with ticket reference)
- Use `it.only()` only during development (never commit)

#### Test Best Practices
- **AAA Pattern**: Arrange, Act, Assert
- **One assertion concept per test** (can have multiple expects for same concept)
- **No test interdependencies** - Each test must run independently
- **Mock external dependencies** - APIs, localStorage, third-party libraries
- **Test behavior, not implementation** - Avoid testing internal state
- **Use data-testid** for component queries when semantic queries aren't sufficient

---

## Naming Conventions

### Files and Folders
```
✅ CORRECT:
- Components: PascalCase - `UserProfile.tsx`, `NavigationBar.tsx`
- Utilities: camelCase - `dateFormatter.ts`, `apiClient.ts`
- Hooks: camelCase with 'use' prefix - `useAuth.ts`, `useFetchData.ts`
- Types: PascalCase - `User.types.ts`, `ApiResponse.types.ts`
- Constants: UPPER_SNAKE_CASE file - `API_ENDPOINTS.ts`, `CONFIG.ts`
- Tests: Match source file - `UserProfile.test.tsx`, `dateFormatter.test.ts`

❌ INCORRECT:
- userprofile.tsx, navigation-bar.tsx
- DateFormatter.ts, APIClient.ts
- Auth.hook.ts, fetch-data.hook.ts
```

### Variables and Functions
```typescript
// ✅ CORRECT

// Boolean variables - use is/has/should/can prefix
const isAuthenticated = true;
const hasPermission = checkUserRole();
const shouldRender = isVisible && isEnabled;
const canEdit = user.role === 'admin';

// Functions - verb-based, describe action
function calculateTotalPrice(items: Item[]): number { }
function fetchUserData(userId: string): Promise<User> { }
function validateEmail(email: string): boolean { }
function transformApiResponse(data: ApiData): UserData { }

// Constants - UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_TIMEOUT_MS = 5000;
const DEFAULT_PAGE_SIZE = 20;

// Event handlers - handle* prefix
const handleSubmit = (e: FormEvent) => { };
const handleUserClick = (userId: string) => { };
const handleInputChange = (value: string) => { };

// React components - PascalCase
function UserDashboard() { }
const NavigationMenu: React.FC<Props> = () => { };

// Custom hooks - use* prefix
function useLocalStorage<T>(key: string): [T, (value: T) => void] { }
function useDebounce<T>(value: T, delay: number): T { }

// Private/internal functions - underscore prefix (use sparingly)
function _internalHelper() { }

// ❌ INCORRECT
const authenticated = true; // Missing 'is' prefix
const permission = checkUserRole(); // Unclear boolean
function doThings() { } // Vague, no clear action
function data() { } // Not descriptive
const handler = () => { }; // Use handleSpecificAction
function UseCustomHook() { } // Incorrect capitalization
```

### Types and Interfaces
```typescript
// ✅ CORRECT

// Interfaces - PascalCase, no 'I' prefix
interface User {
  id: string;
  email: string;
  profile: UserProfile;
}

// Type aliases - PascalCase
type UserId = string;
type APIResponse<T> = {
  data: T;
  error?: string;
};

// Enums - PascalCase for name, UPPER_SNAKE_CASE for values
enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
}

// Generic type parameters
type Result<TData, TError = Error> = { }; // Use T prefix for generics

// Props interfaces - Component name + Props suffix
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
}

// ❌ INCORRECT
interface IUser { } // Don't use 'I' prefix
type user = { }; // Not PascalCase
enum userRole { admin = 'admin' } // Incorrect casing
interface Props { } // Too generic, not specific
```

---

## Function Standards

### Function Structure
```typescript
// ✅ CORRECT - Enterprise-grade function

/**
 * Calculates the total price including tax and discount
 * 
 * @param items - Array of items with price and quantity
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @param discountCode - Optional discount code to apply
 * @returns Total price after tax and discount
 * @throws {ValidationError} When items array is empty
 * 
 * @example
 * ```typescript
 * const total = calculateTotalPrice(
 *   [{price: 10, quantity: 2}],
 *   0.08,
 *   'SAVE10'
 * );
 * ```
 */
export function calculateTotalPrice(
  items: CartItem[],
  taxRate: number,
  discountCode?: string
): number {
  // Input validation
  if (!items.length) {
    throw new ValidationError('Items array cannot be empty');
  }
  
  if (taxRate < 0 || taxRate > 1) {
    throw new ValidationError('Tax rate must be between 0 and 1');
  }
  
  // Business logic
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );
  
  const discount = discountCode 
    ? calculateDiscount(subtotal, discountCode)
    : 0;
    
  const tax = (subtotal - discount) * taxRate;
  
  return subtotal - discount + tax;
}
```

### Function Best Practices
1. **Single Responsibility** - One function, one purpose
2. **Pure functions when possible** - No side effects, deterministic output
3. **Max 50 lines** - If longer, break into smaller functions
4. **Max 4 parameters** - Use objects for more parameters
5. **Early returns** - Reduce nesting with guard clauses
6. **Explicit error handling** - Don't silently fail
7. **JSDoc comments** - Required for all exported functions
8. **Type safety** - Explicit parameter and return types

```typescript
// ✅ Good - Early returns, clear flow
function processUser(user: User | null): string {
  if (!user) return 'Guest';
  if (!user.isActive) return 'Inactive User';
  if (user.isPremium) return `Premium: ${user.name}`;
  return user.name;
}

// ❌ Bad - Deep nesting
function processUser(user: User | null): string {
  if (user) {
    if (user.isActive) {
      if (user.isPremium) {
        return `Premium: ${user.name}`;
      } else {
        return user.name;
      }
    } else {
      return 'Inactive User';
    }
  } else {
    return 'Guest';
  }
}

// ✅ Good - Object parameter for many options
interface SearchOptions {
  query: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  filters?: Record<string, unknown>;
}

function searchItems(options: SearchOptions): SearchResult { }

// ❌ Bad - Too many parameters
function searchItems(
  query: string,
  limit: number,
  offset: number,
  sortBy: string,
  filters: Record<string, unknown>
): SearchResult { }
```

---

## React Component Standards

### Component Structure
```typescript
// ✅ CORRECT - Enterprise component structure

import React, { useState, useEffect } from 'react';
import { SomeType } from '@/types';
import { useCustomHook } from '@/hooks';
import styles from './ComponentName.module.css';

// 1. Types and Interfaces (top of file)
interface ComponentNameProps {
  /** User object containing profile information */
  user: User;
  /** Callback fired when user clicks edit button */
  onEdit: (userId: string) => void;
  /** Optional CSS class name */
  className?: string;
}

// 2. Constants (if any)
const MAX_DISPLAY_LENGTH = 100;

// 3. Component Definition
/**
 * Displays user information with edit functionality
 * 
 * @component
 * @example
 * ```tsx
 * <ComponentName 
 *   user={currentUser} 
 *   onEdit={handleEdit}
 * />
 * ```
 */
export function ComponentName({
  user,
  onEdit,
  className,
}: ComponentNameProps): JSX.Element {
  // 4. Hooks (always at top, same order)
  const [isExpanded, setIsExpanded] = useState(false);
  const customData = useCustomHook(user.id);
  
  useEffect(() => {
    // Side effects
  }, [user.id]);
  
  // 5. Event Handlers
  const handleToggleExpand = (): void => {
    setIsExpanded(prev => !prev);
  };
  
  const handleEditClick = (): void => {
    onEdit(user.id);
  };
  
  // 6. Derived State / Computed Values
  const displayName = user.name.length > MAX_DISPLAY_LENGTH
    ? `${user.name.slice(0, MAX_DISPLAY_LENGTH)}...`
    : user.name;
  
  // 7. Render Helpers (if needed)
  const renderUserBadge = (): JSX.Element => {
    if (user.isPremium) return <Badge>Premium</Badge>;
    return <Badge>Free</Badge>;
  };
  
  // 8. Early Returns (if applicable)
  if (!user) return <LoadingSpinner />;
  if (user.isDeleted) return <DeletedUserMessage />;
  
  // 9. Main Render
  return (
    <div className={className} data-testid="component-name">
      <h2>{displayName}</h2>
      {renderUserBadge()}
      <button onClick={handleEditClick}>Edit</button>
    </div>
  );
}

// 10. Display Name (for debugging)
ComponentName.displayName = 'ComponentName';
```

### Component Best Practices
- **Functional components only** - No class components
- **Named exports preferred** over default exports
- **Props destructuring** - Destructure in function signature
- **PropTypes via TypeScript** - No runtime PropTypes
- **Memoization when needed** - Use `React.memo`, `useMemo`, `useCallback` for performance
- **Accessibility** - Include ARIA labels, keyboard navigation
- **Test IDs** - Add `data-testid` for complex queries

```typescript
// ✅ Good - Memoized expensive computation
const ExpensiveComponent: React.FC<Props> = ({ data }) => {
  const processedData = useMemo(
    () => expensiveOperation(data),
    [data]
  );
  
  return <div>{processedData}</div>;
};

// ✅ Good - Memoized callback to prevent re-renders
const ParentComponent: React.FC = () => {
  const handleClick = useCallback((id: string) => {
    console.log(id);
  }, []);
  
  return <ChildComponent onClick={handleClick} />;
};
```

---

## Custom Hooks Standards

```typescript
// ✅ CORRECT - Enterprise custom hook

/**
 * Custom hook for managing local storage with type safety
 * 
 * @template T - Type of stored value
 * @param key - Local storage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Tuple of [value, setValue, removeValue]
 * 
 * @example
 * ```typescript
 * const [user, setUser, removeUser] = useLocalStorage<User>('user', null);
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] {
  // State to store value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  const setValue = useCallback((value: T): void => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key]);

  // Remove value from localStorage
  const removeValue = useCallback((): void => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
```

### Hook Best Practices
- **Prefix with 'use'** - All hooks must start with 'use'
- **Return arrays for positional** returns `[value, setValue]`
- **Return objects for named** returns `{ data, isLoading, error }`
- **Cleanup effects** - Always cleanup subscriptions, timers
- **Dependencies** - Complete and accurate dependency arrays
- **Error handling** - Graceful error handling with fallbacks

---

## Error Handling Standards

```typescript
// ✅ CORRECT - Comprehensive error handling

// 1. Custom Error Classes
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 2. Error Handling in Async Functions
async function fetchUserData(userId: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      throw new ApiError(
        'Failed to fetch user',
        response.status,
        `/api/users/${userId}`
      );
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle API-specific errors
      console.error(`API Error: ${error.message}`, error);
      throw error;
    }
    
    // Handle unexpected errors
    console.error('Unexpected error fetching user:', error);
    throw new Error('An unexpected error occurred');
  }
}

// 3. Error Boundaries for React
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

---

## Performance Standards

### Performance Best Practices
1. **Lazy load routes** - Use `React.lazy()` for route-based code splitting
2. **Optimize images** - WebP format, responsive sizes, lazy loading
3. **Debounce expensive operations** - Search, API calls, window resize
4. **Virtualize long lists** - Use react-window or react-virtualized
5. **Memoize expensive calculations** - `useMemo` for derived data
6. **Avoid anonymous functions in renders** - Use `useCallback`
7. **Bundle size monitoring** - Keep chunks under 200KB

```typescript
// ✅ Good - Lazy loaded routes
const Projects = lazy(() => import('@/pages/Projects'));
const About = lazy(() => import('@/pages/About'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/projects" element={<Projects />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  );
}

// ✅ Good - Debounced search
function SearchComponent() {
  const debouncedSearch = useDebouncedCallback(
    (query: string) => performSearch(query),
    500
  );
  
  return <input onChange={(e) => debouncedSearch(e.target.value)} />;
}
```

---

## Git Commit Standards

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

### Examples
```
feat(auth): add social login with Google OAuth

- Implement OAuth2 flow
- Add Google provider configuration
- Update login UI with Google button

Closes #123

---

fix(search): correct debounce timing issue

The search was firing too frequently causing performance issues.
Increased debounce delay from 300ms to 500ms.

---

test(utils): add comprehensive tests for date formatter

- Add tests for edge cases
- Add tests for timezone handling
- Achieve 95% coverage

---

refactor(components): extract common button styles

Extracted repeated button styles into reusable component
to improve maintainability.
```

---

## Code Review Checklist

Before requesting review, verify:

- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Test coverage meets threshold (80%+)
- [ ] JSDoc comments on all exported functions
- [ ] No console.log statements (use proper logging)
- [ ] No commented-out code
- [ ] Meaningful variable/function names
- [ ] Error handling implemented
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met
- [ ] Mobile responsive (if UI changes)
- [ ] Browser compatibility checked
- [ ] No security vulnerabilities introduced
- [ ] Documentation updated

---

## Security Standards

### Security Best Practices
1. **Never commit secrets** - Use environment variables
2. **Sanitize user input** - Prevent XSS attacks
3. **Validate on backend** - Never trust client-side validation alone
4. **Use HTTPS** - All API calls must use HTTPS
5. **Implement CSP** - Content Security Policy headers
6. **Audit dependencies** - Run `npm audit` regularly
7. **Principle of least privilege** - Minimal permissions required

```typescript
// ✅ Good - Input sanitization
import DOMPurify from 'dompurify';

function DisplayUserContent({ content }: Props) {
  const sanitized = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

// ✅ Good - Environment variables
const API_KEY = import.meta.env.VITE_API_KEY;
if (!API_KEY) {
  throw new Error('API_KEY environment variable is required');
}
```

---

## Documentation Standards

### Required Documentation
1. **README.md** - Project setup, commands, architecture overview
2. **JSDoc comments** - All exported functions, classes, types
3. **Component documentation** - Props, usage examples
4. **API documentation** - Endpoint specs if applicable
5. **Architecture decisions** - ADRs for major decisions

### JSDoc Template
```typescript
/**
 * Brief one-line description
 * 
 * Longer description with more details about the function's purpose,
 * behavior, and any important notes.
 * 
 * @param paramName - Description of parameter
 * @param optionalParam - Optional parameter description
 * @returns Description of return value
 * @throws {ErrorType} When error condition occurs
 * 
 * @example
 * ```typescript
 * const result = functionName(arg1, arg2);
 * console.log(result);
 * ```
 * 
 * @see {@link RelatedFunction} for related functionality
 * @since 2.0.0
 */
```

---

## Accessibility Standards

### WCAG 2.1 Level AA Compliance
1. **Semantic HTML** - Use proper HTML5 elements
2. **Keyboard navigation** - All interactive elements accessible via keyboard
3. **ARIA labels** - Descriptive labels for screen readers
4. **Color contrast** - Minimum 4.5:1 for normal text
5. **Focus indicators** - Visible focus states
6. **Alt text** - Descriptive alt text for images
7. **Form labels** - All inputs have associated labels

```typescript
// ✅ Good - Accessible button
<button
  aria-label="Close dialog"
  onClick={handleClose}
  className="close-button"
>
  <XIcon aria-hidden="true" />
</button>

// ✅ Good - Accessible form
<form>
  <label htmlFor="email">Email Address</label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby={hasError ? "email-error" : undefined}
  />
  {hasError && (
    <span id="email-error" role="alert">
      Please enter a valid email
    </span>
  )}
</form>
```

---

## Tool Configuration

### Required Tools
- **TypeScript** - Type safety
- **ESLint** - Code quality
- **Prettier** - Code formatting (if not using ESLint formatting)
- **Vitest** - Testing framework
- **React Testing Library** - Component testing
- **Husky** (optional) - Git hooks for pre-commit checks

---

## Documentation Practices

### ⚠️ CRITICAL: Do NOT Create Summary Documents Every Chat Session

**Important guideline:** Avoid creating new markdown documentation files to summarize work at the end of each chat session unless explicitly requested by the user.

**Why:**
- Creates unnecessary file clutter
- Duplicates information already in git commits
- Makes the repository harder to navigate
- Summary docs become outdated quickly

**Instead:**
1. **Use commit messages** - Detailed commit messages already document what changed and why
2. **Update README.md** - If there's critical information users need to know, update the README
3. **Update existing docs** - Modify existing documentation files rather than creating new ones
4. **Use code comments** - Document complex logic directly in code with JSDoc comments

**When to create documentation:**
- ✅ User explicitly requests a summary document
- ✅ New feature requires usage documentation in README
- ✅ Architecture decision requires ADR (Architecture Decision Record)
- ✅ Breaking changes need migration guide
- ❌ Don't create "session-summary.md", "changes-log.md", "work-done.md" automatically

**If critical information must be documented:**
1. First, check if README.md should be updated
2. Check if existing documentation can be enhanced
3. Only create new docs if absolutely necessary and with clear purpose

**Example - Good Practice:**
```markdown
# After adding new feature
✅ Update README.md with new feature description
✅ Add usage example to README
✅ Update package.json scripts if needed
❌ Don't create "feature-summary.md" to document the session
```

---

## Summary

This project adheres to enterprise-grade standards with a **test-first mentality**. Code without passing tests is considered incomplete. Always prioritize:

1. **Tests first** - Write tests, make them pass, then refactor
2. **Type safety** - Leverage TypeScript fully
3. **Readability** - Code is read more than written
4. **Performance** - Monitor and optimize
5. **Security** - Never compromise
6. **Accessibility** - Build for everyone
7. **Documentation** - Help future developers (including yourself)

**Remember: If tests don't pass, the task isn't done. No exceptions.**
