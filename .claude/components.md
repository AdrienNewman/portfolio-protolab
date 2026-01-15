# Catalogue Composants Astro

> 2026-01-08 | 20 composants | V4.18 | Admin v1.1

---

## Layouts (1)

### BaseLayout.astro

**Props** : `title?`, `description?`

**Rôle** : Structure HTML, fonts, Three.js canvas, curseur, DocModal, GameOverlay, ChatWidget

---

## Layout Components (3)

| Composant | Rôle |
|-----------|------|
| **Navbar** | Barre nav fixe, logo, liens, CTA, hamburger |
| **Footer** | Copyright, TSSR, Protolab |
| **MobileMenu** | Menu plein écran, animations slide-in |

---

## Sections (7)

### Hero.astro

**Migré Admin** : Utilise `sections.json`

```astro
import sectionsData from '../../data/sections.json';
import type { HeroContent } from '../../types/content';
const hero = sectionsData.hero as HeroContent;
```

**Rôle** : Section accueil, glitch effect, typing, stats, CTA

**Éditable** : Admin → Tab "Sections" → Hero

---

### Profile.astro

**Migré Admin** : Utilise `sections.json`

**Rôle** : Terminal, soft skills, certifications

**Éditable** : Admin → Tab "Sections" → Profile

---

### Contact.astro

**Migré Admin** : Utilise `sections.json`

**Rôle** : Liens Email, LinkedIn, GitHub, Portfolio

**Éditable** : Admin → Tab "Sections" → Contact

---

### Skills.astro

**Migré Admin** : Utilise `skills.json`

```astro
import skillsData from '../../data/skills.json';
import type { SkillData } from '../../types/content';
```

**Rôle** : Grille 8 compétences, modales preview/detail

**Éditable** : Admin → Tab "Compétences"

---

### Autres Sections

| Composant | Rôle |
|-----------|------|
| **Projects** | Galerie projets, modales |
| **Documentation** | Stats docs, grid catégories, timeline |
| **LiveLab** | Dashboard temps réel Protolab |

---

## UI - Cards (3)

| Composant | Props Clés |
|-----------|------------|
| **SkillCard** | `number`, `title`, `iconName`, `modal` |
| **ProjectCard** | `title`, `stack[]`, `status`, `stats[]` |
| **ProjectGallery** | Fetch `projects.json` |

---

## UI - Modals (4)

| Composant | Rôle |
|-----------|------|
| **SkillPreview** | Aperçu compétence (niveau 1) |
| **SkillModal** | Détail compétence (niveau 2) |
| **ProjectModal** | Détail projet (sections multitypes) |
| **DocModal** | Documentation full-screen, TOC dynamique |

---

## UI - Chat (1)

### ChatWidget.astro

**Rôle** : Widget chatbot flottant Proto_Bot

**Fichiers** :
- `src/components/ui/ChatWidget.astro` : HTML + CSS scoped
- `public/scripts/chat-widget.js` : Logique JS

**API** : `https://protolab.ovh/api/chat/stream` (SSE)

**Fonctionnalités** :
- Bouton flottant (bottom-right, z-index 15000)
- Streaming SSE
- Parsing markdown (marked.js CDN)
- Responsive (plein écran mobile)

---

## Game (2)

### GameOverlay.astro

**Status** : PRODUCTION - NE PAS MODIFIER

**Rôle** : Easter egg NetDefender intégré au site

**Trigger** : 5 clics sur floating packet

**Scripts** : `public/scripts/game/`

---

### GameOverlayPrototype.astro

**Status** : DÉVELOPPEMENT ACTIF

**Rôle** : Version prototype du jeu

**Entry** : `public/prototype-game.html`

**Scripts** : `public/scripts/game-prototype/`

**Architecture** : Modulaire (46 fichiers)

**Documentation** : `.claude/GAME_PROTOTYPE.md`

---

## Composants Migrés Admin (V4.15)

### ProjectGallery.astro

**Source de données** : Utilise `projects.json` (unifié avec admin)

**Rôle** : Galerie projets homepage, génération ProjectCard

**Migration V4.15** :
- **Avant** : `getCollection('projects')` (YAML Astro Collections)
- **Après** : Import direct `projects.json`
- **Raison** : Cohérence avec backend admin

**Éditable** : Admin `:4322` → Tab "Projets"

**Structure données** :

```typescript
interface Project {
  title: string;
  description: string;
  stack: string[];
  status: string;
  featured: boolean;
  iconColor: string;
  glowColor: string;
  stats: Array<{ label: string; value: string }>;
}
```

---

## Hiérarchie

```
BaseLayout
├── DocModal (global)
├── GameOverlay (production)
├── GameOverlayPrototype (prototype)
├── ChatWidget (global)
└── index.astro
    ├── Navbar → MobileMenu
    ├── Hero (sections.json)
    ├── Skills (skills.json) → SkillCard (x8) + SkillPreview + SkillModal
    ├── Projects → ProjectGallery (projects.json) → ProjectCard (x5) + ProjectModal
    ├── Profile (sections.json)
    ├── Documentation
    ├── LiveLab
    ├── Contact (sections.json)
    └── Footer
```

---

## Résumé

| Catégorie | Nombre |
|-----------|--------|
| Layouts | 1 |
| Layout Components | 3 |
| Sections | 7 |
| UI Cards | 3 |
| UI Modals | 4 |
| UI Chat | 1 |
| Game | 2 |
| **Total** | **20** |

---

*Catalogue V4.18 | 2026-01-08*
