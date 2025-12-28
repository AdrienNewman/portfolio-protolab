# Changelog V4.6 - Section Certifications & Ajustements Profil

## RESUME

**Version**: V4.6
**Date**: 28 décembre 2024
**Titre**: Section Certifications avec badge Cisco & optimisation taille 100% zoom

---

## NOUVEAUTES

### 1. Section Certifications dans le Profil
- Nouvelle section "Certifications ///" sous les Soft Skills
- Badge Cisco Networking Basics avec lien vers Credly
- Placeholder animé pour certifications futures
- Effet glow au hover sur les badges
- Style cyberpunk cohérent avec le reste du portfolio

**Fichiers modifiés**:
- `src/components/sections/Profile.astro` - Nouvelle section certifications
- `public/images/badges/cisco-networking-basics.png` - Image badge local

### 2. Alignement Terminal / Soft Skills
- Grid profile avec `align-items: stretch` pour hauteurs égales
- Terminal wrapper en flexbox pour étirement vertical
- Terminal body avec `flex: 1` pour remplir l'espace
- Gap réduit de 60px à 40px

**Fichiers modifiés**:
- `src/pages/index.astro` - Styles profile-grid et terminal

### 3. Optimisation tailles pour zoom 100%
- Réduction globale des tailles pour lisibilité à 100% zoom
- Terminal font-size: 14px → 12px
- Soft skills margins et font-sizes réduits
- Badge certification: 90px width
- Placeholder certification: 110x140px

**Fichiers modifiés**:
- `src/components/sections/Profile.astro` - Styles certifications
- `src/pages/index.astro` - Styles terminal et soft skills

---

## DETAILS TECHNIQUES

### Structure Certifications
```html
<div class="certifications-section">
    <h3 class="cert-title">Certifications ///</h3>
    <div class="cert-badges-grid">
        <!-- Badge actif avec lien Credly -->
        <a href="https://www.credly.com/badges/..." class="cert-badge-link">
            <div class="cert-badge-wrapper">
                <img src="/images/badges/cisco-networking-basics.png" ... />
                <span class="cert-badge-name">Networking Basics</span>
                <span class="cert-badge-issuer">Cisco</span>
                <div class="cert-badge-glow"></div>
            </div>
        </a>
        <!-- Placeholder pour badges futurs -->
        <div class="cert-badge-placeholder">...</div>
    </div>
</div>
```

### CSS Grid Alignment
```css
.profile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: stretch; /* Hauteurs égales */
}

.profile-terminal-wrapper {
    display: flex;
    flex-direction: column;
}

.profile-terminal-body {
    flex: 1; /* Remplit l'espace vertical */
    display: flex;
    flex-direction: column;
    justify-content: center;
}
```

---

## CHOIX TECHNIQUES

### Image locale vs iframe Credly
**Problème**: L'iframe Credly avait un cadre inesthétique non modifiable (cross-origin)
**Solution**: Utilisation d'une image locale avec lien vers la page Credly
**Avantages**:
- Contrôle total du style
- Meilleure performance (pas de requête externe)
- Pas de dépendance au script Credly
- Cohérence visuelle avec le design

---

## TESTS EFFECTUES

- [x] Badge Cisco affiché correctement
- [x] Lien vers Credly fonctionnel
- [x] Effet glow au hover
- [x] Terminal et Soft Skills alignés en hauteur
- [x] Lisibilité à zoom 100%
- [x] Responsive mobile fonctionnel
- [x] Placeholder "En cours..." stylé

---

## BREAKING CHANGES

Aucun

---

## COMMITS PRECEDENTS

- V4.5 (a4801b8): Accessibility improvements (WCAG 2.1)
- V4.4 (91bc506): NetDefender boss system & rich narrative content
- V4.3 (985642f): Starfield background, mobile menu UX & floating packet

---

**Document créé le**: 28/12/2024
**Statut**: COMPLETE
