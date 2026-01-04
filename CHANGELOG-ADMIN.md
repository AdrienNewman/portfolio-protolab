# Changelog - Interface Admin Portfolio

Documentation des changements effectues pour creer l'interface admin.

---

## Resume du Projet

Creation d'une interface web locale (`admin/`) pour editer tous les contenus textuels du portfolio Protolab sans toucher au code.

---

## Changements Effectues

### Phase 1 : Infrastructure Admin

**Fichiers crees dans `admin/`** :
- `package.json` - Dependencies Astro + Node adapter
- `astro.config.mjs` - Config serveur port 4322
- `tsconfig.json` - TypeScript strict mode
- `.gitignore` - Exclusions node_modules, dist, etc.

**Commandes** :
```bash
cd admin/
npm install
npm run dev  # → localhost:4322
```

### Phase 2 : Migration Donnees vers JSON

**Fichiers crees dans `src/data/`** :
- `sections.json` - Contenu Hero, Profile, Contact
- `skills.json` - 8 competences (migre depuis skills.ts)
- `projects.json` - 5 projets du portfolio

**Fichiers crees dans `src/types/`** :
- `content.ts` - Interfaces TypeScript pour toutes les donnees

### Phase 3 : Migration Composants

**Composants modifies** pour importer JSON au lieu de donnees hardcodees :

| Composant | Import |
|-----------|--------|
| `Hero.astro` | `import sectionsData from '../../data/sections.json'` |
| `Profile.astro` | `import sectionsData from '../../data/sections.json'` |
| `Contact.astro` | `import sectionsData from '../../data/sections.json'` |
| `Skills.astro` | `import skillsData from '../../data/skills.json'` |
| `Projects.astro` | `import projectsData from '../../data/projects.json'` |

### Phase 4 : API Admin

**Fichiers crees dans `admin/src/`** :

```
admin/src/
├── lib/
│   ├── contentLoader.ts    # loadSections(), loadSkills(), loadProjects()
│   └── fileSaver.ts        # saveSections(), saveSkills(), saveProjects()
├── pages/
│   ├── index.astro         # Dashboard avec 3 tabs
│   └── api/
│       ├── sections.ts     # GET/PUT /api/sections
│       ├── skills.ts       # GET/PUT /api/skills
│       └── projects.ts     # GET/PUT /api/projects
└── components/
    └── AdminLayout.astro   # Layout cyberpunk
```

### Phase 5 : Ajout Projects (5 projets)

**`src/data/projects.json`** contient :
1. Infra Protolab (cyan)
2. LLM Local + GPU (magenta)
3. Stack Observabilite (green)
4. Control-Plane IA (purple)
5. Interface Web (blue)

**CSS ajoute dans `ProjectCard.astro`** :
- Classes `.project-icon-purple`, `.project-icon-blue`
- Classes `.project-glow-purple`, `.project-glow-blue`

---

## Branche Git : dev-admin

### Situation Actuelle

La branche `dev-admin` existe **localement** mais n'a **pas ete poussee** sur GitHub.

```bash
# Verifier les branches
git branch -a
# * dev-admin        ← Branche locale actuelle
#   master
#   remotes/origin/master   ← Seule branche sur GitHub
```

### Commits sur dev-admin

```
059a0e7 feat: Phase 4 - migrate skills to JSON + admin editor
5c83ce7 feat: admin backend - migrate sections to JSON data
eb8d818 fix(mobile): V4.14.2 - Modals plein ecran generiques
...
```

### Pour pousser la branche sur GitHub

```bash
# Pousser la branche dev-admin
git push -u origin dev-admin

# Resultat : branche visible sur GitHub
```

### Fichiers non commites

```
Modified:
- .claude/settings.local.json
- CLAUDE.md
- src/components/sections/Projects.astro
- src/components/ui/ProjectCard.astro
- src/types/content.ts

Untracked:
- src/data/projects.json          ← Fichier important !
- .claude/*.md
- .mcp.json
- .vscode/settings.json
- public/prototype-neon-sign*.html
```

### Pour commiter les changements restants

```bash
# Ajouter les fichiers importants
git add src/data/projects.json
git add src/components/sections/Projects.astro
git add src/components/ui/ProjectCard.astro
git add src/types/content.ts

# Commiter
git commit -m "feat: Phase 5 - add projects editor + 5 projects JSON"

# Pousser
git push -u origin dev-admin
```

---

## Probleme Connu : Rechargement Projects

### Symptome
Les modifications de `projects.json` via l'admin ne sont pas visibles sur le portfolio apres rafraichissement.

### Cause
En mode SSG (`output: 'static'`), les imports JSON sont compiles une seule fois. Le cache Vite ne detecte pas les modifications faites par l'admin (instance separee).

### Solution Prevue (non implementee)
Passer en mode `hybrid` avec API route dynamique pour Projects :

1. Modifier `astro.config.mjs` : `output: 'hybrid'`
2. Creer `src/pages/api/data/projects.ts`
3. Modifier `Projects.astro` pour utiliser `fetch()` au lieu d'import
4. Marquer `index.astro` avec `prerender = false`

---

## Utilisation

### Demarrer les deux serveurs

```bash
# Terminal 1 - Portfolio
cd "portefolio V3"
npm run dev  # → localhost:4321

# Terminal 2 - Admin
cd "portefolio V3/admin"
npm run dev  # → localhost:4322
```

### Editer du contenu

1. Ouvrir `http://localhost:4322`
2. Choisir un onglet (Sections, Competences, Projets)
3. Modifier les champs
4. Cliquer "Sauvegarder"
5. Rafraichir `http://localhost:4321` (F5)

---

## Structure Finale

```
portefolio V3/
├── src/
│   ├── components/
│   │   └── sections/
│   │       ├── Hero.astro       # → sections.json
│   │       ├── Profile.astro    # → sections.json
│   │       ├── Contact.astro    # → sections.json
│   │       ├── Skills.astro     # → skills.json
│   │       └── Projects.astro   # → projects.json
│   ├── data/
│   │   ├── sections.json        # Hero, Profile, Contact
│   │   ├── skills.json          # 8 competences
│   │   └── projects.json        # 5 projets
│   └── types/
│       └── content.ts           # Interfaces TypeScript
└── admin/
    ├── src/
    │   ├── lib/
    │   │   ├── contentLoader.ts
    │   │   └── fileSaver.ts
    │   └── pages/
    │       ├── index.astro      # Dashboard
    │       └── api/
    │           ├── sections.ts
    │           ├── skills.ts
    │           └── projects.ts
    └── package.json
```

---

*Documentation generee le 03/01/2026*
