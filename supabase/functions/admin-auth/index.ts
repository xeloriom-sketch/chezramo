const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

async function isValidToken(token: string): Promise<boolean> {
  const expected = await generateToken()
  if (typeof token !== 'string' || token.length !== expected.length) return false
  let same = true
  for (let i = 0; i < expected.length; i++) {
    if (token.charCodeAt(i) !== expected.charCodeAt(i)) same = false
  }
  return same
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  try {
    const body = await req.json()
    const { action } = body

    if (action === 'login') {
      const { user, pass } = body
      const eu = Deno.env.get('ADMIN_USER') ?? ''
      const ep = Deno.env.get('ADMIN_PASS') ?? ''
      if (!eu || !ep || typeof user !== 'string' || typeof pass !== 'string') {
        return Response.json({ error: 'Identifiants manquants.' }, { status: 400, headers: CORS })
      }
      if (user !== eu || pass !== ep) {
        await new Promise(r => setTimeout(r, 300 + Math.random() * 200))
        return Response.json({ error: 'Identifiant ou mot de passe incorrect.' }, { status: 401, headers: CORS })
      }
      const token = await generateToken()
      return Response.json({ ok: true, token }, { headers: CORS })
    }

    if (action === 'verify') {
      const { token } = body
      const ok = await isValidToken(token)
      return Response.json({ ok }, { status: ok ? 200 : 401, headers: CORS })
    }

    return Response.json({ error: 'Action inconnue.' }, { status: 400, headers: CORS })
  } catch {
    return Response.json({ error: 'Erreur serveur.' }, { status: 500, headers: CORS })
  }
})
