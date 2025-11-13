-- Migration script to update subscriptionStatus from "trialing" to "app_trialing" or "stripe_trialing"
-- Run this after deploying the code changes

-- Update app-managed trials (no Stripe subscription)
UPDATE "User" 
SET "subscriptionStatus" = 'app_trialing'
WHERE "subscriptionStatus" = 'trialing' 
  AND "stripeSubscriptionId" IS NULL;

-- Update Stripe-managed trials (has Stripe subscription)
UPDATE "User" 
SET "subscriptionStatus" = 'stripe_trialing'
WHERE "subscriptionStatus" = 'trialing' 
  AND "stripeSubscriptionId" IS NOT NULL;

