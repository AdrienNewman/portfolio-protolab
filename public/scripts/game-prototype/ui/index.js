// ============================================
// OSI STACK HUD - Module Exports
// V1.0 - Sprint B2
// ============================================

// Main coordinator (default export)
export { OSIStackHUD, default } from './OSIStackHUD.js';

// Individual modules (for advanced usage)
export { OSIStackState } from './OSIStackState.js';
export { OSIStackRenderer } from './OSIStackRenderer.js';
export { OSIStackAnimations } from './OSIStackAnimations.js';

// Configuration (for customization)
export {
    LAYER_COLORS,
    LAYER_HP,
    HUD_POSITION,
    ANIMATION_TIMING,
    BLOCK_STATES,
    BOSS_TO_LAYER,
    calculateHUDHeight
} from './OSIStackConfig.js';
