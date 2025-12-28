---
title: "Plan de Durcissement Sécurité - Protolab PA-VM"
description: "Guide complet de sécurisation du firewall Palo Alto PA-VM avant ouverture GlobalProtect sur Internet : suppression règles permissives, activation licences Enterprise, profils de sécurité avancés"
category: paloalto
date: 2025-12-16
tags:
  - paloalto
  - security
  - hardening
  - threat-prevention
  - wildfire
  - dns-security
author: Adrien Mercadier
difficulty: advanced
featured: true
---

# Plan de Durcissement Sécurité - Protolab PA-VM

**Infrastructure** : Protolab.local  
**Firewall** : Palo Alto PA-VM-50 (PAN-OS 11.2.7-h4)  
**Statut** : PRÉ-PRODUCTION - ACTION REQUISE

## Contexte et Objectif

### Objectif

Sécuriser l'infrastructure Protolab avant d'exposer le VPN GlobalProtect sur Internet en :
1. Supprimant les règles permissives temporaires (ANY-ANY)
2. Implémentant le principe du moindre privilège
3. Activant les fonctionnalités de sécurité des licences Enterprise
4. Créant une règle DENY-ALL finale avec logging

### Infrastructure cible

```
INTERNET
    │
    │ Port Forward (Box Orange 192.168.1.1)
    │ 443/TCP + 4501/UDP → 192.168.1.254
    │
    ▼
┌─────────────────────────────────────────────────┐
│            PA-VM-50 (PAN-OS 11.2.7-h4)          │
│                                                 │
│  Management: 192.168.1.37                       │
│  OUTSIDE: 192.168.1.254 (eth1/1)               │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  GlobalProtect Portal + Gateway         │   │
│  │  tunnel.10 → Zone VPN (10.1.50.0/24)    │   │
│  └─────────────────────────────────────────┘   │
│                    │                           │
│         Security Policies (Strict)             │
│                    │                           │
│  ┌─────────┬───────┴───┬──────────┬─────────┐ │
│  │ SERVERS │  CLIENTS  │   DMZ    │  INFRA  │ │
│  │ 10.1.10 │  10.1.20  │  10.1.30 │ 10.1.40 │ │
│  │ eth1/2  │  eth1/3   │  eth1/4  │  eth1/5 │ │
│  └────┬────┴───────────┴──────────┴────┬────┘ │
└───────┼────────────────────────────────┼──────┘
        │                                │
        ▼                                ▼
   DC01 (10.1.10.10)          Victoria Logs (10.1.40.25)
   DNS/AD/LDAP/Kerberos       OTEL Collector (10.1.40.30)
```

## État Actuel - Analyse des Règles

### Export du 16/12/2025 - Règles critiques identifiées

| # | Règle | Source → Dest | App/Service | Hits | Risque |
|---|-------|---------------|-------------|------|--------|
| 27 | **interzone-default** | ANY → ANY | ANY/ANY | **184 502** | 🔴 CRITIQUE |
| 26 | **intrazone-default** | ANY (intrazone) | ANY/ANY | 5 730 | 🔴 CRITIQUE |
| 4 | VPN-to-INTERNAL | VPN → INFRA/SERVERS | ANY | 10 772 | 🟠 Trop permissif |
| 6 | ALLOW-AD-CLIENTS | CLIENTS → DC01 | ANY/ANY | 5 386 | 🟠 Trop permissif |
| 18 | ALLOW-SERVERS-TO-INTERNET | SERVERS → OUTSIDE | ANY | 77 956 | 🟠 Trop permissif |
| 22 | ALLOW-CLIENTS-TO-INTERNET | CLIENTS → OUTSIDE | ANY | 2 422 | 🟠 Trop permissif |
| 7 | ALLOW-AD-FULL | OUTSIDE → DC01 | AD multi-apps | 79 595 | 🟡 À restreindre |
| 9 | TEMP-ALLOW-NBNS | OUTSIDE → DC01 | NetBIOS | 9 | 🟡 À supprimer |

### Règles sans profils de sécurité (flux critiques)

| Règle | Flux | Profil actuel | Action requise |
|-------|------|---------------|----------------|
| #4 VPN-to-INTERNAL | VPN → Interne | **Aucun** | Ajouter SPG-Strict |
| #7 ALLOW-AD-FULL | LAN → DC01 | **Aucun** | Ajouter SPG-Balanced |
| #18 SERVERS-TO-INTERNET | Serveurs → Internet | **Aucun** | Ajouter SPG-Balanced |
| #24 ALLOW-INTRAZONE-OUTSIDE | OUTSIDE intrazone | **Aucun** | Supprimer |

### Licences disponibles (non exploitées)

| Licence | Statut | Configuration actuelle |
|---------|--------|------------------------|
| Threat Prevention | ✅ Active (exp. 31/01/2026) | Profils "default" basiques |
| DNS Security | ✅ Active | **NON CONFIGURÉ** |
| WildFire Analysis | ✅ Active | **NON CONFIGURÉ** |
| URL Filtering (PAN-DB) | ✅ Active | Profil "Lab" minimal |
| User-ID | ✅ Active | **NON CONFIGURÉ** |
| GlobalProtect | ✅ Active | Fonctionnel (auth locale) |

## Plan d'Action Détaillé

### Vue d'ensemble des phases

| Phase | Description | Durée | Prérequis |
|-------|-------------|-------|-----------|
| 0 | Sauvegarde et préparation | 30 min | Accès admin PA-VM |
| 1 | Création des profils de sécurité | 1h | Phase 0 |
| 2 | Configuration User-ID (optionnel) | 45 min | Compte svc-ldap sur DC01 |
| 3 | Durcissement règles VPN | 1h | Phases 1-2 |
| 4 | Durcissement règles LAN/Serveurs | 1h | Phase 3 |
| 5 | Suppression règles dangereuses | 30 min | Phase 4 validée |
| 6 | Tests et validation | 1h | Phase 5 |
| 7 | Ouverture Internet (optionnel) | 30 min | Phase 6 validée |

## Phase 0 : Sauvegarde et Préparation

### Sauvegarde configuration actuelle

**GUI : Device > Setup > Operations**
```
Export named configuration snapshot
Nom: "Pre-Hardening-Backup-20251216"
```

**CLI :**
```bash
# Connexion SSH à 192.168.1.37
> configure
# save config to Pre-Hardening-Backup-20251216.xml
# exit
> scp export configuration from Pre-Hardening-Backup-20251216.xml to user@192.168.1.70:/backup/
```

### Export des règles actuelles (référence)

**GUI : Policies > Security**
```
Export to CSV (garder comme référence)
Nom: "rules-before-hardening-20251216.csv"
```

### Vérification de l'état des services

```bash
# CLI PA-VM
> show system info
> show high-availability state
> show session info
> show running security-policy
```

## Phase 1 : Création des Profils de Sécurité

### Profil Anti-Spyware avec DNS Security

**GUI : Objects > Security Profiles > Anti-Spyware > Add**

```
┌─────────────────────────────────────────────────┐
│ Nom: AS-Strict                                  │
│                                                 │
│ RÈGLES DE BASE                                  │
│ ├─ Severity: critical → Action: reset-both      │
│ ├─ Severity: high     → Action: reset-both      │
│ ├─ Severity: medium   → Action: reset-both      │
│ ├─ Severity: low      → Action: alert           │
│ └─ Severity: info     → Action: default         │
│                                                 │
│ DNS SECURITY (onglet DNS Policies)              │
│ ├─ Enable: ✓                                    │
│ ├─ Sinkhole IPv4: 72.5.65.111                   │
│ ├─ Sinkhole IPv6: 2600:5200::1                  │
│ ├─ Action on DNS queries:                       │
│ │   ├─ Command and Control: sinkhole            │
│ │   ├─ Malware: sinkhole                        │
│ │   ├─ Phishing: sinkhole                       │
│ │   ├─ Dynamic DNS: alert                       │
│ │   ├─ Newly Registered Domains: alert          │
│ │   └─ Parked Domains: alert                    │
│ └─ Log all DNS queries: ✓                       │
│                                                 │
│ INLINE ML (Cloud Inline Analysis)               │
│ └─ Enable: ✓                                    │
└─────────────────────────────────────────────────┘
```

### Profil Antivirus avec WildFire

**GUI : Objects > Security Profiles > Antivirus > Add**

```
┌─────────────────────────────────────────────────┐
│ Nom: AV-Strict                                  │
│                                                 │
│ DECODERS                                        │
│ ├─ HTTP: reset-both                             │
│ ├─ HTTPS (si décryption): reset-both            │
│ ├─ SMB: reset-both                              │
│ ├─ IMAP: reset-both                             │
│ ├─ POP3: reset-both                             │
│ ├─ FTP: reset-both                              │
│ └─ SMTP: reset-both                             │
│                                                 │
│ WILDFIRE INLINE ML                              │
│ ├─ Enable: ✓                                    │
│ ├─ PE (Windows exe): reset-both                 │
│ ├─ APK (Android): reset-both                    │
│ ├─ PDF: reset-both                              │
│ ├─ MS Office: reset-both                        │
│ ├─ ELF (Linux): reset-both                      │
│ └─ Script: alert                                │
│                                                 │
│ WILDFIRE ACTIONS                                │
│ ├─ Malicious verdict: reset-both                │
│ ├─ Phishing verdict: reset-both                 │
│ ├─ Grayware verdict: alert                      │
│ └─ C2 verdict: reset-both                       │
└─────────────────────────────────────────────────┘
```

### Profil Vulnerability Protection

**GUI : Objects > Security Profiles > Vulnerability Protection > Add**

```
┌─────────────────────────────────────────────────┐
│ Nom: VP-Strict                                  │
│                                                 │
│ RÈGLES                                          │
│ ├─ Severity: critical                           │
│ │   Action: reset-both                          │
│ │   Packet Capture: single-packet               │
│ │   Category: any                               │
│ │                                               │
│ ├─ Severity: high                               │
│ │   Action: reset-both                          │
│ │   Packet Capture: single-packet               │
│ │                                               │
│ ├─ Severity: medium                             │
│ │   Action: alert                               │
│ │   Packet Capture: disable                     │
│ │                                               │
│ ├─ Severity: low                                │
│ │   Action: default                             │
│ │                                               │
│ └─ Severity: informational                      │
│     Action: default                             │
└─────────────────────────────────────────────────┘
```

### Profil URL Filtering

**GUI : Objects > Security Profiles > URL Filtering > Add**

```
┌─────────────────────────────────────────────────┐
│ Nom: URL-Strict                                 │
│                                                 │
│ CATÉGORIES BLOQUÉES                             │
│ ├─ Command and Control: block                   │
│ ├─ Malware Sites: block                         │
│ ├─ Phishing: block                              │
│ ├─ Hacking: block                               │
│ ├─ Adult/Mature Content: block                  │
│ ├─ Gambling: block                              │
│ ├─ High Risk: block                             │
│ └─ Weapons: alert                               │
│                                                 │
│ CATÉGORIES AUTORISÉES                           │
│ ├─ Business and Economy: allow                  │
│ ├─ Computer and Internet Info: allow            │
│ ├─ Education: allow                             │
│ ├─ News: allow                                  │
│ └─ Search Engines: allow                        │
└─────────────────────────────────────────────────┘
```

### Création Security Profile Groups

**GUI : Objects > Security Profile Groups > Add**

**SPG-Strict (VPN et flux critiques)** :
```
Nom: SPG-Strict
├─ Antivirus: AV-Strict
├─ Anti-Spyware: AS-Strict
├─ Vulnerability: VP-Strict
├─ URL Filtering: URL-Strict
└─ WildFire: default
```

**SPG-Balanced (LAN vers Internet)** :
```
Nom: SPG-Balanced
├─ Antivirus: AV-Strict
├─ Anti-Spyware: AS-Strict
├─ Vulnerability: VP-Strict
├─ URL Filtering: URL-Strict
└─ WildFire: default
```

## Phase 2 : Configuration User-ID (Optionnel)

**Important** : User-ID permet de mapper les adresses IP aux utilisateurs AD pour des règles plus granulaires.

### Prérequis

- Compte de service AD : `svc-ldap@protolab.local` avec permissions lecture AD
- Connectivité PA-VM → DC01 (10.1.10.10:389)

### Configuration LDAP Server Profile

**GUI : Device > Server Profiles > LDAP > Add**

```
Nom: DC01-LDAP
Server:
  ├─ Name: DC01
  ├─ LDAP Server: 10.1.10.10
  └─ Port: 389

Bind DN: CN=svc-ldap,CN=Users,DC=protolab,DC=local
Bind Password: [mot de passe svc-ldap]
Base DN: DC=protolab,DC=local

SSL: No
LDAP Type: active-directory
```

### Activation User-ID Agent

**GUI : Device > User Identification > User Mapping > Palo Alto Networks User-ID Agent Setup**

```
Enable User Identification: ✓
Server Monitor: DC01 (10.1.10.10)
```

## Phase 3 : Durcissement Règles VPN

### Règles VPN granulaires

**GUI : Policies > Security > Add**

**VPN-to-AD-Auth** :
```
┌─────────────────────────────────────────────────┐
│ Name: VPN-to-AD-Auth                            │
│                                                 │
│ SOURCE                                          │
│ Zone: VPN-REMOTE                                │
│ Address: any                                    │
│                                                 │
│ DESTINATION                                     │
│ Zone: SERVERS                                   │
│ Address: DC01 (10.1.10.10)                      │
│                                                 │
│ APPLICATION: ldap, kerberos, ms-ds-smb, dns     │
│                                                 │
│ SERVICE:                                        │
│ ├─ service-tcp-389 (LDAP)                       │
│ ├─ service-tcp-636 (LDAPS)                      │
│ ├─ service-tcp-88 (Kerberos)                    │
│ ├─ service-tcp-445 (SMB)                        │
│ └─ service-udp-53 (DNS)                         │
│                                                 │
│ ACTION: Allow                                   │
│ PROFILE: SPG-Strict                             │
│ LOG: Session Start + End                        │
└─────────────────────────────────────────────────┘
```

**VPN-to-RDP** :
```
┌─────────────────────────────────────────────────┐
│ Name: VPN-to-RDP                                │
│                                                 │
│ SOURCE                                          │
│ Zone: VPN-REMOTE                                │
│ Address: any                                    │
│                                                 │
│ DESTINATION                                     │
│ Zone: SERVERS                                   │
│ Address: DC01 (10.1.10.10)                      │
│                                                 │
│ APPLICATION: ms-rdp                             │
│                                                 │
│ SERVICE: service-tcp-3389                       │
│                                                 │
│ ACTION: Allow                                   │
│ PROFILE: SPG-Strict                             │
│ LOG: Session Start + End                        │
└─────────────────────────────────────────────────┘
```

**VPN-to-INFRA-Monitoring** :
```
┌─────────────────────────────────────────────────┐
│ Name: VPN-to-INFRA-Monitoring                   │
│                                                 │
│ SOURCE                                          │
│ Zone: VPN-REMOTE                                │
│ Address: any                                    │
│                                                 │
│ DESTINATION                                     │
│ Zone: INFRA                                     │
│ Address:                                        │
│   ├─ Victoria-Logs (10.1.40.25)                 │
│   ├─ OTEL-Collector (10.1.40.30)                │
│   └─ Grafana (10.1.40.26)                       │
│                                                 │
│ APPLICATION: web-browsing, ssh                  │
│                                                 │
│ SERVICE:                                        │
│ ├─ service-http                                 │
│ ├─ service-https                                │
│ └─ service-tcp-22                               │
│                                                 │
│ ACTION: Allow                                   │
│ PROFILE: SPG-Strict                             │
│ LOG: Session Start + End                        │
└─────────────────────────────────────────────────┘
```

## Phase 4 : Durcissement Règles LAN/Serveurs

### Règles AD granulaires

**ALLOW-AD-DNS** :
```
Source: CLIENTS, SERVERS
Dest: DC01 (10.1.10.10)
App: dns
Service: service-udp-53
Action: Allow
Profile: SPG-Balanced
```

**ALLOW-AD-Kerberos** :
```
Source: CLIENTS, SERVERS
Dest: DC01 (10.1.10.10)
App: kerberos
Service: service-tcp-88, service-udp-88
Action: Allow
Profile: SPG-Balanced
```

**ALLOW-AD-LDAP** :
```
Source: CLIENTS, SERVERS
Dest: DC01 (10.1.10.10)
App: ldap
Service: service-tcp-389, service-tcp-636
Action: Allow
Profile: SPG-Balanced
```

### Règles Internet granulaires

**SERVERS-to-Updates** :
```
Source: SERVERS
Dest: any
App: apt-get, ms-update, web-browsing
Service: application-default
Action: Allow
Profile: SPG-Balanced
```

**CLIENTS-to-Internet** :
```
Source: CLIENTS
Dest: any (zone OUTSIDE)
App: web-browsing, ssl, dns
Service: application-default
Action: Allow
Profile: SPG-Balanced
```

## Phase 5 : Suppression Règles Dangereuses

### Règles à désactiver

**Important** : NE PAS SUPPRIMER, DÉSACTIVER uniquement (permet rollback rapide).

**GUI : Policies > Security**

**Attention** : Cocher "Disabled" pour :
1. `interzone-default` (règle #27)
2. `intrazone-default` (règle #26)
3. `ALLOW-INTRAZONE-OUTSIDE` (règle #24)
4. `TEMP-ALLOW-NBNS` (règle #9)

### Création règle DENY-ALL finale

**GUI : Policies > Security > Add (à la fin)**

```
┌─────────────────────────────────────────────────┐
│ Name: DENY-ALL-LOG                              │
│                                                 │
│ SOURCE                                          │
│ Zone: any                                       │
│ Address: any                                    │
│                                                 │
│ DESTINATION                                     │
│ Zone: any                                       │
│ Address: any                                    │
│                                                 │
│ APPLICATION: any                                │
│ SERVICE: any                                    │
│                                                 │
│ ACTION: Deny                                    │
│ PROFILE: none                                   │
│ LOG: Session Start + End                        │
│                                                 │
│ POSITION: En dernière position                  │
└─────────────────────────────────────────────────┘
```

**Important** : Cette règle capture tout le trafic non autorisé explicitement.

### Commit et vérification

```bash
# Commit
commit

# Vérifier ordre des règles
> show running security-policy
```

## Phase 6 : Tests et Validation

### Tests VPN GlobalProtect

**Test 1 : Connexion VPN**
```powershell
# Se connecter avec GlobalProtect
# Vérifier IP attribuée
ipconfig | findstr "10.1.50"
```

**Test 2 : Accès AD depuis VPN**
```powershell
# Résolution DNS
nslookup dc01.protolab.local
# Résultat attendu : 10.1.10.10

# RDP
mstsc /v:10.1.10.10
```

**Test 3 : Accès INFRA depuis VPN**
```powershell
# SSH vers Victoria Logs
ssh root@10.1.40.25

# HTTP vers Grafana (si déployé)
curl http://10.1.40.26:3000
```

**Test 4 : Internet split-tunnel**
```powershell
# Doit passer par la box, PAS par le VPN
tracert 8.8.8.8
# Premier hop attendu : 192.168.1.1 (box Orange)
```

### Vérification des logs

**GUI : Monitor > Logs > Traffic**
```
Filtres à vérifier :
1. ( rule eq 'DENY-ALL-LOG' ) → Doit être VIDE ou minimal
2. ( rule eq 'VPN-to-AD-Auth' ) → Doit montrer du trafic
3. ( action eq 'deny' ) → Analyser les refus
```

**GUI : Monitor > Logs > Threat**
```
Vérifier qu'aucune alerte critique n'apparaît
```

### Test de simulation de règle

**CLI** :
```bash
# Simuler trafic VPN → DC01 LDAP
> test security-policy-match from VPN-REMOTE to SERVERS \
  source 10.1.50.2 destination 10.1.10.10 \
  protocol 6 destination-port 389

# Résultat attendu : Rule "VPN-to-AD-Auth" matched

# Simuler trafic non autorisé (doit être bloqué)
> test security-policy-match from VPN-REMOTE to DMZ \
  source 10.1.50.2 destination 10.1.30.10 \
  protocol 6 destination-port 22

# Résultat attendu : Rule "DENY-ALL-LOG" matched
```

### Validation checklist

| Test | Commande/Action | Résultat attendu | ✓ |
|------|-----------------|------------------|---|
| VPN connexion | GlobalProtect connect | Connected, IP 10.1.50.x | ☐ |
| DNS via VPN | nslookup dc01.protolab.local | 10.1.10.10 | ☐ |
| RDP DC01 | mstsc /v:10.1.10.10 | Connexion OK | ☐ |
| SSH Victoria | ssh root@10.1.40.25 | Connexion OK | ☐ |
| Internet split | tracert 8.8.8.8 | Via 192.168.1.1 | ☐ |
| Logs Traffic | Monitor > Logs | Pas d'anomalie | ☐ |
| Logs Threat | Monitor > Logs | Pas d'alerte critique | ☐ |
| DENY-ALL hits | Filtrer DENY-ALL-LOG | Minimal/prévu | ☐ |

## Phase 7 : Ouverture Internet (Optionnel)

**Important** : Prérequis : Toutes les phases précédentes validées.

### Configuration Port Forwarding sur Box Orange

**Interface Livebox (http://192.168.1.1)** :
```
Configuration > Réseau > NAT/PAT

Règle 1 :
├─ Nom: GlobalProtect-HTTPS
├─ Port externe: 443
├─ Protocole: TCP
├─ IP interne: 192.168.1.254
└─ Port interne: 443

Règle 2 :
├─ Nom: GlobalProtect-IPsec
├─ Port externe: 4501
├─ Protocole: UDP
├─ IP interne: 192.168.1.254
└─ Port interne: 4501
```

### Mise à jour GlobalProtect avec IP publique

**Récupérer IP publique** :
```bash
curl ifconfig.me
# Exemple : 90.xx.xx.xx
```

**GUI : Network > GlobalProtect > Portals > GP-Portal**
```
Agent > External Gateway Config
├─ Address: 90.xx.xx.xx (ou FQDN DynDNS)
└─ Priority: 1
```

**GUI : Network > GlobalProtect > Gateways > GP-Gateway-N**
```
General > Network Settings
└─ External Address: 90.xx.xx.xx
```

### Règle de sécurité pour accès GP depuis Internet

**GUI : Policies > Security > Add (en haut)**
```
┌─────────────────────────────────────────────────┐
│ Name: Internet-to-GP-Portal                     │
│                                                 │
│ SOURCE                                          │
│ Zone: OUTSIDE                                   │
│ Address: any                                    │
│                                                 │
│ DESTINATION                                     │
│ Zone: OUTSIDE                                   │
│ Address: 192.168.1.254                          │
│                                                 │
│ APPLICATION: ssl, ipsec-esp-udp                 │
│                                                 │
│ SERVICE:                                        │
│ ├─ service-https (443/TCP)                      │
│ └─ udp/4501                                     │
│                                                 │
│ ACTION: Allow                                   │
│ PROFILE: none (GP gère sa propre sécurité)      │
│ LOG: Session Start                              │
│                                                 │
│ POSITION: Au-dessus des règles VPN              │
└─────────────────────────────────────────────────┘
```

### Test depuis réseau externe

1. Désactiver WiFi sur smartphone
2. Utiliser données mobiles (4G/5G)
3. Installer GlobalProtect sur mobile
4. Connecter avec :
   ```
   Portal: 90.xx.xx.xx (ou FQDN)
   User: jdupont@protolab.local
   Password: [mot de passe AD ou local]
   ```

## Rollback en Cas de Problème

### Procédure de rollback immédiat

**Symptôme** : Perte d'accès après commit.

**Solution** :

1. **Accès console Proxmox** :
   ```
   Proxmox > VM 102 (PA-VM) > Console
   ```

2. **Restaurer configuration** :
   ```bash
   > configure
   # load config from Pre-Hardening-Backup-20251216.xml
   # commit force
   ```

3. **Ou réactiver règles désactivées** :
   ```bash
   > configure
   # set rulebase security rules interzone-default disabled no
   # set rulebase security rules intrazone-default disabled no
   # commit
   ```

### Numéros d'urgence (timeout auto)

**Important** : Le PA-VM dispose d'un **commit timeout** : si vous perdez l'accès après un commit, la configuration revient automatiquement après le timeout configuré.

**Vérifier/configurer** :
```
Device > Setup > Management > Commit Timeout: 5 minutes
```

## Références Documentaires

### Palo Alto Networks (officielles)

| Document | URL |
|----------|-----|
| Security Policy Best Practices | https://docs.paloaltonetworks.com/best-practices/security-policy-best-practices |
| GlobalProtect Admin Guide | https://docs.paloaltonetworks.com/globalprotect |
| Threat Prevention Best Practices | https://docs.paloaltonetworks.com/best-practices/threat-prevention-best-practices |
| DNS Security | https://docs.paloaltonetworks.com/dns-security |
| WildFire Administration | https://docs.paloaltonetworks.com/wildfire |

### ANSSI (recommandations françaises)

| Document | Référence |
|----------|-----------|
| Recommandations de sécurité relatives aux architectures réseau | ANSSI-BP-044 |
| Guide de configuration sécurisée d'un pare-feu | ANSSI-PA-023 |

## Suivi des Modifications

| Date | Phase | Action | Statut |
|------|-------|--------|--------|
| 16/12/2025 | 0 | Sauvegarde configuration | ☐ |
| 16/12/2025 | 1 | Création profils sécurité | ☐ |
| 16/12/2025 | 2 | Configuration User-ID | ☐ (optionnel) |
| 16/12/2025 | 3 | Durcissement règles VPN | ☐ |
| 16/12/2025 | 4 | Durcissement règles LAN | ☐ |
| 16/12/2025 | 5 | Suppression règles dangereuses | ☐ |
| 16/12/2025 | 6 | Tests et validation | ☐ |
| TBD | 7 | Ouverture Internet | ☐ |
