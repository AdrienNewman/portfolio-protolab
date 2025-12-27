# Guide de dépannage

## Problème : L'animation du terminal boot ne se lance pas

### Solution appliquée

Les scripts JavaScript ont été corrigés pour fonctionner correctement avec Astro :

1. **Scripts déplacés vers `public/`** : Les scripts JS doivent être dans `public/scripts/` pour être accessibles
2. **Chargement avec `is:inline`** : Les scripts sont chargés avec l'attribut `is:inline` pour éviter le bundling Vite
3. **DOMContentLoaded** : Les scripts attendent que le DOM soit chargé avant d'accéder aux éléments
4. **`initPortfolio()` global** : La fonction est exposée via `window.initPortfolio` pour être accessible entre scripts

### Vérifications

Si l'animation ne fonctionne toujours pas :

1. **Ouvrez la console du navigateur** (F12)
2. **Vérifiez les erreurs JavaScript**
3. **Vérifiez que les éléments existent** :
   ```javascript
   console.log(document.getElementById('terminal-boot'))
   console.log(document.getElementById('terminal-output'))
   console.log(document.getElementById('skip-btn'))
   console.log(document.getElementById('main-portfolio'))
   ```

4. **Vérifiez que les scripts sont chargés** :
   - Ouvrez l'onglet Network dans les DevTools
   - Actualisez la page
   - Vérifiez que `/scripts/terminal-boot.js`, `/scripts/three-background.js`, etc. se chargent (code 200)

5. **Test du bouton Skip** :
   - Ouvrez la console
   - Tapez : `document.getElementById('skip-btn').click()`
   - Le portfolio devrait apparaître

## Problème : Les styles ne se chargent pas

Les styles CSS sont maintenant inline dans BaseLayout.astro via `<style is:global>`. Si les styles ne s'appliquent pas :

1. Vérifiez que `src/styles/global.css` existe
2. Vérifiez la console pour les erreurs CSS
3. Inspectez un élément dans DevTools pour voir si les variables CSS sont définies

## Problème : Three.js ne fonctionne pas

Three.js est chargé depuis un CDN. Vérifiez :

1. Connexion internet active
2. Console pour erreurs Three.js
3. L'élément `<canvas id="three-canvas">` existe dans le DOM

## Tester en local

```bash
# Développement
npm run dev

# Build et preview
npm run build
npm run preview
```

## Ordre de chargement des scripts

1. **Three.js CDN** (chargé en premier)
2. **GSAP CDN** (chargé en second)
3. **custom-cursor.js** (curseur personnalisé)
4. **three-background.js** (animation particules)
5. **scroll-animations.js** (animations scroll + initPortfolio)
6. **terminal-boot.js** (dans TerminalBoot.astro, démarre l'animation)

## Debug rapide

Ouvrez la console et tapez :

```javascript
// Vérifier que initPortfolio existe
console.log(typeof window.initPortfolio); // doit afficher "function"

// Forcer le skip du boot
if (typeof skipBoot === 'function') skipBoot();

// Vérifier Three.js
console.log(typeof THREE); // doit afficher "object"
```

## Fichiers modifiés

- `src/layouts/BaseLayout.astro` - Chemins des scripts corrigés
- `public/scripts/terminal-boot.js` - DOMContentLoaded ajouté
- `public/scripts/scroll-animations.js` - initPortfolio exposé globalement
- `src/components/effects/TerminalBoot.astro` - Script inline ajouté
