# Trial to Payment Flow

This document explains how the system handles the transition from trial ending to when payment actually starts.

## Overview

When a user subscribes during their trial period, Stripe creates a subscription with `status: "trialing"`. When the trial ends, Stripe attempts to charge the customer's payment method. This document explains how the webhook system handles this transition.

## Flow Diagram

```
User Subscribes During Trial
    ↓
Stripe Creates Subscription (status: "trialing")
    ↓
Webhook: customer.subscription.created
    → syncSubscriptionFromStripe()
    → Sets: subscriptionStatus = "trialing", stripeCurrentPeriodEnd = trial_end
    ↓
[Trial Period Continues...]
    ↓
Trial Ends (trial_end date reached)
    ↓
Stripe Attempts Payment
    ↓
┌─────────────────────────────────┐
│                                 │
│  Payment Succeeds               │  Payment Fails
│                                 │
│  ↓                              │  ↓
│  Webhook: invoice.payment_      │  Webhook: invoice.payment_
│    succeeded                     │    failed
│  → syncSubscriptionFromStripe() │  → Sets subscriptionStatus = "past_due"
│                                 │  → customer.subscription.updated also fires
│  ↓                              │  → syncSubscriptionFromStripe() (from updated event)
│  Webhook: customer.subscription │  → Updates to "past_due" with full sync
│    .updated                      │
│  → syncSubscriptionFromStripe() │
│                                 │
│  Result:                        │  Result:
│  - status: "active"              │  - status: "past_due"
│  - current_period_end updated   │  - current_period_end updated
│  - User keeps PRO/EXPERT access │  - User keeps PRO/EXPERT access (grace period)
└─────────────────────────────────┘
```

## Webhook Events

### 1. During Trial Period

**`customer.subscription.created`** (when user subscribes)
- Subscription is created with `status: "trialing"`
- `syncSubscriptionFromStripe()` is called
- Sets `subscriptionStatus = "trialing"`
- Sets `stripeCurrentPeriodEnd = trial_end` (or `current_period_end` if available)
- User maintains PRO/EXPERT access during trial

**`customer.subscription.updated`** (if subscription changes during trial)
- Called if subscription is modified
- `syncSubscriptionFromStripe()` updates all fields
- Status remains "trialing" until trial ends

### 2. When Trial Ends

**`customer.subscription.trial_will_end`** (3 days before trial ends)
- Currently just logged
- Could be used to send reminder emails/notifications
- **Status**: Still "trialing" at this point

**`customer.subscription.updated`** (when trial actually ends)
- Stripe changes subscription status from "trialing" to "active" (or "past_due" if payment fails)
- `syncSubscriptionFromStripe()` is called
- Updates:
  - `subscriptionStatus`: "trialing" → "active" (or "past_due")
  - `stripeCurrentPeriodEnd`: Updated to new billing period end date
  - `role`: Maintains PRO/EXPERT (not downgraded)

### 3. Payment Processing

**`invoice.payment_succeeded`** (payment successful)
- Fires after successful payment
- `syncSubscriptionFromStripe()` is called
- Ensures subscription status is "active"
- Updates `stripeCurrentPeriodEnd` to next billing period
- User maintains PRO/EXPERT access

**`invoice.payment_failed`** (payment failed)
- Fires when payment attempt fails
- Currently sets `subscriptionStatus = "past_due"` directly
- **Note**: `customer.subscription.updated` also fires, which syncs everything
- User maintains PRO/EXPERT access during grace period
- `stripeCurrentPeriodEnd` is updated via the `updated` event

## Key Points

### Status Transitions

1. **"trialing"** → User subscribed, trial period active
2. **"active"** → Trial ended, payment succeeded, subscription active
3. **"past_due"** → Trial ended, payment failed, but user still has access (grace period)

### What Gets Updated

When `syncSubscriptionFromStripe()` is called, it updates:
- `subscriptionStatus`: Current subscription status
- `stripeCurrentPeriodEnd`: End date of current billing period
- `stripeSubscriptionId`: Stripe subscription ID
- `stripePriceId`: Price ID (PRO or EXPERT)
- `role`: PRO or EXPERT (based on price ID)

### User Access During Transition

- **During Trial**: Full PRO/EXPERT access
- **After Trial (Payment Success)**: Full PRO/EXPERT access continues
- **After Trial (Payment Failed)**: Still has PRO/EXPERT access during grace period (Stripe allows some time for retry)

### Current Period End Date

- **During Trial**: `stripeCurrentPeriodEnd` = `trial_end` (when trial expires)
- **After Trial (Payment Success)**: `stripeCurrentPeriodEnd` = next billing period end (e.g., 1 month from now)
- **After Trial (Payment Failed)**: `stripeCurrentPeriodEnd` = when grace period ends (Stripe sets this)

## Code Flow

### When Trial Ends and Payment Succeeds

1. Stripe attempts payment
2. `invoice.payment_succeeded` fires
   ```typescript
   → syncSubscriptionFromStripe(customerId)
   → Retrieves subscription from Stripe
   → Status is now "active" (not "trialing")
   → Updates subscriptionStatus = "active"
   → Updates stripeCurrentPeriodEnd = new billing period end
   ```
3. `customer.subscription.updated` fires (redundant but safe)
   ```typescript
   → syncSubscriptionFromStripe(customerId)
   → Same updates as above (idempotent)
   ```

### When Trial Ends and Payment Fails

1. Stripe attempts payment
2. `invoice.payment_failed` fires
   ```typescript
   → Sets subscriptionStatus = "past_due" (quick update)
   ```
3. `customer.subscription.updated` fires
   ```typescript
   → syncSubscriptionFromStripe(customerId)
   → Status is now "past_due"
   → Updates subscriptionStatus = "past_due"
   → Updates stripeCurrentPeriodEnd = grace period end date
   ```

## Potential Improvements

1. **`invoice.payment_failed` handler**: Could also call `syncSubscriptionFromStripe()` to ensure all fields are updated, though `customer.subscription.updated` should handle this.

2. **Grace period handling**: Currently, users maintain access during grace period. Could add logic to restrict access after a certain number of failed payment attempts.

3. **Trial reminder**: `customer.subscription.trial_will_end` could trigger email notifications or in-app reminders.

## Testing

To test the trial-to-payment flow:

1. **Create a subscription with trial**:
   - Subscribe during trial period
   - Verify `subscriptionStatus = "trialing"`
   - Verify `stripeCurrentPeriodEnd = trial_end`

2. **Simulate trial ending**:
   - In Stripe Dashboard, manually end trial or wait for it to end
   - Verify `customer.subscription.updated` fires
   - Verify status changes to "active" or "past_due"

3. **Test payment success**:
   - Use Stripe test card that succeeds
   - Verify `invoice.payment_succeeded` fires
   - Verify `subscriptionStatus = "active"`
   - Verify `stripeCurrentPeriodEnd` is updated to next billing period

4. **Test payment failure**:
   - Use Stripe test card that fails (e.g., `4000000000000002`)
   - Verify `invoice.payment_failed` fires
   - Verify `subscriptionStatus = "past_due"`
   - Verify user still has access (grace period)

