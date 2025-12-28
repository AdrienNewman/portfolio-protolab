---
title: "Solution de Backup Protolab - Documentation Technique"
description: "Solution complète de sauvegarde automatisée des configurations critiques Protolab : PA-VM (API XML), Active Directory (PowerShell CSV), Stack Logs (OpenTelemetry) avec versioning Git et stockage GitHub"
category: documentation
date: 2025-12-22
tags:
  - backup
  - git
  - paloalto
  - windows
  - linux
  - automation
  - bash
  - powershell
author: Adrien Mercadier
difficulty: intermediate
featured: true
---

# Solution de Backup Protolab - Documentation Technique

**Projet** : Infrastructure Protolab.local  
**Statut** : Production

## Vue d'ensemble

### Objectif

Mettre en place une solution de backup légère et automatisée pour sauvegarder uniquement les **configurations critiques** de l'infrastructure Protolab, sans stocker les données applicatives volumineuses.

### Périmètre

**Inclus :**
- Configurations firewall Palo Alto PA-VM (XML)
- Structure Active Directory complète (Users/Groups/OUs/Computers en CSV)
- Configurations stack de logs unifié (OpenTelemetry Collector)

**Exclus :**
- System State complet Windows Server (2-5 GB)
- Logs applicatifs (régénérables)
- Images disques VM/CT
- Données utilisateurs

### Bénéfices

| Aspect | Solution classique | Solution mise en place |
|--------|-------------------|----------------------|
| **Espace disque** | 150+ GB (backups complets) | ~200-300 MB (configs uniquement) |
| **Fréquence** | Hebdomadaire (lourd) | Quotidienne (léger) |
| **Versioning** | Snapshots datés | Git avec historique complet |
| **Restauration** | Restoration complète VM | Cherry-pick de configs spécifiques |
| **Accessibilité** | Local uniquement | GitHub (accessible partout) |

## Architecture Technique

### Schéma d'infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│                    SOURCES DE BACKUP                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   PA-VM      │  │    DC01      │  │  Stack Logs     │  │
│  │ 192.168.1.37 │  │  10.1.10.10  │  │  (CT 202/201)   │  │
│  │              │  │              │  │                 │  │
│  │ API XML      │  │ PowerShell   │  │ SSH             │  │
│  │ backup-api   │  │ svc-backup   │  │ svc-backup      │  │
│  │ (export only)│  │ (lecture AD) │  │ (sans sudo)     │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘  │
│         │                 │                    │           │
└─────────┼─────────────────┼────────────────────┼───────────┘
          │                 │                    │
          └─────────────────┴────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   Proxmox VE   │
                    │ 192.168.1.100  │
                    │                │
                    │ Scripts Bash   │
                    │ + Cron (13h)   │
                    └───────┬────────┘
                            │
                    ┌───────▼────────┐
                    │  Git Local     │
                    │ /opt/protolab- │
                    │    configs     │
                    └───────┬────────┘
                            │
                            │ SSH Key ED25519
                            │ (Keychain)
                            │
                    ┌───────▼────────┐
                    │   GitHub       │
                    │  Repo Privé    │
                    │ AdrienNewman/  │
                    │ protolab-      │
                    │ configs        │
                    └────────────────┘
```

### Flux de données

**Séquence d'exécution quotidienne (13h00) :**

```
1. Cron trigger → backup-all.sh
   │
2. ├─> backup-palo-alto.sh
   │    └─> curl API (user: backup-api) → running-config.xml
   │
3. ├─> backup-stack-logs.sh
   │    └─> ssh svc-backup@10.1.40.30 → config.yaml
   │
4. ├─> backup-ad-auto.sh
   │    ├─> ssh svc-backup@10.1.10.10 → export-ad-structure.ps1
   │    └─> scp *.csv → /opt/protolab-configs/active-directory/exports/
   │
5. └─> git add . && git commit && git push
```

## Composants Sauvegardés

### Palo Alto PA-VM (Firewall)

**Méthode** : API REST XML  
**Compte utilisé** : `backup-api` (profil `API-Backup`, droits limités)  
**Fichier produit** : `palo-alto/configs/running-config_YYYYMMDD_HHMMSS.xml`  
**Taille** : ~95-100 KB

**Contenu** :
- Configuration complète running-config
- Zones de sécurité (OUTSIDE, SERVERS, CLIENTS, DMZ, INFRA, VPN)
- Règles de sécurité (security policies)
- Configuration NAT (SNAT dynamique)
- Profils de sécurité (Threat Prevention, URL Filtering, etc.)
- Configuration GlobalProtect (Portal + Gateway)
- Objets réseau (addresses, services, groups)
- Configuration interfaces (eth1/1 à eth1/5)
- Virtual Router et routes statiques

**Commande d'export** :

```bash
curl -k -o "running-config_${DATE}.xml" \
  "https://192.168.1.37/api/?type=export&category=configuration&key=${PA_API_KEY}"
```

**Rétention** : 10 derniers backups

### Active Directory (DC01 - Windows Server)

**Méthode** : PowerShell + SSH  
**Compte utilisé** : `svc-backup` (utilisateur domaine, lecture AD uniquement)

**Fichiers produits** : 
- `active-directory/exports/YYYYMMDD_HHMMSS/users_*.csv`
- `active-directory/exports/YYYYMMDD_HHMMSS/groups_*.csv`
- `active-directory/exports/YYYYMMDD_HHMMSS/ous_*.csv`
- `active-directory/exports/YYYYMMDD_HHMMSS/computers_*.csv`

**Taille totale** : ~50-100 KB

**Contenu** :

**users.csv :**
- Name, SamAccountName, UserPrincipalName
- EmailAddress, Enabled, PasswordNeverExpires
- DistinguishedName, Description
- Created, Modified

**groups.csv :**
- Name, SamAccountName
- GroupCategory (Security/Distribution)
- GroupScope (Global/DomainLocal/Universal)
- DistinguishedName, Description
- Created, Modified

**ous.csv :**
- Name, DistinguishedName
- Description, Created, Modified

**computers.csv :**
- Name, DNSHostName, OperatingSystem
- Enabled, DistinguishedName
- Created, Modified

**Script PowerShell** : `C:\Scripts\export-ad-structure.ps1`  
**Rétention** : Tous les exports (légers)

### Stack de Logs Unifié

**Méthode** : SSH + scp  
**Compte utilisé** : `svc-backup` (utilisateur standard, sans sudo)  
**Fichier produit** : `stack-logs/otelcol/config_YYYYMMDD_HHMMSS.yaml`  
**Taille** : ~5-10 KB

**Contenu** :
- Configuration OpenTelemetry Collector (CT 202)
- Receivers (syslog UDP/514, otlp gRPC/4317)
- Processors (transform/paloalto, transform/proxmox, transform/windows, batch)
- Exporters (otlphttp vers VictoriaLogs)
- Extensions (file_storage, health_check)
- Pipelines (logs/syslog, logs/windows)

**Commande d'export** :

```bash
ssh -i ~/.ssh/id_protolab svc-backup@10.1.40.30 "cat /etc/otelcol/config.yaml"
```

**Rétention** : 5 derniers backups

## Infrastructure Git

### Repository GitHub

**URL** : `https://github.com/AdrienNewman/protolab-configs`  
**Type** : Privé  
**Branche principale** : `main`

**Structure arborescente** :

```
protolab-configs/
├── .gitignore                    # Exclusions (secrets, binaires)
├── README.md                     # Documentation utilisateur
├── palo-alto/
│   ├── configs/                  # Exports XML PA-VM
│   │   ├── running-config_20251222_110856.xml
│   │   ├── running-config_20251222_113906.xml
│   │   └── ...
│   └── backups/                  # (vide - pour snapshots nommés futurs)
├── active-directory/
│   ├── exports/                  # Exports CSV structure AD
│   │   ├── 20251222_112015/
│   │   │   ├── users_20251222_112015.csv
│   │   │   ├── groups_20251222_112015.csv
│   │   │   ├── ous_20251222_112015.csv
│   │   │   └── computers_20251222_112015.csv
│   │   └── ...
│   └── scripts/                  # Scripts PowerShell
│       └── (vide localement - scripts sur DC01)
├── stack-logs/
│   ├── otelcol/                  # Configs OpenTelemetry Collector
│   │   ├── config_20251222_113907.yaml
│   │   └── ...
│   └── victoria-logs/            # (pas de config spécifique à sauvegarder)
├── proxmox/
│   └── configs/                  # (réservé pour future expansion)
└── scripts/                      # Scripts d'automatisation
    ├── backup-palo-alto.sh       # Backup PA-VM via API
    ├── backup-stack-logs.sh      # Backup stack logs via SSH
    ├── backup-ad-auto.sh         # Backup AD via SSH + PowerShell
    ├── backup-all.sh             # Orchestrateur principal
    └── export-ad-structure.ps1   # Script PowerShell (référence)
```

### Fichier .gitignore

```gitignore
# Secrets et credentials
*.key
*.pem
*.crt
*.p12
*password*
*secret*
.env

# Fichiers temporaires
*.tmp
*.temp
*.log
*.bak

# Dossiers système
.DS_Store
Thumbs.db
```

## Scripts d'Automatisation

### backup-palo-alto.sh

**Chemin** : `/opt/protolab-configs/scripts/backup-palo-alto.sh`

```bash
#!/bin/bash
# Backup configuration Palo Alto PA-VM via API
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/protolab-configs/palo-alto/configs"
BACKUP_FILE="${BACKUP_DIR}/running-config_${DATE}.xml"

# Charger credentials
source /root/.protolab_creds

echo "[$(date)] Début backup PA-VM..."

# Export via API
curl -k -o "${BACKUP_FILE}" \
  "https://192.168.1.37/api/?type=export&category=configuration&key=${PA_API_KEY}"

if [ -f "${BACKUP_FILE}" ] && [ -s "${BACKUP_FILE}" ]; then
    echo "[$(date)] ✓ Config exportée: $(basename ${BACKUP_FILE})"
    
    # Rotation : garder les 10 derniers
    cd ${BACKUP_DIR}
    ls -t running-config_*.xml 2>/dev/null | tail -n +11 | xargs -r rm
    echo "[$(date)] ✓ Rotation effectuée (10 derniers conservés)"
else
    echo "[$(date)] ✗ Erreur export PA-VM"
    exit 1
fi
```

### backup-ad-auto.sh

**Chemin** : `/opt/protolab-configs/scripts/backup-ad-auto.sh`

```bash
#!/bin/bash
# Backup structure Active Directory via SSH + PowerShell
DATE=$(date +%Y%m%d_%H%M%S)
EXPORT_DIR="/opt/protolab-configs/active-directory/exports/${DATE}"
SSH_KEY="/root/.ssh/id_protolab"
DC_HOST="10.1.10.10"
DC_USER="svc-backup"

echo "[$(date)] Début backup Active Directory..."

# Créer dossier export
mkdir -p "${EXPORT_DIR}"

# Lancer script PowerShell sur DC01
echo "[$(date)] Lancement export AD sur DC01..."
ssh -i ${SSH_KEY} ${DC_USER}@${DC_HOST} \
  "powershell.exe -ExecutionPolicy Bypass -File C:\Scripts\export-ad-structure.ps1"

if [ $? -eq 0 ]; then
    echo "[$(date)] ✓ Export AD terminé sur DC01"
else
    echo "[$(date)] ✗ Erreur lancement script PowerShell"
    exit 1
fi

# Récupération CSV
echo "[$(date)] Récupération fichiers CSV..."
scp -i ${SSH_KEY} ${DC_USER}@${DC_HOST}:"C:/Temp/AD-Export/*.csv" "${EXPORT_DIR}/"

if [ $? -eq 0 ]; then
    echo "[$(date)] ✓ CSV récupérés : $(ls ${EXPORT_DIR}/*.csv | wc -l) fichiers"
else
    echo "[$(date)] ✗ Erreur récupération CSV"
    exit 1
fi
```

### backup-stack-logs.sh

**Chemin** : `/opt/protolab-configs/scripts/backup-stack-logs.sh`

```bash
#!/bin/bash
# Backup configuration OpenTelemetry Collector
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/protolab-configs/stack-logs/otelcol"
BACKUP_FILE="${BACKUP_DIR}/config_${DATE}.yaml"
SSH_KEY="/root/.ssh/id_protolab"
OTEL_HOST="10.1.40.30"
OTEL_USER="svc-backup"

echo "[$(date)] Début backup Stack Logs..."

# Export config via SSH
ssh -i ${SSH_KEY} ${OTEL_USER}@${OTEL_HOST} \
  "cat /etc/otelcol/config.yaml" > "${BACKUP_FILE}"

if [ -f "${BACKUP_FILE}" ] && [ -s "${BACKUP_FILE}" ]; then
    echo "[$(date)] ✓ OTel Collector config sauvegardée"
    
    # Rotation : garder les 5 derniers
    cd ${BACKUP_DIR}
    ls -t config_*.yaml 2>/dev/null | tail -n +6 | xargs -r rm
    echo "[$(date)] ✓ Rotation effectuée (5 derniers conservés)"
else
    echo "[$(date)] ✗ Erreur backup OTel Collector"
    exit 1
fi
```

### backup-all.sh

**Chemin** : `/opt/protolab-configs/scripts/backup-all.sh`

```bash
#!/bin/bash
# Orchestrateur backup complet Protolab
SCRIPT_DIR="/opt/protolab-configs/scripts"
REPO_DIR="/opt/protolab-configs"

echo "========================================"
echo "[$(date)] Début backup automatique"
echo "========================================"

# Charger l'agent SSH (keychain)
eval $(keychain --eval --quiet ~/.ssh/id_protolab)

# 1. Backup PA-VM
${SCRIPT_DIR}/backup-palo-alto.sh

# 2. Backup Stack Logs
${SCRIPT_DIR}/backup-stack-logs.sh

# 3. Backup AD
${SCRIPT_DIR}/backup-ad-auto.sh

# 4. Commit et push Git
echo "[$(date)] Push vers GitHub..."
cd ${REPO_DIR}
git add .
git commit -m "Auto-backup $(date +%Y%m%d_%H%M%S)"
git push

echo "========================================"
echo "[$(date)] ✓ Backup terminé"
echo "========================================"
```

## Sécurité

### Principe du moindre privilège

**Configuration** : Tous les comptes de service disposent uniquement des droits minimaux nécessaires.

| Compte | Système | Droits accordés | Droits refusés |
|--------|---------|-----------------|----------------|
| `backup-api` | PA-VM | Export config, lecture config | Commit, Import, Web UI, CLI |
| `svc-backup` | DC01 | Lecture objets AD | Domain Admin, modification AD |
| `svc-backup` | CT 202 | Lecture fichiers config | sudo, modification système |

### Gestion des secrets

**Configuration** : Credentials stockés de manière sécurisée.

**Fichier** : `/root/.protolab_creds`

```bash
# Credentials Palo Alto PA-VM
export PA_API_KEY="LUFRPT14MW5nMT09D3r...LONG_KEY_HERE"
```

**Permissions** :

```bash
chmod 600 /root/.protolab_creds
chown root:root /root/.protolab_creds
```

### SSH Key Management

**Clé utilisée** : ED25519 (plus sécurisé que RSA)  
**Emplacement** : `/root/.ssh/id_protolab`  
**Protection** : Passphrase activée + Keychain

**Configuration Keychain** :

```bash
# .bashrc
eval $(keychain --eval --quiet ~/.ssh/id_protolab)
```

**Avantage** : Pas besoin de retaper la passphrase à chaque backup.

## Planification et Rétention

### Planification Cron

**Fichier** : `crontab -e`

```bash
# Backup quotidien à 13h00
0 13 * * * /opt/protolab-configs/scripts/backup-all.sh >> /var/log/protolab-backup.log 2>&1
```

### Politique de rétention

| Composant | Rétention locale | Rétention GitHub | Rotation |
|-----------|------------------|------------------|----------|
| PA-VM configs | 10 derniers | Illimité | Automatique |
| AD exports | Tous | Illimité | Aucune |
| Stack logs configs | 5 derniers | Illimité | Automatique |

**Configuration** : Git conserve l'historique complet, permettant de revenir à n'importe quelle version.

## Procédures de Restauration

### Restauration config PA-VM

**Depuis GitHub** :

```bash
# Cloner le repo (si perdu)
cd /tmp
git clone git@github.com:AdrienNewman/protolab-configs.git

# Trouver le backup souhaité
cd protolab-configs/palo-alto/configs
ls -lht running-config_*.xml

# Restaurer via GUI PA-VM
# Device > Setup > Operations > Import named configuration snapshot
# Upload : running-config_YYYYMMDD_HHMMSS.xml
# Load : Nom du snapshot
# Commit
```

**Via CLI** :

```bash
# Copier XML sur PA-VM
scp running-config_20251222_110856.xml admin@192.168.1.37:/tmp/

# CLI PA-VM
> configure
# load config from /tmp/running-config_20251222_110856.xml
# commit
```

### Restauration structure AD

**Important** : Les exports CSV ne remplacent pas un System State Backup complet. Ils permettent de recréer la structure si nécessaire.

**Recréation utilisateur** :

```powershell
# Importer CSV
$users = Import-Csv "users_20251222_112015.csv"

# Recréer utilisateurs
foreach ($user in $users) {
    New-ADUser `
      -Name $user.Name `
      -SamAccountName $user.SamAccountName `
      -UserPrincipalName $user.UserPrincipalName `
      -Path (Get-ADOrganizationalUnit -Filter "DistinguishedName -eq '$($user.DistinguishedName.Split(',',2)[1])'").DistinguishedName `
      -Enabled $($user.Enabled -eq 'True') `
      -Description $user.Description
}
```

### Restauration config Stack Logs

**Depuis backup** :

```bash
# Copier config depuis GitHub
cd /tmp
git clone git@github.com:AdrienNewman/protolab-configs.git
cd protolab-configs/stack-logs/otelcol

# Restaurer sur CT 202
scp -i ~/.ssh/id_protolab config_20251222_113907.yaml adminprotolab@10.1.40.30:/tmp/

# SSH CT 202
ssh -i ~/.ssh/id_protolab adminprotolab@10.1.40.30

# Backup config actuelle
sudo cp /etc/otelcol/config.yaml /etc/otelcol/config.yaml.bak

# Restaurer
sudo cp /tmp/config_20251222_113907.yaml /etc/otelcol/config.yaml

# Restart service
sudo systemctl restart otelcol
```

## Maintenance et Monitoring

### Vérifications régulières

**Hebdomadaire** :

```bash
# Vérifier derniers backups
cd /opt/protolab-configs
git log --oneline -10

# Vérifier logs
tail -50 /var/log/protolab-backup.log
```

**Mensuel** :

```bash
# Test restauration PA-VM (sur VM test)
# Test export AD (vérifier CSV générés)
# Vérifier espace disque GitHub utilisé
```

### Logs et alertes

**Fichier de log** : `/var/log/protolab-backup.log`

**Vérification logs** :

```bash
# Dernières exécutions
tail -100 /var/log/protolab-backup.log

# Rechercher erreurs
grep "✗" /var/log/protolab-backup.log

# Statistiques
grep "Début backup" /var/log/protolab-backup.log | wc -l
```

### Monitoring

**Vérifications** :

```bash
# Service cron actif ?
systemctl status cron

# Keychain SSH actif ?
ssh-add -l

# Connexion GitHub OK ?
cd /opt/protolab-configs
git status
git status
```

## Troubleshooting

### Problème : Git push échoue (authentification)

**Symptôme** :

```
Permission denied (publickey).
fatal: Could not read from remote repository.
```

**Diagnostic** :

```bash
# Vérifier agent SSH
ssh-add -l

# Si vide, relancer keychain
eval $(keychain --eval --quiet ~/.ssh/id_protolab)
ssh-add -l
```

**Solution** :

```bash
# Si la clé n'est pas chargée
ssh-add ~/.ssh/id_protolab
# Enter passphrase

# Retester
git push
```

### Problème : Backup PA-VM retourne XML d'erreur

**Symptôme** :

```xml
<response status="error">
  <msg>Invalid credentials</msg>
</response>
```

**Diagnostic** :

```bash
# Vérifier clé API
source /root/.protolab_creds
echo $PA_API_KEY | wc -c  # Doit être > 50 caractères

# Tester clé API
curl -k "https://192.168.1.37/api/?type=op&cmd=<show><system><info></info></system></show>&key=${PA_API_KEY}"
```

**Solution** :

```bash
# Régénérer clé API pour l'utilisateur backup-api
curl -k "https://192.168.1.37/api/?type=keygen&user=backup-api&password=MOT_DE_PASSE"

# Mettre à jour /root/.protolab_creds avec la nouvelle clé
nano /root/.protolab_creds
```

### Problème : SSH vers DC01 demande mot de passe

**Symptôme** :

```bash
ssh -i ~/.ssh/id_protolab svc-backup@10.1.10.10
Password:
```

**Diagnostic** :

```bash
# Vérifier clé publique présente
ssh -i ~/.ssh/id_protolab svc-backup@10.1.10.10 "type C:\Users\svc-backup\.ssh\authorized_keys"
```

**Solution** :

```powershell
# Sur DC01, reconfigurer les permissions
$acl = Get-Acl "C:\Users\svc-backup\.ssh\authorized_keys"
$acl.SetOwner([System.Security.Principal.NTAccount]"PROTOLAB\svc-backup")
Set-Acl "C:\Users\svc-backup\.ssh\authorized_keys" $acl

icacls "C:\Users\svc-backup\.ssh\authorized_keys" /inheritance:r
icacls "C:\Users\svc-backup\.ssh\authorized_keys" /grant "PROTOLAB\svc-backup:(R)"
icacls "C:\Users\svc-backup\.ssh\authorized_keys" /grant "SYSTEM:(F)"
```

### Problème : SSH vers CT 202 demande mot de passe

**Symptôme** :

```bash
ssh -i ~/.ssh/id_protolab svc-backup@10.1.40.30
Password:
```

**Solution** :

```bash
# Sur CT 202, vérifier permissions
ssh adminprotolab@10.1.40.30
sudo chown -R svc-backup:svc-backup /home/svc-backup/.ssh
sudo chmod 700 /home/svc-backup/.ssh
sudo chmod 600 /home/svc-backup/.ssh/authorized_keys
```

### Problème : Export AD ne génère pas de CSV

**Symptôme** :

```
[date] ✗ Erreur récupération CSV
```

**Diagnostic** :

```bash
# Se connecter à DC01
ssh -i ~/.ssh/id_protolab svc-backup@10.1.10.10

# Vérifier si les CSV existent
dir C:\Temp\AD-Export\*.csv

# Tester script PowerShell manuellement
powershell.exe -ExecutionPolicy Bypass -File C:\Scripts\export-ad-structure.ps1
```

**Solutions** :

**Root cause** : Script n'existe pas.

**Solution** : Recopier le script depuis Proxmox :

```bash
scp -i ~/.ssh/id_protolab /opt/protolab-configs/scripts/export-ad-structure.ps1 svc-backup@10.1.10.10:C:/Scripts/
```

**Root cause** : Erreur PowerShell (module AD manquant).

**Solution** :

```powershell
# Sur DC01, vérifier module AD
Get-Module -ListAvailable ActiveDirectory

# Si absent, installer RSAT (avec compte admin)
Install-WindowsFeature RSAT-AD-PowerShell
```

### Problème : Cron ne s'exécute pas

**Symptôme** :

```bash
# Aucun log après 13h
tail /var/log/protolab-backup.log
# (vide ou ancien)
```

**Diagnostic** :

```bash
# Vérifier cron actif
systemctl status cron

# Vérifier crontab
crontab -l

# Logs cron système
grep CRON /var/log/syslog | tail -20
```

**Solution** :

```bash
# Si cron désactivé
systemctl enable cron
systemctl start cron

# Si crontab vide, recréer
crontab -e
# Ajouter :
0 13 * * * /opt/protolab-configs/scripts/backup-all.sh >> /var/log/protolab-backup.log 2>&1

# Tester exécution manuelle
/opt/protolab-configs/scripts/backup-all.sh
```

## Glossaire

| Terme | Définition |
|-------|-----------|
| **API** | Application Programming Interface - Interface de programmation permettant l'interaction automatisée avec un système |
| **CSV** | Comma-Separated Values - Format de fichier texte pour données tabulaires |
| **Cron** | Planificateur de tâches Unix/Linux pour exécution automatique de scripts |
| **Distinguished Name (DN)** | Chemin complet d'un objet Active Directory (ex: CN=User,OU=Users,DC=protolab,DC=local) |
| **Git** | Système de gestion de versions distribué pour code source et configurations |
| **Keychain** | Gestionnaire de clés SSH persistantes sur Linux |
| **Moindre privilège** | Principe de sécurité accordant uniquement les droits nécessaires à l'exécution d'une tâche |
| **Running-config** | Configuration active d'un équipement réseau (par opposition à startup-config) |
| **SamAccountName** | Nom de compte unique Active Directory (ex: jdupont) |
| **SSH** | Secure Shell - Protocole de connexion sécurisée à distance |
| **System State** | Sauvegarde complète des composants système Windows (registre, AD, etc.) |

## Références Documentaires

**Documentation officielle Palo Alto Networks :**
- PAN-OS API Guide : https://docs.paloaltonetworks.com/pan-os/11-1/pan-os-panorama-api
- Configure Admin Role Profile : https://docs.paloaltonetworks.com/pan-os/10-1/pan-os-admin/firewall-administration/manage-firewall-administrators/configure-an-admin-role-profile
- Configuration Management : https://docs.paloaltonetworks.com/pan-os/11-1/pan-os-admin/firewall-administration/manage-firewalls

**Documentation Microsoft Active Directory :**
- PowerShell AD Module : https://learn.microsoft.com/en-us/powershell/module/activedirectory/
- OpenSSH for Windows : https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse

**Documentation Git & GitHub :**
- Git Documentation : https://git-scm.com/doc
- GitHub SSH Authentication : https://docs.github.com/en/authentication/connecting-to-github-with-ssh

## Changelog

| Version | Date | Auteur | Modifications |
|---------|------|--------|---------------|
| 1.0 | 22/12/2025 | Adrien Mercadier | Création documentation complète |
| 1.1 | 22/12/2025 | Adrien Mercadier | Ajout section sécurité moindre privilège, mise à jour comptes de service |
