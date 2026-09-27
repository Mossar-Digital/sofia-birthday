# Un cadeau pour Sofia 🤎

Application Next.js 15 (App Router) conçue comme un cadeau d'anniversaire romantique,
pensée d'abord pour le téléphone, et déployable sur Vercel.

Deux routes, strictement séparées :

| Route | Qui | Quoi |
|---|---|---|
| `/` | Sofia | Le cadeau. Écran de verrouillage, jardin de 5 fleurs, lettre scellée, album Polaroid, platine vinyle. **Aucune mention de l'administration.** |
| `/studio` | Vous | Le panneau d'administration. Protégé par `ADMIN_SECRET_KEY`. |

---

## Démarrage rapide

```bash
npm install
cp .env.example .env.local     # puis renseignez ADMIN_SECRET_KEY
npm run dev
```

- Le cadeau : <http://localhost:3000> — mot de passe par défaut `sofia`
- Le studio : <http://localhost:3000/studio> — le code choisi dans `.env.local`

Sans clés Supabase, l'application **fonctionne quand même** : la configuration
est écrite dans `.data/config.json` et les fichiers dans `public/uploads/`.
C'est parfait pour un essai en local, mais pas pour Vercel, dont le système de
fichiers est en lecture seule — voyez la section Supabase.

---

## Ce que vous pouvez changer depuis `/studio`

| Onglet | Contenu |
|---|---|
| **Général** | Prénom, message d'anniversaire, sous-titre, mot de passe de Sofia, indice |
| **Fleurs** | Nom, titre et message des 5 fleurs |
| **Lettre** | Appel, corps (une ligne vide entre les paragraphes), signature |
| **Galerie** | Ajout / suppression / ordre des photos, légende et date |
| **Musique** | `bgm.mp3` + les 3 MP3 du Top 3, avec extraction automatique de la pochette |

`Ctrl` / `⌘` + `S` enregistre. La page d'accueil se met à jour immédiatement.

### Extraction automatique des MP3

Au choix d'un fichier, **jsmediatags** lit les tags ID3 dans le navigateur, avant
tout envoi réseau, et remplit la pochette, le titre et l'artiste. Tout reste
modifiable à la main, et une pochette peut être remplacée par une image de votre
choix si le MP3 n'en contient pas. Une pochette légère est stockée en data URL,
une pochette lourde part dans Supabase Storage.

---

## Supabase (recommandé pour la mise en ligne)

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Ouvrez **SQL Editor** et exécutez [`supabase/schema.sql`](supabase/schema.sql).
   Cela crée la table `site_config`, les buckets `photos` et `audio`, et leurs politiques.
3. Copiez dans `.env.local` (puis dans Vercel) :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # OBLIGATOIRE
```

`SUPABASE_SERVICE_ROLE_KEY` n'est pas optionnelle. La table `site_config`
contient le mot de passe de Sofia en clair, et la clé anon est **publique** :
elle est livrée dans le JavaScript de la page. La table est donc fermée à la
clé anon, et seul le serveur y accède, via `service_role`, depuis des routes
protégées par `ADMIN_SECRET_KEY`.

> Si votre projet a été créé avec une ancienne version du schéma qui autorisait
> la clé anon, exécutez [`supabase/harden.sql`](supabase/harden.sql) après avoir
> renseigné `SUPABASE_SERVICE_ROLE_KEY`.

**Les téléversements passent directement du navigateur vers Storage**, ce qui
contourne la limite de 4,5 Mo des fonctions serverless : vos MP3 peuvent être
aussi lourds que nécessaire.

---

## Déploiement sur Vercel

```bash
npm i -g vercel
vercel
```

Renseignez les variables d'environnement dans **Settings → Environment Variables** :

| Variable | Obligatoire | Rôle |
|---|---|---|
| `ADMIN_SECRET_KEY` | oui | Accès à `/studio` |
| `NEXT_PUBLIC_SUPABASE_URL` | pour la prod | Persistance et fichiers |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | pour la prod | Idem |
| `SUPABASE_SERVICE_ROLE_KEY` | avec Supabase | Seul accès à `site_config` — ne jamais exposer |

> Sans Supabase en production, le studio affichera « Mémoire seule » et les
> modifications ne survivront pas à un redéploiement.

---

## Notes de conception

- **Le mot de passe de Sofia ne quitte jamais le serveur.** La page publique
  reçoit la configuration privée de son champ `password` ; la vérification se
  fait dans `POST /api/unlock`. La comparaison ignore la casse et les espaces.
- **La session du studio** est un jeton `expiration.signature` signé en HMAC-SHA256
  avec `ADMIN_SECRET_KEY`, posé en cookie `httpOnly` valable 12 h.
- **Un seul son à la fois** : `AudioProvider` fait baisser la musique de fond en
  fondu dès qu'un morceau du Top 3 démarre.
- **Les animations se taisent** si le système demande `prefers-reduced-motion`,
  pétales compris.
- Le site est en `noindex` : ce cadeau n'a pas vocation à être trouvé par Google.

## Structure

```
src/
├── app/
│   ├── page.tsx                 # / — le cadeau (rendu serveur)
│   ├── studio/page.tsx          # /studio — l'administration
│   ├── layout.tsx  globals.css  icon.svg
│   └── api/
│       ├── config/              # GET public / POST protégé
│       ├── unlock/              # vérifie le mot de passe de Sofia
│       ├── upload/              # repli local (dev)
│       └── admin/login|logout/
├── components/
│   ├── flowers/                 # les 5 fleurs en SVG
│   ├── public/                  # Hero, Jardin, Lettre, Galerie, Platine, BGM…
│   └── studio/                  # Éditeur, onglets, primitives de formulaire
├── lib/                         # types, défauts, store, auth, supabase, id3, uploads
└── types/                       # déclarations jsmediatags
supabase/schema.sql
```

## Scripts

```bash
npm run dev         # développement
npm run build       # build de production
npm run start       # serveur de production
npm run typecheck   # TypeScript, sans émission
```
