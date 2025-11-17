# Git Workflow Helper Script for PowerShell
# Usage: . .\scripts\git-workflow.ps1

<#
.SYNOPSIS
    Creates a new feature branch with proper naming and GitHub integration
.DESCRIPTION
    Checks GitHub CLI authentication, updates main branch, creates feature branch, 
    and pushes to remote
.PARAMETER BranchName
    The name of the branch (without prefix)
.PARAMETER Prefix
    Branch prefix (feature, fix, refactor, test, docs, chore, perf)
.EXAMPLE
    New-FeatureBranch "add-user-authentication"
    New-FeatureBranch "fix-login-bug" -Prefix "fix"
#>
function New-FeatureBranch {
    param(
        [Parameter(Mandatory=$true, Position=0)]
        [string]$BranchName,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet("feature", "fix", "refactor", "test", "docs", "chore", "perf")]
        [string]$Prefix = "feature"
    )
    
    Write-Host "`n🔄 Starting branch creation workflow..." -ForegroundColor Cyan
    
    # Step 1: Check GH CLI authentication
    Write-Host "`n1️⃣  Checking GitHub CLI authentication..." -ForegroundColor Yellow
    $authStatus = gh auth status 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ GitHub CLI not authenticated!" -ForegroundColor Red
        Write-Host "`nPlease authenticate with GitHub CLI:" -ForegroundColor Yellow
        Write-Host "   gh auth login" -ForegroundColor White
        Write-Host "`nThen run this command again.`n" -ForegroundColor Yellow
        return
    }
    
    Write-Host "✅ GitHub CLI authenticated" -ForegroundColor Green
    
    # Step 2: Check current branch
    $currentBranch = git branch --show-current
    Write-Host "`n2️⃣  Current branch: $currentBranch" -ForegroundColor Yellow
    
    # Step 3: Switch to main and update
    Write-Host "`n3️⃣  Switching to main branch..." -ForegroundColor Yellow
    git checkout main
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to checkout main branch" -ForegroundColor Red
        return
    }
    
    Write-Host "✅ Switched to main" -ForegroundColor Green
    
    # Step 4: Pull latest changes
    Write-Host "`n4️⃣  Pulling latest changes from origin/main..." -ForegroundColor Yellow
    git pull origin main
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to pull latest changes" -ForegroundColor Red
        return
    }
    
    Write-Host "✅ Main branch updated" -ForegroundColor Green
    
    # Step 5: Create new branch
    $fullBranchName = "$Prefix/$BranchName"
    Write-Host "`n5️⃣  Creating branch: $fullBranchName" -ForegroundColor Yellow
    git checkout -b $fullBranchName
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create branch" -ForegroundColor Red
        return
    }
    
    Write-Host "✅ Branch created" -ForegroundColor Green
    
    # Step 6: Push to remote
    Write-Host "`n6️⃣  Pushing branch to remote..." -ForegroundColor Yellow
    git push -u origin $fullBranchName
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to push branch" -ForegroundColor Red
        return
    }
    
    Write-Host "✅ Branch pushed to remote" -ForegroundColor Green
    
    # Success message
    Write-Host "`n" -NoNewline
    Write-Host "🎉 SUCCESS! " -ForegroundColor Green -NoNewline
    Write-Host "Branch " -NoNewline
    Write-Host "$fullBranchName" -ForegroundColor Cyan -NoNewline
    Write-Host " is ready for development`n"
    
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Make your changes"
    Write-Host "  2. Commit with: git commit -m ""$Prefix(...): description"""
    Write-Host "  3. Push changes: git push"
    Write-Host "  4. Create PR: gh pr create`n"
}

<#
.SYNOPSIS
    Creates a Pull Request for the current branch
.DESCRIPTION
    Opens interactive PR creation or accepts title and body parameters
.PARAMETER Title
    Pull request title
.PARAMETER Body
    Pull request description
.PARAMETER Draft
    Create as draft PR
.EXAMPLE
    New-PullRequest
    New-PullRequest -Title "Add feature" -Body "Description" -Draft
#>
function New-PullRequest {
    param(
        [Parameter(Mandatory=$false)]
        [string]$Title,
        
        [Parameter(Mandatory=$false)]
        [string]$Body,
        
        [Parameter(Mandatory=$false)]
        [switch]$Draft
    )
    
    Write-Host "`n📝 Creating Pull Request..." -ForegroundColor Cyan
    
    # Check GH CLI authentication
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ GitHub CLI not authenticated!" -ForegroundColor Red
        Write-Host "Run: gh auth login`n" -ForegroundColor Yellow
        return
    }
    
    # Get current branch
    $currentBranch = git branch --show-current
    
    if ($currentBranch -eq "main") {
        Write-Host "❌ Cannot create PR from main branch!" -ForegroundColor Red
        Write-Host "Please switch to a feature branch first.`n" -ForegroundColor Yellow
        return
    }
    
    Write-Host "Branch: $currentBranch" -ForegroundColor Green
    
    # Build PR command
    $prCommand = "gh pr create"
    
    if ($Title) {
        $prCommand += " --title `"$Title`""
    }
    
    if ($Body) {
        $prCommand += " --body `"$Body`""
    }
    
    if ($Draft) {
        $prCommand += " --draft"
    }
    
    # Create PR
    Write-Host "`nExecuting: $prCommand`n" -ForegroundColor Gray
    Invoke-Expression $prCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Pull Request created successfully!`n" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Failed to create Pull Request`n" -ForegroundColor Red
    }
}

<#
.SYNOPSIS
    Quick check of git and GitHub CLI status
.DESCRIPTION
    Shows current branch, GitHub auth status, and pending changes
.EXAMPLE
    Get-GitStatus
#>
function Get-GitStatus {
    Write-Host "`n📊 Git & GitHub Status" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
    
    # Current branch
    $branch = git branch --show-current
    Write-Host "Current Branch: " -NoNewline
    if ($branch -eq "main") {
        Write-Host $branch -ForegroundColor Red
        Write-Host "⚠️  WARNING: You're on main branch! Create a feature branch before making changes." -ForegroundColor Yellow
    } else {
        Write-Host $branch -ForegroundColor Green
    }
    
    # Git status
    Write-Host "`nGit Status:" -ForegroundColor Yellow
    git status --short
    
    # GitHub auth
    Write-Host "`nGitHub CLI Auth:" -ForegroundColor Yellow
    gh auth status 2>&1 | Select-Object -First 2
    
    Write-Host ""
}

# Aliases for convenience
Set-Alias -Name nfb -Value New-FeatureBranch
Set-Alias -Name npr -Value New-PullRequest
Set-Alias -Name gst -Value Get-GitStatus

# Show help on load
Write-Host "`n✨ Git Workflow Helpers Loaded!" -ForegroundColor Green
Write-Host "`nAvailable Commands:" -ForegroundColor Cyan
Write-Host "  New-FeatureBranch (nfb) - Create new feature branch"
Write-Host "  New-PullRequest (npr)    - Create pull request"
Write-Host "  Get-GitStatus (gst)      - Check git/GitHub status"
Write-Host "`nExamples:" -ForegroundColor Yellow
Write-Host "  nfb 'add-user-auth'"
Write-Host "  nfb 'fix-login' -Prefix fix"
Write-Host "  npr -Title 'Add feature' -Body 'Description'"
Write-Host "  gst`n"

# Export functions
Export-ModuleMember -Function New-FeatureBranch, New-PullRequest, Get-GitStatus
