# Scripts Publics

> 2026-01-09 | V4.24 | 8 Core + 18 Game Prod + 66 Game Prototype

---

## Scripts Core (8)

### custom-cursor.js

**Chemin** : `public/scripts/custom-cursor.js`

**Rôle** : Curseur personnalisé avec effets hover

**Comportement** :
- Suit la souris avec léger délai
- Scale 1.5x au hover sur liens/boutons
- Change couleur en magenta au hover

---

### three-background.js

**Chemin** : `public/scripts/three-background.js`

**Dépendances** : Three.js r128 (CDN)

**Rôle** : Particules 3D animées en background

**Configuration** :
- Particules : 800
- Couleurs : cyan (88%), magenta (12%)
- Rotation lente continue
- Réactif au scroll

---

### typing-effect.js

**Chemin** : `public/scripts/typing-effect.js`

**Rôle** : Animation texte tapé dans Hero

**Timing** :
- Vitesse frappe : 50ms/char
- Pause fin mot : 2000ms
- Vitesse effacement : 30ms/char

---

### modal-system.js

**Chemin** : `public/scripts/modal-system.js`

**Rôle** : Gestion système modales 2 niveaux

**Architecture** :
- Niveau 1 : Preview (aperçu rapide)
- Niveau 2 : Detail (modal complet)

**Fonctionnalités** :
- Hover sur SkillCard → ouvre preview
- Click sur preview → ouvre modal detail
- Click backdrop → ferme modal
- Échap → ferme modal active

---

### lab-status.js

**Chemin** : `public/scripts/lab-status.js`

**Rôle** : Polling temps réel infrastructure Protolab

**Endpoint** : `/api/lab-status.json`

**Intervalle** : 30 secondes

---

### doc-counter.js

**Chemin** : `public/scripts/doc-counter.js`

**Rôle** : Compteurs animés section Documentation

**Méthode** : IntersectionObserver

---

### scroll-animations.js

**Chemin** : `public/scripts/scroll-animations.js`

**Rôle** : Animations déclenchées au scroll

**Fonctionnalités** :
- Navbar compact mode
- Smooth scroll ancres
- Progress bar scroll
- Reveal animations sections

---

### floating-packet.js

**Chemin** : `public/scripts/floating-packet.js`

**Rôle** : Animation paquet réseau (Easter Egg trigger)

**Comportement** : 5 clics → déclenche GameOverlay

---

### chat-widget.js

**Chemin** : `public/scripts/chat-widget.js`

**Rôle** : Logique Proto_Bot chatbot

**Fonctionnalités** :
- Streaming SSE
- Parsing markdown (marked.js)
- Timeout 30s, retry auto

---

## Scripts Game - PRODUCTION (18)

**Chemin** : `public/scripts/game/`

**STATUS** : GELÉ - NE PAS MODIFIER

```text
game/
├── NetDefender.js      # Boucle principale
├── InputHandler.js     # Clavier/souris
├── AudioManager.js     # Sons/musique
├── WaveManager.js      # Vagues ennemis
├── ParticleSystem.js   # Effets visuels
├── ScreenShake.js      # Secousses écran
├── GridBackground.js   # Grille animée
├── Player.js           # Entité joueur
├── Enemy.js            # Ennemis basiques
├── BossProjectile.js   # Projectiles boss
├── Bullet.js           # Munitions joueur
├── PowerUp.js          # Boosters
├── gameConfig.js       # Configuration
├── bossBehaviors.js    # IA boss (monolithique)
├── narrativeContent.js # Dialogues
└── intro/
    ├── IntroSequence.js
    ├── TransitionScreen.js
    └── BossIntro.js
```

---

## Scripts Game - PROTOTYPE (66)

**Chemin** : `public/scripts/game-prototype/`

**STATUS** : DÉVELOPPEMENT ACTIF

**Documentation complète** : `.claude/GAME_PROTOTYPE.md`

### Structure

```text
game-prototype/
├── NetDefender.js              # Orchestrateur (~880 lignes)
├── config/
│   └── gameConfig.js           # Configuration (~280 lignes)
├── data/
│   └── ScenarioData.js         # Données narratives (~150 lignes)
├── content/
│   └── narrativeContent.js     # Dialogues (~470 lignes)
├── entities/                   # 5 fichiers
│   ├── Player.js
│   ├── Enemy.js
│   ├── Bullet.js
│   ├── BossProjectile.js
│   └── PowerUp.js
├── systems/                    # 5 fichiers
│   ├── WaveManager.js          # + transformation cinematic (~750 lignes)
│   ├── InputHandler.js
│   ├── ParticleSystem.js
│   ├── AudioManager.js
│   └── PlayerStateManager.js   # Gestion pouvoirs roguelike (~370 lignes)
├── effects/                    # 2 fichiers
│   ├── GridBackground.js
│   └── ScreenShake.js
├── screens/                    # 3 fichiers actifs + 1 archivé
│   ├── TransitionScreen.js     # (~370 lignes)
│   ├── BossIntro.js            # + transformation cinematic (~1084 lignes)
│   ├── SageScreen.js           # Dialogue + Choix pouvoirs FUSIONNÉ (~1350 lignes)
│   └── _deprecated/
│       └── PowerChoiceScreen.js
├── intro/                      # 2 fichiers
│   ├── IntroSequence.js
│   └── StarWarsCrawl.js
├── behaviors/
│   └── bossBehaviors.js        # Ré-export legacy (~20 lignes)
├── bosses/                     # 25 fichiers - MODULE MODULAIRE V4.24
│   ├── index.js                # Registry central
│   ├── BossBehaviorController.js  # Logique + transformation (~810 lignes)
│   ├── configs/                # 7 fichiers boss actifs
│   │   ├── boss_clippe.js      # L7 - Clippy
│   │   ├── boss_explorer.js    # L6 - Internet Explorer 6
│   │   ├── boss_messenger.js   # L5 - MSN Messenger
│   │   ├── boss_update.js      # L4 - Windows Update
│   │   ├── boss_norton.js      # L3 - Norton Antivirus
│   │   ├── boss_hub.js         # L2 - Hub 10BASE-T
│   │   └── boss_gates.js       # L1 - Bill Gates → Azure Cloud (transformation)
│   └── attacks/                # 16 fichiers
│       ├── index.js            # Router
│       └── [15 attack handlers]
└── sages/                      # ~23 fichiers - SYSTÈME ROGUELIKE
    ├── index.js                # Registry sages
    ├── configs/                # 7 fichiers sage
    │   ├── sage_jimmy.js       # Jimmy Wales (après boss_clippe + INTRO)
    │   ├── sage_firefox.js     # Firefox-kun (après boss_explorer)
    │   ├── sage_duo.js         # Duo the Owl (après boss_messenger)
    │   ├── sage_tux.js         # Tux (après boss_update)
    │   ├── sage_anonymous.js   # Anonymous (après boss_norton)
    │   ├── sage_rpi.js         # Raspberry Pi (après boss_hub)
    │   └── sage_linus.js       # Linus Torvalds (après boss_gates)
    └── powers/                 # 15 fichiers (index + 14 pouvoirs)
        ├── index.js            # Registry pouvoirs
        └── [14 power configs]
```

### Workflow Vibe Coding

| Tâche | Fichier(s) | Lignes |
|-------|------------|--------|
| Stats boss | `bosses/configs/boss_*.js` | ~60-90 |
| Attaque | `bosses/attacks/*.js` | ~30-50 |
| Nouveau boss | Config + `index.js` | ~80 |
| Mouvement/Transform | `BossBehaviorController.js` | ~810 |
| Config global | `config/gameConfig.js` | ~280 |
| Narratif | `data/ScenarioData.js` | ~150 |
| Sage | `sages/configs/sage_*.js` | ~30 |
| Pouvoir | `sages/powers/power_*.js` | ~25 |
| Écran cinématique | `screens/BossIntro.js` | ~1084 |

### Fonctionnalités Clés

- **Transformation Boss** : Bill Gates se transforme en Azure Cloud à 50% HP
- **Cinématique Transformation** : Portrait holographique centré (~3.5s)
- **Système Sages** : 7 sages offrent des pouvoirs après chaque boss
- **14 Pouvoirs Roguelike** : 128 combinaisons possibles

---

## Résumé

| Catégorie | Fichiers | Lignes estimées |
|-----------|----------|-----------------|
| Core | 9 | ~1400 |
| Game Production | 18 | ~3500 |
| Game Prototype | 66 | ~12500 |
| **Total** | **93** | **~17400** |

---

*Scripts V4.24 | 2026-01-09*
