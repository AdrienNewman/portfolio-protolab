# Cheatsheet Markdown - Portfolio Protolab

Guide de syntaxe pour la rédaction de documentations uniformes.

---

## Labels Colorés (automatiques)

Les mots-clés en **bold** suivis de `:` sont automatiquement colorés :

| Syntaxe Markdown | Rendu | Couleur |
|------------------|-------|---------|
| `**Symptôme** : description` | **Symptôme** : description | Orange #F5A623 |
| `**Root cause** : explication` | **Root cause** : explication | Orange #F5A623 |
| `**Cause** : explication` | **Cause** : explication | Orange #F5A623 |
| `**Solution** : comment résoudre` | **Solution** : comment résoudre | Vert #00ff88 |
| `**Résolution** : étapes` | **Résolution** : étapes | Vert #00ff88 |
| `**Correction** : fix appliqué` | **Correction** : fix appliqué | Vert #00ff88 |
| `**Diagnostic** : analyse` | **Diagnostic** : analyse | Cyan #00ffff |
| `**Configuration** : paramètres` | **Configuration** : paramètres | Cyan #00ffff |
| `**Important** : à retenir` | **Important** : à retenir | Magenta #ff0080 |
| `**Attention** : avertissement` | **Attention** : avertissement | Magenta #ff0080 |
| `**Note** : information` | **Note** : information | Gris clair |

---

## Titres

```markdown
# H1 - Titre principal (1 seul par document)
## H2 - Section majeure (apparaît dans la TOC)
### H3 - Sous-section (apparaît dans la TOC, indenté)
#### H4 - Détail
```

**Bonnes pratiques :**
- Un seul H1 par document
- H2 pour les grandes sections
- H3 pour les sous-sections
- Espacement généreux entre sections

---

## Code

### Code inline

```markdown
Utilisez `commande` pour exécuter
```

### Bloc de code simple

````markdown
```bash
echo "Hello World"
```
````

### Bloc de code avec nom de fichier

````markdown
```yaml:docker-compose.yml
version: '3.8'
services:
  app:
    image: node:20
```
````

**Langages supportés :** bash, yaml, json, javascript, typescript, python, nginx, dockerfile, sql, html, css, text

---

## Listes

### Liste à puces

```markdown
- Premier élément
- Deuxième élément
- Troisième élément
```

### Liste numérotée

```markdown
1. Première étape
2. Deuxième étape
3. Troisième étape
```

---

## Formatage du texte

| Syntaxe | Rendu |
|---------|-------|
| `**texte en gras**` | **texte en gras** |
| `*texte en italique*` | *texte en italique* |
| `[Lien](https://url.com)` | [Lien](https://url.com) |

---

## Blockquotes (citations)

```markdown
> Citation ou note importante qui mérite d'être mise en évidence.
```

Rendu : bordure magenta à gauche, fond subtil.

---

## Tableaux

```markdown
| Colonne 1 | Colonne 2 | Colonne 3 |
|-----------|-----------|-----------|
| Valeur A  | Valeur B  | Valeur C  |
| Valeur D  | Valeur E  | Valeur F  |
```

---

## Séparateurs

```markdown
---
```

Crée une ligne horizontale avec gradient cyan.

---

## Structure Recommandée pour Troubleshooting

```markdown
# Titre du Problème

## Contexte

Description du contexte et de l'environnement.

## Symptômes

**Symptôme** : Description du problème observé.

- Comportement anormal 1
- Comportement anormal 2

## Diagnostic

**Diagnostic** : Analyse effectuée.

```bash
# Commandes de diagnostic
systemctl status service
journalctl -u service
```

## Root Cause

**Root cause** : Explication de la cause racine.

## Solution

**Solution** : Étapes pour résoudre le problème.

1. Première action
2. Deuxième action
3. Vérification

```bash
# Commandes de résolution
systemctl restart service
```

## Vérification

**Configuration** : Paramètres finaux appliqués.

---

## Ressources

- [Documentation officielle](https://url.com)
```

---

## Frontmatter YAML

Chaque document doit commencer par un frontmatter :

```yaml
---
title: "Titre du Document"
description: "Description courte du contenu"
category: monitoring  # ou: active-directory, paloalto, web-front, etc.
date: 2025-12-27
tags:
  - grafana
  - prometheus
  - docker
author: Adrien Mercadier
difficulty: intermediate  # beginner, intermediate, advanced
featured: false
---
```

**Catégories disponibles :**
- `active-directory`
- `paloalto`
- `monitoring`
- `web-front`
- `documentation`

---

## Tags Technologiques (icônes)

Les tags suivants affichent des icônes de marque :

`grafana`, `prometheus`, `docker`, `kubernetes`, `proxmox`, `paloalto`, `nginx`, `linux`, `windows`, `debian`, `ubuntu`, `astro`, `typescript`, `javascript`, `python`, `git`, `ansible`, `terraform`, `elasticsearch`, `kibana`, `logstash`, `bash`, `vmware`, `traefik`

**Note :** Les tags thématiques (monitoring, security, infrastructure...) sont filtrés et n'apparaissent pas comme icônes.

---

## Exemple Complet

```markdown
---
title: "Configuration Grafana avec Prometheus"
description: "Guide d'installation et configuration de Grafana connecté à Prometheus"
category: monitoring
date: 2025-12-27
tags:
  - grafana
  - prometheus
  - docker
author: Adrien Mercadier
difficulty: intermediate
featured: true
---

# Configuration Grafana avec Prometheus

## Introduction

Ce guide explique comment configurer Grafana avec Prometheus comme source de données.

## Prérequis

- Docker installé
- Prometheus fonctionnel
- Accès réseau entre les services

## Installation

**Configuration** : Paramètres Docker Compose.

```yaml:docker-compose.yml
version: '3.8'
services:
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
```

## Configuration

1. Accéder à l'interface Grafana
2. Ajouter une data source Prometheus
3. Importer un dashboard

**Important** : Vérifiez la connectivité avant de continuer.

## Troubleshooting

**Symptôme** : Grafana ne se connecte pas à Prometheus.

**Diagnostic** : Vérifier la résolution DNS.

```bash
docker exec grafana ping prometheus
```

**Solution** : Utiliser le nom du service Docker au lieu de localhost.

---

## Ressources

- [Documentation Grafana](https://grafana.com/docs/)
- [Documentation Prometheus](https://prometheus.io/docs/)
```
