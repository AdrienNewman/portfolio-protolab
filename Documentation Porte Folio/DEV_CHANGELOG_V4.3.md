# Changelog V4.3 - Améliorations UX & Easter Egg

## RESUME

**Version**: V4.3
**Date**: 28 décembre 2024
**Titre**: Starfield background, mobile menu UX & floating packet improvements

---

## NOUVEAUTES

### 1. Fond Starfield visible sur tout le site
- Les sections ont maintenant un fond transparent
- Le canvas Three.js (starfield) est visible dans les espaces entre les tuiles
- Effet de profondeur ameliore

**Fichiers modifies**:
- `src/components/sections/Skills.astro` - background: transparent
- `src/components/sections/Documentation.astro` - background: transparent
- `src/pages/index.astro` - #profil et .contact-section transparents

### 2. Menu Mobile ameliore
- Configuration de navigation centralisee (`src/config/navigation.ts`)
- Effet parallaxe au scroll/swipe dans le menu mobile
- Fermeture par scroll molette (desktop) ou swipe vers le haut (mobile)
- Fermeture par touche Escape
- Fermeture par clic sur logo AM
- Z-index corrige pour navbar au-dessus du menu

**Fichiers modifies**:
- `src/config/navigation.ts` - NOUVEAU fichier de config
- `src/components/layout/Navbar.astro` - utilise config centralisee
- `src/components/layout/MobileMenu.astro` - utilise config centralisee
- `public/scripts/scroll-animations.js` - parallaxe et fermeture menu

### 3. Easter Egg Floating Packet
- Suppression du fondu au scroll (paquet visible partout)
- Detection intelligente des elements opaques
- Le paquet est cliquable uniquement dans les zones transparentes
- Passe "sous" les tuiles visuellement grace a la detection DOM

**Fichiers modifies**:
- `public/scripts/floating-packet.js`
  - Suppression de `updateVisibility()` et event scroll
  - Ajout de `isOverOpaqueElement()` pour detection
  - Events mousemove/click sur document au lieu du canvas
  - pointer-events: none sur le canvas

---

## DETAILS TECHNIQUES

### Navigation centralisee
```typescript
// src/config/navigation.ts
export const navigationItems = [
    { label: 'Accueil', href: '#accueil' },
    { label: 'Profil', href: '#profil' },
    { label: 'Competences', href: '#competences' },
    { label: 'Documentation', href: '#documentation' },
    { label: 'Contact', href: '#contact' }
];
```

### Detection elements opaques (floating-packet.js)
```javascript
function isOverOpaqueElement(x, y) {
    const elements = document.elementsFromPoint(x, y);
    for (const el of elements) {
        if (el.id === 'packet-overlay' || el.id === 'three-canvas' ||
            el.tagName === 'BODY' || el.tagName === 'HTML') continue;

        const style = getComputedStyle(el);
        const bg = style.backgroundColor;
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
            return true;
        }
    }
    return false;
}
```

---

## TESTS EFFECTUES

- [x] Starfield visible entre les tuiles
- [x] Menu mobile s'ouvre/ferme correctement
- [x] Parallaxe fonctionne au scroll dans menu
- [x] Fermeture par Escape, clic logo, scroll
- [x] Paquet flottant visible sur tout le site
- [x] Paquet cliquable dans zones transparentes
- [x] Paquet non-cliquable sur les tuiles

---

## BREAKING CHANGES

Aucun

---

## COMMITS PRECEDENTS

- V4.2 (8d60d72): Cinematic intro & terminal boot removal
- V4.0 (84d9300): NetDefender game integration with OSI educational theme
- V3.12 (6ae62a1): Technology icons with brand colors in doc modal

---

**Document cree le**: 28/12/2024
**Statut**: COMPLETE
