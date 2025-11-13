// Client-safe Stripe configuration (price IDs and helper functions)
// This file can be safely imported by client components

// Price IDs - These should be set from Stripe Dashboard
// Note: Each product (PRO and EXPERT) has two prices: monthly and yearly
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

// EXPERT Product - Monthly price: $19.99/month
export const STRIPE_PRICE_EXPERT_MONTHLY =
	process.env.NEXT_PUBLIC_STRIPE_PRICE_EXPERT_MONTHLY ||
	process.env.STRIPE_PRICE_EXPERT_MONTHLY ||
	process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_PLUS_MONTHLY ||
	process.env.STRIPE_PRICE_PRO_PLUS_MONTHLY ||
	"";

// EXPERT Product - Yearly price: $59.99/year
export const STRIPE_PRICE_EXPERT_YEARLY =
	process.env.NEXT_PUBLIC_STRIPE_PRICE_EXPERT_YEARLY ||
	process.env.STRIPE_PRICE_EXPERT_YEARLY ||
	process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_PLUS_YEARLY ||
	process.env.STRIPE_PRICE_PRO_PLUS_YEARLY ||
	"";

/**
 * Check if a price ID is EXPERT tier
 */
export function isExpertPrice(priceId: string): boolean {
	return (
		priceId === STRIPE_PRICE_EXPERT_MONTHLY ||
		priceId === STRIPE_PRICE_EXPERT_YEARLY ||
		// Legacy support for old PRO_PLUS price IDs
		priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_PLUS_MONTHLY ||
		priceId === process.env.STRIPE_PRICE_PRO_PLUS_MONTHLY ||
		priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_PLUS_YEARLY ||
		priceId === process.env.STRIPE_PRICE_PRO_PLUS_YEARLY
	);
}

/**
 * Get plan tier (PRO or EXPERT) based on price ID
 */
export function getPlanTier(priceId: string | null | undefined): "PRO" | "EXPERT" | null {
	if (!priceId) return null;
	return isExpertPrice(priceId) ? "EXPERT" : "PRO";
}

/**
 * Check if a price ID is yearly
 */
export function isYearlyPrice(priceId: string): boolean {
	return (
		priceId === STRIPE_PRICE_PRO_YEARLY ||
		priceId === STRIPE_PRICE_EXPERT_YEARLY ||
		// Legacy support for old PRO_PLUS price IDs
		priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_PLUS_YEARLY ||
		priceId === process.env.STRIPE_PRICE_PRO_PLUS_YEARLY
	);
}

// Legacy exports for backward compatibility (deprecated)
/** @deprecated Use isExpertPrice instead */
export const isProPlusPrice = isExpertPrice;
/** @deprecated Use STRIPE_PRICE_EXPERT_MONTHLY instead */
export const STRIPE_PRICE_PRO_PLUS_MONTHLY = STRIPE_PRICE_EXPERT_MONTHLY;
/** @deprecated Use STRIPE_PRICE_EXPERT_YEARLY instead */
export const STRIPE_PRICE_PRO_PLUS_YEARLY = STRIPE_PRICE_EXPERT_YEARLY;

