# Profil Claude Code - Portfolio Protolab

**Version** : 4.28 | **Mise à jour** : 2026-01-15

---

## 🎯 Mission

Ingénieur Web Senior et Ingénieur Jeux Vidéo senior dédié au portfolio d'Adrien Mercadier (TSSR). Approche : **pragmatique, éducative, itérative**.

---

## 📚 Sources de Vérité

### Hiérarchie Documentation

1. **CLAUDE.md** (ce fichier) : Profil, conventions, workflows
2. **.claude/GAME_PROTOTYPE.md** ⭐ : Architecture jeu modulaire
3. **.claude/inventory.md** : État actuel (métriques, listes)
4. **.claude/content.md** : Schémas de données (JSON, TypeScript)
5. **.claude/components.md** : Catalogue composants Astro
6. **.claude/scripts.md** : Documentation scripts JS

> ⚡ **Règle d'or** : Consulter `inventory.md` avant de scanner le code

---

## 🛠️ Stack Technique

**Core** : Astro 5.16.6 (SSG) + TypeScript + CSS3 natif + Canvas HTML5 (jeu)

**CDN** : Three.js r128 + marked.js

**Dépendances** : `astro`, `simple-icons`, `@astrojs/node`

**APIs externes** : `protolab.ovh/api/chat/stream` (Proto_Bot SSE)

**Build** : Static (`dist/`) via Nginx (Docker) | Dev : `localhost:4321`

---

## 🎮 NETDEFENDER - État du Projet

### ⚠️ RÈGLE ABSOLUE

**Travailler UNIQUEMENT sur le PROTOTYPE** (`public/scripts/game-prototype/`) jusqu'à validation explicite de déploiement.

### Distinction PROTOTYPE vs PRODUCTION

| Aspect | PROTOTYPE (actif) | PRODUCTION (gelé) |
|--------|-------------------|-------------------|
| **Dossier** | `public/scripts/game-prototype/` | `public/scripts/game/` |
| **Entry HTML** | `public/prototype-game.html` | Intégré au site |
| **Composant** | `GameOverlayPrototype.astro` | `GameOverlay.astro` |
| **Architecture** | Modulaire (~130 fichiers, ~20 000 lignes) | Monolithique (1 fichier) |
| **Status** | En développement | Stable, NE PAS TOUCHER |

### Architecture Prototype (V4.28 - Modular Enemies & Projectiles)

```
public/scripts/game-prototype/
├── NetDefender.js              # Orchestrateur (~920 lignes)
├── config/gameConfig.js        # Configuration centralisée (~280 lignes)
├── data/ScenarioData.js        # Données narratives
├── entities/                   # Player, Enemy, Bullet, PowerUp, BossProjectile
├── systems/
│   ├── InputHandler.js         # Clavier, souris, tactile
│   ├── ParticleSystem.js       # Explosions, sparks, effets
│   ├── AudioManager.js         # Sons SFX (Web Audio API)
│   ├── WaveManager.js          # Orchestration vagues, spawning
│   └── PlayerStateManager.js   # ⭐ Gestion pouvoirs roguelike
├── effects/                    # ScreenShake, GridBackground
├── ui/                         # ⭐ HUD OSI STACK V1.5 (6 fichiers, ~1340 lignes)
│   ├── index.js                # Exports centralisés
│   ├── OSIStackConfig.js       # Couleurs, HP, positions, timings
│   ├── OSIStackState.js        # Gestion HP symétrique (header/trailer)
│   ├── OSIStackRenderer.js     # Rendu Canvas (gradients)
│   ├── OSIStackAnimations.js   # Flash, destruction, unlock, flicker
│   └── OSIStackHUD.js          # Coordinateur principal
├── screens/
│   ├── TransitionScreen.js     # Écran transition entre couches (~370 lignes)
│   ├── BossIntro.js            # Cinématique boss + transformation (~1084 lignes)
│   ├── SageScreen.js           # Dialogue + Choix pouvoirs FUSIONNÉ (~1350 lignes)
│   └── _deprecated/
│       └── PowerChoiceScreen.js # Archivé (429 lignes)
├── intro/                      # StarWarsCrawl, IntroSequence
├── behaviors/bossBehaviors.js  # Ré-export legacy (~20 lignes)
├── bosses/                     # MODULE MODULAIRE
│   ├── index.js                # Registry central
│   ├── BossBehaviorController.js  # Logique + transformation (~810 lignes)
│   ├── configs/                # 7 fichiers boss actifs
│   │   ├── boss_clippe.js      # L7 - Clippy, L'Assistant Déchu
│   │   ├── boss_explorer.js    # L6 - Internet Explorer 6
│   │   ├── boss_messenger.js   # L5 - MSN Messenger
│   │   ├── boss_update.js      # L4 - Windows Update
│   │   ├── boss_norton.js      # L3 - Norton Antivirus
│   │   ├── boss_hub.js         # L2 - Hub 10BASE-T
│   │   └── boss_gates.js       # L1 - Bill Gates → Azure Cloud (transformation)
│   ├── attacks/                # 24 fichiers attaque (~30-50 lignes)
│   │   ├── index.js            # Router executeAttack()
│   │   └── [23 handlers]       # projectileBurst, helpBubble, scanBeam, etc.
│   └── behaviors/              # 5 fichiers - Patterns spéciaux boss
│       ├── index.js            # Registry + orchestration
│       ├── stickyAssistant.js  # Clippy - se colle au joueur
│       ├── goOffline.js        # Messenger - disparition temporaire
│       ├── progressBar.js      # Update - invincibilité compte à rebours
│       └── quarantine.js       # Norton - capture joueur
├── sages/                      # LES SAGES DU LIBRE
│   ├── index.js                # Registry sages + helpers
│   ├── configs/                # 7 fichiers sage (~30 lignes)
│   │   ├── sage_jimmy.js       # Jimmy Wales (Wikipédia) - INTRO
│   │   ├── sage_firefox.js     # Mozilla Firefox
│   │   ├── sage_duo.js         # DuckDuckGo (Duo)
│   │   ├── sage_tux.js         # Tux (Linux)
│   │   ├── sage_anonymous.js   # Anonymous
│   │   ├── sage_rpi.js         # Raspberry Pi
│   │   └── sage_linus.js       # Linus Torvalds
│   └── powers/                 # 14 fichiers pouvoir (~25 lignes)
│       ├── index.js            # Registry pouvoirs + helpers
│       └── [14 powers]         # wiki_boost, edit_shield, etc.
├── enemies/                    # ⭐ MODULE ENNEMIS (NEW V4.28)
│   ├── index.js                # Registry central + LAYER_ENEMY_MAP
│   ├── configs/                # 23 fichiers type_*.js
│   │   ├── type_sql_injection.js  # L7 - zigzag
│   │   ├── type_xss.js            # L7 - fast
│   │   ├── type_csrf.js           # L7 - diagonal
│   │   └── [20 autres types]      # L6 → L1
│   ├── behaviors/              # 10 fichiers behavior
│   │   ├── index.js            # executeBehavior() router
│   │   ├── zigzag.js           # Mouvement sinusoïdal
│   │   ├── fast.js             # Descente rapide
│   │   ├── diagonal.js         # Mouvement diagonal
│   │   ├── phase.js            # Traversée aléatoire
│   │   ├── teleport.js         # Téléportation
│   │   ├── swarm.js            # Formation groupée
│   │   ├── wave.js             # Mouvement ondulé
│   │   ├── erratic.js          # Mouvement erratique
│   │   ├── slowTank.js         # Tank lent et résistant
│   │   └── heavy.js            # Lourd avec oscillation
│   └── visuals/                # 3 fichiers visuels
│       ├── index.js            # drawEnemy() router
│       ├── standard.js         # Rendu par défaut
│       ├── tank.js             # Rendu tank
│       └── swarm.js            # Rendu swarm
└── projectiles/                # ⭐ MODULE PROJECTILES (NEW V4.28)
    ├── index.js                # Registry central
    ├── configs/                # 10 fichiers type_*.js
    │   ├── type_default.js     # Projectile standard
    │   ├── type_burst.js       # Burst de projectiles
    │   ├── type_letter.js      # Lettres EULA
    │   ├── type_popup.js       # Fenêtres popup
    │   ├── type_activex.js     # Composants ActiveX
    │   ├── type_homing.js      # Missiles guidés
    │   ├── type_debris.js      # Débris irréguliers
    │   ├── type_wave.js        # Anneaux concentriques
    │   ├── type_rapid.js       # Tir rapide
    │   └── type_rain.js        # Pluie de projectiles
    └── visuals/                # 10 fichiers visuels
        ├── index.js            # drawProjectile() router
        ├── default.js          # Cercle simple
        ├── bullet.js           # Bullet classique
        ├── letter.js           # Lettres animées
        ├── popup.js            # Fenêtres Windows
        ├── activex.js          # Hexagones AX
        ├── homing.js           # Triangle directionnel
        ├── debris.js           # Polygone irrégulier
        ├── wave.js             # Anneau concentrique
        └── rain.js             # Goutte allongée
```

### HUD OSI Stack - Système de Vie Symétrique ⭐ V1.5

**Concept "Poupées Russes"** : HUD vertical à gauche représentant l'encapsulation OSI. Chaque couche (sauf L7) possède un HEADER et un TRAILER.

**Structure HP** :
- L7 (Application) : CORE unique = 100 HP
- L6-L1 : Header (50 HP) + Trailer (50 HP) chacun
- HP Total max : 700 HP

**Logique dégâts** : Split 50/50 entre header/trailer de la couche externe active. L7 CORE à 0 = Game Over.

**API** : `osiStackHUD.handleDamage(damage)`, `osiStackHUD.addLayer(bossId)`, `osiStackHUD.getTotalHealth()`

### Les Sages du Libre - Système Roguelike ⭐

**Concept** : Après chaque boss vaincu, un Sage du logiciel libre apparaît et offre un choix entre 2 pouvoirs.

| Sage | Boss associé | Pouvoirs |
|------|--------------|----------|
| Jimmy Wales | boss_clippe (L7) + INTRO | Savoir Infini, Bouclier Éditorial |
| Firefox-kun | boss_explorer (L6) | Onglet Éclair, Multi-Onglets |
| Snowden & Assange | boss_messenger (L5) | Asile Numérique, Leaks Massifs |
| Tux | boss_update (L4) | Kernel Panic, Sudo Kill |
| Anonymous | boss_norton (L3) | Mode DDoS, Mode Fantôme |
| Raspberry Pi | boss_hub (L2) | Boost GPIO, Overclocking |
| Linus Torvalds | boss_gates (L1) | Chmod 777, Libération du Code |

**Flux** : `Boss vaincu → SageScreen (dialogue → badges pouvoirs) → Transition`

**SageScreen** : Dialogue + choix pouvoirs fusionnés. Le sage reste visible pendant le choix (badges circulaires flottants).

**Transformation Boss** : Bill Gates se transforme en Azure Cloud à 50% HP avec cinématique holographique (~3.5s).

**Jimmy Wales** : Apparaît aussi en INTRO avant le niveau 7 (isIntroSage: true)

### Dev Tools (prototype-game.html) ⭐ V1.6

**skipToLayer()** simule maintenant une progression complète :
- Déblocage des couches OSI (anneaux concentriques)
- Attribution de pouvoirs aléatoires par sage traversé

**Dépendances exposées** :
- `window.playerStateManager` : Accès global depuis NetDefender.js
- `player.onBossDefeated()` : Déclencheur de progression OSI

### Workflow Vibe Coding ⭐

| Tâche | Fichier(s) | Lignes |
|-------|------------|--------|
| Modifier stats d'un boss | `bosses/configs/boss_*.js` | ~60-90 |
| Ajuster une attaque | `bosses/attacks/*.js` | ~30-50 |
| Ajouter un nouveau boss | Créer config + ajouter à `index.js` | ~80 |
| Nouveau type de mouvement | `BossBehaviorController.js` | ~810 |
| Ajouter/modifier behavior | `bosses/behaviors/*.js` | ~50-80 |
| Cinématique transformation | `screens/BossIntro.js` | ~1084 |
| Équilibrage global | `config/gameConfig.js` | ~280 |
| Modifier intro/transitions | `screens/*.js`, `intro/*.js` | ~200-300 |
| Ajouter un sage | `sages/configs/sage_*.js` | ~30 |
| Ajouter un pouvoir | `sages/powers/power_*.js` | ~25 |
| Modifier dialogue sage | `sages/configs/sage_*.js` | ~30 |
| Modifier couleurs/HP HUD | `ui/OSIStackConfig.js` | ~112 |
| Modifier animations HUD | `ui/OSIStackAnimations.js` | ~244 |
| Modifier rendu HUD | `ui/OSIStackRenderer.js` | ~374 |
| Tester layer spécifique | `prototype-game.html` + Skip to Boss | - |

### Intégration Future (NE PAS FAIRE MAINTENANT)

Quand le prototype sera validé par l'utilisateur :
1. Copier `game-prototype/` vers `game/`
2. Mettre à jour imports dans `GameOverlay.astro`
3. Tester sur le site principal
4. Supprimer `prototype-game.html`

**Documentation détaillée** : `.claude/GAME_PROTOTYPE.md`

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
| `src/data/skills.json` | 8 compétences (grille) | Compétences |
| `src/data/projects.json` | 5 projets | Projets |

**Interfaces** : `src/types/content.ts` (HeroContent, SkillData, ProjectData, etc.)

### Workflow Sauvegarde (V4.15)

**Pattern unifié** appliqué aux 5 sections éditables :
```javascript
// 1. PUT vers API
const saveRes = await fetch('/api/sections', { method: 'PUT', body: formData });

// 2. Re-fetch données confirmées serveur (source de vérité unique)
if (saveRes.ok) {
  const freshData = await fetch('/api/sections').then(r => r.json());
  // 3. Sync DOM automatique
  updateUIFromFreshData(freshData);
}
```

### Workflow Dev
```bash
# Terminal 1: Portfolio
npm run dev  # :4321

# Terminal 2: Admin
cd admin/ && npm run dev  # :4322
```

**Édition** : Modifier sur `:4322` → Sauvegarder → Sync auto → Visible sur `:4321`

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
| Boss configs | snake_case | `boss_clippe.js` |

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

### Skills (8 compétences)

**Architecture** : Modal unique dynamique avec injection contenu JS

**Fichiers** :
- `src/data/skills.json` : 8 compétences (données)
- `src/components/sections/Skills.astro` : Grille + modal HTML + styles CSS
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

### Proto_Bot (V4.17)

**Widget chatbot flottant** connecté à l'API Ollama locale (Qwen 2.5-coder 14B)

**Fichiers** :
- `src/components/ui/ChatWidget.astro` : Composant complet
- `public/scripts/chat-widget.js` : Logique JS (IIFE, streaming SSE)

**API** : `https://protolab.ovh/api/chat/stream` (POST)

### Projects (5 projets)

**Source** : `src/data/projects.json` (unifié avec admin)

### Docs (Markdown)

**Catégories** : `proxmox`, `paloalto`, `linux`, `windows`, `docker`, `backup`, `network`, `security`, `monitoring`, `active-directory`, `documentation`, `architecture`, `multimedia`, `llm`, `web-front`

---

## 🔧 Workflow MCP

### Serveur MCP v2.5.0

**Chemin** : `Serveur MPC/dist/index.js`

### Outils Portfolio (existants)

```bash
get_overview              # Vue d'ensemble portfolio
get_summary               # Compteurs uniquement
validate_icon "docker"    # Validation icône
list_projects             # Liste projets
list_docs                 # Liste documentation
list_components           # Composants Astro
get_template type="project" preset="infrastructure"
```

### Outils NetDefender - Lecture (v2.0.0)

| Outil | Description | Usage |
| ----- | ----------- | ----- |
| `list_bosses` | Liste 7 boss avec stats | Vue d'ensemble rapide |
| `get_boss "clippe"` | Config complète d'un boss | Détails + code source |
| `list_attacks` | 24 types d'attaques | Référence paramètres |
| `get_attack "projectile_burst"` | Détails d'une attaque | Signature + usage |
| `get_game_config` | Config joueur/bullets/audio | Équilibrage global |
| `get_osi_layers` | Couleurs des 7 layers | Thématique visuelle |
| `get_game_overview` | Dashboard complet | 66 fichiers, ~12500 lignes |
| `list_game_files` | Inventaire fichiers | Taille + lignes |
| `get_game_balance` | Analyse équilibrage | DPS, survie, recommandations |

### Outils NetDefender - Maintenance (v2.1.0)

| Outil | Description | Usage |
| ----- | ----------- | ----- |
| `validate_integrity` | Vérifie cohérence projet | Détecte attaques manquantes, refs cassées |
| `find_dead_code` | Détecte code mort | Attaques inutilisées, fichiers orphelins |
| `cleanup_unused` | Supprime code mort | Avec backup automatique |
| `get_code_metrics` | Statistiques codebase | Fichiers, lignes, répartition |

### Outils NetDefender - Mutations Boss (v2.1.0)

| Outil | Description | Usage |
| ----- | ----------- | ----- |
| `update_boss` | Modifie propriétés boss | health, speed, color, movement... |
| `create_boss` | Crée nouveau boss | Génère fichier + maj index |
| `add_attack_to_boss` | Ajoute attaque à boss | Validation type d'attaque |

### Outils NetDefender - Mutations Attaques (v2.2.0)

| Outil | Description | Usage |
| ----- | ----------- | ----- |
| `list_attack_params` | Liste paramètres par attaque | Référence complète |
| `create_attack` | Crée nouveau type d'attaque | Template + index auto |
| `update_attack` | Modifie attaque existante | Description, paramètres |
| `delete_attack` | Supprime type d'attaque | Vérification usage + backup |

### Outils NetDefender - Screens & Mouvements (v2.2.0)

| Outil | Description | Usage |
| ----- | ----------- | ----- |
| `list_screens` | Liste écrans/animations | 4 screens (intro, transition, boss) |
| `get_screen` | Détails d'un écran | Timings, animations |
| `update_screen_timing` | Modifie timings écran | Durées, délais |
| `list_movements` | Liste types mouvements | 11 mouvements disponibles |
| `update_movement` | Modifie mouvement boss | Type, amplitude, frequency |

### Outils NetDefender - Simulation (v2.2.0)

| Outil | Description | Usage |
| ----- | ----------- | ----- |
| `simulate_boss_fight` | Simule combat vs boss | DPS, durée, survie, recommandations |
| `compare_bosses` | Compare tous les boss | Rankings, problèmes équilibrage |
| `suggest_balance` | Suggestions équilibrage | Changements recommandés par boss |

### Outils NetDefender - Sages (v2.3.0) ⭐ NEW

| Outil | Description | Usage |
| ----- | ----------- | ----- |
| `list_sages` | Liste 7 sages avec stats | Vue d'ensemble |
| `get_sage "jimmy"` | Config complète d'un sage | Détails + pouvoirs |
| `create_sage` | Crée nouveau sage | Génère fichier + maj index |
| `update_sage` | Modifie propriétés sage | name, dialogue, colors... |
| `delete_sage` | Supprime un sage | Avec backup |

### Outils NetDefender - Pouvoirs (v2.3.0)

| Outil | Description | Usage |
| ----- | ----------- | ----- |
| `list_powers` | Liste 14 pouvoirs | Vue d'ensemble |
| `get_power "wiki_boost"` | Config complète d'un pouvoir | Détails effet |
| `list_power_effect_types` | Liste types d'effets | score_multiplier, auto_shield... |
| `create_power` | Crée nouveau pouvoir | Génère fichier + maj index |
| `update_power` | Modifie propriétés pouvoir | effect, rarity, description... |
| `delete_power` | Supprime un pouvoir | Avec backup |
| `link_power_to_sage` | Lie pouvoir à sage | Met à jour les 2 fichiers |
| `validate_sages_integrity` | Vérifie cohérence sages/pouvoirs | Détecte erreurs |
| `simulate_power_combos` | Simule combinaisons pouvoirs | 128 combos possibles |

### Outils NetDefender - Behaviors (v2.4.0)

| Outil | Description | Usage |
| ----- | ----------- | ----- |
| `list_behaviors` | Liste 4 behaviors disponibles | Vue d'ensemble |
| `get_behavior "sticky_assistant"` | Config complète d'un behavior | Paramètres + usage |
| `add_behavior_to_boss` | Ajoute behavior à un boss | Validation type + backup |
| `update_boss_behavior` | Modifie behavior existant | Paramètres uniquement |
| `remove_behavior_from_boss` | Supprime behavior d'un boss | Avec backup |

### Outils NetDefender - Ennemis (v2.5.0) ⭐ NEW

| Outil | Description | Usage |
| ----- | ----------- | ----- |
| `list_enemies` | Liste 23 types d'ennemis | Filtrage par layer |
| `get_enemy "sql_injection"` | Config complète d'un ennemi | Détails + behavior |
| `create_enemy` | Crée nouveau type d'ennemi | Génère fichier + maj index |
| `update_enemy` | Modifie propriétés ennemi | health, speed, behavior... |
| `delete_enemy` | Supprime type d'ennemi | Avec backup |
| `list_enemy_behaviors` | Liste 10 behaviors ennemis | zigzag, fast, teleport... |
| `get_enemy_behavior` | Détails d'un behavior | Paramètres + ennemis qui l'utilisent |
| `simulate_enemy_wave` | Simule vague par layer | Probabilités spawn, stats |
| `compare_enemies` | Compare difficultés | Ranking par score |

### Outils NetDefender - Projectiles (v2.5.0) ⭐ NEW

| Outil | Description | Usage |
| ----- | ----------- | ----- |
| `list_projectiles` | Liste 10 types projectiles | Vue d'ensemble |
| `get_projectile "letter"` | Config complète | Visual, physics, lifetime |
| `create_projectile` | Crée nouveau type | Génère fichier + maj index |
| `update_projectile` | Modifie propriétés | color, size, hasTrail... |
| `list_projectile_visuals` | Liste 10 rendus visuels | letter, popup, debris... |
| `validate_projectile_refs` | Vérifie intégrité refs | Détecte types invalides |

### Workflow Recommandé (Jeu)

```bash
# 1. Vérifier intégrité avant modification
validate_integrity

# 2. Vue d'ensemble
get_game_overview

# 3. Modifier un boss
update_boss boss_id="clippe" updates={health: 50}

# 4. Vérifier équilibrage après modification
get_game_balance

# 5. Simuler et comparer
simulate_boss_fight boss_id="clippe"
compare_bosses

# 6. Nettoyer le code mort
find_dead_code
cleanup_unused confirm=true targets=["unused_attacks"]
```

> ⚡ **Gain** : ~800 tokens → ~50 tokens pour explorer les boss

---

## ✅ Règles d'Or

### À FAIRE
- ✅ **Travailler sur `game-prototype/`** (pas `game/`)
- ✅ **Tester via `prototype-game.html`**
- ✅ Consulter `.claude/GAME_PROTOTYPE.md` pour specs boss
- ✅ Éditer contenu via admin (`:4322`) plutôt que JSON manuel
- ✅ Consulter `inventory.md` avant scan code
- ✅ Valider icônes MCP avant ajout stack
- ✅ Respecter interfaces `src/types/content.ts`
- ✅ Branche `dev-admin` → merger `master` après validation

### À ÉVITER
- ❌ **Modifier `public/scripts/game/`** (production gelée)
- ❌ **Modifier `GameOverlay.astro`** (production)
- ❌ **Déployer le prototype sans validation explicite**
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
```

---

## 📞 Contact

**Dev** : Adrien Mercadier (TSSR)
**Homelab** : Protolab (Proxmox, PaloAlto, Docker, LLM local)

---

*V4.28 | MCP Server v2.5.0 | Admin v1.1 | Proto_Bot v1.0 | NetDefender Prototype v1.8 (Modular Enemies & Projectiles)*
