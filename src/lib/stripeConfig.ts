// Client-safe Stripe configuration (price IDs and helper functions)
// This file can be safely imported by client components

// Price IDs - These should be set from Stripe Dashboard
// These use NEXT_PUBLIC_ prefix because they're used in client components
// Price IDs are not sensitive - they're just identifiers
// 
// PRO Product - Monthly price: $9.99/month
export const STRIPE_PRICE_PRO_MONTHLY =
	process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY ||
	process.env.STRIPE_PRICE_PRO_MONTHLY ||
	"";

// PRO Product - Yearly price: $29.99/year
export const STRIPE_PRICE_PRO_YEARLY =
	process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY ||
	process.env.STRIPE_PRICE_PRO_YEARLY ||
	"";

/**
* Check if a price ID is yearly
*/
export function isYearlyPrice(priceId: string): boolean {
	return priceId === STRIPE_PRICE_PRO_YEARLY;
}

