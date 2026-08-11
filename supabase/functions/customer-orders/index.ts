const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function sbHeaders() {
  return {
    'Content-Type': 'application/json',
    'apikey': Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') ?? ''}`,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const SB = Deno.env.get('SUPABASE_URL') ?? ''

  // GET — statut des commandes du client par token
  if (req.method === 'GET') {
    const token = new URL(req.url).searchParams.get('token') ?? ''
    if (!UUID_RE.test(token)) {
      return Response.json({ error: 'Token invalide.' }, { status: 400, headers: CORS })
    }
    try {
      const url = `${SB}/rest/v1/orders`
        + `?customer_token=eq.${encodeURIComponent(token)}`
        + `&select=order_id,status,items,total,created_at`
        + `&order=created_at.desc&limit=20`
      const res = await fetch(url, { headers: sbHeaders() })
      const data = res.ok ? await res.json() : []
      return Response.json(Array.isArray(data) ? data : [], { headers: CORS })
    } catch {
      return Response.json([], { headers: CORS })
    }
  }

  // PATCH — client marque sa commande comme récupérée
  if (req.method === 'PATCH') {
    try {
      const body = await req.json()
      const token    = String(body.token    ?? '')
      const order_id = Number(body.order_id ?? 0)

      if (!UUID_RE.test(token)) {
        return Response.json({ error: 'Token invalide.' }, { status: 400, headers: CORS })
      }
      if (!Number.isInteger(order_id) || order_id <= 0) {
        return Response.json({ error: 'order_id invalide.' }, { status: 400, headers: CORS })
      }

      // Vérifier que la commande appartient à ce token
      const checkUrl = `${SB}/rest/v1/orders`
        + `?customer_token=eq.${encodeURIComponent(token)}`
        + `&order_id=eq.${order_id}`
        + `&select=id,status`
      const check = await fetch(checkUrl, { headers: sbHeaders() })
      if (!check.ok) return Response.json({ error: 'Erreur serveur.' }, { status: 500, headers: CORS })

      const rows: { id: number; status: string }[] = await check.json()
      if (!rows.length) return Response.json({ error: 'Commande introuvable.' }, { status: 404, headers: CORS })

      const allowed = ['done', 'preparing', 'pending']
      if (!allowed.includes(rows[0].status)) {
        return Response.json({ ok: true }, { headers: CORS })
      }

      const patchUrl = `${SB}/rest/v1/orders`
        + `?customer_token=eq.${encodeURIComponent(token)}`
        + `&order_id=eq.${order_id}`
      await fetch(patchUrl, {
        method: 'PATCH',
        headers: { ...sbHeaders(), Prefer: 'return=minimal' },
        body: JSON.stringify({ status: 'collected' }),
      })

      return Response.json({ ok: true }, { headers: CORS })
    } catch {
      return Response.json({ error: 'Erreur serveur.' }, { status: 500, headers: CORS })
    }
  }

  return new Response('Method not allowed', { status: 405 })
})
