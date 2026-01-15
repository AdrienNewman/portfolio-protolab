// ============================================
// BEHAVIOR: Sticky Assistant
// Boss: CLIPPY (L7)
// When player gets too close, boss accelerates toward them
// ============================================

/**
 * Sticky Assistant Behavior
 * Makes the boss "stick" to the player when they get too close
 *
 * Config params:
 * - triggerDistance: Distance to activate (default: 150)
 * - stickDuration: How long to stick (ms, default: 3000)
 * - speedMultiplier: Speed boost when sticking (default: 2.0)
 * - cooldown: Time before can trigger again (ms, default: 5000)
 *
 * @param {object} controller - BossBehaviorController
 * @param {object} config - Behavior config
 * @param {object} enemy - Enemy entity
 * @param {object} player - Player entity
 * @param {number} deltaTime - Delta time
 * @param {object} state - Behavior state
 * @param {object} result - Result object
 */
export function behaviorStickyAssistant(controller, config, enemy, player, deltaTime, state, result) {
    const triggerDistance = config.triggerDistance || 150;
    const stickDuration = config.stickDuration || 3000;
    const speedMultiplier = config.speedMultiplier || 2.0;
    const cooldown = config.cooldown || 5000;

    // Calculate distance to player
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Update cooldown
    if (state.cooldown > 0) {
        state.cooldown -= deltaTime;
    }

    // Check if should activate
    if (!state.active && state.cooldown <= 0 && distance < triggerDistance) {
        state.active = true;
        state.timer = stickDuration;
        state.originalSpeed = enemy.speed;

        // Visual feedback
        result.behaviorEffect = {
            type: 'sticky_activate',
            text: 'Il semble que vous ayez besoin d\'AIDE !',
            color: config.effectColor || '#FFFF00'
        };
    }

    // If active, chase the player
    if (state.active) {
        state.timer -= deltaTime;

        // Move toward player
        if (distance > 30) {
            const speed = (state.originalSpeed || enemy.baseSpeed || 1) * speedMultiplier;
            enemy.x += (dx / distance) * speed * (deltaTime / 16);
            enemy.y += (dy / distance) * speed * 0.3 * (deltaTime / 16);
        }

        // Keep boss above certain Y
        const minY = 60;
        const maxY = player.y - 80;
        enemy.y = Math.max(minY, Math.min(maxY, enemy.y));

        // Deactivate when timer ends or player escapes
        if (state.timer <= 0 || distance > triggerDistance * 2) {
            state.active = false;
            state.cooldown = cooldown;
            enemy.speed = state.originalSpeed || enemy.baseSpeed;

            result.behaviorEffect = {
                type: 'sticky_deactivate',
                text: 'Je reviens bientôt !',
                color: '#888888'
            };
        }

        return {
            overrideMovement: true,
            isSticking: true
        };
    }

    return {
        overrideMovement: false,
        isSticking: false
    };
}
