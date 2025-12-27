# Portfolio Protolab - Astro

Portfolio professionnel d'Adrien Mercadier, Technicien Supérieur Systèmes et Réseaux, migré d'un HTML monolithique (~6000 lignes) vers une architecture Astro moderne et modulaire.

## Caractéristiques

- **Design brutal/cyberpunk** avec palette néon (cyan, magenta, green, yellow)
- **Animation de boot terminal** interactive avec skip (ESC/Espace/Entrée)
- **Three.js background** avec particules animées
- **Curseur personnalisé** magnétique
- **Sections complètes**:
  - Hero avec stats sidebar et effets glitch
  - **Profile/Admin** avec terminal bio et soft skills animées
  - Compétences avec cartes interactives et modals
  - Projets avec grille responsive
  - Documentation avec catégories
  - Contact et Footer
- **Modals détaillés** pour les compétences (Windows, Linux, Palo Alto)
- **Architecture hybride** - Composants Astro + sections inline pour stabilité
- **Content Collections** pour projets et documentation
- **Responsive design** optimisé mobile/tablette/desktop
- **Build statique optimisé** pour performance maximale
- **Prêt pour Docker** avec Nginx

## Structure du projet

```text
/
├── public/
│   ├── fonts/                      # Bebas Neue, Space Mono, JetBrains Mono
│   ├── images/                     # Assets du portfolio
│   └── scripts/                    # Scripts JavaScript vanilla
│       ├── terminal-boot.js        # Animation boot + CustomEvent
│       ├── custom-cursor.js        # Curseur personnalisé magnétique
│       ├── three-background.js     # Particules 3D background
│       └── scroll-animations.js    # Intersection Observer + nav
├── src/
│   ├── components/
│   │   ├── effects/
│   │   │   └── TerminalBoot.astro  # Écran de boot terminal
│   │   ├── layout/
│   │   │   ├── Navbar.astro        # Navigation fixe avec scroll effect
│   │   │   └── MobileMenu.astro    # Menu hamburger mobile
│   │   ├── sections/
│   │   │   ├── Hero.astro          # Hero avec glitch + stats sidebar
│   │   │   ├── Skills.astro        # 8 cartes de compétences
│   │   │   ├── Projects.astro      # Grille de projets
│   │   │   └── Documentation.astro # Catégories docs + stats
│   │   └── ui/
│   │       ├── SkillCard.astro     # Carte de compétence avec modal
│   │       └── ProjectCard.astro   # Carte projet
│   ├── content/
│   │   ├── config.ts               # Schema Content Collections
│   │   ├── projects/               # YAML des projets
│   │   │   ├── protolab.yaml
│   │   │   ├── llm-local.yaml
│   │   │   └── observability.yaml
│   │   └── docs/                   # Markdown documentation
│   │       └── .gitkeep
│   ├── layouts/
│   │   └── BaseLayout.astro        # Layout base + scripts CDN
│   ├── pages/
│   │   └── index.astro             # Page principale (architecture hybride)
│   │                               # Composants importés + sections inline
│   │                               # Sections: Profile, Contact, Footer, Modals
│   └── styles/
│       └── global.css              # Variables CSS + reset
├── Documentation Porte Folio/      # Documentation du projet
│   ├── DEV_*.md                    # Docs développeur
│   ├── INCIDENT_*.md               # Rapports d'incidents
│   ├── SESSION_*.md                # Résumés de sessions
│   ├── TEMPLATE_*.md               # Templates réutilisables
│   └── REFERENCE_PORTFOLIO.md      # Référence technique complète
├── Dockerfile                      # Build multi-stage Node + Nginx
├── docker-compose.yml              # Stack avec labels Traefik
├── nginx.conf                      # Config Nginx optimisée
└── package.json
```

## Documentation du projet

Tous les fichiers de documentation sont dans `Documentation Porte Folio/`.

### Nomenclature des fichiers

| Préfixe | Usage | Exemple |
|---------|-------|---------|
| `DEV_` | Documentation développeur (debug, migration, changelog) | `DEV_CHANGELOG_V3.11.md` |
| `INCIDENT_` | Rapports d'incidents avec date YYYYMMDD | `INCIDENT_CSS_20241227.md` |
| `SESSION_` | Résumés de sessions de travail | `SESSION_20241227.md` |
| `TEMPLATE_` | Templates réutilisables | `TEMPLATE_FRONTMATTER.md` |
| `LLM_` | Prompts et guides pour LLM | `LLM_PROMPTS.md` |
| *(sans préfixe)* | Documents de référence principaux | `REFERENCE_PORTFOLIO.md` |

### Fichiers actuels

| Fichier | Description |
|---------|-------------|
| `REFERENCE_PORTFOLIO.md` | Référence technique complète du projet |
| `DEV_CHANGELOG_V3.11.md` | Changelog de la version 3.11 |
| `DEV_DEBUG.md` | Guide de débogage |
| `DEV_MIGRATION_V3.md` | Documentation de migration vers V3 |
| `DEV_TROUBLESHOOTING.md` | Résolution de problèmes courants |
| `INCIDENT_CSS_20241227.md` | Incident CSS du 27/12/2024 |
| `SESSION_20241227.md` | Résumé session du 27/12/2024 |
| `TEMPLATE_FRONTMATTER.md` | Template frontmatter pour les docs |
| `LLM_PROMPTS.md` | Prompts pour utilisation avec LLM |

## Commandes

| Commande              | Action                                         |
| :-------------------- | :--------------------------------------------- |
| `npm install`         | Installer les dépendances                      |
| `npm run dev`         | Démarrer le serveur dev sur `localhost:4321`   |
| `npm run build`       | Construire le site pour la production          |
| `npm run preview`     | Prévisualiser le build en local                |
| `npm run update-docs` | Valider les métadonnées des documentations     |

## Déploiement Docker

### Option 1: Docker Compose (recommandé)

```bash
docker-compose up -d
```

Le portfolio sera accessible sur `http://localhost:3000`

### Option 2: Docker seul

```bash
# Build
docker build -t protolab-portfolio .

# Run
docker run -d -p 3000:80 --name portfolio protolab-portfolio
```

## Déploiement sur Protolab

### Avec Coolify

1. Créer une nouvelle application dans Coolify
2. Connecter le repository Git
3. Sélectionner Dockerfile comme méthode de build
4. Configurer le domaine: `portfolio.protolab.local`
5. Déployer

### Avec Traefik

Le fichier `docker-compose.yml` inclut déjà les labels Traefik. Assurez-vous que:

1. Traefik est configuré sur votre réseau Docker
2. Le nom de domaine `portfolio.protolab.local` est résolu (DNS local ou `/etc/hosts`)
3. Les règles PaloAlto autorisent le trafic vers le serveur

## Ajouter de la documentation

1. Créez vos fichiers Markdown dans `src/content/docs/`
2. Organisez-les par catégorie (active-directory, paloalto, monitoring, etc.)
3. Ajoutez le frontmatter requis:

```markdown
---
title: "Titre de la doc"
description: "Description"
category: "active-directory"
date: 2025-01-15
tags: ["AD", "Windows"]
---

Contenu ici...
```

4. Rebuild le projet: `npm run build`

## Technologies utilisées

- **Astro 5.x** - Framework web statique avec composants
- **Three.js r128** - Animations 3D du background (via CDN)
- **Vanilla JavaScript** - Scripts interactifs (pas de framework JS)
- **CSS Variables** - Thème neon/cyberpunk avec palette complète
- **Intersection Observer API** - Animations au scroll
- **CustomEvent API** - Communication entre scripts (portfolioReady)
- **Content Collections** - Gestion typée des projets et docs
- **Nginx Alpine** - Serveur web en production
- **Docker Multi-stage** - Build optimisé (Node + Nginx)

## Architecture technique

### Flux d'initialisation

1. **BaseLayout.astro** charge les fonts et scripts globaux
2. **TerminalBoot.astro** affiche l'animation de boot (3.5s)
3. **terminal-boot.js** dispatch l'event `portfolioReady`
4. **index.astro** écoute l'event et affiche le portfolio avec fade-in
5. **scroll-animations.js** initialise les observers et la navigation
6. **three-background.js** et **custom-cursor.js** ajoutent les effets

### Sections du portfolio

| Section       | Type      | Fichier                | Description                              |
|---------------|-----------|------------------------|------------------------------------------|
| Hero          | Composant | Hero.astro             | Hero avec glitch, stats sidebar          |
| Profile       | Inline    | index.astro (ligne 29) | Terminal bio + soft skills animées       |
| Skills        | Composant | Skills.astro           | 8 cartes de compétences                  |
| Projects      | Composant | Projects.astro         | Grille projets depuis Content Collection |
| Documentation | Composant | Documentation.astro    | Catégories docs + stats                  |
| Contact       | Inline    | index.astro (ligne 132)| Formulaire de contact                    |
| Footer        | Inline    | index.astro (ligne 160)| Footer avec copyright                    |

### Modals système

**Actuellement implémentés** (Level 2 - Detail modals):
- `modal-windows` - Windows Server & Active Directory
- `modal-linux` - Linux & Scripting Bash
- `modal-paloalto` - Palo Alto Firewall NextGen

**À implémenter**:
- Preview modals (Level 1 - hover)
- 5 modals restants (Proxmox, Observability, LLM, Backup, Cloud)
- Modals pour les projets

## Changelog

### V3.11 (27 décembre 2024)
- **Nouvelle catégorie** : `web-front` pour la documentation frontend
- **API Route docs** : `/api/docs/[slug].json` pour servir le contenu des docs
- **Fix modals documentation** : Correction des erreurs 404, utilisation de l'API JSON
- **Script validation** : `npm run update-docs` pour valider les métadonnées
- **Fix curseur** : Le curseur personnalisé reste visible dans les modals (z-index)

## État actuel de la migration

### ✅ Phase 1 - Complétée

- [x] Structure Astro créée
- [x] Terminal boot fonctionnel avec skip
- [x] Hero section avec effets glitch
- [x] **Profile/Admin section avec terminal bio et soft skills**
- [x] Skills section avec 8 cartes
- [x] Projects section avec Content Collections
- [x] Documentation section avec catégories
- [x] Contact et Footer
- [x] Navigation avec scroll effects
- [x] Mobile menu hamburger
- [x] Modals basiques (Level 2) pour 3 compétences
- [x] Three.js background + Custom cursor
- [x] Responsive design complet
- [x] Build Docker + Nginx

### 🚧 À finaliser

- [ ] Système de modals complet (Level 1 + Level 2)
- [ ] 5 modals de compétences restants
- [ ] Modals pour les projets
- [ ] Contenu détaillé dans tous les modals
- [ ] Tests navigation mobile
- [ ] Optimisation des animations

### 📋 Prochaines phases

- [ ] **Phase 2**: Déploiement Protolab avec Coolify
- [ ] **Phase 3**: API FastAPI + intégration LLM local (Ollama)
- [ ] **Phase 4**: Authentification avec Authentik

## Auteur

**Adrien Mercadier** - TSSR
Portfolio hébergé sur infrastructure Protolab

## Licence

Projet personnel - Tous droits réservés
