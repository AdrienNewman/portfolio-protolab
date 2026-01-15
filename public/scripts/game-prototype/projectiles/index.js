// ============================================
// PROJECTILES REGISTRY - Auto-generated
// Total: 11 projectile types
// ============================================

import { type_activex } from './configs/type_activex.js';
import { type_burst } from './configs/type_burst.js';
import { type_debris } from './configs/type_debris.js';
import { type_default } from './configs/type_default.js';
import { type_emoticon } from './configs/type_emoticon.js';
import { type_homing } from './configs/type_homing.js';
import { type_letter } from './configs/type_letter.js';
import { type_popup } from './configs/type_popup.js';
import { type_rain } from './configs/type_rain.js';
import { type_rapid } from './configs/type_rapid.js';
import { type_wave } from './configs/type_wave.js';

// Registry central
export const PROJECTILE_TYPES = {
    type_activex,
    type_burst,
    type_debris,
    type_default,
    type_emoticon,
    type_homing,
    type_letter,
    type_popup,
    type_rain,
    type_rapid,
    type_wave,
};

// Mapping visual → type
export const PROJECTILE_VISUAL_MAP = {

};

/**
 * Récupère la config d'un projectile par son ID
 */
export function getProjectileConfig(typeId) {
    const normalizedId = typeId.startsWith('type_') ? typeId : `type_${typeId}`;
    return PROJECTILE_TYPES[normalizedId] || null;
}

/**
 * Récupère un projectile par son type de visual
 */
export function getProjectileByVisual(visual) {
    const typeId = PROJECTILE_VISUAL_MAP[visual];
    return typeId ? PROJECTILE_TYPES[typeId] : null;
}

/**
 * Récupère tous les IDs de projectiles
 */
export function getAllProjectileIds() {
    return Object.keys(PROJECTILE_TYPES);
}
