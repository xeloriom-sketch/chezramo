# CHEZ RAMO — Système complet restaurant

Système complet pour le restaurant **Chez Ramo** (kebab / spécialités balkaniques, Lagnieu).
Deux déploiements distincts : **GitHub Pages** (TVs statiques) + **Next.js** (admin + landing).

> ⚠️ **PRODUCTION** : les TVs du client utilisent ce système en direct.
> Chaque `git push` sur `main` déploie automatiquement via GitHub Actions.
> Les TV se rechargent dans la minute qui suit. **Ne jamais push sans validation.**

---

## Architecture globale

```
/                          ← GitHub Pages (statique, TVs du restaurant)
│  index.html              ← Affichage TV : ?tv=1 ?tv=2 ?tv=3
│  menu.js                 ← Données menu + logique diaporama
│  style.css               ← Styles TV
│  sw.js                   ← Service Worker (cache offline TV)
│  uploads/                ← Photos menu (gitignore, déployées séparément)
│  version.json            ← Timestamp auto pour reload TV
│
└── landing-next/          ← Application Next.js 14 (séparée — Vercel ou local)
    ├── app/(apps)/admin/  ← 🔧 Dashboard admin restaurant
    ├── app/(apps)/tv/     ← 📺 Page TV (version Next.js)
    ├── app/(apps)/menu-qr/← 📱 Menu QR sur table
    ├── app/(landing)/     ← 🌐 Landing page vitrine
    └── app/api/           ← API routes (orders, checkout, stripe)
```

---

## TVs restaurant (GitHub Pages)

URLs actives sur les TVs du client :
- **TV 1** : `https://xeloriom-sketch.github.io/chezramo/?tv=1` — Menu Partie 1
- **TV 2** : `https://xeloriom-sketch.github.io/chezramo/?tv=2` — Menu Partie 2
- **TV 3** : `https://xeloriom-sketch.github.io/chezramo/?tv=3` — Publicités

Données menu dans **Supabase** (`menu_items`). Les TVs se rechargent automatiquement via `version.json`.

---

## Application Next.js (`landing-next/`)

### Prérequis
```bash
cd landing-next
npm install
npm run dev        # port 3333 (configuré dans package.json)
```

### Variables d'environnement
Copier `.env.example` → `.env` et remplir :
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLIC_KEY=pk_test_...
PORT=3333

ADMIN_USER=ramo
ADMIN_PASSWORD=ramo2024
```

### Pages

| URL | Rôle |
|---|---|
| `/` | Landing page vitrine (hero, menu, réservation, avis) |
| `/admin` | Dashboard admin restaurant |
| `/menu-qr` | Menu client QR code sur table (`?table=1` pour indiquer la table) |
| `/menu-qr?table=3` | Menu pour la table 3 |
| `/tv` | Affichage TV version Next.js |

---

## Dashboard admin (`/admin`)

### Connexion
- **Identifiant** : `ramo`
- **Mot de passe** : `ramo2024`

### Fonctionnalités

| Onglet | Contenu |
|---|---|
| **Dashboard** | Stats du jour (commandes, revenus, en attente), commandes récentes |
| **Commandes** | Liste complète avec filtres (toutes / en attente / terminées / annulées), boutons ✓/✕ |
| **Menu** | Tableau des articles par catégorie — modifier prix via inputs inline, éditer/supprimer |
| **TVs** | Tableau de monitoring des 3 TVs (statut en ligne, appareil, lien, actions) |
| **Réglages** | Toggle son notifications, infos système, liens rapides |

### Notifications commandes
- Son à 3 notes (La♪ Do#♪ Mi♪) via Web Audio API à chaque nouvelle commande
- Toast visuel avec compte et bouton de fermeture
- Badge rouge sur l'onglet Commandes
- Polling toutes les 5s sur `/api/orders`

### Responsive
- **Desktop** : sidebar fixe 256px + contenu
- **Tablet** (< 960px) : sidebar en overlay hamburger
- **Mobile** (< 640px) : navigation bottom bar fixe

---

## Menu QR (`/menu-qr`)

Page menu numérique pour les clients en salle. Accès via QR code sur chaque table.

**Générer un QR code pour une table :**
1. Aller sur `http://localhost:3333/menu-qr?table=1` (table 1)
2. Utiliser un générateur QR (ex. qr-code-generator.com) avec l'URL de production
3. Imprimer et plastifier sur la table

**Fonctionnalités de la page :**
- Menu complet catégorisé avec photos
- Recherche instantanée
- Fiche détail par plat (photo + prix seul + prix menu)
- Notation de l'expérience (étoiles)
- Roue de la chance (cadeau si 4-5 étoiles)
- Redirect vers avis Google

---

## Supabase (base de données)

**URL** : `https://hqfewokpvjmxezhnurbm.supabase.co`

### Tables

| Table | Contenu | RLS |
|---|---|---|
| `menu_items` | Articles du menu (nom, catégorie, prix, prix menu, image) | Public read, anon write |
| `orders` | Commandes clients (items JSON, total, statut) | Public read/write |
| `tv_roles` | État des TVs (device_id, last_seen, rôle 1/2/3) | Public read/write |

### Initialisation
```sql
-- Voir supabase_setup.sql (menu_items + tv_roles)
-- Voir supabase_orders_setup.sql (orders)
```

---

## Stripe (paiements)

Mode **test** actuellement. Webhooks configurés sur `/api/stripe/webhook`.

Clés dans `.env` (jamais committées). Checkout en 3 étapes dans la landing page.

---

## Service Worker

`sw.js` (racine pour TVs) et `landing-next/public/sw.js` (Next.js) — version `ramo-v5`.

**Règles de cache :**
- `/api/*` → réseau direct, jamais en cache
- `/admin*` → réseau direct
- `supabase.co` → réseau direct
- `/_next/*` → réseau direct
- Tout le reste (TV assets) → cache-first offline

Le SW se met à jour automatiquement sans intervention DevTools grâce à `skipWaiting()` + `clients.claim()` + code de force-update côté admin.

---

## Déploiement

### GitHub Pages (TVs)
Push sur `main` → GitHub Actions déploie automatiquement :
- Génère `version.json` (timestamp)
- Convertit les images en WebP
- Déploie la racine du repo

### Next.js (admin + landing)
Déployer sur **Vercel** (recommandé) ou serveur Node.js.
```bash
cd landing-next
npm run build
npm start
```

---

## Structure uploads

```
uploads/           ← Photos originales (gitignore)
uploads/cut/       ← Versions détourées PNG fond transparent
```

Conventions de nommage : `Kebab Géant.png`, `Tacos.png` (espaces OK, encodés en URL).
