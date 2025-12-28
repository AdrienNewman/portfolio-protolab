---
title: "Extension Backup 3-2-1 - Protolab"
description: "Implémentation de la règle de backup 3-2-1 avec ajout de la sauvegarde des configurations Proxmox et copies multiples sur supports différents (Git local, GitHub, stockage local, clé USB)"
category: documentation
date: 2025-12-22
tags:
  - backup
  - proxmox
  - git
  - automation
  - best-practices
author: Adrien Mercadier
difficulty: intermediate
featured: true
---

# Extension Backup 3-2-1 - Protolab

**Projet** : Infrastructure Protolab.local  
**Statut** : Production (2/3 copies actives)

## Objectif de cette Mise à Jour

Extension de la solution de backup existante pour :
1. **Ajouter la sauvegarde des configurations Proxmox** (hyperviseur)
2. **Implémenter la règle de backup 3-2-1** (best practice industrie)

## Règle de Backup 3-2-1

### Principe

| Chiffre | Signification | Implémentation Protolab |
|---------|---------------|-------------------------|
| **3** | 3 copies des données | Git local + GitHub + Stockage local |
| **2** | 2 supports différents | SSD (Git) + Cloud (GitHub) + USB (à venir) |
| **1** | 1 copie hors site | GitHub (repo privé) |

### État actuel

| Copie | Emplacement | Support | Statut |
|-------|-------------|---------|--------|
| **Copie 1** | GitHub `AdrienNewman/protolab-configs` | Cloud (hors site) | ✅ Actif |
| **Copie 2** | `/var/lib/vz/backup/protolab-configs/` | SSD local Proxmox | ✅ Actif |
| **Copie 3** | Clé USB montée sur Proxmox | Support amovible | ⏳ À configurer |

## Nouveau Composant : Backup Proxmox

### Éléments sauvegardés

| Fichier/Dossier | Chemin source | Contenu |
|-----------------|---------------|---------|
| **Configs VMs** | `/etc/pve/qemu-server/*.conf` | Définitions des machines virtuelles |
| **Configs CTs** | `/etc/pve/lxc/*.conf` | Définitions des conteneurs LXC |
| **Réseau** | `/etc/network/interfaces` | Configuration bridges (vmbr0-4) |
| **Storage** | `/etc/pve/storage.cfg` | Définition des stockages |
| **Datacenter** | `/etc/pve/datacenter.cfg` | Configuration globale datacenter |
| **Users** | `/etc/pve/user.cfg` | Utilisateurs et permissions Proxmox |

### VMs et CTs actuellement sauvegardés

**Machines Virtuelles (qemu-server)** :

| VMID | Nom | Rôle |
|------|-----|------|
| 102 | PA-VM | Firewall Palo Alto |
| 103 | Proxmox-Backup | Serveur backup |
| 104 | - | (à documenter) |
| 300 | - | (à documenter) |

**Conteneurs LXC** :

| CTID | Nom | Rôle |
|------|-----|------|
| 200 | DC01 | Contrôleur de domaine AD |
| 201 | victoria-logs | Stockage logs |
| 202 | otel-collector | Collecteur OpenTelemetry |
| 203 | grafana | Visualisation (prévu) |
| 250 | - | (à documenter) |

### Configuration réseau sauvegardée

```
Bridges Proxmox :
├── vmbr0 : 192.168.1.100/24 (Management + OUTSIDE)
│   └── Route : 10.1.0.0/16 via 192.168.1.254 (PA-VM)
├── vmbr1 : SERVERS (10.1.10.0/24)
├── vmbr2 : CLIENTS (10.1.20.0/24)
├── vmbr3 : DMZ (10.1.30.0/24)
└── vmbr4 : INFRA (10.1.40.0/24)
```

### Utilité en cas de sinistre

| Scénario | Utilité du backup Proxmox |
|----------|---------------------------|
| **Crash SSD complet** | ⚠️ Limitée - Permet de recréer la structure mais pas les données |
| **Corruption config réseau** | ✅ Haute - Restauration rapide des bridges |
| **Perte config VM/CT** | ✅ Haute - Recréation rapide des définitions |
| **Réinstallation Proxmox** | ✅ Haute - Template de configuration complet |
| **Documentation/Audit** | ✅ Haute - Historique des modifications |

## Structure des Fichiers

### Arborescence mise à jour

```
/opt/protolab-configs/
├── palo-alto/
│   └── configs/
│       └── running-config_*.xml
├── active-directory/
│   └── exports/
│       └── YYYYMMDD_HHMMSS/
│           ├── users_*.csv
│           ├── groups_*.csv
│           ├── ous_*.csv
│           └── computers_*.csv
├── stack-logs/
│   └── otelcol/
│       └── config_*.yaml
├── proxmox/                          # NOUVEAU
│   └── configs/
│       └── proxmox-config_*.tar.gz   # Archive complète
└── scripts/
    ├── backup-palo-alto.sh
    ├── backup-ad-auto.sh
    ├── backup-stack-logs.sh
    ├── backup-proxmox.sh             # NOUVEAU
    ├── backup-local-copy.sh          # NOUVEAU
    ├── backup-usb-copy.sh            # À CRÉER
    └── backup-all.sh                 # MIS À JOUR
```

### Emplacement copie locale (Copie 2)

```
/var/lib/vz/backup/protolab-configs/
└── protolab-configs_YYYYMMDD_HHMMSS.tar.gz
```

**Contenu de l'archive** : Tout le répertoire `/opt/protolab-configs/` (sans `.git`)

## Scripts Ajoutés

### backup-proxmox.sh

**Chemin** : `/opt/protolab-configs/scripts/backup-proxmox.sh`

```bash
#!/bin/bash
# Backup configuration Proxmox VE
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/protolab-configs/proxmox/configs"
BACKUP_FILE="${BACKUP_DIR}/proxmox-config_${DATE}.tar.gz"

echo "[$(date)] Début backup Proxmox..."

# Créer un dossier temporaire
TMP_DIR=$(mktemp -d)

# Copier les configs importantes
echo "[$(date)] Collecte des configurations..."
mkdir -p ${TMP_DIR}/qemu-server ${TMP_DIR}/lxc
cp /etc/pve/qemu-server/*.conf ${TMP_DIR}/qemu-server/ 2>/dev/null
cp /etc/pve/lxc/*.conf ${TMP_DIR}/lxc/ 2>/dev/null
cp /etc/pve/storage.cfg ${TMP_DIR}/
cp /etc/pve/datacenter.cfg ${TMP_DIR}/
cp /etc/pve/user.cfg ${TMP_DIR}/
cp /etc/network/interfaces ${TMP_DIR}/

# Créer l'archive
echo "[$(date)] Création archive..."
tar -czf ${BACKUP_FILE} -C ${TMP_DIR} .

# Nettoyer
rm -rf ${TMP_DIR}

if [ -f "${BACKUP_FILE}" ]; then
    echo "[$(date)] ✓ Config Proxmox exportée: $(basename ${BACKUP_FILE})"
    
    # Rotation : garder les 10 derniers
    cd ${BACKUP_DIR}
    ls -t proxmox-config_*.tar.gz 2>/dev/null | tail -n +11 | xargs -r rm
    echo "[$(date)] ✓ Rotation effectuée (10 derniers conservés)"
else
    echo "[$(date)] ✗ Erreur backup Proxmox"
    exit 1
fi
```

**Taille archive** : ~2-3 KB  
**Rétention** : 10 derniers backups

### backup-local-copy.sh

**Chemin** : `/opt/protolab-configs/scripts/backup-local-copy.sh`

```bash
#!/bin/bash
# Copie locale des backups (règle 3-2-1 - copie 2)
DATE=$(date +%Y%m%d_%H%M%S)
SOURCE_DIR="/opt/protolab-configs"
LOCAL_BACKUP="/var/lib/vz/backup/protolab-configs"
BACKUP_FILE="${LOCAL_BACKUP}/protolab-configs_${DATE}.tar.gz"

echo "[$(date)] Début copie locale (règle 3-2-1)..."

# Créer l'archive de tout le repo (sans .git pour gagner de la place)
tar -czf ${BACKUP_FILE} \
    --exclude='.git' \
    -C /opt protolab-configs

if [ -f "${BACKUP_FILE}" ]; then
    SIZE=$(du -h ${BACKUP_FILE} | cut -f1)
    echo "[$(date)] ✓ Copie locale créée: $(basename ${BACKUP_FILE}) (${SIZE})"
    
    # Rotation : garder les 10 derniers
    cd ${LOCAL_BACKUP}
    ls -t protolab-configs_*.tar.gz 2>/dev/null | tail -n +11 | xargs -r rm
    echo "[$(date)] ✓ Rotation effectuée (10 derniers conservés)"
else
    echo "[$(date)] ✗ Erreur copie locale"
    exit 1
fi
```

**Taille archive** : ~150-200 KB  
**Rétention** : 10 derniers backups

### backup-all.sh (Mis à jour)

**Chemin** : `/opt/protolab-configs/scripts/backup-all.sh`

```bash
#!/bin/bash
# Orchestrateur backup complet Protolab (règle 3-2-1)
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

# 4. Backup Proxmox
${SCRIPT_DIR}/backup-proxmox.sh

# 5. Commit et push Git (Copie 1 - hors site GitHub)
echo "[$(date)] Push vers GitHub (copie 1 - hors site)..."
cd ${REPO_DIR}
git add .
git commit -m "Auto-backup $(date +%Y%m%d_%H%M%S)"
git push

# 6. Copie locale (Copie 2 - stockage local)
${SCRIPT_DIR}/backup-local-copy.sh

# 7. Copie USB (Copie 3 - support différent) - À activer plus tard
# ${SCRIPT_DIR}/backup-usb-copy.sh

echo "========================================"
echo "[$(date)] ✓ Backup 3-2-1 terminé"
echo "  → Copie 1 : GitHub (hors site)"
echo "  → Copie 2 : /var/lib/vz/backup/"
echo "  → Copie 3 : USB (à configurer)"
echo "========================================"
```

## Flux de Backup Complet

```
┌─────────────────────────────────────────────────────────────────┐
│                    SOURCES DE DONNÉES                           │
├─────────────────────────────────────────────────────────────────┤
│  PA-VM        DC01         Stack Logs      Proxmox             │
│  (API)        (SSH)        (SSH)           (local)             │
│    │            │             │               │                 │
└────┼────────────┼─────────────┼───────────────┼─────────────────┘
     │            │             │               │
     └────────────┴──────┬──────┴───────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   /opt/protolab-    │
              │      configs/       │
              │    (Git local)      │
              └──────────┬──────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  COPIE 1    │  │  COPIE 2    │  │  COPIE 3    │
│   GitHub    │  │ /var/lib/vz │  │  Clé USB    │
│  (Cloud)    │  │  /backup/   │  │  (Amovible) │
│             │  │             │  │             │
│  ✅ ACTIF   │  │  ✅ ACTIF   │  │  ⏳ PRÉVU   │
└─────────────┘  └─────────────┘  └─────────────┘
     │                  │                │
     │                  │                │
     ▼                  ▼                ▼
┌─────────────────────────────────────────────────┐
│              RÈGLE 3-2-1 RESPECTÉE              │
│  3 copies │ 2 supports │ 1 hors site            │
└─────────────────────────────────────────────────┘
```

## Séquence d'Exécution

**Déclenchement** : Cron quotidien à 13h00 ou exécution manuelle

```
13:00:00  Début backup-all.sh
    │
13:00:01  ├─ backup-palo-alto.sh
    │     │   └─ Export XML via API (backup-api)
    │     │   └─ ~100 KB
    │
13:00:03  ├─ backup-stack-logs.sh
    │     │   └─ SSH svc-backup@10.1.40.30
    │     │   └─ ~5 KB
    │
13:00:05  ├─ backup-ad-auto.sh
    │     │   └─ SSH svc-backup@10.1.10.10
    │     │   └─ PowerShell → CSV
    │     │   └─ ~50 KB
    │
13:00:10  ├─ backup-proxmox.sh          # NOUVEAU
    │     │   └─ Copie locale configs
    │     │   └─ ~3 KB
    │
13:00:12  ├─ git add + commit + push
    │     │   └─ → GitHub (Copie 1)
    │
13:00:15  ├─ backup-local-copy.sh       # NOUVEAU
    │     │   └─ tar.gz → /var/lib/vz/backup/
    │     │   └─ ~170 KB (Copie 2)
    │
13:00:16  └─ (backup-usb-copy.sh)       # À VENIR
              └─ → Clé USB (Copie 3)

13:00:17  Fin - Backup 3-2-1 terminé
```

## Métriques

### Espace disque utilisé

| Emplacement | Taille actuelle | Rétention | Projection 30 jours |
|-------------|-----------------|-----------|---------------------|
| `/opt/protolab-configs/` | ~5 MB | Historique Git complet | ~15 MB |
| `/var/lib/vz/backup/protolab-configs/` | ~170 KB | 10 derniers | ~1.7 MB max |
| GitHub | ~5 MB | Illimité | Croissance linéaire |
| Clé USB (prévu) | - | 10 derniers | ~1.7 MB max |

### Temps d'exécution

| Opération | Durée moyenne |
|-----------|---------------|
| Backup PA-VM | 2 secondes |
| Backup Stack Logs | 2 secondes |
| Backup AD | 5 secondes |
| Backup Proxmox | 1 seconde |
| Git push | 3 secondes |
| Copie locale | 1 seconde |
| **Total** | **~15 secondes** |

## Procédures de Restauration

### Restauration config Proxmox

**Depuis copie locale** :

```bash
# Lister les backups disponibles
ls -lht /var/lib/vz/backup/protolab-configs/

# Extraire une archive
cd /tmp
tar -xzf /var/lib/vz/backup/protolab-configs/protolab-configs_YYYYMMDD_HHMMSS.tar.gz

# Voir le contenu Proxmox
tar -tzf /tmp/protolab-configs/proxmox/configs/proxmox-config_*.tar.gz
```

**Restauration réseau** :

```bash
# Backup config actuelle
cp /etc/network/interfaces /etc/network/interfaces.bak

# Restaurer depuis backup
tar -xzf /tmp/protolab-config.tar.gz -C /tmp
cp /tmp/interfaces /etc/network/interfaces

# Appliquer
systemctl restart networking
# OU reboot si changements majeurs
```

**Restauration config VM/CT** :

```bash
# Extraire les configs
tar -xzf proxmox-config_*.tar.gz -C /tmp/restore/

# Copier une config VM
cp /tmp/restore/qemu-server/102.conf /etc/pve/qemu-server/

# Copier une config CT
cp /tmp/restore/lxc/201.conf /etc/pve/lxc/
```

### Restauration complète depuis GitHub

```bash
# Si le repo local est perdu
cd /opt
git clone git@github.com:AdrienNewman/protolab-configs.git

# Rendre les scripts exécutables
chmod +x /opt/protolab-configs/scripts/*.sh
```

## Évolutions Prévues

### Court terme (Copie 3 - Clé USB)

**Script à créer** : `backup-usb-copy.sh`

```bash
#!/bin/bash
# Copie USB des backups (règle 3-2-1 - copie 3)
USB_MOUNT="/mnt/usb-backup"
# ... À compléter lors du montage USB
```

**Prérequis** :
1. Clé USB formatée (ext4 ou exFAT)
2. Point de montage créé : `/mnt/usb-backup`
3. Montage automatique via `/etc/fstab` ou udev rules

### Moyen terme

| Amélioration | Description | Priorité |
|--------------|-------------|----------|
| Alerting | Email/Slack en cas d'échec backup | 🟡 Moyenne |
| Vérification intégrité | Checksum SHA256 des archives | 🟡 Moyenne |
| Chiffrement | GPG pour archives locales/USB | 🟢 Basse |
| Test restauration auto | Script de validation mensuel | 🟡 Moyenne |

## Validation

### Tests effectués

| Test | Résultat | Date |
|------|----------|------|
| Backup Proxmox unitaire | ✅ OK | 22/12/2025 16:05 |
| Copie locale unitaire | ✅ OK | 22/12/2025 16:08 |
| Backup complet 3-2-1 | ✅ OK | 22/12/2025 16:11 |
| Push GitHub | ✅ OK | 22/12/2025 16:11 |
| Contenu archive Proxmox | ✅ Complet (9 VMs/CTs) | 22/12/2025 16:05 |

### Vérification archives

```bash
# Archive Proxmox
tar -tzf /opt/protolab-configs/proxmox/configs/proxmox-config_20251222_160552.tar.gz
./
./interfaces
./user.cfg
./datacenter.cfg
./storage.cfg
./lxc/
./lxc/250.conf
./lxc/203.conf
./lxc/202.conf
./lxc/201.conf
./lxc/200.conf
./qemu-server/
./qemu-server/300.conf
./qemu-server/104.conf
./qemu-server/103.conf
./qemu-server/102.conf

# Archive copie locale
ls -lh /var/lib/vz/backup/protolab-configs/
-rw-rw-r-- 1 root root 172K Dec 22 16:11 protolab-configs_20251222_161105.tar.gz
```

## Changelog

| Version | Date | Modifications |
|---------|------|---------------|
| 1.0 | 22/12/2025 | Création solution backup initiale |
| 1.1 | 22/12/2025 | Ajout sécurisation moindre privilège |
| **1.2** | **22/12/2025** | **Ajout backup Proxmox + règle 3-2-1** |
