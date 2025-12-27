# Nettoyage Serveurs Dev - Procédure

## 🚨 SITUATION ACTUELLE

**6 serveurs Astro dev actifs simultanément**:

| Port  | PID   | Statut    |
|-------|-------|-----------|
| 4321  | 53576 | LISTENING |
| 4322  | 55624 | LISTENING |
| 4323  | 30048 | LISTENING |
| 4324  | 56252 | LISTENING |
| 4325  | 54672 | LISTENING |
| 4326  | 60488 | ACTIF ✅  |

**Port 4326 est celui actuellement utilisé** (connexion établie avec navigateur).

---

## ⚠️ PROBLÈME

Avoir 6 serveurs actifs:
- Consomme ~1.5 GB RAM inutilement
- Consomme CPU pour watch files (x6)
- Crée confusion sur quelle version on teste
- Risque de tester ancien serveur par erreur

---

## 🔧 SOLUTION

### Option 1: Arrêt manuel par PID (RECOMMANDÉ)

```powershell
# Arrêter les 5 anciens serveurs (garder 4326)
taskkill /F /PID 53576
taskkill /F /PID 55624
taskkill /F /PID 30048
taskkill /F /PID 56252
taskkill /F /PID 54672

# Vérifier qu'il ne reste que le port 4326
netstat -ano | findstr "4326"
```

### Option 2: Arrêt global et redémarrage (PLUS PROPRE)

```powershell
# 1. Arrêter TOUS les processus Node
taskkill /F /IM node.exe

# 2. Nettoyer cache Astro
cd "C:\Users\Beweb\Documents\Serveur Proxmox\PROTOLAB\Porte Folio\portefolio V3"
rd /s /q .astro

# 3. Relancer UN SEUL serveur
npm run dev
```

**Résultat attendu**: Serveur démarre sur port **4321** (le premier libre)

---

## ✅ VÉRIFICATION POST-NETTOYAGE

### 1. Vérifier ports
```powershell
netstat -ano | findstr "4321 4322 4323 4324 4325 4326"
```

**Attendu**: Une seule ligne (port 4321 en écoute)

### 2. Vérifier processus Node
```powershell
Get-Process node | Format-Table Id,CPU,WS -AutoSize
```

**Attendu**: 1-2 processus seulement (serveur dev + éventuellement autre app)

### 3. Tester site
```
http://localhost:4321/
```

**Vérifier**:
- ✅ Animation boot terminal
- ✅ CSS appliqué (couleurs neon)
- ✅ Modals fonctionnels
- ✅ Pas d'erreurs console

---

## 🎯 COMMANDES RAPIDES

### Voir tous les serveurs Astro actifs
```powershell
netstat -ano | findstr ":432"
```

### Tuer processus spécifique
```powershell
taskkill /F /PID <numéro_pid>
```

### Tuer tous les Node
```powershell
taskkill /F /IM node.exe
```

### Relancer dev proprement
```powershell
npm run dev
```

---

## 📊 ÉTAT MÉMOIRE

### Avant nettoyage (6 serveurs)
- Mémoire: ~1.5 GB
- CPU: ~15-20% (watch files x6)
- Ports: 4321-4326 occupés

### Après nettoyage (1 serveur)
- Mémoire: ~250 MB
- CPU: ~2-3% (watch files x1)
- Ports: 4321 seulement

**Économie**: ~1.25 GB RAM, ~15% CPU

---

## 🔄 PROCÉDURE RECOMMANDÉE

### Chaque fois que vous démarrez le dev server:

1. **Vérifier qu'aucun serveur n'est actif**:
   ```powershell
   netstat -ano | findstr ":432"
   ```

2. **Si des serveurs sont actifs, les arrêter**:
   ```powershell
   taskkill /F /IM node.exe
   ```

3. **Démarrer UN nouveau serveur**:
   ```powershell
   npm run dev
   ```

4. **Vérifier le port utilisé** (doit être 4321):
   ```
   Regarder la sortie console:
   ┃ Local    http://localhost:4321/
   ```

---

## 🚨 SI PROBLÈME APRÈS NETTOYAGE

### Serveur ne démarre pas
```powershell
# Nettoyer complètement
rd /s /q .astro node_modules
npm install
npm run dev
```

### Port toujours occupé
```powershell
# Trouver quel processus utilise le port
netstat -ano | findstr ":4321"
# Tuer le processus par PID
taskkill /F /PID <pid>
```

### CSS ne se charge toujours pas
```powershell
# Vérifier BaseLayout.astro ligne 3
cat src/layouts/BaseLayout.astro | Select-String "import.*global.css"
```

**Doit afficher**: `import '../styles/global.css';`

---

## 📝 NOTES

- Les PIDs changent à chaque redémarrage
- Toujours vérifier quel port le serveur utilise
- Ne jamais lancer `npm run dev` plusieurs fois sans arrêter le précédent
- Ctrl+C dans le terminal arrête proprement le serveur

---

**Dernière mise à jour**: 27/12/2024 19:10
**Référence**: [RESUME_SESSION_27122024.md](./RESUME_SESSION_27122024.md)
