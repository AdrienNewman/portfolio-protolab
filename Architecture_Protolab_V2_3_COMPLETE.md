# Documentation Architecture Protolab V2.3

**Projet** : Lab TSSR protolab.local  
**Version** : 2.3 (Mise à jour complète - Production)  
**Date de mise à jour** : 30 décembre 2025  
**Statut** : PRODUCTION  
**Auteur** : Adrien - TSSR

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#1-vue-densemble)
2. [Infrastructure matérielle](#2-infrastructure-matérielle)
3. [Plan d'adressage réseau](#3-plan-dadressage-réseau)
4. [Stack de logs unifiés](#4-stack-de-logs-unifiés)
5. [Active Directory](#5-active-directory-domaine-protolablocal)
6. [Services déployés](#6-services-déployés)
7. [Architecture DevOps et Web](#7-architecture-devops-et-web)
8. [Base de données MinIO](#8-base-de-données-centralisée-minio)
9. [Control-Plane et MCP](#9-control-plane-et-mcp-server)
10. [Matrice de flux](#10-matrice-de-flux-et-règles-de-sécurité)
11. [Ports critiques](#11-ports-critiques-et-dépendances)
12. [Backup et restauration](#12-backup-et-restauration)

---

## 1. VUE D'ENSEMBLE

### 1.1 Architecture globale

Infrastructure de laboratoire TSSR avec segmentation réseau Zero Trust, firewall Next-Generation Palo Alto VM-Series, stack de supervision centralisée, Active Directory, architecture DevOps moderne, base de données S3 et serveur MCP pour intelligence artificielle.

**Composants principaux :**
- Hyperviseur Proxmox VE (192.168.1.100)
- Firewall Palo Alto VM-Series (192.168.1.37)
- Contrôleur de domaine AD (DC01, 10.1.10.10)
- Infrastructure logs (Victoria + OpenTelemetry + Grafana)
- Architecture web (Docker + Traefik + Portfolio)
- Base de données S3 (MinIO)
- Control-plane administration centralisée + MCP Server
- Serveur MCP pour intégration Claude Code

### 1.2 Différences V2.2 → V2.3

| Aspect | V2.2 | V2.3 |
|--------|------|------|
| **IP MinIO** | ~~10.1.40.51~~ (incorrecte) | ✅ **10.1.40.100** (corrigée) |
| **RAM control-plane** | 2 GB | ✅ **4 GB** (upgrade) |
| **MCP Server** | Non existant | ✅ **protolab-knowledge** (opérationnel) |
| **Claude Code** | Lecture MD seulement | ✅ **Outils MCP structurés** |
| **Inventaire infra** | Fichiers MD dispersés | ✅ **inventory.json centralisé** |

### 1.3 Changelog V2.2 → V2.3

**Corrections** :
- ✅ IP MinIO corrigée : 10.1.40.51 → **10.1.40.100**
- ✅ RAM control-plane upgrade : 2 GB → **4 GB**
- ✅ Statut MinIO : 🔄 Planifié → ✅ **Actif**

**Nouveautés** :
- ✅ **MCP Server protolab-knowledge** déployé sur control-plane
- ✅ **3 outils MCP** : list_services, get_service_info, sync_inventory
- ✅ **Intégration Claude Code** via ~/.mcp.json
- ✅ **Cache inventory** local avec sync MinIO (5min)

---

## 2. INFRASTRUCTURE MATÉRIELLE

### 2.1 Composants physiques

| Équipement | Spécifications | IP | Rôle | Statut |
|------------|----------------|-----|------|--------|
| **Proxmox** | Ryzen 5 3600, 32GB RAM, 932GB NVMe | 192.168.1.100 | Hyperviseur | ✅ |
| **Box Orange** | Livebox 6 | 192.168.1.1 | Passerelle | ✅ |
| **SKYNET** | i5-6200U, 32GB | 192.168.1.70 | Admin | ✅ |

### 2.2 Ressources Proxmox

**CPU**
- AMD Ryzen 5 3600 : 6 cores / 12 threads
- Fréquence max : 4.6 GHz
- Allocation VMs : 10 vCPU

**Mémoire**
- Total : 32 GB DDR4 2133 MHz
- Allocation : ~16.5 GB (upgrade control-plane +2GB)
- Disponible : 15.5 GB

**Stockage**
- SSD NVMe : 1 TB Crucial P3
- LVM : 793 GB ThinPool
- Utilisé : ~245 GB (31%)

### 2.3 VMs/CT déployés

| VMID | Nom | Type | Disque | RAM | Zone | Statut |
|------|-----|------|--------|-----|------|--------|
| 102 | PA-VM | VM | 60GB | 8GB | OUTSIDE | ✅ |
| 103 | Backup | VM | 50GB | 2GB | - | ✅ |
| 201 | DC01 | VM | 20GB | 2GB | SERVERS | ✅ |
| 201 | victorialog | CT | 20GB | 512MB | INFRA | ✅ |
| 202 | otelcol | CT | 4GB | 512MB | INFRA | ✅ |
| 203 | grafana | CT | 8GB | 512MB | INFRA | ✅ |
| **200** | **minio** | **CT** | **50GB** | **512MB** | **INFRA** | **✅ Actif** |
| 210 | web-gateway | CT | 20GB | 2GB | SERVERS | ✅ |
| **220** | **control-plane** | **CT** | **8GB** | **4GB** | **INFRA** | **✅ Actif** |

**Changements V2.3** :
- CT 200 (minio) : Statut 🔄 → ✅ (déployé et opérationnel)
- CT 220 (control-plane) : RAM 2GB → **4GB** (nécessaire pour MCP Server)

---

## 3. PLAN D'ADRESSAGE RÉSEAU

### 3.1 Segmentation par zones

| Zone | Réseau CIDR | Gateway (PA) | Bridge Proxmox | Interface PA | Fonction |
|------|------------|--------------|----------------|--------------|----------|
| **OUTSIDE** | 192.168.1.0/24 | 192.168.1.254 | vmbr0 | eth1/1 | Internet + LAN |
| **SERVERS** | 10.1.10.0/24 | 10.1.10.1 | vmbr1 | eth1/2 | Serveurs + AD |
| **CLIENTS** | 10.1.20.0/24 | 10.1.20.1 | vmbr2 | eth1/3 | Postes clients |
| **DMZ** | 10.1.30.0/24 | 10.1.30.1 | vmbr3 | eth1/4 | Services publics |
| **INFRA** | 10.1.40.0/24 | 10.1.40.1 | vmbr4 | eth1/5 | Infrastructure |
| **VPN** | 10.1.50.0/24 | - | tunnel.10 | - | GlobalProtect |

### 3.2 Zone OUTSIDE (192.168.1.0/24)

| IP | Équipement | Type | Rôle | Actif |
|----|------------|------|------|-------|
| 192.168.1.1 | Box Orange | Routeur | Passerelle FAI | ✅ |
| 192.168.1.37 | PA-VM (Mgmt) | Interface | Admin Palo Alto | ✅ |
| 192.168.1.70 | SKYNET | Laptop | Poste admin | ✅ |
| 192.168.1.100 | Proxmox | Hypervisor | Management | ✅ |
| 192.168.1.254 | PA-VM eth1/1 | Interface | Gateway zones | ✅ |

### 3.3 Zone SERVERS (10.1.10.0/24)

| IP | Hostname | Type | RAM | Disque | Services | Statut |
|----|----------|------|-----|--------|----------|--------|
| 10.1.10.1 | PA-VM eth1/2 | Gateway | - | - | Routage | ✅ |
| 10.1.10.10 | DC01.protolab.local | VM | 2GB | 20GB | AD/DNS/DHCP | ✅ |
| 10.1.10.50 | web-gateway | CT | 2GB | 20GB | Docker/Traefik | ✅ |

**Services web-gateway (CT 210)** :
- Docker Engine
- Traefik Reverse Proxy (80, 443, 8080)
- Portfolio Astro SSR (4321)
- Source : https://github.com/AdrienNewman/portfolio-protolab

### 3.4 Zone INFRA (10.1.40.0/24)

| IP | Hostname | Type | RAM | Disque | Services | Statut |
|----|----------|------|-----|--------|----------|--------|
| 10.1.40.1 | PA-VM eth1/5 | Gateway | - | - | Routage | ✅ |
| 10.1.40.25 | victorialog | CT | 512MB | 20GB | Logs TSDB | ✅ |
| 10.1.40.30 | otelcol | CT | 512MB | 4GB | Collecteur | ✅ |
| 10.1.40.35 | grafana | CT | 512MB | 8GB | Dashboards | ✅ |
| **10.1.40.50** | **control-plane** | **CT** | **4GB** | **8GB** | **Admin SSH + MCP** | **✅** |
| **10.1.40.100** | **minio** | **CT** | **512MB** | **50GB** | **Base S3** | **✅** |

**⚠️ CORRECTION CRITIQUE IP MinIO** :
- Ancienne IP documentée (INCORRECTE) : ~~10.1.40.51~~
- **IP réelle et corrigée** : **10.1.40.100**

---

## 4. STACK DE LOGS UNIFIÉS

### 4.1 Architecture

```
Sources logs
├── PA-VM (10.1.99.1) → Syslog UDP/514
├── Proxmox (192.168.1.100) → Syslog UDP/514
└── DC01 (10.1.10.10) → OTLP gRPC/4317
    ↓
OpenTelemetry Collector (10.1.40.30)
    ├── Receivers (syslog, otlp)
    ├── Processors (transform, batch)
    └── Exporters (otlphttp)
    ↓
Victoria Logs (10.1.40.25:9428)
    ├── TSDB optimisée
    ├── Compression haute
    └── Rétention 30 jours
    ↓
Grafana (10.1.40.35:3000)
    └── Dashboards + alerting
```

### 4.2 Flux de logs

| Source | IP | Protocole | Port | Destination | Volume/jour |
|--------|-----|-----------|------|-------------|-------------|
| PA-VM | 10.1.99.1 | Syslog UDP | 514 | otelcol | ~50 MB |
| Proxmox | 192.168.1.100 | Syslog UDP | 514 | otelcol | ~10 MB |
| DC01 | 10.1.10.10 | OTLP gRPC | 4317 | otelcol | ~20 MB |

**Total ingestion** : ~80 MB/jour (~2.4 GB/mois)

---

## 5. ACTIVE DIRECTORY (DOMAINE protolab.local)

### 5.1 Contrôleur de domaine DC01

**Spécifications** :
- Hostname : DC01.protolab.local
- IP : 10.1.10.10/24
- OS : Windows Server 2022
- RAM : 2 GB
- Disque : 20 GB
- Rôles : AD DS, DNS, DHCP

### 5.2 Structure AD

**Domaine** : protolab.local  
**Niveau fonctionnel** : Windows Server 2016

**OUs principales** :
```
protolab.local
├── Users-protolab/
│   ├── Administrators/
│   ├── IT-Staff/
│   └── Standard-Users/
├── Computers-protolab/
│   ├── Servers/
│   └── Workstations/
├── Groups-protolab/
└── Service-Accounts/
    ├── svc-backup (backup configs)
    └── svc-ldap (auth MinIO)
```

### 5.3 Groupes de sécurité

| Groupe | Type | Scope | Membres | Usage |
|--------|------|-------|---------|-------|
| GRP-IT-Admins | Security | Global | adminprotolab | Full admin |
| GRP-Standard-Users | Security | Global | Users standards | Lecture seule |

---

## 6. SERVICES DÉPLOYÉS

### 6.1 Vue d'ensemble

**Total services actifs** : 9 VMs/CTs

| Service | IP | Zone | Type | RAM | Fonction principale |
|---------|-----|------|------|-----|---------------------|
| PA-VM | 192.168.1.37 | OUTSIDE | VM | 8GB | Firewall NGFW |
| Proxmox-Backup | 192.168.1.103 | OUTSIDE | VM | 2GB | PBS |
| DC01 | 10.1.10.10 | SERVERS | VM | 2GB | Active Directory |
| web-gateway | 10.1.10.50 | SERVERS | CT | 2GB | Docker + Traefik |
| victorialog | 10.1.40.25 | INFRA | CT | 512MB | Logs storage |
| otelcol | 10.1.40.30 | INFRA | CT | 512MB | Logs collector |
| grafana | 10.1.40.35 | INFRA | CT | 512MB | Dashboards |
| control-plane | 10.1.40.50 | INFRA | CT | 4GB | Admin + MCP |
| **minio** | **10.1.40.100** | **INFRA** | **CT** | **512MB** | **S3 storage** |

---

## 7. ARCHITECTURE DEVOPS ET WEB

### 7.1 Vue d'ensemble

Architecture moderne basée sur conteneurisation Docker, reverse proxy Traefik et intégration GitHub pour déploiement automatisé.

```
┌──────────────────────────────────────────────────────────────┐
│                    DÉVELOPPEMENT                             │
│                                                              │
│  Laptop Windows (192.168.1.70)                              │
│  ├─ VSCode + Git                                            │
│  ├─ Remote-SSH → control-plane                              │
│  └─ Code Portfolio Astro                                    │
└──────────────┬───────────────────────────────────────────────┘
               │ git push
               ▼
┌──────────────────────────────────────────────────────────────┐
│                    GITHUB REPOSITORY                         │
│                                                              │
│  https://github.com/AdrienNewman/portfolio-protolab         │
│  ├─ Branch: master                                           │
│  ├─ .gitignore                                               │
│  └─ Source Astro SSR                                         │
└──────────────┬───────────────────────────────────────────────┘
               │ git pull
               ▼
┌──────────────────────────────────────────────────────────────┐
│              CT 210 - web-gateway (10.1.10.50)               │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Docker Engine                                         │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  Traefik (Reverse Proxy)                         │ │ │
│  │  │  ├─ Port 80/443 (HTTP/HTTPS)                     │ │ │
│  │  │  ├─ Port 8080 (Dashboard)                        │ │ │
│  │  │  ├─ Auto SSL (Let's Encrypt)                     │ │ │
│  │  │  └─ Routage par domaine                          │ │ │
│  │  └──────────┬───────────────────────────────────────┘ │ │
│  │             │                                          │ │
│  │  ┌──────────▼───────────────────────────────────────┐ │ │
│  │  │  Portfolio Container                             │ │ │
│  │  │  ├─ Image: Node.js 20                            │ │ │
│  │  │  ├─ Framework: Astro SSR                         │ │ │
│  │  │  ├─ Port interne: 4321                           │ │ │
│  │  │  └─ Source: /opt/docker/portfolio                │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────┬───────────────────────────────────────────────┘
               │ Expose HTTP/HTTPS
               ▼
┌──────────────────────────────────────────────────────────────┐
│                    ACCÈS UTILISATEUR                         │
│                                                              │
│  http://portfolio.protolab.local                            │
│  http://10.1.10.50                                          │
│  (futur) https://portfolio.protolab.com                     │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 CT 210 - web-gateway : Détails techniques

**Configuration système** :
- OS : Debian 12
- IP : 10.1.10.50/24
- RAM : 2 GB
- Disque : 20 GB
- Zone : SERVERS (vmbr1)

**Services actifs** :

| Service | Port | Protocole | Rôle |
|---------|------|-----------|------|
| **Traefik** | 80 | HTTP | Reverse proxy |
| **Traefik** | 443 | HTTPS | Reverse proxy SSL |
| **Traefik Dashboard** | 8080 | HTTP | Interface admin |
| **Portfolio (interne)** | 4321 | HTTP | Application Astro |

---

## 8. BASE DE DONNÉES CENTRALISÉE (MinIO)

### 8.1 Vue d'ensemble

MinIO est une solution de stockage objet S3-compatible, déployée pour centraliser toute la documentation, configurations et sauvegardes de l'infrastructure Protolab.

**Objectifs** :
- Stockage unifié documentation + configs
- API S3 pour intégration outils
- Interface web type explorateur
- Authentification LDAP (AD) + fallback local
- Préparation RAG/Vector DB (Qdrant futur)

### 8.2 CT 200 - minio : Spécifications

**Configuration système** :
- Hostname : minio.protolab.local
- **IP : 10.1.40.100/24** ⚠️ (corrigée depuis 10.1.40.51)
- OS : Debian 12
- RAM : 512 MB
- Disque : 50 GB
- Zone : INFRA (vmbr4)

**Ports exposés** :

| Port | Service | Protocole | Accès |
|------|---------|-----------|-------|
| 9000 | API S3 | HTTP | INFRA, VPN, OUTSIDE (via règles PA) |
| 9001 | Console Web | HTTP | INFRA, VPN, OUTSIDE |

### 8.3 Architecture MinIO

```
┌──────────────────────────────────────────────────────────────┐
│              CT 200 - MinIO (10.1.40.100)                    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  MinIO Server                                          │ │
│  │  ├─ Credentials: protoadmin / [password]              │ │
│  │  ├─ Region: eu-west-protolab                          │ │
│  │  └─ Volumes: /data/minio                              │ │
│  └────────┬───────────────────────────────────────────────┘ │
│           │                                                  │
│  ┌────────▼───────────────────────────────────────────────┐ │
│  │  Buckets (Stockage)                                    │ │
│  │                                                        │ │
│  │  ├─ configs/ (versionné)                              │ │
│  │  │   ├─ ct201-victorialog/                            │ │
│  │  │   ├─ ct202-otelcol/                                │ │
│  │  │   ├─ ct203-grafana/                                │ │
│  │  │   ├─ ct210-web-gateway/                            │ │
│  │  │   ├─ ct220-control-plane/                          │ │
│  │  │   ├─ vm102-pavm/ (exports XML)                     │ │
│  │  │   └─ vm103-dc01/ (GPO, configs AD)                 │ │
│  │  │                                                     │ │
│  │  ├─ docs/ (versionné)                                 │ │
│  │  │   ├─ architecture/                                 │ │
│  │  │   ├─ procedures/                                   │ │
│  │  │   ├─ rapports/                                     │ │
│  │  │   ├─ runbooks/                                     │ │
│  │  │   └─ inventory.json ⭐                             │ │
│  │  │                                                     │ │
│  │  ├─ backups/                                          │ │
│  │  │   ├─ daily/                                        │ │
│  │  │   ├─ weekly/                                       │ │
│  │  │   └─ manual/                                       │ │
│  │  │                                                     │ │
│  │  ├─ logs-archives/                                    │ │
│  │  │   ├─ victoria/                                     │ │
│  │  │   ├─ pa-vm/                                        │ │
│  │  │   └─ windows/                                      │ │
│  │  │                                                     │ │
│  │  └─ media/                                            │ │
│  │      ├─ images/                                       │ │
│  │      ├─ pdf/                                          │ │
│  │      └─ divers/                                       │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 8.4 Authentification

**Modes d'authentification** :

1. **Local (Admin)** :
   - User : `protoadmin`
   - Password : `2&!m63n*76$L6RJM` (stocké Bitwarden)
   - Accès : Complet (consoleAdmin policy)

2. **LDAP (Active Directory)** :
   - Server : `ldap://10.1.10.10:389`
   - Bind DN : `CN=svc-ldap,OU=Service-Accounts,OU=Users-protolab,DC=protolab,DC=local`
   - Base DN : `OU=Users-protolab,DC=protolab,DC=local`
   - Filter : `(&(objectClass=user)(sAMAccountName=%s))`

**Mapping groupes AD → Policies MinIO** :

| Groupe AD | Policy MinIO | Droits |
|-----------|--------------|--------|
| GRP-IT-Admins | consoleAdmin | Lecture/écriture tous buckets |
| GRP-Standard-Users | readonly | Lecture seule docs/ et media/ |

### 8.5 Accès depuis control-plane

**Configuration MinIO Client (mc)** :
```bash
# Configurer alias
mc alias set protolab http://10.1.40.100:9000 protoadmin '2&!m63n*76$L6RJM'

# Commandes utiles
mc ls protolab/                              # Liste buckets
mc ls -r protolab/configs/                   # Liste récursif
mc cp local.txt protolab/docs/               # Upload
mc cat protolab/docs/inventory.json          # Read
mc mirror /local/path protolab/backups/      # Sync local→MinIO
```

### 8.6 Fichier inventory.json ⭐

**Emplacement** : `docs/inventory.json` (bucket MinIO)

**Structure** :
```json
{
  "generated_at": "2025-12-30T00:00:00Z",
  "version": "1.0",
  "services": [
    {
      "name": "minio",
      "ip": "10.1.40.100",
      "zone": "INFRA",
      "ports": [9000, 9001],
      "status": "active",
      "type": "CT"
    },
    {
      "name": "control-plane",
      "ip": "10.1.40.50",
      "zone": "INFRA",
      "ports": [22],
      "status": "active",
      "type": "CT"
    }
  ]
}
```

**Usage** :
- Source de vérité pour l'inventaire infrastructure
- Utilisé par le MCP Server protolab-knowledge
- Mis à jour manuellement ou via script (futur)

---

## 9. CONTROL-PLANE ET MCP SERVER

### 9.1 Vue d'ensemble

Control-plane (CT 220) est le point d'administration centralisé pour l'ensemble de l'infrastructure. Il héberge VSCode Remote-SSH, Claude Code et le serveur MCP qui permet à l'IA d'accéder à l'inventaire de manière structurée.

**Objectifs** :
- Centralisation accès multi-systèmes
- Un seul serveur VSCode Remote
- Serveur MCP pour Claude Code
- Base pour automatisation future

### 9.2 CT 220 - control-plane : Spécifications

**Configuration système** :
- Hostname : control-plane.protolab.local
- IP : 10.1.40.50/24
- OS : Debian 12
- **RAM : 4 GB** (upgrade depuis 2 GB pour MCP)
- Disque : 8 GB
- Zone : INFRA (vmbr4)

**Utilisateurs** :

| User | UID | Groupe | Shell | Rôle |
|------|-----|--------|-------|------|
| root | 0 | root | /bin/bash | Admin système |
| adminprotolab | 1000 | adminprotolab, sudo | /bin/bash | Utilisateur opérationnel |

### 9.3 Architecture control-plane + MCP

```
┌──────────────────────────────────────────────────────────────┐
│  Laptop Windows (192.168.1.70 ou VPN 10.1.50.2)             │
│  ├─ VSCode Desktop                                           │
│  └─ Remote-SSH Extension                                     │
└──────────────┬───────────────────────────────────────────────┘
               │ SSH 10.1.40.50:22
               ▼
┌──────────────────────────────────────────────────────────────┐
│        CT 220 - control-plane (10.1.40.50)                   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  VSCode Remote Server (~400 MB RAM)                    │ │
│  │  └─ Claude Code Extension                              │ │
│  └────────────┬───────────────────────────────────────────┘ │
│               │ appelle tools MCP                            │
│  ┌────────────▼───────────────────────────────────────────┐ │
│  │  MCP Server "protolab-knowledge" (Python)             │ │
│  │  ~/mcp-servers/protolab-knowledge/server.py           │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  Tools MCP disponibles :                         │ │ │
│  │  │  • list_services (liste tous services)           │ │ │
│  │  │  • get_service_info (détails d'un service)       │ │ │
│  │  │  • sync_inventory (force sync MinIO)             │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  Cache local (refresh 5min) :                    │ │ │
│  │  │  ./cache/inventory.json (~1.2 KB)                │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────┬───────────────────────────────────────────┘ │
│               │ API S3 MinIO                                 │
│               │                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  SSH Config (~/.ssh/config)                            │ │
│  │                                                        │ │
│  │  Host web-gateway                                      │ │
│  │    HostName 10.1.10.50                                 │ │
│  │    User adminprotolab                                  │ │
│  │    IdentityFile ~/.ssh/id_protolab                     │ │
│  │                                                        │ │
│  │  Host victorialog, otelcol, grafana, minio...         │ │
│  │    [configurations similaires]                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Connexions sortantes :                                     │
│  ├─ SSH → Conteneurs Linux (SERVERS + INFRA)               │
│  ├─ WinRM → DC01 (futur)                                    │
│  ├─ API → PA-VM (futur)                                     │
│  └─ API → Proxmox (futur)                                   │
└──────────────┬───────────────────────────────────────────────┘
               │ HTTP API S3
               ▼
┌──────────────────────────────────────────────────────────────┐
│   CT 200 - MinIO (10.1.40.100) - Zone INFRA                 │
│                                                              │
│   Bucket: docs/                                              │
│   └── inventory.json (source de vérité)                     │
└──────────────────────────────────────────────────────────────┘
```

### 9.4 MCP Server "protolab-knowledge"

**Emplacement** : `~/mcp-servers/protolab-knowledge/`

**Structure** :
```
protolab-knowledge/
├── server.py              # Serveur MCP (154 lignes)
├── requirements.txt       # Dépendances Python
├── .env                  # Credentials MinIO (chmod 600)
├── config.json           # Configuration
├── .gitignore            # Exclusions Git
├── inventory-template.json
└── cache/                # Cache local
    └── inventory.json    # Sync depuis MinIO
```

**Dépendances Python** :
- mcp ≥1.0.0 (SDK officiel)
- minio ≥7.2.0 (Client S3)
- python-json-logger ≥2.0.0
- python-dotenv ≥1.0.0

**Configuration Claude Code** : `~/.mcp.json`
```json
{
  "mcpServers": {
    "protolab-knowledge": {
      "command": "python3",
      "args": ["/home/adminprotolab/mcp-servers/protolab-knowledge/server.py"]
    }
  }
}
```

### 9.5 Outils MCP disponibles

#### 9.5.1 list_services

**Description** : Liste tous les services de l'infrastructure groupés par zone

**Paramètres** : Aucun

**Exemple retour** :
```
Protolab Infrastructure (7 services):

=== INFRA ===
  • minio (10.1.40.100)
  • control-plane (10.1.40.50)
  • victorialog (10.1.40.25)
  • otelcol (10.1.40.30)
  • grafana (10.1.40.35)

=== SERVERS ===
  • web-gateway (10.1.10.50)
  • DC01 (10.1.10.10)
```

#### 9.5.2 get_service_info

**Description** : Récupère les détails d'un service spécifique

**Paramètres** :
- `service_name` (string, requis) : Nom du service

**Exemple retour** :
```
Service: minio
IP: 10.1.40.100
Zone: INFRA
Ports: 9000, 9001
Status: active
Type: CT
```

#### 9.5.3 sync_inventory

**Description** : Force une synchronisation immédiate depuis MinIO

**Paramètres** : Aucun

**Exemple retour** :
```
✓ Inventory synced from MinIO (7 services loaded)
```

### 9.6 Flux de données MCP

**Au démarrage** :
```
1. VSCode Remote démarre
   ↓
2. Claude Code charge ~/.mcp.json
   ↓
3. Lance python3 server.py
   ↓
4. MCP Server connecte MinIO (10.1.40.100:9000)
   ↓
5. Télécharge docs/inventory.json → ./cache/
   ↓
6. Attente appels tools depuis Claude Code
```

**Lors d'une requête** :
```
Claude Code : "List all services"
   ↓
Tool MCP : list_services()
   ↓
MCP Server : load_inventory() → lit ./cache/inventory.json
   ↓
MCP Server : formate résultats
   ↓
Claude Code : affiche les 7 services groupés par zone
```

**Synchronisation automatique** :
```
Toutes les 5 minutes (300s) :
   MCP Server → MinIO GET docs/inventory.json
   MinIO → ./cache/inventory.json (mise à jour)
```

### 9.7 Ressources MCP Server

**Utilisation typique** :

| Ressource | Idle | VSCode + MCP actif |
|-----------|------|-------------------|
| **CPU** | 1-5% | 20-50% (pics) |
| **RAM** | 150 MB | 800-1200 MB |
| **Disque** | 1.2 GB | 3-4 GB |

**Justification upgrade RAM** :
- CT 220 avant : 2 GB → saturait avec VSCode + MCP
- CT 220 maintenant : **4 GB** → stable et performant

---

## 10. MATRICE DE FLUX ET RÈGLES DE SÉCURITÉ

### 10.1 Flux autorisés (production)

| # | Nom | From | To | Source | Destination | Protocoles | Action | Log |
|---|-----|------|-----|--------|-------------|-----------|--------|-----|
| 1 | VPN-to-AD-Auth | VPN | SERVERS | any | DC01 (10.1.10.10) | dns, kerberos, ldap, smb, msrpc | Allow | Yes |
| 2 | VPN-to-AD-RDP | VPN | SERVERS | any | DC01 | ms-rdp | Allow | Yes |
| 3 | VPN-to-INFRA-Mgmt | VPN | INFRA | any | 10.1.40.0/24 | ssh, web-browsing, ssl, ping | Allow | Yes |
| 4 | VPN-to-SERVERS-Apps | VPN | SERVERS | any | 10.1.10.0/24 | ssh, web-browsing, ssl | Allow | Yes |
| 5 | VPN-to-MINIO | VPN | INFRA | any | minio (10.1.40.100) | tcp/9000, tcp/9001 | Allow | Yes |
| 6 | OUTSIDE-to-INFRA | OUTSIDE | INFRA | Laptops | 10.1.40.0/24 | ssh, https | Allow | Yes |
| 7 | OUTSIDE-to-MINIO-Console | OUTSIDE | INFRA | Laptops | minio | tcp/9001 | Allow | Yes |
| 8 | LAN-to-AD-Services | OUTSIDE | SERVERS | Laptops | DC01 | dns, kerberos, ldap, smb, ms-rdp, ping | Allow | Yes |
| 9 | LAN-to-WEB-GATEWAY | OUTSIDE | SERVERS | any | web-gateway (10.1.10.50) | web-browsing, ssl | Allow | Yes |
| 10 | INFRA-to-SERVERS-SSH | INFRA | SERVERS | control-plane | 10.1.10.0/24 | ssh | Allow | Yes |
| 11 | INFRA-to-MINIO | INFRA | INFRA | 10.1.40.0/24 | minio (10.1.40.100) | tcp/9000, tcp/9001 | Allow | Yes |
| 12 | SERVERS-to-INTERNET | SERVERS | OUTSIDE | 10.1.10.0/24 | any | dns, ntp, ssl, web-browsing, http | Allow | Yes |
| 13 | SERVERS-to-INFRA | SERVERS | INFRA | 10.1.10.0/24 | 10.1.40.0/24 | syslog, dns, ntp | Allow | Yes |
| 14 | INFRA-to-SERVERS | INFRA | SERVERS | 10.1.40.0/24 | DC01 | dns, ntp | Allow | Yes |
| 15 | INFRA-to-INTERNET | INFRA | OUTSIDE | 10.1.40.0/24 | any | dns, ssl, web-browsing, http | Allow | Yes |
| 22 | INFRA-INTRAZONE | INFRA | INFRA | 10.1.40.0/24 | 10.1.40.0/24 | any | Allow | Yes |
| 99 | DENY-ALL-LOG | any | any | any | any | any | Deny | Yes |

### 10.2 Règles spécifiques nouveaux services

**web-gateway (CT 210)** :

| Nom règle | Source | Destination | Port | Application | Justification |
|-----------|--------|-------------|------|-------------|---------------|
| LAN-to-WEB-GATEWAY | OUTSIDE | web-gateway | 80, 443 | web-browsing, ssl | Accès public portfolio |
| VPN-to-WEB-GATEWAY | VPN | web-gateway | 80, 443, 8080 | web-browsing, ssl | Accès VPN + dashboard Traefik |
| WEB-GATEWAY-to-INTERNET | web-gateway | OUTSIDE | 443 | ssl | Pull images Docker, npm packages |

**MinIO (CT 200)** :

| Nom règle | Source | Destination | Port | Application | Justification |
|-----------|--------|-------------|------|-------------|---------------|
| INFRA-to-MINIO | INFRA | minio (10.1.40.100) | 9000, 9001 | custom | Accès API S3 + Console depuis INFRA |
| VPN-to-MINIO | VPN | minio (10.1.40.100) | 9000, 9001 | custom | Accès VPN (admins distants) |
| OUTSIDE-to-MINIO-Console | OUTSIDE | minio (10.1.40.100) | 9001 | custom | Console web depuis LAN |

**control-plane (CT 220)** :

| Nom règle | Source | Destination | Port | Application | Justification |
|-----------|--------|-------------|------|-------------|---------------|
| OUTSIDE-to-CONTROL-PLANE | OUTSIDE | control-plane | 22 | ssh | VSCode Remote-SSH depuis laptops |
| VPN-to-CONTROL-PLANE | VPN | control-plane | 22 | ssh | VSCode Remote-SSH depuis VPN |
| CONTROL-PLANE-to-ALL-SSH | control-plane | SERVERS, INFRA | 22 | ssh | Administration centralisée |
| CONTROL-PLANE-to-MINIO-API | control-plane | minio (10.1.40.100) | 9000 | http | MCP Server → MinIO S3 |

### 10.3 Objets Palo Alto créés

**Addresses** :

| Nom | Type | Valeur | Zone | Usage |
|-----|------|--------|------|-------|
| minio | ip-netmask | **10.1.40.100/32** | INFRA | MinIO server (IP CORRIGÉE) |
| web-gateway | ip-netmask | 10.1.10.50/32 | SERVERS | Docker host |
| control-plane | ip-netmask | 10.1.40.50/32 | INFRA | Admin central + MCP |
| DC01 | ip-netmask | 10.1.10.10/32 | SERVERS | Active Directory |
| victorialog | ip-netmask | 10.1.40.25/32 | INFRA | Logs storage |
| otelcol | ip-netmask | 10.1.40.30/32 | INFRA | Logs collector |
| grafana | ip-netmask | 10.1.40.35/32 | INFRA | Dashboards |

**Services** :

| Nom | Protocole | Port | Usage |
|-----|-----------|------|-------|
| minio-api | TCP | 9000 | MinIO API S3 |
| minio-console | TCP | 9001 | MinIO Web Console |
| traefik-dashboard | TCP | 8080 | Traefik UI |

---

## 11. PORTS CRITIQUES ET DÉPENDANCES

### 11.1 Ports Active Directory (DC01)

| Port | Protocole | Service | Priorité | Dépendance |
|------|-----------|---------|----------|-----------|
| **53** | TCP/UDP | DNS | 🔴 Critique | Localisation DC, résolution noms |
| **88** | TCP/UDP | Kerberos (KDC) | 🔴 Critique | Authentification |
| **135** | TCP | RPC Endpoint | 🔴 Critique | Appels RPC |
| **389** | TCP/UDP | LDAP | 🔴 Critique | Annuaire, MinIO auth |
| **445** | TCP | SMB | 🔴 Critique | Partages, SYSVOL, GPO |
| **636** | TCP | LDAPS | 🟡 Recommandé | LDAP chiffré |
| **3268** | TCP | Global Catalog | 🟡 Recommandé | Recherches forêt |
| **3389** | TCP | RDP | 🟡 Recommandé | Administration distante |

### 11.2 Ports Infrastructure moderne

**CT 210 - web-gateway** :

| Port | Service | Accès | Protocole | Critique |
|------|---------|-------|-----------|----------|
| 80 | Traefik HTTP | LAN, VPN | HTTP | 🟡 |
| 443 | Traefik HTTPS | LAN, VPN | HTTPS | 🔴 |
| 8080 | Traefik Dashboard | VPN | HTTP | 🟢 |
| 4321 | Portfolio (interne) | Docker network | HTTP | N/A |

**CT 200 - MinIO** :

| Port | Service | Accès | Protocole | Critique |
|------|---------|-------|-----------|----------|
| 9000 | API S3 | INFRA, VPN | HTTP | 🔴 |
| 9001 | Console Web | INFRA, VPN, OUTSIDE | HTTP | 🟡 |

**CT 220 - control-plane** :

| Port | Service | Accès | Protocole | Critique |
|------|---------|-------|-----------|----------|
| 22 | SSH | OUTSIDE, VPN | SSH | 🔴 |
| N/A | MCP Server | stdio (local) | Python | 🔴 |

**CT 201 - victoria-logs** :

| Port | Service | Accès | Protocole | Critique |
|------|---------|-------|-----------|----------|
| 9428 | VictoriaLogs API | INFRA | HTTP | 🔴 |

**CT 202 - OpenTelemetry** :

| Port | Service | Accès | Protocole | Critique |
|------|---------|-------|-----------|----------|
| 514 | Syslog | SERVERS, INFRA | UDP | 🔴 |
| 4317 | OTLP gRPC | SERVERS (DC01) | gRPC | 🔴 |
| 13133 | Health check | INFRA | HTTP | 🟢 |

**CT 203 - grafana** :

| Port | Service | Accès | Protocole | Critique |
|------|---------|-------|-----------|----------|
| 3000 | Grafana Web | VPN, OUTSIDE | HTTP | 🟡 |

### 11.3 Dépendances critiques

```
DC01 (DNS/AD)
├── Tous les conteneurs (résolution noms)
├── MinIO (authentification LDAP)
├── Palo Alto (User-ID)
└── GlobalProtect (authentification VPN)

Victoria Logs (10.1.40.25)
└── OpenTelemetry Collector (ingestion logs)

OpenTelemetry Collector (10.1.40.30)
├── Palo Alto PA-VM (syslog UDP/514)
├── Proxmox (syslog UDP/514)
└── DC01 (OTLP gRPC/4317)

Grafana (10.1.40.35)
└── Victoria Logs (datasource)

web-gateway (10.1.10.50)
├── GitHub (pull code)
├── Docker Hub (pull images)
└── DC01 (DNS)

control-plane (10.1.40.50)
├── Tous CT/VM (SSH administration)
├── MinIO (MCP Server API S3)
└── VSCode Remote (Claude Code)

MinIO (10.1.40.100)
├── DC01 (LDAP auth)
├── control-plane (mc client + MCP Server)
└── Tous services (source configs/docs)

MCP Server (control-plane)
├── MinIO (source inventory.json)
├── Claude Code (client)
└── Cache local (performance)
```

---

## 12. BACKUP ET RESTAURATION

### 12.1 Stratégie de sauvegarde

**Proxmox Backup Server (PBS)** :
- VM 103 : Proxmox-Backup (192.168.1.103)
- Snapshot hebdomadaire tous CT/VM
- Rétention : 4 semaines
- Stockage : Local 50 GB

**Sauvegarde configurations** :

| Composant | Méthode | Fréquence | Destination |
|-----------|---------|-----------|-------------|
| **PA-VM** | Export XML | Quotidien | MinIO configs/vm102-pavm/ + GitHub |
| **DC01 GPO** | Export PowerShell | Quotidien | MinIO configs/vm103-dc01/ + GitHub |
| **CT configs** | Copie /etc/ | Quotidien | MinIO configs/ctXXX-name/ + GitHub |
| **Docker** | docker-compose.yml | Git | GitHub + MinIO |
| **Scripts** | Git push | Chaque modif | GitHub + MinIO |
| **inventory.json** | Versionning MinIO | À chaque màj | MinIO docs/ |

**Solution backup 3-2-1** :
- **Copie 1** : GitHub (hors site, cloud)
- **Copie 2** : `/var/lib/vz/backup/protolab-configs/` (local Proxmox)
- **Copie 3** : Clé USB (prévu)

**MinIO versionning** :
- Buckets `configs/` et `docs/` : versionning actif
- Rétention : illimitée
- Permet rollback fichier

**Repository Git** : 
- URL : https://github.com/AdrienNewman/protolab-configs
- Cron quotidien : 13h00
- Script : `/opt/protolab-configs/scripts/backup-all.sh`

### 12.2 Procédures de restauration

**Restauration CT depuis Proxmox** :
1. GUI Proxmox → Stockage → Backup
2. Sélectionner snapshot CT
3. Restore → Nouveau VMID ou écraser existant
4. Démarrer CT
5. Vérifier réseau et services

**Restauration config depuis MinIO** :
```bash
# Restaurer config PA-VM
mc cp protolab/configs/vm102-pavm/running-config.xml /tmp/
scp /tmp/running-config.xml admin@192.168.1.37:/config/

# Restaurer config CT
mc cp protolab/configs/ct202-otelcol/config.yaml /tmp/
scp /tmp/config.yaml otelcol:/etc/otelcol/config.yaml
ssh otelcol "sudo systemctl restart otelcol"
```

**Restauration MCP Server** :
```bash
# Si CT 220 corrompu, après restauration snapshot
cd ~/mcp-servers/protolab-knowledge
pip3 install -r requirements.txt --break-system-packages

# Vérifier .env présent (sinon restaurer depuis Bitwarden)
cat .env

# Tester serveur
python3 server.py
# Ctrl+C après 5 secondes

# Recharger Claude Code
# VSCode: Ctrl+Shift+P → Developer: Reload Window
```

---

## 13. ÉVOLUTIONS FUTURES PLANIFIÉES

### 13.1 Phase 2 (Court terme - Q1 2026)

| Priorité | Projet | Objectif | Prérequis |
|----------|--------|----------|-----------|
| 🔴 | **MCP Tools backup** | Accès configs backupées (PA, AD, OTel) | Proxmox SSH depuis control-plane |
| 🔴 | **SSL/TLS Traefik** | HTTPS automatique (Let's Encrypt) | Domaine public |
| 🟡 | **Grafana dashboards** | Tableaux de bord PA/Proxmox/AD | Victoria Logs data |
| 🟡 | **WinRM control-plane** | Administration Windows depuis CT 220 | python3-winrm |
| 🟢 | **API PA control-plane** | Scripts admin PA-VM | API key PA |

### 13.2 Phase 3 (Moyen terme - Q2 2026)

| Priorité | Projet | Objectif | Prérequis |
|----------|--------|----------|-----------|
| 🔴 | **Exposition Internet** | GlobalProtect accessible publiquement | Durcissement sécurité |
| 🟡 | **DC02** | Second DC pour redondance | VM ressources |
| 🟡 | **Qdrant Vector DB** | RAG pour documentation | MinIO opérationnel |
| 🟢 | **MCP Actions infra** | ping_service, check_port, restart | Sécurisation |
| 🟢 | **Serveur fichiers** | FSRM + quotas AD | Disque supplémentaire |

### 13.3 Phase 4 (Long terme - Q3-Q4 2026)

| Priorité | Projet | Objectif | Prérequis |
|----------|--------|----------|-----------|
| 🟡 | **Migration IPv6** | Dual-stack | ISP support |
| 🟡 | **Load balancing** | HA services web | Serveur secondaire |
| 🟡 | **SIEM** | Détection incidents | Logs enrichis |
| 🟢 | **VLANs 802.1Q** | Migration bridges Proxmox | Downtime planifié |
| 🟢 | **Kubernetes** | Orchestration containers | Ressources CPU/RAM |

---

## 14. VERSION ET HISTORIQUE

| Version | Date | Changements majeurs |
|---------|------|---------------------|
| 1.0 | 1 déc 2025 | Création V2.0 (sans AD) |
| 2.0 | 8 déc 2025 | Ajout stack logs unifiés |
| 2.1 | 10 déc 2025 | Intégration AD complète, ports critiques |
| 2.2 | 29 déc 2025 | Architecture DevOps (Docker/Traefik/Portfolio), MinIO S3, control-plane, correction IP Grafana |
| **2.3** | **30 déc 2025** | **🔴 Correction IP MinIO (10.1.40.100), MCP Server protolab-knowledge, upgrade RAM control-plane 4GB, inventory.json centralisé** |

---

## 15. CONTACTS ET SUPPORT

**Responsable infrastructure** :  
Adrien - Technicien Supérieur Systèmes et Réseaux (TSSR)  
Infrastructure : PROTOLAB V2.3

**Accès management** :

| Service | URL/Adresse | Compte | Port |
|---------|------------|--------|------|
| **Palo Alto** | https://192.168.1.37 | admin | 443 |
| **Proxmox** | https://192.168.1.100:8006 | root@pam | 8006 |
| **DC01 RDP** | 10.1.10.10 | Administrator@protolab.local | 3389 |
| **Victoria Logs** | http://10.1.40.25:9428 | N/A | 9428 |
| **Grafana** | http://10.1.40.35:3000 | admin | 3000 |
| **MinIO Console** | **http://10.1.40.100:9001** | protoadmin | 9001 |
| **MinIO API S3** | **http://10.1.40.100:9000** | protoadmin | 9000 |
| **Traefik Dashboard** | http://10.1.10.50:8080 | N/A | 8080 |
| **Portfolio** | http://portfolio.protolab.local | N/A | 80/443 |

**Documentation associée** :
- MCP_SERVER_PROTOLAB_KNOWLEDGE_REFERENCE.md (serveur MCP)
- control-plane-reference.md (administration)
- control-plane-guide-utilisation.md (guide utilisateur)
- Documentation_Technique_Solution_de_Backup_Protolab_V1_1.md (backups)

---

**Document généré le 30 décembre 2025**  
**Infrastructure : Lab TSSR protolab.local**  
**Statut global : Production V2.3 avec MCP Server opérationnel**

---

*Fin de la documentation Architecture Protolab V2.3*
