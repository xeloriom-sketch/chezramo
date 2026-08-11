import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY! as any)

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Signature manquante.' }, { status: 400 })

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const msg = err instanceof Error ? err.message.slice(0, 80) : 'Erreur'
    console.error('[webhook] Signature invalide:', msg)
    return NextResponse.json({ error: 'Webhook Error.' }, { status: 400 })
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      console.log(`[webhook] Paiement confirmé: ${pi.id} — ${(pi.amount / 100).toFixed(2)} €`)
      break
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      console.warn(`[webhook] Paiement échoué: ${pi.id}`)
      break
    }
  }

  return NextResponse.json({ received: true })
}
