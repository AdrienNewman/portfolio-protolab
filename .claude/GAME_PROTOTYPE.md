# NetDefender - Documentation Prototype

**Version** : 1.7 Behaviors System | **Mise à jour** : 2026-01-15

---

## PROTOTYPE ONLY

Ce document concerne UNIQUEMENT `public/scripts/game-prototype/`.

**NE PAS confondre avec la version production dans `public/scripts/game/`.**

| Prototype | Production |
|-----------|------------|
| `public/scripts/game-prototype/` | `public/scripts/game/` |
| `public/prototype-game.html` | Intégré au site |
| En développement | Stable, ne pas toucher |

---

## Vue d'ensemble

Shoot'em-up 2D éducatif style **Star Wars** défendant les 7 couches du modèle **OSI** contre des cybermenaces thématiques. Canvas HTML5 60fps, architecture Entity-Component.

**Thème V1.3** : Les boss représentent des **reliques technologiques de l'ère Microsoft** (Clippy, IE6, MSN, Windows Update, Norton, Hub 10BASE-T, Bill Gates).

**Durée moyenne** : 10-15 min (7 boss)

**Statistiques** : ~88 fichiers | ~17 000 lignes | ~550 Ko

---

## Architecture Modulaire V1.7

### Structure Fichiers

```
public/scripts/game-prototype/
├── NetDefender.js                    # Orchestrateur (~920 lignes)
├── config/
│   └── gameConfig.js                 # Configuration centralisée (~300 lignes)
├── content/
│   └── narrativeContent.js           # Contenu narratif étendu (469 lignes)
├── data/
│   └── ScenarioData.js               # Données narratives (149 lignes)
├── entities/
│   ├── Player.js                     # Vaisseau joueur (315 lignes)
│   ├── Enemy.js                      # Ennemis + boss shapes (~1000 lignes)
│   ├── Bullet.js                     # Projectiles joueur (94 lignes)
│   ├── BossProjectile.js             # Projectiles boss (726 lignes)
│   └── PowerUp.js                    # Power-ups (122 lignes)
├── systems/
│   ├── WaveManager.js                # Orchestration vagues + transform (~750 lignes)
│   ├── InputHandler.js               # Clavier, souris, tactile (207 lignes)
│   ├── ParticleSystem.js             # Explosions, sparks (245 lignes)
│   ├── AudioManager.js               # Sons SFX Web Audio (357 lignes)
│   └── PlayerStateManager.js         # ⭐ Pouvoirs roguelike (369 lignes)
├── effects/
│   ├── GridBackground.js             # Fond grille neon (149 lignes)
│   └── ScreenShake.js                # Tremblement caméra (61 lignes)
├── ui/                               # ⭐ MODULE HUD OSI STACK V1.5 (6 fichiers, ~800 lignes)
│   ├── index.js                      # Exports centralisés (24 lignes)
│   ├── OSIStackConfig.js             # Configuration HUD (113 lignes)
│   ├── OSIStackState.js              # Gestion état HP symétrique (337 lignes)
│   ├── OSIStackRenderer.js           # Rendu Canvas (375 lignes)
│   ├── OSIStackAnimations.js         # Animations visuelles (245 lignes)
│   └── OSIStackHUD.js                # Coordinateur principal (253 lignes)
├── screens/
│   ├── TransitionScreen.js           # Transition entre couches (371 lignes)
│   ├── BossIntro.js                  # Cinématique boss + transformation (1084 lignes)
│   ├── SageScreen.js                 # ⭐ Dialogue + Choix pouvoirs FUSIONNÉ (1348 lignes)
│   └── _deprecated/
│       └── PowerChoiceScreen.js      # Archivé (429 lignes)
├── intro/
│   ├── IntroSequence.js              # Séquence intro (574 lignes)
│   └── StarWarsCrawl.js              # Texte défilant (112 lignes)
├── behaviors/
│   └── bossBehaviors.js              # Ré-export legacy (22 lignes)
├── bosses/                           # MODULE BOSS V1.7 (7 configs, 23 attaques, 4 behaviors)
│   ├── index.js                      # Registry central BOSS_BEHAVIORS
│   ├── BossBehaviorController.js     # Logique comportement + transformation (~810 lignes)
│   ├── behaviors/                    # ⭐ NOUVEAU - Patterns spéciaux boss
│   │   ├── index.js                  # Registry + executeBehavior()
│   │   ├── stickyAssistant.js        # Clippy - se colle au joueur
│   │   ├── goOffline.js              # Messenger - disparition temporaire
│   │   ├── progressBar.js            # Update - invincibilité compte à rebours
│   │   └── quarantine.js             # Norton - capture joueur
│   ├── configs/                      # 7 fichiers boss actifs
│   │   ├── boss_clippe.js            # L7 - Clippy Maléfique
│   │   ├── boss_explorer.js          # L6 - Internet Explorer 6
│   │   ├── boss_messenger.js         # L5 - MSN Messenger
│   │   ├── boss_update.js            # L4 - Windows Update
│   │   ├── boss_norton.js            # L3 - Norton Antivirus
│   │   ├── boss_hub.js               # L2 - Hub 10BASE-T
│   │   └── boss_gates.js             # L1 - Bill Gates (FINAL)
│   └── attacks/                      # 23 types d'attaque
│       ├── index.js                  # Router executeAttack
│       ├── projectileBurst.js        # Salve éventail
│       ├── projectileSpread.js       # Tir large
│       ├── projectileAimed.js        # Tir ciblé joueur
│       ├── projectileRain.js         # Pluie de projectiles
│       ├── rapidFire.js              # Rafale rapide
│       ├── circularWave.js           # Vague 360°
│       ├── homingProjectile.js       # Tête chercheuse
│       ├── areaDrain.js              # Zone drain HP
│       ├── groundHazard.js           # Danger au sol
│       ├── screenFlash.js            # Flash écran + stun
│       ├── sweepingBeam.js           # Laser balayant
│       ├── expandingRing.js          # Anneau expansif
│       ├── fallingDebris.js          # Débris tombants
│       ├── spawnMinions.js           # Invocation minions
│       ├── spawnClones.js            # Spawn clones
│       ├── globalSlow.js             # Ralentissement global
│       ├── slowField.js              # Zone de ralentissement
│       └── confusionField.js         # Inversion contrôles
└── sages/                            # LES SAGES DU LIBRE (7 sages, 14 pouvoirs)
    ├── index.js                      # Registry sages
    ├── configs/                      # 7 fichiers sage (~28 lignes chacun)
    │   ├── sage_jimmy.js             # Jimmy Wales (Wikipédia) - INTRO SAGE
    │   ├── sage_firefox.js           # Firefox-kun
    │   ├── sage_duo.js               # Duo the Owl (DuckDuckGo)
    │   ├── sage_tux.js               # Tux (Linux)
    │   ├── sage_anonymous.js         # Anonymous
    │   ├── sage_rpi.js               # Raspberry Pi
    │   └── sage_linus.js             # Linus Torvalds
    └── powers/                       # 14 fichiers pouvoir (~24 lignes chacun)
        ├── index.js                  # Registry pouvoirs
        └── [14 powers]               # wiki_boost, edit_shield, etc.
```

---

## HUD OSI Stack - Système de Vie Symétrique ⭐ V1.5

### Concept "Poupées Russes"

Le HUD OSI Stack remplace la barre de vie horizontale par un **affichage vertical à gauche** représentant l'encapsulation des couches OSI. Modèle symétrique : chaque couche (sauf L7) possède un **HEADER** et un **TRAILER**.

### Architecture Modulaire (6 fichiers, ~800 lignes)

| Fichier | Lignes | Responsabilité |
|---------|--------|----------------|
| `OSIStackConfig.js` | 113 | Constantes : couleurs, HP, positions, timings |
| `OSIStackState.js` | 337 | Gestion état HP symétrique, callbacks |
| `OSIStackRenderer.js` | 375 | Rendu Canvas avec gradients (pas shadowBlur) |
| `OSIStackAnimations.js` | 245 | Flash, destruction, unlock, flicker critique |
| `OSIStackHUD.js` | 253 | Coordinateur principal |
| `index.js` | 24 | Exports centralisés |

### Structure HP Symétrique

```javascript
L7 (Application) : CORE unique      = 100 HP
L6 (Presentation): Header + Trailer = 50 + 50 HP
L5 (Session)     : Header + Trailer = 50 + 50 HP
L4 (Transport)   : Header + Trailer = 50 + 50 HP
L3 (Network)     : Header + Trailer = 50 + 50 HP
L2 (Data Link)   : Header + Trailer = 50 + 50 HP
L1 (Physical)    : Header + Trailer = 50 + 50 HP
```

**HP Total max** : 100 + (6 × 100) = **700 HP**

### Logique de Dégâts

1. Les dégâts arrivent sur la couche **externe** active (L1 → L7)
2. Pour L6-L1 : dégâts **split 50/50** entre header et trailer
3. Quand header ET trailer sont détruits → couche suivante
4. L7 CORE à 0 HP = **Game Over**

### Couleurs OSI (Arc-en-ciel)

| Layer | Couleur | Hex |
|-------|---------|-----|
| L7 Application | Magenta | `#ff0080` |
| L6 Presentation | Orange | `#ff6600` |
| L5 Session | Vert | `#00ff88` |
| L4 Transport | Cyan | `#00ffff` |
| L3 Network | Bleu | `#0088ff` |
| L2 Data Link | Violet | `#aa00ff` |
| L1 Physical | Jaune | `#ffff00` |

### États Visuels des Blocs

| État | Condition | Effet Visuel |
|------|-----------|--------------|
| `LOCKED` | Couche non débloquée | Grisé, "???" |
| `HEALTHY` | HP > 50% | Couleur normale, glow léger |
| `DAMAGED` | HP 25-50% | Couleur orangée, glow moyen |
| `CRITICAL` | HP < 25% | Clignotement rouge, glow fort |
| `DESTROYED` | HP = 0 | Animation explosion, disparaît |

### Progression des Couches

| Boss vaincu | Couche débloquée |
|-------------|------------------|
| boss_clippe (L7) | L6 Presentation |
| boss_explorer (L6) | L5 Session |
| boss_messenger (L5) | L4 Transport |
| boss_update (L4) | L3 Network |
| boss_norton (L3) | L2 Data Link |
| boss_hub (L2) | L1 Physical |
| boss_gates (L1) | Victoire finale |

### API Publique OSIStackHUD

```javascript
// Gestion dégâts (remplace player.takeDamage)
osiStackHUD.handleDamage(damage) → boolean (isDead)

// Déblocage couche (après boss)
osiStackHUD.addLayer(layerNumber | bossId) → boolean

// Accesseurs
osiStackHUD.getTotalHealth() → number
osiStackHUD.getMaxHealth() → number
osiStackHUD.isDead() → boolean
osiStackHUD.getUnlockedLayerCount() → number

// Game loop
osiStackHUD.update(deltaTime)
osiStackHUD.render()
osiStackHUD.reset()
```

### Intégration NetDefender.js

```javascript
// Import
import { OSIStackHUD } from './ui/index.js';

// Constructor
this.osiStackHUD = new OSIStackHUD(this);

// Remplacer les appels player.takeDamage()
const isDead = this.osiStackHUD.handleDamage(damage);

// Après victoire boss
this.osiStackHUD.addLayer(this.defeatedBossId);

// Game loop
this.osiStackHUD.update(deltaTime);
this.osiStackHUD.render();
```

---

## Les Sages du Libre - Système Roguelike ⭐

### Concept

Après chaque boss vaincu, un **Sage du logiciel libre** apparaît et offre un choix entre **2 pouvoirs passifs**. Les pouvoirs se cumulent au fil de la partie (max 7).

### Flux de jeu (V1.2 - Écran Unifié)

```
Start → Jimmy Wales (SageScreen: dialogue → choix pouvoir) → Niveau 7
  ↓
Boss vaincu → SageScreen (dialogue → badges pouvoirs flottants) → Transition
  ↓
[Répété pour chaque niveau jusqu'à la victoire]
```

**Changement V1.2** : SageScreen et PowerChoiceScreen fusionnés. Le sage reste visible pendant le choix des pouvoirs (badges circulaires à gauche/droite du portrait).

### Tableau des Sages

| Sage | Boss associé | Layer | Pouvoirs | Couleur |
|------|--------------|-------|----------|---------|
| Jimmy Wales | boss_clippe | L7 + INTRO | Savoir Infini, Bouclier Éditorial | #4CAF50 |
| Firefox-kun | boss_explorer | L6 | Onglet Éclair, Multi-Onglets | #FF6611 |
| Edward Snowden & Julian Assange | boss_messenger | L5 | Asile Numérique, Leaks Massifs | #58CC02 |
| Tux | boss_update | L4 | Kernel Panic, Sudo Kill | #F5A623 |
| Anonymous | boss_norton | L3 | Mode DDoS, Mode Fantôme | #00FF00 |
| Raspberry Pi | boss_hub | L2 | Boost GPIO, Overclocking | #C51A4A |
| Linus Torvalds | boss_gates | L1 | Chmod 777, Libération du Code | #F05032 |

### Tableau des Pouvoirs (14)

| Pouvoir | Effet | Type | Rareté |
|---------|-------|------|--------|
| Savoir Infini | Score x1.5 | score_multiplier | common |
| Bouclier Éditorial | Bouclier auto (2 hits, 30s cd) | auto_shield | uncommon |
| Onglet Éclair | Vitesse +25% | speed_boost | common |
| Multi-Onglets | Triple tir (15° spread) | multi_shot | rare |
| Mode Fantôme | Hitbox -30% | hitbox_reduction | rare |
| Asile Numérique | Téléport d'urgence si HP < 20% | emergency_teleport | rare |
| Leaks Massifs | Révèle patterns boss 8s | attack_preview | legendary |
| Kernel Panic | 1s invincible après dégâts | invincibility_on_hit | uncommon |
| Sudo Kill | 5% instant kill | instant_kill_chance | legendary |
| Mode DDoS | Fire rate +40% | fire_rate_boost | uncommon |
| Boost GPIO | Projectile speed +35% | projectile_speed_boost | common |
| Overclocking | Aura 50 radius, 3 dps | damage_aura | rare |
| Chmod 777 | Spawn bonus invincibilité 5s toutes les 30s | spawn_invincibility | legendary |
| Libération du Code | Clone allié du boss 10s | boss_clone | legendary |

### Structure Config Sage

```javascript
export const sage_example = {
    id: 'sage_example',
    name: 'Nom du Sage',
    title: 'Titre descriptif',
    portrait: '/images/game/sages/example.png',

    appearsAfterBoss: 'boss_xxx',
    isIntroSage: false,  // true pour Jimmy Wales uniquement

    introDialogue: 'Dialogue si isIntroSage=true',
    postBossDialogue: 'Dialogue après défaite du boss',

    backgroundColor: '#1a1a2e',
    accentColor: '#00ffff',

    powers: ['power_xxx', 'power_yyy']
};
```

### Structure Config Pouvoir

```javascript
export const power_example = {
    id: 'power_example',
    name: 'Nom du Pouvoir',
    sage: 'sage_xxx',
    icon: '⚡',
    description: 'Description courte de l\'effet',

    effect: {
        type: 'score_multiplier',  // Voir types ci-dessous
        value: 1.5
    },

    rarity: 'common'  // common, uncommon, rare, legendary
};
```

### Types d'Effets Disponibles

| Type | Paramètres | Description |
|------|------------|-------------|
| `score_multiplier` | value | Multiplie le score |
| `speed_boost` | multiplier | Vitesse joueur |
| `fire_rate_boost` | multiplier | Cadence de tir |
| `projectile_speed_boost` | multiplier | Vitesse projectiles |
| `hitbox_reduction` | multiplier | Réduit hitbox (0.7 = -30%) |
| `multi_shot` | projectiles, spreadAngle | Tirs multiples |
| `auto_shield` | hits, cooldown | Bouclier automatique |
| `invincibility_on_hit` | duration | Invincibilité temporaire |
| `instant_kill_chance` | chance | % kill instantané |
| `damage_aura` | radius, damagePerSecond | Aura de dégâts |
| `emergency_teleport` | healthThreshold, cooldown, invincibilityDuration | Téléport d'urgence |
| `attack_preview` | duration, cooldown | Révèle patterns boss |
| `spawn_invincibility` | interval, invincibilityDuration | Spawn bonus invincibilité |
| `boss_clone` | duration, cloneDamageMultiplier, cooldown | Clone allié du boss |

---

## Fiche Boss V1.7 - Reliques Microsoft (7 boss principaux)

### Tableau Récapitulatif

| Layer | Boss ID | Nom | Sous-titre | HP | Speed | Mouvement | Attaques | Behavior |
|-------|---------|-----|------------|----|----|-----------|----------|----------|
| 7 | boss_clippe | CLIPPY | L'Assistant Déchu | 25 | 1.0 | pendulum | projectile_burst, help_bubble | sticky_assistant |
| 6 | boss_explorer | INTERNET EXPLORER 6 | Le Monopole Absolu | 30 | 2.0 | figure_eight_with_teleport | projectile_rain, sweeping_beam | - |
| 5 | boss_messenger | MSN MESSENGER | Le Fantôme de vos Contacts | 18 | 1.5 | weave | screen_shake_attack, projectile_rain, projectile_aimed | go_offline |
| 4 | boss_update | WINDOWS UPDATE | Redémarrage Forcé | 22 | 1.0 | horizontal_sweep | screen_flash, slow_field, projectile_burst | progress_bar |
| 3 | boss_norton | NORTON ANTIVIRUS | Faux Positif Total | 20 | 1.2 | horizontal_sweep | scan_beam, spawn_minions, ground_hazard | quarantine |
| 2 | boss_hub | HUB 10BASE-T | Collisions Infinies | 19 | 0.8 | static_with_shield | circular_wave, projectile_multiply, multi_line_fire | - |
| 1 | boss_gates | BILL GATES | Cyborg Hardware Lock → Azure Cloud | 50 | 1.0 | multi_phase | projectile_burst, ground_hazard, sweeping_beam | - |

**Total HP** : 184 | **HP moyen** : 26.3 | **Boss Final** : Bill Gates (dual-phase)

### Dialogues des Boss

| Boss | Quote | Dramatic Line | Mid-Combat | Defeat |
|------|-------|---------------|------------|--------|
| Clippy | "Je vois que vous tentez d'installer Linux... Mais votre licence Windows est ÉTERNELLE." | Vous. Ne. Partirez. JAMAIS! | Assistance automatique activée ! | Non... impossible... Vous n'aviez pas besoin de mon aide...? |
| IE6 | "Vous voulez des standards web ouverts ? Trop tard. JE SUIS le web." | Ce réseau ne supportera JAMAIS Firefox. | ActiveX injection détectée ! | Non... Chrome... Firefox... les standards... 95%... perdue... |
| MSN | "Vous êtes CONNECTÉ. Pour toujours." | Tous vos contacts sont en ligne... ET ILS VOUS REGARDENT ! | *NUDGE* *NUDGE* Vous ne pouvez pas m'ignorer ! | Votre statut... passe en... hors ligne... pour toujours... |
| WinUpdate | "Téléchargement : 99%... Redémarrage forcé dans 10 secondes." | Annulation : IMPOSSIBLE. | Mise à jour 1 sur 347... Ne pas éteindre. | Erreur 0x80070005... Restauration... impossible... |
| Norton | "MENACE DÉTECTÉE : Linux.iso. QUARANTAINE PERMANENTE." | TOUT est suspect ! TOUT doit être supprimé ! | Analyse complète en cours... 47 ans restants... | Erreur critique... Votre licence... a expiré... |
| Hub | "Half-duplex. Collisions infinies. Personne ne passe." | Broadcast ! TOUT LE MONDE REÇOIT TOUT ! | COLLISION DÉTECTÉE! Backoff... Retry... | Mes ports... s'éteignent... LEDs... mortes... |
| Bill Gates | "Votre matériel est trop VIEUX pour Windows 11." | Vous êtes PIÉGÉS. | TPM 2.0 non détecté. ACCÈS REFUSÉ. | Non... le monopole... s'effondre... |

### Palettes Couleurs Boss

| Boss | Couleur Principale | Glow | Shape |
|------|-------------------|------|-------|
| Clippy | #C0C0C0 (Gris métal) | #0078D4 (Bleu Windows) | paperclip |
| IE6 | #0078D4 (Bleu IE) | #00A4EF (Cyan clair) | explorer_logo |
| MSN | #7FBA00 (Vert MSN) | #00FF00 (Vert vif) | messenger |
| WinUpdate | #0078D4 (Bleu Windows) | #00BCF2 (Cyan barre) | update_logo |
| Norton | #FFD700 (Jaune Norton) | #FF0000 (Rouge alerte) | norton_shield |
| Hub | #C0C0C0 (Gris hub) | #FF6600 (Orange LEDs) | hub_box |
| Bill Gates P1 | #0078D4 (Bleu Windows) | #FFD700 (Or) | gates_cyborg |
| Bill Gates P2 | #0089D6 (Bleu Azure) | #50E6FF (Cyan cloud) | azure_cloud |

### Bill Gates - Boss Final Dual-Phase

**Phase 1 : Cyborg Hardware Lock** (100% → 40% HP)
- Mouvement: slow_descent → figure_eight
- Attaques: tpm_check, secure_boot, license_check

**Phase 2 : Azure Cloud** (40% → 0% HP)
- Transformation visuelle complète
- Bouclier de 100 HP
- Nouvelles attaques: bgp_hijack, region_lock, subscription_drain
- Quote: "Le matériel est obsolète. Je suis PARTOUT maintenant."

### Structure Config Boss V1.3

```javascript
export const boss_example = {
    id: 'boss_example',
    name: 'NOM',
    name2: 'BOSS',              // Deuxième ligne du nom
    subtitle: 'SOUS-TITRE',
    quote: '"Citation d\'intro"',
    dramaticLine: 'Ligne dramatique !',
    midCombatQuote: 'Quote en combat',
    defeatQuote: 'Quote de défaite...',
    layer: 7,

    health: 25,
    speed: 1.0,
    size: 80,
    points: 3000,

    movement: {
        type: 'pendulum',       // Voir types ci-dessous
        amplitude: 250,
        frequency: 0.002,
        verticalSpeed: 0.3,
        stopAtY: 120
    },

    attacks: [
        {
            name: 'attack_name',
            type: 'projectile_burst',
            cooldown: 1800,
            projectiles: 4,
            spreadAngle: 30,
            projectileSpeed: 4,
            damage: 15,
            projectileColor: '#ff0000'
        }
    ],

    phases: [
        {
            threshold: 0.5,
            speedMultiplier: 1.5,
            attackCooldownMultiplier: 0.8,
            enrageText: 'TEXTE ENRAGE!'
        }
    ],

    color: '#C0C0C0',
    glowColor: '#0078D4',
    shape: 'paperclip',
    portrait: '/images/game/bosses/BOSS_cartoon1.jpg'
};
```

---

## Types d'Attaque V1.7 (23)

| Type | Description | Boss utilisant |
|------|-------------|----------------|
| `projectile_burst` | Salve en éventail | Clippy, WinUpdate, Bill Gates |
| `projectile_aimed` | Tir ciblé joueur | MSN Messenger |
| `projectile_rain` | Pluie de projectiles | IE6, MSN Messenger |
| `projectile_multiply` | Projectiles qui se dupliquent | Hub 10BASE-T |
| `circular_wave` | Vague 360° | Hub 10BASE-T |
| `multi_line_fire` | Lignes de tir multiples | Hub 10BASE-T |
| `sweeping_beam` | Laser balayant | IE6, Bill Gates |
| `screen_flash` | Flash écran + stun | WinUpdate |
| `screen_shake_attack` | Secousse d'écran (NUDGE MSN) | MSN Messenger |
| `slow_field` | Zone de ralentissement | WinUpdate |
| `scan_beam` | Rayon balayage horizontal | Norton |
| `spawn_minions` | Invocation minions | Norton |
| `ground_hazard` | Zone danger au sol | Norton, Bill Gates |
| `help_bubble` | Bulles d'aide homing | Clippy |
| `expanding_ring` | Anneau expansif | - |
| `falling_debris` | Débris tombants | - |
| `homing_projectile` | Projectile à tête chercheuse | - |
| `confusion_field` | Inverse contrôles | - |
| `projectile_redirect` | Projectiles changeant direction | - |
| `projectile_spread` | Tir en éventail large | - |
| `rapid_fire` | Rafale rapide | - |
| `area_drain` | Zone drain HP | - |
| `subscription_drain` | Zone drain style cloud | - |

---

## Types de Mouvement V1.3 (11)

| Type | Description | Boss utilisant |
|------|-------------|----------------|
| `pendulum` | Oscillation horizontale | Clippy |
| `figure_eight` | Mouvement en 8 | (sous-phase Bill Gates) |
| `figure_eight_with_teleport` | Figure 8 + téléportation lag | Internet Explorer |
| `teleport_dash` | Téléportation + dash | Cookie Monster (legacy) |
| `weave` | Serpentin horizontal ⭐ NEW | MSN Messenger |
| `horizontal_sweep` | Balayage gauche-droite ⭐ NEW | WinUpdate, Norton |
| `static_with_shield` | Statique avec bouclier rotatif | Hub 10BASE-T |
| `slow_descent` | Descente lente ⭐ NEW | Bill Gates P1 |
| `multi_phase` | Phases de mouvement enchaînées | Bill Gates |
| `erratic_jump` | Sauts erratiques | ARP Corruptor (legacy) |
| `mirror_player` | Miroir position joueur | IP Masquerader (legacy) |
| `aggressive_chase` | Poursuite agressive | Bill Gates P3 |

---

## State Machine

```
'start'        → Écran démarrage
    ↓
'intro-sage'   → ⭐ Jimmy Wales (dialogue intro + choix pouvoir)
    ↓
'playing'      → Boucle de jeu active
    ↓
'sage-sequence' → ⭐ Après boss (SageScreen → PowerChoiceScreen)
    ↓
'transition'   → Animation entre couches OSI
    ↓
'paused'       → Jeu en pause (ESC)
    ↓
'gameover'     → HP joueur = 0
    ↓
'victory'      → 7 couches complétées
```

---

## Game Loop (NetDefender.js)

```javascript
gameLoop(deltaTime) {
  1. Gestion pause (ESC)
  2. if state === 'playing' → update()
  3. if state === 'intro-sage' ou 'sage-sequence' → updateSageSequence()
  4. if state === 'transition' → updateTransition()
  5. render()
  6. requestAnimationFrame
}

update(deltaTime) {
  1. Slow-mo si actif (0.4x speed)
  2. Update systèmes (particules, grid, shake)
  3. Update joueur (input, collision)
  4. Update PlayerStateManager (pouvoirs passifs)
  5. Update balles joueur (+ multi-shot si actif)
  6. Update WaveManager (ennemis, boss, projectiles)
  7. Update power-ups
  8. checkCollisions() - 6 types
  9. Vérifier wave complete → sage-sequence ou transition
}
```

---

## Configuration (gameConfig.js)

### Joueur

```javascript
PLAYER: {
  WIDTH: 50, HEIGHT: 50,
  SPEED: 7,
  MAX_HEALTH: 100,
  SHOOT_COOLDOWN: 180,
  INVINCIBILITY_DURATION: 1500
}

BULLET: { WIDTH: 6, HEIGHT: 24, SPEED: 14, COLOR: '#00ffff' }
```

### Power-ups

```javascript
POWERUPS: {
  POSITIVE (65%): heal (+25HP), shield (5s), slowmo (4s), rapid_fire (6s)
  NEGATIVE (35%): damage (-20HP), slow (4s 0.5x), reverse (3s controls)
}
```

---

## Dev Tools (prototype-game.html) ⭐ V1.6

### Barre d'Outils Dev

Le fichier `prototype-game.html` inclut une toolbar de développement pour tester rapidement :

```html
<div class="dev-toolbar">
    <button id="btn-skip-intro">Skip Intro</button>
    <button id="btn-reset-score">Reset High Score</button>
    <button id="btn-god-mode">God Mode</button>
    <select id="select-layer">
        <option value="7">L7 - Clippy</option>
        <option value="6">L6 - IE6</option>
        <option value="5">L5 - MSN</option>
        <option value="4">L4 - WinUpdate</option>
        <option value="3">L3 - Norton</option>
        <option value="2">L2 - Hub</option>
        <option value="1">L1 - Bill Gates</option>
    </select>
    <button id="btn-skip-to-boss">Skip to Boss</button>
</div>
```

### Fonctionnalités Dev

| Bouton | Action |
|--------|--------|
| Skip Intro | Passe directement au jeu |
| Reset High Score | Remet le score à 0 |
| God Mode | Invincibilité toggle |
| Select Layer | Choisir le layer cible |
| Skip to Boss | Téléporte au boss avec **progression complète simulée** |

### skipToLayer() - Fonction de test ⭐ V1.6

La fonction `skipToLayer()` simule maintenant une **progression complète** incluant :
1. **Déblocage des couches OSI** - Tous les anneaux concentriques s'affichent
2. **Attribution des pouvoirs** - Un pouvoir aléatoire par sage traversé

```javascript
skipToLayer(targetLayer) {
    // Wave number = 8 - layer (L7 = wave 1, L1 = wave 7)
    const waveNumber = 8 - targetLayer;

    // Clear tout
    this.game.waveManager.enemies = [];
    this.game.waveManager.bossProjectiles = [];
    this.game.bullets = [];

    // ========== SIMULER LA PROGRESSION COMPLÈTE ==========
    const LAYER_DATA = {
        7: { boss: null, sage: null, powers: [] },
        6: { boss: 'boss_clippe', sage: 'sage_jimmy', powers: ['power_wiki_boost', 'power_edit_shield'] },
        5: { boss: 'boss_explorer', sage: 'sage_firefox', powers: ['power_swift_tab', 'power_multi_tab'] },
        4: { boss: 'boss_messenger', sage: 'sage_duo', powers: ['power_streak_freeze', 'power_xp_burst'] },
        3: { boss: 'boss_update', sage: 'sage_tux', powers: ['power_kernel_panic', 'power_sudo_kill'] },
        2: { boss: 'boss_norton', sage: 'sage_anonymous', powers: ['power_ddos_mode', 'power_ghost_mode'] },
        1: { boss: 'boss_hub', sage: 'sage_rpi', powers: ['power_gpio_boost', 'power_overclock'] }
    };

    const psm = window.playerStateManager || null;

    // Simule la défaite de chaque boss traversé
    for (let layer = 6; layer >= targetLayer; layer--) {
        const data = LAYER_DATA[layer];
        if (!data || !data.boss) continue;

        // 1. Débloquer la couche OSI (affiche l'anneau)
        if (this.game.player && this.game.player.onBossDefeated) {
            this.game.player.onBossDefeated(data.boss);
        }

        // 2. Attribuer un pouvoir aléatoire du sage
        if (psm && data.powers && data.powers.length > 0) {
            const randomPower = data.powers[Math.floor(Math.random() * data.powers.length)];
            psm.addPower(randomPower);
        }
    }

    // Démarre la wave cible
    this.game.waveManager.startWave(waveNumber);
}
```

### Résultat Visuel skipToLayer()

| Layer cible | Anneaux affichés | Pouvoirs attribués |
|-------------|------------------|-------------------|
| L7 | 1 (magenta) | 0 |
| L6 | 2 (magenta + orange) | 1 (Jimmy) |
| L5 | 3 (magenta + orange + vert) | 2 (Jimmy + Firefox) |
| L4 | 4 anneaux | 3 pouvoirs |
| L3 | 5 anneaux | 4 pouvoirs |
| L2 | 6 anneaux | 5 pouvoirs |
| L1 | 7 anneaux | 6 pouvoirs |

### Dépendances Dev Tools

| Élément | Exposition | Fichier |
|---------|------------|---------|
| `window.playerStateManager` | Global | NetDefender.js |
| `player.onBossDefeated()` | Méthode Player | Player.js |
| `OSIEvolution` | Module interne | entities/player/OSIEvolution.js |

---

## Workflow Vibe Coding V1.3

| Tâche | Fichier(s) | Lignes |
|-------|------------|--------|
| Modifier stats boss | `bosses/configs/boss_*.js` | 60-100 |
| Ajuster une attaque | `bosses/attacks/*.js` | 19-50 |
| Ajouter un boss | Créer config + `bosses/index.js` | ~90 |
| Nouveau mouvement | `BossBehaviorController.js` | ~760 |
| Équilibrage global | `config/gameConfig.js` | ~300 |
| Modifier dialogue sage | `sages/configs/sage_*.js` | ~28 |
| Ajouter un pouvoir | `sages/powers/power_*.js` | ~24 |
| Modifier BossIntro | `screens/BossIntro.js` | ~664 |
| Test rapide boss | `prototype-game.html` Skip to Boss | - |

---

## Contrôles

```text
Clavier: ZQSD/Arrows (move), Space (fire), ESC (pause), Enter (skip)
Souris:  Click gauche (fire)
Tactile: Drag (move), tap (fire)
```

---

## Palette Couleurs V1.3

```javascript
PORTFOLIO_COLORS: {
  neonCyan: '#00ffff',
  neonMagenta: '#ff0080',
  neonGreen: '#00ff88',
  bgDark: '#0a0a0a',
  starWarsYellow: '#FFE81F'
}

// Couleurs des boss (Reliques Microsoft)
BOSS_COLORS: {
  clippy: '#C0C0C0',      // Gris métal
  explorer: '#0078D4',    // Bleu IE
  messenger: '#7FBA00',   // Vert MSN
  update: '#0078D4',      // Bleu Windows
  norton: '#FFD700',      // Jaune Norton
  hub: '#C0C0C0',         // Gris hub
  gates_p1: '#0078D4',    // Bleu Windows
  gates_p2: '#0089D6'     // Bleu Azure
}

// Couleurs des sages
SAGE_COLORS: {
  jimmy: '#4CAF50',       // Vert Wikipédia
  firefox: '#FF6611',     // Orange Firefox
  duo: '#58CC02',         // Vert Duolingo
  tux: '#F5A623',         // Jaune Tux
  anonymous: '#00FF00',   // Vert Matrix
  rpi: '#C51A4A',         // Rouge Raspberry
  linus: '#F05032'        // Orange Git
}
```

---

## Outils MCP (v2.4.0)

### Sages & Pouvoirs

```bash
list_sages                    # 7 sages avec stats
get_sage "jimmy"              # Config complète
create_sage                   # Nouveau sage
update_sage                   # Modifier sage
delete_sage                   # Supprimer sage

list_powers                   # 14 pouvoirs
get_power "wiki_boost"        # Config complète
list_power_effect_types       # Types d'effets disponibles
create_power                  # Nouveau pouvoir
update_power                  # Modifier pouvoir
delete_power                  # Supprimer pouvoir
link_power_to_sage            # Lier pouvoir à sage

validate_sages_integrity      # Vérifier cohérence
simulate_power_combos         # 128 combinaisons
```

### Boss & Attaques

```bash
list_bosses                   # 7 boss actifs
get_boss "messenger"          # Config complète
update_boss                   # Modifier boss
create_boss                   # Nouveau boss

list_attacks                  # 23 types
get_attack "projectile_burst" # Détails
list_movements                # 11 types de mouvement
```

### Behaviors (v2.4.0) ⭐ NEW

```bash
list_behaviors                # 4 behaviors disponibles
get_behavior "sticky_assistant" # Config complète
add_behavior_to_boss          # Ajouter behavior à boss
update_boss_behavior          # Modifier behavior
remove_behavior_from_boss     # Supprimer behavior
```

**Behaviors disponibles** :
| Type | Boss | Description |
|------|------|-------------|
| `sticky_assistant` | Clippy | Se colle au joueur (distance < 150px) |
| `go_offline` | Messenger | Disparition temporaire (40% HP) |
| `progress_bar` | Update | Invincibilité + compte à rebours |
| `quarantine` | Norton | Capture joueur dans bulle |

---

## Changelog V1.7

### Behaviors System (V1.7) ⭐ NEW

- **Nouveau module `bosses/behaviors/`** : 5 fichiers (index + 4 behaviors)
- **sticky_assistant** : Clippy se colle au joueur quand proche
- **go_offline** : Messenger disparaît temporairement
- **progress_bar** : Update devient invincible avec compte à rebours
- **quarantine** : Norton capture le joueur dans une bulle
- **8 nouvelles attaques** : help_bubble, screen_shake_attack, slow_field, scan_beam, projectile_multiply, multi_line_fire, projectile_redirect, subscription_drain
- **Sages corrigés** : sage_duo = Edward Snowden & Julian Assange (Les Lanceurs d'Alerte)
- **MCP v2.4.0** : 5 nouveaux outils behaviors

### Dev Tools Fix (V1.6)

- **skipToLayer() corrigé** : Simule maintenant la progression complète
- **Déblocage OSI automatique** : Tous les anneaux s'affichent selon le layer cible
- **Attribution pouvoirs** : Un pouvoir aléatoire par sage traversé
- **window.playerStateManager** : Exposé globalement dans NetDefender.js
- **OSIEvolution refactorisé** : Constantes inlinées (plus d'import circulaire)
- **Nettoyage logs debug** : Suppression des console.log de développement

### HUD OSI Stack (V1.5)

- **Nouveau module `ui/`** : 6 fichiers modulaires (~800 lignes)
- **OSIStackConfig.js** : Couleurs arc-en-ciel, HP symétrique, positions
- **OSIStackState.js** : Gestion HP avec split 50/50 header/trailer
- **OSIStackRenderer.js** : Rendu Canvas avec gradients (pattern PowerBadgeRenderer)
- **OSIStackAnimations.js** : Flash rouge, explosion, unlock, flicker critique
- **OSIStackHUD.js** : Coordinateur orchestrant tous les modules
- **Intégration NetDefender.js** : Remplace `player.takeDamage()` par `osiStackHUD.handleDamage()`
- **Progression automatique** : Couches débloquées via `addLayer(bossId)` après chaque boss

### Nouveaux Boss (5) - V1.3

- `boss_messenger` - MSN Messenger (L5) avec mouvement `weave`
- `boss_update` - Windows Update (L4) avec mouvement `horizontal_sweep`
- `boss_norton` - Norton Antivirus (L3) avec mouvement `horizontal_sweep`
- `boss_hub` - Hub 10BASE-T (L2) avec mouvement `static_with_shield`
- `boss_gates` - Bill Gates dual-phase (L1) avec mouvement `multi_phase`

### Nouveaux Mouvements (3)

- `weave` - Serpentin horizontal (MSN)
- `horizontal_sweep` - Balayage gauche-droite (Norton, WinUpdate)
- `slow_descent` - Descente lente (Bill Gates P1)

### Nouveaux Types d'Attaque

- `screen_shake_attack` - Secousse d'écran (MSN)
- `slow_field` - Zone de ralentissement (WinUpdate)
- `global_slow` - Ralentissement global (Norton)
- `spawn_clones` - Spawn de clones (Norton)
- `projectile_multiply` - Projectiles qui se dupliquent (Hub)
- `multi_line_fire` - Lignes de tir multiples (Hub)
- `projectile_redirect` - Projectiles changeant direction (Gates P2)
- `zone_restrict` - Zones restrictives (Gates P2)
- `hp_drain` - Drain HP continu (Gates P2)

### Dev Tools

- Ajout toolbar dev dans `prototype-game.html`
- Sélecteur de layer (L7 → L1)
- Bouton "Skip to Boss" pour test rapide
- God Mode toggle

### Fixes

- BossIntro affiche maintenant les portraits correctement
- Correction du chemin portrait MSN (`MESSENGER_cartoon1.jpg`)
- Fix InputHandler - Enter/Escape non reset sur keyup
- Fix WaveManager - waveActive reste true après spawn boss

---

## Documentation Prototype NetDefender V1.5 OSI Stack HUD

Mise à jour : 2026-01-09
