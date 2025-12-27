# Template pour vos Documentations

## Structure du Frontmatter

Copiez ce template au début de chacun de vos fichiers Markdown :

```yaml
---
title: "[Titre clair et descriptif de votre documentation]"
description: "[Résumé en 1-2 phrases pour les aperçus]"
category: [choisir parmi les catégories ci-dessous]
date: 2024-12-27  # Format YYYY-MM-DD
tags:
  - tag1
  - tag2
  - tag3
author: Adrien Mercadier
difficulty: intermediate  # beginner | intermediate | advanced (optionnel)
featured: false  # true pour mettre en avant des docs importantes (optionnel)
---

# Votre Titre Principal

Votre contenu Markdown ici...
```

## Catégories Disponibles

Choisissez UNE catégorie parmi :

- `active-directory` → **Active Directory** - Gestion des domaines et GPO
- `paloalto` → **Réseau & Sécurité** - Pare-feu et sécurité réseau
- `monitoring` → **Monitoring & Logs** - Observabilité et supervision
- `proxmox` → **Virtualisation** - Machines virtuelles et conteneurs
- `linux` → **Linux** - Administration système Linux
- `windows` → **Windows Server** - Administration Windows
- `docker` → **Docker** - Conteneurisation et orchestration
- `backup` → **Backup & DR** - Sauvegarde et récupération
- `network` → **Réseau** - Infrastructure réseau
- `security` → **Sécurité** - Hardening et conformité
- `documentation` → **Documentation Tech** - Documentation technique et guides
- `architecture` → **Architecture** - Architecture système et infrastructure
- `multimedia` → **Multimédia** - Solutions multimédia et streaming
- `llm` → **LLM & IA** - Intelligence artificielle et LLM

## Convention de Nommage des Fichiers

Format recommandé : `{category}-{numero}-{slug}.md`

Exemples :
- `monitoring-01-grafana-installation.md`
- `active-directory-02-gpo-configuration.md`
- `docker-05-compose-best-practices.md`

## Exemples de Tags

Ajoutez 3-5 tags pertinents pour faciliter la recherche :

**Pour Monitoring** :
- grafana, prometheus, loki, alertmanager
- observability, metrics, logs, traces
- dashboard, visualization

**Pour Active Directory** :
- windows-server, domain-controller, gpo
- dns, dhcp, ldap, kerberos
- authentication, security

**Pour Docker** :
- containers, docker-compose, orchestration
- dockerfile, volumes, networks
- microservices, deployment

**Pour Réseau** :
- firewall, routing, switching
- vlan, vpn, security
- palo-alto, cisco, fortinet

## Processus d'Ajout d'une Documentation

1. **Créer le fichier** dans `src/content/docs/`
2. **Copier le template** frontmatter
3. **Remplir les métadonnées** :
   - Titre clair et descriptif
   - Description de 1-2 phrases
   - Catégorie appropriée
   - Date de création (format YYYY-MM-DD)
   - 3-5 tags pertinents
4. **Ajouter le contenu** Markdown
5. **Tester** : `npm run build`

## Validation

Pour valider que votre documentation est correcte :

```bash
# Tester le build
npm run build

# Si erreur, vérifier :
# - Le frontmatter est bien formaté (YAML valide)
# - La date est au format YYYY-MM-DD
# - La catégorie existe dans la liste ci-dessus
# - Le titre et la description sont présents
```

## Conseils

- **Titre** : Soyez précis et descriptif (ex: "Installation de Grafana sur Ubuntu 22.04")
- **Description** : Résumez en 1-2 phrases ce que contient la doc
- **Tags** : Utilisez des tags qui aideront à retrouver la doc par recherche
- **Difficulté** :
  - `beginner` : Pour les bases et introductions
  - `intermediate` : Pour les configurations standard
  - `advanced` : Pour les configurations complexes
- **Featured** : Réservez `true` pour les 5-10 docs les plus importantes

## Structure Markdown Recommandée

```markdown
# Titre Principal

## Introduction
Brève introduction du sujet

## Prérequis
- Liste des prérequis
- Versions logicielles
- Accès nécessaires

## Installation / Configuration

### Étape 1
Instructions détaillées

### Étape 2
Instructions détaillées

## Exemples / Usage
Exemples concrets d'utilisation

## Dépannage
Problèmes courants et solutions

## Conclusion
Résumé et prochaines étapes

## Ressources
- Liens vers documentation officielle
- Tutoriels complémentaires
```

## Support Images

Pour ajouter des images dans vos documentations :

1. Créer le dossier : `public/docs/images/`
2. Placer vos images dedans
3. Référencer dans le Markdown :

```markdown
![Description de l'image](/docs/images/mon-screenshot.png)
```

---

**Prêt à migrer vos 98 documentations !** 🚀

Commencez par quelques fichiers de test, validez que tout fonctionne, puis migrez progressivement le reste.
