// ============================================
// OSI LAYER DATA - Technical Information
// Infos techniques des 7 couches OSI
// V1.0 - LayerTransitionScreen Refactoring
// ============================================

/**
 * Données des 7 couches OSI
 * Utilisé pour :
 * - Animation du paquet (Phase B)
 * - Injection dans les dialogues ({protocols}, {layerName})
 * - Affichage visuel des layers
 */
export const OSI_LAYERS = {
    7: {
        name: 'Application',
        short: 'APP',
        number: 7,
        color: '#ff0080',           // Magenta
        glowColor: 'rgba(255, 0, 128, 0.5)',
        protocols: ['HTTP', 'HTTPS', 'DNS', 'FTP', 'SMTP'],
        description: 'Interface utilisateur et services réseau',
        bossId: 'boss_clippe'
    },
    6: {
        name: 'Présentation',
        short: 'PRES',
        number: 6,
        color: '#ff3366',           // Rose-rouge
        glowColor: 'rgba(255, 51, 102, 0.5)',
        protocols: ['SSL/TLS', 'JPEG', 'UTF-8', 'ASCII'],
        description: 'Encodage, chiffrement, compression',
        bossId: 'boss_explorer'
    },
    5: {
        name: 'Session',
        short: 'SESS',
        number: 5,
        color: '#ff6600',           // Orange
        glowColor: 'rgba(255, 102, 0, 0.5)',
        protocols: ['NetBIOS', 'RPC', 'PPTP', 'SIP'],
        description: 'Gestion des connexions et sessions',
        bossId: 'boss_messenger'
    },
    4: {
        name: 'Transport',
        short: 'TRANS',
        number: 4,
        color: '#ffcc00',           // Jaune-or
        glowColor: 'rgba(255, 204, 0, 0.5)',
        protocols: ['TCP', 'UDP', 'SCTP', 'QUIC'],
        description: 'Fiabilité, contrôle de flux, ports',
        bossId: 'boss_update'
    },
    3: {
        name: 'Réseau',
        short: 'NET',
        number: 3,
        color: '#00ffcc',           // Cyan-vert
        glowColor: 'rgba(0, 255, 204, 0.5)',
        protocols: ['IP', 'ICMP', 'BGP', 'OSPF'],
        description: 'Routage, adressage logique',
        bossId: 'boss_norton'
    },
    2: {
        name: 'Liaison',
        short: 'LINK',
        number: 2,
        color: '#00ff88',           // Vert néon
        glowColor: 'rgba(0, 255, 136, 0.5)',
        protocols: ['Ethernet', 'Wi-Fi', 'ARP', 'PPP'],
        description: 'Trames, adresses MAC, contrôle accès',
        bossId: 'boss_hub'
    },
    1: {
        name: 'Physique',
        short: 'PHY',
        number: 1,
        color: '#ff0000',           // Rouge
        glowColor: 'rgba(255, 0, 0, 0.5)',
        protocols: ['RJ45', 'Fiber', 'Radio', 'USB'],
        description: 'Signaux électriques, bits bruts',
        bossId: 'boss_gates'
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Récupère les infos d'une couche OSI
 * @param {number} layerNum - Numéro de la couche (1-7)
 * @returns {object|null} - Données de la couche
 */
export function getLayerInfo(layerNum) {
    return OSI_LAYERS[layerNum] || null;
}

/**
 * Récupère la couleur d'une couche
 * @param {number} layerNum - Numéro de la couche
 * @returns {string} - Couleur hex
 */
export function getLayerColor(layerNum) {
    return OSI_LAYERS[layerNum]?.color || '#00ffff';
}

/**
 * Récupère la couleur de glow d'une couche
 * @param {number} layerNum - Numéro de la couche
 * @returns {string} - Couleur rgba
 */
export function getLayerGlowColor(layerNum) {
    return OSI_LAYERS[layerNum]?.glowColor || 'rgba(0, 255, 255, 0.5)';
}

/**
 * Récupère les protocoles d'une couche
 * @param {number} layerNum - Numéro de la couche
 * @returns {string[]} - Liste des protocoles
 */
export function getProtocolsForLayer(layerNum) {
    return OSI_LAYERS[layerNum]?.protocols || [];
}

/**
 * Récupère le nom court d'une couche
 * @param {number} layerNum - Numéro de la couche
 * @returns {string} - Nom court (APP, PRES, etc.)
 */
export function getLayerShortName(layerNum) {
    return OSI_LAYERS[layerNum]?.short || `L${layerNum}`;
}

/**
 * Récupère le numéro de layer à partir d'un boss ID
 * @param {string} bossId - ID du boss
 * @returns {number|null} - Numéro de la layer
 */
export function getLayerForBoss(bossId) {
    for (const [layerNum, data] of Object.entries(OSI_LAYERS)) {
        if (data.bossId === bossId) {
            return parseInt(layerNum);
        }
    }
    return null;
}

/**
 * Récupère toutes les layers dans l'ordre descendant (7→1)
 * @returns {object[]} - Array des layers ordonnées
 */
export function getAllLayersDescending() {
    return [7, 6, 5, 4, 3, 2, 1].map(num => ({
        ...OSI_LAYERS[num],
        number: num
    }));
}

/**
 * Récupère toutes les layers dans l'ordre ascendant (1→7)
 * @returns {object[]} - Array des layers ordonnées
 */
export function getAllLayersAscending() {
    return [1, 2, 3, 4, 5, 6, 7].map(num => ({
        ...OSI_LAYERS[num],
        number: num
    }));
}
