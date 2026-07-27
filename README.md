# AutoForge 🔧

**Centralisez en temps réel la disponibilité, les prix et la localisation des pièces détachées automobiles à Dakar.**

AutoForge est une vitrine web moderne conçue pour connecter mécaniciens, revendeurs et clients autour d'un catalogue de pièces auto vérifiées, avec un assistant IA intégré pour répondre aux questions sur les stocks et les prix.

---

## Table des matières

1. [Fonctionnalités](#fonctionnalités)
2. [Démo](#démo)
3. [Stack technique](#stack-technique)
4. [Structure du projet](#structure-du-projet)
5. [Design system](#design-system)
6. [Prérequis](#prérequis)
7. [Installation](#installation)
8. [Scripts disponibles](#scripts-disponibles)
9. [Configuration](#configuration)
10. [Déploiement](#déploiement)
11. [Équipe et contact](#équipe-et-contact)

---

## Fonctionnalités

- **Page d'accueil** — Hero avec bannière, statistiques clés (120+ fournisseurs, 3 500+ références, jusqu'à 40 % d'économies) et présentation du fonctionnement en 3 étapes.
- **Catalogue de pièces** — Recherche en temps réel par nom, filtrage par marque (Toyota, Peugeot, Hyundai, Nissan, Mitsubishi, Universal), cartes produits avec prix en FCFA, zone du fournisseur et pastille de disponibilité.
- **Expert IA** — Consultation d'un agent IA intégré au catalogue pour répondre aux questions sur les prix, la disponibilité et les fournisseurs à Dakar.
- **Saisie partenaire** — Espace sécurisé pour vendeurs et mécaniciens afin de remonter la disponibilité et les prix observés via un workflow Dify.
- **Page de contact** — Formulaire complet, section de confiance (pièces vérifiées, livraison rapide, support WhatsApp) et coordonnées de la zone industrielle de Diamniadio.
- **Navigation responsive** — Header fixe, menu adapté mobile, footer avec lien WhatsApp cliquable.

---

## Production

- **Production** : https://glowing-parfait-904f26.netlify.app/

---

## Stack technique

| Couche | Technologie |
| --- | --- |
| Framework | [TanStack Start](https://tanstack.com/start) (React 19 + SSR/SSG) |
| Langage | TypeScript 5 |
| Moteur de build | Vite 8 |
| Styling | Tailwind CSS v4 + tokens CSS personnalisés |
| Requêtes / État | TanStack Query |
| Routing | TanStack Router (file-based) |
| Icônes | Lucide React + emojis natifs |
| Validation | Zod |
| IA | [Dify](https://dify.ai) via `createServerFn` |

---

## Structure du projet

```text
.
├── src/
│   ├── lib/
│   │   └── dify.functions.ts       # Server function pour appeler Dify
│   ├── routes/
│   │   ├── __root.tsx              # Layout global (header, footer, polices, SEO)
│   │   ├── index.tsx               # Page d'accueil
│   │   ├── catalogue.tsx           # Catalogue + Expert IA
│   │   ├── contact.tsx             # Formulaire de contact
│   │   └── saisie.tsx              # Espace saisie partenaire
│   ├── router.tsx                  # Configuration du router
│   ├── start.ts                    # Middlewares TanStack Start
│   └── styles.css                  # Tokens de design Tailwind v4
├── .lovable/
│   └── plan.md                     # Plan de construction initial
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## Design system

Les couleurs sont déclarées comme tokens sémantiques dans `src/styles.css` et exposées via `@theme inline` pour Tailwind v4.

| Token | Valeur | Usage |
| --- | --- | --- |
| `--brand` | `#1565C0` | Bleu principal, boutons, liens, prix |
| `--brand-foreground` | `#FFFFFF` | Texte sur fond bleu |
| `--brand-soft` | dérivé de `--brand` | Fonds subtils |
| `--accent-orange` | `#F59E0B` | Accent orange, CTA secondaire |
| `--success` | `#16A34A` | Disponible, messages de succès |
| `--danger` | `#DC2626` | Indisponible, erreurs |
| `--font-sans` | `Inter` | Typographie principale |

**Police :** [Inter](https://fonts.google.com/specimen/Inter) chargée via un `<link>` Google Fonts dans le `head()` du layout racine.

---

## Prérequis

- [Node.js](https://nodejs.org/) 18+ ou [Bun](https://bun.sh/) 1+
- Un compte [Lovable](https://lovable.dev) ou un environnement capable d'exécuter TanStack Start
- Une clé API [Dify](https://dify.ai) (optionnelle pour l'expert IA et la saisie partenaire)

---

## Installation

1. **Cloner le dépôt**

```bash
git clone https://github.com/Amady01/Dudu-s-Project.git
cd Dudu-s-Project
```

2. **Installer les dépendances**

Avec Bun (recommandé pour ce projet) :

```bash
bun install
```

Ou avec npm :

```bash
npm install
```

3. **Configurer les variables d'environnement**

Créez un fichier `.env` à la racine du projet :

```bash
DIFY_API_KEY=your_dify_api_key_here
```

> **Note :** La clé Dify est utilisée par la server function `runDifyWorkflow` dans `src/lib/dify.functions.ts` pour la page **Saisie**. L'expert IA intégré au catalogue utilise actuellement un appel direct côté client.

4. **Lancer le serveur de développement**

```bash
bun run dev
```

L'application est disponible sur `http://localhost:8080`.

---

## Scripts disponibles

| Script | Description |
| --- | --- |
| `bun run dev` | Lancer le serveur de développement (`vite dev`) |
| `bun run build` | Build de production (`vite build`) |
| `bun run build:dev` | Build en mode développement |
| `bun run preview` | Prévisualiser le build de production |
| `bun run lint` | Lancer ESLint |
| `bun run format` | Formater le code avec Prettier |

---

## Configuration

### Clé API Dify

La fonctionnalité **Saisie Disponibilité Pièces** requiert une clé API Dify. Cette clé ne doit jamais être commitée dans le code source. Elle est lue côté serveur via `process.env.DIFY_API_KEY` dans `src/lib/dify.functions.ts`.

Pour ajouter ou modifier la clé dans un projet Lovable :

1. Ouvrez les paramètres du projet dans l'éditeur Lovable.
2. Allez dans l'onglet **Secrets / Environment variables**.
3. Ajoutez une variable nommée `DIFY_API_KEY` avec votre clé.

En local, utilisez le fichier `.env` à la racine du projet.

---

## Déploiement

Ce projet est prêt à être déployé sur Lovable et synchronisé avec GitHub.

### Option A : Déploiement via Lovable

1. Connectez votre projet à GitHub depuis l'éditeur Lovable.
2. Chaque modification sera automatiquement commitée et déployée.

### Option B : Déploiement manuel

```bash
bun run build
```

Le build génère les assets statiques et l'entrée SSR dans le répertoire de sortie configuré par Vite. Déployez ensuite sur la plateforme de votre choix compatible avec TanStack Start (Cloudflare Workers, Vercel, Netlify, etc.).

---

## Équipe et contact

- **Projet** : AutoForge
- **Siège** : Route de Diamniadio, Zone Industrielle, Dakar, Sénégal
- **Email** : contact@autoforge.sn
- **Téléphone** : +221 33 800 00 00
- **WhatsApp** : [+221 77 800 00 00](https://wa.me/221778000000)

---

## Notes importantes

- Ce projet est un **MVP** (Minimum Viable Product) : le catalogue est statique et les données de l'agent IA sont synchronisées avec la base de connaissance métier.
- Le routage est géré automatiquement par TanStack Router en fonction des fichiers présents dans `src/routes/`. Ne modifiez pas `src/routeTree.gen.ts` manuellement.
- Les pages sont optimisées pour le SEO avec des balises `title`, `description`, Open Graph et Twitter Card dédiées par route.

---

© 2026 AutoForge SARL — RC Dakar. Tous droits réservés.
