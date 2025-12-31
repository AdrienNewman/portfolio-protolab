# Tesseract Hero Prototype

**Animation Hero WebGL spectaculaire** pour le portfolio d'Adrien Mercadier - Tesseract cosmique qui raconte l'histoire : **énergie brute → puissance contrôlée → identité professionnelle**.

![Version](https://img.shields.io/badge/version-1.0.0-cyan)
![Three.js](https://img.shields.io/badge/Three.js-r128-00ffff)
![Status](https://img.shields.io/badge/status-prototype-ff0080)

---

## 🎯 Concept

Le Tesseract (cube cosmique 4D style Marvel) symbolise le potentiel brut et l'énergie qui demande une maintenance constante pour rester stable - métaphore parfaite pour un Technicien Supérieur Systèmes & Réseaux.

### Timeline d'Animation (4 Phases)

1. **EMERGE (0-2s)** : Le tesseract descend du ciel, scale 0.1 → 1.0
2. **AWAKEN (2-3.5s)** : Le core s'illumine, les halos apparaissent séquentiellement
3. **STABILIZE (3.5-4.5s)** : Le nom "ADRIEN MERCADIER" apparaît en dessous
4. **LEVITATION (4.5s+)** : Flottement instable permanent avec arcs plasma

---

## 🚀 Démarrage Rapide

### Option 1 : Ouvrir directement

```bash
# Depuis la racine du projet
open prototypes/tesseract-hero/index.html
```

Ou double-cliquer sur `index.html` dans l'explorateur.

### Option 2 : Serveur local (recommandé)

```bash
# Python 3
python -m http.server 8000

# Node.js avec http-server
npx http-server -p 8000

# Puis ouvrir
http://localhost:8000/prototypes/tesseract-hero/
```

---

## ⌨️ Contrôles

| Touche | Action |
|--------|--------|
| **D** | Toggle panneau debug (FPS, phase, temps, qualité) |

---

## 🎨 Caractéristiques Techniques

### Géométrie Tesseract

```
tesseractGroup (conteneur principal)
├── outerCube (wireframe cyan, 0.55 unités)
├── innerCube (wireframe cyan brillant, 0.22 unités)
└── coreGroup
    ├── coreSphere (blanc, r=0.035)
    ├── halo1 (cyan, r=0.08)
    ├── halo2 (magenta, r=0.14)
    └── halo3 (cyan diffus, r=0.25)
```

### Système de Particules

- **500 particules** (250 sur mobile)
- Distribution en sphère (rayon 3-7 unités)
- **88% cyan, 12% magenta**
- Rotation lente du système entier

### Effets Visuels

#### Instabilité Multi-Fréquence (Secret du mouvement "vivant")

```javascript
// Position wobble (3 fréquences superposées)
x = sin(time * 0.9) * 0.02 + sin(time * 2.3) * 0.008
y = cos(time * 0.7) * 0.015 + cos(time * 1.9) * 0.006
z = sin(time * 1.1) * 0.01

// Rotation wobble (3 fréquences par axe)
rotation.x = sin(time * 0.8) * 0.06 + sin(time * 2.1) * 0.025 + sin(time * 3.7) * 0.012
rotation.z = cos(time * 0.6) * 0.06 + cos(time * 1.8) * 0.025 + cos(time * 3.2) * 0.012

// Core heartbeat (irrégulier)
scale = 1 + sin(time * 2.5) * 0.12 + sin(time * 5.5) * 0.05 + sin(time * 8) * 0.025
```

**Principe clé :** Superposer plusieurs ondes sin/cos à fréquences différentes crée un mouvement organique, pas mécanique.

#### Arcs Plasma

- Déclenchement toutes les **4-6 secondes** (7s sur mobile)
- Chemin bezier cubique pour arc organique
- Animation stroke-dasharray pour effet "voyage"
- Durée : 800ms
- Effet électrocution sur le nom (shake + flash glow)

#### Lien d'Énergie Constant

- Ligne SVG pointillée entre tesseract et nom
- Animation dashoffset pour effet de flux
- Mise à jour temps réel avec le wobble

---

## ⚡ Performance

### Objectifs

- **Desktop :** 60 FPS (Intel HD 620+)
- **Mobile :** 30+ FPS (Android/iOS milieu de gamme)

### Optimisations Automatiques

#### Mobile détecté

- Particules réduites à 250
- Halo externe (halo 3) désactivé
- Arcs plasma toutes les 7s au lieu de 4-6s

#### FPS < 30 (Qualité Adaptative)

- Passage automatique en mode LOW QUALITY
- Opacité particules réduite
- Halo externe désactivé
- Warning dans console

### Techniques d'Optimisation

- Low poly (16 segments pour sphères)
- Pixel ratio plafonné à 2
- Additive blending pour halos (performant)
- `requestAnimationFrame` avec delta time
- Pause animation si onglet caché (Visibility API)

---

## ♿ Accessibilité

### Reduced Motion Support

Si l'utilisateur a activé `prefers-reduced-motion`:

- Désactivation de l'instabilité
- Conservation rotation lente seulement
- Arcs plasma désactivés

### Compatibilité

- Lecteur d'écran : élément nom accessible
- Canvas avec `aria-label`
- Contrôles clavier (D pour debug)

---

## 🎨 Palette Couleurs

```css
--black: #000000   /* Fond */
--white: #ffffff   /* Core */
--cyan: #00ffff    /* Cubes, halo 1, halo 3, particules */
--magenta: #ff0080 /* Halo 2, particules accent */
```

Correspond exactement au portfolio principal pour intégration transparente.

---

## 📝 Configuration & Ajustements

### Modifier les Timings des Phases

```javascript
this.TIMELINE = {
    EMERGE: { start: 0, end: 2.0 },       // Descente
    AWAKEN: { start: 2.0, end: 3.5 },     // Illumination
    STABILIZE: { start: 3.5, end: 4.5 },  // Nom apparaît
    LEVITATION: { start: 4.5, end: Infinity } // Flottement
};
```

### Modifier l'Intensité de l'Instabilité

Dans `animateLevitation()`:

```javascript
// Amplifier le wobble (actuellement subtil)
const wobbleX = Math.sin(time * 0.9) * 0.04 + Math.sin(time * 2.3) * 0.016; // × 2
const wobbleY = Math.cos(time * 0.7) * 0.03 + Math.cos(time * 1.9) * 0.012; // × 2
```

⚠️ **Attention :** Trop d'amplitude = effet nauséabond !

### Modifier la Fréquence des Arcs Plasma

```javascript
// Dans firePlasmaArc() callback
this.nextArcTime = time + 8; // Toutes les 8 secondes
```

### Changer les Couleurs

```javascript
// Cubes
this.outerCube = new THREE.LineBasicMaterial({ color: 0xff00ff }); // Magenta

// Core
this.coreSphere = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Vert

// Halos
halo1Mat.color = new THREE.Color(0xffff00); // Jaune
```

---

## 🔧 Debug

### Panneau Debug (Touche D)

Affiche en temps réel :

- **FPS :** Frames par seconde actuel
- **Phase :** EMERGE / AWAKEN / STABILIZE / LEVITATION
- **Time :** Temps global en secondes
- **Quality :** HIGH / LOW

### Console JavaScript

```javascript
// Accéder à l'instance tesseract
window.tesseract

// Forcer phase
window.tesseract.phase = 'LEVITATION'
window.tesseract.globalTime = 5.0

// Forcer arc plasma
window.tesseract.firePlasmaArc()

// Toggle qualité basse
window.tesseract.lowQualityMode = true
```

---

## 🐛 Troubleshooting

### Le tesseract ne s'affiche pas

**Vérifier :**

1. Three.js chargé ? Ouvrir console → chercher erreur CDN
2. WebGL supporté ? Tester sur [get.webgl.org](https://get.webgl.org/)
3. Console JavaScript → erreurs ?

### Performance faible (FPS < 30)

**Solutions :**

1. Le mode LOW QUALITY devrait s'activer automatiquement
2. Réduire manuellement particules (ligne 350) : `particleCount = 100`
3. Désactiver halos 2 et 3
4. Fermer autres onglets gourmands

### Arcs plasma ne se déclenchent pas

**Vérifier :**

1. Phase actuelle = LEVITATION ? (panneau debug)
2. Nom visible ? (`nameVisible = true`)
3. Console → erreur SVG ?

### Animation saccadée

**Causes possibles :**

1. Onglet en arrière-plan (Visibility API pause l'animation)
2. FPS bas → vérifier panneau debug
3. Navigateur non à jour

---

## 📦 Intégration dans le Portfolio

### Étape 1 : Modulariser le Code

Extraire les classes en fichiers séparés :

```
public/scripts/tesseract/
├── TesseractCore.js
├── ParticleSystem.js
├── PlasmaArc.js
├── Timeline.js
└── utils.js
```

### Étape 2 : Toggle A/B

Créer `public/scripts/config.js` :

```javascript
export const USE_TESSERACT = true; // Bascule entre ancien/nouveau
```

Modifier `BaseLayout.astro` :

```astro
<script type="module">
  import { USE_TESSERACT } from '/scripts/config.js';

  if (USE_TESSERACT) {
    import('/scripts/tesseract-init.js');
  } else {
    import('/scripts/three-background.js');
  }
</script>
```

### Étape 3 : Ajouter HTML à Hero.astro

Voir plan d'implémentation (section 7.3) pour code complet.

### Rollback Simple

```javascript
// config.js
export const USE_TESSERACT = false; // Retour à l'ancien fond
```

---

## 📊 Métriques Prototype

| Métrique | Valeur |
|----------|--------|
| **Lignes de code** | ~850 (tout-en-un) |
| **Taille fichier** | ~35 KB |
| **Dépendances** | Three.js r128 (CDN) |
| **Polygones** | ~800 (low poly optimisé) |
| **Particules** | 500 (250 mobile) |
| **FPS cible** | 60 desktop, 30+ mobile |

---

## 🎓 Concepts Three.js Utilisés

- `PerspectiveCamera` avec FOV 45°
- `PointLight` dynamique (intensité variable)
- `EdgesGeometry` pour wireframes propres
- `BufferGeometry` + `BufferAttribute` pour particules
- Additive blending (`THREE.AdditiveBlending`)
- `BackSide` rendering pour halos
- Groupes imbriqués pour hiérarchie d'animation
- `Vector3.project()` pour projection 3D → 2D

---

## 🚀 Prochaines Étapes

### V1.1 - Améliorations Visuelles

- [ ] UnrealBloomPass post-processing (desktop seulement)
- [ ] Shader custom pour core (effet Fresnel)
- [ ] Particules avec scintillation
- [ ] Son subtil sur arc plasma

### V1.2 - Interactions

- [ ] Click tesseract → arc plasma manuel
- [ ] Mouse parallax sur caméra
- [ ] Arrow keys → rotation caméra
- [ ] Konami code easter egg

### V2.0 - Intégration Production

- [ ] Modularisation code (classes séparées)
- [ ] Toggle A/B avec config.js
- [ ] Intégration Hero.astro
- [ ] Tests cross-browser
- [ ] Performance audit production

---

## 📄 Licence

Prototype pour le portfolio d'Adrien Mercadier.
© 2025 - Tous droits réservés.

---

## 🙏 Crédits

**Inspiration visuelle :** [vates.tech](https://vates.tech/en/) (animation planète descendante)

**Technologies :**

- [Three.js r128](https://threejs.org/) - WebGL 3D library
- [Google Fonts](https://fonts.google.com/) - Bebas Neue, Space Mono, JetBrains Mono

**Développé avec ❤️ et ☕ pour le PROTOLAB**

---

## 📞 Contact

**Adrien Mercadier** - Technicien Supérieur Systèmes & Réseaux (TSSR)

Portfolio : [En construction]

---

**Dernière mise à jour :** 2025-12-30
**Version :** 1.0.0 - Prototype initial
