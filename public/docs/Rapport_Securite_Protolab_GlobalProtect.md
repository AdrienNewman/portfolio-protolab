---
title: "Rapport de Sécurité - GlobalProtect Protolab"
description: "Analyse de sécurité complète et préparation à l'ouverture GlobalProtect vers Internet avec Palo Alto PA-VM"
category: security
date: 2024-12-15
tags:
  - palo-alto
  - globalprotect
  - vpn
  - security
  - firewall
  - threat-prevention
author: Adrien Mercadier
difficulty: advanced
featured: true
---

# Rapport d'Analyse de Sécurité - Protolab Infrastructure
## Préparation à l'ouverture GlobalProtect vers Internet

**Date** : 15 décembre 2025
**Version** : 1.0
**Infrastructure** : Protolab.local
**Firewall** : Palo Alto PA-VM-50 (PAN-OS 11.2.7-h4)
**Auteur** : Analyse technique senior
**Statut** : PRÉ-PRODUCTION - CRITIQUE

---

## TABLE DES MATIÈRES

1. [Analyse de la Sécurité Existante](#1-analyse-de-la-sécurité-existante)
2. [Mise en Place des Règles de Sécurité](#2-mise-en-place-des-règles-de-sécurité)
3. [Tests et Validation Avant Connexion Internet](#3-tests-et-validation-avant-connexion-internet)
4. [Synthèse et Roadmap](#4-synthèse-et-roadmap)

---

## 1. ANALYSE DE LA SÉCURITÉ EXISTANTE

### 1.1 Vue d'ensemble de l'infrastructure actuelle

**Points positifs identifiés** ✅

1. **Segmentation réseau en place** : Votre infrastructure utilise déjà une segmentation claire avec 5 zones (OUTSIDE, SERVERS, CLIENTS, DMZ, INFRA). C'est une excellente base pour une architecture Zero Trust.

2. **Licences complètes activées** : Vous disposez du bundle Enterprise Complete avec :
   - Threat Prevention (IPS, Antivirus, Anti-spyware)
   - URL Filtering (PAN-DB)
   - Advanced Threat Prevention (WildFire, DNS Security)
   - GlobalProtect Gateway + Portal
   - Premium Support

3. **Stack de logs centralisés** : Victoria Logs + OpenTelemetry Collector fonctionnel, permettant la traçabilité et l'audit.

4. **Active Directory opérationnel** : DC01 (10.1.10.10) avec DNS, Kerberos, LDAP - infrastructure d'authentification solide.

5. **GlobalProtect fonctionnel en local** : Certificats corrigés, split-tunnel configuré, pool VPN 10.1.50.0/24 défini.

---

### 1.2 Problèmes critiques identifiés 🚨

#### 🔴 **CRITIQUE #1 : Règles "Default" permettant TOUT le trafic**

**Règle #24 : intrazone-default**
```
Type: intrazone
Source: any → Destination: any
Application: any → Service: any
Action: ALLOW
Hit Count: 4,330
```

**Règle #25 : interzone-default**
```
Type: interzone
Source: any → Destination: any
Application: any → Service: any
Action: ALLOW
Hit Count: 58,431 (!)
```

**Risque** : Ces règles violent le principe fondamental du **moindre privilège**. La règle #25 a enregistré 58 431 connexions - c'est votre règle la plus utilisée, ce qui signifie que votre firewall fonctionne actuellement en mode "ALLOW ALL" par défaut.

**Impact si exposition Internet** : Un attaquant ayant compromis une machine dans n'importe quelle zone pourrait communiquer librement avec toutes les autres zones, y compris :
- Accès direct depuis VPN vers DC01
- Pivotement entre zones sans restriction
- Exfiltration de données sans détection

**Recommandation ANSSI** : Le guide ANSSI "Recommandations de sécurité relatives aux architectures réseau" (2022) stipule explicitement : *"Le principe de moindre privilège doit être appliqué : tout flux non explicitement nécessaire doit être interdit par défaut."*

**Action requise** :
1. **SUPPRIMER** ces règles immédiatement après validation des règles explicites
2. Implémenter une règle DENY-ALL finale avec logging
3. Créer des règles explicites pour chaque flux légitime

---

#### 🔴 **CRITIQUE #2 : Exposition Active Directory depuis OUTSIDE**

**Règles concernées : #5 à #12**

Actuellement, vous autorisez l'accès direct à DC01 (10.1.10.10) depuis OUTSIDE (192.168.1.0/24) :

| Règle | Application | Source | Destination | Hits |
|-------|-------------|--------|-------------|------|
| #5 | AD, DNS, Kerberos, LDAP, SMB, RDP, MSRPC | 192.168.1.0/24 | 10.1.10.10 | 73,831 |
| #6 | SSH | 192.168.1.0/24 | 10.1.10.10 | 17 |
| #7 | NetBIOS | 192.168.1.0/24 | 10.1.10.10 | 8 |
| #8 | DNS | 192.168.1.0/24 | 10.1.10.10 | 9,703 |
| #9 | Kerberos | 192.168.1.0/24 | 10.1.10.10 | 231 |
| #10 | LDAP | 192.168.1.0/24 | 10.1.10.10 | 500 |
| #11 | SMB | 192.168.1.0/24 | 10.1.10.10 | 366 |

**Problème** : La zone OUTSIDE correspond actuellement à votre LAN domestique (192.168.1.0/24). Si vous ouvrez GlobalProtect vers Internet via port forwarding sur votre box, cette zone OUTSIDE sera accessible depuis l'extérieur.

**Risque d'exposition Internet** :
- **RDP** (règle #5) : Cible privilégiée pour les attaques par force brute
- **SMB** (règle #11) : Vecteur d'attaque EternalBlue, ransomware
- **LDAP** (règle #10) : Énumération d'utilisateurs, attaques par dictionnaire
- **SSH** (règle #6) : Force brute sur DC Windows (si OpenSSH activé)

**Référence Palo Alto** : Le document *"Best Practices for Securing Active Directory"* (Palo Alto Networks, 2024) recommande explicitement de **ne jamais exposer directement un contrôleur de domaine à Internet**.

**Action requise** :
1. Créer une zone **VPN** dédiée pour les clients GlobalProtect
2. Restreindre l'accès AD uniquement depuis VPN et LANs de confiance
3. Supprimer l'exposition directe depuis OUTSIDE après migration

---

#### 🟠 **MAJEUR #3 : Absence de profils de sécurité sur des règles critiques**

**Règles sans profil de sécurité** :

| Règle | Flux | Profil actuel | Risque |
|-------|------|---------------|--------|
| #2 | VPN → INTERNAL | **Aucun** | Pas d'inspection malware/virus |
| #5 | OUTSIDE → AD | **Aucun** | Pas de protection threat |
| #16 | SERVERS → Internet | **Aucun** | Exfiltration non détectée |
| #22 | OUTSIDE intrazone | **Aucun** | Trafic LAN non inspecté |
| #25 | ANY → ANY | **Aucun** | Aucune protection |

**Impact** : Vous disposez de licences Threat Prevention et Advanced Threat Prevention mais elles ne sont pas exploitées sur les flux critiques. Un malware pourrait transiter librement via le VPN ou depuis Internet.

**Référence Palo Alto** : Le *"Security Policy Best Practices"* guide recommande d'appliquer **au minimum** un profil de sécurité sur toute règle autorisant du trafic entre zones de confiance différentes.

**Action requise** :
1. Créer des Security Profile Groups adaptés à chaque zone
2. Appliquer systématiquement ces profils sur toutes les règles ALLOW
3. Activer le logging des menaces détectées

---

#### 🟠 **MAJEUR #4 : Licences sous-exploitées**

Vous payez pour des fonctionnalités avancées que vous n'utilisez pas :

**1. DNS Security (inclus dans Advanced TP)**
- **État actuel** : Non configuré
- **Utilité** : Bloque les domaines malveillants via DNS tunneling, C2, phishing
- **Impact** : Vos serveurs et postes peuvent résoudre des domaines malveillants sans alerte
- **Configuration manquante** : Anti-Spyware profile avec DNS Security activé

**2. WildFire Analysis (Advanced TP)**
- **État actuel** : Probablement non activé (pas visible dans les profils)
- **Utilité** : Analyse sandbox des fichiers inconnus (PE, APK, PDF, Office)
- **Impact** : Les fichiers suspects transitent sans analyse approfondie
- **Configuration manquante** : WildFire Analysis profile avec actions block/alert

**3. User-ID (Standard VM-100)**
- **État actuel** : Non configuré (auth LocalDB sur GP)
- **Utilité** : Identification des utilisateurs AD dans les logs et règles
- **Impact** : Vous ne voyez que des IPs dans les logs, pas "jdupont" ou "mmartin"
- **Configuration manquante** : User-ID agent ou monitoring de DC01

**4. SSL/TLS Decryption**
- **État actuel** : Non configuré
- **Utilité** : Inspection du trafic HTTPS pour détecter malwares cachés
- **Impact** : 90% du trafic malveillant moderne utilise HTTPS - non inspecté chez vous
- **Configuration manquante** : Decryption policy + certificat CA interne

**5. Threat Prevention Profiles optimisés**
- **État actuel** : Profils "default" non personnalisés
- **Référence PA** : Le guide *"Threat Prevention Best Practices"* recommande des profils différenciés par zone :
  - **Strict** pour DMZ et VPN → INTERNAL
  - **Balanced** pour INTERNAL → Internet
  - **Alert-Only** pour INTERNAL intrazone (éviter les faux positifs)

**Action requise** :
1. Activer DNS Security sur les profils Anti-Spyware
2. Configurer WildFire Analysis avec forward des fichiers suspects
3. Déployer User-ID agent pour intégration AD
4. Évaluer la nécessité de SSL Decryption (charge CPU)
5. Créer des profils de sécurité personnalisés par zone

---

#### 🟡 **MINEUR #5 : Architecture de zone VPN non optimale**

**État actuel** : La règle #2 "VPN-to-INTERNAL" autorise la zone VPN vers INFRA et SERVERS, mais la documentation GlobalProtect montre que le pool VPN est 10.1.50.0/24, non déclaré comme zone dédiée.

**Problème** : Mélange entre zone "VPN" générique et pool d'adresses. Risque de confusion lors du troubleshooting.

**Recommandation ANSSI** : Une zone VPN dédiée permet :
- Policies spécifiques pour les utilisateurs distants
- Logging différencié
- Contrôle granulaire par groupe AD

**Action requise** :
1. Créer une interface tunnel.1 pour GlobalProtect
2. Assigner cette interface à une zone **VPN** dédiée
3. Migrer les règles pour utiliser cette zone

---

### 1.3 Matrice de flux actuelle vs. sécurisée

#### **Flux actuels autorisés** (analyse des 25 règles)

| Source | Destination | Applications/Ports | Hits | Évaluation |
|--------|-------------|-------------------|------|------------|
| CLIENTS → Internet | ANY | dns, ssl, web-browsing | 6,609 | ✅ Normal (besoin utilisateur) |
| VPN → INFRA/SERVERS | ANY | ANY | 2,444 | 🟠 Trop permissif (besoin ANY?) |
| OUTSIDE → INFRA | 10.1.40.30 | syslog (UDP/514) | 735 | ✅ Légitime (PA → OTEL) |
| CLIENTS → SERVERS | 10.1.10.10 | ANY | 5,222 | 🟠 ANY trop large |
| **OUTSIDE → SERVERS** | **10.1.10.10** | **AD, DNS, RDP, SMB, SSH** | **73,831** | 🔴 **CRITIQUE** |
| SERVERS → Internet | ANY | ANY | 69,228 | 🟠 Besoin validation |
| INFRA → Internet | ANY | ssl, web-browsing | 1,446 | ✅ Updates OK |
| **ANY → ANY** | **(intrazone)** | **ANY** | **4,330** | 🔴 **À supprimer** |
| **ANY → ANY** | **(interzone)** | **ANY** | **58,431** | 🔴 **À supprimer** |

#### **Flux recommandés après sécurisation**

| Source | Destination | Applications | Justification | Profil sécurité |
|--------|-------------|--------------|---------------|-----------------|
| VPN → SERVERS | 10.1.10.0/24 | AD, DNS, Kerberos, LDAP, RDP | Accès admin distant | **Strict** (TP + AV + URL + WF) |
| VPN → INFRA | 10.1.40.0/24 | ssh, https (Grafana) | Management infrastructure | **Strict** |
| CLIENTS → SERVERS | 10.1.10.10 | DNS, Kerberos | Auth utilisateurs | **Balanced** |
| SERVERS → Internet | ANY | dns, http, https, ntp | Updates + requêtes légitimes | **Balanced** + DNS Security |
| INFRA → Internet | ANY | dns, http, https | Updates CT/LXC | **Balanced** + DNS Security |
| INFRA → SERVERS | 10.1.10.10 | DNS, NTP | Services centralisés | **Alert-Only** |
| **LAN Admin → PA-VM** | **192.168.1.37** | **HTTPS (443)** | **Management FW** | **Aucun** (trusted admin) |
| **Internet → PA-VM** | **IP_Publique** | **GP (443, 4501)** | **VPN SSL distant** | **N/A** (GP intégré) |

---

### 1.4 Recommandations par priorité

#### 🔴 **PRIORITÉ 1 - CRITIQUE (À faire AVANT ouverture Internet)**

1. **Supprimer les règles default ANY-ANY** (#24, #25)
2. **Créer une zone VPN dédiée** et migrer les flux
3. **Restreindre l'accès AD** (supprimer exposition OUTSIDE → DC01)
4. **Implémenter une règle DENY-ALL finale** avec logging
5. **Activer profils de sécurité** sur toutes les règles ALLOW

#### 🟠 **PRIORITÉ 2 - MAJEUR (Avant production)**

6. **Configurer User-ID** avec intégration AD
7. **Activer DNS Security** sur tous les profils Anti-Spyware
8. **Configurer WildFire Analysis** avec forward malware
9. **Créer des profils de sécurité personnalisés** (Strict/Balanced/Alert-Only)
10. **Documenter et valider chaque règle** (principe du besoin légitime)

#### 🟡 **PRIORITÉ 3 - AMÉLIORATION (Post-déploiement)**

11. Évaluer **SSL Decryption** pour inspection HTTPS
12. Implémenter **Zones de quarantaine** pour postes compromis
13. Configurer **Dynamic Address Groups** basés sur tags
14. Activer **Vulnerability Protection** sur tous les profils
15. Créer des **dashboards ACC** (Application Command Center) pour visibilité

---

## 2. MISE EN PLACE DES RÈGLES DE SÉCURITÉ

### 2.1 Architecture cible

#### **Nouvelle topologie avec zone VPN**

```
                    INTERNET (ANY)
                         │
                         │ Port Forward (Box Orange)
                         │ 443/TCP → 192.168.1.254:443
                         │ 4501/UDP → 192.168.1.254:4501
                         │
                         ▼
            ┌────────────────────────────┐
            │   PALO ALTO PA-VM-50       │
            │   Interface OUTSIDE        │
            │   (192.168.1.254)          │
            │                            │
            │  ┌──────────────────────┐  │
            │  │ GlobalProtect Portal │  │
            │  │ + Gateway            │  │
            │  │ Tunnel Interface     │  │
            │  └──────────────────────┘  │
            │           │                 │
            │           ▼                 │
            │  ┌──────────────────────┐  │
            │  │   ZONE: VPN          │  │
            │  │   10.1.50.0/24       │  │
            │  │   tunnel.1           │  │
            │  └──────────────────────┘  │
            │           │                 │
            │           │ Security Policies
            │           │ (Strict Profiles)
            │           ▼                 │
            │  ┌─────────┬─────────┬────┴────┐
            │  │ SERVERS │ CLIENTS │ INFRA   │
            │  │ .10/24  │ .20/24  │ .40/24  │
            │  └─────────┴─────────┴─────────┘
            └────────────────────────────────┘
                         │
                         ▼
                    DC01 + Services
```

---

### 2.2 Plan d'action étape par étape

#### **PHASE 1 : Préparation et sauvegarde (1h)**

**Étape 1.1 - Sauvegarde configuration**
```bash
# Depuis CLI PA-VM ou GUI
Device > Setup > Operations > Export named configuration snapshot
Nom: "Pre-Internet-Opening-Backup-20251215"
```

**Étape 1.2 - Documentation état actuel**
```bash
# Export running config
show config running > running-config-backup.xml

# Export security rules
Policies > Security > Export to CSV

# Capture session table
show session all
```

**Validation** : ✅ Backup stocké sur PC admin + Proxmox Backup

---

#### **PHASE 2 : Création de la zone VPN (30 min)**

**Étape 2.1 - Créer l'interface tunnel**

```
Network > Interfaces > Tunnel
┌────────────────────────────────────┐
│ Interface Name: tunnel.1           │
│ Virtual Router: default            │
│ Security Zone: VPN                 │
│                                    │
│ IPv4: (Non assignée - GP gère)    │
│ Comment: GlobalProtect VPN Pool    │
└────────────────────────────────────┘
```

**Étape 2.2 - Créer la zone VPN**

```
Network > Zones > Add
┌────────────────────────────────────┐
│ Name: VPN                          │
│ Type: Layer3                       │
│ Interfaces: tunnel.1               │
│                                    │
│ Enable User Identification: ✓      │
│ Log Setting: Rsyslog-Central       │
└────────────────────────────────────┘
```

**Étape 2.3 - Assigner tunnel.1 au GlobalProtect Gateway**

```
Network > GlobalProtect > Gateways > GP-Gateway-N
┌────────────────────────────────────┐
│ Tunnel Settings                    │
│ Tunnel Interface: tunnel.1         │
│                                    │
│ Client Settings                    │
│ IP Pools: GP-Pool (10.1.50.2-254) │
│ DNS: 10.1.10.10                    │
│ DNS Suffix: protolab.local         │
└────────────────────────────────────┘
```

**Validation** : ✅ Zone VPN visible dans `show zone`

---

#### **PHASE 3 : Configuration User-ID (45 min)**

**Prérequis** : Créer un compte de service dédié dans AD

Sur DC01 (PowerShell) :
```powershell
# Créer le compte User-ID
New-ADUser -Name "svc_pauid" -UserPrincipalName "svc_pauid@protolab.local" `
  -AccountPassword (ConvertTo-SecureString "VotreMotDePasseComplexe123!" -AsPlainText -Force) `
  -Enabled $true -PasswordNeverExpires $true -CannotChangePassword $true `
  -Description "Palo Alto User-ID Service Account"

# Ajouter aux groupes requis
Add-ADGroupMember -Identity "Event Log Readers" -Members "svc_pauid"
Add-ADGroupMember -Identity "GRP_PA_UID" -Members "svc_pauid"
```

**Étape 3.1 - Configurer User-ID sur PA-VM**

```
Device > User Identification > User Mapping > Palo Alto Networks User-ID Agent Setup
┌────────────────────────────────────────────────────┐
│ Server Profile: DC01-UserID                        │
│ Domain: protolab.local                             │
│                                                    │
│ Server Monitoring                                  │
│ Network Address: 10.1.10.10                        │
│ LDAP Port: 389                                     │
│                                                    │
│ Bind DN: CN=svc_pauid,OU=Service-Accounts,DC=...  │
│ Bind Password: [VotreMotDePasse]                   │
│                                                    │
│ Test: [Test Server Connectivity]                   │
└────────────────────────────────────────────────────┘
```

**Étape 3.2 - Activer User-ID sur la zone VPN**

```
Network > Zones > VPN > Enable User Identification: ✓
```

**Étape 3.3 - Configurer le mapping utilisateurs GP**

```
Network > GlobalProtect > Portals > GP-Portal
┌────────────────────────────────────┐
│ Authentication                     │
│ Authentication Profile: GP-AD-Auth │
│ (créé ci-dessous)                  │
│                                    │
│ User-ID Integration: ✓             │
│ Collect User Info: ✓               │
└────────────────────────────────────┘
```

**Étape 3.4 - Créer le profil d'authentification AD**

```
Device > Authentication Profile
┌────────────────────────────────────┐
│ Name: GP-AD-Auth                   │
│ Type: LDAP                         │
│ Server Profile: DC01-UserID        │
│                                    │
│ LDAP Settings                      │
│ Login Attribute: sAMAccountName    │
│ Search Base: DC=protolab,DC=local  │
│                                    │
│ Allow List:                        │
│ - GRP_ADM_ALL                      │
│ - GRP_ADM_NET                      │
│ - GRP_ADM_SYS                      │
└────────────────────────────────────┘
```

**Validation** : 
```bash
# Tester User-ID
show user ip-user-mapping all

# Devrait afficher après connexion GP test :
# IP: 10.1.50.2, User: protolab\jdupont, Timeout: 3600
```

---

#### **PHASE 4 : Création des profils de sécurité (1h)**

**Étape 4.1 - Profil Strict (VPN → INTERNAL)**

```
Objects > Security Profiles > Anti-Spyware
┌────────────────────────────────────────────┐
│ Name: AS-Strict-VPN                        │
│                                            │
│ Rules:                                     │
│ critical/high/medium: block, default-drop  │
│ low/info: alert                            │
│                                            │
│ DNS Security: ✓ Enabled                    │
│ ├─ Sinkhole IPv4: 172.16.99.99            │
│ ├─ Action: block                          │
│ └─ Log: all                               │
│                                            │
│ Passive DNS: ✓ Enabled                     │
│ Inline ML: ✓ Enabled                       │
└────────────────────────────────────────────┘
```

```
Objects > Security Profiles > Vulnerability Protection
┌────────────────────────────────────────────┐
│ Name: VP-Strict-VPN                        │
│                                            │
│ Rules:                                     │
│ critical/high: block-ip (source, 3600s)    │
│ medium: alert                              │
│ low/info: default                          │
│                                            │
│ Exceptions: (aucune pour VPN)              │
└────────────────────────────────────────────┘
```

```
Objects > Security Profiles > Antivirus
┌────────────────────────────────────────────┐
│ Name: AV-Strict-VPN                        │
│                                            │
│ Decoder:                                   │
│ http/smtp/imap/pop3/ftp/smb: ✓ all        │
│                                            │
│ Action: reset-both (kill session)          │
│                                            │
│ WildFire Action:                           │
│ malicious: reset-both                      │
│ grayware: alert                            │
│ phishing: reset-both                       │
│ C2: reset-both                             │
│                                            │
│ Inline ML: ✓ Enabled                       │
└────────────────────────────────────────────┘
```

```
Objects > Security Profiles > URL Filtering
┌────────────────────────────────────────────┐
│ Name: URL-Strict-VPN                       │
│                                            │
│ Actions (VPN doit avoir accès complet):    │
│ block: malware, phishing, C2               │
│ alert: gambling, adult, hacking            │
│ allow: business, IT, productivity          │
│                                            │
│ Safe Search: ✓ Enabled                     │
│ HTTP Header Logging: ✓ Enabled             │
└────────────────────────────────────────────┘
```

```
Objects > Security Profiles > WildFire Analysis
┌────────────────────────────────────────────┐
│ Name: WF-Analysis-VPN                      │
│                                            │
│ Rules:                                     │
│ Application: any                           │
│ File Type: pe/apk/pdf/ms-office/jar/flash │
│ Direction: both                            │
│ Analysis: public-cloud                     │
│                                            │
│ Schedule:                                  │
│ Forward files every 5 minutes              │
└────────────────────────────────────────────┘
```

**Étape 4.2 - Grouper dans un Security Profile Group**

```
Objects > Security Profile Groups
┌────────────────────────────────────┐
│ Name: SPG-Strict-VPN               │
│                                    │
│ Antivirus: AV-Strict-VPN           │
│ Anti-Spyware: AS-Strict-VPN        │
│ Vulnerability: VP-Strict-VPN       │
│ URL Filtering: URL-Strict-VPN      │
│ WildFire: WF-Analysis-VPN          │
│                                    │
│ File Blocking: (none - optionnel)  │
│ Data Filtering: (none - optionnel) │
└────────────────────────────────────┘
```

**Étape 4.3 - Créer profil Balanced (INTERNAL → Internet)**

```
Objects > Security Profile Groups
┌────────────────────────────────────┐
│ Name: SPG-Balanced-Outbound        │
│                                    │
│ Antivirus: strict                  │
│ Anti-Spyware: strict (+ DNS Sec)   │
│ Vulnerability: default             │
│ URL Filtering: default             │
│ WildFire: default                  │
└────────────────────────────────────┘
```

**Validation** : ✅ Profils visibles dans Objects > Security Profile Groups

---

#### **PHASE 5 : Refonte des règles de sécurité (2h)**

**Principe directeur** : Supprimer les règles permissives, recréer des règles explicites avec profils de sécurité.

**Étape 5.1 - Identifier les flux légitimes actuels**

Avant de supprimer les règles, analyser les logs :
```
Monitor > Logs > Traffic
Filtrer les 7 derniers jours par Hit Count > 100
```

Documenter chaque flux réellement utilisé :
- Source zone
- Destination zone  
- Applications observées
- Utilisateurs (si User-ID actif)
- Justification métier

**Étape 5.2 - Créer les nouvelles règles VPN**

**Règle #1 : VPN → AD DS (Authentification)**
```
Name: VPN-to-AD-Auth
Type: universal
┌──────────────────────────────────────────┐
│ Source                                   │
│ Zone: VPN                                │
│ Address: any                             │
│ User: any                                │
│                                          │
│ Destination                              │
│ Zone: SERVERS                            │
│ Address: 10.1.10.10 (DC01)               │
│                                          │
│ Applications                             │
│ dns, kerberos, ldap, ms-ds-smb,          │
│ ms-netlogon, msrpc-base                  │
│                                          │
│ Service: application-default             │
│                                          │
│ Actions                                  │
│ Action: Allow                            │
│ Profile: SPG-Strict-VPN                  │
│ Log: Log at Session End                  │
│ Log Forwarding: Rsyslog-Central          │
└──────────────────────────────────────────┘
```

**Règle #2 : VPN → AD RDP (Administration)**
```
Name: VPN-to-AD-RDP
Type: universal
┌──────────────────────────────────────────┐
│ Source                                   │
│ Zone: VPN                                │
│ User: [protolab\GRP_ADM_ALL]             │
│      [protolab\GRP_ADM_SYS]              │
│                                          │
│ Destination                              │
│ Zone: SERVERS                            │
│ Address: 10.1.10.10 (DC01)               │
│                                          │
│ Applications: ms-rdp                     │
│                                          │
│ Actions                                  │
│ Action: Allow                            │
│ Profile: SPG-Strict-VPN                  │
│ Log: Log at Session Start + End          │
└──────────────────────────────────────────┘
```

**Règle #3 : VPN → INFRA (Management)**
```
Name: VPN-to-INFRA-Management
Type: universal
┌──────────────────────────────────────────┐
│ Source                                   │
│ Zone: VPN                                │
│ User: [protolab\GRP_ADM_ALL]             │
│                                          │
│ Destination                              │
│ Zone: INFRA                              │
│ Address: 10.1.40.0/24                    │
│                                          │
│ Applications: ssh, web-browsing, ssl,    │
│              ping                        │
│                                          │
│ Actions                                  │
│ Action: Allow                            │
│ Profile: SPG-Strict-VPN                  │
│ Log: Log at Session End                  │
└──────────────────────────────────────────┘
```

**Règle #4 : VPN → SERVERS (Autres serveurs)**
```
Name: VPN-to-SERVERS-General
Type: universal
┌──────────────────────────────────────────┐
│ Source                                   │
│ Zone: VPN                                │
│ User: any                                │
│                                          │
│ Destination                              │
│ Zone: SERVERS                            │
│ Address: 10.1.10.0/24                    │
│                                          │
│ Applications: ssh, web-browsing, ssl,    │
│              ping, dns                   │
│                                          │
│ Actions                                  │
│ Action: Allow                            │
│ Profile: SPG-Strict-VPN                  │
│ Log: Log at Session End                  │
└──────────────────────────────────────────┘
```

**Étape 5.3 - Restreindre les règles OUTSIDE → SERVERS**

**Nouvelle règle OUTSIDE-LAN-to-AD (remplacement des règles #5-12)**
```
Name: LAN-to-AD-Auth
Type: universal
┌──────────────────────────────────────────┐
│ Source                                   │
│ Zone: OUTSIDE                            │
│ Address: 192.168.1.70/32 (SKYNET)        │
│          192.168.1.x/32 (SMAPORTABLE)    │
│ User: any                                │
│                                          │
│ Destination                              │
│ Zone: SERVERS                            │
│ Address: 10.1.10.10 (DC01)               │
│                                          │
│ Applications: dns, kerberos, ldap,       │
│              ms-ds-smb, ms-rdp           │
│                                          │
│ Actions                                  │
│ Action: Allow                            │
│ Profile: SPG-Balanced-Outbound           │
│ Log: Log at Session End                  │
│                                          │
│ Comment: Accès AD depuis laptops admin   │
│          LAN uniquement - PAS INTERNET   │
└──────────────────────────────────────────┘
```

**Étape 5.4 - Conserver les règles légitimes avec profils**

**Règle CLIENTS → Internet (modifier #1)**
```
Name: CLIENTS-to-Internet
Source Zone: CLIENTS
Destination Zone: OUTSIDE
Applications: dns, ssl, web-browsing, http
Action: Allow
Profile: SPG-Balanced-Outbound  ← AJOUTER
Log: Log at Session End
```

**Règle SERVERS → Internet (modifier #16)**
```
Name: SERVERS-to-Internet
Source Zone: SERVERS
Destination Zone: OUTSIDE
Applications: dns, http, https, ntp, ssl, web-browsing
Action: Allow
Profile: SPG-Balanced-Outbound  ← AJOUTER
Log: Log at Session End
```

**Règle INFRA → Internet (modifier #19)**
```
Name: INFRA-to-Internet
Source Zone: INFRA
Destination Zone: OUTSIDE
Applications: dns, http, https, ntp, ssl
Action: Allow
Profile: SPG-Balanced-Outbound  ← AJOUTER
Log: Log at Session End
```

**Étape 5.5 - SUPPRIMER les règles dangereuses**

**À SUPPRIMER** (après validation des nouvelles règles) :
- ✘ Règle #7 : TEMP-ALLOW-NBNS-to-DC01 (NetBIOS obsolète)
- ✘ Règle #13 : TEMP-UPDATE-SERVERS (règle temporaire)
- ✘ Règle #22 : ALLOW-INTRAZONE-OUTSIDE (trop permissif)
- ✘ Règle #24 : **intrazone-default** (CRITIQUE)
- ✘ Règle #25 : **interzone-default** (CRITIQUE)

**Étape 5.6 - Créer la règle DENY-ALL finale**

```
Name: DENY-ALL-LOG
Type: universal
┌──────────────────────────────────────────┐
│ Source                                   │
│ Zone: any                                │
│ Address: any                             │
│ User: any                                │
│                                          │
│ Destination                              │
│ Zone: any                                │
│ Address: any                             │
│                                          │
│ Applications: any                        │
│ Service: any                             │
│                                          │
│ Actions                                  │
│ Action: Deny                             │
│ Log: Log at Session Start                │
│ Log Forwarding: Rsyslog-Central          │
│                                          │
│ Comment: Default Deny - All blocked      │
│          traffic logged for audit        │
└──────────────────────────────────────────┘

Position: DERNIÈRE RÈGLE (bottom)
```

**Étape 5.7 - Ordre final des règles**

```
Priority  Name                          Zones           Action
────────────────────────────────────────────────────────────
1         VPN-to-AD-Auth                VPN → SERVERS   Allow
2         VPN-to-AD-RDP                 VPN → SERVERS   Allow
3         VPN-to-INFRA-Management       VPN → INFRA     Allow
4         VPN-to-SERVERS-General        VPN → SERVERS   Allow
5         LAN-to-AD-Auth                OUTSIDE → SERVERS  Allow
6         CLIENTS-to-Internet           CLIENTS → OUTSIDE  Allow
7         SERVERS-to-Internet           SERVERS → OUTSIDE  Allow
8         INFRA-to-Internet             INFRA → OUTSIDE    Allow
9         ALLOW-OUTSIDE-to-INFRA        OUTSIDE → INFRA    Allow (syslog PA)
10        ALLOW-INFRA-TO-SERVERS        INFRA → SERVERS    Allow (DNS/NTP)
11        (autres règles légitimes conservées)
...
LAST      DENY-ALL-LOG                  ANY → ANY       Deny
```

**Validation** : 
```bash
# Vérifier l'ordre
show running security-policy

# Simuler une connexion
test security-policy-match from VPN to SERVERS \
  source 10.1.50.2 destination 10.1.10.10 \
  protocol 6 destination-port 389

# Résultat attendu : "VPN-to-AD-Auth" (allow)
```

---

#### **PHASE 6 : Configuration NAT pour exposition Internet (1h)**

**Contexte** : Votre box Orange (192.168.1.1) doit forwarder les ports GlobalProtect vers le PA-VM.

**Étape 6.1 - Configurer Destination NAT (DNAT) sur PA-VM**

**DNAT #1 : GlobalProtect Portal (HTTPS)**
```
Policies > NAT > Add
┌────────────────────────────────────────────┐
│ Name: DNAT-GP-Portal-HTTPS                 │
│                                            │
│ Original Packet                            │
│ Source Zone: OUTSIDE                       │
│ Destination Zone: OUTSIDE                  │
│ Destination Interface: ethernet1/1         │
│ Source Address: any                        │
│ Destination Address: 192.168.1.254         │
│ Service: service-https (443/TCP)           │
│                                            │
│ Translated Packet                          │
│ Translation Type: static-ip                │
│ Translated Address: 192.168.1.254          │
│ Port: 443                                  │
│                                            │
│ Comment: GlobalProtect Portal HTTPS        │
└────────────────────────────────────────────┘
```

**DNAT #2 : GlobalProtect Gateway (UDP 4501)**
```
Policies > NAT > Add
┌────────────────────────────────────────────┐
│ Name: DNAT-GP-Gateway-ESP                  │
│                                            │
│ Original Packet                            │
│ Source Zone: OUTSIDE                       │
│ Destination Zone: OUTSIDE                  │
│ Destination Interface: ethernet1/1         │
│ Source Address: any                        │
│ Destination Address: 192.168.1.254         │
│ Service: service-ike-nat-t (4501/UDP)      │
│                                            │
│ Translated Packet                          │
│ Translation Type: static-ip                │
│ Translated Address: 192.168.1.254          │
│ Port: 4501                                 │
│                                            │
│ Comment: GlobalProtect Gateway ESP over UDP│
└────────────────────────────────────────────┘
```

**Étape 6.2 - Créer les règles de sécurité pour GlobalProtect entrant**

**Règle : Autoriser GlobalProtect depuis Internet**
```
Name: Internet-to-GP-Portal
Type: universal
┌──────────────────────────────────────────┐
│ Source                                   │
│ Zone: OUTSIDE                            │
│ Address: any                             │
│                                          │
│ Destination                              │
│ Zone: OUTSIDE                            │
│ Address: 192.168.1.254                   │
│                                          │
│ Applications: ssl                        │
│ Service: service-https (443)             │
│         service-ike-nat-t (4501)         │
│                                          │
│ Actions                                  │
│ Action: Allow                            │
│ Profile: (none - GP gère)                │
│ Log: Log at Session Start                │
│                                          │
│ Comment: Allow GlobalProtect SSL VPN     │
│          from Internet (post port-fwd)   │
└──────────────────────────────────────────┘

Position: AVANT les règles VPN-to-*
```

**Étape 6.3 - Configuration sur la Box Orange**

**Via interface Livebox (http://192.168.1.1)** :
```
Advanced > NAT/PAT > Port Forwarding
┌────────────────────────────────────────┐
│ Rule 1                                 │
│ Name: GlobalProtect-HTTPS              │
│ External Port: 443                     │
│ Internal IP: 192.168.1.254             │
│ Internal Port: 443                     │
│ Protocol: TCP                          │
│ Status: Enabled                        │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Rule 2                                 │
│ Name: GlobalProtect-ESP                │
│ External Port: 4501                    │
│ Internal IP: 192.168.1.254             │
│ Internal Port: 4501                    │
│ Protocol: UDP                          │
│ Status: Enabled                        │
└────────────────────────────────────────┘
```

**⚠️ ATTENTION** : Avant d'activer ces règles sur la box, VALIDER l'étape suivante (tests internes).

**Étape 6.4 - Mettre à jour GlobalProtect Portal/Gateway avec IP publique**

**Trouver votre IP publique** :
```bash
curl ifconfig.me
# Exemple : 90.123.45.67
```

**Mettre à jour Portal** :
```
Network > GlobalProtect > Portals > GP-Portal
┌────────────────────────────────────────┐
│ External Gateway Config                │
│ Address: 90.123.45.67 (IP publique)    │
│         OU protolab.dyndns.org (FQDN)  │
│                                        │
│ Priority: 1                            │
└────────────────────────────────────────┘
```

**Mettre à jour Gateway** :
```
Network > GlobalProtect > Gateways > GP-Gateway-N
┌────────────────────────────────────────┐
│ External Address                       │
│ Address: 90.123.45.67                  │
└────────────────────────────────────────┘
```

**Recommandation DNS dynamique** :
Pour éviter les changements d'IP, configurer un FQDN (DynDNS, No-IP) :
```
Livebox > Advanced > DynDNS
Provider: No-IP / DynDNS
Hostname: protolab.dyndns.org
Username: [votre compte]
```

**Validation** : ✅ Config sauvegardée, MAIS NE PAS ACTIVER SUR LA BOX AVANT TESTS

---

#### **PHASE 7 : Configuration finale GlobalProtect (30 min)**

**Étape 7.1 - Basculer l'authentification Portal vers AD**

```
Network > GlobalProtect > Portals > GP-Portal > Authentication
┌────────────────────────────────────────┐
│ Authentication Profile: GP-AD-Auth     │
│ (créé en Phase 3)                      │
│                                        │
│ Certificate Profile: None              │
│ Client Cert: Not Required              │
│                                        │
│ Username Modifier: %USERINPUT%         │
│ User Domain: protolab.local            │
└────────────────────────────────────────┘
```

**Étape 7.2 - Vérifier les Access Routes (Split-Tunnel)**

```
Network > GlobalProtect > Gateways > GP-Gateway-N > Agent > Tunnel Settings
┌────────────────────────────────────────┐
│ Tunnel Mode: Split Tunnel              │
│                                        │
│ Access Routes (Include):               │
│ - 10.1.10.0/24 (SERVERS)               │
│ - 10.1.20.0/24 (CLIENTS)               │
│ - 10.1.30.0/24 (DMZ)                   │
│ - 10.1.40.0/24 (INFRA)                 │
│                                        │
│ Exclude Routes: (aucune)               │
│                                        │
│ No Direct Access to Local Network: ✗   │
└────────────────────────────────────────┘
```

**Étape 7.3 - Configurer le logging détaillé**

```
Device > Log Settings > System
┌────────────────────────────────────────┐
│ GlobalProtect:                         │
│ Severity: Informational                │
│ Log Forwarding: Rsyslog-Central        │
│                                        │
│ Include these events:                  │
│ ✓ User login/logout                    │
│ ✓ Tunnel up/down                       │
│ ✓ Configuration changes                │
│ ✓ Gateway selection                    │
└────────────────────────────────────────┘
```

**Validation** : ✅ Config GlobalProtect complète

---

## 3. TESTS ET VALIDATION AVANT CONNEXION INTERNET

### 3.1 Tests Phase 1 - Validation interne (LAN uniquement)

**⚠️ NE PAS ACTIVER LE PORT FORWARDING SUR LA BOX AVANT VALIDATION COMPLÈTE**

#### **Test 3.1.1 - Connexion VPN depuis le LAN**

**Depuis SKYNET (192.168.1.70)** :

1. **Lancer GlobalProtect Agent**
   ```
   Portal: 192.168.1.254
   Username: jdupont@protolab.local
   Password: [mot de passe AD]
   ```

2. **Vérifier la connexion**
   ```
   État attendu : Connected
   IP attribuée : 10.1.50.x
   DNS : 10.1.10.10
   ```

3. **Valider les routes**
   ```powershell
   # PowerShell sur SKYNET
   Get-NetRoute | Where-Object {$_.NextHop -like "10.1.*"}
   
   # Attendu :
   # 10.1.10.0/24 via 10.1.50.1
   # 10.1.20.0/24 via 10.1.50.1
   # 10.1.40.0/24 via 10.1.50.1
   ```

4. **Vérifier Internet local**
   ```powershell
   tracert 8.8.8.8
   
   # Première ligne doit être :
   # 1    <1 ms    192.168.1.1  (Box Orange - PAS le PA)
   ```

**✅ SUCCÈS** : VPN connecté, split-tunnel fonctionnel, Internet en direct.

---

#### **Test 3.1.2 - Accès AD depuis VPN**

**Depuis SKYNET (connecté VPN)** :

1. **Test DNS**
   ```powershell
   nslookup protolab.local 10.1.10.10
   # Attendu : Résolution OK
   
   nslookup DC01.protolab.local
   # Attendu : 10.1.10.10
   ```

2. **Test Kerberos**
   ```cmd
   klist purge
   klist get krbtgt/protolab.local
   # Attendu : Ticket obtenu
   ```

3. **Test RDP**
   ```
   mstsc /v:DC01.protolab.local
   Username: protolab\jdupont
   Password: [mot de passe AD]
   ```

**✅ SUCCÈS** : Authentification AD via VPN fonctionnelle.

---

#### **Test 3.1.3 - User-ID Mapping**

**Sur PA-VM (CLI ou GUI)** :

```bash
# CLI
show user ip-user-mapping all

# Attendu :
# IP            User                    From      IdleTimeout  MaxTimeout
# 10.1.50.2     protolab\jdupont       GP-GW-N   3600         86400

# GUI
Monitor > User-ID > IP Address to Username Mapping
```

**✅ SUCCÈS** : User-ID identifie correctement les utilisateurs VPN.

---

#### **Test 3.1.4 - Vérification des logs**

**Sur PA-VM** :

1. **Logs de connexion GP**
   ```
   Monitor > Logs > System
   Filtrer : subtype eq globalprotect
   
   Vérifier :
   - "User jdupont login successful"
   - "Tunnel established for user jdupont"
   - "Configuration applied: GP-Agent-Config"
   ```

2. **Logs de trafic**
   ```
   Monitor > Logs > Traffic
   Filtrer : addr.src in 10.1.50.0/24
   
   Vérifier :
   - Rule: VPN-to-AD-Auth (dns, kerberos, ldap)
   - Rule: VPN-to-AD-RDP (ms-rdp vers 10.1.10.10)
   - Security Profile: SPG-Strict-VPN appliqué
   ```

3. **Logs Threat Prevention**
   ```
   Monitor > Logs > Threat
   Filtrer : addr.src in 10.1.50.0/24
   
   Vérifier :
   - DNS Security : requêtes malveillantes bloquées (si test)
   - Antivirus : fichiers scannés
   ```

**✅ SUCCÈS** : Tous les événements loggés et transférés vers Victoria Logs.

---

#### **Test 3.1.5 - Vérification VictoriaLogs**

**Depuis CT 201 (10.1.40.25)** :

```bash
# Requête LogsQL : logs GlobalProtect
curl -X GET 'http://10.1.40.25:9428/select/logsql/query' \
  --data-urlencode 'query=log_type:paloalto | filter pa_type="TRAFFIC" | filter pa_src_ip="10.1.50.*" | limit 10'

# Attendu : Logs de trafic VPN → SERVERS
```

**✅ SUCCÈS** : Logs centralisés et requêtables.

---

### 3.2 Tests Phase 2 - Validation règles de sécurité

#### **Test 3.2.1 - Validation DENY-ALL**

**Test de blocage inter-zones non autorisées** :

**Depuis SKYNET (VPN 10.1.50.2)** :
```powershell
# Tenter accès vers DMZ (non autorisé)
Test-NetConnection -ComputerName 10.1.30.10 -Port 80

# Attendu : ÉCHEC (timeout)
```

**Vérification log PA-VM** :
```
Monitor > Logs > Traffic
Filtrer : ( addr.src in 10.1.50.0/24 ) and ( addr.dst in 10.1.30.0/24 )

# Attendu :
# Rule: DENY-ALL-LOG
# Action: deny
# Reason: Policy deny
```

**✅ SUCCÈS** : Trafic non autorisé bloqué et loggé.

---

#### **Test 3.2.2 - Validation profils de sécurité**

**Test Antivirus** :

1. Créer un fichier test EICAR :
   ```powershell
   # Depuis SKYNET (VPN)
   $eicar = 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*'
   $eicar | Out-File -FilePath \\DC01.protolab.local\C$\eicar.txt
   ```

2. Vérifier les logs Threat :
   ```
   Monitor > Logs > Threat
   Threat Name: "EICAR Test File"
   Action: reset-both (blocked)
   Profile: SPG-Strict-VPN
   ```

**Test URL Filtering** :

```powershell
# Depuis SKYNET (VPN)
curl http://malware-traffic-analysis.net

# Attendu : Blocked (catégorie "malware")
```

**✅ SUCCÈS** : Profils de sécurité actifs et opérationnels.

---

#### **Test 3.2.3 - Validation DNS Security**

**Test domaine malveillant** :

```powershell
# Depuis SKYNET (VPN)
nslookup malicious-site-test.com

# Attendu : Sinkhole IP (172.16.99.99)
```

**Vérification log PA-VM** :
```
Monitor > Logs > Threat
Threat Category: dns-malware
Action: sinkhole
DNS Query: malicious-site-test.com
```

**✅ SUCCÈS** : DNS Security bloque les domaines malveillants.

---

### 3.3 Tests Phase 3 - Simulation attaque (Red Team)

**⚠️ Tests avancés - optionnel mais recommandé**

#### **Test 3.3.1 - Tentative de pivotement**

**Scénario** : Un attaquant compromet une machine VPN, tente de scanner le réseau.

```bash
# Depuis SKYNET (VPN), simuler scan nmap
nmap -sS -p 1-1000 10.1.10.0/24

# Attendu :
# - Seuls les ports autorisés (53, 88, 389, 445, 3389) répondent
# - Autres ports : filtered (bloqués par PA)
# - Logs IPS : "Port scan detected"
```

**Vérification PA-VM** :
```
Monitor > Logs > Threat
Threat Name: "Port Scan"
Severity: medium
Action: alert (ou block-ip si configuré)
```

**✅ SUCCÈS** : IPS détecte et alerte sur le scan.

---

#### **Test 3.3.2 - Tentative d'exfiltration**

**Scénario** : Exfiltration de données via DNS tunneling.

```powershell
# Depuis SKYNET (VPN)
nslookup exfiltration-data-base64.malicious-c2.com
```

**Attendu** :
```
Monitor > Logs > Threat
Threat Category: dns-c2
Action: block
DNS Query: exfiltration-data-base64.malicious-c2.com
```

**✅ SUCCÈS** : DNS Security bloque C2 DNS.

---

### 3.4 Tests Phase 4 - Performance et stabilité

#### **Test 3.4.1 - Charge réseau**

**Transfert de fichier volumineux** :

```powershell
# Depuis SKYNET (VPN) → DC01
Copy-Item -Path "C:\largefile.zip" -Destination "\\DC01\C$\temp\"

# Mesurer :
# - Débit (attendu : ~50 Mbps en VM)
# - Latence (ping DC01 < 10ms)
# - CPU PA-VM (< 80% sur 1 core)
```

**Vérification PA-VM** :
```bash
show system resources

# Attendu :
# CPU < 80% avg
# Memory < 60% used
# Session count < 5000
```

**✅ SUCCÈS** : Performance acceptable sous charge.

---

#### **Test 3.4.2 - Reconnexion automatique**

**Scénario** : Perte réseau temporaire.

```powershell
# Déconnecter WiFi SKYNET pendant 10 secondes
# Reconnecter

# Vérifier :
# - GlobalProtect reconnecte automatiquement
# - Sessions actives (RDP) ne sont pas perdues (si Always-On configuré)
```

**✅ SUCCÈS** : Résilience VPN fonctionnelle.

---

### 3.5 Checklist finale avant ouverture Internet

**Avant d'activer le port forwarding sur la box Orange, valider** :

| Test | Statut | Notes |
|------|--------|-------|
| ✅ Connexion VPN depuis LAN | ☐ | IP 10.1.50.x attribuée |
| ✅ Authentification AD via VPN | ☐ | User-ID mapping OK |
| ✅ Split-tunnel fonctionnel | ☐ | Internet via box, internal via VPN |
| ✅ Accès AD depuis VPN (DNS/Kerberos/RDP) | ☐ | |
| ✅ Profils de sécurité actifs | ☐ | AV, IPS, URL, DNS Security |
| ✅ DENY-ALL bloque trafic non autorisé | ☐ | Logs confirm deny |
| ✅ User-ID identifie utilisateurs | ☐ | show user ip-user-mapping |
| ✅ Logs centralisés (Victoria Logs) | ☐ | Requêtes LogsQL OK |
| ✅ Tests anti-malware (EICAR) | ☐ | Blocked by AV |
| ✅ Tests DNS Security | ☐ | Malicious domains sinkholed |
| ✅ Performance acceptable | ☐ | CPU < 80%, latence < 10ms |
| ✅ Règles default ANY-ANY supprimées | ☐ | #24, #25 deleted |
| ✅ Backup configuration sauvegardé | ☐ | Sur PC + Proxmox Backup |
| ✅ Documentation à jour | ☐ | Règles commentées |
| ✅ Plan de rollback préparé | ☐ | Procédure restauration config |

**🔴 SI UN SEUL TEST ÉCHOUE : NE PAS OUVRIR INTERNET**

---

## 4. SYNTHÈSE ET ROADMAP

### 4.1 Résumé des risques éliminés

| Risque initial | Gravité | Mitigation appliquée |
|----------------|---------|---------------------|
| Règles ANY-ANY permettant tout | 🔴 Critique | Suppression + DENY-ALL finale |
| Exposition AD directe depuis Internet | 🔴 Critique | Zone VPN dédiée + restriction sources |
| Absence profils de sécurité | 🟠 Majeur | SPG-Strict-VPN et SPG-Balanced appliqués |
| Licences sous-exploitées | 🟠 Majeur | DNS Security, WildFire, User-ID activés |
| Logs non centralisés | 🟡 Mineur | Forwarding vers Victoria Logs validé |

---

### 4.2 Roadmap d'ouverture Internet

#### **J+0 : Préparation (aujourd'hui)**
- [x] Analyse de sécurité complète
- [ ] Lecture et validation du rapport
- [ ] Planification fenêtre de maintenance (soir/weekend)

#### **J+1 : Implémentation (4-6h)**
- [ ] Phase 1 : Backup et création zone VPN (1h)
- [ ] Phase 2 : Configuration User-ID (45 min)
- [ ] Phase 3 : Création profils de sécurité (1h)
- [ ] Phase 4 : Refonte règles de sécurité (2h)
- [ ] Phase 5 : Configuration NAT (1h)

#### **J+2 : Tests internes (2-3h)**
- [ ] Tests Phase 1 : Connexion VPN LAN
- [ ] Tests Phase 2 : Validation règles
- [ ] Tests Phase 3 : Simulation attaques (optionnel)
- [ ] Tests Phase 4 : Performance

#### **J+3 : Ouverture contrôlée**
- [ ] Activer port forwarding sur box (443, 4501)
- [ ] Test connexion VPN depuis 4G (smartphone)
- [ ] Monitoring actif pendant 24h
- [ ] Validation logs (pas d'alertes anormales)

#### **J+7 : Stabilisation**
- [ ] Analyse logs semaine
- [ ] Ajustement profils sécurité (faux positifs)
- [ ] Documentation mise à jour
- [ ] Formation utilisateurs finaux

---

### 4.3 Plan de rollback (si problème)

**En cas d'incident après ouverture Internet** :

1. **Immédiat (< 5 min)** :
   - Désactiver port forwarding sur box Orange
   - Déconnecter tous les clients VPN

2. **Court terme (< 30 min)** :
   - Restaurer backup configuration PA-VM
   - Analyser logs incidents (Monitor > Logs > Threat)

3. **Moyen terme (< 2h)** :
   - Identifier la règle/profil problématique
   - Appliquer correctif spécifique
   - Retester en LAN avant réouverture

**Commande restauration backup** :
```bash
# CLI PA-VM
load config from Pre-Internet-Opening-Backup-20251215.xml
commit
```

---

### 4.4 Monitoring post-ouverture (30 premiers jours)

**Dashboards à surveiller quotidiennement** :

1. **ACC (Application Command Center)** :
   - Network Activity > Security Policy
   - Top applications (s'assurer que seuls apps légitimes)
   - Top threats (doit rester faible)

2. **GlobalProtect** :
   - Monitor > GlobalProtect > Summary
   - Concurrent users (capacité : 250 sessions PA-VM-50)
   - Failed logins (détecter force brute)

3. **Threat Logs** :
   ```
   Monitor > Logs > Threat
   Severity: critical, high
   Alertes attendues : < 5 par jour (faux positifs possibles)
   ```

4. **Victoria Logs (Grafana)** :
   - Dashboard PA-VM : TRAFFIC, THREAT par zone
   - Dashboard AD : Authentications VPN réussies/échouées
   - Dashboard réseau : Bande passante VPN

**Seuils d'alerte** :

| Métrique | Seuil | Action |
|----------|-------|--------|
| Failed logins > 10/hour | 🟡 Warning | Vérifier User-ID, potentiel force brute |
| Threats critical > 5/day | 🟠 Alert | Investiguer IPs sources |
| CPU PA-VM > 85% sustained | 🟠 Alert | Évaluer upgrade vers VM-100 |
| Session count > 200 | 🟡 Warning | Approche limite licence |

---

### 4.5 Améliorations futures (Phase 2 - Post-production)

**Court terme (1-3 mois)** :

1. **SSL/TLS Decryption** :
   - Inspection HTTPS sortant (SERVERS/INFRA → Internet)
   - CA interne déployée sur postes
   - Exclusions : banques, santé (privacy)

2. **Zoning avancé** :
   - Sous-zone SERVERS-CRITICAL (DC01 isolé)
   - Sous-zone INFRA-LOGS (stack logs isolé)
   - Micro-segmentation avec tags dynamiques

3. **Automation** :
   - Scripts Panorama (si multi-sites futurs)
   - API REST pour ajout automatique de règles
   - Intégration SIEM (Wazuh, Elastic)

**Moyen terme (3-6 mois)** :

4. **Certificate-based Authentication** :
   - Certificats clients pour admins (2FA matérielle)
   - Intégration Windows Hello for Business

5. **Geo-blocking** :
   - Bloquer connexions VPN hors France (sauf voyages)
   - EDL (External Dynamic Lists) de pays

6. **Advanced Analytics** :
   - AutoFocus integration (threat intelligence)
   - Correlation logs PA + AD + Proxmox

**Long terme (6-12 mois)** :

7. **HA (High Availability)** :
   - Déploiement second PA-VM en HA Active/Passive
   - Synchronisation configs + sessions

8. **Conformité** :
   - Audit ANSSI "Recommandations sécurité périmètre"
   - Certification ISO 27001 (si applicable)

---

### 4.6 Budget estimé

| Poste | Coût actuel | Commentaire |
|-------|-------------|-------------|
| **Licences PA-VM** | ~500€/an | Bundle Enterprise (renewal 31/01/2026) |
| **IP publique statique** | ~5€/mois | Optionnel (DynDNS gratuit possible) |
| **Backup externe** | 0€ | Proxmox Backup inclus |
| **Formation** | 0€ | Auto-formation (docs PA + ANSSI) |
| **Audit externe** (optionnel) | ~2000€ | Pentest GlobalProtect par professionnel |

**Total estimé annuel : 560€** (licences uniquement)

---

### 4.7 Contacts et ressources

**Documentation officielle Palo Alto** :
- Palo Alto Networks Technical Documentation : https://docs.paloaltonetworks.com
- GlobalProtect Admin Guide : https://docs.paloaltonetworks.com/globalprotect
- Best Practice Internet Gateway : https://docs.paloaltonetworks.com/best-practices

**Sécurité ANSSI** :
- Recommandations de sécurité relatives aux architectures réseau (2022)
- Guide de configuration sécurisée d'un pare-feu
- https://www.ssi.gouv.fr/entreprise/guide/recommandations-de-securite-relatives-aux-reseaux/

**Support Palo Alto** :
- Support Portal : https://support.paloaltonetworks.com
- TAC (Technical Assistance Center) : 24/7 (Premium Support activé)
- Community : https://live.paloaltonetworks.com

**Forums techniques** :
- Reddit r/paloaltonetworks
- Palo Alto Networks LIVEcommunity

---

## 5. CONCLUSION

### État actuel vs. État cible

**AVANT (aujourd'hui)** :
- ❌ Règles ANY-ANY permettant tout (58k hits)
- ❌ AD exposé depuis OUTSIDE (73k hits)
- ❌ Aucun profil de sécurité sur VPN
- ❌ Licences payées mais non exploitées
- ⚠️ VPN fonctionnel en LAN uniquement

**APRÈS (post-implémentation)** :
- ✅ Principe du moindre privilège appliqué
- ✅ Zone VPN dédiée avec profils stricts
- ✅ User-ID + DNS Security + WildFire actifs
- ✅ Règle DENY-ALL finale avec logging
- ✅ VPN sécurisé ouvert vers Internet

---

### Validation finale

**Avant d'ouvrir le port forwarding sur la box** :

1. ✅ Toutes les phases d'implémentation terminées
2. ✅ Tous les tests internes (3.1 à 3.4) validés
3. ✅ Checklist finale (3.5) cochée à 100%
4. ✅ Backup configuration sauvegardé
5. ✅ Plan de rollback documenté et testé

**Une fois ouvert** :

- 👁️ Monitoring actif 24/7 pendant 48h
- 📊 Dashboards ACC consultés quotidiennement
- 📧 Alertes configurées (email + logs Victoria)
- 📝 Incident log préparé

---

### Message de sécurité

**L'ouverture d'un VPN vers Internet est une opération sensible**. Ce rapport vous fournit une feuille de route complète basée sur les meilleures pratiques Palo Alto Networks et les recommandations de l'ANSSI.

**NE JAMAIS** :
- ❌ Sauter des étapes de validation
- ❌ Ouvrir Internet sans tests internes complets
- ❌ Ignorer les alertes de sécurité
- ❌ Désactiver les profils de sécurité pour "gagner en performance"

**TOUJOURS** :
- ✅ Appliquer le principe du moindre privilège
- ✅ Logger et monitorer tout le trafic VPN
- ✅ Maintenir les licences et signatures à jour
- ✅ Documenter chaque changement

---

**Prêt pour la discussion étape par étape ?**

Nous allons maintenant reprendre chaque phase ensemble, bloc par bloc, pour que vous puissiez implémenter ces recommandations de manière contrôlée et sécurisée.

**Prochaine étape : Quelle phase souhaitez-vous commencer en premier ?**

---

**Fin du rapport**  
**Version 1.0 - 15 décembre 2025**  
**Protolab Infrastructure - Rapport d'Analyse de Sécurité**
