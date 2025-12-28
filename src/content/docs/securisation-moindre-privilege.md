---
title: "Fiche d'Activité - Sécurisation Moindre Privilège"
description: "Application du principe du moindre privilège aux comptes de backup : création de comptes dédiés restreints sur PA-VM (API export), Active Directory (lecture seule) et Linux (sans sudo) pour réduire la surface d'attaque"
category: documentation
date: 2025-12-22
tags:
  - security
  - paloalto
  - windows
  - linux
  - best-practices
  - active-directory
author: Adrien Mercadier
difficulty: intermediate
featured: true
---

# Fiche d'Activité - Sécurisation Moindre Privilège

**Candidat** : Adrien Mercadier  
**Formation** : Technicien Supérieur Systèmes et Réseaux (TSSR)  
**Durée du projet** : 2 heures  
**Lieu** : Infrastructure Protolab (environnement de formation)

## Contexte et Objectifs

### Contexte de l'activité

Suite à la mise en place d'une solution de backup automatisée pour l'infrastructure Protolab, j'ai identifié une vulnérabilité de sécurité : les comptes utilisés pour les sauvegardes disposaient de **privilèges excessifs**.

**Situation initiale problématique** :

| Équipement | Compte utilisé | Privilèges | Risque |
|------------|----------------|------------|--------|
| PA-VM (Firewall) | `admin` | Superuser complet | Modification/suppression config firewall |
| DC01 (Active Directory) | `Administrateur` | Domain Admin | Contrôle total du domaine AD |
| CT 202 (Stack Logs) | `adminprotolab` | Membre sudo | Accès root au conteneur |

**Important** : Si les clés API ou SSH utilisées par les scripts de backup étaient compromises, un attaquant aurait pu :
- Modifier les règles de sécurité du firewall
- Créer des comptes administrateurs AD
- Prendre le contrôle complet de l'infrastructure

### Objectifs du projet

**Objectif principal** :
Appliquer le **principe du moindre privilège** (Least Privilege) en créant des comptes dédiés avec uniquement les droits nécessaires aux opérations de backup.

**Objectifs spécifiques** :
1. Créer un profil Admin Role restreint sur PA-VM (export config uniquement)
2. Créer un compte de service AD avec droits de lecture uniquement
3. Créer un utilisateur Linux sans privilèges sudo sur CT 202
4. Mettre à jour les scripts pour utiliser ces nouveaux comptes
5. Valider que les backups fonctionnent toujours

**Critères de réussite** :
- ✅ Comptes de backup avec droits minimaux
- ✅ Aucune capacité de modification sur les systèmes cibles
- ✅ Scripts de backup fonctionnels avec les nouveaux comptes
- ✅ Documentation à jour

## Compétences Mobilisées

### Compétences techniques

| Compétence | Mise en œuvre | Niveau |
|------------|---------------|--------|
| **Sécurité - Principe moindre privilège** | Conception matrice des droits, création comptes restreints | ⭐⭐⭐ |
| **Administration Palo Alto** | Création Admin Role Profile, gestion utilisateurs API | ⭐⭐⭐ |
| **Administration Active Directory** | Création compte de service, gestion OU, permissions AD | ⭐⭐⭐ |
| **Administration Linux** | Gestion utilisateurs, groupes, permissions SSH | ⭐⭐⭐ |
| **Scripting Bash** | Modification scripts, paramétrage SSH | ⭐⭐ |
| **Troubleshooting** | Résolution problèmes permissions Windows/SSH | ⭐⭐⭐ |

### Compétences transversales

- **Analyse de risques** : Identification des vulnérabilités liées aux privilèges excessifs
- **Méthodologie** : Approche systématique équipement par équipement
- **Documentation** : Mise à jour documentation technique avec nouvelles configurations
- **Tests et validation** : Vérification fonctionnement après chaque modification

## Déroulement de l'Activité

### Phase 1 : Analyse et conception (20 min)

**Actions réalisées** :

**Important** : Inventaire des accès existants :
- Identification des comptes utilisés par les scripts
- Analyse des privilèges de chaque compte
- Évaluation du risque en cas de compromission

**Conception de la matrice des droits** :

| Équipement | Opération backup | Droits nécessaires | Droits à supprimer |
|------------|------------------|--------------------|--------------------|
| PA-VM | Export config XML | API Export + Config Read | Commit, Import, Web UI, CLI |
| DC01 | Get-ADUser/Group/OU | Lecture objets AD | Domain Admin, modification AD |
| CT 202 | cat config.yaml | Lecture fichier | sudo, modification système |

**Planification des étapes** :
- Ordre : PA-VM → DC01 → CT 202 (du plus critique au moins critique)
- Test après chaque modification

**Résultats** :
- Matrice des droits validée
- Plan d'action défini
- Risques identifiés et mitigations prévues

### Phase 2 : Sécurisation PA-VM (30 min)

**Actions réalisées** :

**Création du profil Admin Role** :

**Chemin** : `Device` → `Admin Roles` → `Add`

```
Nom : API-Backup
Description : Profil lecture seule pour backup automatisé

Onglet XML API :
├── Configuration : Enable
├── Export : Enable
└── Tout le reste : Disable

Autres onglets :
├── Web UI : Tout Disable
├── REST API : Tout Disable
├── Command Line : None
└── Plugins : Disable
```

**Création de l'utilisateur dédié** :

**Chemin** : `Device` → `Administrators` → `Add`

```
Name : backup-api
Authentication Profile : None
Password : [mot de passe robuste généré]
Administrator Type : Role Based
Profile : API-Backup
```

**Génération nouvelle clé API** :

```bash
curl -k "https://192.168.1.37/api/?type=keygen&user=backup-api&password=MOT_DE_PASSE"
```

**Configuration** : Mise à jour credentials :

```bash
nano /root/.protolab_creds
# Remplacer PA_API_KEY par la nouvelle clé
```

**Test de validation** :

```bash
source /root/.protolab_creds
curl -k "https://192.168.1.37/api/?type=export&category=configuration&key=${PA_API_KEY}" | head -20
# Résultat : XML de configuration affiché ✓
```

**Difficultés rencontrées** :

**Symptôme** : Caractères spéciaux dans le mot de passe causaient des erreurs d'encodage URL.

**Solution** : Utiliser un mot de passe sans caractères problématiques (`%`, `^`, `&`).

**Résultats** :
- ✅ Profil `API-Backup` créé avec droits minimaux
- ✅ Utilisateur `backup-api` opérationnel
- ✅ Script de backup PA-VM fonctionnel

### Phase 3 : Sécurisation DC01 - Active Directory (45 min)

**Actions réalisées** :

**Création du compte de service AD** :

```powershell
New-ADUser -Name "svc-backup" `
  -SamAccountName "svc-backup" `
  -UserPrincipalName "svc-backup@protolab.local" `
  -Path "OU=Service-Accounts,OU=Users-protolab,DC=protolab,DC=local" `
  -Description "Compte de service pour backup AD (lecture seule)" `
  -PasswordNeverExpires $true `
  -CannotChangePassword $true `
  -Enabled $true `
  -AccountPassword (Read-Host -AsSecureString "Mot de passe")
```

**Vérification des droits de lecture AD** :

**Important** : Par défaut, tout utilisateur AD authentifié peut lire les objets.

**Test** :

```powershell
$cred = Get-Credential -UserName "PROTOLAB\svc-backup"
Get-ADUser -Filter * -Credential $cred | Select-Object -First 3 Name
# Résultat : Liste des 3 premiers utilisateurs ✓
```

**Configuration SSH pour svc-backup** :

```powershell
# Créer le dossier .ssh
New-Item -Path "C:\Users\svc-backup\.ssh" -ItemType Directory -Force

# Copier la clé publique
Set-Content -Path "C:\Users\svc-backup\.ssh\authorized_keys" `
  -Value "ssh-ed25519 AAAAC3Nza... proxmox-protolab-backup"

# Configurer le propriétaire (CRITIQUE pour OpenSSH Windows)
$acl = Get-Acl "C:\Users\svc-backup\.ssh\authorized_keys"
$acl.SetOwner([System.Security.Principal.NTAccount]"PROTOLAB\svc-backup")
Set-Acl "C:\Users\svc-backup\.ssh\authorized_keys" $acl

# Configurer les permissions
icacls "C:\Users\svc-backup\.ssh\authorized_keys" /inheritance:r
icacls "C:\Users\svc-backup\.ssh\authorized_keys" /grant "PROTOLAB\svc-backup:(R)"
icacls "C:\Users\svc-backup\.ssh\authorized_keys" /grant "SYSTEM:(F)"
```

**Mise à jour du script backup-ad-auto.sh** :

```bash
# Avant
ssh Administrateur@10.1.10.10 "powershell.exe..."
scp Administrateur@10.1.10.10:"C:/Temp/AD-Export/*.csv"...

# Après
ssh -i ~/.ssh/id_protolab svc-backup@10.1.10.10 "powershell.exe..."
scp -i ~/.ssh/id_protolab svc-backup@10.1.10.10:"C:/Temp/AD-Export/*.csv"...
```

**Difficultés rencontrées** :

**Symptôme** : Erreur "relation d'approbation" lors de la configuration des permissions.

**Root cause** : Le compte svc-backup n'avait jamais ouvert de session.

**Solution** : Connexion SSH avec mot de passe une première fois pour créer le profil.

**Symptôme** : SSH demandait le mot de passe malgré la clé.

**Root cause** : Propriétaire du fichier authorized_keys incorrect (BUILTIN\Administrateurs).

**Solution** : Utiliser `SetOwner()` PowerShell pour définir PROTOLAB\svc-backup comme propriétaire.

**Résultats** :
- ✅ Compte de service `svc-backup` créé dans OU Service-Accounts
- ✅ Droits limités à la lecture AD uniquement
- ✅ Authentification SSH par clé fonctionnelle
- ✅ Script de backup AD mis à jour et testé

### Phase 4 : Sécurisation CT 202 - Linux (30 min)

**Actions réalisées** :

**Création utilisateur Linux sans sudo** :

```bash
# Sur CT 202
sudo adduser svc-backup
# Définir mot de passe (pour première connexion)

# NE PAS ajouter au groupe sudo
# Vérifier
id svc-backup
# uid=1001(svc-backup) gid=1001(svc-backup) groups=1001(svc-backup)
```

**Configuration SSH** :

```bash
# Créer dossier SSH
sudo mkdir -p /home/svc-backup/.ssh

# Copier clé publique
sudo cp /root/.ssh/authorized_keys /home/svc-backup/.ssh/

# Permissions correctes
sudo chown -R svc-backup:svc-backup /home/svc-backup/.ssh
sudo chmod 700 /home/svc-backup/.ssh
sudo chmod 600 /home/svc-backup/.ssh/authorized_keys
```

**Test connexion SSH** :

```bash
# Depuis Proxmox
ssh -i ~/.ssh/id_protolab svc-backup@10.1.40.30

# Vérifier droits limités
sudo ls
# [sudo] password for svc-backup: ← Demande mot de passe
# svc-backup is not in the sudoers file. ✓
```

**Mise à jour script backup-stack-logs.sh** :

```bash
# Avant
ssh -i ~/.ssh/id_protolab adminprotolab@10.1.40.30 "cat /etc/otelcol/config.yaml"

# Après
ssh -i ~/.ssh/id_protolab svc-backup@10.1.40.30 "cat /etc/otelcol/config.yaml"
```

**Résultats** :
- ✅ Utilisateur `svc-backup` créé sans privilèges sudo
- ✅ Accès SSH par clé configuré
- ✅ Script de backup stack logs fonctionnel

### Phase 5 : Tests et validation finale (15 min)

**Tests effectués** :

**Test 1 : Backup complet** :

```bash
/opt/protolab-configs/scripts/backup-all.sh
# Résultat : ✓ Tous les backups réussis
```

**Test 2 : Vérification commits Git** :

```bash
cd /opt/protolab-configs
git log --oneline -5
# Résultat : ✓ Commits backup présents
```

**Test 3 : Vérification GitHub** :

```bash
# Ouvrir : https://github.com/AdrienNewman/protolab-configs
# Résultat : ✓ Derniers fichiers backupés présents
```

**Résultats** :
- ✅ Backup PA-VM : fonctionnel
- ✅ Backup AD : fonctionnel
- ✅ Backup Stack Logs : fonctionnel
- ✅ Aucune régression détectée

## Résultats et Bilan

### Comparaison avant/après

| Aspect | Avant | Après |
|--------|-------|-------|
| **Compte PA-VM** | `admin` (superuser) | `backup-api` (export only) |
| **Compte DC01** | `Administrateur` (Domain Admin) | `svc-backup` (lecture AD) |
| **Compte CT 202** | `adminprotolab` (sudo) | `svc-backup` (sans sudo) |
| **Risque si clé compromise** | Contrôle total infrastructure | Lecture configs uniquement |

### Matrice des risques

**Avant sécurisation** :

| Clé compromise | Impact potentiel | Gravité |
|----------------|------------------|---------|
| Clé API PA-VM | Modification règles firewall, création backdoors | 🔴 CRITIQUE |
| Clé SSH DC01 | Création comptes admin, compromission domaine | 🔴 CRITIQUE |
| Clé SSH CT 202 | Accès root, pivot vers autres systèmes | 🟠 ÉLEVÉ |

**Après sécurisation** :

| Clé compromise | Impact potentiel | Gravité |
|----------------|------------------|---------|
| Clé API PA-VM | Lecture configuration (info reconnaissance) | 🟡 MODÉRÉ |
| Clé SSH DC01 | Lecture structure AD (info reconnaissance) | 🟡 MODÉRÉ |
| Clé SSH CT 202 | Lecture config OTel (info limitée) | 🟢 FAIBLE |

### Livrables produits

| Livrable | Description |
|----------|-------------|
| Profil `API-Backup` | Admin Role PA-VM avec droits export uniquement |
| Utilisateur `backup-api` | Compte PA-VM associé au profil |
| Compte `svc-backup` (AD) | Compte de service domaine lecture seule |
| Utilisateur `svc-backup` (Linux) | Compte CT 202 sans privilèges sudo |
| Scripts mis à jour | backup-ad-auto.sh, backup-stack-logs.sh |
| Documentation V1.1 | Section sécurité mise à jour |

## Contribution aux Compétences TSSR

### Bloc 2 : Administration et sécurisation des éléments de l'infrastructure

**C2.1 - Administrer et sécuriser les ressources matérielles**
- ✅ Gestion des comptes à privilèges sur firewall
- ✅ Configuration permissions fichiers Windows et Linux

**C2.2 - Administrer et sécuriser l'infrastructure réseau**
- ✅ Création profil Admin Role Palo Alto avec droits minimaux
- ✅ Gestion clés API avec principe moindre privilège

**C2.3 - Administrer et sécuriser les services réseau**
- ✅ Configuration SSH avec comptes dédiés
- ✅ Gestion permissions authorized_keys Windows Server

**C2.4 - Administrer et sécuriser un annuaire**
- ✅ Création compte de service AD dans OU dédiée
- ✅ Application droits lecture seule sur objets AD

**C2.5 - Automatiser des tâches à l'aide de scripts**
- ✅ Modification scripts Bash pour nouveaux comptes
- ✅ Paramétrage options SSH (-i pour clé spécifique)

## Preuves de Réalisation

### Preuve 1 : Profil Admin Role PA-VM

```
Device > Admin Roles > API-Backup

XML API:
├── Configuration: Enable ✓
├── Export: Enable ✓
├── Report: Disable
├── Log: Disable
├── Operational Requests: Disable
├── Commit: Disable
├── User-ID Agent: Disable
├── IoT Agent: Disable
└── Import: Disable

Web UI: All Disable
REST API: All Disable
Command Line: None
```

### Preuve 2 : Compte svc-backup AD

```powershell
PS> Get-ADUser svc-backup -Properties *

DistinguishedName : CN=svc-backup,OU=Service-Accounts,OU=Users-protolab,DC=protolab,DC=local
Enabled           : True
Name              : svc-backup
SamAccountName    : svc-backup
UserPrincipalName : svc-backup@protolab.local
Description       : Compte de service pour backup AD (lecture seule)
PasswordNeverExpires : True
```

### Preuve 3 : Utilisateur svc-backup CT 202

```bash
root@otel-collector:~# id svc-backup
uid=1001(svc-backup) gid=1001(svc-backup) groups=1001(svc-backup)
# Pas de groupe sudo ✓

root@otel-collector:~# grep svc-backup /etc/passwd
svc-backup:x:1001:1001:Compte backup lecture seule:/home/svc-backup:/bin/bash
```

### Preuve 4 : Backup fonctionnel

```bash
root@proxmox:~# /opt/protolab-configs/scripts/backup-all.sh
========================================
[Sun Dec 22 16:45:01 CET 2025] Début backup automatique
========================================
[Sun Dec 22 16:45:02 CET 2025] ✓ Config exportée: running-config_20251222_164501.xml
[Sun Dec 22 16:45:05 CET 2025] ✓ OTel Collector config sauvegardée
[Sun Dec 22 16:45:08 CET 2025] ✓ Export AD terminé sur DC01
[Sun Dec 22 16:45:12 CET 2025] ✓ CSV récupérés
[Sun Dec 22 16:45:15 CET 2025] ✓ Backup terminé
========================================
```

## Conclusion

### Atteinte des objectifs

| Objectif | Statut | Commentaire |
|----------|--------|-------------|
| Profil restreint PA-VM | ✅ | API-Backup avec export/config read only |
| Compte service AD lecture seule | ✅ | svc-backup sans droits admin |
| Utilisateur Linux sans sudo | ✅ | svc-backup sur CT 202 |
| Scripts mis à jour | ✅ | Utilisation nouveaux comptes |
| Backups fonctionnels | ✅ | Test complet validé |

### Valeur ajoutée

**Pour la sécurité de l'infrastructure** :
- Réduction drastique de la surface d'attaque
- Conformité au principe de moindre privilège (best practice ANSSI)
- Limitation des dégâts en cas de compromission de clé

**Pour ma formation** :
- Maîtrise création Admin Roles Palo Alto
- Expérience gestion comptes de service AD
- Compréhension approfondie permissions SSH Windows vs Linux
- Méthodologie de sécurisation d'infrastructure

### Difficultés surmontées

**Difficulté 1 : Permissions SSH Windows Server**

**Symptôme** : OpenSSH Windows très strict sur ownership.

**Solution** : SetOwner() PowerShell pour définir le bon propriétaire.

**Difficulté 2 : Résolution SID compte de service AD**

**Symptôme** : Erreur "relation d'approbation" avant première connexion.

**Solution** : Connexion initiale par mot de passe pour créer le profil.

**Difficulté 3 : Encodage URL caractères spéciaux**

**Symptôme** : Caractères `%`, `^` dans mot de passe causaient erreurs.

**Solution** : Utiliser mots de passe sans caractères problématiques.

### Perspectives d'amélioration

1. **Rotation automatique des clés API** (planifiée)
2. **Alerting en cas d'échec de backup** (email/Slack)
3. **Audit des accès** via logs PA-VM et Windows Security
4. **Chiffrement des credentials** avec Ansible Vault ou git-crypt

## Références

- **ANSSI** : Guide d'hygiène informatique - Principe du moindre privilège
- **Palo Alto** : Configure an Admin Role Profile (https://docs.paloaltonetworks.com)
- **Microsoft** : Active Directory Service Accounts Best Practices
- **OpenSSH** : Windows Server SSH Key Authentication
