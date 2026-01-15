// ============================================
// BEHAVIOR: Quarantine
// Boss: NORTON ANTIVIRUS (L3)
// Boss can capture the player in a "quarantine bubble"
// ============================================

/**
 * Quarantine Behavior
 * The boss can trap the player in a quarantine zone
 * Player must mash a key to escape faster
 *
 * Config params:
 * - triggerCooldown: Time between attempts (ms, default: 12000)
 * - captureDuration: How long trapped (ms, default: 2000)
 * - damagePerSecond: DPS while trapped (default: 10)
 * - escapeKey: Key to mash for escape (default: 'Space')
 * - captureRange: Range to capture player (default: 120)
 * - captureSpeed: How fast capture expands (default: 8)
 *
 * @param {object} controller - BossBehaviorController
 * @param {object} config - Behavior config
 * @param {object} enemy - Enemy entity
 * @param {object} player - Player entity
 * @param {number} deltaTime - Delta time
 * @param {object} state - Behavior state
 * @param {object} result - Result object
 */
export function behaviorQuarantine(controller, config, enemy, player, deltaTime, state, result) {
    const triggerCooldown = config.triggerCooldown || 12000;
    const captureDuration = config.captureDuration || 2000;
    const damagePerSecond = config.damagePerSecond || 10;
    const captureRange = config.captureRange || 120;
    const captureSpeed = config.captureSpeed || 8;
    const bubbleColor = config.bubbleColor || '#FFD700';

    // Initialize state
    if (state.cooldown === undefined) {
        state.cooldown = triggerCooldown * 0.5; // Start with half cooldown
        state.phase = 'idle';
    }

    // Update cooldown
    if (state.cooldown > 0 && state.phase === 'idle') {
        state.cooldown -= deltaTime;
    }

    // Calculate distance to player
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    switch (state.phase) {
        case 'idle':
            // Check if should start capture attempt
            if (state.cooldown <= 0 && distance < captureRange * 2) {
                state.phase = 'targeting';
                state.targetX = player.x;
                state.targetY = player.y;
                state.captureRadius = 0;

                result.behaviorEffect = {
                    type: 'quarantine_warning',
                    text: 'MENACE DÉTECTÉE !',
                    color: '#FF0000'
                };
            }
            break;

        case 'targeting':
            // Expand capture bubble toward target
            state.captureRadius += captureSpeed;

            // Update target position (slightly follow player)
            state.targetX += (player.x - state.targetX) * 0.05;
            state.targetY += (player.y - state.targetY) * 0.05;

            // Check if player is caught
            const distToCapture = Math.sqrt(
                Math.pow(player.x - state.targetX, 2) +
                Math.pow(player.y - state.targetY, 2)
            );

            if (state.captureRadius >= captureRange) {
                if (distToCapture < state.captureRadius) {
                    // Player caught!
                    state.phase = 'captured';
                    state.timer = captureDuration;
                    state.escapeProgress = 0;
                    state.capturedX = player.x;
                    state.capturedY = player.y;

                    result.behaviorEffect = {
                        type: 'quarantine_capture',
                        text: 'QUARANTAINE !',
                        color: bubbleColor
                    };
                } else {
                    // Player escaped capture
                    state.phase = 'idle';
                    state.cooldown = triggerCooldown;
                    state.captureRadius = 0;
                }
            }
            break;

        case 'captured':
            state.timer -= deltaTime;

            // Apply damage
            const damage = (damagePerSecond * deltaTime) / 1000;
            result.playerDamage = (result.playerDamage || 0) + damage;

            // Check for escape key presses (handled externally via player input)
            if (player.escapePressed) {
                state.escapeProgress += 0.15;
                player.escapePressed = false;
            }

            // Natural escape progress
            state.escapeProgress += deltaTime / captureDuration;

            // Store quarantine visual info
            result.quarantineBubble = {
                active: true,
                x: state.capturedX,
                y: state.capturedY,
                radius: captureRange,
                color: bubbleColor,
                escapeProgress: Math.min(1, state.escapeProgress),
                timeLeft: state.timer
            };

            // Lock player position
            result.lockPlayerPosition = {
                x: state.capturedX,
                y: state.capturedY
            };

            // Check if escaped
            if (state.timer <= 0 || state.escapeProgress >= 1) {
                state.phase = 'idle';
                state.cooldown = triggerCooldown;
                state.captureRadius = 0;

                result.quarantineBubble = null;
                result.lockPlayerPosition = null;

                result.behaviorEffect = {
                    type: 'quarantine_escape',
                    text: state.escapeProgress >= 1 ? 'ÉCHAPPÉ !' : 'Libéré...',
                    color: '#00FF00'
                };
            }
            break;
    }

    // Store targeting visual
    if (state.phase === 'targeting') {
        result.quarantineTarget = {
            active: true,
            x: state.targetX,
            y: state.targetY,
            radius: state.captureRadius,
            maxRadius: captureRange,
            color: bubbleColor
        };
    }

    return {
        phase: state.phase,
        isCapturing: state.phase === 'targeting',
        isCaptured: state.phase === 'captured',
        overrideMovement: false
    };
}
