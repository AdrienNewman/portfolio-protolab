// ============================================
// BEHAVIOR: Go Offline
// Boss: MSN MESSENGER (L5)
// Boss becomes semi-transparent and invincible, then reappears elsewhere
// ============================================

/**
 * Go Offline Behavior
 * The boss "appears offline" - becomes semi-transparent, invincible,
 * then teleports to a new position
 *
 * Config params:
 * - triggerThreshold: Health % to first trigger (default: 0.4)
 * - offlineDuration: How long to stay offline (ms, default: 2500)
 * - cooldown: Time before can trigger again (ms, default: 15000)
 * - fadeSpeed: Alpha fade speed (default: 0.1)
 *
 * @param {object} controller - BossBehaviorController
 * @param {object} config - Behavior config
 * @param {object} enemy - Enemy entity
 * @param {object} player - Player entity
 * @param {number} deltaTime - Delta time
 * @param {object} state - Behavior state
 * @param {object} result - Result object
 */
export function behaviorGoOffline(controller, config, enemy, player, deltaTime, state, result) {
    const triggerThreshold = config.triggerThreshold || 0.4;
    const offlineDuration = config.offlineDuration || 2500;
    const cooldown = config.cooldown || 15000;
    const fadeSpeed = config.fadeSpeed || 0.1;

    const healthPercent = enemy.health / enemy.maxHealth;

    // Update cooldown
    if (state.cooldown > 0) {
        state.cooldown -= deltaTime;
    }

    // Check if should trigger (only once per threshold, then on cooldown)
    const shouldTrigger = (
        !state.active &&
        state.cooldown <= 0 &&
        ((!state.triggered && healthPercent <= triggerThreshold) || state.triggered)
    );

    if (shouldTrigger && !state.active) {
        state.active = true;
        state.timer = offlineDuration;
        state.phase = 'fading_out';
        state.alpha = 1.0;
        state.triggered = true;
        state.originalX = enemy.x;

        // Calculate new position (away from current)
        const canvasWidth = controller.canvasWidth || 800;
        state.targetX = enemy.x < canvasWidth / 2
            ? canvasWidth * 0.7 + Math.random() * (canvasWidth * 0.2)
            : canvasWidth * 0.1 + Math.random() * (canvasWidth * 0.2);

        result.behaviorEffect = {
            type: 'offline_start',
            text: '🔴 Apparaît hors ligne',
            color: '#7FBA00'
        };
    }

    // Handle active offline state
    if (state.active) {
        state.timer -= deltaTime;

        switch (state.phase) {
            case 'fading_out':
                state.alpha -= fadeSpeed;
                if (state.alpha <= 0.15) {
                    state.alpha = 0.15;
                    state.phase = 'invisible';
                    // Teleport during invisible phase
                    enemy.x = state.targetX;
                }
                break;

            case 'invisible':
                // Stay invisible until halfway through duration
                if (state.timer <= offlineDuration * 0.4) {
                    state.phase = 'fading_in';
                }
                break;

            case 'fading_in':
                state.alpha += fadeSpeed;
                if (state.alpha >= 1.0) {
                    state.alpha = 1.0;
                    state.active = false;
                    state.cooldown = cooldown;
                    state.phase = null;

                    result.behaviorEffect = {
                        type: 'offline_end',
                        text: '🟢 En ligne',
                        color: '#00FF00'
                    };
                }
                break;
        }

        // Apply visual alpha
        enemy.behaviorAlpha = state.alpha;

        return {
            isInvincible: state.alpha < 0.5,
            alpha: state.alpha,
            overrideMovement: state.phase === 'invisible'
        };
    }

    // Reset alpha when not active
    enemy.behaviorAlpha = 1.0;

    return {
        isInvincible: false,
        alpha: 1.0,
        overrideMovement: false
    };
}
