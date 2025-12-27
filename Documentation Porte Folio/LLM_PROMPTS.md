# LLM Prompts — Reprise du projet Portfolio Protolab

Date : 27 décembre 2025
But : fournir un jeu de prompts prêts à l'emploi (système + user) pour permettre à un LLM local (ex : Ollama) ou distant (Claude, GPT) de reprendre, modifier ou corriger le projet `portefolio V3`.

---

## Mode d'emploi rapide
- Fournir au LLM le contexte minimal avant d'envoyer la tâche :
  - `package.json`, `astro.config.mjs`, `tsconfig.json`
  - `src/pages/index.astro`, `src/layouts/BaseLayout.astro`, `src/styles/global.css`
  - `src/content/config.ts`, `public/scripts/*`, `src/components/*` (ou un extrait)
- Préfixer l'appel avec un `System prompt` clair (rôle, contraintes, format de sortie attendu).
- Demander explicitement un patch/diff lorsque vous voulez que le LLM fournisse des modifications de fichiers (format `*** Begin Patch` / `*** End Patch` ou `git diff` style). Le repo accepte les modifications via patches.
- Pour exécuter localement avec Ollama ou autre LLM offline, fournir les fichiers essentiels ou résumés.

---

## Template - System prompt (FR)

Tu es un ingénieur logiciel expert en frontend (Astro v5), TypeScript, JavaScript et déploiement Docker. Tu travailles sur le repository local suivant : `portefolio V3`.
Contraintes :
- Réponds uniquement en français.
- Quand une tâche implique de modifier des fichiers, fournis UNIQUEMENT un patch au format `*** Begin Patch` / `*** End Patch` (diff multi-fichier). N'ajoute pas d'autres commentaires dans le patch.
- Si tu ne peux pas produire un patch sûr, explique brièvement les étapes manuelles précises à suivre.
- Ne modifie pas les fichiers non demandés.

---

## Template - System prompt (EN)

You are a senior frontend engineer familiar with Astro v5, TypeScript and Docker. Work on the local repo `portefolio V3`.
Constraints:
- Respond in English.
- When asked to change files, return ONLY a patch in the `*** Begin Patch` / `*** End Patch` format.
- If you cannot safely generate a patch, explain step-by-step manual instructions.

---

## Prompts prêts à l'emploi (tâches courantes)

1) Ajouter un nouveau modal projet "project-gitlab"

System (FR) : utiliser le template système ci-dessus.
User :
```
Contexte : repo Astro statique. Tâche : ajoute un nouveau modal projet nommé `project-gitlab`.
- Crée un nouveau composant sous `src/components/modals/ProjectGitlab.astro` reprenant la structure des autres `Project*` (header, sections: Présentation, Architecture, Stack, Conclusion).
- Insère l'appel à `<ProjectGitlab />` dans `src/pages/index.astro` juste après les autres `Project*`.
Retourne uniquement le patch diff à appliquer.
```

2) Extraire un bloc modal volumineux depuis `index.astro` vers `src/components/modals/ModalExample.astro`

System : utilise le template.
User :
```
Contexte : `src/pages/index.astro` contient un gros bloc HTML pour la modal `modal-xxx`.
Tâche : extrait le bloc HTML entier correspondant à `id="modal-xxx"` dans un nouveau fichier `src/components/modals/ModalXxx.astro` et remplace le bloc dans `index.astro` par `<ModalXxx />`.
Assure-toi d'importer le composant en haut de `index.astro`.
Fourni uniquement le patch.
```

3) Corriger le warning "Modal not found for card"

System : template FR.
User :
```
Contexte : le script `public/scripts/modal-system.js` loggue "Modal not found for card".
Tâche : 1) Diagnostique la cause probable (mismatch `data-modal` vs id ou modal non injectée), 2) Propose un patch minimal si possible (ex: injecter l'appel au composant manquant dans `index.astro`) et 3) propose une alternative : retarder initModals() jusqu'à `portfolioReady`.
Retourne diagnostic + patch si applicable.
```

4) Générer un composant `ProjectGallery.astro` qui lit la collection `projects`

System : template FR.
User :
```
Contexte : `astro:content` collection `projects` existe.
Tâche : crée `src/components/ui/ProjectGallery.astro` qui importe `getCollection` et affiche les `ProjectCard` (ou fallback si vide). Donne patch et tests manuels (commande build + vérifier html généré).
```

5) Ajouter un job CI (GitHub Actions) pour build

System : template FR.
User :
```
Contexte : on veut que la CI build le site.
Tâche : ajoute `.github/workflows/build.yml` qui : checkout, setup-node 20, cache node-modules, `npm ci`, `npm run build`. Retourne patch complet.
```

6) Écrire un test E2E minimal Playwright

System : template FR.
User :
```
Contexte : test vérifiera que la page principale charge et que les modals s'ouvrent.
Tâche : ajouter `tests/e2e/modal.spec.ts` (Playwright) qui : lance `page.goto('http://localhost:4321')`, vérifie qu'un `skill-card` existe, simule hover -> assert preview active, clique -> assert detail modal visible. Fournis patch et instructions pour exécuter.
```

7) Debug client-side (headless) — script Puppeteer pour vérifier warnings

System : template FR.
User :
```
Contexte : je veux un script node qui ouvre la page dev et capture la console.
Tâche : crée `scripts/test-modal-headless.js` (puppeteer) qui : lance chrome headless, goto `http://localhost:4321`, capture console messages, recherche "Modal not found" et capture screenshot si présent. Retourne patch et commande pour lancer.
```

---

## Templates de sortie demandée (patch)

Quand tu veux que le LLM fournisse un patch, demande explicitement ce format dans le user prompt :
```
Retourne uniquement un patch au format :
*** Begin Patch
*** Update File: path/to/file
@@
-[old lines]
+[new lines]
*** End Patch
```

Exemple utilisateur :
```
Fournis un patch qui ajoute un import et une ligne de rendu `<ProjectGitlab />` dans `src/pages/index.astro`.
```

---

## Conseils pour fournir du contexte au LLM
- Ne pas envoyer l'intégralité du projet si le modèle a une fenêtre contextuelle limitée. Préférer :
  - les fichiers listés plus haut (package.json, index.astro, modal-system.js, BaseLayout, content/config.ts)
  - ou des extraits ciblés (les 200-400 lignes autour du bloc à modifier).
- Pour tests locaux avec Ollama : installe Ollama et utilisez `ollama run --model <model> --prompt-file=...` ou l'API locale selon la doc Ollama.

---

## Exemples opérationnels (prompts complets)

A) Extrait + patch : ajouter modal Windows

System (FR) : utilise le template système.
User :
```
Fournis un patch qui :
1) crée `src/components/modals/ProjectGitlab.astro` (modal structure copy des autres Project*),
2) ajoute `<ProjectGitlab />` dans `src/pages/index.astro` après les autres `Project*`,
3) confirme que `id` du modal est `project-gitlab`.
Retourne uniquement le patch.
```

B) Fix rapide pour `modal-system.js` init

System : template FR
User :
```
Contexte : initModals() est appelé sur DOMContentLoaded; parfois le boot script retire temporairement le DOM.
Tâche : propose un patch minimal qui :
- modifie `public/scripts/modal-system.js` pour appeler `initModals()` uniquement après `portfolioReady` (tout en gardant fallback DOMContentLoaded).
Retourne le patch.
```

---

## Bonnes pratiques pour la reprise via LLM
- Toujours valider le patch localement (`npm run build`) avant merge.
- Garder les changes petits et atomiques (1 fonctionnalité/patch).
- Inclure une description courte dans le message de commit généré par le LLM.
- Pour modifications invasives (refactor volumineux), demander un plan en étapes et reviewer chaque patch.

---

## Fichiers utiles à fournir au LLM (checklist pour l'utilisateur)
- `package.json`
- `astro.config.mjs`
- `tsconfig.json`
- `src/pages/index.astro` (ou extrait)
- `src/layouts/BaseLayout.astro`
- `public/scripts/modal-system.js`
- `src/components/modals/*` (si existants)
- `src/content/config.ts`

---

Si tu veux, je peux :
- 1) appliquer automatiquement un des prompts ci‑dessus (créer le modal Gitlab, extraire un bloc, corriger `modal-system.js`) et revenir avec le patch et le résultat du build;
- 2) générer un ensemble complet de tests Playwright + script Puppeteer et lancer un test headless.

Quelle action veux-tu que j'exécute maintenant ?
