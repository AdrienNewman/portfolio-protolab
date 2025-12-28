---
title: "NetDefender - Référence Technique du Mini-Jeu"
description: "Documentation complète du jeu NetDefender : architecture modulaire, système OSI, boss uniques, transitions narratives et personnalisation"
category: web-front
date: 2025-12-28
tags:
  - javascript
  - game
  - canvas
  - threejs
  - easter-egg
  - osi
  - boss-system
  - narrative
author: Adrien Mercadier
difficulty: intermediate
featured: true
---

# NetDefender - Référence Technique du Mini-Jeu

NetDefender est un mini-jeu arcade éducatif intégré au portfolio sous forme d'easter egg. Il représente les 7 couches du modèle OSI à travers un shooter vertical où le joueur défend un réseau contre des cybermenaces thématiques.

## Concept et Accès

### Easter Egg - Paquet Flottant

**Important** : Le jeu est accessible via un easter egg discret. Un paquet réseau 3D flotte parmi les particules du fond Three.js du portfolio.

**Configuration** : Le paquet est visible sur toutes les pages utilisant le `BaseLayout.astro`.

Pour accéder au jeu :
1. Observer le fond animé du portfolio (particules cyan)
2. Repérer le cube cyan lumineux qui flotte et pulse
3. Cliquer dessus pour lancer NetDefender en plein écran

### Thème Éducatif OSI

Le jeu est structuré autour des 7 couches du modèle OSI :

| Vague | Couche | Couleur | Exemples d'ennemis |
|-------|--------|---------|-------------------|
| 1 | APPLICATION (L7) | Magenta | SQL Injection, XSS, CSRF |
| 2 | PRESENTATION (L6) | Magenta | SSL Stripper, Ransomware |
| 3 | SESSION (L5) | Vert | Session Hijacker, Token Thief |
| 4 | TRANSPORT (L4) | Vert | SYN Flood, UDP Flood |
| 5 | NETWORK (L3) | Cyan | IP Spoofer, Ping of Death |
| 6 | DATA LINK (L2) | Jaune | ARP Spoofer, MAC Flooder |
| 7 | PHYSICAL (L1) | Jaune | Cable Cutter, EM Jammer |

## Architecture des Fichiers

### Structure Modulaire

```
public/scripts/game/
├── NetDefender.js              # Orchestrateur principal
├── config/
│   └── gameConfig.js           # Configuration (couleurs, ennemis, power-ups)
├── entities/
│   ├── Player.js               # Vaisseau joueur
│   ├── Enemy.js                # Ennemis (28 types)
│   ├── Bullet.js               # Projectiles joueur
│   ├── BossProjectile.js       # Projectiles des boss (NEW V4.4)
│   └── PowerUp.js              # Bonus/malus
├── systems/
│   ├── InputHandler.js         # Clavier, souris, tactile
│   ├── ParticleSystem.js       # Explosions style portfolio
│   ├── WaveManager.js          # Gestion des 7 vagues
│   └── AudioManager.js         # Effets sonores
├── behaviors/
│   └── bossBehaviors.js        # 7 comportements uniques de boss (NEW V4.4)
├── screens/
│   ├── TransitionScreen.js     # Écran inter-vagues narratif (NEW V4.4)
│   └── BossIntro.js            # Introduction dramatique des boss (NEW V4.4)
├── content/
│   └── narrativeContent.js     # Contenu narratif localisé FR (NEW V4.4)
├── intro/
│   └── IntroSequence.js        # Séquence cinématique d'intro
└── effects/
    ├── GridBackground.js       # Grille 30px animée
    └── ScreenShake.js          # Tremblement sur dégâts
```

### Composants Astro

```
src/components/game/
└── GameOverlay.astro           # Interface complète (HUD, écrans, canvas)
```

## Configuration du Jeu

### Paramètres Principaux

**Configuration** : Tous les paramètres sont centralisés dans `gameConfig.js`.

```javascript:public/scripts/game/config/gameConfig.js
export const CONFIG = {
    FPS: 60,
    PLAYER: {
        WIDTH: 50,
        HEIGHT: 50,
        SPEED: 7,
        MAX_HEALTH: 100,
        SHOOT_COOLDOWN: 180,        // ms entre chaque tir
        INVINCIBILITY_DURATION: 1500 // ms après dégâts
    },
    BULLET: {
        WIDTH: 6,
        HEIGHT: 24,
        SPEED: 14,
        COLOR: '#00ffff'
    },
    GRID_SIZE: 30,                  // Grille style portfolio
    PARTICLE_COUNT: 20              // Particules par explosion
};
```

### Palette de Couleurs OSI

```javascript
export const OSI_COLORS = {
    7: { name: 'APPLICATION',  color: '#ff0080', glow: 'rgba(255, 0, 128, 0.5)' },
    6: { name: 'PRESENTATION', color: '#ff0080', glow: 'rgba(255, 0, 128, 0.4)' },
    5: { name: 'SESSION',      color: '#00ff88', glow: 'rgba(0, 255, 136, 0.5)' },
    4: { name: 'TRANSPORT',    color: '#00ff88', glow: 'rgba(0, 255, 136, 0.4)' },
    3: { name: 'NETWORK',      color: '#00ffff', glow: 'rgba(0, 255, 255, 0.5)' },
    2: { name: 'DATA LINK',    color: '#ffff00', glow: 'rgba(255, 255, 0, 0.5)' },
    1: { name: 'PHYSICAL',     color: '#ffff00', glow: 'rgba(255, 255, 0, 0.4)' }
};
```

## Système d'Ennemis

### Types de Comportements

Chaque ennemi possède un comportement de mouvement unique :

| Behavior | Description |
|----------|-------------|
| `zigzag` | Mouvement en zigzag horizontal |
| `fast` | Descente rapide en ligne droite |
| `diagonal` | Mouvement diagonal rebondissant |
| `boss` | Lent avec mouvements sinusoïdaux |
| `swarm` | Rapide, apparaît en groupes |
| `phase` | Téléportation périodique |
| `teleport` | Téléportation aléatoire |
| `heavy` | Lent mais résistant |
| `slow_tank` | Très lent, très résistant |
| `erratic` | Mouvement imprévisible |
| `wave` | Mouvement ondulatoire |

## Système de Boss (V4.4)

### 7 Boss Uniques par Couche OSI

Chaque couche OSI possède un boss avec un comportement de combat unique et des projectiles spéciaux.

| Couche | Boss ID | Nom | Attaque Principale |
|--------|---------|-----|-------------------|
| L7 | `boss_injection` | Bobby "DROP TABLE" Thompson | Requêtes SQL corrompues |
| L6 | `boss_heartbleed` | Ivan "Heartbleed" Volkov | Mur de données volées |
| L5 | `boss_cookie_theft` | Émilie "Session Stealer" Dupont | Cookies volés |
| L4 | `boss_syn_flood` | Le Général SYN | Tempête SYN_FLOOD |
| L3 | `boss_ip_masquerade` | Fantôme du Réseau | Clones IP masqués |
| L2 | `boss_arp_flood` | Le Corrupteur de Frames | Inondation ARP |
| L1 | `boss_guardian` | Gardien du Réseau | Pulse électromagnétique |

### Comportements de Combat

Chaque boss possède un système de phases avec des patterns d'attaque uniques :

```javascript
// Exemple : Bobby "DROP TABLE" (L7)
{
    behavior: 'boss_injection',
    phases: [
        { threshold: 100%, pattern: 'zigzag + single shot' },
        { threshold: 75%, pattern: 'burst of 3 queries' },
        { threshold: 50%, pattern: 'spread attack (5 projectiles)' },
        { threshold: 25%, pattern: 'chain attack (rapid fire)' }
    ]
}
```

### Projectiles de Boss (`BossProjectile.js`)

Les boss utilisent des projectiles visuellement distincts avec des couleurs thématiques :

| Propriété | Valeur |
|-----------|--------|
| Taille | 8-12px (selon type) |
| Couleur | Couleur du boss avec glow |
| Vitesse | 3-8 (selon phase) |
| Dégâts | 10-25 HP |

### Définition d'un Comportement de Boss

```javascript
// Dans bossBehaviors.js
export function updateBoss_injection(boss, deltaTime, gameState) {
    // Phase detection
    const healthPercent = boss.health / boss.maxHealth;

    // Movement pattern
    boss.x += Math.sin(boss.timer * 0.003) * 2;

    // Shooting pattern (based on phase)
    if (healthPercent > 0.75) {
        // Phase 1: Tir simple
        shootSingleProjectile(boss);
    } else if (healthPercent > 0.5) {
        // Phase 2: Burst de 3
        shootBurst(boss, 3);
    }
    // ...
}
```

## Système de Transitions Narratives (V4.4)

### TransitionScreen

Écran inter-vagues avec effets polish et contenu narratif riche.

**Phases d'animation :**
```
idle → fadein → typing → stats → waiting → fadeout
```

**Effets visuels :**
- Effet typewriter sur le texte
- Scanlines CRT animées
- Border glow pulsant
- Glitch occasionnel (RGB split)
- Compteurs de stats animés

**Contenu affiché :**
- Message de succès de la couche terminée
- Briefing sur la prochaine menace
- Tip éducatif OSI
- Statistiques de la vague (ennemis, précision, bonus)

### BossIntro

Introduction dramatique avant l'apparition d'un boss.

**Phases d'animation :**
```
idle → flash → siren → glitch → typewriter → hold → fadeout
```

**Effets visuels :**
- Flash rouge intense
- Bandes warning animées
- Screen shake
- RGB split + slices horizontales
- Citation du boss avec typewriter
- Barre de menace animée

### Contenu Narratif (`narrativeContent.js`)

Fichier centralisé contenant :
- 7 introductions de boss (nom, titre, citation, capacité)
- 7 transitions inter-couches (succès, briefing, menace, tip)
- Descriptions des couches OSI
- Tips éducatifs

```javascript
// Exemple de transition
{
    from: 7, to: 6,
    successMessage: 'Couche APPLICATION - SÉCURISÉE',
    briefing: 'Initialisation défense PRESENTATION...',
    threat: 'Menaces de chiffrement détectées',
    tip: 'La couche Présentation gère le chiffrement SSL/TLS'
}

// Exemple de boss intro
{
    bossId: 'boss_injection',
    name: 'Bobby "DROP TABLE" Thompson',
    title: 'MAÎTRE DE L\'INJECTION SQL',
    quote: 'Ma mère m\'a appelé Robert\'); DROP TABLE--',
    threatLevel: 'CRITIQUE'
}
```

### Définition d'un Ennemi

```javascript
{
    type: 'sql_injection',      // Identifiant unique
    name: 'SQL Injection',      // Nom affiché
    health: 2,                  // Points de vie
    speed: 2.0,                 // Vitesse de déplacement
    points: 100,                // Score à la destruction
    behavior: 'zigzag',         // Type de mouvement
    size: 35                    // Taille en pixels
}
```

### Ajout d'un Nouvel Ennemi

**Note** : Pour ajouter un ennemi, modifiez le tableau `enemies` de la couche correspondante dans `OSI_LAYERS`.

```javascript
// Exemple : ajouter un ennemi à la couche APPLICATION
{
    type: 'api_abuse',
    name: 'API Abuse',
    health: 3,
    speed: 2.5,
    points: 150,
    behavior: 'diagonal',
    size: 32
}
```

## Système de Power-ups

### Power-ups Positifs

| Type | Nom | Effet | Durée |
|------|-----|-------|-------|
| `heal` | Patch Tuesday | +25 HP | Instant |
| `shield` | VPN Shield | Invincibilité | 5s |
| `slowmo` | Rate Limiter | Ralentit les ennemis | 4s |
| `rapid_fire` | Firewall Boost | Tir rapide | 6s |

### Power-ups Négatifs

| Type | Nom | Effet | Durée |
|------|-----|-------|-------|
| `damage` | Malware | -20 HP | Instant |
| `slow` | DDoS | Ralentit le joueur | 4s |
| `reverse` | Corrupted Packet | Inverse les contrôles | 3s |

### Structure d'un Power-up

```javascript
{
    type: 'shield',
    name: 'VPN Shield',
    color: '#00ffff',
    glow: 'rgba(0, 255, 255, 0.6)',
    icon: '◆',
    value: 0,           // Pour heal/damage
    duration: 5000      // ms, 0 = effet instantané
}
```

## Intégration Three.js

### Easter Egg - Paquet Flottant

**Diagnostic** : Le fichier `floating-packet.js` crée un overlay Three.js indépendant pour le paquet cliquable.

```javascript:public/scripts/floating-packet.js
// Création du paquet 3D
function createPacket() {
    packetGroup = new THREE.Group();

    // Cube principal
    const coreGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.08);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    packetGroup.add(core);

    // Wireframe overlay
    const wireframe = new THREE.Mesh(wireGeometry, wireMaterial);
    packetGroup.add(wireframe);

    // Glow sprite
    const glow = new THREE.Sprite(glowMaterial);
    packetGroup.add(glow);

    return packetGroup;
}
```

### Détection de Clic (Raycasting)

```javascript
canvas.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(packetGroup.children, true);

    if (intersects.length > 0) {
        window.openNetDefender();  // Lance le jeu
    }
});
```

## Contrôles

### Clavier

| Touche | Action |
|--------|--------|
| ← / A | Déplacer à gauche |
| → / D | Déplacer à droite |
| Espace | Tirer |
| Échap | Fermer le jeu / Pause |
| P | Pause |

### Souris

- **Mouvement horizontal** : Déplace le vaisseau
- **Clic gauche** : Tir

### Tactile (Mobile)

- **Bouton ←** : Gauche
- **Bouton →** : Droite
- **Bouton FIRE** : Tir
- **Bouton ✕** : Fermer

## Interface (HUD)

### Éléments Affichés

L'interface reprend le style visuel du portfolio :

- **Vague actuelle** : Numéro et nom de la couche OSI
- **Score** : Points accumulés
- **Santé** : Barre de vie avec pourcentage
- **High Score** : Meilleur score (localStorage)
- **Contrôles** : Rappel des touches

### Notifications Power-up

**Configuration** : Les power-ups déclenchent une notification temporaire avec le nom et l'effet.

## Persistance

### High Score

Le meilleur score est sauvegardé dans le localStorage du navigateur :

```javascript
// Clé utilisée
localStorage.setItem('netdefender_highscore', score);

// Récupération
const highScore = localStorage.getItem('netdefender_highscore') || 0;
```

## Personnalisation

### Modifier les Couleurs

Éditez `PORTFOLIO_COLORS` et `OSI_COLORS` dans `gameConfig.js` pour adapter la palette.

### Modifier la Difficulté

Ajustez les paramètres suivants par couche :
- `spawnCount` : Nombre d'ennemis par vague
- `spawnDelay` : Délai entre chaque spawn (ms)
- `speed` et `health` des ennemis individuels

### Ajouter une Couche

**Attention** : Le jeu est conçu pour 7 couches OSI. Ajouter des couches nécessite de modifier le `WaveManager` et l'affichage de progression.

## Intégration au Layout

### BaseLayout.astro

```astro:src/layouts/BaseLayout.astro
---
import GameOverlay from '../components/game/GameOverlay.astro';
---

<body>
    <!-- ... contenu ... -->

    <!-- NetDefender Game Overlay (Easter Egg) -->
    <GameOverlay />

    <!-- Easter Egg - Floating Packet -->
    <script is:inline src="/scripts/floating-packet.js"></script>
</body>
```

## Dépannage

### Le paquet flottant n'apparaît pas

**Symptôme** : Le cube cyan n'est pas visible sur le fond.

**Solution** : Vérifiez que :
1. Three.js (r128) est chargé via CDN
2. Le script `floating-packet.js` est inclus dans le layout
3. La console ne montre pas d'erreurs JavaScript

### Le jeu ne se lance pas au clic

**Symptôme** : Clic sur le paquet sans réaction.

**Cause** : La fonction `window.openNetDefender` n'est pas définie.

**Solution** : Vérifiez que `GameOverlay.astro` est inclus dans le layout et que son script inline est exécuté.

### Performance dégradée

**Symptôme** : FPS faible pendant le jeu.

**Solution** :
- Réduire `PARTICLE_COUNT` dans la config
- Réduire `spawnCount` des vagues
- Désactiver les effets de glow sur mobile

---

## Ressources

- [Three.js Documentation](https://threejs.org/docs/)
- [Canvas API MDN](https://developer.mozilla.org/fr/docs/Web/API/Canvas_API)
- [Modèle OSI - Wikipedia](https://fr.wikipedia.org/wiki/Mod%C3%A8le_OSI)
