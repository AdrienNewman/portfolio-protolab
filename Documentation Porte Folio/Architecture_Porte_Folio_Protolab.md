🏗️ Architecture Complète de ton Infrastructure
📦 CT210 (web-gateway) : Le Serveur Web Centralisé
Rôle : C'est ton serveur web principal qui héberge et expose tous tes services web.

┌─────────────────────────────────────────────────┐
│  CT210 - web-gateway (10.1.10.50)              │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Docker (moteur de conteneurisation)      │ │
│  │                                           │ │
│  │  ┌─────────────┐    ┌─────────────┐      │ │
│  │  │  Traefik    │    │  Portfolio  │      │ │
│  │  │  (Reverse   │◄───│  (Ton site) │      │ │
│  │  │   Proxy)    │    │             │      │ │
│  │  └─────────────┘    └─────────────┘      │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
🔄 Flux de Déploiement (Comment ton site arrive sur le serveur)
Option 1 : Clone depuis GitHub (Recommandée)

# Sur CT210
cd /opt/docker/portfolio
git clone https://github.com/AdrienNewman/portfolio-protolab.git .

# Le code est maintenant sur le serveur
# Docker va builder et lancer le site
docker compose up -d --build
Avantages :
✅ Facile à mettre à jour (git pull)
✅ Historique des versions
✅ Synchronisation automatique
Option 2 : Copie directe (Déconseillée)

# Depuis ton PC Windows
scp -r "C:\Users\Beweb\...\portefolio V3" root@10.1.10.50:/opt/docker/portfolio/
Inconvénients :
❌ Pas de gestion de versions
❌ Pas de synchronisation
❌ Fastidieux à mettre à jour
🎯 Rôle de GitHub
GitHub = Dépôt Central de Code Source

Ton PC (Dev)  ──git push──►  GitHub  ◄──git pull──  CT210 (Prod)
                              (Cloud)
Fonctions :
Sauvegarde : Oui, mais pas seulement !
Versioning : Historique complet des modifications
Source de vérité : Le code "officiel" est sur GitHub
Déploiement : Le serveur CT210 récupère le code depuis GitHub
Workflow typique :

# 1. Tu développes sur ton PC
cd "C:\Users\Beweb\...\portefolio V3"
# Modifications...

# 2. Tu push vers GitHub
git add .
git commit -m "Nouvelle fonctionnalité"
git push origin master

# 3. Tu déploies sur le serveur
ssh root@10.1.10.50
cd /opt/docker/portfolio
git pull origin master
docker compose up -d --build
🚦 Rôle de Traefik (Reverse Proxy)
Traefik = Le Chef d'Orchestre du Trafic Web
Sans Traefik (Architecture Simple - Problématique)

Internet ──► Portfolio :4321
         ──► Grafana :3000  
         ──► Proxmox :8006
         ──► Firewall :443
Problèmes :
❌ Chaque service sur un port différent (utilisateur doit retenir les ports)
❌ Exposition de tous les ports (risque sécurité)
❌ Pas de gestion SSL centralisée
❌ Pas de load balancing
Avec Traefik (Architecture Professionnelle)

                     ┌──────────────┐
Internet/Utilisateur │   Traefik    │  Port 80 (HTTP)
                     │ Reverse Proxy│  Port 443 (HTTPS)
                     └──────┬───────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
   portfolio          grafana            proxmox
   :4321              :3000              :8006
Fonctions de Traefik :
1️⃣ Routage par Nom de Domaine

# Configuration dans docker-compose.yml
labels:
  - "traefik.http.routers.portfolio.rule=Host(`portfolio.protolab.local`)"
  - "traefik.http.routers.grafana.rule=Host(`grafana.protolab.local`)"
Résultat :
http://portfolio.protolab.local → Portfolio :4321
http://grafana.protolab.local → Grafana :3000
http://pve.protolab.local → Proxmox :8006
L'utilisateur ne voit que le port 80/443 (standard web) !
2️⃣ SSL/TLS Automatique (HTTPS)

certificatesResolvers:
  letsencrypt:
    acme:
      email: votre@email.com
      storage: /acme.json
Traefik gère :
✅ Génération automatique des certificats SSL (Let's Encrypt)
✅ Renouvellement automatique
✅ Redirection HTTP → HTTPS
3️⃣ Sécurité et Middlewares

http:
  middlewares:
    secure-headers:
      headers:
        frameDeny: true
        browserXssFilter: true
Traefik ajoute :
✅ Headers de sécurité
✅ Rate limiting (anti-DDoS)
✅ Authentification basique possible
4️⃣ Load Balancing et Haute Disponibilité

services:
  portfolio1:
    # Instance 1
  portfolio2:
    # Instance 2

# Traefik distribue automatiquement le trafic
5️⃣ Dashboard de Monitoring

http://traefik.protolab.local:8080
Tu peux voir :
Tous les services actifs
Le routage configuré
Les certificats SSL
Les métriques de trafic
🔍 Exemple Concret : Accès au Portfolio
Étape par Étape
1. Utilisateur tape dans le navigateur :

http://portfolio.protolab.local
2. DNS (DC01) résout :

portfolio.protolab.local → 10.1.10.50
3. Requête arrive sur CT210 port 80 4. Traefik intercepte la requête :

Host: portfolio.protolab.local
↓
Traefik vérifie ses règles de routage
↓
Trouve : traefik.http.routers.portfolio.rule=Host(`portfolio.protolab.local`)
↓
Redirige vers : protolab-portfolio:4321
5. Conteneur Portfolio reçoit la requête :

Node.js (Astro SSR) traite la requête
↓
Génère la page HTML
↓
Renvoie à Traefik
6. Traefik renvoie au client :

HTTP/1.1 200 OK
Content-Type: text/html
[Page HTML du portfolio]
📊 Schéma Complet de l'Infrastructure

┌─────────────────────────────────────────────────────────┐
│                     INTERNET                            │
│                 (Phase 2 - Futur)                       │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────▼───────────┐
         │  Box Fibre            │
         │  Port Forwarding      │
         │  80 → 10.1.10.50:80   │
         │  443 → 10.1.10.50:443 │
         └───────────┬───────────┘
                     │
┌────────────────────┼────────────────────────────────────┐
│  PROTOLAB Network  │                                    │
│                    │                                    │
│  ┌─────────────────▼──────────────────────────────┐    │
│  │  CT210 - web-gateway (10.1.10.50)             │    │
│  │                                                │    │
│  │  ┌──────────────────────────────────────────┐ │    │
│  │  │  Docker Ecosystem                        │ │    │
│  │  │                                          │ │    │
│  │  │  ┌────────────────┐                      │ │    │
│  │  │  │    Traefik     │  Port 80, 443, 8080  │ │    │
│  │  │  │ Reverse Proxy  │                      │ │    │
│  │  │  └────────┬───────┘                      │ │    │
│  │  │           │                              │ │    │
│  │  │  ┌────────┼───────────────────────┐     │ │    │
│  │  │  │        │                       │     │ │    │
│  │  │  │  ┌─────▼──────┐                │     │ │    │
│  │  │  │  │ Portfolio  │  :4321         │     │ │    │
│  │  │  │  │ Astro SSR  │                │     │ │    │
│  │  │  │  │ Node.js 20 │◄── GitHub      │     │ │    │
│  │  │  │  └────────────┘                │     │ │    │
│  │  │  └────────────────────────────────┘     │ │    │
│  │  │           │                              │ │    │
│  │  │           │ Proxy vers services internes │ │    │
│  │  │           ├─► Grafana (10.1.40.35:3000)  │ │    │
│  │  │           ├─► Proxmox (192.168.1.100)    │ │    │
│  │  │           └─► PA-VM (10.1.10.254)        │ │    │
│  │  └──────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────┘    │
│                     │                                   │
│         ┌───────────┼────────────┐                     │
│         ▼           ▼            ▼                     │
│      DC01     VictoriaMetrics  Grafana                 │
│   10.1.10.10    10.1.40.25    10.1.40.35               │
│     (DNS)      (Métriques)   (Dashboards)              │
└─────────────────────────────────────────────────────────┘
💡 Résumé pour Toi
Le Code du Portfolio
Développement : Sur ton PC Windows
Sauvegarde + Versioning : GitHub (master branch)
Production : CT210 clone depuis GitHub
Le Déploiement

# Workflow complet
1. Tu codes sur ton PC
2. git push vers GitHub
3. SSH vers CT210
4. git pull sur CT210
5. docker compose up -d --build
6. Traefik route automatiquement le trafic
Traefik
= Le "Portier Intelligent" qui :
Reçoit toutes les requêtes HTTP/HTTPS
Les route vers le bon service selon le nom de domaine
Gère SSL/TLS automatiquement
Protège avec des middlewares de sécurité
Expose un seul point d'entrée (port 80/443)