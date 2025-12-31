# 🔷 TESSERACT HERO - Rapport de Brainstorming & Spécifications

**Date** : 30 décembre 2025  
**Projet** : Portfolio Protolab - Animation Hero  
**Auteur** : Adrien Mercadier  
**Version** : 1.0  

---

## 📋 TABLE DES MATIÈRES

1. [Vision & Concept](#1-vision--concept)
2. [Narration & Métaphore](#2-narration--métaphore)
3. [Référence Visuelle - Vates.tech](#3-référence-visuelle---vatestech)
4. [Spécifications Techniques](#4-spécifications-techniques)
5. [Timeline d'Animation](#5-timeline-danimation)
6. [Stack Technologique](#6-stack-technologique)
7. [Structure du Prototype](#7-structure-du-prototype)
8. [Critères de Qualité](#8-critères-de-qualité)
9. [Prompt Claude Code](#9-prompt-claude-code)

---

## 1. VISION & CONCEPT

### 1.1 L'Idée Centrale

Créer une animation d'introduction Hero basée sur un **Tesseract** (hypercube/cube cosmique style Marvel) qui incarne visuellement l'identité professionnelle d'Adrien Mercadier en tant que Technicien Supérieur Systèmes et Réseaux.

### 1.2 Le Tesseract

- **Forme** : Cube dans cube (wireframe) - structure hypercube 4D projetée en 3D
- **Taille** : Compact, donnant l'impression de tenir dans la main
- **Couleur principale** : Cyan (#00ffff / #00d4ff)
- **Couleur secondaire** : Magenta (#ff0080) - accent énergétique
- **Core** : Sphère blanche lumineuse au centre, source d'énergie
- **Halos** : Couches de glow concentriques (cyan + magenta) qui pulsent

### 1.3 Comportement Clé

Le cube **flotte de manière instable** - pas une rotation parfaite et lisse, mais un mouvement qui trahit une **énergie brute difficile à contenir**. Cette instabilité est intentionnelle et narrative.

---

## 2. NARRATION & MÉTAPHORE

### 2.1 La Triple Métaphore

Le Tesseract représente simultanément trois concepts interconnectés :

```
┌─────────────────────────────────────────────────────────────────┐
│                         LE TESSERACT                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  NIVEAU 1 - PERSONNEL                                          │
│  └─ Adrien lui-même                                            │
│     • Potentiel brut, énergie créative                         │
│     • En construction, en apprentissage                        │
│     • "Je suis instable mais ça envoie"                        │
│                                                                 │
│  NIVEAU 2 - TECHNIQUE (TSSR)                                   │
│  └─ Un serveur / Une infrastructure                            │
│     • Briques assemblées prêtes à déployer                     │
│     • Puissance disponible mais maintenance constante          │
│     • Stabilité qui se mérite                                  │
│                                                                 │
│  NIVEAU 3 - VISUEL                                             │
│     • Artefact cosmique, source de puissance                   │
│     • Énergie qui pulse, qui vit                               │
│     • Beauté dans l'instabilité contrôlée                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Le Message au Recruteur

> "Ce que vous voyez là, c'est moi. C'est aussi ce que je gère au quotidien. Je comprends que l'infrastructure c'est vivant, que ça demande de l'attention, que la stabilité se mérite."

### 2.3 La Connexion Cube → Nom

Le Tesseract **canalise son énergie vers le nom** "ADRIEN MERCADIER" affiché en dessous :

- **Lien constant** : Un flux d'énergie subtil relie le cube au nom (canalisation passive)
- **Arcs plasma intermittents** : Par moments, une décharge électrique frappe le nom
- **Absorption** : Le nom "absorbe" cette énergie avec un effet d'électrocution visuelle
- **Symbolique** : L'énergie brute du cube est transformée en quelque chose d'utile (le nom, l'identité, la compétence)

---

## 3. RÉFÉRENCE VISUELLE - VATES.TECH

### 3.1 Éléments à S'inspirer

Site de référence : https://vates.tech/en/

**Animation Hero Vates analysée :**

| Élément | Description | Adaptation Tesseract |
|---------|-------------|----------------------|
| **Planète 3D** | Sphère avec texture, rotation fluide | → Cube wireframe avec core lumineux |
| **Anneau orbital** | Tourne autour de la planète | → Cube externe qui encadre le cube interne |
| **Entrée par le haut** | La planète descend avec fade-in + scale | → Le Tesseract descend et grandit |
| **Glow/Halo** | Lueur diffuse autour de l'objet | → Halos concentriques cyan/magenta |
| **Logo en dessous** | "VATES" apparaît sous la planète | → "ADRIEN MERCADIER" apparaît |
| **Particules de fond** | Étoiles qui dérivent lentement | → Particules cyan/magenta en sphère |
| **Mouvement subtil** | Léger flottement, jamais statique | → Wobble instable multi-fréquences |

### 3.2 Ce Qu'on Garde de Vates

- ✅ L'entrée par le haut (descente fluide)
- ✅ Le scale progressif (petit → taille finale)
- ✅ Le glow/halo autour de l'objet central
- ✅ Le nom qui apparaît en dessous avec la même lueur
- ✅ Les particules de fond
- ✅ Le mouvement perpétuel subtil

### 3.3 Ce Qu'on Différencie

- ❌ Pas de planète → **Cube géométrique**
- ❌ Pas de rotation parfaite → **Wobble instable**
- ❌ Pas statique → **Énergie qui pulse, halos qui bougent indépendamment**
- ❌ Pas déconnecté → **Arc plasma vers le nom**
- ➕ Ajout de la **connexion énergétique** cube → nom

---

## 4. SPÉCIFICATIONS TECHNIQUES

### 4.1 Géométrie du Tesseract

```
STRUCTURE
═════════

        ┌─────────────────┐
       ╱│                ╱│
      ╱ │     OUTER     ╱ │    Cube externe : wireframe cyan
     ┌─────────────────┐  │    Taille : ~0.55 unités
     │  │              │  │
     │  │  ┌───────┐   │  │
     │  │  │ INNER │   │  │    Cube interne : wireframe cyan bright
     │  │  │   ◆   │   │  │    Taille : ~0.22 unités
     │  │  │ CORE  │   │  │    Rotation indépendante
     │  │  └───────┘   │  │
     │  │              │  │    Core : Sphère blanche r=0.035
     │  └──────────────│──┘    + Halos concentriques
     │ ╱               │ ╱
     │╱                │╱
     └─────────────────┘

HALOS (du centre vers l'extérieur)
══════════════════════════════════
1. Core      : Sphère blanche, opacity 0.7-1.0
2. Halo 1    : Cyan #00ffff, r=0.08, opacity 0.4-0.7
3. Halo 2    : Magenta #ff0080, r=0.14, opacity 0.15-0.25
4. Halo 3    : Cyan diffus, r=0.25, opacity 0.08-0.12
```

### 4.2 Palette de Couleurs

```css
:root {
    /* Couleurs principales */
    --cyan: #00ffff;
    --cyan-dark: #00d4ff;
    --magenta: #ff0080;
    --green: #00ff88;
    --white: #ffffff;
    
    /* Background */
    --bg-dark: #0a0a0a;
    --bg-black: #000000;
    
    /* Glow values (pour Three.js) */
    --cyan-hex: 0x00ffff;
    --magenta-hex: 0xff0080;
    --white-hex: 0xffffff;
}
```

### 4.3 Comportements d'Instabilité

```javascript
// FLOTTEMENT POSITION (le cube bouge dans l'espace)
position.x = sin(time * 0.9) * 0.02 + sin(time * 2.3) * 0.008;
position.y = cos(time * 0.7) * 0.015 + cos(time * 1.9) * 0.006;
position.z = sin(time * 1.1) * 0.01;

// WOBBLE ROTATION (multi-fréquences pour effet organique)
rotation.x = sin(time * 0.8) * 0.06 + sin(time * 2.1) * 0.025 + sin(time * 3.7) * 0.012;
rotation.z = cos(time * 0.6) * 0.06 + cos(time * 1.8) * 0.025 + cos(time * 3.2) * 0.012;

// HEARTBEAT IRRÉGULIER (scale du core)
scale = 1 + sin(time * 2.5) * 0.12 + sin(time * 5.5) * 0.05 + sin(time * 8) * 0.025;

// HALOS INDÉPENDANTS (chaque halo a son propre mouvement)
halo1.position.x = sin(time * 3) * 0.01;
halo2.position.x = cos(time * 2.7) * 0.015;
// etc.
```

### 4.4 Nom "ADRIEN MERCADIER"

```css
.name-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2.5rem;
    letter-spacing: 0.35em;
    color: #ffffff;
    
    /* Glow constant (canalisation passive) */
    text-shadow: 
        0 0 8px rgba(0, 255, 255, 0.4),
        0 0 20px rgba(0, 255, 255, 0.2),
        0 0 40px rgba(255, 0, 128, 0.1);
    
    /* Pulsation subtile permanente */
    animation: nameGlow 3s ease-in-out infinite;
}

/* Effet électrocution lors des arcs */
.name-text.electrified {
    animation: electrify 0.35s ease-out;
    /* Flash intense + tremblement + scale */
}
```

---

## 5. TIMELINE D'ANIMATION

### 5.1 Séquence Complète

```
TEMPS    0s      2s       3.5s     4.5s      ∞
         │       │        │        │         │
         ▼       ▼        ▼        ▼         ▼
      
      [EMERGE][AWAKEN][STABILIZE][LEVITATION]
         │       │        │            │
         ▼       ▼        ▼            ▼
      Descente  Core    Nom        Flottement
      + Scale   s'allume apparaît   instable
                                   + Arcs plasma
```

### 5.2 Détail des Phases

| Phase | Durée | Actions |
|-------|-------|---------|
| **EMERGE** | 0 → 2s | Cube descend depuis y=1.8, scale 0.1→1, rotation d'arrivée, wireframes apparaissent |
| **AWAKEN** | 2 → 3.5s | Core s'illumine pleinement, halos apparaissent, pulse d'éveil, début instabilité |
| **STABILIZE** | 3.5 → 4.5s | Le nom apparaît (fade-in + blur), lien d'énergie s'active, instabilité augmente |
| **LEVITATION** | 4.5s → ∞ | Flottement instable continu, rotation Y lente, wobble multi-fréquences, arcs plasma aléatoires (~toutes les 3-6s), heartbeat du core |

### 5.3 Easing Functions

```javascript
// Descente fluide
easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

// Éveil progressif
easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

// Rebond élastique (si besoin pour snap)
elasticOut(t) { 
    return Math.sin(-13 * (t + 1) * Math.PI / 2) * Math.pow(2, -10 * t) + 1; 
}
```

---

## 6. STACK TECHNOLOGIQUE

### 6.1 Technologies Requises

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Three.js** | r128+ | Rendu 3D WebGL |
| **Vanilla JS** | ES6+ | Logique d'animation |
| **CSS3** | - | Styles, animations texte, SVG filters |
| **SVG** | - | Arcs plasma avec filtres glow |
| **HTML5** | - | Structure |

### 6.2 CDN Recommandés

```html
<!-- Three.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono&display=swap" rel="stylesheet">

<!-- Optionnel: GSAP pour animations complexes -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
```

### 6.3 Optimisations Performance

```javascript
// Limiter le pixel ratio pour mobile
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Géométries low-poly pour les halos
new THREE.SphereGeometry(radius, 16, 16); // Pas besoin de 32 segments

// Blending additif pour les effets lumineux
material.blending = THREE.AdditiveBlending;

// RAF throttling si besoin
let lastTime = 0;
function animate(currentTime) {
    if (currentTime - lastTime < 16) return; // ~60fps max
    lastTime = currentTime;
    // ...
}
```

### 6.4 Techniques Avancées pour Qualité Pro

```javascript
// 1. POST-PROCESSING (optionnel mais WOW effect)
// UnrealBloomPass pour glow réaliste
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

// 2. CUSTOM SHADERS pour le core
const coreShader = {
    vertexShader: `...`,
    fragmentShader: `
        // Fresnel effect pour glow réaliste
        // Noise pour variation organique
    `
};

// 3. INSTANCED MESH pour particules performantes
const instancedMesh = new THREE.InstancedMesh(geometry, material, count);

// 4. LERP pour transitions fluides
value = THREE.MathUtils.lerp(value, target, 0.05);
```

---

## 7. STRUCTURE DU PROTOTYPE

### 7.1 Arborescence

```
portefolio V3/
├── src/                          # Code Astro actuel (NE PAS TOUCHER)
├── public/                       # Assets actuels
├── prototypes/                   # NOUVEAU - Dossier isolé
│   └── tesseract-hero/
│       ├── index.html            # Page standalone complète
│       ├── css/
│       │   └── style.css         # Styles isolés
│       ├── js/
│       │   ├── tesseract.js      # Classe principale Three.js
│       │   ├── particles.js      # Système de particules
│       │   ├── plasma-arc.js     # Gestion des arcs SVG
│       │   └── utils.js          # Helpers (easing, math)
│       ├── assets/
│       │   └── (textures si besoin)
│       └── README.md             # Documentation du prototype
└── Documentation Porte Folio/
    └── TESSERACT_BRAINSTORM.md   # Ce document
```

### 7.2 Principe d'Isolation

- ✅ **Aucune dépendance Astro** - Le prototype fonctionne seul
- ✅ **CDN uniquement** - Pas de npm install dans le prototype
- ✅ **Fichier HTML autonome** - Ouvrable directement dans un navigateur
- ✅ **Pas de build step** - Développement instantané
- ✅ **Copier-coller ready** - Une fois validé, le code peut être intégré dans Astro

---

## 8. CRITÈRES DE QUALITÉ

### 8.1 Effet "WAHOU" Checklist

```
IMPACT VISUEL
─────────────
□ Le cube attire immédiatement l'œil à l'arrivée sur la page
□ Le glow est visible mais pas aveuglant
□ Les couleurs cyan/magenta créent un contraste fort
□ L'instabilité donne une impression de "vie"
□ Les arcs plasma surprennent (effet de surprise)

FLUIDITÉ
────────
□ 60 FPS constant (desktop)
□ 30+ FPS sur mobile
□ Pas de saccade lors des transitions
□ Easing naturel sur toutes les animations
□ Pas de "jump" au changement de phase

POLISH
──────
□ Le nom apparaît au bon moment (ni trop tôt, ni trop tard)
□ Le lien d'énergie cube→nom est visible mais subtil
□ L'effet électrocution est satisfaisant
□ Les particules ajoutent de la profondeur sans distraire
□ Le fond ne concurrence pas le cube

COHÉRENCE
─────────
□ Les couleurs matchent le portfolio (#00ffff, #ff0080)
□ La typographie est cohérente (Bebas Neue)
□ L'animation raconte une histoire (métaphore)
□ Le style est "brutalist cyberpunk" comme le reste du site

TECHNIQUE
─────────
□ Responsive (s'adapte à toutes les tailles d'écran)
□ Pas de memory leak (dispose proper des objets Three.js)
□ Fallback si WebGL non supporté
□ Accessible (prefers-reduced-motion respecté)
```

### 8.2 Points d'Attention

| Risque | Solution |
|--------|----------|
| Cube trop gros | Garder scale ~0.55 unités, camera.z = 5 |
| Halos qui mangent tout | Opacity max 0.7 pour core, 0.25 pour halos |
| Animation trop rapide | Timeline minimum 4.5s avant LEVITATION |
| Arcs trop fréquents | Probabilité ~0.004 par frame (~5s entre arcs) |
| Mobile laggy | Réduire particules, désactiver post-processing |

---

## 9. PROMPT CLAUDE CODE

### 9.1 Contexte à Fournir

Copier ce prompt dans Claude Code pour générer le prototype :

---

```markdown
# MISSION : Créer le prototype Tesseract Hero

## CONTEXTE

Tu es un ingénieur seniro spécialisé des animations web. TU développes un portfolio web pour Adrien Mercadier, Technicien Supérieur Systèmes et Réseaux (TSSR). L'animation Hero doit incarner une métaphore visuelle : un Tesseract (cube cosmique style Marvel) représentant le potentiel brut, l'énergie à canaliser, comme un serveur qui pulse de puissance mais demande une maintenance constante pour rester stable. Base toi sur le document TESSERACT_BRAINSTORM.md pour le contexte

## RÉFÉRENCE VISUELLE

Site d'inspiration : https://vates.tech/en/
- Observer l'animation de la planète qui descend
- Le glow/halo autour
- Le logo "VATES" qui apparaît en dessous
- Les particules de fond

## SPÉCIFICATIONS TECHNIQUES

### Structure du Tesseract
- Cube externe wireframe (cyan #00ffff, taille 0.55 unités)
- Cube interne wireframe (cyan bright, taille 0.22 unités, rotation indépendante)
- Core central : sphère blanche (r=0.035)
- Halo 1 : cyan (r=0.08)
- Halo 2 : magenta #ff0080 (r=0.14)
- Halo 3 : cyan diffus (r=0.25)

### Comportement CRITIQUE - Instabilité
Le cube doit flotter de manière INSTABLE :
- Position qui oscille (pas juste rotation)
- Wobble multi-fréquences sur rotation X et Z
- Halos qui bougent INDÉPENDAMMENT du cube
- Heartbeat irrégulier du core
- Impression d'énergie difficile à contenir

### Formules d'instabilité
```javascript
// Position flottante
position.x = sin(time * 0.9) * 0.02 + sin(time * 2.3) * 0.008;
position.y = cos(time * 0.7) * 0.015 + cos(time * 1.9) * 0.006;

// Wobble rotation
rotation.x = sin(time * 0.8) * 0.06 + sin(time * 2.1) * 0.025 + sin(time * 3.7) * 0.012;
rotation.z = cos(time * 0.6) * 0.06 + cos(time * 1.8) * 0.025 + cos(time * 3.2) * 0.012;

// Heartbeat
scale = 1 + sin(time * 2.5) * 0.12 + sin(time * 5.5) * 0.05 + sin(time * 8) * 0.025;
```

### Timeline
1. EMERGE (0-2s) : Cube descend depuis le haut, scale 0.1→1
2. AWAKEN (2-3.5s) : Core s'illumine, halos apparaissent
3. STABILIZE (3.5-4.5s) : Nom "ADRIEN MERCADIER" apparaît en dessous
4. LEVITATION (4.5s→∞) : Flottement instable continu + arcs plasma

### Connexion Cube → Nom
- Lien d'énergie constant (ligne pointillée subtile animée)
- Arcs plasma intermittents (~toutes les 4-6 secondes)
- Le nom a un glow qui pulse subtilement en permanence
- Effet "électrocution" quand un arc frappe (flash + tremblement)

### Particules de fond
- 500 particules distribuées en sphère
- 88% cyan, 12% magenta
- Rotation très lente du champ
- Blending additif

## CONTRAINTES TECHNIQUES

- Three.js r128 via CDN (pas de npm)
- Vanilla JS ES6+
- Fichier HTML standalone autonome
- Aucune dépendance Astro
- 60 FPS desktop, 30+ FPS mobile
- Responsive

## STRUCTURE DE SORTIE

Créer dans `prototypes/tesseract-hero/` :
- index.html (tout-en-un pour commencer, ou modulaire)
- Commenter le code pour faciliter les ajustements

## QUALITÉ ATTENDUE

- Effet WAHOU immédiat
- Le cube doit sembler "vivant", pas mécanique
- Transitions fluides (easing naturel)
- Couleurs vibrantes mais pas aveuglantes
- L'ensemble doit raconter l'histoire : énergie brute → canalisation → nom

## FONTS

```css
font-family: 'Bebas Neue', sans-serif; /* Pour le nom */
font-family: 'Space Mono', monospace; /* Pour le reste */
```

## À NE PAS FAIRE

- ❌ Rotation parfaite et lisse (trop mécanique)
- ❌ Halos énormes qui mangent l'écran
- ❌ Cube trop gros (doit tenir dans la main visuellement)
- ❌ Arcs plasma trop fréquents (effet de surprise sinon perdu)
- ❌ Toucher aux fichiers dans src/ ou public/
```

---

### 9.2 Commandes de Lancement

```bash
# Créer la structure
mkdir -p "prototypes/tesseract-hero"
cd "prototypes/tesseract-hero"

# Ouvrir dans le navigateur après création
# (Windows)
start index.html

# (Mac)
open index.html

# (Linux)
xdg-open index.html
```

### 9.3 Itérations Suggérées

Après le prototype initial, demander à Claude Code :

1. **Polish du glow** : "Ajoute UnrealBloomPass pour un glow plus réaliste"
2. **Particules améliorées** : "Remplace PointsMaterial par un shader custom avec scintillement"
3. **Performance** : "Optimise pour mobile en réduisant la complexité géométrique"
4. **Accessibilité** : "Ajoute support prefers-reduced-motion"
5. **Intégration** : "Prépare le code pour intégration dans Astro (exports, cleanup)"

---

## ANNEXES

### A. Ressources Utiles

- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)
- [GSAP Easing Visualizer](https://greensock.com/docs/v3/Eases)
- [Vates.tech](https://vates.tech/en/) - Référence visuelle

### B. Code de Référence

Les prototypes V1-V5 créés pendant le brainstorming sont disponibles pour référence. La V5 est la plus aboutie mais nécessite encore du polish.

### C. Contact

Pour toute question sur ce document ou le projet :
- GitHub : AdrienNewman/portfolio-protolab
- Portfolio : portfolio.protolab.local

---

**Document généré le 30 décembre 2025**
**Version 1.0 - Brainstorming Tesseract Hero**
