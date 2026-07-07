import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY ?? ''
    stripeClient = new Stripe(key, {
      apiVersion: '2026-06-24.dahlia',
    })
  }
  return stripeClient
}

/** Payout a compensation amount to a connected account (or test bank). */
export async function issuePayout(amountCents: number, destinationAccountId: string): Promise<Stripe.Transfer> {
  const stripe = getStripe()
  return stripe.transfers.create({
    amount: amountCents,
    currency: 'eur',
    destination: destinationAccountId,
    description: 'AirVault flight-delay compensation',
  })
}
