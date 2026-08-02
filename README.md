# CHEZ RAMO — Menu TV

Affichage de menu sur TV pour le restaurant **Chez Ramo** (kebab / spécialités balkaniques).
Site 100% statique hébergé sur **GitHub Pages**, données menu dans **Supabase**.

> ⚠️ **PRODUCTION** : le client utilise ce système en direct sur ses TV.
> Chaque `git push` sur `main` déploie automatiquement et les TV se rechargent
> toutes seules dans la minute qui suit. **Ne jamais push sans validation.**

---

## Les 3 applications

| Fichier | Rôle |
|---|---|
| `index.html` + `menu.js` + `style.css` | **Écran TV** : diaporama automatique du menu (catégorie par catégorie, 3 plats max par slide) |
| `admin.html` + `admin.js` + `admin.css` | **Panneau admin** : modifier plats, prix, catégories → écrit dans Supabase |
| `generer-diaporama.html` | **Plan B clé USB** : génère des PNG du menu à copier sur clé USB (si la TV n'a pas de navigateur / pas de wifi) |

## Flux de données

```
Supabase (table menu_items)  ←── admin.html (écriture, mot de passe requis)
        │
        ▼  fetch toutes les 30s
index.html (TV)  ──  fallback : defaultMenu codé en dur dans menu.js si hors ligne
```

- La TV affiche **immédiatement** le menu par défaut (codé en dur), puis remplace
  par les données Supabase 2 secondes après le chargement.
- Le menu par défaut existe en **3 copies** qu'il faut garder synchronisées à la main :
  `menu.js` (defaultMenu), `admin.js` (defaultMenu), `supabase_setup.sql` (seed).

## Déploiement (GitHub Pages)

- Repo : `xeloriom-sketch/chezramo` — workflow `.github/workflows/static.yml`.
- À chaque push sur `main`, le workflow :
  1. Régénère `version.json` avec un timestamp (⚠️ ne jamais l'éditer à la main,
     la version committée est un placeholder) ;
  2. Convertit en **WebP** (`cwebp -q 82`) les PNG/JPG de `uploads/` qui n'ont
     pas encore de `.webp` ;
  3. Déploie **tout le repo tel quel** (`path: '.'`) sur GitHub Pages.
- Les TV interrogent `version.json` toutes les 60s : si la version change,
  elles font `location.reload()` → **tout push est visible sur les TV en ~1 min**.
- Ajouter un fichier au repo (comme ce README) est sans danger : Pages sert
  simplement `index.html` à la racine, le reste est ignoré par les visiteurs.

## Ajouter / changer une photo de plat

1. Déposer le **PNG** dans `uploads/` (le workflow créera le `.webp` au deploy).
2. Renseigner le chemin `uploads/Nom.png` dans le champ *url* de l'admin (ou en SQL).
3. La TV essaie d'abord le `.webp`, retombe sur le `.png` si absent.
4. **Pour le mode panneau** : générer la version détourée `uploads/cut/Nom.png`
   (plat sur fond transparent). Les 53 existantes ont été générées par IA avec
   `rembg` (modèle u2netp) : détourage + recadrage + max 420 px. Si la version
   détourée manque, le panneau retombe sur la photo originale.

L'admin **n'uploade pas** d'images — il ne stocke que le chemin texte. Les
fichiers doivent passer par git.

## Robustesse TV (offline-first)

- **Service worker** `sw.js` (cache `ramo-v2`) : HTML/JS/CSS/images servis
  cache-d'abord, mise à jour réseau en fond ; pré-cache **toutes** les images
  du menu en séquentiel 6s après le chargement.
- **Détection réseau** (`menu.js`) : en connexion faible/hors ligne, coupe
  l'animation Ken Burns, allonge la durée des slides, affiche une pastille
  d'état en bas d'écran.
- Reload de secours forcé toutes les **4 heures**.
- Navigation télécommande : flèches ←/→, Enter, touches media TV ; clic = slide suivant.

## Affichage : panneau (défaut) ou diaporama

Deux modes, bascule avec la touche **`3`** de la télécommande (mémorisé) :

- **Panneau** (`board`, défaut) : écran type borne fast-food, en-tête bandeau
  rouge plein. À gauche, colonne **« À LA UNE »** : un plat vedette en très
  grand (photo détourée + halo rouge, badge pulsant, gros prix) qui tourne
  toutes les 7 s (`HERO_DURATION`) parmi les plats de cette TV. À droite,
  3 colonnes de panneaux catégorie (bandeau-titre rouge incliné) avec une
  **ligne par plat** : vignette détourée, nom + badge, description grise,
  prix blanc lumineux + ligne `MENU x,xx€` rouge. **Tout le menu est visible
  d'un coup**, statique. Si le contenu dépasse un écran (TV unique avec menu
  complet), il se découpe en pages qui tournent toutes les 20 s
  (`BOARD_DURATION`). Répartition automatique (`boardPages()`,
  budget `BOARD_MAX_COL` lignes par colonne).
- **Diaporama** (`diapo`) : l'ancien mode photo, 3 plats par slide, 6 s par
  slide. Toujours là pour mettre les photos en avant.

## Mode 2 TV (menu partagé entre deux écrans)

Le resto a **2 TV** : chaque TV affiche **la moitié des catégories**. En mode
panneau, chaque moitié tient sur **une seule page statique** → le client voit
tout le menu instantanément, comme chez McDo.

### Détection automatique (défaut)

Les TV se répartissent les rôles **toutes seules** via la table Supabase
`tv_roles` (⚠️ exécuter **`supabase_tv_setup.sql`** une fois dans
Supabase → SQL Editor avant de déployer) :

- Chaque TV a une identité stable (`ramo_device` en localStorage) et réclame
  le premier rôle libre : la 1ère allumée devient TV 1, la 2ème devient TV 2.
- Heartbeat toutes les 45 s ; un rôle silencieux depuis **2 min** est
  considéré libre (TV remplacée / cache vidé → le rôle se libère tout seul).
- La réclamation se fait par `PATCH` conditionnel (filtre `last_seen <
  maintenant − 2 min` dans l'URL) : atomique côté Postgres, pas de conflit
  si les 2 TV démarrent en même temps.
- Si Supabase est injoignable ou la table absente : la TV affiche le menu
  complet (fallback sans danger).
- Une TV garde son rôle après reload/deploy/coupure (même `device_id`).

### Choix manuel (touches télécommande)

Le manuel a **priorité** sur l'auto et est mémorisé :

| Touche | Action |
|---|---|
| `1` / `2` | Force : cette TV affiche la 1ère / 2ème moitié |
| `0` | Force : menu complet (TV unique) |
| `5` | Efface le choix manuel → retour détection auto |
| `3` | Bascule panneau ↔ diaporama photo |
| ←/→, Enter | Page/slide précédent(e) / suivant(e) |

Alternative sans télécommande : ouvrir `index.html?tv=1` (ou `?tv=2`).

### Divers

- Une pastille bleue (« TV 1 — DÉTECTION AUTO », « TV 2 — MANUEL »…)
  s'affiche 5 s au démarrage et à chaque changement pour identifier l'écran.
- Le découpage est dynamique (`slidesForTv()` dans `menu.js`) : si des
  catégories sont ajoutées dans Supabase, la répartition se réajuste seule.
- Les deux TV pré-cachent quand même **toutes** les images, y compris les
  détourées (utile si on échange les rôles ou repasse en diaporama).
- ⚠️ Deux onglets du **même navigateur** partagent le même `device_id` : pour
  tester l'auto en local, utiliser deux navigateurs différents (ou une
  fenêtre privée).

## Config & accès

| Quoi | Où |
|---|---|
| Durée d'un slide | `menu.js` → `BASE_DURATION` (6 s) et `SLOW_DURATION` (9 s en connexion faible) |
| Mot de passe admin | `admin.js` → `ADMIN_PASS` (en clair côté client) |
| Supabase | Projet `hqfewokpvjmxezhnurbm`, clé *publishable* dans `menu.js`/`admin.js`, tables `menu_items` + `tv_roles` |
| Schéma / seed DB | `supabase_setup.sql` (menu) et `supabase_tv_setup.sql` (rôles TV) — à coller dans Supabase → SQL Editor |

⚠️ **Sécurité connue** : les policies RLS de `menu_items` sont entièrement
publiques (SELECT/INSERT/UPDATE/DELETE pour tous) — n'importe qui avec la clé
publishable peut modifier le menu. Le mot de passe admin ne protège que l'UI.

## Pièges à connaître

- **Ne pas renommer/déplacer** `index.html`, `sw.js`, `version.json`, `uploads/` :
  chemins codés en dur partout (SW, workflow, Supabase).
- Le SW met en cache agressivement : après un changement de `sw.js`, incrémenter
  `CACHE` (`ramo-v2` → `ramo-v3`) pour purger les anciennes versions.
- Mapping colonnes : Supabase utilise `description` / `menu_price`, le JS interne
  `desc` / `menuPrice` — conversion dans `toDb()` / `fromDb()` (`admin.js`).
- Dans les données par défaut, `Kofte` pointe vers `Americain.png` et vice-versa
  (inversion présente partout, probablement historique — vérifier avant de "corriger").
