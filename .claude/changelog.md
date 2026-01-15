# Changelog Portfolio Protolab

> Auto-généré le 2026-01-04 | Portfolio V4.15

---

## État Actuel

| Métrique | Valeur |
|----------|--------|
| Version | V4.15 |
| Composants | 19 |
| Projets | 5 |
| Documents | 12 |
| Scripts | 26 |
| Astro | 5.16.6 |

---

## Historique des Commits (20 derniers)

| Hash | Version | Description |
|------|---------|-------------|
| `[TBD]` | V4.15 | feat: Unification pattern sauvegarde admin (re-fetch + sync DOM) |
| `eb8d818` | V4.14.2 | fix(mobile): Modals plein écran génériques |
| `ede195e` | V4.14.1 | fix: Modals projets/competences plein ecran mobile |
| `8fdca3a` | V4.14 | feat: Modals plein ecran mobile + navbar compacte |
| `99e623a` | V4.13 | fix: Elimination du FOUT (Flash Of Unstyled Text) |
| `16275ea` | V4.12 | fix: Fix overflow mobile (centrage + 100% viewport) |
| `ac3d911` | V4.11 | feat: Optimisation responsive mobile |
| `92a6040` | V4.10 | feat: Securisation pre-production protolab.ovh |
| `6a107f6` | - | feat: Ajout lien Live_Lab dans la navbar |
| `dc2be89` | V4.9 | feat: Uniformisation composants & securite |
| `2086c02` | V4.8 | feat: Nouveaux projets, prototypes Tesseract & documentation |
| `2c1b05a` | - | docs: Update changelog V4.7 avec détails V4.7.1 |
| `15538be` | V4.7.1 | feat: Service monitoring avec métriques individuelles |
| `53ebe96` | V4.7 | feat: Section LIVE_LAB & Dashboard temps réel Protolab |
| `4d9f3ac` | V4.6 | feat: Section Certifications & optimisation profil |
| `a4801b8` | V4.5 | feat: Accessibility improvements (WCAG 2.1) |
| `788fae9` | - | docs: Update internal documentation with V4.4 boss system |
| `45992b5` | - | docs: Add NetDefender V2 narrative specification |
| `91bc506` | V4.4 | feat: NetDefender boss system & rich narrative content |
| `985642f` | V4.3 | feat: Starfield background, mobile menu UX & floating packet |

---

## Versions Majeures

### V4.15 (2026-01-04)

**Focus** : Unification pattern sauvegarde admin

**Problème résolu** : Après sauvegarde via admin (`:4322`), les tuiles/éditeurs ne reflétaient pas les changements sans refresh manuel

**Solution** : Pattern unifié re-fetch + sync DOM appliqué aux 5 sections éditables

**Modifications** :
- Pattern documenté : `PUT API → Re-fetch données → Sync DOM (tuiles + éditeurs + formulaires)`
- Implémentation sur Hero, Profile, Contact, Skills, Projects
- Migration `ProjectGallery.astro` : `getCollection('projects')` → `projects.json`

**Fichiers impactés** :
- `admin/src/pages/index.astro` (5 handlers submit unifiés)
- `src/components/ui/ProjectGallery.astro` (source de données)

**Bénéfices** :
- Cohérence garantie entre serveur et UI
- Expérience édition fluide sans refresh manuel
- Architecture maintenable (même pattern partout)

---

### V4.14 (2026-01-02)

**Focus** : Mobile experience & modals

- Modals plein écran sur mobile
- Navbar compacte responsive
- Composants génériques SkillPreview/SkillModal/ProjectModal
- Élimination FOUT (Flash Of Unstyled Text)
- Fix overflow mobile

---

### V4.10-V4.13 (2026-01-02)

**Focus** : Responsive & sécurité

- Optimisation responsive mobile complète
- Sécurisation pré-production protolab.ovh
- Fix viewport mobile
- Uniformisation composants UI

---

### V4.7-V4.9 (2025-12-28 → 2026-01-02)

**Focus** : Infrastructure monitoring

- Section LIVE_LAB avec dashboard temps réel
- API `/api/lab-status.json` avec polling 30s
- Métriques individuelles par service (CPU, RAM)
- 9 services monitorés (Proxmox, PA-VM, Grafana, etc.)
- Nouveaux projets et prototypes

---

### V4.5-V4.6 (2025-12-28)

**Focus** : Accessibilité & profil

- Améliorations WCAG 2.1
- Section Certifications (Cisco CCNA)
- Optimisation section Profile
- Skip links, focus visible, ARIA labels

---

### V4.2-V4.4 (2025-12-XX)

**Focus** : Easter egg NetDefender

- Séquence intro cinématique
- Système de boss avec IA
- Contenu narratif riche
- Background starfield Three.js
- Floating packet (trigger easter egg)
- Mobile menu amélioré

---

## Évolutions Architecturales

### Design Patterns Adoptés

1. **Composants génériques** (V4.14)
   - SkillPreview/SkillModal remplacent 8 composants spécifiques
   - ProjectModal remplace 5 composants spécifiques
   - Réduction de 13 fichiers à 3

2. **Data-driven content** (V4.7+)
   - `skills.ts` centralise les 8 compétences
   - `projectModals.ts` centralise les 5 modales projets
   - Collections Astro pour projects/docs

3. **API Routes SSR** (V4.7)
   - `/api/lab-status.json` pour monitoring temps réel
   - `/api/docs/[slug].json` pour contenu dynamique
   - Cache avec fallback

4. **Pattern sauvegarde unifié** (V4.15) ⭐ NOUVEAU
   - Re-fetch après PUT pour source de vérité unique
   - Sync DOM automatique (tuiles + éditeurs + formulaires)
   - Appliqué à toutes les sections éditables admin
   - Documentation inline pour maintenabilité

---

## Roadmap (Potentiel)

- [ ] PWA offline support
- [ ] Dark/Light mode toggle
- [ ] Internationalisation (i18n)
- [ ] Analytics intégrés
- [ ] Tests E2E Playwright

---

*Dernière mise à jour : 2026-01-04 | Portfolio Protolab V4.15*