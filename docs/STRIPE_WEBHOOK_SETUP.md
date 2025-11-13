# Stripe Webhook Setup Guide

This guide explains how to set up and test the Stripe webhook endpoint for handling subscription events.

## Overview

The webhook endpoint is located at `/api/stripe/webhook` and handles the following Stripe events:

-   `checkout.session.completed` - When a user completes checkout
-   `customer.subscription.updated` - When a subscription is updated (plan change, trial end, etc.)
-   `customer.subscription.deleted` - When a subscription is canceled
-   `invoice.payment_succeeded` - When a payment succeeds
-   `invoice.payment_failed` - When a payment fails
-   `customer.subscription.trial_will_end` - When a trial is about to end (optional notification)

## Prerequisites

1. Stripe account (test mode for development, live mode for production)
2. Stripe CLI installed (for local testing)
3. Environment variables configured

## Environment Variables

Add these to your `.env.local` file:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...  # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_...  # Webhook signing secret (different for local vs production)

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Local development
# NEXT_PUBLIC_APP_URL=https://yourdomain.com  # Production
```

## Setup Steps

### 1. Local Development Setup

#### Option A: Using Stripe CLI (Recommended for Local Testing)

1. **Install Stripe CLI**:

    ```bash
    # macOS
    brew install stripe/stripe-cli/stripe

    # Windows (using Scoop)
    scoop install stripe

    # Or download from: https://stripe.com/docs/stripe-cli
    ```

2. **Login to Stripe CLI**:

    ```bash
    stripe login
    ```

3. **Forward webhooks to your local server**:

    ```bash
    stripe listen --forward-to localhost:3000/api/stripe/webhook
    ```

4. **Copy the webhook signing secret**:
   The CLI will output a webhook secret like `whsec_...`. Copy this value.

5. **Add to `.env.local`**:

    ```env
    STRIPE_WEBHOOK_SECRET=whsec_...  # The secret from step 4
    ```

6. **Trigger test events** (optional):

    ```bash
    # Test checkout completion
    stripe trigger checkout.session.completed

    # Test subscription update
    stripe trigger customer.subscription.updated

    # Test subscription deletion
    stripe trigger customer.subscription.deleted
    ```

#### Option B: Using ngrok (Alternative for Local Testing)

1. **Install ngrok**:

    ```bash
    # Download from: https://ngrok.com/download
    ```

2. **Start your Next.js dev server**:

    ```bash
    npm run dev
    ```

3. **Expose your local server**:

    ```bash
    ngrok http 3000
    ```

4. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

5. **Configure webhook in Stripe Dashboard**:
    - Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/test/webhooks)
    - Click "Add endpoint"
    - Endpoint URL: `https://abc123.ngrok.io/api/stripe/webhook`
    - Select events to listen to (see list below)
    - Copy the "Signing secret" and add to `.env.local`

### 2. Production Setup

1. **Deploy your application** to your hosting provider (Vercel, etc.)

2. **Get your production webhook URL**:

    ```
    https://yourdomain.com/api/stripe/webhook
    ```

3. **Configure webhook in Stripe Dashboard**:

    - Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
    - Click "Add endpoint"
    - Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
    - Description: "Production webhook endpoint"

4. **Select events to listen to**:

    - `checkout.session.completed`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.payment_succeeded`
    - `invoice.payment_failed`
    - `customer.subscription.trial_will_end` (optional)

5. **Copy the signing secret**:

    - After creating the endpoint, click on it
    - Under "Signing secret", click "Reveal"
    - Copy the secret (starts with `whsec_`)

6. **Add to production environment variables**:

    - In Vercel: Project Settings → Environment Variables
    - Add `STRIPE_WEBHOOK_SECRET` with the value from step 5
    - Make sure to set it for "Production" environment

7. **Test the webhook**:
    - In Stripe Dashboard, go to your webhook endpoint
    - Click "Send test webhook"
    - Select an event type (e.g., `checkout.session.completed`)
    - Check your application logs to verify it was received

## Testing

### Manual Testing with Stripe CLI

```bash
# Start webhook forwarding
stripe listen --forward-to localhost:3000/api/stripe/webhook

# In another terminal, trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

### Testing in Stripe Dashboard

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click on your webhook endpoint
3. Click "Send test webhook"
4. Select an event type
5. Click "Send test webhook"
6. Check the "Response" tab to see if it was successful

### Verifying Webhook Events

Check your application logs to see:

-   Webhook events being received
-   Any errors during processing
-   Database updates being made

You can also check the Stripe Dashboard → Webhooks → [Your Endpoint] → "Recent events" to see delivery status.

## Troubleshooting

### "Invalid signature" error

-   **Cause**: Webhook secret doesn't match
-   **Solution**:
    -   Make sure `STRIPE_WEBHOOK_SECRET` in `.env.local` matches the secret from Stripe
    -   For local testing with Stripe CLI, use the secret shown when running `stripe listen`
    -   For production, use the secret from the Stripe Dashboard webhook endpoint

### "No signature" error

-   **Cause**: Request is not coming from Stripe
-   **Solution**: Make sure you're testing through Stripe CLI or Stripe Dashboard, not directly calling the endpoint

### Webhook not receiving events

-   **Check webhook URL**: Make sure it's correct and accessible
-   **Check event selection**: Verify the events are selected in Stripe Dashboard
-   **Check logs**: Look at Stripe Dashboard → Webhooks → [Your Endpoint] → Recent events for delivery status
-   **For local testing**: Make sure `stripe listen` is running and forwarding to the correct URL

### Database not updating

-   **Check logs**: Look for errors in webhook processing
-   **Verify user exists**: Make sure the customer ID matches a user in your database
-   **Check Prisma connection**: Ensure database connection is working

## Security Best Practices

1. **Always verify webhook signatures** - The code already does this using `stripe.webhooks.constructEvent()`
2. **Use HTTPS in production** - Never use HTTP for webhook endpoints
3. **Keep webhook secrets secure** - Never commit them to version control
4. **Use different secrets for test and production** - Each environment should have its own webhook endpoint and secret
5. **Monitor webhook failures** - Set up alerts for failed webhook deliveries in Stripe Dashboard

## Webhook Event Flow

### Checkout Flow

1. User completes checkout → `checkout.session.completed` event
2. Webhook syncs subscription data from Stripe
3. User role updated to PRO or EXPERT based on plan

### Subscription Updates

1. Subscription changes (plan upgrade/downgrade, trial ends, etc.) → `customer.subscription.updated` event
2. Webhook syncs latest subscription data
3. User role and subscription status updated

### Payment Failures

1. Payment fails → `invoice.payment_failed` event
2. Webhook updates subscription status to `past_due`
3. User retains access but status is marked as past due

### Cancellations

1. User cancels subscription → `customer.subscription.deleted` event
2. Webhook downgrades user to BASIC role
3. Subscription data cleared from database

## Additional Resources

-   [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
-   [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
-   [Testing Webhooks Locally](https://stripe.com/docs/stripe-cli/webhooks)
