import type { APIRoute } from 'astro';

// Enable server-side rendering for this route
export const prerender = false;

// VictoriaMetrics URL from environment
const VICTORIA_METRICS_URL = import.meta.env.VICTORIA_METRICS_URL || 'http://10.1.40.25:8428';

// Cache for rate limiting (60s)
let cache: { data: LabStatusResponse | null; timestamp: number } = {
  data: null,
  timestamp: 0
};
const CACHE_TTL = 60000; // 60 seconds

type ServiceCategory = 'management' | 'infrastructure' | 'services';

interface ServiceMetrics {
  id: string;
  name: string;
  type: 'node' | 'qemu' | 'lxc';
  category: ServiceCategory;
  status: 'up' | 'down' | 'unknown';
  uptime?: string;
  cpu?: number;      // percentage
  memory?: number;   // percentage
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

// Service configuration - Proxmox IDs mapping with categories
const SERVICE_CONFIG = [
  // MANAGEMENT
  { id: 'proxmox', name: 'Proxmox VE', type: 'node' as const, pveId: 'node/proxmox', category: 'management' as const },
  { id: 'paloalto', name: 'Palo Alto FW', type: 'qemu' as const, pveId: 'qemu/102', category: 'management' as const },

  // INFRASTRUCTURE
  { id: 'grafana', name: 'Grafana', type: 'lxc' as const, pveId: 'lxc/203', category: 'infrastructure' as const },
  { id: 'victorialogs', name: 'VictoriaLogs', type: 'lxc' as const, pveId: 'lxc/201', category: 'infrastructure' as const },
  { id: 'otelcol', name: 'OTel Collector', type: 'lxc' as const, pveId: 'lxc/202', category: 'infrastructure' as const },
  { id: 'controlplane', name: 'Control Plane', type: 'lxc' as const, pveId: 'lxc/220', category: 'infrastructure' as const },
  { id: 'minio', name: 'MinIO', type: 'lxc' as const, pveId: 'lxc/200', category: 'infrastructure' as const },

  // SERVICES
  { id: 'dc01', name: 'Windows DC01', type: 'qemu' as const, pveId: 'qemu/103', category: 'services' as const },
  { id: 'webgateway', name: 'Web Gateway', type: 'lxc' as const, pveId: 'lxc/210', category: 'services' as const },
];

// Helper to query VictoriaMetrics with retry
async function queryPrometheus(query: string): Promise<any> {
  const url = `${VICTORIA_METRICS_URL}/api/v1/query?query=${encodeURIComponent(query)}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.data?.result || [];
    } catch (error) {
      if (attempt === 1) {
        console.error(`PromQL query failed: ${query}`, error);
        return [];
      }
      await new Promise(r => setTimeout(r, 500));
    }
  }
  return [];
}

// Extract first numeric value from Prometheus result
function getFirstValue(result: any[]): number | null {
  if (result.length > 0 && result[0].value) {
    return parseFloat(result[0].value[1]);
  }
  return null;
}

// Format bytes to human readable
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Format uptime seconds to human readable
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}j ${hours}h`;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export const GET: APIRoute = async () => {
  // Check cache
  const now = Date.now();
  if (cache.data && (now - cache.timestamp) < CACHE_TTL) {
    return new Response(JSON.stringify({ ...cache.data, cached: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30'
      }
    });
  }

  try {
    // Build service IDs for batch queries
    const serviceIds = SERVICE_CONFIG.map(s => s.pveId);
    const serviceIdRegex = serviceIds.join('|');

    // Query all metrics in parallel - both global and per-service
    const [
      // Global Proxmox node metrics
      cpuResult,
      memUsedResult,
      memTotalResult,
      diskUsedResult,
      diskTotalResult,
      netInResult,
      netOutResult,
      // Per-service metrics (batch queries)
      allUpResults,
      allCpuResults,
      allMemUsedResults,
      allMemTotalResults,
      allUptimeResults
    ] = await Promise.all([
      // Global metrics for Proxmox node
      queryPrometheus('pve_cpu_usage_ratio{job="proxmox",id="node/proxmox"}'),
      queryPrometheus('pve_memory_usage_bytes{job="proxmox",id="node/proxmox"}'),
      queryPrometheus('pve_memory_size_bytes{job="proxmox",id="node/proxmox"}'),
      queryPrometheus('sum(pve_disk_usage_bytes{job="proxmox",id=~"storage/.*"})'),
      queryPrometheus('sum(pve_disk_size_bytes{job="proxmox",id=~"storage/.*"})'),
      queryPrometheus('sum(rate(pve_network_receive_bytes{job="proxmox"}[5m]))'),
      queryPrometheus('sum(rate(pve_network_transmit_bytes{job="proxmox"}[5m]))'),
      // Per-service batch queries
      queryPrometheus(`pve_up{job="proxmox",id=~"${serviceIdRegex}"}`),
      queryPrometheus(`pve_cpu_usage_ratio{job="proxmox",id=~"${serviceIdRegex}"}`),
      queryPrometheus(`pve_memory_usage_bytes{job="proxmox",id=~"${serviceIdRegex}"}`),
      queryPrometheus(`pve_memory_size_bytes{job="proxmox",id=~"${serviceIdRegex}"}`),
      queryPrometheus(`pve_uptime_seconds{job="proxmox",id=~"${serviceIdRegex}"}`)
    ]);

    // Helper to extract value by ID from batch results
    function getValueById(results: any[], targetId: string): number | null {
      const match = results.find(r => r.metric?.id === targetId);
      if (match?.value) {
        return parseFloat(match.value[1]);
      }
      return null;
    }

    // Parse global values
    const cpuRatio = getFirstValue(cpuResult);
    const memUsed = getFirstValue(memUsedResult);
    const memTotal = getFirstValue(memTotalResult);
    const diskUsed = getFirstValue(diskUsedResult);
    const diskTotal = getFirstValue(diskTotalResult);
    const netIn = getFirstValue(netInResult) || 0;
    const netOut = getFirstValue(netOutResult) || 0;

    // Calculate global percentages
    const cpuPercent = cpuRatio !== null ? Math.round(cpuRatio * 100) : 0;
    const memPercent = (memUsed && memTotal) ? Math.round((memUsed / memTotal) * 100) : 0;
    const diskPercent = (diskUsed && diskTotal) ? Math.round((diskUsed / diskTotal) * 100) : 0;

    // Build services array with individual metrics
    const services: ServiceMetrics[] = SERVICE_CONFIG.map(config => {
      const isUp = getValueById(allUpResults, config.pveId);
      const serviceCpu = getValueById(allCpuResults, config.pveId);
      const serviceMemUsed = getValueById(allMemUsedResults, config.pveId);
      const serviceMemTotal = getValueById(allMemTotalResults, config.pveId);
      const serviceUptime = getValueById(allUptimeResults, config.pveId);

      // Calculate memory percentage for this service
      // Cap at 100% because QEMU VMs can report usage > size due to overhead
      let memoryPercent: number | undefined;
      if (serviceMemUsed !== null && serviceMemTotal !== null && serviceMemTotal > 0) {
        memoryPercent = Math.min(100, Math.round((serviceMemUsed / serviceMemTotal) * 100));
      }

      return {
        id: config.id,
        name: config.name,
        type: config.type,
        category: config.category,
        status: isUp === 1 ? 'up' as const : (isUp === 0 ? 'down' as const : 'unknown' as const),
        uptime: serviceUptime ? formatUptime(serviceUptime) : undefined,
        cpu: serviceCpu !== null ? Math.round(serviceCpu * 100) : undefined,
        memory: memoryPercent
      };
    });

    // Determine overall status
    const upServices = services.filter(s => s.status === 'up').length;
    const totalConfigured = services.filter(s => s.status !== 'unknown').length;
    let overallStatus: 'online' | 'degraded' | 'offline' = 'offline';
    if (totalConfigured > 0) {
      if (upServices === totalConfigured) overallStatus = 'online';
      else if (upServices > 0) overallStatus = 'degraded';
    }

    const response: LabStatusResponse = {
      timestamp: new Date().toISOString(),
      status: overallStatus,
      services,
      resources: {
        cpu: { percent: cpuPercent },
        memory: {
          percent: memPercent,
          usedGB: memUsed ? Math.round(memUsed / 1073741824 * 10) / 10 : undefined,
          totalGB: memTotal ? Math.round(memTotal / 1073741824 * 10) / 10 : undefined
        },
        disk: {
          percent: diskPercent,
          usedTB: diskUsed ? Math.round(diskUsed / 1099511627776 * 100) / 100 : undefined,
          totalTB: diskTotal ? Math.round(diskTotal / 1099511627776 * 100) / 100 : undefined
        }
      },
      network: {
        inbound: { bytesPerSec: Math.round(netIn), formatted: formatBytes(netIn) },
        outbound: { bytesPerSec: Math.round(netOut), formatted: formatBytes(netOut) }
      },
      cached: false
    };

    // Update cache
    cache = { data: response, timestamp: now };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30'
      }
    });

  } catch (error) {
    console.error('Lab status API error:', error);

    // Return cached data if available, otherwise error
    if (cache.data) {
      return new Response(JSON.stringify({ ...cache.data, cached: true, stale: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      timestamp: new Date().toISOString(),
      status: 'offline',
      services: [],
      resources: { cpu: { percent: 0 }, memory: { percent: 0 }, disk: { percent: 0 } },
      network: { inbound: { bytesPerSec: 0, formatted: '--' }, outbound: { bytesPerSec: 0, formatted: '--' } },
      cached: false,
      error: 'Unable to fetch metrics'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
