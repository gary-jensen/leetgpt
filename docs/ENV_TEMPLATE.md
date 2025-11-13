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

# GitHub OAuth
# Get from: GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

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

# Redis (for rate limiting) - OPTIONAL for local development
# Get from: Redis Cloud, Upstash, or any Redis provider
# For local development, you can use a local Redis instance or leave unset
# If not set, rate limiting will use in-memory fallback (resets on server restart)
REDIS_URL="redis://localhost:6379"

# Stripe Configuration
# Get from: Stripe Dashboard → Developers → API keys
STRIPE_SECRET_KEY="sk_test_..."  # Test mode key for development
# STRIPE_SECRET_KEY="sk_live_..."  # Live mode key for production

# Stripe Webhook Secret
# For local testing: Get from `stripe listen` command output
# For production: Get from Stripe Dashboard → Developers → Webhooks → [Your Endpoint] → Signing secret
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs (Public - safe to expose)
# Get from: Stripe Dashboard → Products → [Your Product] → Pricing
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY="price_..."
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY="price_..."
NEXT_PUBLIC_STRIPE_PRICE_EXPERT_MONTHLY="price_..."
NEXT_PUBLIC_STRIPE_PRICE_EXPERT_YEARLY="price_..."

# App URL (for Stripe redirects)
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Local development
# NEXT_PUBLIC_APP_URL="https://yourdomain.com"  # Production
```

## Production Environment Variables (Vercel)

For production deployment, update:

-   `NEXTAUTH_URL` → Your production URL (e.g., `https://bitschool.vercel.app`)
-   Keep all other variables the same
-   Make sure to add production OAuth redirect URI in Google Cloud Console
