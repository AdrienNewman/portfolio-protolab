# Plan d'Intégration - Icônes Visuelles des Pouvoirs

**Date** : 2026-01-15
**Statut** : En attente de validation

---

## 📋 Résumé

Remplacement des emojis actuels par des icônes PNG personnalisées pour les 14 pouvoirs du jeu NetDefender.

---

## 📊 Correspondances Fichiers → Pouvoirs

| Fichier PNG | Power ID | Nom affiché |
|-------------|----------|-------------|
| `wiki-boost.png` | `power_wiki_boost` | Savoir Infini |
| `bouclier-editorial.png` | `power_edit_shield` | Bouclier Éditorial |
| `onglet-eclair.png` | `power_swift_tab` | Onglet Éclair |
| `multis-onglets.png` | `power_multi_tab` | Multi-Onglets |
| `emergency-teleport.png` | `power_streak_freeze` | Asile Numérique |
| `leaks-massifs.png` | `power_xp_burst` | Leaks Massifs |
| `kernel-panik.png` | `power_kernel_panic` | Kernel Panic |
| `sudo-kill.png` | `power_sudo_kill` | Sudo Kill |
| `mode-ddos.png` | `power_ddos_mode` | Mode DDoS |
| `mode-fantome.png` | `power_ghost_mode` | Mode Fantôme |
| `boost-gpio.png` | `power_gpio_boost` | Boost GPIO |
| `overclocking.png` | `power_overclock` | Overclocking |
| `chmod-777.png` | `power_git_revert` | Chmod 777 |
| `liberation-code.png` | `power_merge_master` | Libération du Code |

**✅ 14/14 pouvoirs couverts** - Toutes les icônes sont présentes.

---

## 🎯 Spécifications Techniques

### Résolution Cible

- **Taille originale** : ~800-1300 KB, ~1024x1024px (estimation)
- **Taille badge actuelle** : 220x200px (LAYOUT_CHOICE.BADGES)
- **Zone icône** : ~60x60px (emoji actuel font-size: 48px)
- **Résolution recommandée** : **128x128px** (ratio 2x pour écrans Retina)
- **Format** : PNG avec transparence

### Compression

- **Outil** : ImageMagick ou Sharp (Node.js)
- **Qualité** : PNG-8 ou PNG-24 optimisé
- **Taille cible** : <15 KB par icône

---

## 📁 Structure Fichiers

```
public/
├── images/
│   └── game/
│       └── powers/          # NOUVEAU
│           ├── wiki-boost.png
│           ├── bouclier-editorial.png
│           ├── onglet-eclair.png
│           ├── multis-onglets.png
│           ├── emergency-teleport.png
│           ├── leaks-massifs.png
│           ├── kernel-panik.png
│           ├── sudo-kill.png
│           ├── mode-ddos.png
│           ├── mode-fantome.png
│           ├── boost-gpio.png
│           ├── overclocking.png
│           ├── chmod-777.png
│           └── liberation-code.png
```

---

## 🔧 Modifications Code

### 1. PowerBadgeRenderer.js (~30 lignes modifiées)

**Avant** (emoji) :
```javascript
this.powerIcons = {
    power_wiki_boost: '📊',
    // ...
};

// Rendu
ctx.font = VISUAL.FONTS.BADGE_ICON;
ctx.fillText(icon, x, y - bh * 0.28);
```

**Après** (image) :
```javascript
// Mapping vers fichiers PNG
this.powerIconPaths = {
    power_wiki_boost: '/images/game/powers/wiki-boost.png',
    power_edit_shield: '/images/game/powers/bouclier-editorial.png',
    // ...
};

// Cache images préchargées
this.iconImages = {};
this.iconsLoaded = false;

// Méthode de préchargement
async preloadIcons() {
    const promises = Object.entries(this.powerIconPaths).map(([id, path]) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this.iconImages[id] = img;
                resolve();
            };
            img.onerror = () => resolve(); // Fallback emoji si erreur
            img.src = path;
        });
    });
    await Promise.all(promises);
    this.iconsLoaded = true;
}

// Rendu (remplace fillText)
const iconSize = 64;
const iconImg = this.iconImages[power.id];
if (iconImg) {
    ctx.drawImage(iconImg, x - iconSize/2, y - bh * 0.28 - iconSize/2, iconSize, iconSize);
} else {
    // Fallback emoji
    ctx.font = VISUAL.FONTS.BADGE_ICON;
    ctx.fillText(this.powerIconsFallback[power.id] || '⭐', x, y - bh * 0.28);
}
```

### 2. SageScreen.js (~5 lignes ajoutées)

Appeler `preloadIcons()` au démarrage :
```javascript
async initialize() {
    // ...existing code...
    await this.powerBadgeRenderer.preloadIcons();
}
```

### 3. (Optionnel) Configs pouvoirs

Ajouter `iconPath` dans chaque fichier `power_*.js` :
```javascript
export const power_wiki_boost = {
    // ...existing...
    icon: '📚',              // Fallback
    iconPath: '/images/game/powers/wiki-boost.png'
};
```

---

## 📝 Étapes d'Implémentation

### Phase 1 : Préparation Assets (~5 min)
1. ☐ Créer dossier `public/images/game/powers/`
2. ☐ Redimensionner les 14 images à 128x128px
3. ☐ Optimiser/compresser les PNG
4. ☐ Copier vers le dossier cible

### Phase 2 : Modifications Code (~15 min)
5. ☐ Modifier `PowerBadgeRenderer.js` :
   - Ajouter mapping `powerIconPaths`
   - Ajouter cache `iconImages`
   - Ajouter méthode `preloadIcons()`
   - Modifier `renderDetailedBadge()` pour utiliser `drawImage`
6. ☐ Modifier `SageScreen.js` :
   - Appeler `preloadIcons()` dans `show()`

### Phase 3 : Tests (~5 min)
7. ☐ Tester via `prototype-game.html`
8. ☐ Vérifier rendu sur différents écrans
9. ☐ Vérifier fallback emoji si image manquante

---

## ⚠️ Points d'Attention

1. **Préchargement** : Les images doivent être chargées AVANT l'affichage du SageScreen
2. **Fallback** : Conserver les emojis comme fallback en cas d'erreur de chargement
3. **Performance** : 14 images × ~15KB = ~210KB total (acceptable)
4. **Transparence** : S'assurer que les PNG ont un fond transparent

---

## 🔄 Rollback

Si problème : revenir aux emojis en commentant le bloc `drawImage` et décommentant `fillText`.

---

**Prêt pour implémentation après validation.**
