# Environment Variables Template

Copy this to create your `.env.local` file:

```env
# Database (Supabase PostgreSQL)
# Get from: Supabase → Project Settings → Database → Connection Pooling
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"

# Direct database connection (for migrations only)
# Get from: Supabase → Project Settings → Database → Connection String
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
# Generate with: openssl rand -base64 64
# Or PowerShell: [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
NEXTAUTH_SECRET="your-generated-secret-here"

# Google OAuth
# Get from: Google Cloud Console → APIs & Services → Credentials
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Analytics 4
# Get from: Google Analytics → Admin → Data Streams → Web → Measurement ID
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Google Ads (Optional - for conversion tracking)
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID=""

# LocalStorage Encryption
# Generate with: openssl rand -base64 32
# Or PowerShell: [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
LOCAL_STORAGE_SECRET="your-generated-storage-secret-here"

# OpenAI API (for AI features)
OPENAI_API_KEY="sk-..."
```

## Production Environment Variables (Vercel)

For production deployment, update:

-   `NEXTAUTH_URL` → Your production URL (e.g., `https://bitschool.vercel.app`)
-   Keep all other variables the same
-   Make sure to add production OAuth redirect URI in Google Cloud Console
