# Vantom — Boutique de sneakers (MVP 1)

Boutique e-commerce mobile-first : catalogue, panier, checkout **sans compte**,
paiement **Mobile Money** (SebPay) avec vérification serveur, et back-office admin.

- **Stack** : Next.js 14 (App Router) · TypeScript · Tailwind · Supabase (Postgres + RLS + Auth) · Vercel
- **Paiement** : SebPay (collection Mobile Money, push USSD) + polling de vérification toutes les 5 s
- **Sécurité** : tous les montants sont **recalculés côté serveur**, le stock est décrémenté par une transaction Postgres idempotente au moment du paiement confirmé.

---

## 1. Prérequis

- Node.js 18.17+ (recommandé 20/22)
- Un projet Supabase (gratuit)
- Un compte Vercel pour le déploiement
- (Prod) des clés API SebPay

## 2. Installation locale

```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs
npm run dev
```

Le site tourne sur http://localhost:3000. En dev, `PAYMENT_PROVIDER=mock`
simule un paiement réussi automatiquement (aucun agrégateur requis).

## 3. Base de données Supabase

Dans le dashboard Supabase → **SQL Editor**, exécutez les migrations **dans l'ordre** :

1. `supabase/migrations/0001_schema.sql` — tables, enums, index
2. `supabase/migrations/0002_stock_function.sql` — `confirm_order_paid()` (transaction stock)
3. `supabase/migrations/0003_rls.sql` — Row Level Security
4. `supabase/migrations/0004_seed.sql` — données de démo (3 produits)

> Le seed utilise des images Unsplash de démonstration. En production,
> uploadez vos visuels dans **Supabase Storage** et remplacez les URLs.

## 4. Créer un administrateur

1. Supabase → **Authentication → Users → Add user** (email + mot de passe).
2. Copiez l'`id` (UUID) de l'utilisateur créé.
3. SQL Editor :

```sql
insert into profiles (id, role, full_name)
values ('UUID_DE_L_UTILISATEUR', 'admin', 'Votre Nom');
```

4. Connectez-vous sur `/admin/login`.

## 5. Variables d'environnement

Voir `.env.example`. Les clés Supabase sont dans **Project Settings → API**.

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé serveur — **secrète**, contourne le RLS |
| `NEXT_PUBLIC_SITE_URL` | URL publique (SEO, sitemap) |
| `PAYMENT_PROVIDER` | `mock` (dev) ou `sebpay` (prod) |
| `SEBPAY_PUBLIC_KEY` / `SEBPAY_SECRET_KEY` | Clés SebPay (prod) |
| `RESEND_API_KEY` | Emails transactionnels (optionnel) |

## 6. Déploiement Vercel

1. Poussez le repo sur GitHub.
2. Vercel → **New Project** → importez le repo.
3. Ajoutez toutes les variables d'environnement (section 5).
4. Déployez. Renseignez `NEXT_PUBLIC_SITE_URL` avec l'URL Vercel finale.
5. Passez `PAYMENT_PROVIDER=sebpay` et renseignez les clés SebPay.

### Polices

Le layout utilise des piles système par défaut (build sans réseau). Pour
activer Archivo / Inter / Space Mono en prod, décommentez le `<link>`
Google Fonts documenté dans `src/app/layout.tsx`, ou installez `next/font/google`.


## Cron de réconciliation des paiements (important)

Le paiement Mobile Money est vérifié en direct par le navigateur (polling).
Si le client ferme l'onglet pendant la validation, un paiement réussi
pourrait ne jamais être constaté. Le cron `/api/cron/reconcile-payments`
reprend côté serveur tous les paiements PENDING récents et les revérifie.

- Configuré dans `vercel.json` (toutes les 5 min).
- Protégé par `CRON_SECRET` (en-tête `Authorization: Bearer <secret>`).
- Sur Vercel : ajoutez `CRON_SECRET` dans les variables d'environnement.
  Vercel Cron envoie automatiquement cet en-tête.

Pour tester manuellement :
```bash
curl -H "Authorization: Bearer VOTRE_CRON_SECRET" \
  https://votre-site.vercel.app/api/cron/reconcile-payments
```

## Relances (paniers abandonnés)

Quand un client remplit l'étape 1 (nom + WhatsApp) mais ne finalise pas le
paiement, la commande reste en `PENDING_PAYMENT` — mais ses coordonnées sont
déjà en base. La page admin **Relances** liste ces commandes avec un bouton
« Relancer sur WhatsApp » (lien `wa.me` pré-rempli).

## Sécurité — rate limiting

Les routes `/api/checkout`, `/api/payments/init` et `/api/payments/verify`
sont protégées par un limiteur en mémoire (par IP). Suffisant pour un MVP
mono-instance ; passez à Upstash Redis si vous scalez horizontalement.

## Importer le vrai catalogue

La migration `0007_seed_real_catalogue.sql` contient les 36 modèles réels
(catégories Sneakers / Boots / Designer, coloris, pointures, prix). Exécutez-la
dans le SQL Editor de Supabase après les migrations 0001→0003. Elle remplace
les données de démo. Les images sont des placeholders à remplacer par vos
visuels dans Supabase Storage.

## 7. Architecture

```
src/
  app/
    (store)/          Boutique publique (accueil, shop, produit, panier, checkout)
    payment/[id]/     Écran de paiement Mobile Money + polling
    order/[id]/       Suivi de commande par lien sécurisé (access_token)
    admin/            Back-office protégé (dashboard, produits, commandes, clients)
    api/              checkout · payments/init · payments/verify
  components/         UI (store + admin)
  lib/
    payment/          SebPay, pays/opérateurs, provider mock
    orders/           création de commande + vérif paiement (serveur)
    supabase/         clients navigateur / serveur / service_role
    cart/             panier client (localStorage)
supabase/migrations/  SQL (schéma, stock, RLS, seed)
```

## 8. Flux de paiement (résumé)

1. Le client valide le checkout → `POST /api/checkout` crée la commande
   (montants **recalculés serveur**) et un paiement `PENDING`.
2. Écran de paiement → `POST /api/payments/init` déclenche le push USSD SebPay.
3. Le navigateur interroge `POST /api/payments/verify` toutes les 5 s.
4. Quand SebPay confirme, le serveur appelle `confirm_order_paid()`
   (décrément stock transactionnel + commande `PAID`), puis passe le
   paiement à `SUCCESS`. La confirmation ne dépend jamais du client.

---

© Vantom — MVP 1.
