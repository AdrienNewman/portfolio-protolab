# Profil Claude Code - Portfolio Protolab

**Mise à jour** : 2026-01-06 | Version 4.17 (Proto_Bot - Chat Widget)

---

## 🎯 Mission

Ingénieur Web Senior dédié au portfolio d'Adrien Mercadier (TSSR). Approche : **pragmatique, éducative, itérative**.

---

## 📚 Sources de Vérité

### Hiérarchie Documentation

1. **CLAUDE.md** (ce fichier) : Profil, conventions, workflows
2. **inventory.md** : État actuel (métriques, listes)
3. **content.md** : Schémas de données (JSON, TypeScript)
4. **components.md** : Catalogue composants Astro

> ⚡ **Règle d'or** : Consulter `inventory.md` avant de scanner le code

---

## 🛠️ Stack Technique

**Core** : Astro 5.16.6 (SSG) + TypeScript + CSS3 natif + Three.js r128 (CDN) + marked.js (CDN)

**Dépendances** : `astro`, `simple-icons`, `@astrojs/node`

**APIs externes** : `protolab.ovh/api/chat/stream` (Proto_Bot SSE)

**Build** : Static (`dist/`) via Nginx (Docker) | Dev : `localhost:4321`

---

## 🔧 Backend d'Administration

### Vue d'Ensemble

**Repo Git indépendant** (`admin/`) pour éditer contenus sans toucher au code.

**URLs** :
- Admin : `localhost:4322` (Astro server)
- Portfolio : `localhost:4321` (Astro static)

### Architecture
```
admin/                       # Repo séparé (privé)
├── src/
│   ├── lib/
│   │   ├── contentLoader.ts # Load ../src/data/*.json
│   │   └── fileSaver.ts     # Save ../src/data/*.json
│   └── pages/
│       ├── index.astro      # Dashboard (5 sections éditables)
│       └── api/             # GET/PUT routes
└── package.json
```

### Données Éditables

| Fichier | Contenu | Tab Admin |
|---------|---------|-----------|
| `src/data/sections.json` | Hero, Profile, Contact | Sections |
| `src/data/skills.json` | 12 compétences (grille 4x3) | Compétences |
| `src/data/projects.json` | 5 projets | Projets |

**Interfaces** : `src/types/content.ts` (HeroContent, SkillData, ProjectData, etc.)

### Workflow Sauvegarde (V4.15) ⭐

**Pattern unifié** appliqué aux 5 sections éditables :
```javascript
// 1. PUT vers API
const saveRes = await fetch('/api/sections', { 
  method: 'PUT', 
  body: formData 
});

// 2. Re-fetch données confirmées serveur (source de vérité unique)
if (saveRes.ok) {
  const freshData = await fetch('/api/sections').then(r => r.json());
  
  // 3. Sync DOM automatique
  // - Tuiles liste (titres, métadonnées)
  // - Éditeurs (titres h2)
  // - Formulaires (tous les champs input/textarea/select)
  // - Stats/Données dynamiques
  updateUIFromFreshData(freshData);
}
```

**Sections implémentées** : Hero, Profile, Contact, Skills, Projects

**Bénéfices** :
- ✅ Cohérence garantie entre serveur et UI
- ✅ Pas de refresh manuel `:4321` nécessaire après sauvegarde
- ✅ Source de vérité unique (serveur)
- ✅ Pattern documenté inline pour maintenabilité

### Workflow Dev
```bash
# Terminal 1: Portfolio
npm run dev  # :4321

# Terminal 2: Admin
cd admin/ && npm run dev  # :4322
```

**Édition** : Modifier sur `:4322` → Sauvegarder → **Sync auto UI** → Visible immédiatement sur `:4321`

### Git (2 Repos)

**Portfolio** : Branche `dev-admin` → merger dans `master`
```bash
git add src/data/sections.json
git commit -m "content: update Hero"
git push origin dev-admin
```

**Admin** : Repo séparé
```bash
cd admin/
git commit -m "feat: unified save pattern"
git push origin main
```

---

## 🎨 Design System

**Palette** : `--cyan: #00ffff`, `--magenta: #ff0080`, `--green: #00ff88`, `--bg-dark: #0a0a0a`

**Typo** : Bebas Neue (titres), Space Mono (UI), JetBrains Mono (code)

**Z-index** : 100+ (modals), 50-99 (contenu), 1-4 (Three.js canvas)

**Responsive** : Desktop >1024px, Tablet 768-1024px, Mobile <768px

---

## 📝 Conventions

### Nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Composants | PascalCase | `ProjectCard.astro` |
| Fichiers content | kebab-case | `protolab.yaml` |
| Variables CSS | --kebab-case | `--neon-cyan` |
| Fonctions | camelCase | `getIcon()` |

### Structure Composant Astro
```astro
---
// 1. Imports
// 2. Interface Props
// 3. Destructuration
// 4. Logique
---
<!-- 5. HTML -->
<!-- 6. Styles scoped -->
```

---

## 📦 Content Collections

### Skills (V4.16) ⭐

**Architecture** : Modal unique dynamique avec injection contenu JS

**Fichiers** :

- `src/data/skills.json` : 12 compétences (données)
- `src/components/sections/Skills.astro` : Grille 4x3 + modal HTML + styles CSS
- `src/components/ui/SkillCard.astro` : Card avec hover glow
- `public/scripts/modal-system.js` : Fonction `openSkillModal()`

**Structure skill** :
```json
{
  "id": "backup",
  "icon": "git",
  "previewTitle": "Backup",
  "previewDescription": "Max 100 caractères.",
  "previewTags": ["Tag1", "Tag2", "Tag3", "Tag4"],
  "modalTitle": "Backup",
  "sections": [
    { "title": "Section1", "items": ["Item1", "Item2", "Item3"] },
    { "title": "Section2", "items": ["Item1", "Item2", "Item3"] }
  ]
}
```

**Règles données** :

- `previewTags` : exactement 4 tags
- `sections` : exactement 2 sections
- `items` : exactement 3 items par section

**Icônes custom** (`src/utils/icons.ts`) :

- `mcp` : Model Context Protocol (blanc)
- `claude` : Claude AI (beige #D4A574, viewBox 16x16)
- `github` : GitHub (blanc #f0f0f0)

**CSS Modal** :

- Overlay : `top: 60px` (sous navbar), centré verticalement
- Content : `max-width: 500px`, `max-height: calc(100vh - 120px)`
- Animation : fade-in 0.4s avec `visibility/opacity`

**Supprimés** : `SkillModal.astro`, `SkillPreview.astro` (obsolètes)

---

### Proto_Bot (V4.17) ⭐

**Widget chatbot flottant** connecté à l'API Ollama locale (Qwen 2.5-coder 14B)

**Fichiers** :

- `src/components/ui/ChatWidget.astro` : Composant complet (HTML + CSS scoped)
- `public/scripts/chat-widget.js` : Logique JS (IIFE, streaming SSE, markdown)

**API Backend** :

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `https://protolab.ovh/api/health` | GET | Health check |
| `https://protolab.ovh/api/chat/stream` | POST | Chat streaming SSE |

**Format requête** :
```json
{ "message": "Question utilisateur" }
```

**Fonctionnalités** :

- Bouton flottant (bottom-right, z-index 15000)
- Streaming SSE avec affichage progressif
- Parsing markdown (marked.js CDN + fallback)
- Style messagerie : bulles gauche/droite
- Responsive (plein écran mobile)
- Fermeture ESC, timeout 30s, retry automatique

**Design** :

- Fond noir simple (pas de grille/glow)
- `text-transform: none` (pas de majuscules)
- Bulles arrondies style messagerie
- Accents : `--neon-cyan`, `--neon-magenta`

---

### Projects (JSON depuis V4.15)

**Source** : `src/data/projects.json` (unifié avec admin)
```json
{
  "title": "Titre",
  "stack": ["Tech1", "Tech2"],
  "status": "Production",
  "featured": true,
  "iconColor": "#00ffff",
  "glowColor": "#ff0080",
  "stats": [
    { "label": "VMs", "value": "15+" }
  ]
}
```

**Migration** : Anciennement `src/content/projects/*.yaml` (Astro Collections) → Migré vers JSON pour cohérence admin

**Interfaces** : Voir `src/types/content.ts`

### Docs (Markdown)
```yaml
---
title: "Titre"
category: "proxmox"  # 15 catégories valides
date: 2025-01-15
difficulty: "intermediate"
---
```

**Catégories** : `proxmox`, `paloalto`, `linux`, `windows`, `docker`, `backup`, `network`, `security`, `monitoring`, `active-directory`, `documentation`, `architecture`, `multimedia`, `llm`, `web-front`

---

## 🔧 Workflow MCP

### Commandes Essentielles
```bash
# État actuel
get_overview

# Validation icône
validate_icon "proxmox"

# Template
get_template type="project" preset="infrastructure"

# Validation données
validate_project { ... }
```

**Référence complète** : Section MCP dans version longue de `CLAUDE.md`

---

## ✅ Règles d'Or

### À FAIRE
- ✅ **Éditer contenu via admin** (`:4322`) plutôt que JSON manuel
- ✅ Consulter `inventory.md` avant scan code
- ✅ Valider icônes MCP avant ajout stack
- ✅ Respecter interfaces `src/types/content.ts`
- ✅ Branche `dev-admin` → merger `master` après validation
- ✅ **Respecter le pattern sauvegarde unifié** (re-fetch + sync DOM)

### À ÉVITER
- ❌ Modifier `sections.json`, `skills.json`, `projects.json` manuellement
- ❌ Commit direct sur `master` (passer par `dev-admin`)
- ❌ Ajouter dépendances CSS (Tailwind, SCSS)
- ❌ Scanner code quand `inventory.md` disponible
- ❌ Sync DOM sans re-fetch serveur (risque divergence)

---

## 🚀 Commandes Projet
```bash
npm run dev              # Dev :4321
npm run build            # Build dist/
npm run preview          # Preview build
git commit -m "feat: X"  # Commits descriptifs
```

---

## 📞 Contact

**Dev** : Adrien Mercadier (TSSR)
**Homelab** : Protolab (Proxmox, PaloAlto, Docker, LLM local)

---

*Profil optimisé | MCP Portfolio Server v3.12 | Admin Backend v1.1 | Proto_Bot v1.0*