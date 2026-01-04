# Inventaire Portfolio Protolab

> 2026-01-04 | Astro 5.16.6 | Admin Backend v1.1

---

## 📊 Métriques Globales

| Type | Nombre |
|------|--------|
| Composants Astro | 19 |
| Données JSON | 3 fichiers (sections, skills, projects) |
| Projets YAML | 5 |
| Docs MD | 12 |
| Scripts JS | 26 (8 core + 18 game) |
| API Routes | 5 (2 portfolio + 3 admin) |
| Catégories docs | 15 |

---

## 🗂️ Structure Simplifiée
```
src/
├── components/
│   ├── layout/      # 3: Navbar, Footer, MobileMenu
│   ├── sections/    # 7: Hero, Skills, Projects, Profile, Contact, Docs, LiveLab
│   ├── ui/          # 7: Cards (3), Modals (4)
│   └── game/        # 1: GameOverlay
├── content/
│   ├── projects/    # 5 YAML
│   └── docs/        # 12 MD
├── data/
│   ├── sections.json      # 🆕 Hero, Profile, Contact
│   ├── skills.json        # 🆕 8 compétences
│   └── projects.json      # 🆕 5 projets
├── types/
│   └── content.ts         # 🆕 Interfaces TS
└── pages/
    ├── index.astro
    └── api/               # 2 routes
```

---

## 🔧 Backend Admin (Repo Indépendant)

**Version** : v1.1 (Pattern sauvegarde unifié)
```
admin/                     # Port 4322
├── src/
│   ├── components/
│   │   └── AdminLayout.astro
│   ├── lib/
│   │   ├── contentLoader.ts  # Load JSON
│   │   └── fileSaver.ts      # Save JSON
│   └── pages/
│       ├── index.astro       # Dashboard (5 sections éditables)
│       └── api/
│           ├── sections.ts   # GET/PUT
│           ├── skills.ts     # GET/PUT
│           └── projects.ts   # GET/PUT
└── package.json
```

### Workflow Sauvegarde (V4.15) ⭐

**Édition** : `:4322` → Modifier → **Sauvegarder** → **Sync auto** → Visible sur `:4321`

**Pattern unifié** (appliqué aux 5 sections) :
1. **PUT** vers API endpoint (`/api/sections`, `/api/skills`, `/api/projects`)
2. **Re-fetch** données confirmées serveur (source de vérité unique)
3. **Sync DOM** automatique :
   - Tuiles liste (titres, métadonnées)
   - Éditeurs (titres h2)
   - Formulaires (tous les champs)
   - Stats/Données dynamiques

**Sections implémentées** : Hero, Profile, Contact, Skills, Projects

**Bénéfice** : Pas besoin de refresh manuel `:4321` après sauvegarde

### Git (2 Repos)

**Portfolio** : Branche `dev-admin` → merger dans `master`
```bash
git add src/data/sections.json
git commit -m "content: update Hero"
git push origin dev-admin
```

**Admin** : Repo séparé (privé)
```bash
cd admin/
git commit -m "feat: unified save pattern"
git push origin main
```

---

## 📦 Contenus

### Composants (19)

**Détails** : Voir `components.md`

**Migrés Admin** : Hero, Profile, Contact, Skills, Projects (importent JSON)

### Projects (5)

| Slug | Titre | Stack | Source |
|------|-------|-------|--------|
| `protolab` | Infrastructure Protolab | Proxmox, PaloAlto, Windows | `projects.json` |
| `llm-local` | LLM Local + GPU | Ollama, RTX 3060 | `projects.json` |
| `observability` | Stack Observabilité | OTel, VictoriaLogs, Grafana | `projects.json` |
| `control-plane` | Control-Plane IA | MCP Server, Python | `projects.json` |
| `web-interface` | Interface Web | Astro, Three.js | `projects.json` |

**Note V4.15** : Migration de `src/content/projects/*.yaml` vers `src/data/projects.json` pour unification avec admin

### Docs (12)

**Par catégorie** : paloalto (3), documentation (4), monitoring (1), architecture (1), security (1), web-front (2)

### Skills (8)

windows, linux, proxmox, paloalto, observability, llm, backup, cloud

---

## 🎨 Variables CSS
```css
--cyan: #00ffff;
--magenta: #ff0080;
--green: #00ff88;
--bg-dark: #0a0a0a;
```

**Typo** : Bebas Neue, Space Mono, JetBrains Mono

---

## 🚀 Stack

**Dependencies** : `astro@5.16.6`, `simple-icons@16.2.0`, `@astrojs/node@9.5.1`

**CDN** : Three.js r128, Google Fonts

**Build** : Static (dist/) via Nginx (Docker)

---

## 📖 Références Détaillées

- `components.md` : Catalogue composants + props
- `content.md` : Schémas Zod + interfaces TS
- `changelog.md` : Historique versions (V4.15 latest)
- `scripts.md` : Documentation scripts JS

---

*Inventaire optimisé | 2026-01-04 | V4.15*