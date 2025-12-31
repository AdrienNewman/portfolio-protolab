# Tesseract Hero - Magnetic Assembly (V2)

**Animation Hero WebGL avec assemblage magnétique de pièces Tetris 3D** - Inspiré du design de la particule flottante NetDefender.

![Version](https://img.shields.io/badge/version-2.0.0-magenta)
![Three.js](https://img.shields.io/badge/Three.js-r128-00ffff)
![Status](https://img.shields.io/badge/status-prototype-ff0080)

---

## 🎯 Concept

Cette version alternative utilise un **assemblage magnétique** de pièces Tetris 3D qui convergent vers un cœur violet pulsant, avec un flash radial lors de la fusion finale.

### Différences avec V1 (Original)

| Feature | V1 (Original) | V2 (Magnetic) |
|---------|---------------|---------------|
| **Animation principale** | Descente tesseract complet | Assemblage pièces Tetris 3D |
| **Design** | Cubes wireframe + halos | Enveloppe cyan + cœur violet |
| **Inspiration** | Marvel Tesseract | NetDefender floating packet |
| **Physique** | Rotation/wobble | Force magnétique (1/d²) |
| **Flash** | Arcs plasma récurrents | Flash violet unique à 3s |
| **Trails** | Aucun | Particules cyan |

---

## 🚀 Démarrage Rapide

### Ouvrir directement

```bash
# Depuis la racine du projet
open prototypes/tesseract-hero-magnetic/index.html
```

Ou double-cliquer sur `index.html` dans l'explorateur.

### Serveur local (recommandé)

```bash
# Python 3
python -m http.server 8000

# Node.js avec http-server
npx http-server -p 8000

# Puis ouvrir
http://localhost:8000/prototypes/tesseract-hero-magnetic/
```

---

## ⌨️ Contrôles

| Touche | Action |
|--------|--------|
| **D** | Toggle panneau debug (FPS, phase, temps, qualité) |

---

## 🎬 Timeline d'Animation (4 Phases)

### 1. ASSEMBLY (0-3s) - Convergence Magnétique

- **0-0.5s** : 12 pièces Tetris 3D apparaissent dispersées (sphère rayon 2-2.5)
- **0.5-2.5s** : Force d'attraction magnétique `F = 1.2 / (d² + 0.1)`
  - Pièces volent vers centre avec trajectoires courbes
  - Vitesse augmente en approchant (effet gravité)
  - Rotation tumble proportionnelle à vélocité
  - Trails particules cyan derrière chaque pièce
- **2.5-3.0s** : Fusion avec animation snap (lerp 300ms avec easeOutBack)
  - Enveloppe fade-in : opacity `0.2 → 0.5`

### 2. FLASH (3.0-3.5s) - Explosion Radiale Violette

- **3.0-3.2s (200ms)** : Expansion
  - Sphère lumineuse violette : scale `0.1 → 3.0` (easeOutQuad)
  - Opacity : `0 → 0.8`
  - 80 particules violettes explosent radialement
- **3.2-3.5s (300ms)** : Résorption
  - Scale : `3.0 → 0.1`
  - Opacity : `0.8 → 0`
  - Particules subissent gravity pull vers centre
  - Pièces assemblées deviennent invisibles, cube wireframe final apparaît

### 3. STABILIZE (3.5-4.0s) - Nom Apparaît

- Nom "ADRIEN MERCADIER" fade-in (opacity `0 → 1`, 500ms)
- Effet blur initial : `blur(10px) → blur(0px)`
- Rotation se calme progressivement

### 4. LEVITATION (4.0s+) - Flottement Permanent

- **Position wobble** (multi-fréquences) :
  ```javascript
  position.y = sin(t*0.7)*0.015 + cos(t*1.9)*0.006
  position.x = sin(t*0.9)*0.02 + sin(t*2.3)*0.008
  ```
- **Rotation wobble** (3 ondes superposées par axe)
- **Core heartbeat** irrégulier (3 fréquences)
- Rotation Y lente : `0.1 * deltaTime`

---

## 🎨 Spécifications Visuelles

### Pièces Tetris 3D

- **Nombre** : 12-15 pièces
- **Formes** : 10 variations (L, I, T, Z, Cube, L inversé, T 3D, L 3D, Croix 3D)
- **Matériau** :
  - Core : `MeshBasicMaterial` cyan #00ffff, opacity 0.3
  - Wireframe overlay : opacity 0.6
- **Distribution initiale** : Sphère aléatoire rayon 2.0-2.5

### Enveloppe Wireframe

- **Taille** : 0.5 unités
- **Couleur** : cyan #00ffff
- **Opacité variable** :
  - ASSEMBLY (0-3s) : `0.2` (très transparent)
  - Transition (2.5-3s) : `0.2 → 0.5`
  - FLASH+ (3s+) : `0.5` (stable)
- **Type** : `EdgesGeometry` + `LineSegments`

### Cœur Violet Pulsant

**Toujours visible (spec utilisateur)**

- **Sphère principale** :
  - Rayon : 0.08
  - Couleur : #ff0080 (magenta)
  - Opacity : 0.9
- **Glow Sprite** :
  - Taille : 0.3
  - Texture : radial gradient violet
  - Opacity : 0.6
  - Blending : `AdditiveBlending`
- **Heartbeat** : Multi-fréquences
  ```javascript
  scale = 1 + sin(t*2.5)*0.12 + sin(t*5.5)*0.05 + sin(t*8.0)*0.025
  ```

---

## 🧮 Formules Physiques Clés

### Attraction Magnétique (Inverse Square Law)

```javascript
// Direction vers cœur (normalisée)
direction = normalize(corePosition - piecePosition)

// Distance actuelle
distance = |corePosition - piecePosition|

// Force (proportionnelle à 1/distance²)
force = magneticStrength / (distance² + ε)
// où magneticStrength = 1.2, ε = 0.1

// Application à vélocité
velocity += direction * force * deltaTime
velocity *= 0.95  // damping
position += velocity * deltaTime * 60
```

### Snap Final (distance < 0.15)

```javascript
// Easing back pour effet élastique
function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * pow(t - 1, 3) + c1 * pow(t - 1, 2);
}

// Lerp position sur 300ms
position = lerp(startPos, targetPos, easeOutBack(t))
rotation = lerp(startRot, targetRot, easeOutBack(t))
```

### Flash Radial

```javascript
// Expansion phase (0-200ms)
if (t < 0.2) {
    scale = lerp(0.1, 3.0, easeOutQuad(t / 0.2))
    opacity = lerp(0, 0.8, t / 0.2)
}

// Résorption phase (200-500ms)
else if (t < 0.5) {
    tReso = (t - 0.2) / 0.3
    scale = lerp(3.0, 0.1, tReso)
    opacity = lerp(0.8, 0, tReso)
}
```

---

## ⚡ Performance

### Objectifs

- **Desktop** : 60 FPS (Intel HD 620+)
- **Mobile** : 30+ FPS (Android/iOS milieu de gamme)

### Optimisations Automatiques

#### Mobile détecté

- Particules trails réduites à 80 (vs 150 desktop)
- Particules flash réduites à 50 (vs 80 desktop)
- Segments sphères : 12 (vs 16 desktop)

#### FPS < 30 (Qualité Adaptative)

- Passage automatique en mode LOW QUALITY
- Opacity particules trails réduite
- Warning dans console

### Techniques d'Optimisation

- Low poly (4 segments pour particules trails)
- Pixel ratio plafonné à 2
- Additive blending pour effets (performant)
- Pool-based particle system (évite allocations)
- Proper disposal (geometries, materials, textures)
- Visibility API (pause si onglet caché)

---

## ♿ Accessibilité

### Reduced Motion Support

Si l'utilisateur a activé `prefers-reduced-motion` :

- Désactivation du wobble
- Conservation rotation lente seulement
- Pas de flash radial

### Compatibilité

- Canvas avec `aria-label`
- Contrôles clavier (D pour debug)
- Responsive design (mobile optimisé)

---

## 🎨 Palette Couleurs

```css
--black: #000000   /* Fond */
--white: #ffffff   /* Core sphere */
--cyan: #00ffff    /* Enveloppe, trails */
--magenta: #ff0080 /* Cœur violet, flash */
```

Correspond exactement au portfolio principal.

---

## 📁 Structure Fichiers

```
prototypes/tesseract-hero-magnetic/
├── index.html                    # Page autonome
├── README.md                     # Cette documentation
├── tesseract-hero.js             # Point d'entrée
└── tesseract/                    # Modules
    ├── TesseractGeometry.js      # Formes Tetris + core + enveloppe
    ├── AssemblyPhysics.js        # Physique magnétique (1/d²)
    ├── ParticleTrails.js         # Trails cyan (max 150)
    ├── FlashEffect.js            # Flash radial violet
    └── LevitationController.js   # Flottement multi-fréquences
```

---

## 📊 Métriques

| Métrique | Desktop | Mobile |
|----------|---------|--------|
| **FPS** | 60 constant | 30+ |
| **Pièces Tetris** | 12 | 12 |
| **Particules trails (max)** | 150 | 80 |
| **Particules flash** | 80 | 50 |
| **Segments sphères** | 16 | 12 |
| **Durée ASSEMBLY** | 3.0s | 3.0s |
| **Durée FLASH** | 0.5s | 0.5s |
| **Durée totale** | 4.0s | 4.0s |

---

## 🔧 Debug

### Panneau Debug (Touche D)

Affiche en temps réel :

- **FPS** : Frames par seconde actuel
- **Phase** : ASSEMBLY / FLASH / STABILIZE / LEVITATION
- **Time** : Temps global en secondes
- **Quality** : HIGH / MEDIUM / LOW

### Console JavaScript

```javascript
// Accéder à l'instance tesseract
window.tesseractHero

// Vérifier phase actuelle
window.tesseractHero.phase

// Temps écoulé
window.tesseractHero.clock.getElapsedTime()

// Forcer mode basse qualité
window.tesseractHero.lowQualityMode = true
```

---

## 🐛 Troubleshooting

### Le tesseract ne s'affiche pas

1. Three.js chargé ? Ouvrir console → chercher erreur CDN
2. WebGL supporté ? Tester sur [get.webgl.org](https://get.webgl.org/)
3. Console JavaScript → erreurs ?

### Performance faible (FPS < 30)

1. Le mode LOW QUALITY devrait s'activer automatiquement
2. Réduire manuellement particules dans `ParticleTrails.js`
3. Fermer autres onglets gourmands

### Pièces ne convergent pas

1. Vérifier console → erreurs physique ?
2. Tester `window.tesseractHero.physics.update()` dans console
3. Vérifier distance initiale pièces (doit être > 2.0)

---

## 🆚 Comparaison avec V1

**Quand utiliser V2 (Magnetic) :**

- ✅ Vous voulez raconter une histoire d'assemblage/construction
- ✅ Métaphore CT + VM = infrastructure complète
- ✅ Design inspiré NetDefender (particule flottante)
- ✅ Animation spectaculaire avec physique réaliste

**Quand utiliser V1 (Original) :**

- ✅ Animation plus simple et élégante
- ✅ Focus sur l'énergie brute → stabilité
- ✅ Arcs plasma récurrents (interactivité continue)
- ✅ Performance légèrement meilleure (moins de calculs)

---

## 📄 Licence

Prototype pour le portfolio d'Adrien Mercadier.
© 2025 - Tous droits réservés.

---

## 🙏 Crédits

**Inspiration design :** NetDefender floating packet ([floating-packet.js](../../public/scripts/floating-packet.js))

**Technologies :**

- [Three.js r128](https://threejs.org/) - WebGL 3D library
- [Google Fonts](https://fonts.google.com/) - Bebas Neue, Space Mono, JetBrains Mono

**Développé pour le PROTOLAB** 🚀

---

**Dernière mise à jour :** 2025-12-30
**Version :** 2.0.0 - Prototype Magnetic Assembly
