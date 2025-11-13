# Subscription State Machine

## Overview

This document outlines the subscription state machine using explicit status values. The `subscriptionStatus` field is the **single source of truth** for what to display, eliminating the need for complex conditional logic checking multiple fields.

## State Values

```typescript
type SubscriptionStatus =
	| null // No subscription, never had one
	| "app_trialing" // App-managed trial (no Stripe subscription yet)
	| "stripe_trialing" // Stripe-managed trial (has Stripe subscription in trial)
	| "active" // Active paid subscription
	| "past_due" // Payment failed, grace period
	| "unpaid" // Payment failed, no grace period
	| "incomplete" // Subscription setup incomplete
	| "incomplete_expired" // Incomplete subscription expired
	| "paused" // Subscription paused
	| "canceled" // Subscription canceled (access until period end)
	| "expired"; // Trial/subscription expired, no access
```

## State Machine Diagram

```
┌─────────────┐
│   null      │ (New user, no trial started)
└──────┬──────┘
       │
       │ User signs up / logs in
       ▼
┌─────────────┐
│app_trialing │ (3-day app trial, no Stripe subscription)
└──────┬──────┘
       │
       ├─► User subscribes ──► ┌──────────────┐
       │                        │stripe_trialing│ (Stripe subscription in trial)
       │                        └──────┬───────┘
       │                                │
       │                                ├─► Trial ends, payment succeeds ──► ┌────────┐
       │                                │                                    │ active  │
       │                                │                                    └───┬────┘
       │                                │                                        │
       │                                ├─► Trial ends, payment fails ──► ┌──────────┐
       │                                │                                  │ past_due │
       │                                │                                  └────┬─────┘
       │                                │                                       │
       │                                └─► User cancels ──► ┌──────────┐      │
       │                                                     │ canceled │      │
       │                                                     └──────────┘      │
       │                                                                       │
       └─► Trial expires, no subscription ──► ┌─────────┐                    │
                                              │ expired │                    │
                                              └─────────┘                    │
                                                                              │
                                                                              ├─► Payment fails ──► ┌──────────┐
                                                                              │                    │ past_due │
                                                                              │                    └────┬─────┘
                                                                              │                         │
                                                                              └─► User cancels ──► ┌──────────┐
                                                                                                   │ canceled │
                                                                                                   └──────────┘
```

## State Transitions

### Initial States

1. **New User** → `null`

    - User just signed up
    - No trial, no subscription

2. **App Trial Starts** → `"app_trialing"`
    - Trigger: User signs up or logs in (if eligible)
    - Conditions: `stripeSubscriptionId === null`, never had subscription
    - Sets: `stripeCurrentPeriodEnd = now + 3 days`

### Trial States

3. **App Trial → Stripe Trial** → `"stripe_trialing"`

    - Trigger: User completes checkout during app trial
    - Webhook: `checkout.session.completed` or `customer.subscription.created`
    - Conditions: User was in `"app_trialing"`, subscription created with trial
    - Sets: `stripeSubscriptionId`, `stripePriceId`, `stripeCurrentPeriodEnd = trial_end`

4. **App Trial → Expired** → `"expired"`

    - Trigger: App trial period ends, no subscription created
    - Conditions: `stripeCurrentPeriodEnd < now`, `stripeSubscriptionId === null`
    - Sets: `role = "BASIC"`, `stripeCurrentPeriodEnd = null`

5. **Stripe Trial → Active** → `"active"`

    - Trigger: Trial ends, payment succeeds
    - Webhook: `invoice.payment_succeeded` or `customer.subscription.updated`
    - Conditions: Subscription status in Stripe is `"active"`

6. **Stripe Trial → Past Due** → `"past_due"`
    - Trigger: Trial ends, payment fails
    - Webhook: `invoice.payment_failed` or `customer.subscription.updated`
    - Conditions: Subscription status in Stripe is `"past_due"`

### Active Subscription States

7. **Active → Past Due** → `"past_due"`

    - Trigger: Payment fails on renewal
    - Webhook: `invoice.payment_failed` or `customer.subscription.updated`

8. **Active → Canceled** → `"canceled"`
    - Trigger: User cancels subscription (with `cancel_at_period_end = true`)
    - Webhook: `customer.subscription.updated` (when `cancel_at_period_end` is set)
    - Note: User retains access until `stripeCurrentPeriodEnd`
    - Important: Subscription is still `"active"` in Stripe until period ends

8b. **Active → Canceled (Immediate)** → `"expired"`

-   Trigger: User cancels subscription immediately (no `cancel_at_period_end`)
-   Webhook: `customer.subscription.deleted`
-   Note: Access ends immediately, subscription deleted from Stripe
-   Sets: `role = "BASIC"`, clears subscription fields

9. **Past Due → Active** → `"active"`

    - Trigger: Payment succeeds after failure
    - Webhook: `invoice.payment_succeeded` or `customer.subscription.updated`

10. **Past Due → Unpaid** → `"unpaid"`

    - Trigger: Multiple payment failures
    - Webhook: `customer.subscription.updated`

11. **Canceled → Expired** → `"expired"`

-   Trigger: Canceled subscription period ends
-   Check: On every access check (similar to app trial expiration)
-   Conditions: `stripeCurrentPeriodEnd < now`, `subscriptionStatus === "canceled"`
-   Sets: `role = "BASIC"`, `stripeSubscriptionId = null`, clears subscription fields

### Resubscription States

12. **Expired → Stripe Trial/Active** → `"stripe_trialing"` or `"active"`

    -   Trigger: User subscribes after expiration
    -   Webhook: `checkout.session.completed` or `customer.subscription.created`
    -   If subscription has trial → `"stripe_trialing"`
    -   If no trial → `"active"`

13. **Canceled → Stripe Trial/Active** → `"stripe_trialing"` or `"active"`

    -   Trigger: User resubscribes before period ends
    -   Webhook: `checkout.session.completed` or `customer.subscription.created`
    -   If subscription has trial → `"stripe_trialing"`
    -   If no trial → `"active"`

14. **Null → Stripe Trial/Active** → `"stripe_trialing"` or `"active"`
    -   Trigger: User subscribes directly (never had app trial or it was cleared)
    -   Webhook: `checkout.session.completed` or `customer.subscription.created`
    -   If subscription has trial → `"stripe_trialing"`
    -   If no trial → `"active"`

### Recovery States

15. **Unpaid → Active** → `"active"`

    -   Trigger: Payment succeeds after being unpaid
    -   Webhook: `invoice.payment_succeeded` or `customer.subscription.updated`

16. **Paused → Active** → `"active"`

    -   Trigger: Subscription unpaused
    -   Webhook: `customer.subscription.updated`

17. **Incomplete → Active** → `"active"`

    -   Trigger: Payment method added, subscription becomes active
    -   Webhook: `customer.subscription.updated`

18. **Incomplete Expired → Expired** → `"expired"`
    -   Trigger: Incomplete subscription expires
    -   Webhook: `customer.subscription.updated` or automatic check
    -   Sets: `role = "BASIC"`, clears subscription fields

## Display Logic (Simplified)

### Billing Page

```typescript
switch (subscriptionStatus) {
	case "app_trialing":
		// Show trial banner + plan selector
		break;

	case "stripe_trialing":
		// Show "Subscription Active" card (waiting for payment)
		break;

	case "active":
		// Show subscription details card
		break;

	case "past_due":
	case "unpaid":
	case "incomplete":
	case "paused":
		// Show subscription details card with warning
		break;

	case "canceled":
		// Show subscription details card (access until period end)
		break;

	case "expired":
	case null:
		// Show plan selector only
		break;
}
```

### Trial Banner

```typescript
if (subscriptionStatus === "app_trialing") {
	// Show banner
}
```

### Access Control

```typescript
// Check if canceled subscription period has ended
const isCanceledExpired =
	subscriptionStatus === "canceled" &&
	stripeCurrentPeriodEnd &&
	new Date(stripeCurrentPeriodEnd) < new Date();

const hasAccess =
	subscriptionStatus === "app_trialing" ||
	subscriptionStatus === "stripe_trialing" ||
	subscriptionStatus === "active" ||
	(subscriptionStatus === "canceled" && !isCanceledExpired); // Until period end
```

## Validation Rules

While `subscriptionStatus` is the source of truth for display, we still validate consistency:

1. **`"app_trialing"`** must have:

    - `stripeSubscriptionId === null`
    - `stripeCurrentPeriodEnd` set (trial end date)
    - `role === "PRO"` or `"EXPERT"`

2. **`"stripe_trialing"`** must have:

    - `stripeSubscriptionId !== null`
    - `stripeCurrentPeriodEnd` set (trial end date from Stripe)
    - `stripePriceId` set

3. **`"active"`** must have:

    - `stripeSubscriptionId !== null`
    - `stripePriceId` set
    - `stripeCurrentPeriodEnd` set (next billing date)

4. **`"canceled"`** must have:

    - `stripeSubscriptionId !== null` (until period ends, then becomes null when expired)
    - `stripeCurrentPeriodEnd` set (access end date)
    - Note: Stripe subscription status is still `"active"` but `cancel_at_period_end = true`
    - Must check on every access if period has ended → transition to `"expired"`

5. **`"expired"`** must have:
    - `stripeSubscriptionId === null` (or was canceled and period ended)
    - `role === "BASIC"`

## Implementation Plan

### Phase 1: Update Type Definitions

1. Update `SubscriptionStatusValue` type to include `"app_trialing"` and `"stripe_trialing"`
2. Remove `isAppTrial` and `isStripeTrial` from `SubscriptionStatus` interface
3. Update all type references

### Phase 2: Update Status Setting Logic

1. **Auth flow** (`src/lib/auth.ts`):

    - Change trial start to set `subscriptionStatus = "app_trialing"` instead of `"trialing"`

2. **Webhook handler** (`src/app/api/stripe/webhook/route.ts`):

    - `checkout.session.completed`:
        - Check if subscription has trial period → set `"stripe_trialing"`
        - Otherwise → set `"active"`
    - `customer.subscription.created`:
        - If Stripe status is `"trialing"` → set `"stripe_trialing"`
        - Otherwise → set based on Stripe status
    - `customer.subscription.updated`:
        - Check `cancel_at_period_end`:
            - If `true` and status is `"active"` → set `"canceled"` (but keep access until period end)
            - If `false` and status is `"active"` → set `"active"`
        - Map Stripe status to our status:
            - `"trialing"` → `"stripe_trialing"`
            - `"active"` → `"active"` (unless `cancel_at_period_end` is true)
            - `"past_due"` → `"past_due"`
            - `"unpaid"` → `"unpaid"`
            - `"incomplete"` → `"incomplete"`
            - `"incomplete_expired"` → `"incomplete_expired"`
            - `"paused"` → `"paused"`
            - `"canceled"` → `"expired"` (immediately canceled, no period end)
    - `customer.subscription.deleted`:
        - Set `"expired"` (subscription immediately deleted, not canceled at period end)
        - Clear subscription fields, set `role = "BASIC"`

3. **Trial/Subscription expiration** (`src/lib/utils/subscription.ts`):

    - `checkAndExpireTrial`:
        - Check `"app_trialing"` status → set `"expired"` when period ends
        - Check `"canceled"` status → set `"expired"` when `stripeCurrentPeriodEnd` passes
        - Check `"incomplete_expired"` → set `"expired"`
    - This function should run on every access check (already does)

4. **Sync function** (`src/lib/actions/billing.ts`):
    - `syncSubscriptionFromStripe`: Map Stripe status correctly:
        - Check `cancel_at_period_end`:
            - If `true` and Stripe status is `"active"` → set `"canceled"`
        - If Stripe status is `"trialing"` → set `"stripe_trialing"`
        - Map other statuses directly:
            - `"active"` → `"active"` (unless `cancel_at_period_end`)
            - `"past_due"` → `"past_due"`
            - `"unpaid"` → `"unpaid"`
            - `"incomplete"` → `"incomplete"`
            - `"incomplete_expired"` → `"incomplete_expired"`
            - `"paused"` → `"paused"`
            - `"canceled"` → `"expired"` (immediately canceled)
        - If no subscription found → set `null` (not `"expired"` - that's for expired trials)

### Phase 3: Update Display Logic

1. **Billing page** (`src/app/billing/page.tsx`):

    - Replace all conditional checks with simple `switch` statement on `subscriptionStatus`
    - Remove `isAppTrial`, `isStripeTrial`, `hasStripeSubscription` checks

2. **Trial banner** (`src/components/TrialBanner.tsx`):

    - Check `subscriptionStatus === "app_trialing"` only

3. **Access control**:
    - Update `getSubscriptionTier()` to use status directly
    - Simplify all access checks

### Phase 4: Data Migration

1. **Existing data**:

    - Find all users with `subscriptionStatus = "trialing"`
    - If `stripeSubscriptionId === null` → set to `"app_trialing"`
    - If `stripeSubscriptionId !== null` → set to `"stripe_trialing"`

2. **Migration script**:

    ```sql
    UPDATE "User"
    SET "subscriptionStatus" = 'app_trialing'
    WHERE "subscriptionStatus" = 'trialing'
      AND "stripeSubscriptionId" IS NULL;

    UPDATE "User"
    SET "subscriptionStatus" = 'stripe_trialing'
    WHERE "subscriptionStatus" = 'trialing'
      AND "stripeSubscriptionId" IS NOT NULL;
    ```

### Phase 5: Cleanup

1. Remove helper functions: `isAppTrial()`, `isStripeTrial()`
2. Remove `isAppTrial` and `isStripeTrial` from `SubscriptionStatus` interface
3. Update all documentation

## Benefits

1. **Single source of truth**: Status field determines everything
2. **Simpler logic**: No complex conditionals checking multiple fields
3. **Easier debugging**: Can see exact state from one field
4. **Less error-prone**: No risk of inconsistent state
5. **Clearer intent**: Status names are explicit about what they mean

## Important Notes

### `cancel_at_period_end` Handling

Stripe has two ways to cancel:

1. **Cancel at period end** (`cancel_at_period_end = true`):

    - Subscription status in Stripe remains `"active"`
    - Our status: `"canceled"`
    - User keeps access until `stripeCurrentPeriodEnd`
    - When period ends, Stripe sends `customer.subscription.deleted` → we set `"expired"`

2. **Immediate cancel** (`cancel_at_period_end = false` or `customer.subscription.deleted`):
    - Subscription immediately deleted from Stripe
    - Our status: `"expired"`
    - Access ends immediately

### Status Check on Access

The `checkAndExpireTrial()` function should be renamed to `checkAndExpireSubscription()` and check:

-   `"app_trialing"` → expire if period ended
-   `"canceled"` → expire if `stripeCurrentPeriodEnd` passed
-   `"incomplete_expired"` → set to `"expired"`

This ensures users lose access exactly when they should.

## Testing Checklist

-   [ ] New user gets `"app_trialing"` status
-   [ ] App trial expiration sets `"expired"` status
-   [ ] Subscribing during app trial sets `"stripe_trialing"` status
-   [ ] Stripe trial → active transition works
-   [ ] Stripe trial → past_due transition works
-   [ ] Active → canceled transition works (with `cancel_at_period_end`)
-   [ ] Canceled → expired transition works (when period ends)
-   [ ] Canceled subscription shows correct access until period end
-   [ ] Canceled subscription loses access exactly when period ends
-   [ ] Immediate cancel (`customer.subscription.deleted`) sets `"expired"` immediately
-   [ ] Resubscribing from expired/canceled works
-   [ ] Subscribing directly (no app trial) works
-   [ ] `cancel_at_period_end` handling works correctly
-   [ ] `incomplete_expired` → `expired` transition works
-   [ ] Billing page shows correct content for each status
-   [ ] Trial banner only shows for `"app_trialing"`
-   [ ] Access control works for all states
-   [ ] Past due → active recovery works
-   [ ] Unpaid → active recovery works
-   [ ] Paused → active recovery works
