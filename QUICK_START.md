# Quick Start Guide

## 🎯 First Time Setup (5 minutes)

### 1. Authenticate GitHub CLI
```bash
gh auth login
```
Follow the prompts to authenticate via browser.

### 2. Verify Setup
```bash
gh auth status
```
You should see: ✓ Logged in to github.com

---

## 🚀 Daily Workflow (Every Feature/Fix)

### PowerShell (Recommended)

```powershell
# Step 1: Load helper script
. .\scripts\git-workflow.ps1

# Step 2: Create feature branch
nfb "add-amazing-feature"

# Step 3: Write code + tests
# ... make your changes ...

# Step 4: Test everything
npm test
npm run type-check
npm run lint

# Step 5: Commit changes
git add .
git commit -m "feat: add amazing feature"
git push

# Step 6: Create Pull Request
npr -Title "Add amazing feature" -Body "This adds X, Y, Z"

# Step 7: After approval, merge via GitHub UI
```

### Manual (Any Shell)

```bash
# Step 1: Create feature branch
git checkout main
git pull origin main
git checkout -b feature/add-amazing-feature
git push -u origin feature/add-amazing-feature

# Step 2: Write code + tests
# ... make your changes ...

# Step 3: Test everything
npm test
npm run type-check
npm run lint

# Step 4: Commit changes
git add .
git commit -m "feat: add amazing feature"
git push

# Step 5: Create Pull Request
gh pr create

# Step 6: After approval, merge via GitHub UI
```

---

## 🎨 Branch Naming Quick Reference

| Type | Prefix | Example |
|------|--------|---------|
| ✨ Feature | `feature/` | `feature/add-user-dashboard` |
| 🐛 Bug Fix | `fix/` | `fix/login-error` |
| 📝 Docs | `docs/` | `docs/update-readme` |
| ♻️ Refactor | `refactor/` | `refactor/cleanup-api` |
| ✅ Tests | `test/` | `test/add-unit-tests` |
| 🔧 Chore | `chore/` | `chore/update-deps` |
| ⚡ Performance | `perf/` | `perf/optimize-search` |

---

## ✅ Pre-PR Checklist

Before creating a Pull Request:

```bash
# Run all checks
npm test              # ✅ All tests pass?
npm run test:coverage # ✅ Coverage ≥ 80%?
npm run type-check    # ✅ No TypeScript errors?
npm run lint          # ✅ No ESLint errors?
```

- [ ] ✅ Tests pass
- [ ] ✅ Coverage meets threshold
- [ ] ✅ No TypeScript errors
- [ ] ✅ No ESLint errors
- [ ] ✅ Conventional commit messages
- [ ] ✅ Documentation updated
- [ ] ✅ No `console.log` statements

---

## 🆘 Common Issues

### Issue: "gh: command not found"
**Solution:** Install GitHub CLI
```bash
# Windows (via winget)
winget install --id GitHub.cli

# macOS (via Homebrew)
brew install gh
```

### Issue: "gh auth status" fails
**Solution:** Authenticate
```bash
gh auth login
```

### Issue: Accidentally made changes on main
**Solution:** Stash and move to feature branch
```bash
git stash
git checkout -b feature/your-feature
git stash pop
git add .
git commit -m "feat: your changes"
git push -u origin feature/your-feature
```

### Issue: Tests failing
**Solution:** Check test output
```bash
npm test -- --reporter=verbose
```

### Issue: Need to update branch with latest main
**Solution:** Merge main into your branch
```bash
git checkout main
git pull origin main
git checkout your-feature-branch
git merge main
# Resolve conflicts if any
git push
```

---

## 📚 Documentation Links

- **Git Workflow**: [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) - Complete workflow guide
- **Testing**: [TESTING.md](./TESTING.md) - Testing standards and examples
- **Copilot Instructions**: [.github/copilot-instructions.md](.github/copilot-instructions.md) - Full enterprise standards

---

## 💡 Pro Tips

1. **Use aliases** - Add to PowerShell profile:
   ```powershell
   # Add to $PROFILE
   function Start-Feature { . .\scripts\git-workflow.ps1; nfb $args[0] }
   Set-Alias sf Start-Feature
   
   # Now use: sf "feature-name"
   ```

2. **Test in watch mode** while developing:
   ```bash
   npm run test:watch
   ```

3. **Check status** anytime:
   ```powershell
   . .\scripts\git-workflow.ps1
   gst  # Get-GitStatus
   ```

4. **Create draft PRs** for work in progress:
   ```bash
   gh pr create --draft
   ```

---

## 🎯 Remember

1. **Never work on main** - Always use feature branches
2. **Tests must pass** - Code without passing tests is incomplete
3. **Follow naming conventions** - Use proper branch prefixes
4. **Write good commit messages** - Use conventional commits format
5. **Review before PR** - Run all checks locally first

---

**Need Help?**
- Check [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) for detailed guides
- See [TESTING.md](./TESTING.md) for testing help
- Review [.github/copilot-instructions.md](.github/copilot-instructions.md) for standards
