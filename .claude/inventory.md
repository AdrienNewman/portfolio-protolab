# Inventaire Portfolio Protolab

> 2026-01-15 | Astro 5.16.6 | V4.27 | Admin v1.1 | MCP v2.4.0 | NetDefender Prototype v1.7 (Behaviors System)

---

## Métriques Globales

| Type | Nombre |
|------|--------|
| Composants Astro | 20 |
| Données JSON | 3 fichiers (sections, skills, projects) |
| Projets | 5 |
| Docs MD | 12 |
| Scripts JS Core | 8 |
| Scripts JS Game (production) | 18 |
| Scripts JS Game Prototype | 89 |
| API Routes | 5 (2 portfolio + 3 admin) |
| Catégories docs | 15 |
| Outils MCP Portfolio | 20 |
| Outils MCP NetDefender | 47 |

---

## Structure Simplifiée

```
src/
├── components/
│   ├── layout/      # 3: Navbar, Footer, MobileMenu
│   ├── sections/    # 7: Hero, Skills, Projects, Profile, Contact, Docs, LiveLab
│   ├── ui/          # 8: Cards (3), Modals (4), ChatWidget
│   └── game/        # 2: GameOverlay, GameOverlayPrototype
├── content/
│   ├── projects/    # 5 YAML (legacy)
│   └── docs/        # 12 MD
├── data/
│   ├── sections.json      # Hero, Profile, Contact
│   ├── skills.json        # 8 compétences
│   └── projects.json      # 5 projets
├── types/
│   └── content.ts         # Interfaces TS
└── pages/
    ├── index.astro
    └── api/               # 2 routes

public/scripts/
├── [8 scripts core]
├── game/                  # PRODUCTION (ne pas toucher)
└── game-prototype/        # DÉVELOPPEMENT ACTIF (89 fichiers)
```

---

## NetDefender - État Jeu

### PROTOTYPE vs PRODUCTION

| Aspect | PROTOTYPE | PRODUCTION |
|--------|-----------|------------|
| Dossier | `public/scripts/game-prototype/` | `public/scripts/game/` |
| Fichiers | 89 | 18 |
| Lignes de code | ~17 000 | ~3 000 |
| Architecture Boss | Modulaire (7 boss, 23 attaques, 4 behaviors) | Monolithique |
| Système Sages | 7 sages, 14 pouvoirs | Non |
| HUD OSI Stack | 6 fichiers modulaires (~1340 lignes) | Non |
| Status | En développement | Gelé |

### Prototype - Détail Fichiers (89)

```
game-prototype/
├── NetDefender.js                    # 1 (~920 lignes)
├── config/gameConfig.js              # 1 (281 lignes)
├── content/narrativeContent.js       # 1 (469 lignes)
├── data/ScenarioData.js              # 1 (149 lignes)
├── entities/                         # 5 (Player, Enemy, Bullet, BossProjectile, PowerUp)
├── systems/                          # 5 (Wave, Input, Particles, Audio, PlayerStateManager)
├── effects/                          # 2 (Grid, Shake)
├── ui/                               # ⭐ 6 fichiers HUD OSI Stack (V1.5)
│   ├── index.js                      # 23 lignes (exports)
│   ├── OSIStackConfig.js             # 112 lignes (couleurs, HP, positions)
│   ├── OSIStackState.js              # 336 lignes (gestion HP symétrique)
│   ├── OSIStackRenderer.js           # 374 lignes (rendu Canvas)
│   ├── OSIStackAnimations.js         # 244 lignes (animations visuelles)
│   └── OSIStackHUD.js                # 252 lignes (coordinateur)
├── screens/                          # 3 actifs + 1 archivé
│   ├── TransitionScreen.js           # 371 lignes
│   ├── BossIntro.js                  # 1084 lignes (+ transformation cinematic)
│   ├── SageScreen.js                 # 1348 lignes (FUSIONNÉ V1.2)
│   └── _deprecated/
│       └── PowerChoiceScreen.js      # 429 lignes (archivé)
├── intro/                            # 2 (Sequence, Crawl)
├── behaviors/bossBehaviors.js        # 1 (legacy re-export)
├── bosses/                           # 30
│   ├── index.js                      # 1
│   ├── BossBehaviorController.js     # 1 (810 lignes, + transformation)
│   ├── configs/                      # 7 boss actifs
│   ├── attacks/                      # 24 (index + 23 attaques)
│   └── behaviors/                    # ⭐ 5 fichiers (index + 4 behaviors)
│       ├── index.js                  # Registry + executeBehavior()
│       ├── stickyAssistant.js        # Clippy - se colle au joueur
│       ├── goOffline.js              # Messenger - disparition
│       ├── progressBar.js            # Update - invincibilité
│       └── quarantine.js             # Norton - capture joueur
└── sages/                            # 23
    ├── index.js                      # 1 (67 lignes)
    ├── configs/                      # 7 sages
    └── powers/                       # 15 (index + 14 pouvoirs)
```

### Boss par Layer (7 principaux)

| Layer | Boss ID | Nom | Subtitle |
|-------|---------|-----|----------|
| L7 | boss_clippe | CLIPPY | L'Assistant Déchu |
| L6 | boss_explorer | INTERNET EXPLORER 6 | Le Monopole Absolu |
| L5 | boss_messenger | MSN MESSENGER | Le Fantôme de vos Contacts |
| L4 | boss_update | WINDOWS UPDATE | Redémarrage Forcé |
| L3 | boss_norton | NORTON ANTIVIRUS | Faux Positif Total |
| L2 | boss_hub | HUB 10BASE-T | Collisions Infinies |
| L1 | boss_gates | BILL GATES → AZURE CLOUD | Cyborg Hardware Lock (transformation) |

### Les Sages du Libre (v1.8 - Pouvoirs Francisés)

| Sage | Après Boss | Pouvoirs |
|------|------------|----------|
| Jimmy Wales | boss_clippe (L7) + INTRO | Savoir Infini, Bouclier Éditorial |
| Firefox-kun | boss_explorer (L6) | Onglet Éclair, Multi-Onglets |
| Edward Snowden & Julian Assange | boss_messenger (L5) | Asile Numérique, Leaks Massifs |
| Tux | boss_update (L4) | Kernel Panic, Sudo Kill |
| Anonymous | boss_norton (L3) | Mode DDoS, Mode Fantôme |
| Raspberry Pi | boss_hub (L2) | Boost GPIO, Overclocking |
| Linus Torvalds | boss_gates (L1) | Chmod 777, Libération du Code |

**Total** : 7 sages | 14 pouvoirs | 128 combinaisons possibles

---

## Backend Admin (Repo Indépendant)

**Version** : v1.1 (Pattern sauvegarde unifié)

```
admin/                     # Port 4322
├── src/
│   ├── components/
│   │   └── AdminLayout.astro
│   ├── lib/
│   │   ├── contentLoader.ts
│   │   └── fileSaver.ts
│   └── pages/
│       ├── index.astro
│       └── api/
│           ├── sections.ts
│           ├── skills.ts
│           └── projects.ts
└── package.json
```

**Workflow** : `:4322` → Modifier → Sauvegarder → Sync auto → Visible sur `:4321`

---

## Contenus

### Composants (20)

| Catégorie | Nombre | Fichiers |
|-----------|--------|----------|
| Layout | 3 | Navbar, Footer, MobileMenu |
| Sections | 7 | Hero, Skills, Projects, Profile, Contact, Docs, LiveLab |
| UI | 8 | SkillCard, ProjectCard, ProjectGallery, SkillPreview, SkillModal, ProjectModal, DocModal, ChatWidget |
| Game | 2 | GameOverlay, GameOverlayPrototype |

**Détails** : Voir `components.md`

### Projects (5)

| Slug | Titre | Stack |
|------|-------|-------|
| protolab | Infrastructure Protolab | Proxmox, PaloAlto, Windows |
| llm-local | LLM Local + GPU | Ollama, RTX 3060 |
| observability | Stack Observabilité | OTel, VictoriaLogs, Grafana |
| control-plane | Control-Plane IA | MCP Server, Python |
| web-interface | Interface Web | Astro, Three.js |

### Docs (12)

**Par catégorie** : paloalto (3), documentation (4), monitoring (1), architecture (1), security (1), web-front (2)

### Skills (8)

windows, linux, proxmox, paloalto, observability, llm, backup, cloud

---

## Variables CSS

```css
--cyan: #00ffff;
--magenta: #ff0080;
--green: #00ff88;
--bg-dark: #0a0a0a;
```

**Typo** : Bebas Neue, Space Mono, JetBrains Mono

---

## Stack

**Dependencies** : `astro@5.16.6`, `simple-icons@16.2.0`, `@astrojs/node@9.5.1`

**CDN** : Three.js r128, marked.js, Google Fonts

**Build** : Static (dist/) via Nginx (Docker)

---

## Serveur MCP v2.4.0

**Chemin** : `Serveur MPC/` (compilé vers `dist/`)

### Outils NetDefender (47 total)

| Catégorie | Outil | Description |
|-----------|-------|-------------|
| **Lecture** | `list_bosses` | Liste 7 boss avec stats |
| | `get_boss` | Config complète d'un boss |
| | `list_attacks` | 23 types d'attaques |
| | `get_attack` | Détails d'une attaque |
| | `get_game_config` | Config joueur/bullets/audio |
| | `get_osi_layers` | Couleurs des 7 layers |
| | `get_game_overview` | Dashboard complet |
| | `list_game_files` | Inventaire fichiers |
| | `get_game_balance` | Analyse équilibrage |
| **Maintenance** | `validate_integrity` | Vérifie cohérence projet |
| | `find_dead_code` | Détecte code mort |
| | `cleanup_unused` | Supprime code mort (+ backup) |
| | `get_code_metrics` | Statistiques codebase |
| **Mutations Boss** | `update_boss` | Modifie propriétés boss |
| | `create_boss` | Crée nouveau boss |
| | `add_attack_to_boss` | Ajoute attaque à boss |
| **Mutations Attaques** | `list_attack_params` | Paramètres de toutes les attaques |
| | `create_attack` | Crée nouveau type d'attaque |
| | `update_attack` | Modifie description/paramètres |
| | `delete_attack` | Supprime une attaque (+ backup) |
| **Screens & Mouvements** | `list_screens` | Liste écrans/animations |
| | `get_screen` | Détails d'un écran |
| | `update_screen_timing` | Modifie timings |
| | `list_movements` | Types de mouvement boss |
| | `update_movement` | Modifie mouvement d'un boss |
| **Simulation** | `simulate_boss_fight` | Simule combat contre boss |
| | `compare_bosses` | Compare stats/difficulté |
| | `suggest_balance` | Suggestions d'équilibrage |
| **Sages** | `list_sages` | Liste 7 sages avec stats |
| | `get_sage` | Config complète d'un sage |
| | `create_sage` | Crée nouveau sage |
| | `update_sage` | Modifie propriétés sage |
| | `delete_sage` | Supprime un sage (+ backup) |
| **Pouvoirs** | `list_powers` | Liste 14 pouvoirs |
| | `get_power` | Config complète d'un pouvoir |
| | `list_power_effect_types` | Types d'effets disponibles |
| | `create_power` | Crée nouveau pouvoir |
| | `update_power` | Modifie propriétés pouvoir |
| | `delete_power` | Supprime un pouvoir (+ backup) |
| | `link_power_to_sage` | Lie pouvoir à sage |
| | `validate_sages_integrity` | Vérifie cohérence sages/pouvoirs |
| | `simulate_power_combos` | Simule 128 combinaisons |
| **Behaviors** | `list_behaviors` | Liste 4 behaviors disponibles |
| | `get_behavior` | Détails d'un behavior |
| | `add_behavior_to_boss` | Ajoute behavior à boss |
| | `update_boss_behavior` | Modifie behavior existant |
| | `remove_behavior_from_boss` | Supprime behavior d'un boss |

### État Santé Prototype (via validate_integrity)

| Métrique | Valeur |
|----------|--------|
| Boss vérifiés | 7 |
| Attaques implémentées | 23 |
| Behaviors implémentés | 4 |
| Sages vérifiés | 7 |
| Pouvoirs vérifiés | 14 |
| HUD OSI Stack | 6 fichiers (~1340 lignes) |
| Total lignes | ~17 000 |
| Fichiers total | 89 |

### Correctifs V1.7

| Fix | Description |
|-----|-------------|
| Behaviors System | 4 patterns spéciaux (sticky, offline, progress, quarantine) |
| 8 nouvelles attaques | help_bubble, screen_shake_attack, slow_field, scan_beam, etc. |
| MCP Behaviors | 5 nouveaux outils pour gérer les behaviors |
| skipToLayer() | Simule progression complète (OSI + pouvoirs) |
| window.playerStateManager | Exposé globalement pour dev tools |

---

## Références Détaillées

| Document | Contenu |
|----------|---------|
| `GAME_PROTOTYPE.md` | Architecture jeu, boss, attaques, sages, pouvoirs |
| `components.md` | Catalogue composants + props |
| `content.md` | Schémas Zod + interfaces TS |
| `scripts.md` | Documentation scripts JS |
| `changelog.md` | Historique versions |

---

*Inventaire V4.27 | 2026-01-15*
