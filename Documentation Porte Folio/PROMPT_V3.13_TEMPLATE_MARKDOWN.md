# Prompt Déploiement V3.13 — Template Markdown Moderne

Date : 27 décembre 2025
Version : 3.13

---

## System Prompt

Tu es un ingénieur logiciel expert en frontend (Astro v5), TypeScript, JavaScript et CSS. Tu travailles sur le repository `portefolio V3`.

Contraintes :
- Réponds uniquement en français.
- Fournis des patches au format diff ou le code complet selon la demande.
- Optimise les animations pour la performance (transform/opacity uniquement).
- Respecte l'esthétique neon/cyberpunk existante (cyan #00ffff, magenta #ff0080).

---

## User Prompt

Contexte : Portfolio Astro V3. Implémentation d'un système d'affichage documentation amélioré.

### Déjà implémenté (ne pas modifier) :

- **Tags → Icônes technologies** : TECH_COLORS et THEME_TAGS dans modal-system.js
- **Style icônes simplifié** : couleurs de marque, pas d'effet hover (DocModal.astro)

### À implémenter :

**Phase 1 - Progress Bar (lecture)**
- Ajouter `<div class="doc-progress-bar"><div class="doc-progress-fill"></div></div>` dans header DocModal.astro
- JavaScript: écouter scroll sur `.doc-modal-content`, calculer progression, animer width
- Style: hauteur 2px, gradient cyan→magenta, position absolute bottom du header

**Phase 2 - Table des Matières (TOC)**
- Extraire H2/H3 du HTML généré, créer IDs uniques (slugify)
- Sidebar sticky droite (~220px), masquée sur mobile (<768px)
- Highlight section active via IntersectionObserver
- Layout grid: `grid-template-columns: 1fr 220px`

**Phase 3 - Code Blocks Terminal-Style**
- Header avec dots macOS (rouge/jaune/vert) + nom fichier + bouton copier
- Regex amélioré: `/```(\w+)?(?::(.+?))?\n([\s\S]*?)```/g`
- Feedback visuel "Copié ✓" au clic (2s)

**Phase 4 - Style Hybride Minimal**
- H2: margin-top 4rem, border-top 1px, accent cyan 60px (::before)
- Espacement généreux entre sections
- Blockquotes avec bordure magenta et fond subtil

**Phase 5 - Préparation Liseré Futur**
- Variables CSS prêtes: --brand-primary, --brand-secondary, --brand-accent
- Border-left 4px sur .doc-modal-container (couleur variable)

### Fichiers à modifier :

| Fichier | Modifications |
|---------|---------------|
| `src/components/ui/DocModal.astro` | Structure HTML (progress bar, TOC container) + CSS complet |
| `public/scripts/modal-system.js` | Parseur markdown amélioré + génération TOC + progress tracking |
| `src/content/docs/reference-template.md` | Nouveau fichier template de référence |

### Contraintes techniques :

- Animations: transform/opacity uniquement, 150-300ms, cubic-bezier(0.16, 1, 0.3, 1)
- Responsive: TOC masquée sur mobile, padding réduit
- Accessibilité: navigation clavier préservée, aria-labels sur boutons
- Performance: will-change sur éléments animés, pas de reflow

### Tests requis :

- [ ] Modal s'ouvre/ferme fluidement
- [ ] Progress bar suit le scroll en temps réel
- [ ] TOC highlight la section visible
- [ ] Bouton copier fonctionne avec feedback
- [ ] Responsive mobile (<768px)
- [ ] Navigation clavier (flèches, ESC)
- [ ] Deep linking (#doc-slug)

Retourne le code complet pour chaque fichier modifié.

---

## Contexte Fichiers Actuels

### Structure du projet

```
portefolio V3/
├── src/
│   ├── components/ui/DocModal.astro    # Modal documentation
│   ├── content/docs/                    # Fichiers markdown
│   └── content/config.ts               # Schema Zod
├── public/scripts/
│   └── modal-system.js                 # Gestion modals + parsing MD
└── Documentation Porte Folio/          # Docs dev
```

### Frontmatter Schema (config.ts)

```typescript
docsCollection: {
  title: string (required)
  description: string (required)
  category: enum ['active-directory', 'paloalto', 'monitoring', ...]
  date: Date (required)
  tags: string[] (optional)
  author: string (default: 'Adrien Mercadier')
  difficulty: enum ['beginner', 'intermediate', 'advanced']
  featured: boolean
}
```

### Variables CSS disponibles (global.css)

```css
:root {
    --neon-cyan: #00ffff;
    --neon-magenta: #ff0080;
    --neon-green: #00ff88;
    --neon-yellow: #ffff00;
    --black: #000000;
    --gray-dark: #0a0a0a;
    --gray-mid: #1a1a1a;
}
```

---

## Exemple d'utilisation

Pour utiliser ce prompt avec un LLM :

1. Copier le **System Prompt** dans le contexte système
2. Copier le **User Prompt** comme message utilisateur
3. Optionnel: Fournir les fichiers actuels (DocModal.astro, modal-system.js) pour contexte

Le LLM retournera le code complet pour implémenter toutes les fonctionnalités.
