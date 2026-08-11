import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/adminAuth'

// SQL à exécuter une fois dans Supabase dashboard → SQL Editor :
// create table if not exists reservations (
//   id bigserial primary key,
//   fullname text not null,
//   email text not null,
//   phone text,
//   date date not null,
//   time text not null,
//   guests integer not null default 2,
//   message text,
//   status text not null default 'pending',
//   created_at timestamptz not null default now()
// );
// alter table reservations enable row level security;
// create policy "anon_insert" on reservations for insert with check (true);
// create policy "anon_select" on reservations for select using (true);
// create policy "anon_update" on reservations for update using (true);

const SB_URL = process.env.SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_KEY!
const SB_HDR = () => ({
  'Content-Type': 'application/json',
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fullname, email, phone, date, time, guests, message } = body

    if (!fullname || !email || !date || !time) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 })
    }

    const safeName    = String(fullname).trim().replace(/[<>"']/g, '').slice(0, 100)
    const safeEmail   = String(email).trim().slice(0, 200)
    const safePhone   = phone ? String(phone).trim().slice(0, 30) : null
    const safeDate    = String(date).trim().slice(0, 10)
    const safeTime    = String(time).trim().slice(0, 5)
    const safeGuests  = Math.max(1, Math.min(50, parseInt(String(guests)) || 2))
    const safeMessage = message ? String(message).trim().replace(/[<>"']/g, '').slice(0, 500) : null

    const res = await fetch(`${SB_URL}/rest/v1/reservations`, {
      method: 'POST',
      headers: { ...SB_HDR(), Prefer: 'return=minimal' },
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
      const errText = await res.text()
      console.error('[reservations POST]', res.status, errText)
      return NextResponse.json({ error: 'Erreur base de données.' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[reservations POST]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/reservations?select=*&order=date.asc,time.asc&limit=200`,
      { headers: SB_HDR(), cache: 'no-store' }
    )
    if (!res.ok) return NextResponse.json([], { status: 200 })
    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data : [])
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }
  try {
    const { id, status } = await req.json()
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json({ error: 'id invalide.' }, { status: 400 })
    }
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 })
    }
    const res = await fetch(`${SB_URL}/rest/v1/reservations?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...SB_HDR(), Prefer: 'return=minimal' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) return NextResponse.json({ error: 'Erreur base de données.' }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
