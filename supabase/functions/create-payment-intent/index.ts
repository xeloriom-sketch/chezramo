import Stripe from 'npm:stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Prices mirrored from lib/constants.ts (server-authoritative)
const MENU_PRICES: Record<string, { price: number; menuPrice?: number }> = {
  'Kebab':              { price: 9.00,  menuPrice: 12.00 },
  'Kebab Frites':       { price: 9.50 },
  'Kebab Géant':        { price: 15.00, menuPrice: 17.00 },
  'Kofte':              { price: 9.00,  menuPrice: 12.00 },
  'Américain':          { price: 9.00,  menuPrice: 12.00 },
  'Escalope':           { price: 9.00,  menuPrice: 12.00 },
  'Cordon Bleu':        { price: 9.00,  menuPrice: 12.00 },
  'Galette (Dürum)':    { price: 9.00,  menuPrice: 12.00 },
  'Miche Kebab':        { price: 9.00,  menuPrice: 12.00 },
  'Tacos':              { price: 10.00, menuPrice: 13.00 },
  'Maxi Tacos':         { price: 15.00, menuPrice: 17.00 },
  'Chicken Burger':     { price: 6.00,  menuPrice: 9.00 },
  'Cheese Burger':      { price: 6.00,  menuPrice: 9.00 },
  'Nuggets (x7)':       { price: 8.50 },
  'Wings (x4)':         { price: 7.50 },
  'Tenders (x4)':       { price: 7.50 },
  'Assiette Kebab':     { price: 15.00 },
  'Assiette Escalope':  { price: 15.00 },
  'Assiette Kofte':     { price: 15.00 },
  'Assiette Steak':     { price: 15.00 },
  'Assiette Cordon Bleu': { price: 15.00 },
  'Assiette Mixte':     { price: 18.00 },
  'Assiette Enfant':    { price: 12.00 },
  'Assiette Emporter':  { price: 15.00 },
  'Escalope Crème':     { price: 12.50 },
  'Filet de Poulet':    { price: 12.00 },
  'Pleskavice':         { price: 9.50 },
  'Makarona':           { price: 8.50 },
  'Qofte x5':           { price: 9.00 },
  'Qofte x7':           { price: 11.00 },
  'Qofte x10':          { price: 13.00 },
  'Salade Grecque':     { price: 6.00 },
  'Salade du Berger':   { price: 10.00 },
  'Salade Shope':       { price: 6.00 },
  'Burek Fromage':      { price: 3.50 },
  'Burek Épinards':     { price: 3.50 },
  'Burek Viande':       { price: 4.00 },
  'Fli - Flija':        { price: 4.00 },
  'Trilece':            { price: 3.50 },
  'Tiramisu':           { price: 3.50 },
  'Menu Enfant':        { price: 10.00 },
  'Frites':             { price: 2.00 },
  'Barquette Viande':   { price: 10.00 },
  'Coca-Cola':          { price: 2.00 },
  'Fanta Orange':       { price: 2.00 },
  'Fanta Citron':       { price: 2.00 },
  'Sprite':             { price: 2.00 },
  'Ice Tea Pêche':      { price: 2.00 },
  'Ice Tea Citron':     { price: 2.00 },
  'Oasis':              { price: 2.00 },
  'Eau plate':          { price: 1.00 },
  'Eau gazeuse':        { price: 1.50 },
  'Café':               { price: 1.50 },
  'Thé à la menthe':    { price: 1.50 },
}

function serverPrice(key: string): number | null {
  const parts = key.split('||')
  const baseName = parts[0]
  const mode = parts[1]
  const saucesStr = parts[3] ?? ''
  const item = MENU_PRICES[baseName]
  if (!item) return null
  const base = mode === 'menu' && item.menuPrice ? item.menuPrice : item.price
  const numSauces = saucesStr ? saucesStr.split(',').filter(Boolean).length : 0
  return Math.round((base + Math.max(0, numSauces - 2)) * 100) / 100
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  try {
    const body = await req.json()
    const { cart } = body

    if (!Array.isArray(cart) || cart.length === 0 || cart.length > 30) {
      return Response.json({ error: 'Panier invalide.' }, { status: 400, headers: CORS })
    }

    let total = 0
    for (const raw of cart) {
      const qty = Number(raw.qty)
      if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
        return Response.json({ error: 'Quantité invalide.' }, { status: 400, headers: CORS })
      }

      let unitPrice: number | null = null
      if (typeof raw.key === 'string' && raw.key.length > 0) {
        unitPrice = serverPrice(raw.key)
      }
      if (unitPrice === null) {
        const clientPrice = Number(raw.price)
        if (!isFinite(clientPrice) || clientPrice < 0.5 || clientPrice > 150) {
          return Response.json({ error: 'Prix invalide.' }, { status: 400, headers: CORS })
        }
        unitPrice = Math.round(clientPrice * 100) / 100
      }
      total += unitPrice * qty
    }

    const amountCents = Math.round(total * 100)
    if (amountCents < 50 || amountCents > 50000) {
      return Response.json({ error: 'Montant invalide.' }, { status: 400, headers: CORS })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'eur',
      payment_method_types: ['card'],
      metadata: {
        items: JSON.stringify(
          cart.slice(0, 10).map((i: { name?: string; qty: unknown }) => ({
            n: String(i.name ?? '').slice(0, 80),
            q: Number(i.qty),
          }))
        ),
      },
    })

    return Response.json(
      { clientSecret: paymentIntent.client_secret },
      { headers: CORS }
    )
  } catch (err) {
    console.error('[stripe]', err)
    return Response.json({ error: 'Erreur paiement.' }, { status: 500, headers: CORS })
  }
})
