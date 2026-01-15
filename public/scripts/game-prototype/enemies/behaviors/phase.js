// ============================================
// BEHAVIOR: Phase
// Enemy alternates between visible and invisible
// ============================================

export const behaviorPhase = {
    name: 'phase',
    description: 'Alternance visibilité/invisibilité',

    params: {
        phaseInterval: { type: 'number', default: 60 }
    },

    /**
     * Update enemy position and phase state
     * @param {object} enemy - Enemy instance
     * @param {object} params - Behavior parameters
     * @param {number} deltaTime - Time since last frame
     * @returns {object} Result flags including phaseVisible
     */
    update: (enemy, params, deltaTime) => {
        const phaseInterval = params.phaseInterval ?? 60;
        const effectiveSpeed = enemy.speed * enemy.slowMoMultiplier;

        enemy.y += effectiveSpeed;
        enemy.phaseTimer++;

        if (enemy.phaseTimer > phaseInterval) {
            enemy.phaseVisible = !enemy.phaseVisible;
            enemy.phaseTimer = 0;
        }

        return {
            overrideMovement: true,
            phaseVisible: enemy.phaseVisible
        };
    }
};
