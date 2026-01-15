// ============================================
// ATTACK REGISTRY - Central Router
// Routes attack execution to individual modules
// V4.27 - Added 8 new attack types
// ============================================

import { attackProjectileBurst } from './projectileBurst.js';
import { attackProjectileSpread } from './projectileSpread.js';
import { attackProjectileAimed } from './projectileAimed.js';
import { attackRapidFire } from './rapidFire.js';
import { attackCircularWave } from './circularWave.js';
import { attackHomingProjectile } from './homingProjectile.js';
import { attackAreaDrain } from './areaDrain.js';
import { attackGroundHazard } from './groundHazard.js';
import { attackProjectileRain } from './projectileRain.js';
import { attackScreenFlash } from './screenFlash.js';
import { attackSweepingBeam } from './sweepingBeam.js';
import { attackExpandingRing } from './expandingRing.js';
import { attackFallingDebris } from './fallingDebris.js';
import { attackSpawnMinions } from './spawnMinions.js';
import { attackConfusionField } from './confusionField.js';
// V4.27 - New attacks
import { attackScreenShakeAttack } from './screenShakeAttack.js';
import { attackSlowField } from './slowField.js';
import { attackHelpBubble } from './helpBubble.js';
import { attackScanBeam } from './scanBeam.js';
import { attackProjectileMultiply } from './projectileMultiply.js';
import { attackMultiLineFire } from './multiLineFire.js';
import { attackProjectileRedirect } from './projectileRedirect.js';
import { attackSubscriptionDrain } from './subscriptionDrain.js';
import { attackZoneRestrict } from './zoneRestrict.js';

// ============================================
// ATTACK HANDLERS MAP
// ============================================
const attackHandlers = {
    'projectile_burst': (c, a, e, p, r) => attackProjectileBurst(c, a, e, p, r),
    'projectile_spread': (c, a, e, p, r) => attackProjectileSpread(c, a, e, p, r),
    'projectile_aimed': (c, a, e, p, r) => attackProjectileAimed(c, a, e, p, r),
    'rapid_fire': (c, a, e, p, r) => attackRapidFire(c, a, e, p, r),
    'circular_wave': (c, a, e, p, r) => attackCircularWave(c, a, e, r),
    'homing_projectile': (c, a, e, p, r) => attackHomingProjectile(c, a, e, p, r),
    'area_drain': (c, a, e, p, r) => attackAreaDrain(c, a, e, r),
    'ground_hazard': (c, a, e, p, r) => attackGroundHazard(c, a, e, r),
    'projectile_rain': (c, a, e, p, r) => attackProjectileRain(c, a, e, r),
    'screen_flash': (c, a, e, p, r) => attackScreenFlash(c, a, e, r),
    'sweeping_beam': (c, a, e, p, r) => attackSweepingBeam(c, a, e, r),
    'expanding_ring': (c, a, e, p, r) => attackExpandingRing(c, a, e, r),
    'falling_debris': (c, a, e, p, r) => attackFallingDebris(c, a, e, r),
    'spawn_minions': (c, a, e, p, r) => attackSpawnMinions(c, a, e, r),
    'confusion_field': (c, a, e, p, r) => attackConfusionField(c, a, e, r),
    // V4.27 - New attack handlers
    'screen_shake_attack': (c, a, e, p, r) => attackScreenShakeAttack(c, a, e, r),
    'slow_field': (c, a, e, p, r) => attackSlowField(c, a, e, r),
    'help_bubble': (c, a, e, p, r) => attackHelpBubble(c, a, e, p, r),
    'scan_beam': (c, a, e, p, r) => attackScanBeam(c, a, e, r),
    'projectile_multiply': (c, a, e, p, r) => attackProjectileMultiply(c, a, e, p, r),
    'multi_line_fire': (c, a, e, p, r) => attackMultiLineFire(c, a, e, r),
    'projectile_redirect': (c, a, e, p, r) => attackProjectileRedirect(c, a, e, p, r),
    'subscription_drain': (c, a, e, p, r) => attackSubscriptionDrain(c, a, e, r),
    'zone_restrict': (c, a, e, p, r) => attackZoneRestrict(c, a, e, r)
};

// ============================================
// FALLBACK MAPPING - Unimplemented → Existing
// Maps missing attack types to working alternatives
// V4.27 - Reduced: many attacks now implemented
// ============================================
const ATTACK_FALLBACKS = {
    // Movement-based attacks → projectile alternatives
    'pendulum': 'projectile_burst',
    'figure_eight': 'circular_wave',
    'figure_eight_with_teleport': 'circular_wave',
    'weave': 'projectile_spread',
    'horizontal_sweep': 'sweeping_beam',
    'static_with_shield': 'circular_wave',
    'slow_descent': 'projectile_rain',
    'aggressive_chase': 'rapid_fire',
    'multi_phase': 'projectile_burst',
    'erratic_jump': 'projectile_spread',
    'circular_orbit': 'circular_wave',

    // Remaining fallbacks (attacks not yet fully implemented)
    'screen_effect': 'screen_flash',
    'global_slow': 'scan_beam',           // Updated: now uses scan_beam
    'spawn_clones': 'spawn_minions',
    'hp_drain': 'subscription_drain',     // Updated: now uses subscription_drain
    'teleport_dash': 'projectile_aimed',
    'pull_beam': 'sweeping_beam',
    'laser_sweep': 'sweeping_beam',
    'mirror_player': 'projectile_aimed'
};

/**
 * Execute an attack based on its type
 * Includes fallback system for unimplemented attacks
 * @param {object} controller - BossBehaviorController instance
 * @param {object} attack - Attack configuration
 * @param {object} enemy - Enemy entity
 * @param {object} player - Player entity
 * @param {object} result - Result object to populate
 */
export function executeAttack(controller, attack, enemy, player, result) {
    let attackType = attack.type;

    // Check if attack type needs fallback
    if (!attackHandlers[attackType]) {
        const fallback = ATTACK_FALLBACKS[attackType];
        if (fallback) {
            attackType = fallback;
        } else {
            console.warn(`[Attack] Unknown type: ${attack.type}, defaulting to projectile_burst`);
            attackType = 'projectile_burst';
        }
    }

    // Execute the handler
    const handler = attackHandlers[attackType];
    handler(controller, attack, enemy, player, result);
}

// Re-export individual attacks for direct access
export {
    attackProjectileBurst,
    attackProjectileSpread,
    attackProjectileAimed,
    attackRapidFire,
    attackCircularWave,
    attackHomingProjectile,
    attackAreaDrain,
    attackGroundHazard,
    attackProjectileRain,
    attackScreenFlash,
    attackSweepingBeam,
    attackExpandingRing,
    attackFallingDebris,
    attackSpawnMinions,
    attackConfusionField,
    // V4.27 - New exports
    attackScreenShakeAttack,
    attackSlowField,
    attackHelpBubble,
    attackScanBeam,
    attackProjectileMultiply,
    attackMultiLineFire,
    attackProjectileRedirect,
    attackSubscriptionDrain,
    attackZoneRestrict
};
