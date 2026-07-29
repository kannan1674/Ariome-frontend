import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

/**
 * Creates a Stripe Checkout Session (subscription, sandbox-ready).
 * Set STRIPE_SECRET_KEY in .env.local — never commit secret keys.
 */
function normalizeSuccessPath(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.startsWith('/')) return '/explore'
  if (raw.includes('//') || raw.includes('?')) return '/explore'
  return raw
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret || !secret.startsWith('sk_')) {
    return NextResponse.json(
      { error: 'Missing STRIPE_SECRET_KEY. Add it to .env.local (Stripe Dashboard → Developers → API keys).' },
      { status: 500 },
    )
  }

  let successPath = '/explore'
  try {
    const body = (await req.json()) as { successPath?: string }
    successPath = normalizeSuccessPath(body?.successPath)
  } catch {
    /* empty body */
  }

  const stripe = new Stripe(secret)
  const origin = req.headers.get('origin') ?? req.nextUrl.origin

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Cookoo Premium',
              description: 'Monthly membership (Stripe test mode)',
            },
            unit_amount: 999,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}${successPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${successPath}?checkout=cancel`,
    })

    if (!session.url) {
      return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe/checkout-session]', err)
    const message = err instanceof Error ? err.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
