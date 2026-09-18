// @ts-ignore — web-push fonctionne en Deno via compatibilité Node
import webPush from 'npm:web-push@3.6.7'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, x-push-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const PUSH_SECRET = Deno.env.get('PUSH_INTERNAL_SECRET') ?? ''
  if (PUSH_SECRET && req.headers.get('x-push-secret') !== PUSH_SECRET) {
    return new Response('Unauthorized', { status: 401, headers: CORS })
  }

  const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY') ?? ''
  const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
  const SB            = Deno.env.get('SUPABASE_URL') ?? ''
  const SB_KEY        = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return Response.json({ error: 'VAPID keys manquantes' }, { status: 500, headers: CORS })
  }

  webPush.setVapidDetails('mailto:chezramo@gmail.com', VAPID_PUBLIC, VAPID_PRIVATE)

  const body = await req.json().catch(() => ({}))
  const payload = JSON.stringify({
    title: 'Nouvelle commande !',
    body: body.order_id
      ? `RMO-${body.order_id} · ${Number(body.total || 0).toFixed(2)} €`
      : 'Une commande est en attente',
    icon: '/chezramo/admin-icon-192.png',
    badge: '/chezramo/admin-icon-192.png',
    tag: `order-${body.order_id ?? Date.now()}`,
    requireInteraction: true,
  })

  const subsRes = await fetch(`${SB}/rest/v1/push_subscriptions?select=id,subscription`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
  })
  if (!subsRes.ok) {
    return Response.json({ error: 'Erreur lecture subscriptions' }, { status: 500, headers: CORS })
  }

  const subs: { id: number; subscription: webPush.PushSubscription }[] = await subsRes.json()
  const expiredIds: number[] = []

  await Promise.allSettled(subs.map(async s => {
    try {
      await webPush.sendNotification(s.subscription, payload)
    } catch (err: unknown) {
      const code = (err as { statusCode?: number }).statusCode
      if (code === 404 || code === 410) expiredIds.push(s.id)
    }
  }))

  // Supprimer les abonnements expirés
  if (expiredIds.length) {
    await fetch(`${SB}/rest/v1/push_subscriptions?id=in.(${expiredIds.join(',')})`, {
      method: 'DELETE',
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
    }).catch(() => {})
  }

  return Response.json({ sent: subs.length - expiredIds.length, total: subs.length }, { headers: CORS })
})
