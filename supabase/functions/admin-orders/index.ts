const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
}

const ALLOWED_STATUS = ['pending', 'preparing', 'done', 'cancelled', 'collected']

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

  if (!await isValidToken(req)) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401, headers: CORS })
  }

  const SB = Deno.env.get('SUPABASE_URL') ?? ''

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

  return new Response('Method not allowed', { status: 405 })
})
