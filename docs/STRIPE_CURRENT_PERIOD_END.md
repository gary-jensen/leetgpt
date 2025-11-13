# Understanding `stripeCurrentPeriodEnd`

## What is `stripeCurrentPeriodEnd`?

`stripeCurrentPeriodEnd` is a critical field that stores the date when the current subscription period (or trial period) ends. This date is essential for:

1. **Determining subscription expiration** - Knowing when to revoke access
2. **Calculating trial days remaining** - Showing users how many days are left in their trial
3. **Displaying subscription status** - Showing when the subscription renews or expires
4. **Access control** - Automatically downgrading users when their subscription expires

## Why It Matters

Without `stripeCurrentPeriodEnd`, the system cannot:
- Know when a subscription expires
- Calculate how many days remain in a trial
- Automatically downgrade users when their subscription ends
- Display accurate subscription information to users

## How It's Set

The `stripeCurrentPeriodEnd` field is set in the `syncSubscriptionFromStripe()` function when:

1. **Webhook events fire** (e.g., `checkout.session.completed`, `customer.subscription.updated`)
2. **Subscription is synced from Stripe** - The function retrieves the full subscription object from Stripe
3. **The `current_period_end` field** from Stripe is converted from Unix timestamp to a JavaScript Date

## Current Implementation

The code retrieves the full subscription object using `stripe.subscriptions.retrieve()` to ensure all fields are available:

```typescript
const fullSubscription = await stripe.subscriptions.retrieve(subscription.id);
const currentPeriodEnd = (fullSubscription as any).current_period_end;
```

**Note**: The TypeScript types don't expose `current_period_end`, but it exists in the API response, so we use a type assertion.

## Troubleshooting

### Issue: `stripeCurrentPeriodEnd` is `null` after purchase

**Possible causes:**

1. **Timing issue** - The subscription might not be fully initialized when the webhook fires
   - **Solution**: The code now retrieves the full subscription explicitly, which should include all fields

2. **Stripe API response** - The `current_period_end` field might not be present in the response
   - **Solution**: Check the logs for warnings about missing `current_period_end`

3. **Subscription status** - If the subscription is in an incomplete state, `current_period_end` might not be set yet
   - **Solution**: The `customer.subscription.updated` webhook will fire when the subscription becomes active and should set it

### How to Verify

1. **Check the database**:
   ```sql
   SELECT id, email, role, subscriptionStatus, stripeCurrentPeriodEnd 
   FROM "User" 
   WHERE stripeSubscriptionId IS NOT NULL;
   ```

2. **Check the logs**:
   - Look for warnings about missing `current_period_end`
   - Look for successful sync logs showing the period end date

3. **Check Stripe Dashboard**:
   - Go to the subscription in Stripe Dashboard
   - Verify that "Current period end" is set
   - This should match what's in your database

### If It's Still Not Set

If `stripeCurrentPeriodEnd` is still `null` after a purchase:

1. **Wait for the `customer.subscription.updated` event** - This fires when the subscription becomes fully active and should set the period end date

2. **Manually trigger a sync** - You can call `syncSubscriptionFromStripe(customerId)` to force a refresh

3. **Check Stripe webhook logs** - In Stripe Dashboard → Webhooks → [Your Endpoint] → Recent events, check if events are being delivered successfully

## Best Practices

1. **Always retrieve the full subscription** - Use `stripe.subscriptions.retrieve()` instead of relying on list results
2. **Handle missing values gracefully** - The code logs warnings if `current_period_end` is missing
3. **Rely on webhook events** - The `customer.subscription.updated` event will fire when the subscription is fully active and should include `current_period_end`
4. **Monitor logs** - Check for warnings about missing `current_period_end` to catch issues early

## Related Webhook Events

- `checkout.session.completed` - Fires when checkout completes (may fire before subscription is fully active)
- `customer.subscription.updated` - Fires when subscription status changes (should have `current_period_end` set)
- `invoice.payment_succeeded` - Fires after successful payment (subscription should be active by then)

The `customer.subscription.updated` event is the most reliable source for `current_period_end` since it fires when the subscription is fully active.

