# Guide d'Implémentation SEO - Portfolio Adrien Mercadier

## Statut : En attente de déploiement

**Date de création :** 28/12/2024
**À implémenter lors du :** Déploiement en production (semaine prochaine)
**Prérequis :** Nom de domaine, réseaux sociaux créés

---

## 1. Meta Tags de Base

### Fichier à modifier : `src/layouts/BaseLayout.astro`

Ajouter dans le `<head>` après les meta existants :

```html
<!-- SEO de base -->
<meta name="author" content="Adrien Mercadier">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#00ffff">
<meta name="keywords" content="TSSR, Technicien Systèmes Réseaux, Portfolio, Infrastructure, Homelab, Proxmox, Palo Alto, Linux, Windows Server">

<!-- Canonical URL - REMPLACER PAR VOTRE DOMAINE -->
<link rel="canonical" href="https://VOTRE-DOMAINE.fr">
```

---

## 2. Open Graph (Facebook, LinkedIn, Discord)

Ces tags contrôlent l'aperçu quand votre site est partagé sur les réseaux sociaux.

```html
<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Adrien Mercadier | TSSR">
<meta property="og:title" content={title}>
<meta property="og:description" content={description}>
<meta property="og:url" content="https://VOTRE-DOMAINE.fr">
<meta property="og:image" content="https://VOTRE-DOMAINE.fr/images/og-preview.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Portfolio Adrien Mercadier - TSSR">
<meta property="og:locale" content="fr_FR">
```

### Image OG à créer

**Spécifications :**
- **Dimensions :** 1200 x 630 pixels (ratio 1.91:1)
- **Format :** PNG ou JPG
- **Emplacement :** `/public/images/og-preview.png`
- **Contenu suggéré :**
  - Votre nom "Adrien Mercadier"
  - Titre "TSSR - Technicien Supérieur Systèmes et Réseaux"
  - Éléments visuels cyberpunk (couleurs neon cyan/magenta)
  - Optionnel : Photo professionnelle ou avatar stylisé

---

## 3. Twitter/X Cards

```html
<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@VOTRE_HANDLE">
<meta name="twitter:creator" content="@VOTRE_HANDLE">
<meta name="twitter:title" content={title}>
<meta name="twitter:description" content={description}>
<meta name="twitter:image" content="https://VOTRE-DOMAINE.fr/images/og-preview.png">
<meta name="twitter:image:alt" content="Portfolio Adrien Mercadier - TSSR">
```

---

## 4. Schema.org - Données Structurées (JSON-LD)

Ajouter avant la fermeture de `</head>` :

```html
<!-- Schema.org Person -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Adrien Mercadier",
  "jobTitle": "Technicien Supérieur Systèmes et Réseaux",
  "url": "https://VOTRE-DOMAINE.fr",
  "image": "https://VOTRE-DOMAINE.fr/images/photo-profil.jpg",
  "email": "mailto:VOTRE-EMAIL@domain.com",
  "sameAs": [
    "https://www.linkedin.com/in/VOTRE-PROFIL",
    "https://github.com/VOTRE-GITHUB",
    "https://twitter.com/VOTRE_HANDLE"
  ],
  "knowsAbout": [
    "Windows Server",
    "Active Directory",
    "Linux Administration",
    "Proxmox VE",
    "Palo Alto Networks",
    "Network Security",
    "Infrastructure Monitoring",
    "Docker",
    "Bash Scripting",
    "PowerShell"
  ],
  "alumniOf": {
    "@type": "EducationalOrganization",
    "name": "VOTRE ÉCOLE/FORMATION"
  }
}
</script>

<!-- Schema.org WebSite -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Portfolio Adrien Mercadier",
  "url": "https://VOTRE-DOMAINE.fr",
  "description": "Portfolio de Adrien Mercadier - Technicien Supérieur Systèmes et Réseaux. Infrastructure, Sécurité, Monitoring.",
  "author": {
    "@type": "Person",
    "name": "Adrien Mercadier"
  }
}
</script>
```

---

## 5. Sitemap XML

### Option A : Plugin Astro (Recommandé)

**Installation :**
```bash
npm install @astrojs/sitemap
```

**Configuration dans `astro.config.mjs` :**
```javascript
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://VOTRE-DOMAINE.fr',
  integrations: [sitemap()],
});
```

### Option B : Sitemap Manuel

Créer `/public/sitemap.xml` :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://VOTRE-DOMAINE.fr/</loc>
    <lastmod>2024-12-28</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Ajouter d'autres pages si nécessaire -->
</urlset>
```

---

## 6. Robots.txt

Créer `/public/robots.txt` :

```txt
# Robots.txt pour Portfolio Adrien Mercadier

User-agent: *
Allow: /

# Sitemap
Sitemap: https://VOTRE-DOMAINE.fr/sitemap.xml

# Bloquer les ressources non indexables (optionnel)
Disallow: /api/
```

---

## 7. Fichier BaseLayout.astro Complet (Référence)

Voici à quoi devrait ressembler le `<head>` complet après implémentation :

```astro
---
import DocModal from '../components/ui/DocModal.astro';
import GameOverlay from '../components/game/GameOverlay.astro';
import '../styles/global.css';

interface Props {
  title?: string;
  description?: string;
  image?: string;
}

const {
  title = 'Adrien Mercadier | TSSR',
  description = 'Portfolio de Adrien Mercadier - Technicien Supérieur Systèmes et Réseaux. Infrastructure, Sécurité, Monitoring.',
  image = '/images/og-preview.png'
} = Astro.props;

const siteUrl = 'https://VOTRE-DOMAINE.fr';
const fullImageUrl = `${siteUrl}${image}`;
---

<!DOCTYPE html>
<html lang="fr">
<head>
    <!-- Base -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>

    <!-- SEO Base -->
    <meta name="description" content={description}>
    <meta name="author" content="Adrien Mercadier">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#00ffff">
    <meta name="keywords" content="TSSR, Technicien Systèmes Réseaux, Portfolio, Infrastructure, Homelab, Proxmox, Palo Alto, Linux, Windows Server">
    <link rel="canonical" href={siteUrl}>

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Adrien Mercadier | TSSR">
    <meta property="og:title" content={title}>
    <meta property="og:description" content={description}>
    <meta property="og:url" content={siteUrl}>
    <meta property="og:image" content={fullImageUrl}>
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Portfolio Adrien Mercadier - TSSR">
    <meta property="og:locale" content="fr_FR">

    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@VOTRE_HANDLE">
    <meta name="twitter:creator" content="@VOTRE_HANDLE">
    <meta name="twitter:title" content={title}>
    <meta name="twitter:description" content={description}>
    <meta name="twitter:image" content={fullImageUrl}>
    <meta name="twitter:image:alt" content="Portfolio Adrien Mercadier - TSSR">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">

    <!-- Schema.org -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Adrien Mercadier",
      "jobTitle": "Technicien Supérieur Systèmes et Réseaux",
      "url": "https://VOTRE-DOMAINE.fr",
      "sameAs": [
        "https://www.linkedin.com/in/VOTRE-PROFIL",
        "https://github.com/VOTRE-GITHUB"
      ],
      "knowsAbout": ["Windows Server", "Linux", "Proxmox", "Palo Alto", "Network Security"]
    }
    </script>
</head>
<body>
    <!-- ... reste du body ... -->
</body>
</html>
```

---

## 8. Checklist de Déploiement SEO

### Avant le déploiement

- [ ] Acheter/configurer le nom de domaine
- [ ] Créer les comptes réseaux sociaux (LinkedIn pro, GitHub, Twitter/X optionnel)
- [ ] Créer l'image OG (1200x630px)
- [ ] Optionnel : Photo de profil professionnelle

### Pendant le déploiement

- [ ] Remplacer tous les `VOTRE-DOMAINE.fr` par le vrai domaine
- [ ] Remplacer `@VOTRE_HANDLE` par vos handles réels
- [ ] Remplacer les liens LinkedIn/GitHub par les vrais
- [ ] Mettre l'image OG dans `/public/images/og-preview.png`
- [ ] Créer `/public/robots.txt`
- [ ] Installer et configurer `@astrojs/sitemap`

### Après le déploiement

- [ ] Tester avec [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Tester avec [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] Tester avec [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [ ] Valider le Schema.org avec [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Soumettre le sitemap à Google Search Console
- [ ] Soumettre le sitemap à Bing Webmaster Tools

---

## 9. Outils de Validation

| Outil | URL | Usage |
|-------|-----|-------|
| Google Rich Results | https://search.google.com/test/rich-results | Valider Schema.org |
| Facebook Debugger | https://developers.facebook.com/tools/debug/ | Tester Open Graph |
| Twitter Validator | https://cards-dev.twitter.com/validator | Tester Twitter Cards |
| LinkedIn Inspector | https://www.linkedin.com/post-inspector/ | Tester partage LinkedIn |
| PageSpeed Insights | https://pagespeed.web.dev/ | Performance et Core Web Vitals |
| GTmetrix | https://gtmetrix.com/ | Performance détaillée |
| Lighthouse | DevTools Chrome (F12 > Lighthouse) | Audit complet |

---

## 10. Bonnes Pratiques Additionnelles

### Performance (impact SEO)

1. **Images optimisées** : Utiliser WebP avec fallback
2. **Lazy loading** : Ajouter `loading="lazy"` aux images below-the-fold
3. **Critical CSS** : Inliner le CSS critique
4. **Compression** : Activer gzip/brotli sur le serveur

### Contenu

1. **Titre unique** par page (si vous ajoutez des pages)
2. **Description** entre 150-160 caractères
3. **Headings hiérarchiques** : h1 > h2 > h3 (déjà en place)
4. **Texte alternatif** pour toutes les images

### Technique

1. **HTTPS obligatoire** : Redirection HTTP → HTTPS
2. **Mobile-first** : Déjà responsive (validé)
3. **Core Web Vitals** : LCP < 2.5s, FID < 100ms, CLS < 0.1

---

## Notes

Cette documentation sera à mettre à jour avec les vraies valeurs une fois le domaine et les réseaux sociaux créés. Conserver ce fichier comme référence pour l'implémentation.

**Contact :** Adrien Mercadier
**Projet :** Portfolio V3
**Version :** 1.0