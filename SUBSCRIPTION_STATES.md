# Subscription States - Complete Walkthrough

## Overview
This document explains all possible subscription states and how they're handled in both billing and workspace pages.

---

## Subscription States

### 1. **NEW USER (No Trial Started Yet)**
**Database State:**
- `role`: `PRO` (default)
- `subscriptionStatus`: `null` or not set
- `stripeSubscriptionId`: `null`
- `stripeCustomerId`: `null`
- `stripeCurrentPeriodEnd`: `null`

**How it happens:**
- User just signed up (via `createUser` event in `auth.ts`)
- OR user logged in but never had a trial (via `session` callback in `auth.ts`)

**What happens:**
- **On Signup**: `createUser` event automatically starts 3-day trial
- **On Login**: `session` callback checks if user should get a trial and starts one

**Billing Page (`/billing`):**
- Shows plan selector with "$0 then $X/month in 3 days"
- Trial banner: "You have 3 days left in your free trial"
- `isTrialing = true`, `trialDaysRemaining = 3`

**Workspace Pages (`/algorithms/problems`, `/algorithms/problems/[slug]`):**
- `checkAndExpireTrial()` is called first
- Trial gets started if needed
- `getSubscriptionTier()` returns `"TRIAL"`
- User has access with TRIAL limits (10 hints/chat, 10 submissions per hour)
- Trial banner shown in navbar

---

### 2. **ACTIVE TRIAL (Days Remaining)**
**Database State:**
- `role`: `PRO`
- `subscriptionStatus`: `"trialing"`
- `stripeSubscriptionId`: `null` (no Stripe subscription yet)
- `stripeCustomerId`: `null` or set (if they started checkout)
- `stripeCurrentPeriodEnd`: `Date` (trial end date, e.g., now + 3 days)

**How it happens:**
- User is in their 3-day free trial
- Trial hasn't expired yet

**Billing Page:**
- Shows plan selector
- Trial banner: "You have X days left in your free trial"
- Price display: "$0 then $X/month in Y days"
- `isTrialing = true`, `trialDaysRemaining > 0`
- `hasActiveTrial = true` (used in TwoPlansSelector)

**Workspace Pages:**
- `checkAndExpireTrial()` checks if trial expired (doesn't expire if days remaining)
- `getSubscriptionTier()` returns `"TRIAL"`
- User has access with TRIAL limits
- Trial banner shown

**API Routes (`/api/algo-coach/stream`):**
- `checkAndExpireTrial()` called first
- `getSubscriptionTier()` returns `"TRIAL"`
- Limits: 10 hints/chat, 10 submissions per hour
- Error messages suggest upgrading: "Pick a plan for higher limits!"

---

### 3. **TRIAL EXPIRED (No Subscription)**
**Database State:**
- `role`: `BASIC` (downgraded automatically)
- `subscriptionStatus`: `null` (cleared)
- `stripeSubscriptionId`: `null`
- `stripeCustomerId`: `null` or set
- `stripeCurrentPeriodEnd`: `null` (cleared)

**How it happens:**
- Trial period ended (3 days passed)
- User never subscribed during trial
- `checkAndExpireTrial()` automatically downgrades user

**Billing Page:**
- Shows plan selector
- NO trial banner (trial expired)
- Price display: "$X/month" (regular price, not "$0")
- `isTrialing = false`, `trialDaysRemaining = 0`
- `hasActiveTrial = false`

**Workspace Pages:**
- `checkAndExpireTrial()` downgrades user to BASIC
- `getSubscriptionTier()` returns `"CANCELED"`
- User is **BLOCKED** - redirected to `/billing`
- No access to algorithm features

**API Routes:**
- `checkAndExpireTrial()` downgrades user
- `getSubscriptionTier()` returns `"CANCELED"`
- Returns 403 error: "Access denied. Please subscribe to continue using algorithm features."
- Limits: 0 (no access)

---

### 4. **ACTIVE SUBSCRIPTION (PRO)**
**Database State:**
- `role`: `PRO`
- `subscriptionStatus`: `"active"`
- `stripeSubscriptionId`: `"sub_xxx"` (Stripe subscription ID)
- `stripeCustomerId`: `"cus_xxx"` (Stripe customer ID)
- `stripePriceId`: `"price_xxx"` (PRO monthly or yearly price ID)
- `stripeCurrentPeriodEnd`: `Date` (next billing date)

**How it happens:**
- User subscribed during or after trial
- Stripe webhook `checkout.session.completed` or `invoice.payment_succeeded` updates status
- `syncSubscriptionFromStripe()` sets role based on price ID

**Billing Page:**
- Shows "Current Subscription" card
- Displays plan: "PRO Monthly" or "PRO Yearly"
- Shows next billing date
- "Manage Subscription" button (opens Stripe portal)
- NO plan selector shown
- `isActive = true`

**Workspace Pages:**
- `checkAndExpireTrial()` does nothing (not trialing)
- `getSubscriptionTier()` returns `"PRO"`
- User has full access with PRO limits (60 hints/chat, 100 submissions per hour)
- No trial banner

**API Routes:**
- `getSubscriptionTier()` returns `"PRO"`
- Limits: 60 hints/chat, 100 submissions per hour
- Full access

---

### 5. **ACTIVE SUBSCRIPTION (PRO_PLUS)**
**Database State:**
- `role`: `PRO_PLUS`
- `subscriptionStatus`: `"active"`
- `stripeSubscriptionId`: `"sub_xxx"`
- `stripeCustomerId`: `"cus_xxx"`
- `stripePriceId`: `"price_xxx"` (PRO_PLUS monthly or yearly price ID)
- `stripeCurrentPeriodEnd`: `Date`

**How it happens:**
- User subscribed to PRO_PLUS plan
- `syncSubscriptionFromStripe()` determines role from price ID using `isProPlusPrice()`

**Billing Page:**
- Shows "Current Subscription" card
- Displays plan: "PRO_PLUS Monthly" or "PRO_PLUS Yearly"
- Shows next billing date
- "Manage Subscription" button

**Workspace Pages:**
- `getSubscriptionTier()` returns `"PRO_PLUS"`
- User has full access with PRO_PLUS limits (120 hints/chat, 200 submissions per hour)
- Highest tier access

**API Routes:**
- `getSubscriptionTier()` returns `"PRO_PLUS"`
- Limits: 120 hints/chat, 200 submissions per hour
- Full access

---

### 6. **SUBSCRIPTION CANCELED**
**Database State:**
- `role`: `BASIC`
- `subscriptionStatus`: `null`
- `stripeSubscriptionId`: `null` (cleared)
- `stripeCustomerId`: `"cus_xxx"` (kept for potential resubscription)
- `stripePriceId`: `null` (cleared)
- `stripeCurrentPeriodEnd`: `null` (cleared)

**How it happens:**
- User canceled subscription via Stripe portal
- Stripe webhook `customer.subscription.deleted` fires
- User is downgraded to BASIC

**Billing Page:**
- Shows plan selector (no active subscription)
- NO trial banner
- Price display: "$X/month" (regular price)
- `isActive = false`, `isTrialing = false`

**Workspace Pages:**
- `getSubscriptionTier()` returns `"CANCELED"`
- User is **BLOCKED** - redirected to `/billing`
- No access to algorithm features

**API Routes:**
- `getSubscriptionTier()` returns `"CANCELED"`
- Returns 403 error: "Access denied. Please subscribe to continue using algorithm features."
- Limits: 0 (no access)

---

### 7. **PAST DUE (Payment Failed)**
**Database State:**
- `role`: `PRO` or `PRO_PLUS` (kept)
- `subscriptionStatus`: `"past_due"`
- `stripeSubscriptionId`: `"sub_xxx"` (still exists)
- `stripeCustomerId`: `"cus_xxx"`
- `stripePriceId`: `"price_xxx"` (kept)
- `stripeCurrentPeriodEnd`: `Date` (may be updated)

**How it happens:**
- Stripe payment failed
- Stripe webhook `invoice.payment_failed` fires
- `syncSubscriptionFromStripe()` updates status to `"past_due"`

**Billing Page:**
- Shows "Current Subscription" card (subscription still exists)
- Status shows as past due
- "Manage Subscription" button (user can update payment method)

**Workspace Pages:**
- `getSubscriptionTier()` returns `"CANCELED"` (past_due is not "active" or "trialing")
- User is **BLOCKED** - redirected to `/billing`
- No access until payment is resolved

**API Routes:**
- `getSubscriptionTier()` returns `"CANCELED"`
- Returns 403 error
- Limits: 0 (no access)

---

### 8. **ADMIN**
**Database State:**
- `role`: `ADMIN`
- `subscriptionStatus`: Can be anything (ignored)
- All Stripe fields: Can be anything (ignored)

**How it happens:**
- User is manually set to ADMIN role

**Billing Page:**
- Shows plan selector (if no active subscription)
- OR shows current subscription (if they have one)

**Workspace Pages:**
- `getSubscriptionTier()` returns `"ADMIN"` (always, regardless of subscription)
- User has unlimited access (1000 hints/chat, 1000 submissions per hour)
- Full access

**API Routes:**
- `getSubscriptionTier()` returns `"ADMIN"`
- Limits: 1000 (effectively unlimited)
- Full access

---

## Key Functions

### `checkAndExpireTrial(userId)`
**Location:** `src/lib/actions/billing.ts`

**What it does:**
- Checks if user is in trial (`subscriptionStatus === "trialing"`)
- Checks if trial has expired (`now >= stripeCurrentPeriodEnd`)
- If expired AND no Stripe subscription: downgrades to BASIC
- Called before checking subscription status in most places

**When called:**
- Before `getSubscriptionStatus()`
- In workspace pages (problems list, problem detail)
- In API routes (`/api/algo-coach/stream`)
- In server actions (`reviewOptimality`)

---

### `getSubscriptionTier(role, subscriptionStatus, stripePriceId)`
**Location:** `src/lib/hourlyLimits.ts`

**Returns:** `"CANCELED" | "TRIAL" | "PRO" | "PRO_PLUS" | "ADMIN"`

**Logic:**
1. If `role === "ADMIN"` → `"ADMIN"`
2. If `role === "BASIC"` OR `subscriptionStatus === null` → `"CANCELED"`
3. If `subscriptionStatus === "trialing"` → `"TRIAL"`
4. If `subscriptionStatus === "active"` AND `isProPlusPrice(stripePriceId)` → `"PRO_PLUS"`
5. If `subscriptionStatus === "active"` → `"PRO"`
6. Otherwise → `"CANCELED"`

---

### `getSubscriptionStatus()`
**Location:** `src/lib/actions/billing.ts`

**What it does:**
- Calls `checkAndExpireTrial()` first
- Returns subscription info: status, price ID, plan tier, trial days remaining

**Returns:**
```typescript
{
  subscriptionStatus: string | null,
  stripePriceId: string | null,
  stripeCurrentPeriodEnd: Date | null,
  planTier: "PRO" | "PRO_PLUS" | null,
  isYearly: boolean,
  trialDaysRemaining: number | null
}
```

---

## Access Control Flow

### Workspace Pages
1. **Check authentication** → redirect to `/login` if not logged in
2. **Call `checkAndExpireTrial()`** → auto-expire if needed
3. **Fetch user data** → role, subscriptionStatus, stripePriceId
4. **Call `getSubscriptionTier()`** → determine tier
5. **If `CANCELED`** → redirect to `/billing`
6. **Otherwise** → allow access with appropriate limits

### API Routes
1. **Check authentication** → return 401 if not logged in
2. **Call `checkAndExpireTrial()`** → auto-expire if needed
3. **Fetch user data** → role, subscriptionStatus, stripePriceId
4. **Call `getSubscriptionTier()`** → determine tier
5. **If `CANCELED`** → return 403 error
6. **Check hourly limits** → return 429 if exceeded
7. **Process request** → with tier-appropriate limits

### Billing Page
1. **Check authentication** → redirect to `/login` if not logged in
2. **Call `getSubscriptionStatus()`** → includes `checkAndExpireTrial()`
3. **Determine display:**
   - If `subscriptionStatus === "active"` → show current subscription card
   - Otherwise → show plan selector
   - If `subscriptionStatus === "trialing"` AND `trialDaysRemaining > 0` → show trial banner

---

## Trial Logic Summary

### Trial Start
- **New users**: Automatically on signup (`createUser` event)
- **Existing users**: On login if they never had a subscription (`session` callback)
- **Conditions**: No `stripeSubscriptionId` AND no `subscriptionStatus`

### Trial Display
- **Active trial**: Shows "$0 then $X/month in Y days"
- **Expired trial**: Shows regular price "$X/month"
- **Check**: `hasActiveTrial = isTrialing && trialDaysRemaining > 0`

### Trial Expiration
- **Automatic**: `checkAndExpireTrial()` runs on every access check
- **Result**: User downgraded to BASIC, subscriptionStatus set to null
- **Access**: User loses access, redirected to billing

---

## Subscription Limits

| Tier | Hints/Chat (per hour) | Submissions (per hour) |
|------|----------------------|------------------------|
| CANCELED | 0 (no access) | 0 (no access) |
| TRIAL | 10 | 10 |
| PRO | 60 | 100 |
| PRO_PLUS | 120 | 200 |
| ADMIN | 1000 (unlimited) | 1000 (unlimited) |

---

## Webhook Events

### `checkout.session.completed`
- User completed checkout
- Calls `syncSubscriptionFromStripe()` to update user data

### `customer.subscription.updated`
- Subscription changed (plan upgrade/downgrade, renewal)
- Calls `syncSubscriptionFromStripe()` to sync data

### `customer.subscription.deleted`
- Subscription canceled
- Downgrades user to BASIC, clears subscription data

### `invoice.payment_succeeded`
- Payment successful (after trial or renewal)
- Calls `syncSubscriptionFromStripe()` to ensure active status

### `invoice.payment_failed`
- Payment failed
- Calls `syncSubscriptionFromStripe()` to update to `"past_due"`

---

## Edge Cases

### User Subscribes During Trial
- Trial continues until end date
- Stripe subscription starts after trial ends (via `trial_period_days`)
- User keeps PRO access during trial
- After trial: subscription becomes active, user keeps PRO access

### User Never Subscribes After Trial
- Trial expires automatically
- User downgraded to BASIC
- Must subscribe to regain access

### User Cancels Then Resubscribes
- Can resubscribe (has `stripeCustomerId`)
- New subscription created
- User regains access immediately

### Payment Fails Then Succeeds
- Status changes: `active` → `past_due` → `active`
- User loses access during `past_due`, regains when payment succeeds

