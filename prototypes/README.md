# 🧪 PROTOLAB - Prototypes Portfolio

Dossier contenant les **prototypes expérimentaux** pour le portfolio d'Adrien Mercadier (TSSR).

---

## 📁 Structure

```
prototypes/
├── index.html                      # Page d'index des prototypes
├── README.md                       # Cette documentation
├── tesseract-hero/                 # V1 - Animation Marvel Tesseract
│   ├── index.html                  # Prototype autonome
│   └── README.md                   # Documentation V1
└── tesseract-hero-magnetic/        # V2 - Assemblage magnétique Tetris 3D
    ├── index.html                  # Prototype autonome
    ├── README.md                   # Documentation V2
    ├── tesseract-hero.js           # Point d'entrée
    └── tesseract/                  # Modules
        ├── TesseractGeometry.js
        ├── AssemblyPhysics.js
        ├── ParticleTrails.js
        ├── FlashEffect.js
        └── LevitationController.js
```

---

## 🚀 Démarrage Rapide

### Option 1 : Index des prototypes

Ouvrir directement :
```bash
open prototypes/index.html
```

### Option 2 : Serveur local

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server -p 8000

# Puis ouvrir
http://localhost:8000/prototypes/
```

---

## 🎨 Prototypes Disponibles

### Tesseract Hero V1 - Original

**Concept :** Animation inspirée Marvel - Tesseract cosmique descendant avec énergie instable

**Timeline :**
1. EMERGE (0-2s) : Descente + scale 0.1 → 1.0
2. AWAKEN (2-3.5s) : Illumination core + halos séquentiels
3. STABILIZE (3.5-4.5s) : Nom apparaît
4. LEVITATION (4.5s+) : Flottement instable permanent + arcs plasma

**Tech :** Three.js r128, 500 particules, arcs plasma SVG

**Lien :** [tesseract-hero/](tesseract-hero/)

---

### Tesseract Hero V2 - Magnetic Assembly

**Concept :** Assemblage magnétique Tetris 3D inspiré NetDefender floating packet

**Timeline :**
1. ASSEMBLY (0-3s) : Pièces convergent magnétiquement (F = 1/d²)
2. FLASH (3-3.5s) : Explosion radiale violette
3. STABILIZE (3.5-4s) : Nom apparaît
4. LEVITATION (4s+) : Flottement multi-fréquence

**Tech :** Three.js r128, physique magnétique, 6 modules

**Lien :** [tesseract-hero-magnetic/](tesseract-hero-magnetic/)

---

## 🆚 Comparaison

| Feature | V1 (Original) | V2 (Magnetic) |
|---------|---------------|---------------|
| **Inspiration** | Marvel Tesseract | NetDefender packet |
| **Animation** | Descente tesseract | Assemblage Tetris 3D |
| **Physique** | Rotation/wobble | Force magnétique 1/d² |
| **Core** | Blanc + halos | Violet pulsant |
| **Flash** | Arcs plasma continus | Flash unique à 3s |
| **Trails** | Aucun | Particules cyan |
| **Complexité** | Simple (1 fichier) | Modulaire (6 fichiers) |
| **Métaphore** | Énergie brute → stable | CT + VM → infra |

---

## 🎯 Objectif

Les prototypes servent à :

1. **Tester** des concepts d'animation avant intégration
2. **Comparer** différentes approches visuelles
3. **Optimiser** performance et expérience utilisateur
4. **Documenter** les choix techniques

**⚠️ Important :** Ces prototypes sont **autonomes** et **ne sont pas intégrés** au site principal. Ils peuvent être testés indépendamment sans affecter le portfolio en production.

---

## 📝 Conventions

### Fichiers

- Chaque prototype doit avoir un `index.html` **autonome**
- Chaque prototype doit avoir un `README.md` détaillé
- Les dépendances externes (Three.js) doivent être via CDN
- Les assets doivent être locaux au prototype

### Nommage

- Dossiers : `kebab-case` (ex: `tesseract-hero-magnetic`)
- Fichiers JS : `PascalCase.js` pour classes (ex: `TesseractGeometry.js`)
- Fichiers HTML : `index.html` (point d'entrée unique)

### Documentation

Chaque README doit contenir :
- 🎯 Concept
- 🚀 Démarrage rapide
- 🎬 Timeline animation
- 🎨 Specs visuelles
- ⚡ Performance
- 🔧 Debug

---

## 🛠️ Technologies Communes

- **Three.js r128** - WebGL 3D library
- **Vanilla JS** - Pas de framework (performances)
- **Google Fonts** - Bebas Neue, Space Mono, JetBrains Mono
- **CSS3 Animations** - Transitions et keyframes

---

## 📊 Performance Targets

Tous les prototypes doivent respecter :

- **Desktop** : 60 FPS constant (Intel HD 620+)
- **Mobile** : 30+ FPS (Android/iOS milieu de gamme)
- **Pixel Ratio** : Max 2 (éviter surcharge)
- **Memory** : Proper disposal (pas de leaks)

---

## 🔄 Workflow d'Intégration

Pour intégrer un prototype au site principal :

1. **Tester** performance et compatibilité
2. **Modulariser** code si nécessaire
3. **Créer toggle A/B** dans config
4. **Intégrer** dans composant Hero
5. **Tester** production
6. **Déployer** staging
7. **Valider** utilisateur
8. **Rollback simple** disponible

---

## 📄 Licence

Prototypes pour le portfolio d'Adrien Mercadier.
© 2025 PROTOLAB - Tous droits réservés.

---

## 👨‍💻 Développeur

**Adrien Mercadier** - Technicien Supérieur Systèmes & Réseaux (TSSR)

Portfolio : [En construction]

---

**Dernière mise à jour :** 2025-12-30
