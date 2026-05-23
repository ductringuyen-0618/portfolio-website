# GitHub Pages Deployment Guide

This guide will help you deploy your portfolio website to GitHub Pages using GitHub Actions.

## 🚀 Quick Setup

### Step 1: Push to GitHub

1. **Create a new repository** on GitHub named `portfolio-website`
2. **Initialize git** in your project folder:
```bash
git init
git add .
git commit -m "Initial commit: Portfolio website with GitHub Pages deployment"
```

3. **Add remote and push**:
```bash
git remote add origin https://github.com/ductringuyen-0618/portfolio-website.git
git branch -M main
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. The workflow will automatically trigger on the next push

### Step 3: Verify Deployment

1. Go to the **Actions** tab in your repository
2. You should see the "Deploy to GitHub Pages" workflow running
3. Once completed, your site will be available at:
   `https://ductringuyen-0618.github.io/portfolio-website/`

## 🔧 Configuration Details

### Vite Configuration

The `vite.config.ts` has been configured with:
- `base: '/portfolio-website/'` - Sets the correct base path for GitHub Pages
- `outDir: 'dist'` - Output directory for built files

### GitHub Actions Workflow

The `.github/workflows/deploy.yml` file:
- Triggers on pushes to the `main` branch
- Builds the project using Node.js 18
- Deploys to GitHub Pages automatically

## 🛠️ Customization

### Change Repository Name

If you want to use a different repository name:

1. Update `base` in `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ... other config
})
```

2. Update the README.md live demo URL

### Custom Domain

To use a custom domain:

1. Add a `CNAME` file to the `public/` folder with your domain
2. Update `base: '/'` in `vite.config.ts`
3. Configure your domain's DNS settings

## 📋 Troubleshooting

### Build Fails
- Check the Actions tab for error details
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation with `npm run type-check`

### 404 Errors
- Verify the `base` path in `vite.config.ts` matches your repository name
- Check that all routes are properly configured for SPA

### Assets Not Loading
- Ensure all asset paths are relative
- Check that the `base` configuration is correct

## 🔄 Manual Deployment

If you need to deploy manually:

```bash
# Build the project
npm run build

# The dist/ folder contains your built site
# You can upload this to any static hosting service
```

## 📝 Environment Variables

For production builds, you can add environment variables:

1. Go to repository **Settings** > **Secrets and variables** > **Actions**
2. Add any required environment variables
3. Reference them in the workflow file if needed

## 🎯 Next Steps

After successful deployment:

1. ✅ Update your LinkedIn and resume with the live portfolio URL
2. ✅ Share the portfolio link with potential employers
3. ✅ Monitor the site performance and user experience
4. ✅ Keep the portfolio updated with new projects

Your portfolio is now live and automatically deploys on every update! 🎉
