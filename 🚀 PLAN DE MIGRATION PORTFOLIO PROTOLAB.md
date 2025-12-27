🚀 PLAN DE MIGRATION PORTFOLIO PROTOLAB
Contexte & Objectifs
État actuel : Portfolio HTML monolithique (~6000 lignes) avec section documentation intégrée.
Cible court terme : Portfolio multi-pages Astro auto-hébergé sur Protolab.
Cible moyen terme : Plateforme évolutive avec API (LLM locaux, authentification).

Phase 1 : Migration Astro (Semaine 1-2)
1.1 Structure cible
protolab-portfolio/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.astro
│   │   │   ├── Footer.astro
│   │   │   ├── MobileMenu.astro
│   │   │   └── ScrollProgress.astro
│   │   ├── sections/
│   │   │   ├── Hero.astro
│   │   │   ├── Profile.astro
│   │   │   ├── Skills.astro
│   │   │   ├── Projects.astro
│   │   │   ├── Documentation.astro
│   │   │   └── Contact.astro
│   │   ├── ui/
│   │   │   ├── SkillCard.astro
│   │   │   ├── ProjectCard.astro
│   │   │   ├── DocCategoryCard.astro
│   │   │   ├── TimelineItem.astro
│   │   │   ├── StatCounter.astro
│   │   │   └── Modal.astro
│   │   └── effects/
│   │       ├── TerminalBoot.astro
│   │       ├── ThreeBackground.astro
│   │       └── CustomCursor.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro      # HTML head, scripts globaux
│   │   └── DocLayout.astro       # Layout pour pages documentation
│   ├── pages/
│   │   ├── index.astro           # Page d'accueil (Hero → Contact)
│   │   ├── projets/
│   │   │   ├── index.astro       # Liste des projets
│   │   │   └── [slug].astro      # Page projet individuelle
│   │   └── docs/
│   │       ├── index.astro       # Catalogue documentation
│   │       └── [...slug].astro   # Pages docs générées depuis MD
│   ├── content/
│   │   ├── config.ts             # Définition des collections
│   │   ├── projects/             # Données projets en YAML/JSON
│   │   │   ├── protolab.yaml
│   │   │   ├── llm-local.yaml
│   │   │   └── observability.yaml
│   │   └── docs/                 # Tes 98 fichiers Markdown
│   │       ├── active-directory/
│   │       ├── paloalto/
│   │       ├── monitoring/
│   │       └── ...
│   ├── styles/
│   │   ├── global.css            # Variables CSS, reset
│   │   ├── components.css        # Styles composants
│   │   └── animations.css        # Keyframes, transitions
│   ├── scripts/
│   │   ├── terminal-boot.js
│   │   ├── three-background.js
│   │   ├── scroll-animations.js
│   │   └── counters.js
│   └── data/
│       ├── skills.json
│       ├── navigation.json
│       └── social.json
├── public/
│   ├── fonts/
│   ├── images/
│   └── favicon.svg
├── astro.config.mjs
├── package.json
├── tailwind.config.mjs           # Optionnel si migration Tailwind
└── Dockerfile
1.2 Mapping composants depuis le monolithe
Section HTML actuelleComposant Astro ciblePriorité#terminal-booteffects/TerminalBoot.astroP1nav.navbarlayout/Navbar.astroP1#accueil (Hero)sections/Hero.astroP1#profilsections/Profile.astroP2#competencessections/Skills.astro + ui/SkillCard.astroP1#projetssections/Projects.astro + ui/ProjectCard.astroP1#documentationsections/Documentation.astroP1#contactsections/Contact.astroP2.modal-overlayui/Modal.astroP2.footerlayout/Footer.astroP2
1.3 Extraction CSS
Fichier monolithe     →    Fichiers Astro
─────────────────────────────────────────
:root, variables      →    styles/global.css
.navbar, .nav-*       →    components/layout/Navbar.astro (scoped)
.hero, .hero-*        →    components/sections/Hero.astro (scoped)
.skill-card           →    components/ui/SkillCard.astro (scoped)
@keyframes            →    styles/animations.css
@media queries        →    Chaque composant (scoped) + global.css
1.4 Extraction JavaScript
Fonction actuelleFichier cibleChargementrunBootSequence()scripts/terminal-boot.jsPage loadinitThreeJS()scripts/three-background.jsLazyinitScrollAnimations()scripts/scroll-animations.jsIntersection ObserverinitDocumentation()scripts/counters.jsLazyinitModals()Inline dans Modal.astroOn demand

Phase 2 : Hébergement Protolab (Semaine 2-3)
2.1 Infrastructure cible
┌─────────────────────────────────────────────────────────┐
│                    PROTOLAB                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐     ┌─────────────┐                   │
│  │   Coolify   │────▶│  Portfolio  │ :3000             │
│  │  (PaaS)     │     │   (Astro)   │                   │
│  └─────────────┘     └─────────────┘                   │
│         │                                               │
│         ▼                                               │
│  ┌─────────────┐     ┌─────────────┐                   │
│  │   Traefik   │────▶│ SSL Auto    │                   │
│  │  (Reverse   │     │ Let's       │                   │
│  │   Proxy)    │     │ Encrypt     │                   │
│  └─────────────┘     └─────────────┘                   │
│         │                                               │
│         ▼                                               │
│  ┌─────────────┐                                       │
│  │  PaloAlto   │◀─── portfolio.protolab.local          │
│  │  (Firewall) │◀─── portfolio.tondomaine.fr           │
│  └─────────────┘                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
2.2 Options de déploiement
Option A : Coolify (recommandé)
- VM dédiée ou LXC
- Interface web pour déploiements
- Intégration Git automatique
- SSL Let's Encrypt intégré
- Gestion des variables d'environnement
Option B : Docker Compose + Traefik
- Plus manuel mais plus de contrôle
- Fichiers de config versionnés
- Idéal si tu veux documenter pour le portfolio
2.3 Dockerfile Astro
dockerfile# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

### 2.4 Configuration DNS/Réseau
```
Enregistrements à créer :
─────────────────────────
portfolio.protolab.local  →  IP VM Coolify (interne)
portfolio.tondomaine.fr   →  IP publique (si accès externe)

Règles PaloAlto :
─────────────────
- NAT entrant 443 → Traefik/Coolify
- Policy : Allow HTTPS from Any to DMZ
```

---

## Phase 3 : Évolutions API (Mois 2-3)

### 3.1 Architecture évolutive
```
┌────────────────────────────────────────────────────────────┐
│                      PROTOLAB v2                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────┐  │
│  │   Portfolio  │    │   API Hub    │    │  LLM Local  │  │
│  │   (Astro)    │───▶│   (FastAPI)  │───▶│  (Ollama)   │  │
│  └──────────────┘    └──────────────┘    └─────────────┘  │
│         │                   │                              │
│         │                   ▼                              │
│         │            ┌──────────────┐                      │
│         │            │  PostgreSQL  │                      │
│         │            │    (Data)    │                      │
│         │            └──────────────┘                      │
│         │                   │                              │
│         ▼                   ▼                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                    Traefik                           │ │
│  │  portfolio.domain.fr  →  :3000                       │ │
│  │  api.domain.fr        →  :8000                       │ │
│  │  llm.domain.fr        →  :11434 (optionnel)          │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 3.2 API LLM - Endpoints prévus
```
/api/v1/
├── /chat              # Interaction LLM temps réel
│   ├── POST /         # Envoyer un message
│   └── WS /stream     # Streaming de réponse
├── /models            # Gestion modèles Ollama
│   ├── GET /          # Liste des modèles disponibles
│   └── GET /:name     # Infos sur un modèle
├── /demo              # Démos interactives portfolio
│   ├── POST /summarize    # Résumer un texte
│   ├── POST /translate    # Traduire
│   └── POST /code         # Générer du code
└── /health            # Status API + Ollama
```

### 3.3 Intégration Portfolio ↔ API
```
Page portfolio "LLM Demo" :
───────────────────────────
1. Widget chat intégré (iframe ou composant)
2. Affichage temps réel des modèles chargés
3. Métriques GPU/VRAM en live
4. Latence de réponse affichée

Valeur ajoutée :
───────────────
- Preuve vivante de tes compétences
- Recruteur peut tester en direct
- Différenciation massive vs autres portfolios
```

---

## Phase 4 : Authentification (Mois 3+)

### 4.1 Stack recommandée
```
Authentification : Authentik (self-hosted) ou NextAuth
Base de données  : PostgreSQL
Sessions         : Redis (optionnel)
```

### 4.2 Features avec auth
```
Public (sans login) :
─────────────────────
- Portfolio complet
- Documentation en lecture
- Démo LLM limitée (rate limit)

Privé (avec login) :
────────────────────
- Dashboard personnel
- API LLM illimitée
- Accès documentation privée
- Historique des conversations LLM
```

---

## Checklist de migration

### Pré-requis
```
[ ] Node.js 20+ installé (local ou VM dev)
[ ] Git repository créé (GitHub/GitLab/Gitea)
[ ] VM ou LXC prête pour Coolify
[ ] Domaine configuré (optionnel pour commencer)
```

### Phase 1 - Migration Astro
```
[ ] Initialiser projet Astro
[ ] Extraire et créer BaseLayout.astro
[ ] Migrer composants layout (Navbar, Footer)
[ ] Migrer section Hero
[ ] Migrer section Skills + SkillCard
[ ] Migrer section Projects + ProjectCard
[ ] Migrer section Documentation
[ ] Migrer section Contact
[ ] Migrer effets (Terminal Boot, Three.js, Cursor)
[ ] Migrer modales
[ ] Configurer content collections pour docs MD
[ ] Générer pages documentation depuis Markdown
[ ] Tester build statique
[ ] Optimiser performances (lazy loading, fonts)
```

### Phase 2 - Hébergement
```
[ ] Installer Coolify sur Protolab
[ ] Configurer déploiement Git
[ ] Configurer SSL (Let's Encrypt ou self-signed)
[ ] Configurer règles PaloAlto
[ ] Tester accès interne
[ ] Tester accès externe (si applicable)
[ ] Documenter la procédure (pour le portfolio !)
```

### Phase 3 - API LLM
```
[ ] Créer projet FastAPI
[ ] Endpoint /health
[ ] Endpoint /models (connexion Ollama)
[ ] Endpoint /chat avec streaming
[ ] Rate limiting
[ ] Intégrer widget dans portfolio
[ ] Documenter l'API (Swagger auto)
```

---

## Instructions pour prompt suivant
```
CONTEXTE :
- Fichier joint : portfolio HTML monolithique Astro-ready
- Objectif : Migration vers structure Astro multi-composants
- Priorité : Phase 1 uniquement (migration Astro)

DEMANDE :
Créer la structure de projet Astro complète avec :
1. Configuration projet (astro.config.mjs, package.json)
2. BaseLayout.astro avec head, scripts globaux, variables CSS
3. Extraction des composants dans l'ordre de priorité P1
4. Préserver 100% du design et des animations existants
5. Préparer la structure content/ pour les 98 docs Markdown

CONTRAINTES :
- Vanilla JS uniquement (pas de React/Vue pour l'instant)
- CSS scoped dans chaque composant
- Scripts externes (Three.js, GSAP) via CDN
- Build statique (pas de SSR)

LIVRABLE :
Structure de fichiers complète avec code, prête à npm run dev
