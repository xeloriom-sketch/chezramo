const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
}

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const SB = Deno.env.get('SUPABASE_URL') ?? ''

  // POST — public (formulaire de réservation client)
  if (req.method === 'POST') {
    try {
      const body = await req.json()
      const { fullname, email, phone, date, time, guests, message } = body

      if (!fullname || !email || !date || !time) {
        return Response.json({ error: 'Champs requis manquants.' }, { status: 400, headers: CORS })
      }

      const safeName    = String(fullname).trim().replace(/[<>"']/g, '').slice(0, 100)
      const safeEmail   = String(email).trim().slice(0, 200)
      const safePhone   = phone ? String(phone).trim().slice(0, 30) : null
      const safeDate    = String(date).trim().slice(0, 10)
      const safeTime    = String(time).trim().slice(0, 5)
      const safeGuests  = Math.max(1, Math.min(50, parseInt(String(guests)) || 2))
      const safeMessage = message ? String(message).trim().replace(/[<>"']/g, '').slice(0, 500) : null

      const res = await fetch(`${SB}/rest/v1/reservations`, {
        method: 'POST',
        headers: { ...sbHeaders(), Prefer: 'return=minimal' },
        body: JSON.stringify({
          fullname: safeName,
          email: safeEmail,
          phone: safePhone,
          date: safeDate,
          time: safeTime,
          guests: safeGuests,
          message: safeMessage,
          status: 'pending',
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        console.error('[reservations POST]', res.status, err)
        return Response.json({ error: 'Erreur base de données.' }, { status: 500, headers: CORS })
      }
      return Response.json({ ok: true }, { headers: CORS })
    } catch (e) {
      console.error('[reservations POST]', e)
      return Response.json({ error: 'Erreur serveur.' }, { status: 500, headers: CORS })
    }
  }

  // GET et PATCH — admin uniquement
  if (!await isValidToken(req)) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401, headers: CORS })
  }

  if (req.method === 'GET') {
    const res = await fetch(`${SB}/rest/v1/reservations?select=*&order=date.asc,time.asc&limit=200`, {
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
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return Response.json({ error: 'Statut invalide.' }, { status: 400, headers: CORS })
    }
    const res = await fetch(`${SB}/rest/v1/reservations?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...sbHeaders(), Prefer: 'return=minimal' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) return Response.json({ error: 'Erreur base de données.' }, { status: 500, headers: CORS })
    return Response.json({ ok: true }, { headers: CORS })
  }

  return new Response('Method not allowed', { status: 405 })
})
