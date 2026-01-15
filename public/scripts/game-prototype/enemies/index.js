// ============================================
// ENEMY REGISTRY - Central Export
// All enemy type configs and helpers
// 30 enemy types across 7 OSI layers
// ============================================

// Import enemy configs - Layer 7 (Application)
import { type_sql_injection } from './configs/type_sql_injection.js';
import { type_xss } from './configs/type_xss.js';
import { type_csrf } from './configs/type_csrf.js';

// Import enemy configs - Layer 6 (Presentation)
import { type_ssl_stripper } from './configs/type_ssl_stripper.js';
import { type_ransomware } from './configs/type_ransomware.js';
import { type_homograph } from './configs/type_homograph.js';
import { type_zip_bomb } from './configs/type_zip_bomb.js';

// Import enemy configs - Layer 5 (Session)
import { type_session_hijack } from './configs/type_session_hijack.js';
import { type_token_thief } from './configs/type_token_thief.js';
import { type_replay } from './configs/type_replay.js';
import { type_brute_force } from './configs/type_brute_force.js';

// Import enemy configs - Layer 4 (Transport)
import { type_syn_flood } from './configs/type_syn_flood.js';
import { type_udp_flood } from './configs/type_udp_flood.js';
import { type_port_scanner } from './configs/type_port_scanner.js';
import { type_ack_storm } from './configs/type_ack_storm.js';

// Import enemy configs - Layer 3 (Network)
import { type_ip_spoof } from './configs/type_ip_spoof.js';
import { type_ping_death } from './configs/type_ping_death.js';
import { type_smurf } from './configs/type_smurf.js';

// Import enemy configs - Layer 2 (Data Link)
import { type_arp_spoof } from './configs/type_arp_spoof.js';
import { type_mac_flood } from './configs/type_mac_flood.js';
import { type_vlan_hop } from './configs/type_vlan_hop.js';

// Import enemy configs - Layer 1 (Physical)
import { type_cable_cut } from './configs/type_cable_cut.js';
import { type_em_jammer } from './configs/type_em_jammer.js';
import { type_wiretap } from './configs/type_wiretap.js';

// Re-export individual configs
export {
    // Layer 7
    type_sql_injection,
    type_xss,
    type_csrf,
    // Layer 6
    type_ssl_stripper,
    type_ransomware,
    type_homograph,
    type_zip_bomb,
    // Layer 5
    type_session_hijack,
    type_token_thief,
    type_replay,
    type_brute_force,
    // Layer 4
    type_syn_flood,
    type_udp_flood,
    type_port_scanner,
    type_ack_storm,
    // Layer 3
    type_ip_spoof,
    type_ping_death,
    type_smurf,
    // Layer 2
    type_arp_spoof,
    type_mac_flood,
    type_vlan_hop,
    // Layer 1
    type_cable_cut,
    type_em_jammer,
    type_wiretap
};

// Aggregated object - All enemy types
export const ENEMY_TYPES = {
    // Layer 7 - Application
    type_sql_injection,
    type_xss,
    type_csrf,
    // Layer 6 - Presentation
    type_ssl_stripper,
    type_ransomware,
    type_homograph,
    type_zip_bomb,
    // Layer 5 - Session
    type_session_hijack,
    type_token_thief,
    type_replay,
    type_brute_force,
    // Layer 4 - Transport
    type_syn_flood,
    type_udp_flood,
    type_port_scanner,
    type_ack_storm,
    // Layer 3 - Network
    type_ip_spoof,
    type_ping_death,
    type_smurf,
    // Layer 2 - Data Link
    type_arp_spoof,
    type_mac_flood,
    type_vlan_hop,
    // Layer 1 - Physical
    type_cable_cut,
    type_em_jammer,
    type_wiretap
};

// Layer to Enemy Types mapping
export const LAYER_ENEMY_MAP = {
    7: ['type_sql_injection', 'type_xss', 'type_csrf'],
    6: ['type_ssl_stripper', 'type_ransomware', 'type_homograph', 'type_zip_bomb'],
    5: ['type_session_hijack', 'type_token_thief', 'type_replay', 'type_brute_force'],
    4: ['type_syn_flood', 'type_udp_flood', 'type_port_scanner', 'type_ack_storm'],
    3: ['type_ip_spoof', 'type_ping_death', 'type_smurf'],
    2: ['type_arp_spoof', 'type_mac_flood', 'type_vlan_hop'],
    1: ['type_cable_cut', 'type_em_jammer', 'type_wiretap']
};

/**
 * Get enemy config by ID
 * Supports both 'sql_injection' and 'type_sql_injection' formats
 * @param {string} typeId - Enemy type identifier
 * @returns {object|null} Enemy config or null
 */
export function getEnemyConfig(typeId) {
    const normalizedId = typeId.startsWith('type_') ? typeId : `type_${typeId}`;
    return ENEMY_TYPES[normalizedId] || null;
}

/**
 * Get all enemy configs for a specific OSI layer
 * @param {number} layer - OSI layer (1-7)
 * @returns {object[]} Array of enemy configs
 */
export function getEnemiesForLayer(layer) {
    const typeIds = LAYER_ENEMY_MAP[layer] || [];
    return typeIds.map(id => ENEMY_TYPES[id]).filter(Boolean);
}

/**
 * Get all enemy type IDs
 * @returns {string[]} Array of enemy type IDs
 */
export function getAllEnemyIds() {
    return Object.keys(ENEMY_TYPES);
}

/**
 * Get enemy count per layer
 * @returns {object} Object with layer numbers as keys and counts as values
 */
export function getEnemyCountByLayer() {
    const counts = {};
    for (const [layer, enemies] of Object.entries(LAYER_ENEMY_MAP)) {
        counts[layer] = enemies.length;
    }
    return counts;
}

/**
 * Get total enemy count
 * @returns {number} Total number of enemy types
 */
export function getTotalEnemyCount() {
    return Object.keys(ENEMY_TYPES).length;
}
