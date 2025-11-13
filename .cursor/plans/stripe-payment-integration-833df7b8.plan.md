<!-- 833df7b8-cddb-4102-afc9-68dba4b3e628 b630b739-683e-4c22-9d72-da0fcb023425 -->
# Stripe Payment Integration & PRO Plan Implementation

## Overview

Implement complete Stripe subscription integration where all new users automatically get a 3-day free trial on signup. After trial, users must choose between PRO or PRO_PLUS subscription plans (each with monthly/yearly options). Build two billing pages: one with single PRO plan, one with both PRO and PRO_PLUS plans. No free BASIC plan - all users start with trial access.

## Pricing Structure

- **PRO Monthly**: $9.99/month (discounted from $29.99/month) - 67% savings
- **PRO Yearly**: $29.99/year (discounted from $99.99/year) - 70% savings
- **PRO_PLUS Monthly**: $14.99/month (discounted from $44.99/month) - 67% savings (50% more than PRO)
- **PRO_PLUS Yearly**: $44.99/year (discounted from $149.99/year) - 70% savings (50% more than PRO)
- **3-day free trial** automatically starts on signup/login
- No free BASIC plan - all users start with trial, then must subscribe

## Access Model & Limits

- **New users on signup**: Automatically get PRO role with subscriptionStatus="trialing" (3-day trial starts immediately)
- **TRIAL users** (role=PRO, subscriptionStatus="trialing"): Lower limits (10 hint-chat, 10 submissions/hour)
- **PRO users** (role=PRO, subscriptionStatus="active", stripePriceId=PRO monthly/yearly): Standard limits (60 hint-chat, 100 submissions/hour)
- **PRO_PLUS users** (role=PRO, subscriptionStatus="active", stripePriceId=PRO_PLUS monthly/yearly): Higher limits (120 hint-chat, 200 submissions/hour - double PRO)
- **Canceled users** (role=BASIC, subscriptionStatus=null): No access to algorithm features (downgraded after cancellation)
- Plan tier determined by stripePriceId (PRO vs PRO_PLUS)
- Trial status tracked via `subscriptionStatus` field in User model
- **Important**: Do not mention specific limit numbers in UI - use "higher limits" or similar language

## Implementation Plan

### 1. Database Schema Updates

**File**: `prisma/schema.prisma`

Add Stripe-related fields to User model:

- `stripeCustomerId` (String?, unique) - Stripe customer ID
- `stripeSubscriptionId` (String?, unique) - Active subscription ID
- `stripePriceId` (String?) - Current price plan ID (determines PRO vs PRO_PLUS)
- `stripeCurrentPeriodEnd` (DateTime?) - Subscription renewal date or trial end date
- `subscriptionStatus` (String?) - null, "trialing", "active", "canceled", "past_due", etc.
- null = Canceled user (no access)
- "trialing" = Trial user (lower limits)
- "active" = Paid user (PRO or PRO_PLUS limits based on stripePriceId)

Create migration to add these fields.

### 2. Update Auth Flow - Auto Start Trial

**File**: `src/lib/auth.ts`

Update `createUser` event to automatically start free trial:

- Set role = PRO
- Set subscriptionStatus = "trialing"
- Set stripeCurrentPeriodEnd = now + 3 days (trial end date)
- Note: Stripe customer and subscription will be created when user picks a plan during checkout

### 3. Stripe Client Setup

**File**: `src/lib/stripe.ts` (new)

- Initialize Stripe client with secret key from env
- Define price IDs as constants (from Stripe Dashboard):
- `STRIPE_PRICE_PRO_MONTHLY` - PRO Monthly plan price ID ($9.99)
- `STRIPE_PRICE_PRO_YEARLY` - PRO Yearly plan price ID ($29.99)
- `STRIPE_PRICE_PRO_PLUS_MONTHLY` - PRO_PLUS Monthly plan price ID ($14.99)
- `STRIPE_PRICE_PRO_PLUS_YEARLY` - PRO_PLUS Yearly plan price ID ($44.99)
- Export helper functions:
- `getStripe()` - Get Stripe instance
- `createCustomer()` - Create Stripe customer
- `createCheckoutSession(priceId: string, trialDays?: number)` - Create checkout session with 3-day trial (or use remaining trial days)
- `createPortalSession()` - Create customer portal session for billing management
- `getSubscription()` - Get subscription details
- `cancelSubscription()` - Cancel subscription
- `updateSubscription()` - Update subscription plan
- `isProPlusPrice(priceId: string)` - Check if price ID is PRO_PLUS tier
- `getPlanTier(priceId: string)` - Returns "PRO" or "PRO_PLUS" based on priceId

### 4. Environment Variables

**File**: `.env.local` (add to example)

Required variables:

- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (for client)
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Public key for client-side
- `NEXT_PUBLIC_APP_URL` - Base URL for redirects

### 5. Server Actions for Billing

**File**: `src/lib/actions/billing.ts` (new)

Server actions:

- `createCheckoutSession(priceId: string)` - Create Stripe checkout session with 3-day trial (or use remaining trial days if user already in trial), redirect to Stripe
- `createPortalSession()` - Create customer portal session for managing subscription
- `getSubscriptionStatus()` - Get current user's subscription status (including trial status, days remaining, and plan tier PRO/PRO_PLUS)
- `getTrialDaysRemaining()` - Calculate days remaining in trial from stripeCurrentPeriodEnd
- `getCurrentPlanTier()` - Returns "PRO" or "PRO_PLUS" based on user's stripePriceId
- `updateUserRole(userId: string, role: Role)` - Update user role (used by webhook)
- `syncSubscriptionFromStripe(stripeCustomerId: string)` - Sync subscription data from Stripe

### 6. Stripe Webhook Handler

**File**: `src/app/api/stripe/webhook/route.ts` (new)

Handle Stripe webhook events:

- `checkout.session.completed` - User completed checkout:
- Set role = PRO, subscriptionStatus = "trialing" (if trial period) or "active" (if no trial)
- Update stripeCustomerId, stripeSubscriptionId, stripePriceId, stripeCurrentPeriodEnd
- `customer.subscription.trial_will_end` - Trial ending soon (optional for MVP - could send reminder)
- `customer.subscription.updated` - Subscription updated:
- If trial ended and payment succeeded: subscriptionStatus = "active" (keep PRO role)
- If trial ended and payment failed: subscriptionStatus = "past_due" (keep PRO role)
- If plan changed (PRO to PRO_PLUS or vice versa): Update stripePriceId
- `customer.subscription.deleted` - Subscription canceled:
- Set role = BASIC, subscriptionStatus = null (downgrade to BASIC, no access)
- `invoice.payment_succeeded` - Payment successful (after trial ends):
- Ensure subscriptionStatus = "active"
- `invoice.payment_failed` - Payment failed:
- Set subscriptionStatus = "past_due" (may want to keep PRO access during grace period)

### 7. Billing Page - Single Plan (PRO only)

**File**: `src/app/billing/page.tsx` (new)

**Trial Banner** (if subscriptionStatus="trialing"):

- Banner at top: "You have X days left in your free trial - Pick a plan for $0 to keep LeetGPT running without interruption"
- Calculate days remaining from stripeCurrentPeriodEnd
- Link to plan selection below

**Monthly/Yearly Toggle**:

- Toggle switch between "Monthly" and "Yearly" billing
- Shows "2 months free" or savings badge for yearly

**PRO Plan Card** (single card, content changes based on toggle):

- **When Monthly selected**:
- Title: "PRO"
- Price during trial: "$0 then $9.99/month in X days"
- Price if not in trial: "$9.99/month"
- Original price: "$29.99/month" (strikethrough) with "67% off" badge
- Features list with checkmarks (no specific limit numbers):
- AI-powered hints and chat
- Submission feedback
- All algorithm problems and lessons
- Progress tracking
- Priority support
- CTA: "Pick Monthly plan" button
- Note during trial: "No charge until your free trial ends in X days"

- **When Yearly selected**:
- Title: "PRO"
- Price during trial: "$0 then $29.99/year in X days"
- Price if not in trial: "$29.99/year"
- Original price: "$99.99/year" (strikethrough) with "70% off" badge
- Features list (same as monthly)
- CTA: "Pick Yearly plan" button
- Highlight: "Save 70% with yearly"
- Note during trial: "No charge until your free trial ends in X days"

**For existing subscribers** (subscriptionStatus="active"):

- Show current subscription status
- Next billing date
- Current plan (PRO monthly/yearly) highlighted
- "Manage Subscription" button (opens Stripe Customer Portal)
- "Cancel Subscription" option

### 7b. Billing Page - Two Plans (PRO and PRO_PLUS)

**File**: `src/app/billing/two-plans/page.tsx` (new)

**Trial Banner** (if subscriptionStatus="trialing"):

- Same banner as single plan page

**Monthly/Yearly Toggle**:

- Toggle switch that affects both plan cards simultaneously
- Shows "2 months free" or savings badge for yearly
- Positioned above or between plan cards

**Plan Cards** (displayed side-by-side):

- **PRO Plan Card**:
- Title: "PRO"
- Price during trial (monthly): "$0 then $9.99/month in X days"
- Price during trial (yearly): "$0 then $29.99/year in X days"
- Price if not in trial: "$9.99/month" or "$29.99/year" (based on toggle)
- Original prices: "$29.99/month" or "$99.99/year" (strikethrough) with "67% off" or "70% off" badge
- Features list with checkmarks (no specific limit numbers):
- AI-powered hints and chat
- Submission feedback
- All algorithm problems and lessons
- Progress tracking
- Priority support
- CTA: "Pick PRO plan" button (updates based on monthly/yearly toggle)
- Note during trial: "No charge until your free trial ends in X days"

- **PRO_PLUS Plan Card**:
- Title: "PRO_PLUS" (or "PRO+")
- Price during trial (monthly): "$0 then $14.99/month in X days"
- Price during trial (yearly): "$0 then $44.99/year in X days"
- Price if not in trial: "$14.99/month" or "$44.99/year" (based on toggle)
- Original prices: "$44.99/month" or "$149.99/year" (strikethrough) with "67% off" or "70% off" badge
- Features list with checkmarks (no specific limit numbers):
- All PRO features
- Higher limits for hints and chat
- Higher limits for submission feedback
- Everything in PRO, plus more
- CTA: "Pick PRO_PLUS plan" button (updates based on monthly/yearly toggle)
- Highlight: "Most popular" or "Best value" badge (optional)
- Note during trial: "No charge until your free trial ends in X days"

**For existing subscribers** (subscriptionStatus="active"):

- Show current subscription status
- Next billing date
- Current plan (PRO or PRO_PLUS, monthly/yearly) highlighted
- "Manage Subscription" button (opens Stripe Customer Portal)
- "Cancel Subscription" option

### 8. Trial Banner Component

**File**: `src/components/TrialBanner.tsx` (new)

Banner component to show trial countdown:

- Display: "You have X days left in your free trial - Pick a plan for $0 to keep LeetGPT running without interruption"
- Calculate days remaining from user's stripeCurrentPeriodEnd
- Link to /billing page
- Show in algorithm workspace (WorkspaceNavbar or top of page)
- Only show if subscriptionStatus="trialing"
- Styled similar to DataFast's yellow banner

### 9. Checkout Flow

**File**: `src/app/checkout/page.tsx` (new, optional - can redirect directly to Stripe)

If needed, intermediate page that:

- Shows plan selection (monthly vs yearly, PRO vs PRO_PLUS)
- Calls `createCheckoutSession` server action
- Redirects to Stripe Checkout

Alternatively, can redirect directly to Stripe from billing page.

### 10. Payment Success Page

**File**: `src/app/payment/success/page.tsx` (new)

- Thank user for subscribing
- Show subscription details (plan tier PRO/PRO_PLUS, monthly/yearly, trial end date if applicable)
- Link to algorithm workspace
- Handle session_id from Stripe redirect

### 11. Payment Cancel Page

**File**: `src/app/payment/cancel/page.tsx` (new)

- Inform user payment was canceled
- Option to try again
- Link back to billing page

### 12. UI Components for Trial & Upgrade Prompts

**Files**:

- `src/components/TrialBanner.tsx` (new) - Banner showing trial countdown, links to billing
- `src/components/UpgradePrompt.tsx` (new) - Show when user hits limits or trial ending, with CTA to pick plan
- `src/components/ProBadge.tsx` (new) - Badge showing PRO or PRO_PLUS status in navbar/profile (only for active subscribers, not trial)

### 13. Update Access Control & Limit System

**Files**:

- `src/lib/hourlyLimits.ts` - Update to check subscriptionStatus and stripePriceId for limit tiers:
- Canceled (role=BASIC or subscriptionStatus=null): 0/0 (no access)
- TRIAL (role=PRO, subscriptionStatus="trialing"): 10/10 per hour
- PRO (role=PRO, subscriptionStatus="active", PRO priceId): 60/100 per hour
- PRO_PLUS (role=PRO, subscriptionStatus="active", PRO_PLUS priceId): 120/200 per hour (double PRO)
- `src/app/algorithms/problems/[problemSlug]/page.tsx` - Add access check to block canceled users (BASIC role)
- `src/app/algorithms/problems/page.tsx` - Add access check to block canceled users
- `src/app/algorithms/lessons/**` - Add access checks to block canceled users
- `src/features/algorithms/components/WorkspaceNavbar.tsx` - Add trial banner component, show PRO/PRO_PLUS badge if active (not trial)
- `src/features/algorithms/components/ProblemStatementChat.tsx` - Show upgrade prompt when limits hit or trial ending soon
- Update limit error messages to link to billing page (don't mention specific numbers)
- Add "Pick a plan" prompts for trial users approaching trial end

### 14. Stripe Dashboard Setup

**Configuration needed**:

- Create products in Stripe Dashboard:
- "LeetGPT Pro - Monthly" ($9.99/month, recurring)
- "LeetGPT Pro - Yearly" ($29.99/year, recurring)
- "LeetGPT Pro Plus - Monthly" ($14.99/month, recurring)
- "LeetGPT Pro Plus - Yearly" ($44.99/year, recurring)
- Enable trial period: 3 days free trial (configure in Stripe product settings or pass trial_period_days in checkout session)
- Configure webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
- Set webhook events to listen for: checkout.session.completed, customer.subscription.*, invoice.*, customer.subscription.trial_will_end

## Implementation Order

1. Database schema updates and migration
2. Update auth flow to auto-start 3-day trial on signup
3. Stripe client setup and environment variables (all 4 price IDs: PRO monthly/yearly, PRO_PLUS monthly/yearly)
4. Server actions for billing operations (including trial days calculation, plan tier detection)
5. Webhook handler (critical for subscription sync, handle PRO to PRO_PLUS upgrades)
6. Billing page - single plan (PRO only) with monthly/yearly toggle
7. Billing page - two plans (PRO and PRO_PLUS) with monthly/yearly toggle
8. Trial banner component
9. Checkout flow and success/cancel pages
10. UI components (trial banner, upgrade prompts, PRO/PRO_PLUS badges)
11. Update access control and limit system (PRO vs PRO_PLUS based on priceId)
12. Integration with existing workspace components
13. Testing with Stripe test mode

## Testing Considerations

- Use Stripe test mode with test cards
- Test subscription lifecycle: create, update, cancel
- Test plan upgrades: PRO to PRO_PLUS (and vice versa)
- Test trial period: verify PRO access during trial with lower limits, role/subscriptionStatus update after trial ends
- Test access control: Canceled users blocked from algorithm features
- Test limit tiers: TRIAL (10/10) vs PRO (60/100) vs PRO_PLUS (120/200) limits
- Test webhook events (use Stripe CLI for local testing)
- Test role and subscriptionStatus updates when subscription changes
- Test automatic trial start on new user signup
- Test edge cases: payment failures, expired cards, trial ending without payment, plan changes, etc.

## Security Considerations

- Never expose Stripe secret keys to client
- Verify webhook signatures
- Validate user authentication before creating checkout sessions
- Ensure webhook handler is idempotent (handle duplicate events)
- Sanitize user input in billing actions

### To-dos

- [ ] Update Prisma schema with Stripe fields (stripeCustomerId, stripeSubscriptionId, stripePriceId, stripeCurrentPeriodEnd, subscriptionStatus) and create migration
- [ ] Update src/lib/auth.ts createUser event to automatically set role=PRO, subscriptionStatus=trialing, stripeCurrentPeriodEnd=now+3days for new users
- [ ] Create src/lib/stripe.ts with Stripe client initialization, all 4 price ID constants (PRO monthly/yearly, PRO_PLUS monthly/yearly), helper functions including isProPlusPrice and getPlanTier
- [ ] Create src/lib/actions/billing.ts with server actions for checkout (with 3-day trial), portal, subscription management, trial days calculation, and getCurrentPlanTier
- [ ] Create src/app/api/stripe/webhook/route.ts to handle Stripe webhook events including plan changes (PRO to PRO_PLUS), trial_will_end, subscription updates, and role management (BASIC on cancel)
- [ ] Create src/app/billing/page.tsx with trial banner, single PRO plan card, monthly/yearly toggle, "$0 then $Y/month in X days" format during trial, and subscription management
- [ ] Create src/app/billing/two-plans/page.tsx with trial banner, PRO and PRO_PLUS plan cards side-by-side, monthly/yearly toggle affecting both, and subscription management
- [ ] Create src/components/TrialBanner.tsx showing "You have X days left in your free trial - Pick a plan for $0 to keep LeetGPT running without interruption"
- [ ] Create checkout flow and payment success/cancel pages (src/app/checkout/page.tsx, src/app/payment/success/page.tsx, src/app/payment/cancel/page.tsx)
- [ ] Create UpgradePrompt and ProBadge components (showing PRO or PRO_PLUS), integrate upgrade prompts into limit error messages
- [ ] Update src/lib/hourlyLimits.ts to check subscriptionStatus and stripePriceId (trialing=10/10, PRO=60/100, PRO_PLUS=120/200, null=0/0), add access checks to algorithm pages to block BASIC users
- [ ] Update workspace components (WorkspaceNavbar, ProblemStatementChat) to show trial banner, PRO/PRO_PLUS badges (only for active), and upgrade prompts
- [ ] Set up Stripe Dashboard: create all 4 products (PRO Monthly $9.99, PRO Yearly $29.99, PRO_PLUS Monthly $14.99, PRO_PLUS Yearly $44.99), enable 3-day trial, configure webhook endpoint, test with Stripe CLI