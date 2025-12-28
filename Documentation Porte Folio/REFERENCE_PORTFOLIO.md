# Référence — Portfolio Protolab

Date de capture : 28 décembre 2025
Répertoire : `portefolio V3`
Branche : `master`
Version : **V4.5**

**But du document** : fournir une référence complète de l'état actuel du site portfolio (structure, technologies, scripts, configuration, contenu et points d'attention) pour permettre une reprise par un LLM local (ex : Ollama, LlamaCPP) ou un service comme Claude Code. Inclus des exemples de prompts prêts à l'emploi et des commandes pour développement et déploiement.

**NOTE** : ce fichier est une capture d'état — conservez-le avec le repo pour faciliter la continuité.

---

## Changelog V4.5 (28 décembre 2025)

### Accessibilité (WCAG 2.1)
- **Skip-to-content link** : Lien d'accès rapide au contenu principal, visible au Tab, style identique au bouton CTA
- **Reduced motion** : Support `prefers-reduced-motion` pour désactiver les animations CSS
- **ARIA labels** : Labels sur navigation principale, menu mobile, logo, boutons
- **Focus visible** : Contour cyan visible lors de la navigation clavier (`:focus-visible`)
- **Aria-expanded** : État dynamique du menu mobile pour lecteurs d'écran
- **Sémantique HTML** : Ajout de `<main id="main-content">`, `role="navigation"`, `role="dialog"`, `role="list"`

### Fichiers modifiés V4.5
- `src/layouts/BaseLayout.astro` : Skip-link, wrapper `<main>` avec id
- `src/styles/global.css` : Styles skip-link, reduced-motion, focus-visible
- `src/components/layout/Navbar.astro` : ARIA labels sur nav, logo, liste
- `src/components/layout/MobileMenu.astro` : role="dialog", aria-hidden, nav wrapper
- `public/scripts/scroll-animations.js` : toggleMenu() avec aria-hidden/aria-expanded
- `Documentation Porte Folio/SEO_IMPLEMENTATION_GUIDE.md` : Nouveau guide SEO complet

---

## Changelog V3.12 (27 décembre 2025)

- **Icônes technologies dans modal doc** : Les tags de technologies affichent maintenant des icônes SVG colorées (couleurs officielles Simple Icons)
- **Séparation technologies/thèmes** : Filtrage automatique des tags - seules les technologies (grafana, docker, proxmox...) sont affichées avec icônes, les thèmes (monitoring, security...) sont ignorés
- **Icônes fixes** : Suppression des effets hover sur les icônes technologies (pas d'interactivité, couleurs statiques)
- **CSS :global() fix** : Correction du scoping CSS Astro pour les éléments injectés dynamiquement via JavaScript
- **TECH_COLORS mapping** : Nouveau mapping des couleurs de marque pour 25+ technologies (grafana #F46800, docker #2496ED, proxmox #E57000, etc.)
- **THEME_TAGS filter** : Liste des tags thématiques à filtrer (monitoring, observability, security, infrastructure, etc.)

### Fichiers modifiés V3.12

- `public/scripts/modal-system.js` : Ajout TECH_COLORS, THEME_TAGS, modification updateModalContent()
- `src/components/ui/DocModal.astro` : CSS avec :global() et suppression hover effects

---

## Changelog V3.11 (27 décembre 2025)

- **Nouvelle catégorie** : `web-front` ajoutée au schema (`src/content/config.ts`) et au mapping (`src/utils/categoryMapping.ts`)
- **API Route docs** : `/api/docs/[slug].json` pour servir le contenu des documentations via JSON
- **Fix modals documentation** : `modal-system.js` utilise maintenant l'API JSON au lieu de fetch `/docs/*.md` (corrige erreurs 404)
- **Script validation** : `npm run update-docs` pour valider les métadonnées des docs (`src/utils/updateDocMetadata.js`)
- **Fix curseur** : z-index du curseur personnalisé augmenté à 99999 (visible dans les modals)
- **Réorganisation documentation** : Tous les fichiers `.md` du projet déplacés vers `Documentation Porte Folio/` avec nomenclature claire

---

## Nomenclature des fichiers de documentation

Tous les fichiers sont dans `Documentation Porte Folio/`. Utiliser ces préfixes :

| Préfixe | Usage | Exemple |
| ------- | ----- | ------- |
| `DEV_` | Documentation développeur (debug, migration, changelog) | `DEV_CHANGELOG_V3.11.md` |
| `INCIDENT_` | Rapports d'incidents avec date YYYYMMDD | `INCIDENT_CSS_20251227.md` |
| `SESSION_` | Résumés de sessions de travail | `SESSION_20251227.md` |
| `TEMPLATE_` | Templates réutilisables | `TEMPLATE_FRONTMATTER.md` |
| `LLM_` | Prompts et guides pour LLM | `LLM_PROMPTS.md` |
| *(sans préfixe)* | Documents de référence principaux | `REFERENCE_PORTFOLIO.md` |

### Fichiers actuels

- `REFERENCE_PORTFOLIO.md` - Référence technique complète du projet
- `DEV_CHANGELOG_V3.11.md` - Changelog de la version 3.11
- `DEV_DEBUG.md` - Guide de débogage
- `DEV_MIGRATION_V3.md` - Documentation de migration vers V3
- `DEV_TROUBLESHOOTING.md` - Résolution de problèmes courants
- `INCIDENT_CSS_20251227.md` - Incident CSS du 27/12/2025
- `SESSION_20251227.md` - Résumé session du 27/12/2025
- `TEMPLATE_FRONTMATTER.md` - Template frontmatter pour les docs
- `LLM_PROMPTS.md` - Prompts pour utilisation avec LLM

---

### Résumé rapide
- Framework : `Astro` (v5.16.x)
- Build : statique (Astro -> `dist`) puis servi par `nginx` dans un conteneur Docker
- Langages : `TypeScript` (pour les collections), `Astro` (components), `Vanilla JS` (scripts dans `public/scripts`), CSS
- Contenu dynamique : `astro:content` Collections (`docs`, `projects`) définies dans `src/content/config.ts`

**Changements récents (capture d'état)**
- `src/components/modals/` : la plupart des modals (preview + detail) ont été extraits depuis `index.astro` pour améliorer la maintenabilité et la lisibilité.
- `src/components/ui/ProjectGallery.astro` : nouveau composant qui lit automatiquement la collection `projects` et rend des `ProjectCard` dynamiquement.
- `src/pages/index.astro` : simplifié pour importer et rendre les composants modaux (ex : `Preview*`, `Modal*`, `Project*`) au lieu d'avoir tout inline. Correction : `ModalWindows` et `ModalLinux` ont été ajoutés dans le DOM (élimine les warnings "Modal not found for card").
- `public/scripts/modal-system.js` : initialisation double (DOMContentLoaded + écoute `portfolioReady`), logique de positionnement, et CTA pour ouvrir la modal de détail depuis la preview.
- `DocModalSystem` : nouveau système JS côté client dans `modal-system.js` pour ouvrir la documentation (load markdown via fetch `/docs/<slug>.md`, conversion basique markdown→HTML, navigation prev/next, hash deeplinking).
- Build/dev : `npm install` a été utilisé pour recréer le lockfile après des blocages EPERM sur des binaires natifs (`esbuild`) — maintenant `npm run build` et `npm run dev` fonctionnent localement.

**1) Informations techniques & dépendances**
- `package.json` :
  - `scripts`: `dev` (`astro dev`), `build` (`astro build`), `preview` (`astro preview`)
  - `dependencies`: `astro` ^5.16.6, `simple-icons` ^16.2.0
- `tsconfig.json` : étend `astro/tsconfigs/strict`
- Docker : multi-stage Dockerfile (Node builder -> Nginx), `docker-compose.yml` fourni (service `portfolio`, labels Traefik inclus)
- Nginx : `nginx.conf` adapté pour SPA (fallback to `index.html`), compression gzip et cache des assets statiques

**2) Structure principale (emplacement des fichiers critiques)**n- Racine :
 Racine :
  - `package.json`, `astro.config.mjs`, `tsconfig.json`, `Dockerfile`, `docker-compose.yml`, `nginx.conf`, `README.md`
- `public/` :
  - `fonts/`, `images/`, `scripts/` : `terminal-boot.js`, `custom-cursor.js`, `three-background.js`, `scroll-animations.js`, `typing-effect.js`, `modal-system.js`, `doc-counter.js`
- `src/` :
  - `components/` : composants Astro (layout, effects, sections, ui)
    - `effects/TerminalBoot.astro`
    - `layout/Navbar.astro`, `layout/MobileMenu.astro`
    - `sections/Hero.astro`, `Skills.astro`, `Projects.astro`, `Documentation.astro`
    - `ui/SkillCard.astro`, `ProjectCard.astro`, `DocModal.astro`
    - `ui/ProjectGallery.astro` (nouveau) — génère la grille des projets depuis la collection `projects`
  - `content/` : `config.ts` (collections), `projects/*.yaml`, `docs/*.md`
  - `layouts/BaseLayout.astro` : gère fonts, canvas Three.js, inclusion des scripts (via `script is:inline src="/scripts/..."`)
  - `pages/index.astro` : page principale (architecture hybride : composants + parties inline), contient la quasi-totalité des modals (préviews et detail) et sections Profile/Contact/Footer
    - Note : après refactor, `index.astro` importe maintenant les modals depuis `src/components/modals/` au lieu d'imbriquer de longs blocs HTML directement dans la page.
  - `styles/global.css` : variables, thèmes neon, styles modals et composants

**3) Collections & Schémas (`src/content/config.ts`)**
- Collection `docs` (type: `content`) schema :
  - `title`, `description`, `category` (énuméré : `active-directory`, `paloalto`, `monitoring`, `proxmox`, `linux`, `windows`, `docker`, `backup`, `network`, `security`, `documentation`, `architecture`, `multimedia`, `llm`), `date` (date), `tags` (array), `author`, `readingTime`, `featured`, `difficulty` (beginner/intermediate/advanced)
- Collection `projects` (type: `data`) schema : `title`, `description`, `stack` (array), `featured`, `status`, `icon`, `iconColor`, `glowColor`, `stats`, `link`, `github`

Conseil : respecter les types `zod` lors de la création de nouveaux fichiers de collection pour éviter les erreurs au build.

**4) Composants & responsabilités**
- `BaseLayout.astro` : meta tags, fonts, import `global.css`, canvas `#three-canvas`, insertion des scripts CDN et inline, inclusion du `DocModal` global
- `TerminalBoot.astro` + `public/scripts/terminal-boot.js` : écran de boot initial, dispatch d'un event `portfolioReady` qui déclenche l'affichage principal
- `index.astro` : charge la plupart des composants, définit icônes et couleurs via `utils/icons.ts`, contient tous les modals de preview (level 1) et détail (level 2), ainsi que plusieurs `project modals` (Protolab, LLM, Observability...)
- `three-background.js` : initialise le canvas Three.js (via CDN r128) pour l'effet de fond
- `modal-system.js` : gère l'ouverture/fermeture des modals, liaison entre preview et detail

Remarques sur la logique des modals
- Le script `modal-system.js` récupère les éléments via `document.querySelectorAll('[data-preview]')` et `document.querySelectorAll('.skill-preview-modal')`.
- Il est sensible à la correspondance exacte entre les `data-preview` / `data-modal` sur les `skill-card` et les `id` des éléments `#preview-*` et `#modal-*`.
- Si une modal référencée n'est pas présente dans le DOM au moment de l'initialisation, le script loggue `Modal not found for card:`. Pour éviter cela, on a :
  - injecté tous les `Preview*` et `Modal*` nécessaires dans `index.astro` (ex. `ModalWindows`, `ModalLinux`) et déclenché `initModals()` à la fois sur `DOMContentLoaded` et sur l'event custom `portfolioReady`.

**5) Assets & scripts (public)**
- `public/scripts/custom-cursor.js` : curseur magnétique personnalisé (interactions hover)
- `public/scripts/three-background.js` : background particules Three.js
- `public/scripts/scroll-animations.js` : IntersectionObserver pour animations et gestion nav
- `public/scripts/terminal-boot.js` : logique boot + CustomEvent `portfolioReady`
- `public/scripts/modal-system.js` : logique modals
- `public/fonts/` : polices Google (Bebas Neue, Space Mono, JetBrains Mono) référencées via CDN

**6) Build & run (local)**
- Développement (dev server Astro) :
```powershell
npm install
npm run dev
```
Astro démarre par défaut sur `localhost:4321` (vérifier la sortie console). Remarques utiles :
- Si vous aviez des erreurs `npm ci` liées à des fichiers natifs verrouillés (EPERM), arrêtez les serveurs/dev processes et exécutez `npm install` pour recréer `package-lock.json`.
- Dev server actuel observé localement sur `http://localhost:4321/`.

- Build statique + preview :
```powershell
npm run build
npm run preview
```
- Docker (build + run) :
```powershell
# Avec Docker seul
docker build -t protolab-portfolio .
docker run -d -p 3000:80 --name protolab-portfolio protolab-portfolio

# Avec Docker Compose
docker-compose up -d
```
Le conteneur Nginx sert la sortie statique sur `:80` (mapped to host 3000 dans `docker-compose.yml`).

**7) Nginx**
- `nginx.conf` :
  - Cache long (`expires 1y`) pour assets statiques (js, css, images, fonts)
  - Gzip activé
  - SPA fallback `try_files $uri $uri/ /index.html` et pages d'erreur pointant sur `index.html`
  - Security headers de base (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`)

**8) Points d'attention / TODO (observés dans le code / README)**
- Modals : Level 2 implementés pour plusieurs domaines mais il y a encore des modal previews (Level 1) et des modals projets à compléter
- Contenu manquant : remplir `src/content/docs/` avec documents complets (le projet contient déjà des documents mais enrichir les catégories)
- Tests / QA : vérifier navigation mobile, performance des animations, surfaces d'accessibilité (le site a des effets heavy JS/CSS)
- LLM infra : mentions d'Ollama / LLM local (GPU passthrough) — infra matérielle requise (GPU NVIDIA + drivers + nvidia-container-toolkit)

Récapitulatif des fichiers modaux (extrait du repo)
- `src/components/modals/PreviewWindows.astro`
- `src/components/modals/PreviewLinux.astro`
- `src/components/modals/PreviewPaloalto.astro`
- `src/components/modals/PreviewProxmox.astro`
- `src/components/modals/PreviewObservability.astro`
- `src/components/modals/PreviewLLM.astro`
- `src/components/modals/PreviewBackup.astro`
- `src/components/modals/PreviewCloud.astro`
- `src/components/modals/ModalWindows.astro`
- `src/components/modals/ModalLinux.astro`
- `src/components/modals/ModalPaloalto.astro`
- `src/components/modals/ModalProxmox.astro`
- `src/components/modals/ModalObservability.astro`
- `src/components/modals/ModalLLM.astro`
- `src/components/modals/ModalBackup.astro`
- `src/components/modals/ModalCloud.astro`
- `src/components/modals/ProjectProtolab.astro`
- `src/components/modals/ProjectLLM.astro`
- `src/components/modals/ProjectObservability.astro`

Ces fichiers sont rendus depuis `src/pages/index.astro` pour s'assurer que `modal-system.js` trouve correctement les éléments.

**9) Recommandations pour développeur qui reprend le projet**
- Installer Node 20+ (le Dockerfile utilise `node:20-alpine`)
- Node: installer via nvm ou gestionnaire de version
- Vérifier les variables locales et hôtes (ex: `portfolio.protolab.local` dans `docker-compose.yml` -> ajouter dans `/etc/hosts` si besoin)
- Si vous utilisez GPU pour LLMs : configurer `nvidia-container-toolkit` sur l'hôte, lever les contraintes Proxmox IOMMU et groupes de GPU

**10) Reprise via LLM - Contexte minimal à fournir à l'agent**
Fournir à l'LLM le contexte suivant (extrait minimum) :
- `package.json` (scripts, dépendances)
- `astro.config.mjs`, `tsconfig.json`
- `src/pages/index.astro` (contient la logique des pages et modals)
- `src/layouts/BaseLayout.astro` (chargement fonts, scripts)
- `src/content/config.ts` (schema des collections)
- `src/styles/global.css` (thème & variables)
- `public/scripts/*` (interaction & boot flow)
- `Dockerfile`, `docker-compose.yml`, `nginx.conf`

Astuce : l'LLM doit d'abord être invité à lire ces fichiers (ou un résumé) avant de proposer un patch. Pour un LLM local (Ollama), on peut fournir un "system prompt" suivi d'un "user prompt" contenants les chemins et la requête.

**11) Prompts prêts à l'emploi**

- Exemple : demander à ajouter un modal de projet (prompt pour Claude Code / GPT) :

System (rôle) :
```
Vous êtes un ingénieur front-end expert en Astro (v5), TypeScript et accessible web. Vous travaillez directement sur le repo fourni. Répondez uniquement avec un patch git/diff au format compatible pour appliquer au repository (fichier(s) et changements). Si vous ne pouvez pas appliquer le patch, expliquez précisément les étapes manuelles.
```

User (tâche) :
```
Contexte : Le projet est un portfolio Astro (fichiers clés : `src/pages/index.astro`, `src/layouts/BaseLayout.astro`, `src/content/config.ts`, `src/styles/global.css`).
Tâche : Ajoute un nouveau modal projet nommé "project-gitlab" (similar style aux autres modals) avec un contenu technique minimal (présentation, stack, liens). Le modal doit être déclenchable depuis `index.astro` en ajoutant un bouton sample dans la section Projets. Retourne uniquement le patch/diff.
```

- Exemple : demander à corriger un bug d'affichage mobile :

System : comme ci-dessus
User :
```
Contexte : sur mobile, la `profile-grid` devrait être en colonne unique mais certains éléments débordent. Modifie `src/styles/global.css` pour assurer un rendu responsive propre (max-widths, gap réduits, adaptivité polices). Fournis patch minimal.
```

- Exemple : tâche de migration/optimisation pour LLM local (Ollama)

System :
```
You are an infra engineer specialized in local LLM deployment (Ollama, NVIDIA passthrough, Docker). Provide step-by-step commands and minimal docker-compose snippet to run Ollama with GPU acceleration, assuming host has nvidia runtime configured. Do not modify repo files, return only a markdown with commands.
```

User :
```
Contexte : Portfolio mentions LLM local. Je veux un snippet pour déployer Ollama dans un container Docker avec accès GPU et un reverse-proxy sécurisé. Donne commands pour Ubuntu 22.04 hôte.
```

**12) Exemple de prompt complet (pour usage direct avec un LLM local)**

System (FR) :
```
Tu es un assistant développeur expert en Astro, TypeScript et Docker. Tu connais les bonnes pratiques de code review et packaging. Le repo contient une app Astro statique buildée puis servie par Nginx. Tous tes retours doivent : 1) proposer un patch git utilisable, 2) inclure tests manuels simples pour vérifier le changement, 3) être concis.
```

User :
```
Lis ces fichiers : `package.json`, `src/pages/index.astro`, `src/layouts/BaseLayout.astro`, `src/styles/global.css`, `src/content/config.ts`, `public/scripts/terminal-boot.js`.
Tâche : Ajoute un nouveau fichier `src/components/ui/ProjectGallery.astro` qui liste automatiquement les projets depuis la collection `projects`. S'il te plaît, fournis uniquement le diff à appliquer (nouveau fichier), et une commande pour tester localement (build + preview).
```

**13) Tests manuels rapides recommandés**
- `npm run dev` → vérifier l'ouverture sur `localhost:4321`, l'animation de boot et l'apparition de la page
- `npm run build && npm run preview` → vérifier que `dist/` contient `index.html` et assets
- `docker build` + `docker run` → vérifier que Nginx sert la page et que `nginx.conf` applique le fallback
- Sur mobile (ou avec devtools), vérifier responsive du `profile-grid` et modals

**14) Gestion de version avec Git et GitHub**

**Configuration du dépôt**
- Remote origin : `https://github.com/AdrienNewman/portfolio-protolab.git`
- Branche principale : `master`
- Workflow recommandé : commits réguliers avec messages descriptifs

**Commandes Git essentielles**

1. Vérifier l'état du dépôt :
```bash
git status
```
Affiche les fichiers modifiés, les nouveaux fichiers, et l'état de synchronisation avec le remote.

2. Ajouter des fichiers au staging :
```bash
# Ajouter tous les fichiers
git add .

# Ajouter un fichier spécifique
git add src/components/sections/Hero.astro
```

3. Créer un commit :
```bash
git commit -m "feat: Add Profile and Contact sections"
```
Convention de messages de commit :
- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `docs:` - Modification de documentation
- `style:` - Changements de style/CSS
- `refactor:` - Refactoring de code
- `chore:` - Tâches de maintenance

4. Pousser vers GitHub :
```bash
# Push vers la branche master
git push origin master

# Premier push d'une nouvelle branche
git push -u origin nom-de-branche
```

5. Récupérer les changements du remote :
```bash
# Voir les changements disponibles
git fetch origin

# Récupérer et fusionner
git pull origin master
```

**Workflow complet (exemple typique)**
```bash
# 1. Vérifier l'état actuel
git status

# 2. Ajouter vos modifications
git add .

# 3. Créer un commit avec un message descriptif
git commit -m "feat: Improve Hero glitch effect alignment"

# 4. Pousser vers GitHub
git push origin master
```

**Résolution des problèmes courants**

**Problème : "Everything up-to-date" mais j'ai des modifications**
- Cause : Aucun commit n'a été créé
- Solution : Créer un commit avant de push
```bash
git add .
git commit -m "Votre message"
git push origin master
```

**Problème : Erreur d'authentification**
- GitHub nécessite un Personal Access Token (PAT) au lieu d'un mot de passe
- Solution : Créer un PAT sur GitHub.com
  1. Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. Generate new token
  3. Cocher `repo` (accès complet aux dépôts)
  4. Utiliser le token comme mot de passe lors du push

**Problème : Conflit de merge**
```bash
# Voir les fichiers en conflit
git status

# Éditer les fichiers pour résoudre les conflits
# Puis ajouter les fichiers résolus
git add fichier-resolu.astro
git commit -m "fix: Resolve merge conflict"
```

**Commandes utiles pour l'historique**
```bash
# Voir l'historique des commits
git log --oneline

# Voir les différences avant commit
git diff

# Voir les différences d'un fichier spécifique
git diff src/components/sections/Hero.astro

# Voir ce qui a changé dans le dernier commit
git show
```

**Branches (pour développement avancé)**
```bash
# Créer une nouvelle branche
git checkout -b feature/nouvelle-section

# Lister toutes les branches
git branch -a

# Changer de branche
git checkout master

# Fusionner une branche
git merge feature/nouvelle-section
```

**Annuler des changements**
```bash
# Annuler les modifications non staged d'un fichier
git restore src/components/sections/Hero.astro

# Annuler tous les changements non committed
git restore .

# Annuler le dernier commit (garder les modifications)
git reset --soft HEAD~1

# Annuler le dernier commit (supprimer les modifications)
git reset --hard HEAD~1
```

**Checklist avant chaque push**
- [ ] `git status` pour vérifier les fichiers modifiés
- [ ] `git diff` pour revoir les changements
- [ ] `git add .` pour stager tous les fichiers
- [ ] `git commit -m "message descriptif"` pour créer le commit
- [ ] `npm run build` pour vérifier que le build fonctionne
- [ ] `git push origin master` pour pousser vers GitHub

**15) Checklist pour reprise rapide**
- [ ] Cloner le repo, `npm install`
- [ ] Lancer `npm run dev` et vérifier `terminal-boot` + `portfolioReady`
- [ ] Lancer `npm run build` puis `docker build` pour vérifier l'image
- [ ] Vérifier `src/content/projects/*.yaml` pour garantir la cohérence des champs
- [ ] Si besoin LLM local : configurer GPU host (drivers, nvidia-container-toolkit)

**Actions terminées lors de cette capture :**
- Extraction/création des composants modals sous `src/components/modals/` et intégration dans `index.astro`.
- Ajout de `ProjectGallery.astro` et intégration.
- Correction de la présence des modals Windows/Linux pour éliminer les warnings `Modal not found for card`.
- Ajout des sections Profile, Contact et Footer
- Correction de l'alignement de l'effet glitch sur le Hero (séparation HTML .line/.glitch)
- Unification de la typographie des titres avec Bebas Neue

**16) Fichiers à ouvrir en priorité pour comprendre le flux**
- `src/pages/index.astro` — logique principale, modals
- `src/layouts/BaseLayout.astro` — fonts, scripts, canvas
- `src/content/config.ts` — schéma des collections
- `public/scripts/terminal-boot.js` — init boot + event
- `src/styles/global.css` — thème & responsive
- `Dockerfile`, `docker-compose.yml`, `nginx.conf` — déploiement

**16) Propositions d'améliorations rapides**
- Externaliser les modals volumineux de `index.astro` vers `src/components/modals/` pour lisibilité
- Ajouter tests E2E basiques (Playwright) pour valider le workflow boot → affichage
- Ajouter linting/formatting (`prettier`, `eslint`) et hooks `husky` pour PRs
- Ajouter CI (GitHub Actions) pour build statique et test preview

---

Si tu veux, je peux :
- 1) générer le fichier `ProjectGallery.astro` et l'intégrer dans `index.astro` (patch),
- 2) extraire les modals volumineux dans un dossier `src/components/modals/` (patch),
- 3) créer un playbook `docs/LLM_PROMPTS.md` avec prompts détaillés pour Claude/GP/LLM local.

Dis-moi quelle option tu veux que j'attaque en priorité et j'appliquerai les changements (avec todo list et patchs).