# MVP Setup Guide - BitSchool

This guide will help you complete the setup for your MVP launch.

## ✅ Completed Implementation

The following features have been implemented:

1. **Authentication System (NextAuth)**

    - Google OAuth integration
    - Session management with JWT strategy
    - Custom session callbacks with user ID
    - Auth utilities for server-side checks

2. **Database (Prisma + PostgreSQL)**

    - Complete Prisma schema with 4 tables:
        - Users
        - UserProgress
        - CodeSubmissions
        - UserSessions
    - Prisma client singleton for optimal performance

3. **Server Functions**

    - Progress management (save/load/migrate)
    - Code submission tracking
    - Session analytics tracking

4. **Auth-Aware Progress System**

    - Automatic save to database when authenticated
    - LocalStorage for guest users
    - Seamless migration from guest to authenticated
    - Debounced saves (1 second)

5. **Google Analytics 4**

    - Complete event tracking system
    - Session tracking with active time monitoring
    - Custom events for all user actions
    - Page Visibility API for accurate time tracking

6. **Code Submission Tracking**

    - All code runs tracked in analytics
    - Submissions saved to database (authenticated users)
    - Success/failure tracking
    - Error type categorization

7. **UI Components**

    - AuthButton with sign in/out
    - Header with user info and XP display
    - Analytics component for GA4 initialization

8. **Metadata & SEO**
    - Updated app metadata
    - OpenGraph tags
    - Twitter card support

## 🔧 Setup Steps Required

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be provisioned
4. Go to Project Settings → Database
5. Copy the **Connection String** (make sure to use the **Connection Pooling** string for `DATABASE_URL`)
6. Also copy the **Direct Connection** string for `DIRECT_URL` (needed for migrations)

### 2. Setup Environment Variables

Create a `.env.local` file in your project root with the following:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="your-supabase-connection-pooling-url"
DIRECT_URL="your-supabase-direct-connection-url"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="" # Generate this - see below

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="" # Your GA4 Measurement ID (e.g., G-XXXXXXXXXX)

# Google Ads (Optional - for conversion tracking)
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID="" # Optional

# OpenAI (Already in use for AI features)
OPENAI_API_KEY="" # Your existing key
```

**Generate NEXTAUTH_SECRET (must be 64 bytes):**

```bash
openssl rand -base64 64
```

Or use PowerShell:

```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 3. Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen (if not done):
    - User Type: External
    - App name: BitSchool
    - User support email: your email
    - Developer contact: your email
6. Create OAuth Client ID:
    - Application type: Web application
    - Name: BitSchool
    - Authorized JavaScript origins:
        - `http://localhost:3000` (for development)
        - `https://yourdomain.com` (for production)
    - Authorized redirect URIs:
        - `http://localhost:3000/api/auth/callback/google`
        - `https://yourdomain.com/api/auth/callback/google`
7. Copy the **Client ID** and **Client Secret**
8. Add them to your `.env.local` file

### 4. Setup Google Analytics 4

1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new GA4 property (or use existing)
3. Get your **Measurement ID** (starts with G-)
4. Add it to your `.env.local` as `NEXT_PUBLIC_GA_MEASUREMENT_ID`

**Optional - Google Ads Conversion Tracking:**

1. Link your Google Ads account to GA4
2. Set up conversion events:
    - `auth_signup` - User signs up
    - `lesson_complete` - User completes a lesson
    - Custom milestones (level 5, level 10, etc.)
3. Get your conversion ID and add to `.env.local`

### 5. Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create tables in Supabase
npx prisma migrate dev --name initial_schema

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### 6. Test Locally

```bash
npm run dev
```

Test the following:

-   [ ] Sign in with Google works
-   [ ] Complete a lesson as a guest (check localStorage)
-   [ ] Sign in after completing lesson (data should migrate)
-   [ ] Complete another lesson while signed in (should save to DB)
-   [ ] Sign out and back in (progress should persist)
-   [ ] Open browser DevTools → Network → Filter by "google-analytics.com" to verify GA4 events

### 7. Deploy to Vercel

1. Push your code to GitHub (if not already done)
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Import your GitHub repository
4. Add all environment variables from `.env.local` (except use production URLs)
5. For production environment variables:
    - Update `NEXTAUTH_URL` to your Vercel URL (e.g., `https://your-app.vercel.app`)
    - Use production Google OAuth redirect URI
    - All other variables stay the same

**Important Vercel Settings:**

-   Framework Preset: Next.js
-   Root Directory: `./` (default)
-   Build Command: `npm run build` (default)
-   Output Directory: `.next` (default)

### 8. Update Google OAuth for Production

1. Go back to Google Cloud Console
2. Edit your OAuth Client ID
3. Add your production URLs:
    - Authorized JavaScript origins: `https://your-vercel-app.vercel.app`
    - Authorized redirect URIs: `https://your-vercel-app.vercel.app/api/auth/callback/google`

### 9. Test Production Deployment

-   [ ] Visit your production URL
-   [ ] Test sign in/out
-   [ ] Complete a lesson
-   [ ] Verify analytics events in GA4 (Real-time reports)
-   [ ] Check database in Supabase (Tables should have data)

## 📊 Tracked Analytics Events

The following events are automatically tracked:

### Session Events

-   `session_start` - When user lands on site
-   `session_end` - When user leaves (with duration data)

### Lesson Events

-   `lesson_start` - When user starts a lesson
-   `lesson_complete` - When user completes a lesson
-   `step_complete` - When user completes a step

### Code Events

-   `code_run` - When user runs code
-   `code_submit_correct` - Correct code submission
-   `code_submit_incorrect` - Incorrect code submission

### Progress Events

-   `level_up` - User levels up
-   `skill_node_complete` - User completes a skill tree node

### Auth Events

-   `auth_signup` - New user signs up
-   `auth_signin` - User signs in

## 🎯 Google Ads Integration

To track conversions for your Google Ads campaigns:

1. In Google Ads, go to Tools & Settings → Conversions
2. Create a new conversion action
3. Choose "Import" → "Google Analytics 4"
4. Select the events you want to track as conversions:
    - `auth_signup` - Primary conversion
    - `lesson_complete` - Engagement conversion
    - Custom events for milestones

## 🔍 Monitoring & Analytics

### GA4 Real-Time Reports

Check that events are firing:

1. Go to GA4 → Reports → Real-time
2. Test your app in another tab
3. See events appear in real-time

### Supabase Database

Monitor your database:

1. Go to Supabase → Table Editor
2. Check tables for data:
    - `User` - New users
    - `UserProgress` - User XP and progress
    - `CodeSubmission` - All code submissions
    - `UserSession` - Session data

### Custom Dashboards

Create custom reports in GA4:

-   Time spent on site by cohort
-   Lesson completion rates
-   Drop-off points
-   User retention

## 🐛 Troubleshooting

### "Database connection failed"

-   Check your `DATABASE_URL` is correct
-   Ensure Supabase project is running
-   Verify connection pooling URL is used for `DATABASE_URL`
-   Use direct URL for `DIRECT_URL` (migrations only)

### "OAuth error: redirect_uri_mismatch"

-   Check Google OAuth console redirect URIs match exactly
-   Include both http://localhost:3000 (dev) and production URL
-   Don't forget `/api/auth/callback/google` at the end

### "GA4 events not showing"

-   Check `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set correctly
-   Open DevTools → Console for any GA errors
-   Use GA4 DebugView for detailed event inspection
-   Events may take 24-48 hours to show in standard reports (use Real-time for immediate feedback)

### "Migration not working"

-   Check localStorage has data before signing in
-   Verify user ID is being passed correctly
-   Check browser console for errors
-   Look at Supabase logs for any database errors

## 📝 Additional Notes

### Guest Mode

-   Users can use the app without signing in
-   Progress is saved to localStorage
-   When they sign in, data automatically migrates to database
-   LocalStorage is cleared after successful migration

### Data Privacy

-   Only authenticated users have data saved to database
-   Guest data stays local until they sign in
-   Code submissions are escaped to prevent injection attacks
-   Google Analytics respects do-not-track preferences

### Performance

-   Database saves are debounced (1 second)
-   Prisma connection pooling for optimal performance
-   JWT sessions for fast auth checks
-   Analytics events are batched when possible

## 🚀 Next Steps After Launch

1. Monitor analytics daily for first week
2. Check error rates in Vercel logs
3. Watch user drop-off points
4. Iterate on content based on data
5. Add more lessons based on completion rates
6. Consider A/B testing for key features

## 📞 Support

If you run into issues:

1. Check Vercel logs for errors
2. Check Supabase logs for database issues
3. Use GA4 DebugView for analytics issues
4. Review NextAuth.js documentation for auth issues

---

**Good luck with your launch! 🎉**
