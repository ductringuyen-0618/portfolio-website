# Git Workflow Guide

## 🚨 CRITICAL RULE

**NEVER commit directly to `main` branch!**

All development work must be done on feature branches. This ensures:
- Code review through Pull Requests
- Clean commit history
- Ability to rollback changes easily
- Collaborative development workflow

---

## Prerequisites

### GitHub CLI Authentication

Before you can create branches and PRs, authenticate with GitHub CLI:

```bash
# Check if already authenticated
gh auth status

# If not authenticated, login
gh auth login
```

Follow the prompts to authenticate using your browser or token.

---

## Quick Start (Recommended)

### Using PowerShell Helper Script

The easiest way to follow the workflow:

```powershell
# 1. Load the helper script
. .\scripts\git-workflow.ps1

# 2. Create a new feature branch
New-FeatureBranch "add-user-authentication"

# Or use shorter alias and different prefix
nfb "fix-login-bug" -Prefix "fix"

# 3. Make your changes, then commit
git add .
git commit -m "feat(auth): add OAuth2 login"

# 4. Push changes
git push

# 5. Create Pull Request
New-PullRequest -Title "Add OAuth2 authentication" -Body "Implements Google OAuth2 login"

# Or use interactive mode
npr
```

### Helper Commands

```powershell
# Check git and GitHub status
Get-GitStatus  # or: gst

# Available prefixes: feature, fix, refactor, test, docs, chore, perf
nfb "your-feature-name" -Prefix "feature"
```

---

## Manual Workflow

If you prefer manual git commands:

### Step 1: Create Feature Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Push to remote
git push -u origin feature/your-feature-name
```

### Step 2: Make Changes

```bash
# Make your code changes
# Run tests: npm test
# Check types: npm run type-check
# Lint: npm run lint

# Stage and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push
```

### Step 3: Create Pull Request

```bash
# Interactive PR creation
gh pr create

# Or with details
gh pr create \
  --title "feat: Add new feature" \
  --body "Detailed description of changes"

# Create draft PR
gh pr create --draft
```

### Step 4: After PR Approval

```bash
# Merge via GitHub UI or CLI
gh pr merge --squash

# Update local main
git checkout main
git pull origin main

# Delete feature branch (optional)
git branch -d feature/your-feature-name
```

---

## Branch Naming Conventions

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/add-user-dashboard` |
| `fix/` | Bug fixes | `fix/login-error-handling` |
| `refactor/` | Code refactoring | `refactor/simplify-api-client` |
| `test/` | Adding/updating tests | `test/add-component-tests` |
| `docs/` | Documentation updates | `docs/update-api-docs` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |
| `perf/` | Performance improvements | `perf/optimize-search` |

---

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons
- `refactor`: Code change (no bug fix or feature)
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(auth): add Google OAuth2 login"

# Bug fix
git commit -m "fix(search): correct debounce timing issue"

# Documentation
git commit -m "docs(readme): add testing section"

# Refactor
git commit -m "refactor(components): extract common button styles"

# With body and footer
git commit -m "feat(api): add user profile endpoint

- Add GET /api/users/:id endpoint
- Add user profile validation
- Add comprehensive tests

Closes #123"
```

---

## Pull Request Checklist

Before creating a PR, ensure:

- [ ] ✅ All tests pass (`npm test`)
- [ ] ✅ Code coverage ≥ 80% (`npm run test:coverage`)
- [ ] ✅ No TypeScript errors (`npm run type-check`)
- [ ] ✅ No ESLint errors (`npm run lint`)
- [ ] ✅ Commits follow conventional format
- [ ] ✅ Branch is up to date with main
- [ ] ✅ Documentation updated (if needed)
- [ ] ✅ No `console.log` statements
- [ ] ✅ JSDoc comments added

---

## Common Scenarios

### Starting New Feature

```powershell
# PowerShell
. .\scripts\git-workflow.ps1
nfb "add-payment-integration"
```

```bash
# Bash
gh auth status  # Check auth first
git checkout main
git pull origin main
git checkout -b feature/add-payment-integration
git push -u origin feature/add-payment-integration
```

### Updating Branch with Latest Main

```bash
# While on your feature branch
git checkout main
git pull origin main
git checkout feature/your-feature
git merge main
# Resolve conflicts if any
git push
```

### Creating Draft PR

```bash
# Work in progress
gh pr create --draft

# Mark as ready when done
gh pr ready
```

### Checking What Changed

```bash
# See changes compared to main
git diff main

# See files changed
git diff --name-only main

# See commit history
git log --oneline main..HEAD
```

---

## Troubleshooting

### GitHub CLI Not Authenticated

```
Error: gh auth status failed
```

**Solution:**
```bash
gh auth login
```

### Cannot Push to Main

```
Error: branch 'main' is protected
```

**This is expected!** You should be working on a feature branch:
```bash
git checkout -b feature/your-feature
```

### Branch Already Exists

```bash
# Delete local branch
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature
```

### Forgot to Create Branch

If you made changes on main:

```bash
# Stash your changes
git stash

# Create feature branch
git checkout -b feature/your-feature

# Apply your changes
git stash pop

# Commit and push
git add .
git commit -m "feat: your changes"
git push -u origin feature/your-feature
```

---

## Best Practices

1. **Always sync with main** before starting new work
2. **Keep branches short-lived** - merge frequently
3. **Write descriptive commit messages** - your future self will thank you
4. **Test before pushing** - run tests locally
5. **Keep commits atomic** - one logical change per commit
6. **Request reviews** - get feedback from team
7. **Delete merged branches** - keep repo clean
8. **Never force push** to main (blocked anyway)

---

## Resources

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Branching Model](https://nvie.com/posts/a-successful-git-branching-model/)
- [Project Copilot Instructions](.github/copilot-instructions.md)

---

## Quick Reference Card

```bash
# Setup (once)
gh auth login

# Every feature
git checkout main && git pull
git checkout -b feature/name
# ... make changes ...
git add . && git commit -m "type: message"
git push -u origin feature/name
gh pr create

# PowerShell shortcuts
. .\scripts\git-workflow.ps1
nfb "feature-name"
npm test && git add . && git commit -m "..."
git push
npr
```

**Remember: Never work on `main` directly!** 🚫
