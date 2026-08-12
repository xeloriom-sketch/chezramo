const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
}

const ALLOWED_STATUS = ['pending', 'preparing', 'done', 'cancelled', 'collected']
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function generateToken(): Promise<string> {
  const secret = Deno.env.get('ADMIN_SESSION_SECRET') ?? 'fallback'
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('chez-ramo-admin-v1'))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function isValidToken(req: Request): Promise<boolean> {
  const auth = req.headers.get('Authorization') ?? ''
  if (!auth.startsWith('Bearer ')) return false
  const token = auth.slice(7)
  const expected = await generateToken()
  if (token.length !== expected.length) return false
  let same = true
  for (let i = 0; i < expected.length; i++) {
    if (token.charCodeAt(i) !== expected.charCodeAt(i)) same = false
  }
  return same
}

function sbHeaders() {
  return {
    'Content-Type': 'application/json',
    'apikey': Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') ?? ''}`,
  }
}

function sbServiceHeaders() {
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  return {
    'Content-Type': 'application/json',
    'apikey': key,
    'Authorization': `Bearer ${key}`,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const SB = Deno.env.get('SUPABASE_URL') ?? ''

  // POST — public (sauvegarde commande après paiement Stripe)
  if (req.method === 'POST') {
    try {
      const body = await req.json()
      const { orderId, cart, total, customerToken, customerName } = body

      if (!Number.isInteger(orderId) || orderId < 1000 || orderId > 9999) {
        return Response.json({ error: 'orderId invalide.' }, { status: 400, headers: CORS })
      }
      if (!Array.isArray(cart) || cart.length === 0 || cart.length > 50) {
        return Response.json({ error: 'Panier invalide.' }, { status: 400, headers: CORS })
      }
      const totalNum = Number(total)
      if (!isFinite(totalNum) || totalNum <= 0 || totalNum > 5000) {
        return Response.json({ error: 'Total invalide.' }, { status: 400, headers: CORS })
      }

      const safeToken = typeof customerToken === 'string' && UUID_RE.test(customerToken) ? customerToken : null
      const safeName = typeof customerName === 'string'
        ? customerName.trim().replace(/[<>"']/g, '').slice(0, 80) || null
        : null

      const res = await fetch(`${SB}/rest/v1/orders`, {
        method: 'POST',
        headers: { ...sbHeaders(), Prefer: 'return=minimal' },
        body: JSON.stringify({
          order_id: orderId,
          items: cart,
          total: totalNum,
          status: 'pending',
          customer_token: safeToken,
          customer_name: safeName,
        }),
      })
      if (!res.ok) {
        const err = await res.text()
        console.error('[orders POST]', res.status, err)
        return Response.json({ error: 'Erreur base de données.' }, { status: 500, headers: CORS })
      }
      return Response.json({ ok: true }, { headers: CORS })
    } catch (e) {
      console.error('[orders POST]', e)
      return Response.json({ error: 'Erreur serveur.' }, { status: 500, headers: CORS })
    }
  }

  // GET et PATCH — admin uniquement
  if (!await isValidToken(req)) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401, headers: CORS })
  }

  if (req.method === 'GET') {
    const res = await fetch(`${SB}/rest/v1/orders?select=*&order=created_at.desc&limit=200`, {
      headers: sbHeaders(),
    })
    const data = res.ok ? await res.json() : []
    return Response.json(Array.isArray(data) ? data : [], { headers: CORS })
  }

  if (req.method === 'PATCH') {
    const { id, status } = await req.json()
    if (!Number.isInteger(id) || id < 1) {
      return Response.json({ error: 'id invalide.' }, { status: 400, headers: CORS })
    }
    if (!ALLOWED_STATUS.includes(status)) {
      return Response.json({ error: 'Statut invalide.' }, { status: 400, headers: CORS })
    }
    const res = await fetch(`${SB}/rest/v1/orders?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...sbHeaders(), Prefer: 'return=minimal' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) return Response.json({ error: 'Erreur base de données.' }, { status: 500, headers: CORS })
    return Response.json({ ok: true }, { headers: CORS })
  }

  if (req.method === 'DELETE') {
    const id = Number(new URL(req.url).searchParams.get('id') ?? '0')
    if (!Number.isInteger(id) || id < 1) {
      return Response.json({ error: 'id invalide.' }, { status: 400, headers: CORS })
    }
    const res = await fetch(`${SB}/rest/v1/orders?id=eq.${id}`, {
      method: 'DELETE',
      headers: { ...sbServiceHeaders(), Prefer: 'return=minimal' },
    })
    if (!res.ok) return Response.json({ error: 'Erreur base de données.' }, { status: 500, headers: CORS })
    return Response.json({ ok: true }, { headers: CORS })
  }

  return new Response('Method not allowed', { status: 405 })
})
