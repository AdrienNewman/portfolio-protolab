// ============================================
// BEHAVIOR: Progress Bar
// Boss: WINDOWS UPDATE (L4)
// Boss becomes invincible with a progress bar countdown
// ============================================

/**
 * Progress Bar Behavior
 * The boss displays an "installation progress" bar and becomes invincible
 * until the installation "completes"
 *
 * Config params:
 * - triggerThresholds: Array of health % to trigger (default: [0.6, 0.3])
 * - invincibilityDuration: How long invincible (ms, default: 5000)
 * - displayText: Array of texts to show (default: ['Installation...', 'Redémarrage...'])
 * - progressColor: Color of progress bar (default: '#00BCF2')
 *
 * @param {object} controller - BossBehaviorController
 * @param {object} config - Behavior config
 * @param {object} enemy - Enemy entity
 * @param {object} player - Player entity
 * @param {number} deltaTime - Delta time
 * @param {object} state - Behavior state
 * @param {object} result - Result object
 */
export function behaviorProgressBar(controller, config, enemy, player, deltaTime, state, result) {
    const thresholds = config.triggerThresholds || [0.6, 0.3];
    const duration = config.invincibilityDuration || 5000;
    const texts = config.displayText || ['Installation en cours...', 'Redémarrage imminent...'];
    const progressColor = config.progressColor || '#00BCF2';

    const healthPercent = enemy.health / enemy.maxHealth;

    // Initialize triggered array
    if (!state.triggeredThresholds) {
        state.triggeredThresholds = new Array(thresholds.length).fill(false);
    }

    // Check each threshold
    for (let i = 0; i < thresholds.length; i++) {
        if (!state.triggeredThresholds[i] && healthPercent <= thresholds[i] && !state.active) {
            state.triggeredThresholds[i] = true;
            state.active = true;
            state.timer = duration;
            state.totalDuration = duration;
            state.textIndex = i;

            result.behaviorEffect = {
                type: 'progress_start',
                text: texts[i] || 'Mise à jour...',
                color: progressColor
            };
            break;
        }
    }

    // Handle active progress bar state
    if (state.active) {
        state.timer -= deltaTime;

        // Calculate progress (0 to 1, where 1 = complete)
        const progress = 1 - (state.timer / state.totalDuration);
        const progressPercent = Math.floor(progress * 100);

        // Store progress for rendering
        enemy.progressBar = {
            active: true,
            progress: progress,
            percent: progressPercent,
            text: texts[state.textIndex] || 'Mise à jour...',
            color: progressColor,
            countdown: Math.ceil(state.timer / 1000)
        };

        // Check if complete
        if (state.timer <= 0) {
            state.active = false;
            enemy.progressBar = null;

            result.behaviorEffect = {
                type: 'progress_complete',
                text: 'Installation terminée !',
                color: '#00FF00'
            };

            // Optionally trigger a special attack after completion
            result.triggerAttack = config.attackAfterComplete || null;
        }

        return {
            isInvincible: true,
            showProgressBar: true,
            progress: progress,
            overrideMovement: false
        };
    }

    // Clear progress bar when not active
    if (enemy.progressBar) {
        enemy.progressBar = null;
    }

    return {
        isInvincible: false,
        showProgressBar: false,
        overrideMovement: false
    };
}
