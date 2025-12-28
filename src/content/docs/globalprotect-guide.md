---
title: "Guide Complet GlobalProtect - Protolab"
description: "Configuration complète d'un VPN GlobalProtect sur Palo Alto PA-VM pour accès distant sécurisé à l'infrastructure Protolab avec authentification locale ou AD"
category: paloalto
date: 2025-12-11
tags:
  - paloalto
  - vpn
  - globalprotect
  - windows
  - linux
  - security
author: Adrien Mercadier
difficulty: advanced
featured: true
---

# Guide Complet GlobalProtect - Protolab

**Audience** : Administrateur réseau / TSSR  
**Infrastructure cible** : Protolab.local + Box Red by SFR  
**Objectif** : Accès VPN distant complet et natif aux réseaux Protolab depuis l'extérieur

## Introduction et Concepts Fondamentaux

### Qu'est-ce que GlobalProtect ?

GlobalProtect est une **solution VPN SSL/IPsec intégrée au firewall Palo Alto Networks** qui fournit un accès sécurisé aux utilisateurs distants (télétravailleurs, bureaux satellites) vers le réseau d'entreprise. Contrairement à un VPN traditionnel qui ne fait que "chiffrer le tunnel", GlobalProtect applique les **mêmes politiques de sécurité NGFW (Next-Generation Firewall)** aux postes nomades qu'aux postes internes.

### Principes clés pour l'utilisateur unique

Pour un utilisateur unique accédant à Protolab depuis chez lui (derrière la box Red by SFR) :

- **Un seul identifiant** suffit pour tous les accès
- **Accès transparent** : une fois connecté au VPN, accès à l'ensemble du réseau Protolab (SERVERS, INFRA, CLIENTS, DMZ) comme si vous étiez sur un poste physique
- **Authentification simple** : identifiant + mot de passe, stocké localement sur le PA-VM ou via l'AD Protolab (DC01)
- **Tunnel chiffré** : tout trafic entre le PC et le firewall Protolab passe en HTTPS/SSL ou IPsec

### Différence entre split-tunnel et full-tunnel

| Mode | Trafic Internet | Trafic Protolab | Bande passante | Sécurité |
|------|-----------------|-----------------|----------------|----------|
| **Split-tunnel** | Directement via box SFR | Via VPN Protolab | Optimisée | Bonne |
| **Full-tunnel** | Via VPN Protolab | Via VPN Protolab | Consommée | Maximale |

**Important** : Recommandation pour Protolab : démarrer en **split-tunnel** (accès aux réseaux 10.1.x.x uniquement), puis évoluer en full-tunnel si besoin d'un contrôle centralisé de l'Internet.

## Architecture GlobalProtect Protolab

### Les 3 briques de GlobalProtect

```
┌──────────────────────────────────────────────────────┐
│                  TON PC À LA MAISON                   │
│              (Derrière box Red by SFR)                │
│   ┌──────────────────────────────────┐               │
│   │  GlobalProtect App (client)      │               │
│   │  • Windows/macOS/Linux           │               │
│   │  • Établit tunnel SSL/IPsec      │               │
│   │  • Gère routes, DNS local        │               │
│   └───────────────┬────────────────┘                 │
└────────────────────┼─────────────────────────────────┘
                     │ HTTPS/IPsec chiffré (Port 443 / UDP 4501)
                     │ À travers Internet
                     ▼
┌──────────────────────────────────────────────────────┐
│              BOX RED BY SFR                           │
│     (Redirection port 443 → 192.168.1.254)          │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│          FIREWALL PALO ALTO (PA-VM-50)              │
│     eth1/1 : 192.168.1.254 (OUTSIDE)                │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │  PORTAIL GLOBALPROTECT                         │  │
│  │  • Interface : eth1/1 (192.168.1.254:443)     │  │
│  │  • Rôle : distribution config clients          │  │
│  │  • Authentification : local-db ou AD           │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │  PASSERELLE GLOBALPROTECT (GATEWAY)           │  │
│  │  • Interface externe : eth1/1 (192.168.1.254) │  │
│  │  • Interface tunnel : tunnel.10 (10.1.50.1)   │  │
│  │  • Pool IP VPN : 10.1.50.10-10.1.50.200       │  │
│  │  • Rôle : traite trafic VPN, applique règles  │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│          ↓ Routes accès : 10.1.x.x                  │
│                                                      │
│  ┌────────────────┬──────────────┬────────────────┐ │
│  │  SERVERS       │  INFRA       │  CLIENTS/DMZ   │ │
│  │  10.1.10.0/24  │  10.1.40.0/24│  10.1.20/30    │ │
│  │  eth1/2        │  eth1/5      │  eth1/3/4      │ │
│  └────────────────┴──────────────┴────────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Portail GlobalProtect

- **Emplacement** : PA-VM, interface OUTSIDE (eth1/1 : 192.168.1.254)
- **Port** : 443 (HTTPS)
- **Rôle** :
  - Authentifie l'utilisateur lors de la première connexion
  - Distribue la configuration au client GlobalProtect (listes de passerelles, certificats racine, profils)
  - Gère les paramètres d'agent (sauvegarde credentials, modes de connexion, etc.)
- **Certificat requis** : cert serveur HTTPS valide (auto-signé ou publique)

### Passerelle GlobalProtect (Gateway)

- **Emplacement** : PA-VM
- **Interface externe** : ethernet1/1 (192.168.1.254:443)
- **Interface tunnel** : tunnel.10 (10.1.50.1/24) ← **nouvelle interface à créer**
- **Rôle** :
  - Termine le tunnel SSL/IPsec depuis le client
  - Attribue une IP du pool VPN (10.1.50.10-200) au client
  - Applique les politiques de sécurité et routes d'accès
  - Transmet le trafic vers les réseaux internes (SERVERS, INFRA, etc.)
- **Pool IP VPN** : 10.1.50.0/24 (différent des réseaux existants)

### Agent/App GlobalProtect

- **Installation** : sur le PC (Windows, macOS, Linux)
- **Rôle** :
  - Se connecte au portail (auth utilisateur)
  - Établit un tunnel chiffré avec la passerelle
  - Gère la table de routage (split ou full tunnel)
  - Configure le DNS local pour la résolution Protolab

## Prérequis Techniques

### Côté Firewall PA-VM

#### Logiciels et Licences

- **PAN-OS 11.2** ✅
- **Licence GlobalProtect Portal** : permanent ✅
- **Licence GlobalProtect Gateway** : jusqu'au 31/01/2026 ✅

**Configuration** : Toutes les fonctions requises sont disponibles.

#### Certificats

**Important** : Vous devez disposer d'un **certificat serveur valide** pour le portail/gateway :

- **CN (Common Name)** : doit correspondre au FQDN/IP publique du portail
  - Exemple : `vpn.protolab.home` ou `192.168.1.254` (si IP publique fixe) ou adresse DDNS de la box
  - Pour test lab : auto-signé acceptable, mais demande d'importer le certificat racine sur le client
- **Chaîne de certificats** : racine + intermédiaire (si CA perso)
- **Stockage PA-VM** : Device > Certificate Management > Certificates

**Option facile pour lab** :

```bash
# Générer un cert auto-signé sur le PA-VM
# Via GUI : Device > Certificate Management > Certificates > Generate
# Nom : "GP-Server-Cert"
# CN : "192.168.1.254" ou FQDN du portail
# Validité : 365 jours
```

#### Interfaces et Zones

| Élément | Actuel | À créer |
|--------|--------|---------|
| eth1/1 (OUTSIDE) | 192.168.1.254/24, zone OUTSIDE | ✅ OK |
| eth1/2 (SERVERS) | 10.1.10.1/24, zone SERVERS | ✅ OK |
| eth1/3 (CLIENTS) | 10.1.20.1/24, zone CLIENTS | ✅ OK |
| eth1/4 (DMZ) | 10.1.30.1/24, zone DMZ | ✅ OK |
| eth1/5 (INFRA) | 10.1.40.1/24, zone INFRA | ✅ OK |
| **tunnel.10** | À créer | ❌ **À faire** |
| **Zone VPN-REMOTE** | À créer | ❌ **À faire** |

**À créer** :
1. Interface tunnel.10 : IP 10.1.50.1/24, zone VPN-REMOTE
2. Zone VPN-REMOTE : nouvelle zone pour isoler trafic VPN

#### Routage

- Route par défaut : `0.0.0.0/0 → 192.168.1.1` ✅ (box SFR)
- Routes internes (SERVERS, CLIENTS, INFRA, DMZ) : connected ✅
- Pas de route supplémentaire requise pour tunnel VPN (interface tunnel = routeur local)

### Côté Box Red by SFR

#### Redirection de Port (Port Forwarding)

**Attention** : La box doit rediriger le trafic HTTPS depuis Internet vers le firewall Protolab :

```
Internet (port 443) → Box Red (192.168.1.1) → PA-VM (192.168.1.254:443)
```

**Important** : Pas de redirection = pas d'accès VPN depuis l'extérieur !

**Étapes box SFR** :
1. Accéder au routeur box : http://192.168.1.1
2. Chercher "Redirection de ports" ou "Port Forwarding"
3. Ajouter règle :
   - Port externe : 443 (TCP et UDP si IPsec)
   - Port interne : 443
   - Adresse interne : 192.168.1.254
   - Protocole : TCP (+ UDP pour IPsec)
   - Activer et sauvegarder

#### Alternative DMZ

Si la redirection ne fonctionne pas, mettre 192.168.1.254 en DMZ (moins idéal pour la sécurité) :
1. Paramètres box > DMZ
2. Adresse interne : 192.168.1.254
3. Sauvegarder

### Côté Client (PC)

**Installation** :
- Télécharger GlobalProtect App depuis https://live.paloaltonetworks.com
- Version Windows, macOS ou Linux selon OS
- Droits administrateur requis pour installation

**Configuration requise** :
- Espace disque : ~200 MB
- Connexion Internet active
- Certificat racine CA à importer (si cert auto-signé)

## Glossaire Complet VPN/GlobalProtect

| Terme | Définition |
|-------|-----------|
| **Portal** | Interface web d'authentification et distribution de configuration client |
| **Gateway** | Point de terminaison VPN gérant les tunnels chiffrés |
| **Split-tunnel** | Mode VPN routant uniquement trafic interne via VPN, Internet direct |
| **Full-tunnel** | Mode VPN routant TOUT le trafic (interne + Internet) via VPN |
| **Pool IP** | Plage d'adresses attribuées aux clients VPN |
| **HIP** | Host Information Profile - Vérification posture sécurité client |
| **SSL VPN** | VPN basé sur HTTPS/TLS (port 443) |
| **IPsec** | Protocole VPN alternatif (ESP/UDP port 4501) |

## Configuration CLI Générique

### Création Zone VPN-REMOTE

```bash
set zone VPN-REMOTE network layer3
```

### Création Interface Tunnel

```bash
set network interface tunnel units tunnel.10 ip 10.1.50.1/24
set network interface tunnel units tunnel.10 zone VPN-REMOTE
```

### Profil SSL/TLS avec Certificat

```bash
set shared ssl-tls-service-profile "GP-SSL-Profile" \
  certificate "GP-Server-Cert"
set shared ssl-tls-service-profile "GP-SSL-Profile" \
  protocol-settings min-version tls1-2 max-version max
```

### Profil d'Authentification Local

```bash
# Créer utilisateur local
set mgt-config users "jean.dupont" \
  permissions role-based superuser yes
set mgt-config users "jean.dupont" \
  password

# Créer profil auth
set device authentication-profile "GP-User-Auth" \
  authentication-type local-database
set device authentication-profile "GP-User-Auth" \
  login-attribute "username" admin-use-only no
```

### Configuration Portail GlobalProtect

```bash
# Créer portail
set network globalprotect portals "gp-protolab" \
  server-address 192.168.1.254
set network globalprotect portals "gp-protolab" \
  authentication-profile "GP-User-Auth"
set network globalprotect portals "gp-protolab" \
  ssl-tls-service-profile "GP-SSL-Profile"

# Client authentication
set network globalprotect portals "gp-protolab" \
  client-authentication require-client-authentication yes
set network globalprotect portals "gp-protolab" \
  client-authentication client-cert-authentication \
  certificate-profile none

# Agent config
set network globalprotect portals "gp-protolab" \
  agent "gp-protolab-agent-cfg" agent-user-override \
  user any group any
```

### Configuration Gateway GlobalProtect

```bash
# Créer gateway
set network globalprotect gateways "gp-protolab-gw" \
  local-address ip 192.168.1.254 interface ethernet1/1
set network globalprotect gateways "gp-protolab-gw" \
  authentication-profile "GP-User-Auth"
set network globalprotect gateways "gp-protolab-gw" \
  ssl-tls-service-profile "GP-SSL-Profile"

# Tunnel settings
set network globalprotect gateways "gp-protolab-gw" \
  tunnel-interface tunnel.10

# Pool IP
set network globalprotect gateways "gp-protolab-gw" \
  agent "gp-protolab-agent-cfg" client-ip-pool "10.1.50.10-10.1.50.200"

# DNS et domain
set network globalprotect gateways "gp-protolab-gw" \
  agent "gp-protolab-agent-cfg" dns primary 10.1.10.10
set network globalprotect gateways "gp-protolab-gw" \
  agent "gp-protolab-agent-cfg" access-domain-name "protolab.local"
```

### Split-Tunnel (Routes d'accès)

```bash
# Ajouter routes internes uniquement
set network globalprotect gateways "gp-protolab-gw" \
  agent "gp-protolab-agent-cfg" split-tunnel \
  access-route "10.1.10.0/24"
set network globalprotect gateways "gp-protolab-gw" \
  agent "gp-protolab-agent-cfg" split-tunnel \
  access-route "10.1.20.0/24"
set network globalprotect gateways "gp-protolab-gw" \
  agent "gp-protolab-agent-cfg" split-tunnel \
  access-route "10.1.30.0/24"
set network globalprotect gateways "gp-protolab-gw" \
  agent "gp-protolab-agent-cfg" split-tunnel \
  access-route "10.1.40.0/24"
```

## Configuration CLI Spécifique Protolab

Cette section contient les commandes exactes pour votre infrastructure avec les noms réels.

### Création éléments réseau

```bash
# Zone VPN
set zone VPN-REMOTE network layer3

# Interface tunnel
set network interface tunnel units tunnel.10 ip 10.1.50.1/24
set network interface tunnel units tunnel.10 zone VPN-REMOTE

# Profil SSL
set shared ssl-tls-service-profile "GP-SSL-Profile" \
  certificate "GP-Server-Cert"

commit
```

### Configuration authentification

```bash
# Utilisateur local (remplacer par votre identifiant)
set mgt-config users "jdupont@protolab.local" \
  permissions role-based superuser yes
set mgt-config users "jdupont@protolab.local" password

# Profil auth
set device authentication-profile "GP-User-Auth" \
  authentication-type local-database

commit
```

### Configuration Portail

```bash
set network globalprotect portals "GP-Portal" \
  server-address 192.168.1.254
set network globalprotect portals "GP-Portal" \
  authentication-profile "GP-User-Auth"
set network globalprotect portals "GP-Portal" \
  ssl-tls-service-profile "GP-SSL-Profile"

# Agent config
set network globalprotect portals "GP-Portal" \
  agent "Agent-Config" agent-user-override \
  user any group any

commit
```

### Configuration Gateway

```bash
set network globalprotect gateways "GP-Gateway-N" \
  local-address ip 192.168.1.254 interface ethernet1/1
set network globalprotect gateways "GP-Gateway-N" \
  authentication-profile "GP-User-Auth"
set network globalprotect gateways "GP-Gateway-N" \
  ssl-tls-service-profile "GP-SSL-Profile"
set network globalprotect gateways "GP-Gateway-N" \
  tunnel-interface tunnel.10

# Pool IP VPN
set network globalprotect gateways "GP-Gateway-N" \
  agent "Agent-Config" client-ip-pool "10.1.50.10-10.1.50.200"

# DNS
set network globalprotect gateways "GP-Gateway-N" \
  agent "Agent-Config" dns primary 10.1.10.10
set network globalprotect gateways "GP-Gateway-N" \
  agent "Agent-Config" access-domain-name "protolab.local"

# Split-tunnel
set network globalprotect gateways "GP-Gateway-N" \
  agent "Agent-Config" split-tunnel \
  access-route "10.1.10.0/24"
set network globalprotect gateways "GP-Gateway-N" \
  agent "Agent-Config" split-tunnel \
  access-route "10.1.20.0/24"
set network globalprotect gateways "GP-Gateway-N" \
  agent "Agent-Config" split-tunnel \
  access-route "10.1.30.0/24"
set network globalprotect gateways "GP-Gateway-N" \
  agent "Agent-Config" split-tunnel \
  access-route "10.1.40.0/24"

commit
```

## Politique de Sécurité et NAT

### Règles de sécurité VPN

```bash
# VPN vers SERVERS
set rulebase security rules "VPN-to-SERVERS" from VPN-REMOTE \
  to SERVERS source any destination any \
  service any application any action allow \
  log-setting "default"

# VPN vers INFRA
set rulebase security rules "VPN-to-INFRA" from VPN-REMOTE \
  to INFRA source any destination any \
  service any application any action allow \
  log-setting "default"

# VPN vers CLIENTS
set rulebase security rules "VPN-to-CLIENTS" from VPN-REMOTE \
  to CLIENTS source any destination any \
  service any application any action allow \
  log-setting "default"

# VPN vers DMZ
set rulebase security rules "VPN-to-DMZ" from VPN-REMOTE \
  to DMZ source any destination any \
  service any application any action allow \
  log-setting "default"

commit
```

### NAT pour accès Internet depuis VPN (optionnel)

Si vous passez en full-tunnel plus tard :

```bash
# Source NAT pour VPN → Internet
set rulebase nat rules "VPN-to-OUTSIDE" from VPN-REMOTE \
  to OUTSIDE source 10.1.50.0/24 destination any \
  source-translation dynamic-ip-and-port \
  interface-address interface ethernet1/1 ip 192.168.1.254

commit
```

## Tests et Dépannage

### Installation client GlobalProtect

**Windows** :
1. Télécharger depuis https://live.paloaltonetworks.com
2. Exécuter l'installateur (droits admin)
3. Redémarrer si demandé

**Configuration** :
1. Lancer GlobalProtect
2. Portail : `192.168.1.254` (ou IP publique/FQDN)
3. Utilisateur : `jdupont@protolab.local`
4. Mot de passe : votre mot de passe

### Tests de connectivité

**Test 1 : Connexion VPN**

```powershell
# Vérifier IP VPN attribuée
ipconfig | findstr "10.1.50"
# Résultat attendu : 10.1.50.x
```

**Test 2 : Ping DC01**

```powershell
ping 10.1.10.10
# Résultat attendu : Réponse de 10.1.10.10
```

**Test 3 : Résolution DNS**

```powershell
nslookup dc01.protolab.local
# Résultat attendu : 10.1.10.10
```

**Test 4 : Accès RDP**

```powershell
mstsc /v:10.1.10.10
# Résultat attendu : Fenêtre connexion Bureau à distance
```

### Dépannage

#### Problème : Client ne se connecte pas

**Symptôme** : Erreur "Unable to connect to portal"

**Diagnostic** : Vérifier connectivité réseau au portail

```bash
# Depuis PC client
curl -k https://192.168.1.254/global-protect/login.esp
```

**Solution** : 
- Vérifier box redirection port 443
- Vérifier firewall PA-VM en écoute :

```bash
# CLI PA-VM
> show interface management
> show interface ethernet1/1
```

#### Problème : Authentification échoue

**Symptôme** : "Invalid username or password"

**Diagnostic** :

```bash
# Vérifier utilisateur existe
> show user local-user-database user "jdupont@protolab.local"
```

**Solution** : Recréer utilisateur ou réinitialiser mot de passe

```bash
configure
# set mgt-config users "jdupont@protolab.local" password
commit
```

#### Problème : Pas d'accès aux ressources internes

**Symptôme** : VPN connecté mais impossible de ping 10.1.10.10

**Diagnostic** :

```bash
# Vérifier routes client
route print | findstr 10.1

# Vérifier logs PA-VM
> show log traffic direction equal both source 10.1.50.2
```

**Solution** : Vérifier règles sécurité et routes d'accès :

```bash
# Vérifier split-tunnel configuré
show global-protect gateways "GP-Gateway-N" agent "Agent-Config" split-tunnel

# Vérifier règles sécurité
show security rules from VPN-REMOTE
```

## Points d'Évolution

### Phase 2 : Authentification AD (Active Directory)

Une fois la config locale stable, évoluer vers l'authentification via DC01 (AD Protolab) :

```bash
# Créer LDAP server profile
set device server-profile ldap "gp-protolab-ldap" \
  server add name "DC01" ip "10.1.10.10" port "389"
set device server-profile ldap "gp-protolab-ldap" \
  bind-dn "CN=svc_pauid,CN=Users,DC=protolab,DC=local"
set device server-profile ldap "gp-protolab-ldap" \
  bind-password "*PASSWORD*"
set device server-profile ldap "gp-protolab-ldap" \
  base-dn "DC=protolab,DC=local"

# Créer auth profil LDAP
set device authentication-profile "gp-ad-auth" \
  authentication-type "ldap"
set device authentication-profile "gp-ad-auth" \
  ldap-server-profile "gp-protolab-ldap"
set device authentication-profile "gp-ad-auth" \
  login-attribute "sAMAccountName"

# Changer portail/gateway
set network globalprotect portals "GP-Portal" \
  authentication-profile "gp-ad-auth"
set network globalprotect gateways "GP-Gateway-N" \
  authentication-profile "gp-ad-auth"

commit
```

### Phase 3 : Multi-Facteur (MFA)

Ajouter MFA (ex: Google Authenticator) :

```bash
# TACACS+ ou RADIUS avec OTP
set device server-profile radius "gp-mfa-radius" \
  server add name "radius-srv" ip "10.1.10.20" port "1812" secret "*SHARED_SECRET*"

# Créer auth profil RADIUS
set device authentication-profile "gp-mfa-auth" \
  authentication-type "radius"
set device authentication-profile "gp-mfa-auth" \
  radius-server-profile "gp-mfa-radius"

# Assigner au gateway
set network globalprotect gateways "GP-Gateway-N" \
  authentication-profile "gp-mfa-auth"
```

### Phase 4 : Full-Tunnel Mode

Forcer ALL trafic via VPN (au lieu de split-tunnel) :

```bash
# Remplacer split-tunnel par full-tunnel
set network globalprotect gateways "GP-Gateway-N" \
  agent "Agent-Config" split-tunnel \
  access-route "0.0.0.0/0"  # Tout passe par VPN

# Ajouter route sortie Internet
set security rules "ALLOW-VPN-TO-OUTSIDE" \
  from "VPN-REMOTE" to "OUTSIDE" \
  source "any" destination "any" \
  service "any" action allow

commit
```

## Résumé - Checklist de Déploiement

### Avant Toute Configuration

- [ ] Accès CLI PA-VM (SSH ou GUI console)
- [ ] Certificat serveur généré ou importé
- [ ] IP publique fixe OU DDNS configuré
- [ ] Box SFR accédée (192.168.1.1) pour port forwarding
- [ ] Utilisateur local Protolab créé

### Configuration (En Ordre)

- [ ] Zone VPN-REMOTE créée
- [ ] Interface tunnel.10 créée
- [ ] Profil SSL/TLS créé avec cert serveur
- [ ] Profil auth locale créé avec utilisateur
- [ ] Portail GP créé sur eth1/1:443
- [ ] Gateway GP créée sur eth1/1:443 avec tunnel.10
- [ ] Pool IP 10.1.50.10-200 assigné
- [ ] Routes accès (10.1.x.x) configurées
- [ ] Règles sécurité VPN-REMOTE créées
- [ ] NAT VPN vers OUTSIDE configuré
- [ ] Commit sans erreur

### Box Red by SFR

- [ ] Redirection port 443 → 192.168.1.254 activée
- [ ] Vérification port 443 en écoute sur PA-VM

### Tests Client

- [ ] App GlobalProtect installée
- [ ] Connexion au portail OK
- [ ] Authentification réussie
- [ ] IP VPN attribuée (10.1.50.x)
- [ ] Ping 10.1.10.10 OK
- [ ] Accès DC01 / services OK
- [ ] Logs PA-VM montrent trafic OK

### Évolutions Futures

- Phase 2 : AD authentication
- Phase 3 : MFA/OTP
- Phase 4 : Full-tunnel mode
- Phase 5 : HIP compliance checking
- Phase 6 : Prisma Access cloud

## Conclusion

Vous disposez maintenant d'une **base solide** pour déployer GlobalProtect sur Protolab en tant qu'utilisateur unique, avec accès complet et natif depuis l'extérieur.

**Prochaines étapes** :
1. Générer le certificat serveur
2. Exécuter les commandes CLI dans le bon ordre
3. Tester étape par étape
4. Consulter les logs en cas de souci
5. Évoluer progressivement (AD, MFA, HIP)
