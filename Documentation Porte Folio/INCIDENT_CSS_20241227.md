# Incident CSS - 27 Décembre 2024

## 📋 RÉSUMÉ EXÉCUTIF

**Date**: 27 décembre 2024, 17h49 - 19h00
**Durée**: ~1h15
**Gravité**: 🔴 CRITIQUE - Site complètement cassé (aucun CSS ne se charge)
**Statut**: ✅ RÉSOLU
**Version affectée**: V3.11 (et V3.10 en réalité)

---

## 🔍 SYMPTÔMES OBSERVÉS

### Ce qui fonctionnait
- ✅ Animation de boot terminal (neofetch)
- ✅ Effet de neige JavaScript
- ✅ Défilement de certains textes
- ✅ Serveur Astro démarre sans erreur (200 OK)

### Ce qui NE fonctionnait PAS
- ❌ **AUCUN STYLE CSS** appliqué
- ❌ Tout affiché en noir/blanc sans mise en forme
- ❌ Pas de couleurs neon (cyan, magenta, green)
- ❌ Pas de layout/grilles
- ❌ Modals non stylisées

### Capture Console Navigateur
```
✓ Portfolio ready event received
⚠ Portfolio not visible after 3s, forcing display
Portfolio element: FOUND
Hero element: FOUND
Skills element: FOUND
Portfolio HTML length: 334029
Portfolio has visible class: true
```

**Conclusion**: Le JavaScript fonctionne, le DOM est généré, mais **aucun CSS ne se charge**.

---

## 🕵️ INVESTIGATION

### Tentatives Infructueuses

#### 1. Rollback Git vers V3.10 (commit 042065d)
```bash
git reset --hard 042065d
npm install
npm run dev
```
**Résultat**: ❌ Même problème - Le bug existait DÉJÀ dans V3.10

#### 2. Suppression .astro cache + réinstallation node_modules (x3)
```bash
rd /s /q .astro node_modules
npm install
```
**Résultat**: ❌ Pas d'amélioration

#### 3. Modification markdown-parser.js (race condition supposée)
- Ajout événement `markdownParserReady`
- Modification modal-system.js pour attendre le parser
**Résultat**: ❌ N'était pas le vrai problème

#### 4. Ajout terminal-boot.js dans BaseLayout
- Tentative de charger le script
**Résultat**: ❌ Erreur "Identifier already declared" (double chargement)

---

## ✅ CAUSE RACINE IDENTIFIÉE

### Fichier: `src/layouts/BaseLayout.astro`

#### ❌ CODE ERRONÉ (lignes 29-31)
```html
<!-- Global CSS -->
<style is:global>
    @import '../styles/global.css';
</style>
```

### Pourquoi ça ne fonctionnait pas?

**Astro ne traite PAS les `@import` CSS dans les balises `<style>`**

- Les `@import` ne sont pas processés par le bundler Vite
- Le fichier `global.css` n'est jamais chargé
- Seuls les styles inline des composants sont appliqués
- Résultat: Variables CSS non définies, styles de base absents

### Documentation officielle confirmée

D'après `TROUBLESHOOTING.md` (lignes 38-44):
> "The styles CSS are now inline in BaseLayout.astro via `<style is:global>`. If the styles ne s'appliquent pas:
> 1. Verify that `src/styles/global.css` exists
> 2. Verify the console for CSS errors
> 3. Inspect an element in DevTools to see if CSS variables are defined"

**MAIS**: La documentation dit "inline" alors qu'il faut un **import dans le frontmatter**.

---

## ✅ SOLUTION APPLIQUÉE

### Modification: `src/layouts/BaseLayout.astro`

#### Ligne 3 - Ajout import CSS
```diff
---
import DocModal from '../components/ui/DocModal.astro';
+ import '../styles/global.css';

interface Props {
  title?: string;
  description?: string;
}
```

#### Lignes 28-31 - Suppression bloc style erroné
```diff
-    <!-- Global CSS -->
-    <style is:global>
-        @import '../styles/global.css';
-    </style>
```

### Code Final Correct
```astro
---
import DocModal from '../components/ui/DocModal.astro';
import '../styles/global.css';  // ← CORRECTION

interface Props {
  title?: string;
  description?: string;
}

const {
  title = 'Adrien Mercadier | TSSR',
  description = 'Portfolio de Adrien Mercadier - Technicien Supérieur Systèmes et Réseaux'
} = Astro.props;
---

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content={description}>
    <title>{title}</title>

    <!-- Fonts: Brutalist choices -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Custom Cursor -->
    <div class="custom-cursor" id="cursor"></div>

    <!-- Three.js Background -->
    <canvas id="three-canvas"></canvas>

    <!-- Main Content -->
    <slot />

    <!-- Documentation Modal -->
    <DocModal />

    <!-- Three.js via CDN -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

    <!-- Custom Scripts -->
    <script is:inline src="/scripts/custom-cursor.js"></script>
    <script is:inline src="/scripts/three-background.js"></script>
    <script is:inline src="/scripts/scroll-animations.js"></script>
    <script is:inline src="/scripts/typing-effect.js"></script>
    <script is:inline src="/scripts/modal-system.js"></script>
    <script is:inline src="/scripts/doc-counter.js"></script>
</body>
</html>
```

---

## 📊 RÉSULTAT APRÈS CORRECTION

### Build réussi
```
18:56:48 [build] 1 page(s) built in 6.31s
18:56:48 [build] Complete!
```

### Dev server sur port 4326
```
astro  v5.16.6 ready in 1242 ms

┃ Local    http://localhost:4326/
┃ Network  use --host to expose

18:57:13 watching for file changes...
18:57:32 [200] / 179ms
```

### État du site
- ✅ Animation boot terminal fonctionne
- ✅ CSS chargé (version précédente restaurée)
- ✅ Styles appliqués
- ❌ Erreurs 404 sur docs (problème séparé - modal system)

---

## 📝 MODIFICATIONS VERSION 3.11 À VÉRIFIER

### Fichiers modifiés entre V3.10 et V3.11

D'après le commit V3.11:
```
feat: V3.11 - Dynamic documentation integration with web-front category

- Add 'web-front' category to documentation schema
- Add categoryMapping configuration for Web & Front-end
- Create updateDocMetadata.js script for automatic metadata sync
- Add npm script 'update-docs' for documentation updates
- Generate reference-portfolio.md in docs collection with auto metadata
- Update REFERENCE_PORTFOLIO.md with Git workflow section
```

### Fichiers suspects à investiguer

1. **`src/content/config.ts`**
   - Ajout catégorie "web-front"
   - Vérifier si changements de schema

2. **`src/utils/updateDocMetadata.ts`**
   - Nouveau fichier
   - Script de synchronisation metadata

3. **`public/scripts/markdown-parser.js`**
   - Peut-être ajouté/modifié en V3.11
   - Parser markdown pour modals docs

4. **`public/scripts/modal-system.js`**
   - Erreurs 404 sur fichiers docs
   - Peut nécessiter corrections

5. **`src/components/ui/DocModal.astro`**
   - Composant modal documentation
   - Vérifier intégration

### Erreurs Console Actuelles

```
❌ GET http://localhost:4326/docs/troubleshooting_ldap_globalprotect_15122025.md 404 (Not Found)
❌ GET http://localhost:4326/docs/rapport_securite_protolab_globalprotect.md 404 (Not Found)
```

**Problème**: Le modal system cherche des fichiers `.md` à la racine `/docs/` mais ils doivent être dans `src/content/docs/`.

---

## 🎯 PROCHAINES ÉTAPES

### 1. Vérifier intégration V3.11
- [ ] Comparer fichiers modifiés V3.10 vs V3.11
- [ ] Identifier TOUS les changements de V3.11
- [ ] Tester chaque modification individuellement

### 2. Corriger système modal documentation
- [ ] Vérifier paths des fichiers docs
- [ ] Corriger `modal-system.js` si nécessaire
- [ ] Tester ouverture modals docs

### 3. Valider comportement global
- [ ] Tester tous les modals (skills, projects, docs)
- [ ] Vérifier animations
- [ ] Vérifier responsive

### 4. Commit final
- [ ] Commit correction CSS
- [ ] Commit corrections V3.11 si nécessaire
- [ ] Tag version V3.11.1 (bugfix)

---

## 🔧 COMMANDES UTILES

### Nettoyage complet
```bash
rd /s /q .astro node_modules
npm install
```

### Build + Dev
```bash
npm run build
npm run dev
```

### Check ports utilisés
```bash
netstat -ano | findstr :4321
```

### Git - Voir différences
```bash
git diff V3.10 V3.11 -- src/layouts/BaseLayout.astro
git log --oneline --graph
```

---

## 📚 LEÇONS APPRISES

### 1. Astro CSS Import
- ✅ **CORRECT**: `import '../styles/global.css';` dans frontmatter
- ❌ **INCORRECT**: `@import` dans `<style is:global>`
- ❌ **INCORRECT**: `<link>` avec path relatif

### 2. Debugging méthodique
- Toujours vérifier le code ACTUEL avant rollback
- Comparer versions git avec `git diff`
- Ne pas supposer que rollback résout tout

### 3. Documentation
- Vérifier que la doc est à jour
- La doc peut contenir des erreurs
- Toujours tester les solutions de la doc

### 4. Multiple serveurs dev
- Astro incrémente les ports si occupés (4321 → 4326)
- Arrêter tous les serveurs avant redémarrage
- Vérifier quel serveur on teste vraiment

---

## 🚨 RAPPELS IMPORTANTS

### Ne JAMAIS faire
- ❌ Utiliser `@import` dans les balises `<style>` Astro
- ❌ Supposer qu'un rollback git résout le problème sans vérifier
- ❌ Faire plusieurs modifications en même temps sans tester

### TOUJOURS faire
- ✅ Importer CSS dans le frontmatter Astro
- ✅ Vérifier la console navigateur (F12)
- ✅ Tester une modification à la fois
- ✅ Documenter les incidents

---

## 📞 CONTACT & SUPPORT

**Développeur**: Claude Code (Assistant IA)
**Propriétaire**: Adrien Mercadier
**Date incident**: 27/12/2024
**Temps résolution**: ~1h15

---

## 🔗 RÉFÉRENCES

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Guide de dépannage
- [REFERENCE_PORTFOLIO.md](./REFERENCE_PORTFOLIO.md) - Référence technique
- [MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md) - Migration V3
- [Plan de correction](C:\Users\Administrateur.PROTOLAB\.claude\plans\glimmering-tinkering-tulip.md)

---

**FIN DU RAPPORT**
