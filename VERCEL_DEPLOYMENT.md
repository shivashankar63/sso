# Vercel Deployment Guide

This guide will help you deploy your SSO Dashboard to Vercel.

## Prerequisites

- GitHub repository with your code
- Vercel account (sign up at https://vercel.com)

## Step 1: Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository: `shivashankar63/SSO`
4. Vercel will automatically detect Next.js

## Step 2: Configure Environment Variables

**CRITICAL**: You must add all environment variables in Vercel before deploying.

### Required Environment Variables

Go to **Project Settings > Environment Variables** and add:

#### Supabase Configuration (Required)
```
NEXT_PUBLIC_SUPABASE_URL=https://snvyotfofpdkheecupho.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Clerk Configuration (Optional - if using authentication)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
CLERK_JWT_SECRET=your-jwt-secret
```

### How to Add Environment Variables in Vercel

1. In your project settings, go to **Environment Variables**
2. Click **"Add New"**
3. Enter the variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
4. Enter the value
5. Select environments: **Production**, **Preview**, and **Development**
6. Click **"Save"**
7. Repeat for all variables

## Step 3: Deploy

1. After adding environment variables, go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment (or push a new commit)
3. Wait for the build to complete

## Step 4: Verify Deployment

1. Once deployed, click on the deployment URL
2. Check the browser console for any errors
3. Verify that the dashboard loads correctly

## Common Deployment Issues

### Issue 1: "Missing environment variables"

**Solution**: Make sure all `NEXT_PUBLIC_*` variables are set in Vercel project settings.

### Issue 2: "Build failed"

**Solution**: 
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors

### Issue 3: "API routes returning 500 errors"

**Solution**:
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Check Supabase project is active and accessible
- Review API route logs in Vercel dashboard

### Issue 4: "Module not found"

**Solution**:
- Run `npm install` locally to ensure `package-lock.json` is up to date
- Commit `package-lock.json` to repository
- Redeploy

## Step 5: Configure Custom Domain (Optional)

1. Go to **Project Settings > Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

## Environment-Specific Variables

You can set different values for:
- **Production**: Live site
- **Preview**: Pull request previews
- **Development**: Local development (if using Vercel CLI)

## Post-Deployment Checklist

- [ ] All environment variables are set
- [ ] Build completes successfully
- [ ] Dashboard loads without errors
- [ ] API routes are accessible
- [ ] Supabase connection works
- [ ] User creation works
- [ ] Site syncing works

## Troubleshooting

### View Logs

1. Go to **Deployments** tab
2. Click on a deployment
3. Click **"View Function Logs"** to see runtime errors

### Test API Routes

Test your API routes after deployment:
```
https://your-app.vercel.app/api/test/hrms-connection
```

### Check Build Logs

If build fails:
1. Go to **Deployments** tab
2. Click on failed deployment
3. Review build logs for errors

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Ensure Supabase project is active
4. Check Next.js build output for errors

---

**Your app should now be live on Vercel!** 🚀
