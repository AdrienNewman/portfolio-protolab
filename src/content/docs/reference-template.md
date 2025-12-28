---
title: "Template de Référence Documentation"
description: "Guide complet des éléments markdown supportés et bonnes pratiques de rédaction"
category: documentation
date: 2025-12-27
tags:
  - markdown
  - documentation
  - astro
author: Adrien Mercadier
difficulty: beginner
featured: false
---

# Template de Référence Documentation

Ce document présente tous les éléments markdown supportés par le système de documentation du portfolio Protolab.

## Introduction

Bienvenue dans le guide de référence. Cette documentation vous aidera à rédiger des documents techniques clairs et bien structurés.

**Important** : Utilisez ce template comme base pour vos nouvelles documentations.

Les éléments clés à retenir :
- Utiliser **H2** pour les sections majeures (apparaissent dans la TOC)
- Utiliser **H3** pour les sous-sections (indentées dans la TOC)
- Garder un espacement généreux entre les sections

## Labels Colorés Automatiques

Le système détecte automatiquement certains mots-clés en **bold** suivis de `:` et leur applique une couleur.

### Labels de Diagnostic (Orange)

**Symptôme** : Description d'un problème observé par l'utilisateur ou le système.

**Root cause** : Explication de la cause profonde du problème identifié.

**Cause** : Alternative à "Root cause" pour décrire l'origine d'un problème.

### Labels de Solution (Vert)

**Solution** : Étapes ou actions pour résoudre le problème.

**Résolution** : Alternative à "Solution" pour décrire la correction appliquée.

**Correction** : Description du fix ou de la modification effectuée.

### Labels Techniques (Cyan)

**Diagnostic** : Analyse technique ou investigation menée.

**Configuration** : Paramètres ou réglages appliqués au système.

### Labels d'Avertissement (Magenta)

**Important** : Information critique à ne pas négliger.

**Attention** : Avertissement sur un risque potentiel.

### Labels Informatifs (Gris)

**Note** : Information complémentaire utile.

## Syntaxe de Base

### Formatage du texte

Le texte peut être formaté de différentes manières :

- **Texte en gras** avec `**texte**`
- *Texte en italique* avec `*texte*`
- `Code inline` avec des backticks

### Liens

Les liens sont créés avec la syntaxe `[texte](url)` :
- [Documentation Astro](https://docs.astro.build)
- [GitHub Protolab](https://github.com/protolab)

## Blocs de Code

### Commandes Terminal

Utilisez le langage `bash` pour les commandes shell :

```bash
# Créer un répertoire
mkdir -p /opt/projet

# Naviguer et lister
cd /opt/projet && ls -la

# Vérifier un service
systemctl status nginx
```

### Configuration YAML avec nom de fichier

Pour les fichiers de configuration Docker Compose :

```yaml:docker-compose.yml
version: '3.8'

services:
  app:
    image: node:20-alpine
    container_name: my-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./app:/app
```

### Code JavaScript

```javascript
// Fonction utilitaire
function formatDate(date) {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

console.log(formatDate(new Date()));
```

### Configuration Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

## Listes et Énumérations

### Liste non ordonnée

- Premier élément de la liste
- Deuxième élément avec détails
- Troisième élément important

### Liste ordonnée

1. Première étape du processus
2. Deuxième étape à suivre
3. Troisième et dernière étape

## Citations et Notes

> **Note importante** : Les blockquotes sont utilisées pour mettre en évidence des informations importantes ou des avertissements. Elles attirent l'attention du lecteur sur des points critiques.

## Tableaux

| Composant | Version | Description |
|-----------|---------|-------------|
| Astro | 5.x | Framework web statique |
| Node.js | 20 LTS | Runtime JavaScript |
| TypeScript | 5.x | Typage statique |

## Exemple de Troubleshooting

Cette section montre comment structurer un document de dépannage.

### Contexte

Environnement de production avec Nginx en reverse proxy.

### Symptômes observés

**Symptôme** : Les requêtes HTTPS retournent une erreur 502 Bad Gateway.

- Le service backend répond correctement en local
- Les logs Nginx montrent des erreurs de connexion
- Le problème apparaît après un redémarrage du serveur

### Investigation

**Diagnostic** : Vérification de la connectivité et des logs.

```bash
# Vérifier le status du backend
systemctl status backend-app

# Consulter les logs Nginx
tail -f /var/log/nginx/error.log

# Tester la connexion locale
curl -v http://localhost:3000/health
```

### Cause identifiée

**Root cause** : Le service backend démarre après Nginx, causant des erreurs de connexion au démarrage.

### Résolution

**Solution** : Configurer les dépendances systemd pour démarrer le backend avant Nginx.

```bash
# Éditer le service Nginx
sudo systemctl edit nginx.service
```

```text:nginx.service.d/override.conf
[Unit]
After=backend-app.service
Requires=backend-app.service
```

**Configuration** : Redémarrer les services pour appliquer.

```bash
sudo systemctl daemon-reload
sudo systemctl restart nginx
```

### Vérification

**Important** : Toujours vérifier que la solution fonctionne correctement.

```bash
# Vérifier le status
systemctl status nginx backend-app

# Tester les requêtes
curl -I https://example.com
```

---

## Bonnes Pratiques

### Structure du document

- Un seul H1 par document (titre principal)
- H2 pour les sections majeures
- H3 pour les sous-sections
- Garder une hiérarchie logique

### Rédaction technique

- Être concis et précis
- Utiliser des exemples concrets
- Documenter les prérequis
- Inclure les commandes de vérification

### Code et commandes

- Toujours spécifier le langage du bloc de code
- Commenter les lignes importantes
- Utiliser des noms de fichiers explicites avec la syntaxe `:filename`

## Conclusion

Ce template couvre l'ensemble des éléments markdown supportés. Utilisez-le comme référence lors de la rédaction de nouvelles documentations.

## Ressources

- [Guide Markdown](https://www.markdownguide.org/)
- [Documentation Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
