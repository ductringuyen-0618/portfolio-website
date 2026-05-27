@echo off
REM Manual deploy trigger for portfolio-website.
REM 
REM The repo's push trigger in .github/workflows/deploy.yml is configured
REM correctly (on: push: branches: ['main']) but GitHub-side trigger
REM registration is currently not firing on push events. Until the
REM upstream behaviour is resolved, run this after any commit/push to
REM force a deploy.
REM
REM Requires: gh CLI (https://cli.github.com), authenticated as the repo owner.

echo Triggering deploy to GitHub Pages...
gh workflow run deploy.yml --ref main
if errorlevel 1 (
  echo Failed. Run gh auth status to check CLI auth.
  exit /b 1
)
echo Triggered. Watch: gh run watch