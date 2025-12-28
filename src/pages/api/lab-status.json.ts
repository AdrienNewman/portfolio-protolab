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

interface LabStatusResponse {
  timestamp: string;
  status: 'online' | 'degraded' | 'offline';
  services: {
    id: string;
    name: string;
    status: 'up' | 'down' | 'unknown';
    uptime?: string;
  }[];
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

// Helper to query VictoriaMetrics
async function queryPrometheus(query: string): Promise<any> {
  const url = `${VICTORIA_METRICS_URL}/api/v1/query?query=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.data?.result || [];
  } catch (error) {
    console.error(`PromQL query failed: ${query}`, error);
    return [];
  }
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
    // Query all metrics in parallel
    // Filter for node/proxmox to get the hypervisor metrics (not individual VMs/CTs)
    const [
      upResult,
      cpuResult,
      memUsedResult,
      memTotalResult,
      diskUsedResult,
      diskTotalResult,
      uptimeResult,
      netInResult,
      netOutResult
    ] = await Promise.all([
      queryPrometheus('pve_up{job="proxmox",id="node/proxmox"}'),
      queryPrometheus('pve_cpu_usage_ratio{job="proxmox",id="node/proxmox"}'),
      queryPrometheus('pve_memory_usage_bytes{job="proxmox",id="node/proxmox"}'),
      queryPrometheus('pve_memory_size_bytes{job="proxmox",id="node/proxmox"}'),
      queryPrometheus('sum(pve_disk_usage_bytes{job="proxmox",id=~"storage/.*"})'),
      queryPrometheus('sum(pve_disk_size_bytes{job="proxmox",id=~"storage/.*"})'),
      queryPrometheus('pve_uptime_seconds{job="proxmox",id="node/proxmox"}'),
      queryPrometheus('sum(rate(pve_network_receive_bytes{job="proxmox"}[5m]))'),
      queryPrometheus('sum(rate(pve_network_transmit_bytes{job="proxmox"}[5m]))')
    ]);

    // Parse values
    const isUp = getFirstValue(upResult);
    const cpuRatio = getFirstValue(cpuResult);
    const memUsed = getFirstValue(memUsedResult);
    const memTotal = getFirstValue(memTotalResult);
    const diskUsed = getFirstValue(diskUsedResult);
    const diskTotal = getFirstValue(diskTotalResult);
    const uptimeSeconds = getFirstValue(uptimeResult);
    const netIn = getFirstValue(netInResult) || 0;
    const netOut = getFirstValue(netOutResult) || 0;

    // Calculate percentages
    const cpuPercent = cpuRatio !== null ? Math.round(cpuRatio * 100) : 0;
    const memPercent = (memUsed && memTotal) ? Math.round((memUsed / memTotal) * 100) : 0;
    const diskPercent = (diskUsed && diskTotal) ? Math.round((diskUsed / diskTotal) * 100) : 0;

    // Build services array
    const services = [
      {
        id: 'proxmox',
        name: 'Proxmox VE',
        status: isUp === 1 ? 'up' as const : 'down' as const,
        uptime: uptimeSeconds ? formatUptime(uptimeSeconds) : undefined
      },
      {
        id: 'paloalto',
        name: 'Palo Alto',
        status: 'unknown' as const // Not connected yet
      },
      {
        id: 'dc01',
        name: 'Windows DC01',
        status: 'unknown' as const // Not connected yet
      },
      {
        id: 'grafana',
        name: 'Grafana',
        status: 'unknown' as const // Could add ping check
      }
    ];

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
