# Profil Claude Code - Portfolio Protolab

**Mise à jour** : 2026-01-04 | Version 4.0 (Admin Backend)

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

**Core** : Astro 5.16.6 (SSG) + TypeScript + CSS3 natif + Three.js r128 (CDN)

**Dépendances** : `astro`, `simple-icons`, `@astrojs/node`

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
│       ├── index.astro      # Dashboard (3 tabs)
│       └── api/             # GET/PUT routes
└── package.json
```

### Données Éditables

| Fichier | Contenu | Tab Admin |
|---------|---------|-----------|
| `src/data/sections.json` | Hero, Profile, Contact | Sections |
| `src/data/skills.json` | 8 compétences | Compétences |
| `src/data/projects.json` | 5 projets | Projets |

**Interfaces** : `src/types/content.ts` (HeroContent, SkillData, etc.)

### Workflow
```bash
# Terminal 1: Portfolio
npm run dev  # :4321

# Terminal 2: Admin
cd admin/ && npm run dev  # :4322
```

**Édition** : Modifier sur `:4322` → Sauvegarder → Rafraîchir `:4321`

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
git commit -m "feat: editor improvement"
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

### Projects (YAML)
```yaml
title: "Titre"
stack: ["Tech1", "Tech2"]
status: "Production"
iconColor: "#00ffff"  # Toujours valider via MCP
```

**Schéma Zod** : Voir `content.md`

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

### À ÉVITER
- ❌ Modifier `sections.json`, `skills.json`, `projects.json` manuellement
- ❌ Commit direct sur `master` (passer par `dev-admin`)
- ❌ Ajouter dépendances CSS (Tailwind, SCSS)
- ❌ Scanner code quand `inventory.md` disponible

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

*Profil optimisé | MCP Portfolio Server v3.12*