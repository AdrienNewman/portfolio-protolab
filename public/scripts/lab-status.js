/**
 * Lab Status - Real-time infrastructure monitoring
 * Polls /api/lab-status.json and updates the LiveLab UI
 */
(function() {
    'use strict';

    const CONFIG = {
        endpoint: '/api/lab-status.json',
        pollInterval: 30000,  // 30 seconds
        timeout: 10000,       // 10 seconds
        retryDelay: 5000      // 5 seconds on error
    };

    // DOM element references
    const elements = {
        statusIndicator: null,
        statusText: null,
        timestamp: null,
        services: null,
        offline: null,
        meters: {},
        network: {}
    };

    let pollTimer = null;
    let isVisible = true;

    /**
     * Initialize DOM references
     */
    function initElements() {
        elements.statusIndicator = document.querySelector('[data-lab-status]');
        elements.statusText = document.querySelector('[data-lab-status] .status-text');
        elements.timestamp = document.querySelector('[data-lab-timestamp]');
        elements.services = document.querySelector('[data-lab-services]');
        elements.offline = document.querySelector('[data-lab-offline]');

        // Resource meters
        ['cpu', 'memory', 'disk'].forEach(resource => {
            const meter = document.querySelector(`[data-resource="${resource}"]`);
            if (meter) {
                elements.meters[resource] = {
                    container: meter,
                    value: meter.querySelector('[data-value]'),
                    fill: meter.querySelector('.meter-fill'),
                    detail: meter.querySelector('[data-detail]')
                };
            }
        });

        // Network stats
        elements.network.inbound = document.querySelector('[data-net-in]');
        elements.network.outbound = document.querySelector('[data-net-out]');
    }

    /**
     * Fetch status with timeout
     */
    async function fetchStatus() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

        try {
            const response = await fetch(CONFIG.endpoint, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            updateUI(data);
            hideOffline();
            return true;

        } catch (error) {
            clearTimeout(timeoutId);
            console.warn('Lab status fetch failed:', error.message);
            showOffline();
            return false;
        }
    }

    /**
     * Update all UI elements with new data
     */
    function updateUI(data) {
        updateGlobalStatus(data.status);
        updateServices(data.services);
        updateResources(data.resources);
        updateNetwork(data.network);
        updateTimestamp(data.timestamp);
    }

    /**
     * Update global status indicator
     */
    function updateGlobalStatus(status) {
        if (!elements.statusIndicator) return;

        elements.statusIndicator.setAttribute('data-status', status);

        const statusTexts = {
            online: 'ONLINE',
            degraded: 'DEGRADED',
            offline: 'OFFLINE'
        };

        if (elements.statusText) {
            elements.statusText.textContent = statusTexts[status] || 'UNKNOWN';
        }
    }

    /**
     * Update service cards
     */
    function updateServices(services) {
        if (!elements.services || !services) return;

        services.forEach(service => {
            const card = elements.services.querySelector(`[data-service="${service.id}"]`);
            if (!card) return;

            // Update active state
            card.setAttribute('data-active', service.status === 'up' ? 'true' : 'false');

            // Update status text
            const statusEl = card.querySelector('.service-status');
            if (statusEl) {
                statusEl.setAttribute('data-status', service.status);
                const statusTexts = {
                    up: 'ONLINE',
                    down: 'OFFLINE',
                    unknown: 'N/A'
                };
                statusEl.textContent = statusTexts[service.status] || '--';
            }

            // Update uptime
            const uptimeEl = card.querySelector('.service-uptime');
            if (uptimeEl) {
                uptimeEl.textContent = service.uptime || '--';
            }

            // Update CPU metric
            const cpuEl = card.querySelector('[data-cpu]');
            if (cpuEl && service.cpu !== undefined) {
                cpuEl.textContent = `${service.cpu}%`;
                updateMetricColor(cpuEl, service.cpu);
            } else if (cpuEl) {
                cpuEl.textContent = '--%';
                cpuEl.classList.remove('warning', 'critical');
            }

            // Update Memory metric
            const memEl = card.querySelector('[data-memory]');
            if (memEl && service.memory !== undefined) {
                memEl.textContent = `${service.memory}%`;
                updateMetricColor(memEl, service.memory);
            } else if (memEl) {
                memEl.textContent = '--%';
                memEl.classList.remove('warning', 'critical');
            }
        });
    }

    /**
     * Update metric color based on value
     */
    function updateMetricColor(element, value) {
        element.classList.remove('warning', 'critical');
        if (value >= 90) {
            element.classList.add('critical');
        } else if (value >= 75) {
            element.classList.add('warning');
        }
    }

    /**
     * Update resource meters
     */
    function updateResources(resources) {
        if (!resources) return;

        // CPU
        if (elements.meters.cpu && resources.cpu) {
            const percent = resources.cpu.percent || 0;
            updateMeter(elements.meters.cpu, percent);
        }

        // Memory
        if (elements.meters.memory && resources.memory) {
            const percent = resources.memory.percent || 0;
            updateMeter(elements.meters.memory, percent);

            if (elements.meters.memory.detail && resources.memory.usedGB !== undefined) {
                elements.meters.memory.detail.textContent =
                    `${resources.memory.usedGB} / ${resources.memory.totalGB} GB`;
            }
        }

        // Disk
        if (elements.meters.disk && resources.disk) {
            const percent = resources.disk.percent || 0;
            updateMeter(elements.meters.disk, percent);

            if (elements.meters.disk.detail && resources.disk.usedTB !== undefined) {
                elements.meters.disk.detail.textContent =
                    `${resources.disk.usedTB} / ${resources.disk.totalTB} TB`;
            }
        }
    }

    /**
     * Update a single meter
     */
    function updateMeter(meter, percent) {
        if (meter.value) {
            meter.value.textContent = `${Math.round(percent)}%`;
        }

        if (meter.fill) {
            meter.fill.style.width = `${percent}%`;

            // Color based on level
            meter.fill.classList.remove('warning', 'critical');
            if (percent >= 90) {
                meter.fill.classList.add('critical');
            } else if (percent >= 75) {
                meter.fill.classList.add('warning');
            }
        }
    }

    /**
     * Update network stats
     */
    function updateNetwork(network) {
        if (!network) return;

        if (elements.network.inbound && network.inbound) {
            elements.network.inbound.textContent = network.inbound.formatted || '--';
        }

        if (elements.network.outbound && network.outbound) {
            elements.network.outbound.textContent = network.outbound.formatted || '--';
        }
    }

    /**
     * Update timestamp
     */
    function updateTimestamp(timestamp) {
        if (!elements.timestamp || !timestamp) return;

        const date = new Date(timestamp);
        const time = date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        elements.timestamp.textContent = time;
    }

    /**
     * Show offline message
     */
    function showOffline() {
        if (elements.offline) {
            elements.offline.hidden = false;
        }
        updateGlobalStatus('offline');
    }

    /**
     * Hide offline message
     */
    function hideOffline() {
        if (elements.offline) {
            elements.offline.hidden = true;
        }
    }

    /**
     * Start polling loop
     */
    function startPolling() {
        if (pollTimer) return;

        pollTimer = setInterval(async () => {
            // Skip if page not visible
            if (!isVisible) return;

            await fetchStatus();
        }, CONFIG.pollInterval);
    }

    /**
     * Stop polling
     */
    function stopPolling() {
        if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
        }
    }

    /**
     * Handle visibility change
     */
    function handleVisibilityChange() {
        isVisible = !document.hidden;

        if (isVisible) {
            // Refresh immediately when page becomes visible
            fetchStatus();
        }
    }

    /**
     * Initialize
     */
    function init() {
        // Check if LiveLab section exists
        const section = document.getElementById('live-lab');
        if (!section) return;

        initElements();

        // Initial fetch
        fetchStatus();

        // Start polling
        startPolling();

        // Handle page visibility
        document.addEventListener('visibilitychange', handleVisibilityChange);

        console.log('[LiveLab] Initialized - polling every', CONFIG.pollInterval / 1000, 'seconds');
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Also init after portfolio ready event (if boot animation present)
    document.addEventListener('portfolioReady', init);

})();
