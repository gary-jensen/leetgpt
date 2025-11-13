# Stripe Integration Overview

## Architecture

### Subscription State Machine

We use a state machine approach where `subscriptionStatus` is the **single source of truth** for display logic. The status field determines what users see and what access they have.

**Status Values:**

-   `null` - No subscription, never had one
-   `"app_trialing"` - App-managed trial (no Stripe subscription yet)
-   `"stripe_trialing"` - Stripe-managed trial (has Stripe subscription in trial)
-   `"active"` - Active paid subscription
-   `"past_due"` - Payment failed, grace period
-   `"unpaid"` - Payment failed, no grace period
-   `"incomplete"` - Subscription setup incomplete
-   `"incomplete_expired"` - Incomplete subscription expired
-   `"paused"` - Subscription paused
-   `"canceled"` - Subscription canceled (access until period end)
-   `"expired"` - Trial/subscription expired, no access

### Key Components

1. **Webhook Handler** (`src/app/api/stripe/webhook/route.ts`)

    - Handles all Stripe webhook events
    - Syncs subscription data to database
    - Updates user roles and status

2. **Sync Function** (`src/lib/actions/billing.ts`)

    - `syncSubscriptionFromStripe()` - Syncs subscription from Stripe API
    - Maps Stripe statuses to our status values
    - Handles `cancel_at_period_end` detection
    - Uses `cancel_at` timestamp for canceled subscription expiration dates

3. **Subscription Utils** (`src/lib/utils/subscription.ts`)

    - `checkAndExpireSubscription()` - Checks and expires subscriptions on access
    - `getSubscriptionStatusFromSession()` - Builds status from session data

4. **Billing Page** (`src/app/billing/page.tsx`)
    - Displays subscription info based on status
    - Uses switch statement for clean display logic
    - Manual "Refresh Status" button for users

### Webhook Events Handled

-   `checkout.session.completed` - User completes checkout
-   `customer.subscription.created` - Subscription created
-   `customer.subscription.updated` - Subscription updated (including cancellations)
-   `customer.subscription.deleted` - Subscription deleted (immediate cancel or period ended)
-   `invoice.payment_succeeded` - Payment successful
-   `invoice.payment_failed` - Payment failed
-   `customer.subscription.trial_will_end` - Trial ending soon (currently just logged)

### Subscription Cancellation Flow

**Cancel at Period End:**

1. User cancels via Stripe Customer Portal
2. Stripe sets `cancel_at_period_end = true` and `cancel_at = [timestamp]`
3. Webhook `customer.subscription.updated` fires
4. Our backend sets `subscriptionStatus = "canceled"`
5. Uses `cancel_at` timestamp as expiration date (not `current_period_end`)
6. User keeps access until `cancel_at` date
7. When period ends, `customer.subscription.deleted` fires → status → `"expired"`

**Immediate Cancel:**

1. User cancels immediately
2. Stripe sends `customer.subscription.deleted` immediately
3. Our backend sets `subscriptionStatus = "expired"` immediately
4. Access ends right away

### Data Flow

```
Stripe Event → Webhook → syncSubscriptionFromStripe() → Database Update → Session Refresh
```

The session is refreshed on next page load, showing updated status.

---

## Future Email Events

### High Priority (Critical)

1. **Payment Failed**

    - **Trigger:** `invoice.payment_failed` webhook
    - **When:** Payment fails on subscription renewal or trial end
    - **Content:** Alert user, provide link to update payment method
    - **Action:** Urgent - user will lose access if not fixed

2. **Subscription Expired**

    - **Trigger:** `customer.subscription.deleted` or `checkAndExpireSubscription()` detects expiration
    - **When:** Canceled subscription period ends, or trial expires
    - **Content:** Notify access has ended, offer to resubscribe
    - **Action:** User has lost access

3. **Trial Expired**

    - **Trigger:** `checkAndExpireSubscription()` detects app trial expiration
    - **When:** App trial period ends without subscription
    - **Content:** Trial ended, encourage subscription
    - **Action:** User downgraded to BASIC

4. **Payment Succeeded (Receipt)**
    - **Trigger:** `invoice.payment_succeeded` webhook
    - **When:** Successful payment (renewal or first payment)
    - **Content:** Receipt with invoice details, next billing date
    - **Action:** Confirmation and record keeping

### Medium Priority (Important)

5. **Trial Ending Soon (3 days)**

    - **Trigger:** Scheduled check or `customer.subscription.trial_will_end` webhook
    - **When:** 3 days before trial ends
    - **Content:** Reminder to subscribe before trial ends
    - **Action:** Prevent unexpected access loss

6. **Trial Ending Soon (1 day)**

    - **Trigger:** Scheduled check
    - **When:** 1 day before trial ends
    - **Content:** Final reminder, urgent call to action
    - **Action:** Last chance to subscribe

7. **Subscription Canceled**

    - **Trigger:** `customer.subscription.updated` with `cancel_at_period_end = true`
    - **When:** User cancels subscription
    - **Content:** Confirmation of cancellation, access end date, option to reactivate
    - **Action:** Acknowledge cancellation

8. **Subscription Ending Soon**

    - **Trigger:** Scheduled check for canceled subscriptions
    - **When:** 3-7 days before canceled subscription period ends
    - **Content:** Reminder that access will end soon, offer to reactivate
    - **Action:** Prevent unexpected access loss

9. **Upcoming Payment**
    - **Trigger:** Scheduled check
    - **When:** 3-7 days before next billing date
    - **Content:** Billing reminder, ensure payment method is up to date
    - **Action:** Prevent payment failures

### Low Priority (Nice-to-Have)

10. **Subscription Started**

    -   **Trigger:** `customer.subscription.created` or `invoice.payment_succeeded` (first payment)
    -   **When:** Paid subscription begins
    -   **Content:** Welcome to paid plan, feature highlights
    -   **Action:** Onboarding

11. **Payment Method Updated**

    -   **Trigger:** User updates payment method in Stripe portal
    -   **When:** Payment method changed
    -   **Content:** Confirmation of update
    -   **Action:** Security/confirmation

12. **Plan Upgraded**

    -   **Trigger:** `customer.subscription.updated` with different price ID
    -   **When:** User upgrades (PRO → EXPERT)
    -   **Content:** Confirmation, new features available
    -   **Action:** Feature announcement

13. **Plan Downgraded**

    -   **Trigger:** `customer.subscription.updated` with different price ID
    -   **When:** User downgrades (EXPERT → PRO)
    -   **Content:** Confirmation, what features are lost
    -   **Action:** Feature change notification

14. **Plan Changed (Monthly/Yearly)**

    -   **Trigger:** `customer.subscription.updated` with different billing interval
    -   **When:** User switches between monthly/yearly
    -   **Content:** Confirmation, new billing schedule
    -   **Action:** Billing confirmation

15. **Subscription Past Due**

    -   **Trigger:** `customer.subscription.updated` with status `past_due`
    -   **When:** Payment fails, grace period begins
    -   **Content:** Alert, update payment method
    -   **Action:** Prevent escalation to unpaid

16. **Subscription Unpaid**

    -   **Trigger:** `customer.subscription.updated` with status `unpaid`
    -   **When:** Multiple payment failures
    -   **Content:** Critical alert, immediate action required
    -   **Action:** Last chance before access loss

17. **Subscription Resumed**

    -   **Trigger:** `customer.subscription.updated` when canceled subscription is reactivated
    -   **When:** User reactivates before period ends
    -   **Content:** Welcome back, subscription reactivated
    -   **Action:** Confirmation

18. **Subscription Paused**

    -   **Trigger:** `customer.subscription.updated` with status `paused`
    -   **When:** Subscription is paused (if supported)
    -   **Content:** Notification of pause
    -   **Action:** Status update

19. **Subscription Incomplete**
    -   **Trigger:** `customer.subscription.updated` with status `incomplete`
    -   **When:** Subscription setup incomplete
    -   **Content:** Complete setup instructions
    -   **Action:** Help user complete subscription

### Implementation Notes

-   **Email Service:** Need to integrate email service (Resend, SendGrid, etc.)
-   **Templates:** Create email templates for each event type
-   **Scheduling:** For "ending soon" emails, need scheduled job or cron
-   **Webhook Integration:** Most events can be triggered from existing webhooks
-   **User Preferences:** Consider allowing users to opt-out of non-critical emails
-   **Testing:** Test all email flows in development/staging before production

### Email Priority Matrix

| Priority         | Events                                                                               | Reason                                        |
| ---------------- | ------------------------------------------------------------------------------------ | --------------------------------------------- |
| **Critical**     | Payment Failed, Subscription Expired, Trial Expired, Payment Receipt                 | User will lose access or needs confirmation   |
| **Important**    | Trial Ending Soon, Subscription Canceled, Subscription Ending Soon, Upcoming Payment | Prevent unexpected issues, improve UX         |
| **Nice-to-Have** | Subscription Started, Plan Changes, Status Updates                                   | Enhance user experience, provide transparency |

---

## Production Implementation Checklist

### 1. Stripe Dashboard Setup

**Create Production Products & Prices:**

-   Go to Stripe Dashboard → Products (switch to Live mode)
-   Create PRO Monthly and PRO Yearly products/prices
-   Create EXPERT Monthly and EXPERT Yearly products/prices
-   Copy the production price IDs (they start with `price_`)

**Set Up Production Webhook:**

-   Go to Stripe Dashboard → Developers → Webhooks
-   Click "Add endpoint"
-   Enter your production webhook URL: `https://yourdomain.com/api/stripe/webhook`
-   Select these events:
    -   `checkout.session.completed`
    -   `customer.subscription.created`
    -   `customer.subscription.updated`
    -   `customer.subscription.deleted`
    -   `invoice.payment_succeeded`
    -   `invoice.payment_failed`
    -   `customer.subscription.trial_will_end` (optional, for future emails)
-   Copy the webhook signing secret (starts with `whsec_`)

### 2. Environment Variables

Update your production environment variables:

```env
# Stripe API Keys (Production)
STRIPE_SECRET_KEY=sk_live_...  # Production secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # Production publishable key
STRIPE_WEBHOOK_SECRET=whsec_...  # Production webhook secret

# Production Price IDs
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_...  # Production PRO monthly
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_...   # Production PRO yearly
NEXT_PUBLIC_STRIPE_PRICE_EXPERT_MONTHLY=price_...  # Production EXPERT monthly
NEXT_PUBLIC_STRIPE_PRICE_EXPERT_YEARLY=price_...   # Production EXPERT yearly
```

### 3. Testing

**Test the Production Webhook:**

-   In Stripe Dashboard → Webhooks → Your endpoint
-   Click "Send test webhook"
-   Test events:
    -   `customer.subscription.created`
    -   `customer.subscription.updated`
    -   `invoice.payment_succeeded`
-   Check your server logs to confirm events are received

**Test a Real Purchase:**

-   Use a real test card (Stripe provides test cards that work in live mode)
-   Or use a real card with a small amount
-   Verify:
    -   Subscription status updates correctly
    -   Webhook fires and processes
    -   User role updates
    -   Billing page shows correct info

### 4. Optional: Stripe Customer Portal Settings

-   Go to Stripe Dashboard → Settings → Billing → Customer portal
-   Configure:
    -   Allowed subscription actions (cancel, update payment method, etc.)
    -   Business information
    -   Branding

### 5. Monitoring

-   Monitor webhook delivery in Stripe Dashboard → Webhooks
-   Check for failed webhook deliveries
-   Set up alerts for webhook failures
-   Monitor your server logs for webhook processing errors

### Summary

Main steps:

1.  Create production products/prices in Stripe
2.  Set up production webhook endpoint
3.  Update environment variables (API keys, webhook secret, price IDs)
4.  Test webhook delivery
5.  Test a real purchase flow

The code should work as-is once the environment variables are updated. The webhook handler and sync logic are environment-agnostic.
