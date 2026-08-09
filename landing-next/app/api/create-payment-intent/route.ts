import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY! as any)

export async function POST(req: NextRequest) {
  try {
    const { cart } = await req.json()
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Panier vide.' }, { status: 400 })
    }

    const amount = Math.round(
      cart.reduce((t: number, i: { price: number; qty: number }) => t + i.price * i.qty, 0) * 100
    )

    if (amount < 50) {
      return NextResponse.json({ error: 'Montant trop faible.' }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: {
        items: JSON.stringify(cart.map((i: { name: string; qty: number }) => ({ n: i.name, q: i.qty }))),
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur Stripe'
    console.error('[stripe]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
