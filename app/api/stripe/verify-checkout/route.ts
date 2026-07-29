import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const COOKIE = 'explore_full_access'
const MAX_AGE = 60 * 60 * 24 * 365

/** Confirms a completed Checkout Session and sets an httpOnly cookie for full-length playback on Explore. */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret?.startsWith('sk_')) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  let sessionId: string
  try {
    const body = (await req.json()) as { sessionId?: string }
    sessionId = body.sessionId ?? ''
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
  }

  const stripe = new Stripe(secret)

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const paid =
      session.status === 'complete' &&
      (session.payment_status === 'paid' || session.payment_status === 'no_payment_required')

    if (!paid) {
      return NextResponse.json({ error: 'Checkout not completed' }, { status: 400 })
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set(COOKIE, '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_AGE,
    })
    return res
  } catch (err) {
    console.error('[stripe/verify-checkout]', err)
    const message = err instanceof Error ? err.message : 'Verification failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
