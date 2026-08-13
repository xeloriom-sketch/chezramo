# CLAUDE.md — Chez Ramo · landing-next

> Lu automatiquement à chaque session Claude Code. Maintenir à jour après chaque feature majeure.

---

## 1. Vue d'ensemble du projet

Site web + apps internes du restaurant **Chez Ramo** (kebab, Lagnieu 01150).
Stack : **Next.js 14 App Router**, TypeScript, Tailwind CSS, Supabase, Stripe.

**URL de prod** : `https://xeloriom-sketch.github.io/chezramo/`  
**Repo** : `https://github.com/xeloriom-sketch/chezramo`  
**Dossier de travail** : `/Users/billaleh./Dev/CHEZ RAMO/landing-next/`

---

## 2. Architecture — route groups

```
app/
├── (landing)/           → landing page publique (/)
│   ├── layout.tsx       → <html> root, SEO metadata, fonts Baloo 2 + DM Sans
│   └── page.tsx         → page d'accueil (Hero, Menu, Avis, About, Contact)
│
├── (apps)/              → apps internes (QR menu, Admin, TV, Diaporama)
│   ├── layout.tsx       → <html> root des apps — viewport mobile, color-scheme, apple meta
│   ├── menu-qr/
│   │   ├── layout.tsx   → fonts + globals.css (pas de <html> — hérité de (apps)/layout)
│   │   └── page.tsx     → APP QR MENU (tout en 1 fichier, ~1 400 lignes)
│   ├── admin/
│   │   ├── page.tsx     → wrapper SSR léger
│   │   └── AdminClient.tsx → panel admin complet (~2 100 lignes)
│   ├── tv/page.tsx      → écran TV (diaporama Supabase)
│   └── diaporama/page.tsx
│
└── api/                 → routes serveur (exclues du build statique)
    ├── orders/route.ts          → GET/POST/PATCH commandes
    ├── reservations/route.ts    → GET/POST/PATCH réservations
    ├── feedbacks/route.ts       → GET/POST avis clients
    ├── customer/orders/route.ts → suivi commande client (token)
    ├── create-payment-intent/route.ts → Stripe
    ├── webhook/route.ts         → Stripe webhook
    └── admin/{login,logout,verify}/route.ts
```

**Components** (landing uniquement) :
`Hero`, `Header`, `Footer`, `MenuSection`, `BestSellers`, `DifferenceSection`,
`ReviewsSection`, `CartSidebar`, `CheckoutModal`, `CustomizerSheet`,
`FloatingCartButton`, `CustomerOrdersModal`, `TicketViewer`, `ScrollEffects`, `TVRedirect`

---

## 3. Build et déploiement — RÈGLE OBLIGATOIRE

> ⚠️ JAMAIS `git push` sans ce protocole. Les TVs rechargent ~1 min après push.

```bash
# 1. Exclure app/api (incompatible static export)
mv app/api /tmp/api_backup

# 2. Build statique
STATIC_EXPORT=true NEXT_PUBLIC_BASE_PATH=/chezramo npm run build

# 3. Restaurer les routes API
mv /tmp/api_backup app/api

# 4. Commit + push
git add <fichiers>
git commit -m "feat/fix: ..."
git push
```

**Dev local** (avec API routes) :
```bash
npm run dev   # http://localhost:3000
```
Admin local : `http://localhost:3000/admin`  
QR menu local : `http://localhost:3000/menu-qr`

---

## 4. Variables d'environnement (`.env.local`)

| Variable | Usage |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase (baked dans le bundle client) |
| `NEXT_PUBLIC_SUPABASE_KEY` | Clé anon/publishable Supabase (client) |
| `SUPABASE_URL` | URL Supabase (server-side API routes) |
| `SUPABASE_KEY` | Clé anon Supabase (server-side) |
| `NEXT_PUBLIC_BASE_PATH` | `/chezramo` en prod GitHub Pages, vide en dev |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe côté client |
| `STRIPE_SECRET_KEY` | ⛔ JAMAIS côté client — API routes seulement |
| `NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL` | Edge functions URL (vide = utilise /api/) |
| `ADMIN_USER` | Login admin (basic auth) |
| `ADMIN_PASS` | Mot de passe admin |

---

## 5. Supabase — tables et RLS

### Tables existantes

| Table | Usage | RLS |
|---|---|---|
| `orders` | Commandes du site | INSERT public, SELECT/PATCH admin |
| `reservations` | Réservations tables | INSERT public, SELECT/PATCH admin |
| `menu_items` | Plats (lu par QR menu et admin) | SELECT public |
| `feedbacks` | Avis clients QR menu | INSERT public, SELECT public |
| `newsletter` | Emails inscrits footer | INSERT public, SELECT public |

### SQL pour créer feedbacks + newsletter (si pas encore fait)

```sql
-- Feedbacks
create table if not exists feedbacks (
  id bigserial primary key,
  stars smallint not null check (stars between 1 and 5),
  message text, table_num text, prize text,
  created_at timestamptz default now()
);
alter table feedbacks enable row level security;
create policy "insert public" on feedbacks for insert with check (true);
create policy "select anon"  on feedbacks for select using (true);

-- Newsletter
create table if not exists newsletter (
  id bigserial primary key,
  email text unique not null,
  created_at timestamptz default now()
);
alter table newsletter enable row level security;
create policy "insert public" on newsletter for insert with check (true);
create policy "select anon"  on newsletter for select using (true);
```

### Pièges Supabase connus

- `menu_items` est lu par le QR menu en temps réel via REST API avec la clé publique
- Les RLS doivent être `for select using (true)` pour les données publiques
- L'admin utilise la même clé anon (pas de service role exposé côté client)

---

## 6. App QR Menu — `app/(apps)/menu-qr/page.tsx`

Tout en un seul fichier ~1 400 lignes. Points clés :

### Constantes importantes (haut du fichier)
```ts
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY ?? ''
const CATEGORIES = [...]   // 7 catégories avec leurs sous-cats Supabase
const BANNERS_COUNT = 3    // nombre de slides du carousel
```

### Audio (Web Audio API)
- `initAudio()` : crée `AudioContext` + pré-génère un `AudioBuffer` (beep 700→385 Hz, 90ms)
- `playTap()` : joue le son si contexte running, sinon `resume().then(fire)`
- **iOS** : le son se déclenche sur `touchend` (gesture directe)
- **Desktop** : le son se déclenche sur `click` (si pas de touchend récent < 500ms)
- `lastTouchAt` timestamp évite le double-play touchend+click sur mobile

### Carousel (bannières en haut)
- CSS transform `translateX(-${bannerIdx * 100}%)` + `transition: transform 0.52s cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- Swipe tactile : `touchStartXRef` avec seuil 40px
- Animations d'entrée relancées via `key` trick : `key={idx === bannerIdx ? 'active-${bannerIdx}' : 'idle-${idx}'}`

### Phases (overlay plein écran)
- `phase`: `'menu' | 'rating' | 'roulette' | 'prize' | 'thanks'`
- Fond blanc, texte #111, boutons noirs — pas de vert
- `saveFeedback()` appelé au clic "Envoyer" → POST direct Supabase REST

### Vues (navigation interne)
- `view`: `'categories' | 'items'`
- `'categories'` : grille des 7 catégories + bannières + best sellers
- `'items'` : liste style McDonald's, filtre par chips horizontales
- `showSearch` : overlay recherche plein écran

### CSS inline (constante `QR_CSS`)
- `color-scheme: light only` — empêche dark mode
- `.qr-outer { min-height: 100dvh }` — fix iOS Safari hauteur
- `.qr-shell { scrollbar-width: none }` — cache scrollbar seulement sur le shell
- `.qr-noscroll`, `.qr-hscroll` — classes utilitaires scroll

---

## 7. Admin Panel — `app/(apps)/admin/AdminClient.tsx`

~2 100 lignes, tout en un fichier.

### Authentification
- Basic auth : `ADMIN_USER` / `ADMIN_PASS` en env
- Token stocké en cookie `admin_token` (httpOnly)
- `isAdmin(req)` dans `lib/adminAuth.ts` vérifie le token

### Onglets
| Tab ID | Label | Données |
|---|---|---|
| `dashboard` | Dashboard | Vue résumée commandes du jour |
| `commandes` | Commandes | Toutes commandes (filter: all/pending/preparing/done/collected/cancelled) |
| `reservations` | Réservations | Table des réservations |
| `feedbacks` | Avis clients | Avis QR menu (stars, message, table, prize) |
| `menu` | Menu | Gestion des plats (via JS statique dans public/) |
| `tvs` | TVs | Reconfiguration des écrans TV |
| `settings` | Paramètres | Son, notifications |

### Pattern API (dev vs prod)
```ts
const FUNCTIONS_BASE = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL ?? ''
const url = FUNCTIONS_BASE ? `${FUNCTIONS_BASE}/admin-orders` : '/api/orders'
```
- En dev (`npm run dev`) : utilise `/api/*` → Next.js API routes
- En prod GitHub Pages : pas d'API routes → doit utiliser `FUNCTIONS_BASE` (Edge Functions Supabase)
- **Actuellement** : admin utilisé uniquement en local → `/api/*` suffit

### Statuts commandes
`pending` → `preparing` → `done` → `collected` (ou `cancelled` à tout moment)
Les commandes `collected` restent visibles dans l'onglet "Toutes".

---

## 8. TVs — `app/(apps)/tv/page.tsx`

- 3 rôles TV : `?tv=1`, `?tv=2`, `?tv=3` (stocké en `localStorage`)
- Le paramètre URL `?tv=N` est optionnel — persiste entre rechargements
- Admin panel → onglet "TVs" → reconfigurer sans se déplacer
- Recharge automatique ~1 min après un push GitHub Pages

---

## 9. Landing page — composants clés

### `components/Footer.tsx`
- Newsletter : POST vers `${SB_URL}/rest/v1/newsletter` avec clé anon
- Table `newsletter` doit exister dans Supabase (voir SQL §5)

### `components/Header.tsx`
- Navigation : Menu, Avis, À propos, Contact
- Menu mobile avec animation `nav-open/nav-close`

### `components/MenuSection.tsx`
- Données menu : lues depuis Supabase ou fichier statique
- 7 catégories, images depuis `/uploads/cut/`

### `components/CartSidebar.tsx` + `CheckoutModal.tsx`
- Checkout 3 étapes : panier → paiement → confirmation
- Stripe : clé publishable côté client, secret uniquement en API route
- ⛔ Jamais stocker numéros de carte, CVV, expiry en localStorage

### `styles/globals.css`
- `color-scheme: light` sur `html` — empêche dark mode global
- `.scrollbar-hide` : utility class (utilisée sur la landing, pas sur le shell QR)
- Animations keyframes : `float-slow`, `word-entrance`, `burger-float`, `bannerTxtIn`, `bannerImgIn`, etc.

---

## 10. Pièges connus et décisions de design

### Next.js / Build
- `app/api/` doit être **exclu** du build statique (voir §3)
- `process.env.NEXT_PUBLIC_*` baked au build — changer une var nécessite un rebuild
- Les routes `(landing)` et `(apps)` ont chacune leur propre `<html>` — pas de layout racine commun

### iOS Safari
- `100vh` ≠ hauteur visible (address bar). Utiliser `100dvh` avec `@supports`
- `AudioContext.resume()` doit être dans une gesture directe (`touchstart`/`touchend`)
- `font-size < 16px` sur un `<input>` déclenche un zoom auto → toujours `font-size: 16px` minimum

### Brave / Chrome dark mode
- Ajouter `<meta name="color-scheme" content="light">` dans le `<head>`
- Et `color-scheme: light` sur `:root` ou `html` en CSS

### Audio cross-browser
- Créer l'`AudioContext` dans le handler `touchstart` (iOS)
- Jouer le son dans `touchend` (iOS) ou `click` (desktop)
- Éviter le double-play : vérifier que `Date.now() - lastTouchAt < 500` dans le handler `click`

### Supabase RLS
- Les tables publiques (menu, feedbacks, newsletter) doivent avoir `for insert with check (true)` et `for select using (true)`
- Les tables admin (orders, reservations) : INSERT public, SELECT/PATCH protégé par token admin

---

## 11. Commandes utiles

```bash
# Dev
npm run dev

# Build statique (GitHub Pages)
mv app/api /tmp/api_backup && STATIC_EXPORT=true NEXT_PUBLIC_BASE_PATH=/chezramo npm run build && mv /tmp/api_backup app/api

# Vérifier les types
npx tsc --noEmit

# Voir les derniers commits
git log --oneline -10
```
