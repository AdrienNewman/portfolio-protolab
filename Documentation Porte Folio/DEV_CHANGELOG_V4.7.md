# Changelog V4.7 - Section LIVE_LAB & Dashboard Temps Réel

## RESUME

**Version**: V4.7 → V4.7.1
**Date**: 28 décembre 2025
**Titre**: Section LIVE_LAB - Monitoring infrastructure Protolab en temps réel

---

## NOUVEAUTES

### 1. Section LIVE_LAB

Nouvelle section "preuve par le code" positionnée entre Projects et Documentation. Affiche en temps réel les métriques de l'infrastructure Protolab.

**Contenu affiché:**

- Status global (ONLINE / DEGRADED / OFFLINE)
- Services cards (Proxmox, Palo Alto, DC01, Grafana) avec métriques individuelles
- Métriques CPU, RAM par service (V4.7.1)
- Métriques CPU, RAM, Disk globales avec barres de progression
- Trafic réseau IN/OUT en temps réel
- Timestamp de dernière mise à jour

### 2. API Endpoint SSR

Nouvel endpoint `/api/lab-status.json` qui query VictoriaMetrics via PromQL.

**Caractéristiques:**

- Server-Side Rendering avec `prerender = false`
- Cache serveur 60 secondes
- Queries parallèles pour performance (batch queries V4.7.1)
- Fallback gracieux si VictoriaMetrics indisponible
- Métriques individuelles par service via regex PromQL (V4.7.1)

### 3. Client Polling

Script `lab-status.js` pour mise à jour automatique de l'UI.

**Fonctionnalités:**

- Polling toutes les 30 secondes
- Pause quand page non visible
- Animations de transition sur les valeurs
- Indicateurs de couleur selon les seuils (vert < 75% < jaune < 90% < rouge)

---

## FICHIERS CREES

| Fichier | Description |
|---------|-------------|
| `.env` | Variables d'environnement VictoriaMetrics |
| `src/pages/api/lab-status.json.ts` | API endpoint SSR |
| `src/components/sections/LiveLab.astro` | Composant section complète |
| `public/scripts/lab-status.js` | Script client polling |

---

## FICHIERS MODIFIES

| Fichier | Modification |
|---------|--------------|
| `astro.config.mjs` | Ajout adapter @astrojs/node |
| `package.json` | Dépendance @astrojs/node |
| `src/pages/index.astro` | Import LiveLab |
| `src/layouts/BaseLayout.astro` | Script lab-status.js |

---

## DETAILS TECHNIQUES

### Queries PromQL utilisées

```promql
# Status Proxmox
pve_up{job="proxmox",id="node/proxmox"}

# CPU (ratio 0-1)
pve_cpu_usage_ratio{job="proxmox",id="node/proxmox"}

# Mémoire
pve_memory_usage_bytes{job="proxmox",id="node/proxmox"}
pve_memory_size_bytes{job="proxmox",id="node/proxmox"}

# Disque (tous les storages)
sum(pve_disk_usage_bytes{job="proxmox",id=~"storage/.*"})
sum(pve_disk_size_bytes{job="proxmox",id=~"storage/.*"})

# Réseau (rate 5 minutes, toutes VMs/CTs)
sum(rate(pve_network_receive_bytes{job="proxmox"}[5m]))
sum(rate(pve_network_transmit_bytes{job="proxmox"}[5m]))

# Uptime
pve_uptime_seconds{job="proxmox",id="node/proxmox"}

# V4.7.1 - Batch queries par service
pve_up{job="proxmox",id=~"node/proxmox|qemu/102|qemu/103|lxc/203"}
pve_cpu_usage_ratio{job="proxmox",id=~"node/proxmox|qemu/102|qemu/103|lxc/203"}
pve_memory_usage_bytes{job="proxmox",id=~"node/proxmox|qemu/102|qemu/103|lxc/203"}
pve_memory_size_bytes{job="proxmox",id=~"node/proxmox|qemu/102|qemu/103|lxc/203"}
pve_uptime_seconds{job="proxmox",id=~"node/proxmox|qemu/102|qemu/103|lxc/203"}
```

### Mapping des services (V4.7.1)

| Service      | Proxmox ID     | Type |
|--------------|----------------|------|
| Proxmox VE   | `node/proxmox` | node |
| Palo Alto FW | `qemu/102`     | qemu |
| Windows DC01 | `qemu/103`     | qemu |
| Grafana OSS  | `lxc/203`      | lxc  |

### Structure de réponse API

```typescript
interface ServiceMetrics {
  id: string;
  name: string;
  type: 'node' | 'qemu' | 'lxc';  // V4.7.1
  status: 'up' | 'down' | 'unknown';
  uptime?: string;
  cpu?: number;      // V4.7.1 - percentage
  memory?: number;   // V4.7.1 - percentage
}

interface LabStatusResponse {
  timestamp: string;
  status: 'online' | 'degraded' | 'offline';
  services: ServiceMetrics[];
  resources: {
    cpu: { percent: number };
    memory: { percent: number; usedGB?: number; totalGB?: number };
    disk: { percent: number; usedTB?: number; totalTB?: number };
  };
  network: {
    inbound: { bytesPerSec: number; formatted: string };
    outbound: { bytesPerSec: number; formatted: string };
  };
  cached: boolean;
}
```

### Configuration Astro

```javascript
// astro.config.mjs
import node from '@astrojs/node';

export default defineConfig({
  output: 'static',
  adapter: node({ mode: 'standalone' }),
});
```

---

## STYLE UI

- **Bordures**: `2px solid var(--neon-cyan)`
- **Status dot**: Animation pulse + glow
- **Barres de progression**: Gradient cyan → jaune → magenta selon %
- **Cards hover**: translateY(-3px) + box-shadow
- **Font valeurs**: JetBrains Mono

---

## TESTS EFFECTUES

- [x] API retourne les métriques correctes
- [x] Status Proxmox = "up" quand node actif
- [x] CPU, RAM, Disk affichent les bonnes valeurs
- [x] Network affiche le débit formaté (KB/s, MB/s)
- [x] Uptime formaté en jours/heures
- [x] Polling fonctionne toutes les 30s
- [x] Fallback offline si VictoriaMetrics down
- [x] V4.7.1: CPU/RAM individuels par service (Proxmox, Palo Alto, DC01, Grafana)
- [x] V4.7.1: Memory cappée à 100% pour VMs QEMU (évite valeurs aberrantes)
- [x] V4.7.1: Indicateurs couleur sur métriques services (warning/critical)

---

## BREAKING CHANGES

**Déploiement**: Le build nécessite maintenant un serveur Node.js (adapter @astrojs/node) au lieu d'un simple serveur statique Nginx.

**Alternative**: Pour un déploiement 100% statique, créer un microservice séparé pour l'API.

---

## PROCHAINES ETAPES

- [x] ~~Ajouter métriques Palo Alto~~ (V4.7.1 - via Proxmox Exporter)
- [x] ~~Ajouter métriques Windows DC01~~ (V4.7.1 - via Proxmox Exporter)
- [ ] Métriques RAM réelle (Windows Exporter / Node Exporter / QEMU Guest Agent)
- [ ] Chatbot ARIA (Ollama)
- [ ] Terminal interactif
- [ ] Log viewer VictoriaLogs

---

## COMMITS PRECEDENTS

- V4.6: Section Certifications avec badge Cisco
- V4.5: Accessibilité WCAG 2.1
- V4.4: NetDefender boss system

---

**Document créé le**: 28/12/2025
**Dernière MAJ**: 28/12/2025 (V4.7.1)
**Statut**: COMPLETE
