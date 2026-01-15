// ============================================
// DIALOGUE DATABASE - Sage Dialogue Router
// Route vers les dialogues définis dans sages/configs/
// V2.0 - Utilise introDialogue/postBossDialogue des configs
// ============================================

import { getSageConfig } from '../sages/index.js';

/**
 * LEGACY - Templates courts (conservés pour fallback)
 * Les vrais dialogues sont maintenant dans sages/configs/sage_*.js
 */
export const SAGE_DIALOGUES = {
    sage_jimmy: {
        reinforcement: "Layer {layer} traversée avec succès.\n{bossName} corrompait les protocoles Application.\nRenforce ton header :",
        intro: "Voici Layer {nextLayer} - {nextLayerName}.\nLes protocoles {protocols} t'attendent.\nSentinelle obsolète détectée."
    },
    sage_firefox: {
        reinforcement: "Layer {layer} : encodage sécurisé.\n{bossName} déformait les données.\nOptimise ta présentation :",
        intro: "Layer {nextLayer} - {nextLayerName}.\nSessions et tokens.\nUne entité refuse déconnexion."
    },
    sage_duo: {
        reinforcement: "Session libérée !\n{bossName} maintenait des connexions éternelles.\nChoisis ta protection :",
        intro: "Layer {nextLayer} - {nextLayerName}.\nTCP/UDP. Fiabilité ou vitesse.\nEntité hostile détectée."
    },
    sage_tux: {
        reinforcement: "Transport opérationnel.\n{bossName} forçait des connexions infinies.\nKernel upgrade :",
        intro: "Layer {nextLayer} - {nextLayerName}.\nRoutage IP, fragmentation.\nSentinelle paranoïaque en vue."
    },
    sage_anonymous: {
        reinforcement: "Network décentralisé.\n{bossName} surveillait chaque paquet.\nChoisis ton masque :",
        intro: "Layer {nextLayer} - {nextLayerName}.\nTrames et adresses MAC.\nMatériel obsolète : collisions garanties."
    },
    sage_rpi: {
        reinforcement: "Data Link : collisions éliminées.\n{bossName} saturait le médium.\nGPIO upgrade :",
        intro: "Layer {nextLayer} - {nextLayerName}.\nPhysical. Signaux bruts, silicium.\nBoss final en approche."
    },
    sage_linus: {
        reinforcement: "Physical libéré.\n{bossName} verrouillait le silicium.\nDernière optimisation :",
        intro: null
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Injecte les variables dans un template de dialogue
 * @param {string} template - Template avec placeholders {variable}
 * @param {object} variables - Objet clé-valeur des variables à injecter
 * @returns {string|null} - Template avec variables remplacées, ou null si template invalide
 */
export function injectVariables(template, variables = {}) {
    if (!template) return null;

    return template.replace(/\{(\w+)\}/g, (match, key) => {
        const value = variables[key];
        if (value !== undefined && value !== null) {
            // Si c'est un tableau (ex: protocols), joindre avec virgule
            if (Array.isArray(value)) {
                return value.slice(0, 3).join(', ');
            }
            return String(value);
        }
        return match; // Garder le placeholder si pas de valeur
    });
}

/**
 * Récupère le dialogue de renforcement d'un sage (après victoire boss)
 * Utilise postBossDialogue du fichier de config du sage
 * @param {string} sageId - ID du sage (ex: 'sage_jimmy' ou 'jimmy')
 * @param {object} context - Variables à injecter (layer, bossName, etc.)
 * @returns {string} - Dialogue formaté
 */
export function getReinforcementDialogue(sageId, context = {}) {
    const normalizedId = normalizeSageId(sageId);

    // Priorité 1: postBossDialogue du fichier de config du sage
    const sageConfig = getSageConfig(normalizedId);
    if (sageConfig?.postBossDialogue) {
        return sageConfig.postBossDialogue;
    }

    // Fallback: template legacy
    const sageData = SAGE_DIALOGUES[normalizedId];
    if (!sageData || !sageData.reinforcement) {
        console.warn(`[DialogueDatabase] No reinforcement dialogue for: ${sageId}`);
        return "Couche sécurisée.\nChoisis ton amélioration :";
    }

    return injectVariables(sageData.reinforcement, context);
}

/**
 * Récupère le dialogue d'intro d'un sage (avant layer suivante)
 * Utilise introDialogue du fichier de config du sage
 * @param {string} sageId - ID du sage (ex: 'sage_firefox' ou 'firefox')
 * @param {object} context - Variables à injecter (nextLayer, nextLayerName, protocols)
 * @returns {string|null} - Dialogue formaté, ou null si pas de layer suivante
 */
export function getIntroDialogue(sageId, context = {}) {
    const normalizedId = normalizeSageId(sageId);

    // Priorité 1: introDialogue du fichier de config du sage
    const sageConfig = getSageConfig(normalizedId);
    if (sageConfig?.introDialogue) {
        return sageConfig.introDialogue;
    }

    // Fallback: template legacy
    const sageData = SAGE_DIALOGUES[normalizedId];
    if (!sageData || !sageData.intro) {
        // Pas d'intro pour ce sage (ex: sage_linus après L1)
        return null;
    }

    return injectVariables(sageData.intro, context);
}

/**
 * Vérifie si un sage a un dialogue d'intro
 * @param {string} sageId - ID du sage
 * @returns {boolean}
 */
export function hasIntroDialogue(sageId) {
    const normalizedId = normalizeSageId(sageId);

    // Vérifier d'abord dans le fichier de config du sage
    const sageConfig = getSageConfig(normalizedId);
    if (sageConfig?.introDialogue) {
        return true;
    }

    // Fallback: vérifier dans les templates legacy
    return SAGE_DIALOGUES[normalizedId]?.intro != null;
}

/**
 * Normalise l'ID du sage (ajoute préfixe sage_ si nécessaire)
 * @param {string} sageId - ID du sage
 * @returns {string} - ID normalisé
 */
function normalizeSageId(sageId) {
    if (!sageId) return '';
    return sageId.startsWith('sage_') ? sageId : `sage_${sageId}`;
}

// ============================================
// MAPPING SAGE → BOSS → LAYER
// ============================================

/**
 * Mapping des sages vers les layers qu'ils introduisent
 * (le sage apparaît après le boss de sa layer actuelle,
 * et présente la layer suivante)
 */
export const SAGE_LAYER_MAPPING = {
    sage_jimmy: { appearsAfterLayer: 7, introducesLayer: 6 },
    sage_firefox: { appearsAfterLayer: 6, introducesLayer: 5 },
    sage_duo: { appearsAfterLayer: 5, introducesLayer: 4 },
    sage_tux: { appearsAfterLayer: 4, introducesLayer: 3 },
    sage_anonymous: { appearsAfterLayer: 3, introducesLayer: 2 },
    sage_rpi: { appearsAfterLayer: 2, introducesLayer: 1 },
    sage_linus: { appearsAfterLayer: 1, introducesLayer: null } // Final
};

/**
 * Récupère le sage qui introduit une layer donnée
 * @param {number} layerNumber - Numéro de la layer (1-6)
 * @returns {string|null} - ID du sage, ou null
 */
export function getSageForIntroLayer(layerNumber) {
    for (const [sageId, mapping] of Object.entries(SAGE_LAYER_MAPPING)) {
        if (mapping.introducesLayer === layerNumber) {
            return sageId;
        }
    }
    return null;
}
