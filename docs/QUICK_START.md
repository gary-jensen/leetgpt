# Quick Start Checklist

Follow these steps in order to launch your MVP:

## ☐ 1. Create Supabase Project (5 minutes)

1. Go to [supabase.com](https://supabase.com) and sign up/in
2. Click "New Project"
3. Choose a name (e.g., "bitschool-mvp")
4. Set a strong database password (save it!)
5. Choose a region close to your users
6. Wait for project to be created (~2 minutes)

## ☐ 2. Get Supabase Connection Strings (2 minutes)

1. Go to Project Settings → Database
2. Under "Connection Pooling":
    - Copy the connection string
    - Replace `[YOUR-PASSWORD]` with your database password
    - This is your `DATABASE_URL`
3. Under "Connection String":
    - Copy the direct connection string
    - Replace `[YOUR-PASSWORD]` with your database password
    - This is your `DIRECT_URL`

## ☐ 3. Setup Google OAuth (10 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen (if needed):
    - App name: "BitSchool"
    - User support email: your email
6. Create OAuth Client:
    - Application type: Web application
    - Add authorized redirect URIs:
        - `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Client Secret

## ☐ 4. Setup Google Analytics (5 minutes)

1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new GA4 property (or use existing)
3. Add a web data stream
4. Copy your Measurement ID (starts with G-)

## ☐ 5. Create .env.local File (5 minutes)

1. In your project root, create `.env.local`
2. Use the `ENV_TEMPLATE.md` file as reference
3. Fill in all the values you collected above
4. Generate NEXTAUTH_SECRET (must be 64 bytes):
    ```bash
    openssl rand -base64 64
    ```
    Or PowerShell:
    ```powershell
    [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
    ```

## ☐ 6. Run Database Migrations (2 minutes)

```bash
cd c:\Users\Gary\MyFiles\Code\ai-bitschool
npx prisma generate
npx prisma migrate dev --name initial_schema
```

## ☐ 7. Test Locally (10 minutes)

```bash
npm run dev
```

Open http://localhost:3000/learn and test:

-   [ ] Page loads without errors
-   [ ] Can complete a lesson as guest
-   [ ] Can click "Sign In with Google"
-   [ ] Sign in works (redirects back)
-   [ ] Header shows your name and profile image
-   [ ] Complete another lesson
-   [ ] Sign out works
-   [ ] Sign back in and progress is still there

**Check Analytics:**

-   Open browser DevTools → Network tab
-   Filter by "google-analytics.com"
-   You should see analytics events firing

**Check Database:**

-   Go to Supabase → Table Editor
-   Check `User` table - you should see your account
-   Check `UserProgress` table - you should see your progress
-   Check `CodeSubmission` table - you should see your submissions

## ☐ 8. Deploy to Vercel (10 minutes)

1. Push your code to GitHub (if not already):

    ```bash
    git add .
    git commit -m "MVP implementation complete"
    git push
    ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Import Project"
4. Select your GitHub repository
5. Add environment variables (copy from `.env.local` but update `NEXTAUTH_URL`)
6. Click "Deploy"
7. Wait for deployment (~3 minutes)

## ☐ 9. Update Google OAuth for Production (5 minutes)

1. Go back to Google Cloud Console
2. Edit your OAuth Client ID
3. Add production redirect URI:
    - `https://your-vercel-app.vercel.app/api/auth/callback/google`
4. Save

## ☐ 10. Test Production (10 minutes)

1. Visit your Vercel URL
2. Test all features again (same as local testing)
3. Check GA4 Real-time reports to see events
4. Check Supabase database for new entries

---

## 🎉 You're Live!

Total time: ~1 hour

## 📊 Next Steps

### Monitor Your Launch

-   Check GA4 daily for first week
-   Watch Vercel logs for errors
-   Monitor Supabase database usage
-   Track user acquisition and retention

### Google Ads Setup (When Ready)

1. Link GA4 to Google Ads account
2. Create conversion actions from GA4 events
3. Set up your first campaign
4. Track conversions and optimize

### Iterate Based on Data

-   Find drop-off points in lessons
-   See which lessons are most popular
-   Identify common errors
-   Optimize based on real user behavior

---

## 🆘 Need Help?

**Common Issues:**

1. **"Database connection failed"**

    - Check your connection strings
    - Make sure you replaced `[YOUR-PASSWORD]`
    - Verify Supabase project is running

2. **"OAuth redirect_uri_mismatch"**

    - Check Google OAuth redirect URIs match exactly
    - Include `/api/auth/callback/google` at the end

3. **"GA4 events not showing"**

    - Check Measurement ID is correct
    - Use Real-time reports (not standard reports)
    - Check browser console for errors

4. **"Build failed on Vercel"**
    - Check environment variables are all set
    - Check build logs for specific errors
    - Make sure all dependencies are in package.json

**Documentation:**

-   Read `MVP_SETUP_GUIDE.md` for detailed instructions
-   Read `IMPLEMENTATION_SUMMARY.md` for what was implemented
-   Check `ENV_TEMPLATE.md` for environment variable format

**Good luck with your launch! 🚀**
