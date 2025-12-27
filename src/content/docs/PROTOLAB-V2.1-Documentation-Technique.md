---
title: "PROTOLAB V2.1 - Documentation Technique Complète"
description: "Infrastructure lab d'entreprise avec Proxmox, Palo Alto PA-VM, Active Directory et stack de monitoring centralisé"
category: architecture
date: 2025-12-17
tags:
  - proxmox
  - palo-alto
  - active-directory
  - infrastructure
  - monitoring
  - victoria-logs
  - grafana
author: Adrien Mercadier
difficulty: advanced
featured: true
---

# PROTOLAB V2 - Documentation Technique de Référence
**Version:** 2.1
**Date:** 17 décembre 2025
**Auteur:** Adrien
**Statut:** Production

---

## 1. Vue d'ensemble de l'infrastructure

### Description générale
PROTOLAB V2 est un environnement de lab d'entreprise complet déployé sur Proxmox VE, simulant une infrastructure professionnelle segmentée avec pare-feu Palo Alto Networks PA-VM, Active Directory, et stack de monitoring centralisé (Victoria Logs, OpenTelemetry, Grafana). L'infrastructure est conçue pour l'apprentissage des technologies systèmes et réseaux niveau TSSR avec un accent sur la sécurité périmétrique et la visibilité opérationnelle.

### Objectifs et cas d'usage
- **Formation professionnelle:** Environnement TSSR avec Active Directory, GPO, et gestion utilisateurs
- **Sécurité réseau:** Mise en œuvre de zones de sécurité, policies applicatives, et VPN SSL (GlobalProtect)
- **Monitoring et observabilité:** Collecte centralisée de logs via Syslog, métriques via OpenTelemetry, visualisation Grafana
- **Documentation portfolio:** Cas d'études pour présentation de compétences techniques (incident réseau, déploiement infrastructure, troubleshooting)

### Architecture logique
```
Internet (192.168.1.0/24 - LAN physique)
    ↓
[Palo Alto PA-VM] (192.168.1.37 - Firewall central)
    ├── Zone OUTSIDE ──→ Internet/LAN (192.168.1.0/24)
    ├── Zone SERVERS ──→ vmbr1 (10.1.10.0/24) - AD, services critiques
    ├── Zone CLIENTS ──→ vmbr2 (10.1.20.0/24) - Postes utilisateurs
    ├── Zone DMZ ─────→ vmbr3 (10.1.30.0/24) - Services publics
    ├── Zone INFRA ───→ vmbr4 (10.1.40.0/24) - Monitoring, logs
    └── Zone VPN ─────→ tunnel.10 (10.1.50.0/24) - GlobalProtect
```

---

## 2. Inventaire des composants

### 2.1 Hyperviseur Proxmox VE

| **Paramètre** | **Valeur** |
|---|---|
| **Hostname** | proxmox (assumption basée sur IP) |
| **IP Management** | 192.168.1.100/24 |
| **Gateway** | 192.168.1.1 |
| **Version** | Proxmox VE 8.x |
| **Interface physique** | enp4s0 (bridge vmbr0) |
| **Accès Web** | https://192.168.1.100:8006 |

**Hardware (d'après mémoire):**
- **Carte mère:** ASUS TUF GAMING B450-PLUS II
- **Processeur:** AMD Ryzen 5 3600 (6C/12T)
- **RAM:** 32 GB DDR4 Corsair (2133 MT/s actuel, 3200 MT/s supporté via XMP)
- **GPU:** NVIDIA RTX 3060 (passthrough disponible)
- **Stockage:** Crucial P3 1TB NVMe SSD (local-lvm)

### 2.2 Machines virtuelles

| **VMID** | **Nom** | **Type** | **IP** | **OS** | **CPU** | **RAM** | **Disk** | **Rôle** | **État** |
|---|---|---|---|---|---|---|---|---|---|
| 102 | PaloAlto-FW | VM | 192.168.1.37 | PAN-OS | 2 vCPU | 8 GB | 60 GB | Firewall Next-Gen + VPN Gateway | ✅ Running |
| 103 | Win-Server-AD (DC01) | VM | 10.1.10.10 | Windows Server 2022 | 2 vCPU | 4 GB | 50 GB | Contrôleur de domaine AD, DNS, DHCP | ✅ Running |
| 104 | Win10ProAD | VM | DHCP | Windows 10 Pro | 2 vCPU | 4 GB | 50 GB | Poste client joint au domaine | ⏸ Stopped |
| 300 | Win-Gaming | VM | DHCP | Windows 11 | 8 vCPU | 16.5 GB | 200 GB | VM Gaming avec GPU passthrough (RTX 3060) | ⏸ Stopped |

### 2.3 Containers LXC (Infrastructure)

| **VMID** | **Nom** | **IP** | **OS** | **CPU** | **RAM** | **Disk** | **Rôle** | **État** |
|---|---|---|---|---|---|---|---|---|
| 200 | doc-lab | 10.1.10.50 (assumption) | Debian | 1 vCPU | 512 MB | 4 GB | Serveur documentation (ex: wiki) | ⏸ Stopped |
| 201 | victorialog | **10.1.40.25** | Debian | 2 vCPU | 1 GB | 20 GB | Base de données logs (VictoriaLogs) | ✅ Running |
| 202 | OpenTelemetry | **10.1.40.30** | Debian | 1 vCPU | 512 MB | 4 GB | Collecteur de télémétrie (OTEL Collector) | ✅ Running |
| 203 | GrafanaOSS | **10.1.40.35** | Debian | 1 vCPU | 512 MB | 4 GB | Dashboard de visualisation Grafana | ✅ Running |
| 250 | JellyFinSrv-Perso | 10.1.10.x (assumption) | Debian | 2 vCPU | 2 GB | 20 GB | Serveur media Jellyfin (personnel) | ⏸ Stopped |

---

## 3. Plan d'adressage réseau

### 3.1 Schéma des zones et VLANs

| **Zone Palo Alto** | **Subnet** | **Proxmox Bridge** | **Gateway PA-VM** | **Interface PA** | **Usage** |
|---|---|---|---|---|---|
| **OUTSIDE** | 192.168.1.0/24 | vmbr0 | 192.168.1.254 | ethernet1/1 | LAN physique / Internet / Management |
| **SERVERS** | 10.1.10.0/24 | vmbr1 | 10.1.10.1 | ethernet1/2 | Serveurs critiques (AD, DNS, apps) |
| **CLIENTS** | 10.1.20.0/24 | vmbr2 | 10.1.20.1 | ethernet1/3 | Postes de travail utilisateurs |
| **DMZ** | 10.1.30.0/24 | vmbr3 | 10.1.30.1 | ethernet1/4 | Services exposés publics (non utilisé actuellement) |
| **INFRA** | 10.1.40.0/24 | vmbr4 | 10.1.40.1 | ethernet1/5 | Monitoring, logs, infrastructure management |
| **VPN** | 10.1.50.0/24 | tunnel.10 | 10.1.50.1 | tunnel.10 | Clients VPN GlobalProtect (pool .2-.100) |
| **LOOPBACK** | 10.1.99.1/32 | - | - | loopback.10 | Interface de management distante PA-VM |

### 3.2 Attribution détaillée des IP

#### Zone OUTSIDE (192.168.1.0/24)
- **192.168.1.1** - Gateway Internet (Box FAI Orange)
- **192.168.1.37** - Palo Alto PA-VM (interface management)
- **192.168.1.70** - Poste admin Adrien (LABO-SKYNET)
- **192.168.1.100** - Proxmox VE (interface management)
- **192.168.1.254** - Palo Alto PA-VM (interface OUTSIDE ethernet1/1)

#### Zone SERVERS (10.1.10.0/24)
- **10.1.10.1** - Gateway Palo Alto (ethernet1/2)
- **10.1.10.10** - **DC01.protolab.local** (Contrôleur de domaine AD)
- **10.1.10.50** - doc-lab (serveur documentation - arrêté)

#### Zone CLIENTS (10.1.20.0/24)
- **10.1.20.1** - Gateway Palo Alto (ethernet1/3)
- **Plage DHCP** - 10.1.20.10 - 10.1.20.200 (à configurer sur DC01)

#### Zone DMZ (10.1.30.0/24)
- **10.1.30.1** - Gateway Palo Alto (ethernet1/4)
- **Non utilisée actuellement**

#### Zone INFRA (10.1.40.0/24)
- **10.1.40.1** - Gateway Palo Alto (ethernet1/5)
- **10.1.40.25** - **victorialog** (VictoriaLogs database)
- **10.1.40.30** - **OpenTelemetry** (OTEL Collector + Rsyslog relay)
- **10.1.40.35** - **GrafanaOSS** (Dashboards)

#### Zone VPN (10.1.50.0/24)
- **10.1.50.1** - Gateway Palo Alto (tunnel.10)
- **10.1.50.2 - 10.1.50.100** - Pool IP pour clients VPN GlobalProtect
- **10.1.50.2** - IP actuelle client VPN connecté (LABO-SKYNET)

### 3.3 Routage inter-zones
- **Proxmox vers zones internes:** Route statique `10.1.0.0/16 via 192.168.1.254` (configurée sur vmbr0)
- **Default route PA-VM:** `0.0.0.0/0 via 192.168.1.1 dev ethernet1/1` (Internet via Box FAI)
- **Clients VPN:** Routes push automatiques vers 10.1.10.0/24, 10.1.20.0/24, 10.1.30.0/24, 10.1.40.0/24

---

## 4. Sécurité et pare-feu (Palo Alto PA-VM)

### 4.1 Configuration générale

| **Paramètre** | **Valeur** |
|---|---|
| **Hostname** | PA-VM |
| **Management IP** | 192.168.1.37/24 |
| **Timezone** | Europe/Paris |
| **DNS** | 1.1.1.1 (primary), 8.8.8.8 (secondary) |
| **NTP** | fr.pool.ntp.org |
| **Locale** | FR |
| **Services désactivés** | Telnet, HTTP (HTTPS et SSH uniquement) |

### 4.2 Zones de sécurité configurées

| **Zone** | **Type** | **Interface** | **User-ID** | **Description** |
|---|---|---|---|---|
| OUTSIDE | Layer 3 | ethernet1/1 | ❌ | Internet / LAN physique non sécurisé |
| SERVERS | Layer 3 | ethernet1/2 | ✅ | Serveurs critiques avec authentification AD |
| CLIENTS | Layer 3 | ethernet1/3 | ✅ | Postes utilisateurs avec User-ID |
| DMZ | Layer 3 | ethernet1/4 | ❌ | Services publics (non utilisé) |
| INFRA | Layer 3 | ethernet1/5, loopback.10 | ❌ | Infrastructure monitoring et logs |
| VPN | Layer 3 | tunnel.10 | ✅ | Clients VPN GlobalProtect authentifiés AD |

### 4.3 Règles de sécurité principales (Security Policies)

**Synthèse par zone source → destination (46 règles configurées, 18 actives):**

#### **VPN → Internal (Règles 4-11)**
- **VPN → INFRA (loopback)**: Accès admin HTTPS/SSH au PA-VM (règle 4)
- **VPN → AD (DC01)**: Authentification AD complète - DNS, Kerberos, LDAP, SMB, NetBIOS, MSRPC (règle 5)
- **VPN → DC01**: Gestion WinRM HTTPS/HTTP (règles 6, 9)
- **VPN → INFRA**: Ping, SSH, Web, gestion VictoriaLogs (port 9428), Grafana (port 3000) (règles 7, 8)
- **VPN → SERVERS**: Applications serveurs - SSH, HTTPS, ping (règle 10)
- **VPN → Proxmox**: Accès management Proxmox (port 8006) + ping/SSH (règle 11)

#### **CLIENTS → Servers/Internet (Règles 3, 12-14)**
- **CLIENTS → Internet**: Navigation web avec filtrage URL strict + AV/IPS (règle 3)
- **CLIENTS → DC01**: Authentification AD (règle 12)
- **CLIENTS → DC01**: RDP (règle 13)
- **CLIENTS → SERVERS**: Applications serveurs (règle 14)

#### **SERVERS → Internet/INFRA (Règles 1-2, 15-16, 18, 21)**
- **PA-SERVER → DC01**: LDAP pour User-ID (règle 1)
- **PA-SERVER → DC01**: MSRPC pour communication AD (règle 2)
- **SERVERS → Internet**: Mises à jour (apt-get, yum, NTP, DNS) (règle 15)
- **DC01 → Internet**: Windows Update + DNS (règle 16)
- **SERVERS → INFRA**: Envoi logs via syslog (règle 18)
- **SERVERS → INFRA**: Envoi télémétrie OpenTelemetry (ports 4317/4318) (règle 21)

#### **INFRA → Internet/Servers (Règles 17, 19-20, 22)**
- **INFRA → Internet**: Repos packages (apt-get, yum) + NTP (règle 17)
- **INFRA → SERVERS**: Requêtes DNS, NTP, ping (règle 19)
- **INFRA → Proxmox**: Monitoring API Proxmox (port 8006) + ping (règle 20)
- **INFRA intrazone**: Communication entre services monitoring (règle 22)

#### **OUTSIDE → INFRA (Règle 23)**
- **OUTSIDE → INFRA (CT 202)**: Réception syslog depuis Proxmox (port 514 UDP/TCP, 6514 TLS)

#### **OUTSIDE → AD (Règle 24)**
- **LAN physique → DC01**: Accès complet AD pour postes non segmentés (DNS, Kerberos, LDAP, SMB, RDP)

#### **OUTSIDE → INFRA/SERVERS (Règles 25-27)**
- **LAN physique → INFRA**: Ping, SSH, Web pour admin (règle 25)
- **OUTSIDE intrazone**: Communication interne LAN (règle 26)
- **LAN physique → doc-lab**: SSH et Web (règle 27 - doc-lab arrêté)

#### **Deny implicites (Règles 45-46)**
- **Intrazone deny** (règle 45): 1,538,454 hits - protection intra-zone
- **Interzone deny** (règle 46): 236,996 hits - blocage inter-zones par défaut

**Profils de sécurité appliqués:**

#### **SPG-Strict (Security Profile Group)** - Profil strict complet
- **Antivirus:** AV-Strict-Protolab
- **Anti-Spyware:** AS-Strict-Protolab  
- **Vulnerability Protection:** VP-Strict-Protolab
- **URL Filtering:** URL-Strict-ProtoLab
- **WildFire Analysis:** WF-Analysis-Protolab

#### **SPG-Balanced** - Profil équilibré (non utilisé actuellement)
- Anti-Spyware + URL Filtering + WildFire (sans AV ni Vuln Protection)

---

### **Détail des profils de sécurité personnalisés**

#### **AV-Strict-Protolab (Antivirus)**
- **Description:** Antivirus strict avec WildFire Inline ML
- **Actions par protocole:**
  - FTP/HTTP/HTTP2/SMB: Action default (allow + scan)
  - IMAP/POP3/SMTP: Reset-both (blocage emails infectés)
- **ML-AV Inline activé pour:**
  - Windows Executables (.exe, .dll)
  - PowerShell Scripts (PS1)
  - Executable Linked Format (ELF)
  - MS Office (doc, xls, ppt)
  - Shell scripts (.sh, .bash)
  - OOXML (docx, xlsx, pptx)
  - MachO (binaires macOS)

#### **AS-Strict-Protolab (Anti-Spyware)**
- **Description:** Protection anti-spyware avec DNS Security
- **Botnet sinkhole:**
  - IPv4: 72.5.65.111
  - IPv6: 2600:5200::1
- **DNS Security Categories (sinkhole actions):**
  - Command & Control: Sinkhole
  - Malware: Sinkhole
  - Phishing: Sinkhole
  - Ad tracking, DDNS, Grayware, Proxy: Alert/Default
- **Actions par sévérité:**
  - Critical/High/Medium: Reset-both + packet capture
  - Low: Alert uniquement
- **MICA Engine inline detection:**
  - HTTP/HTTP2/SSL/Unknown-TCP/UDP Command & Control: Alert
- **Cloud Inline Analysis:** Activé

#### **VP-Strict-Protolab (Vulnerability Protection)**
- **Actions par sévérité CVE:**
  - Critical/High/Medium: Reset-both + packet capture
  - Low: Alert uniquement
- **MICA Engine inline protection:**
  - SQL Injection: Alert
  - Command Injection: Alert
- **Couverture:** Tous vendors, toutes CVE, toutes catégories

#### **URL-Strict-ProtoLab (URL Filtering)**
- **Description:** Filtrage URL strict - Protection menaces
- **Safe Search:** Activé (force safe search Google/Bing)
- **Catégories BLOQUÉES (block):**
  - abused-drugs, command-and-control, gambling
  - grayware, hacking, malware, phishing
  - proxy-avoidance-and-anonymizers
  - ransomware, scanning-activity, weapons
- **Catégories en ALERTE (alert/log):**
  - adult, AI-code-assistant, AI-conversational-assistant
  - AI-data-and-workflow-optimizer, AI-media-service
  - AI-meeting-assistant, AI-platform-service
  - AI-website-generator, AI-writing-assistant
  - artificial-intelligence, auctions
  - compromised-website, content-delivery-networks
  - copyright-infringement, cryptocurrency, dating
  - dynamic-dns, encrypted-dns, file-converter
  - financial-services, high-risk, medium-risk
  - newly-registered-domain, parked, questionable
  - real-time-detection, remote-access, unknown
- **Credential Enforcement:** Désactivé (mode disabled)
- **Local Inline Categorization:** Activé

#### **WF-Analysis-Protolab (WildFire)**
- **Description:** Soumission fichiers vers WildFire Public Cloud
- **Règle "All-Files":**
  - Applications: Toutes
  - Types fichiers: Tous
  - Direction: Upload + Download
  - Analyse: Public Cloud WildFire
- **Actions intégrées:** Voir profils AV (WildFire-action reset-both pour emails)

**Log Forwarding Profile:** Rsyslog-Central-Transfert (appliqué sur toutes les règles actives)

### 4.4 NAT et règles de translation

**4 règles NAT Source (SNAT) configurées:**

| **Règle** | **Zone Source** | **Zone Dest** | **Translation** | **Hits** |
|---|---|---|---|---|
| SNAT-CLIENTS | CLIENTS | OUTSIDE | SNAT dynamique → ethernet1/1 (192.168.1.254) | 4,502 |
| SNAT-DMZ | DMZ | OUTSIDE | SNAT dynamique → ethernet1/1 | 0 |
| SNAT-SERVERS | SERVERS | OUTSIDE | SNAT dynamique → ethernet1/1 | 40,553 |
| SNAT-INFRA | INFRA | OUTSIDE | SNAT dynamique → ethernet1/1 | 57,933 |

**Note:** Pas de DNAT configurée (aucun service publié sur Internet)

### 4.5 VPN GlobalProtect ✅ **OPÉRATIONNEL**

**Statut:** ✅ **VPN 100% fonctionnel** - Connexion active, tunnel IPsec établi, trafic routé (vérifié 17/12/2025)

**Configuration Portal (GP-Portal):**
- **URL Portal:** https://192.168.1.254/global-protect/portal
- **Interface:** ethernet1/1 (192.168.1.254/24)
- **Certificat:** GP-Server-Cert (CN=192.168.1.254, expire 12 déc 2026)
- **Profil SSL/TLS:** GP-SSL-Profile
  - TLS versions: 1.2 - 1.3
  - Key exchange: RSA, DHE, ECDHE
  - Chiffrement: AES-128/256-GCM, ChaCha20-Poly1305, AES-128/256-CBC
  - Auth: SHA1, SHA256, SHA384
- **Authentification:** GP-AD-Auth (LDAP vers DC01)
- **Cookie lifetime:** 24 heures
- **Méthode connexion:** user-logon (à l'ouverture session Windows)
- **Refresh config:** 24 heures

**Configuration Gateway (GP-Gateway-N):**
- **Nom Gateway:** GP-Gateway-N
- **Interface locale:** ethernet1/1 (192.168.1.254/24)
- **IP Pool clients:** 10.1.50.2 - 10.1.50.100
- **Tunnel interface:** tunnel.10 (10.1.50.1/24)
- **Protocole:** IPsec (ESP/UDP 4500)

**Authentification AD:**
- **Profil LDAP:** DC01-PROTOLAB
- **Serveur AD:** 10.1.10.10:389 (LDAP non-SSL)
- **Base DN:** DC=protolab,DC=local
- **Bind DN:** CN=Service LDAP Palo Alto,OU=Service-Accounts,OU=Users-protolab,DC=protolab,DC=local
- **Attribut login:** sAMAccountName
- **Domaine utilisateur:** protolab
- **Expiration mot de passe:** Alerte 15 jours avant expiration
- **Fallback:** Utilisateur local "Adrien" configuré dans base locale PA-VM

**Routes push vers clients:**
- 10.1.10.0/24 (SERVERS)
- 10.1.20.0/24 (CLIENTS)
- 10.1.30.0/24 (DMZ)
- 10.1.40.0/24 (INFRA)
- 192.168.1.100/32 (Proxmox direct)
- 192.168.1.254/32 (PA-VM OUTSIDE interface)

**Statistiques session active (17/12/2025 12:46):**
- **Client IP VPN:** 10.1.50.2
- **Passerelle:** 192.168.1.254
- **Durée connexion:** 29 jours restants
- **Protocole:** IPsec
- **Temps activité:** 02:24:12
- **Octets entrants:** 29,222,602 (29.2 MB)
- **Octets sortants:** 23,291,813 (23.3 MB)
- **Paquets entrants:** 60,914
- **Paquets sortants:** 64,135

**Certificats déployés:**
1. **GlobalProtect_CA** (CA racine, expire 12/12/2026)
   - Usage: Signature certificats serveur GP
2. **GP-Server-Cert** (certificat serveur, expire 12/12/2026)
   - CN: 192.168.1.254
   - Émis par: GlobalProtect_CA
   - Usage: Portal + Gateway SSL/TLS

**Log forwarding:** Rsyslog-Central-Transfert (vers 10.1.40.30:514)

---

## 5. Services d'infrastructure

### 5.1 Active Directory (DC01.protolab.local)

**Configuration domaine:**
- **Nom domaine:** protolab.local
- **Nom NetBIOS:** PROTOLAB
- **Niveau fonctionnel:** Windows Server 2022
- **Forest root:** protolab.local (single forest)
- **DC01 FQDN:** dc01.protolab.local
- **DC01 IP:** 10.1.10.10

**Structure organisationnelle (OUs):**
- OU=Users-protolab (utilisateurs)
- OU=Service-Accounts (comptes de service)
- OU=Computers (postes joints au domaine)

**Comptes utilisateurs (8 créés):**

| **Utilisateur** | **SamAccountName** | **UPN** | **Rôle/Titre** | **Groupes** |
|---|---|---|---|---|
| Administrateur | administrateur | administrateur@protolab.local | Compte admin domaine | Admins du domaine, Administrateurs |
| Adrien | adrien | adrien@protolab.local | Technicien Systèmes et Réseaux | Utilisateurs du domaine |
| Jean Dupont | jdupont | jdupont@protolab.local | CEO | Utilisateurs du domaine |
| Marie Martin | mmartin | mmartin@protolab.local | Support IT | Utilisateurs du domaine |
| Sophie Bernard | sbernard | sbernard@protolab.local | - | Utilisateurs du domaine |
| Lucas Petit | lpetit | lpetit@protolab.local | - | Utilisateurs du domaine |
| Emma Dubois | edubois | edubois@protolab.local | - | Utilisateurs du domaine |
| **Service LDAP Palo Alto** | **svc-ldap** | svc-ldap@protolab.local | Compte service LDAP PA-VM | Utilisateurs du domaine |

**Groupes de sécurité critiques:**
- **Admins du domaine** (S-1-5-21-...-512): Membres = Administrateur
- **GRP-IT-Admins**: Groupe custom IT (à vérifier membres)
- **GRP-Partage-Commun**: Groupe partage réseau

**Comptes de service:**
- **svc-ldap:** Utilisé par PA-VM pour requêtes LDAP et User-ID (WMI)
- **Mot de passe expire:** Oui (PasswordNeverExpires = False)

**User-ID WMI:**
- **Compte WMI:** protolab\svc-ldap
- **Serveur monitored:** DC01 (10.1.10.10)
- **Intervalle log sécurité:** 60 secondes

**Group Mapping AD:**
- **Profil:** Protolab-AD-Group
- **Serveur LDAP:** DC01-PROTOLAB
- **Intervalle mise à jour:** 3600 secondes (1 heure)
- **Attribut username:** sAMAccountName
- **Attribut email:** mail
- **Attribut alternatif 1:** userPrincipalName
- **Attribut groupe:** name
- **Membres groupe:** member
- **Type objet:** group (groupes), person (utilisateurs)

### 5.2 DNS

**Configuration DNS (sur DC01):**
- **Serveur primaire:** 10.1.10.10 (DC01)
- **Zone primaire:** protolab.local
- **Redirecteurs:** 1.1.1.1, 8.8.8.8
- **Enregistrements critiques:**
  - **dc01.protolab.local → 10.1.10.10** (A record)
  - **protolab.local → 10.1.10.10** (SOA + NS)
  - **_ldap._tcp.protolab.local** (SRV record pour LDAP)
  - **_kerberos._tcp.protolab.local** (SRV record pour Kerberos)

**Clients DNS:**
- **PA-VM:** 1.1.1.1, 8.8.8.8 (DNS publics)
- **Containers LXC:** 8.8.8.8 (DNS Google)
- **VMs Windows:** 10.1.10.10 (DC01)
- **Clients VPN:** 10.1.10.10 push via GP

### 5.3 DHCP

**Statut:** À configurer sur DC01
- **Scope CLIENTS:** 10.1.20.10 - 10.1.20.200 (recommandé)
- **Options DHCP:** Gateway 10.1.20.1, DNS 10.1.10.10
- **Scope VPN:** Géré par PA-VM (10.1.50.2-.100)

### 5.4 Authentification LDAP et intégrations

**PA-VM → DC01:**
- **Protocole:** LDAP simple (port 389, pas de SSL)
- **Bind DN:** CN=Service LDAP Palo Alto,OU=Service-Accounts,OU=Users-protolab,DC=protolab,DC=local
- **Base DN:** DC=protolab,DC=local
- **Attribut recherche:** sAMAccountName
- **Usage:** Authentification VPN GlobalProtect + User-ID monitoring

**User-ID Agent (WMI):**
- **Compte:** protolab\svc-ldap
- **Serveur:** DC01 (10.1.10.10)
- **Méthode:** WMI Monitoring + Security Event Logs
- **Intervalle:** 60 secondes

---

## 6. Monitoring et logging

### 6.1 Architecture de collecte des logs

```
Sources de logs
    ├── Palo Alto PA-VM (192.168.1.37)
    │    └─→ Syslog UDP 514 → OpenTelemetry (10.1.40.30)
    ├── Proxmox VE (192.168.1.100)
    │    └─→ Syslog UDP 514 → OpenTelemetry (10.1.40.30)
    └── DC01 + autres VMs/LXC
         └─→ OTEL gRPC 4317/4318 → OpenTelemetry (10.1.40.30)

OpenTelemetry Collector (10.1.40.30)
    ├── Receiver: Syslog (UDP 514), OTLP (4317/4318)
    ├── Processor: Parsing, enrichissement
    └── Exporter: VictoriaLogs API

VictoriaLogs (10.1.40.25)
    ├── Stockage: Base de données logs tsdb
    └── Query API: Exposition pour Grafana
```

**Configuration Rsyslog PA-VM:**
- **Serveur:** 10.1.40.30:514 UDP
- **Format:** BSD Syslog
- **Facility:** LOG_USER
- **Log forwarding profile:** Rsyslog-Central-Transfert (appliqué sur toutes les règles)
- **Filtre système:** Severity >= medium

**VictoriaLogs (CT 201):**
- **Port API:** 9428 (HTTP)
- **Port ingestion:** 9428/victorialogs API
- **Stockage:** /var/lib/victorialogs (20 GB disk)
- **Version:** Dernière version stable (déployée via script bash)

**OpenTelemetry Collector (CT 202):**
- **Ports:**
  - 514/UDP - Syslog receiver
  - 6514/TCP - Syslog TLS (si configuré)
  - 4317/TCP - OTLP gRPC
  - 4318/TCP - OTLP HTTP
- **Rôle:** Agrégation multi-protocole vers VictoriaLogs
- **Configuration:** /etc/otelcol/config.yaml

### 6.2 Dashboards Grafana et alertes

**Grafana OSS (CT 203):**
- **URL:** http://10.1.40.35:3000
- **Version:** Latest OSS
- **Data source:** VictoriaLogs (http://10.1.40.25:9428)

**Dashboards à configurer:**
- Logs PA-VM (Traffic, Threat, System)
- Métriques Proxmox (CPU, RAM, storage)
- Événements AD (authentifications, changements GPO)
- Alertes VPN (échecs connexion)

**Alertes configurées:**
- Pas d'informations disponibles (à implémenter)

### 6.3 Flux de données et stockage

**Volumes de données estimés:**
- **PA-VM logs:** ~5-10 MB/jour (trafic lab)
- **Proxmox logs:** ~2 MB/jour
- **AD event logs:** Variable selon activité
- **Rétention VictoriaLogs:** 30 jours recommandé (disque 20GB CT 201)

**Backup logs:**
- Pas de stratégie configurée actuellement
- **Recommandation:** Export périodique vers NAS ou stockage externe

---

## 7. Informations opérationnelles

### 7.1 Credentials et accès

**⚠️ Note:** Mots de passe réels non inclus dans cette documentation (sécurité)

**Accès management:**
| **Système** | **URL/IP** | **Compte** | **Notes** |
|---|---|---|---|
| Proxmox Web UI | https://192.168.1.100:8006 | root | Authentification PAM |
| Palo Alto PA-VM | https://192.168.1.37 | admin | Interface web NGFW (management) |
| Palo Alto PA-VM | https://192.168.1.254 | admin | Interface OUTSIDE + Portal VPN |
| Palo Alto PA-VM (local) | - | Adrien | Utilisateur local fallback (base locale PA-VM) |
| Palo Alto SSH | ssh admin@192.168.1.37 | admin | CLI management |
| DC01 RDP | 10.1.10.10:3389 | protolab\administrateur | Admin domaine |
| DC01 WinRM | 10.1.10.10:5985/5986 | protolab\administrateur | Gestion distante PowerShell |
| Grafana | http://10.1.40.35:3000 | admin | Premier login génère mot de passe |

**Comptes de service:**
- **svc-ldap@protolab.local**: LDAP PA-VM + WMI User-ID
- Stocker mots de passe dans gestionnaire sécurisé (KeePass, Bitwarden, vault)

### 7.2 Ports réseau ouverts et services exposés

**Proxmox (192.168.1.100):**
- 22/TCP - SSH
- 8006/TCP - Proxmox Web UI (HTTPS)
- 5900-5999/TCP - VNC consoles VM (localhost uniquement recommandé)

**PA-VM (192.168.1.37, 192.168.1.254):**
- 22/TCP - SSH Management (interface management + OUTSIDE)
- 443/TCP - HTTPS Management (interface management)
- 443/TCP - GlobalProtect Portal (interface OUTSIDE 192.168.1.254)
- 443/TCP - GlobalProtect Gateway (interface OUTSIDE 192.168.1.254)
- 500/UDP - IKE (IPsec phase 1)
- 4500/UDP - NAT-T IPsec (ESP encapsulé, VPN GlobalProtect)
- ICMP - Ping (si autorisé par interface management profile)

**DC01 (10.1.10.10):**
- 53/TCP+UDP - DNS
- 88/TCP+UDP - Kerberos
- 135/TCP - RPC Endpoint Mapper
- 139/TCP - NetBIOS Session Service
- 389/TCP - LDAP
- 445/TCP - SMB
- 464/TCP+UDP - Kerberos Password Change
- 636/TCP - LDAPS (si SSL activé)
- 3268/TCP - Global Catalog
- 3389/TCP - RDP
- 5985/TCP - WinRM HTTP
- 5986/TCP - WinRM HTTPS
- 9389/TCP - AD Web Services
- 49152-65535/TCP - RPC Dynamic Ports

**VictoriaLogs (10.1.40.25):**
- 9428/TCP - VictoriaLogs API

**OpenTelemetry (10.1.40.30):**
- 514/UDP - Syslog receiver
- 6514/TCP - Syslog TLS
- 4317/TCP - OTLP gRPC
- 4318/TCP - OTLP HTTP

**Grafana (10.1.40.35):**
- 3000/TCP - Grafana Web UI

### 7.3 Dépendances entre composants

**Dépendances critiques:**

```
DC01 (10.1.10.10) [CENTRAL]
    ├─→ PA-VM (LDAP auth, User-ID)
    ├─→ Clients VPN (DNS, Auth)
    ├─→ Win10ProAD (Domain join, GPO)
    └─→ Tous postes domaine (Auth, policies)

PA-VM (192.168.1.37) [CENTRAL]
    ├─→ DC01 (User-ID, LDAP)
    ├─→ OpenTelemetry (Log forwarding)
    └─→ Toutes zones (Routage, sécurité)

OpenTelemetry (10.1.40.30)
    ├─→ VictoriaLogs (Export logs)
    └─→ PA-VM + Proxmox (Syslog ingestion)

VictoriaLogs (10.1.40.25)
    └─→ Grafana (Data source)

Proxmox (192.168.1.100) [INFRASTRUCTURE]
    ├─→ PA-VM (Routage zones internes)
    └─→ Toutes VMs/LXC (Hyperviseur)
```

### 7.4 Points de défaillance uniques (SPOF)

| **Composant** | **Impact panne** | **Mitigation actuelle** |
|---|---|---|
| **PA-VM** | ❌ Perte totale routage inter-zones + Internet + VPN | Aucune (single instance) |
| **DC01** | ❌ Perte authentification AD, DNS, Auth VPN | Aucune (single DC) |
| **Proxmox Host** | ❌ Perte totale infrastructure | Backup config Proxmox |
| **VictoriaLogs** | ⚠️ Perte collecte logs (pas critique) | Logs stockés localement sur sources |
| **OpenTelemetry** | ⚠️ Perte ingestion temps réel (pas critique) | Aucune |
| **Box FAI (192.168.1.1)** | ❌ Perte Internet total | Aucune (FAI unique) |

**Recommandations futures:**
- Déployer DC02 secondaire (haute dispo AD)
- HA Proxmox cluster (3 nodes minimum)
- Backup automatisé VictoriaLogs vers NAS

---

## 8. Annexes techniques

### 8.1 Extraits de configuration critiques

**Certificats GlobalProtect (PA-VM):**

1. **GlobalProtect_CA** (CA racine auto-signée)
```
Common Name: GLobalProtect_CA
Subject: /CN=GLobalProtect_CA
Issuer: /CN=GLobalProtect_CA (self-signed)
Valid: 12 Dec 2025 → 12 Dec 2026
Algorithm: RSA
Usage: CA Certificate Authority
```

2. **GP-Server-Cert** (certificat serveur Portal/Gateway)
```
Common Name: 192.168.1.254
Subject: /CN=192.168.1.254
Issuer: /CN=GLobalProtect_CA
Valid: 12 Dec 2025 → 12 Dec 2026
Algorithm: RSA
Usage: Server Authentication, Client Authentication, IPsec End System
```

**PA-VM - Profil SSL/TLS GlobalProtect:**
```
set shared ssl-tls-service-profile GP-SSL-Profile
  protocol-settings min-version tls1-2 max-version tls1-3
  keyxchg-algo-rsa yes keyxchg-algo-dhe yes keyxchg-algo-ecdhe yes
  enc-algo-aes-128-cbc yes enc-algo-aes-128-gcm yes
  enc-algo-aes-chacha20-poly1305 yes
  enc-algo-aes-256-cbc yes enc-algo-aes-256-gcm yes
  auth-algo-sha1 yes auth-algo-sha256 yes auth-algo-sha384 yes
  certificate GP-Server-Cert
```

**PA-VM - Route statique par défaut:**
```
set network virtual-router default routing-table ip static-route default-route 
  nexthop ip-address "FAI ORANGE"
  interface ethernet1/1
  metric 10
  destination 0.0.0.0/0
```

**PA-VM - Profil LDAP DC01:**
```
set shared server-profile ldap DC01-PROTOLAB 
  server DC01-PROTOLAB address 10.1.10.10 port 389
  ldap-type active-directory
  bind-dn "CN=Service LDAP Palo Alto,OU=Service-Accounts,OU=Users-protolab,DC=protolab,DC=local"
  base DC=protolab,DC=local
  ssl no
```

**PA-VM - User-ID Agent:**
```
set vsys vsys1 user-id-collector setting 
  wmi-account protolab\svc-ldap
  domain-name protolab.local
  security-log-interval 60
set vsys vsys1 user-id-collector server-monitor DC01 
  active-directory host 10.1.10.10
  description protolab.local
```

**Proxmox - Route statique vers zones internes:**
```bash
# /etc/network/interfaces
post-up ip route add 10.1.0.0/16 via 192.168.1.254
```

**Client VPN - Routes pushées (Windows):**
```
10.1.10.0/24 via 10.1.50.2 (on-link)
10.1.20.0/24 via 10.1.50.2 (on-link)
10.1.30.0/24 via 10.1.50.2 (on-link)
10.1.40.0/24 via 10.1.50.2 (on-link)
192.168.1.100/32 via 10.1.50.2 (on-link)
```

### 8.2 Commandes d'administration fréquentes

**Proxmox CLI:**
```bash
# Lister VMs et containers
qm list              # VMs
pct list             # Containers LXC

# Console VM/CT
qm terminal 103      # Console DC01
pct enter 201        # Shell root CT VictoriaLogs

# Snapshot VM
qm snapshot 103 "avant-MAJ-KB5012345" --vmstate 1

# Backup manuel
vzdump 103 --mode snapshot --compress zstd --storage local
```

**PA-VM CLI (SSH admin@192.168.1.37):**
```bash
# Afficher sessions actives
show session all

# Logs temps réel
tail follow yes mp-log traffic.log
tail follow yes mp-log threat.log

# User-ID mapping
show user ip-user-mapping all

# VPN sessions GlobalProtect
show global-protect-gateway current-user

# Commit configuration
commit
commit force

# Tester connectivité
ping source 10.1.10.1 host 10.1.10.10
```

**Active Directory (PowerShell sur DC01):**
```powershell
# Utilisateurs AD
Get-ADUser -Filter * -Properties DisplayName,Title,LastLogonDate | 
  Select SamAccountName,DisplayName,Title,LastLogonDate

# Vérifier réplication AD (si multi-DC futur)
repadmin /replsummary

# Tester authentification compte service
Test-ADUser -Identity svc-ldap

# Événements sécurité (échecs auth)
Get-EventLog -LogName Security -InstanceId 4625 -Newest 10

# GPO appliquées sur DC
gpresult /r
```

**Diagnostic réseau (Windows client VPN):**
```powershell
# Routes actives
route print

# Test connectivité zones
Test-NetConnection 10.1.10.10 -Port 389  # LDAP DC01
Test-NetConnection 10.1.40.35 -Port 3000 # Grafana

# Résolution DNS
nslookup dc01.protolab.local 10.1.10.10
```

**VictoriaLogs (sur CT 201):**
```bash
# Status service
systemctl status victorialogs

# Requête logs (API)
curl 'http://10.1.40.25:9428/select/logsql/query' \
  -d 'query=_stream:{hostname="PA-VM"} | limit 100'

# Espace disque
df -h /var/lib/victorialogs
```

### 8.3 Procédures de backup et restauration

**Backup Proxmox (automatisé via GUI):**
1. **Datacenter** → **Backup** → Créer job backup
2. Sélection: Toutes VMs critiques (102 PA-VM, 103 DC01)
3. Mode: Snapshot
4. Stockage: local ou NFS externe
5. Rétention: 7 jours minimum
6. Planning: Quotidien 02:00

**Backup PA-VM config (manuel):**
1. GUI: **Device** → **Setup** → **Operations** → **Export named configuration**
2. Télécharger fichier .xml
3. Stocker avec date: `PA-VM-Config-YYYYMMDD.xml`
4. Backup certificats: **Device** → **Certificate Management** → Export

**Backup AD (DC01):**
1. **Windows Server Backup** (à installer)
2. Backup complet system state quotidien
3. OU: Export via PowerShell:
   ```powershell
   Get-ADOrganizationalUnit -Filter * | 
     Export-Csv C:\Backups\AD-OUs-$(Get-Date -F yyyyMMdd).csv
   ```

**Restauration PA-VM:**
1. Importer config: **Device** → **Setup** → **Operations** → **Load named config**
2. Merge ou Replace selon besoin
3. Commit après vérification

**Restauration DC01:**
- **Mode Directory Services Restore (DSRM)** + restauration system state
- Documentation Microsoft: [AD Disaster Recovery](https://docs.microsoft.com)

---

## Notes finales

**Version documentation:** 2.0 - 17 décembre 2025  
**Dernière révision:** 17 décembre 2025 - Enrichissement complet config PA-VM + validation VPN opérationnel  
**Améliorations planifiées:**
- Déploiement DHCP sur DC01 pour zone CLIENTS
- Configuration dashboards Grafana complets (PA-VM Traffic/Threat, Proxmox metrics, AD events)
- Implémentation alerting email/Slack (VPN down, threshold CPU/RAM, échecs auth AD)
- Automatisation backup VictoriaLogs (export quotidien vers NAS)
- Déploiement DC02 secondaire (haute disponibilité AD)
- Tests de charge PA-VM (benchmark throughput, sessions concurrentes)
- Documentation procédures troubleshooting avancées

**Métriques infrastructure (17/12/2025):**
- VPN GlobalProtect: ✅ Opérationnel (29 jours uptime, 52.5 MB trafic cumulé)
- Règles firewall: 46 configurées, 18 actives, 1.8M hits deny rules
- User-ID: Synchronisation active DC01 (60s interval)
- Logs centralisés: VictoriaLogs opérationnel (CT 201, 20GB storage)

**Contact technique:**  
Adrien - Technicien Supérieur Systèmes et Réseaux (TSSR)  
Email: adrien@protolab.local

---

*Documentation générée à partir des exports de configuration du 17 décembre 2025*  
*Validation terrain: VPN GlobalProtect testé et fonctionnel*
