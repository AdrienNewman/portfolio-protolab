# Debug rapide - Portfolio ne s'affiche pas

## Symptômes
- Le terminal boot s'anime ✅
- Le bouton "Skip intro" fonctionne ✅
- Après l'animation, l'écran reste noir ❌

## Solution appliquée

Un **fallback CSS** a été ajouté dans `src/pages/index.astro` :
- Le portfolio s'affichera automatiquement après 3 secondes
- Cela permet de voir le contenu même si JavaScript a un problème

## Pour vérifier les erreurs JavaScript

1. **Ouvrez la console navigateur** : `F12` > Onglet `Console`
2. **Regardez les erreurs en rouge**
3. **Vérifiez que ces scripts se chargent** (onglet Network) :
   - `/scripts/terminal-boot.js`
   - `/scripts/scroll-animations.js`
   - `/scripts/custom-cursor.js`
   - `/scripts/three-background.js`

## Test manuel dans la console

```javascript
// Vérifier que les éléments existent
console.log('Terminal:', document.getElementById('terminal-boot'));
console.log('Main:', document.getElementById('main-portfolio'));
console.log('Skip btn:', document.getElementById('skip-btn'));

// Forcer l'affichage du portfolio
document.getElementById('main-portfolio').classList.add('visible');
document.getElementById('terminal-boot').classList.add('hidden');

// Vérifier que initPortfolio existe
console.log('initPortfolio:', typeof window.initPortfolio);

// L'appeler manuellement
if (typeof window.initPortfolio === 'function') {
    window.initPortfolio();
}
```

## Solutions possibles

### Solution 1 : Le fallback CSS (déjà appliqué)
Le portfolio apparaîtra après 3 secondes automatiquement.

### Solution 2 : Forcer le skip
Dans la console :
```javascript
document.querySelector('.skip-btn').click();
```

### Solution 3 : Vérifier l'ordre de chargement
Les scripts doivent être chargés dans cet ordre :
1. Three.js (CDN)
2. GSAP (CDN)
3. custom-cursor.js
4. three-background.js
5. scroll-animations.js (définit `window.initPortfolio`)
6. terminal-boot.js (appelle `window.initPortfolio`)

### Solution 4 : Rebuild
```bash
rm -rf dist node_modules
npm install
npm run build
npm run dev
```

## Erreurs courantes

### Erreur : "initPortfolio is not a function"
**Cause** : scroll-animations.js pas chargé ou chargé après terminal-boot.js
**Solution** : Vérifier l'ordre des scripts dans BaseLayout.astro

### Erreur : "Cannot read property 'classList' of null"
**Cause** : Les éléments DOM ne sont pas trouvés
**Solution** : Le script s'exécute avant le DOM. DOMContentLoaded devrait régler ça.

### Erreur : "THREE is not defined"
**Cause** : CDN Three.js bloqué ou pas chargé
**Solution** : Vérifier la connexion internet, désactiver bloqueur de pub

## Vérification rapide

Ouvrez : `http://localhost:4321`

**Ce qui devrait se passer** :
1. ✅ Terminal boot visible noir avec du texte
2. ✅ Animation de typing
3. ✅ Neofetch ASCII art
4. ✅ Barre de progression
5. ✅ "✓ Ready"
6. ✅ Écran devient blanc puis portfolio apparaît
7. ✅ Navigation visible en haut
8. ✅ Section Hero avec "Adrien Mercadier"
9. ✅ Stats sidebar à droite
10. ✅ Particules Three.js en fond

**Si ça ne marche pas** :
- Après 3 secondes, le portfolio devrait quand même apparaître (fallback)
- Sinon, ouvrir la console et chercher les erreurs rouges
