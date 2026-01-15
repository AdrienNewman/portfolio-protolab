// ============================================
// BEHAVIOR: Fast
// Enemy moves quickly straight down
// ============================================

export const behaviorFast = {
    name: 'fast',
    description: 'Mouvement rapide vers le bas',

    params: {
        speedMultiplier: { type: 'number', default: 1.2 }
    },

    /**
     * Update enemy position
     * @param {object} enemy - Enemy instance
     * @param {object} params - Behavior parameters
     * @param {number} deltaTime - Time since last frame
     * @returns {object} Result flags
     */
    update: (enemy, params, deltaTime) => {
        const speedMultiplier = params.speedMultiplier ?? 1.2;
        const effectiveSpeed = enemy.speed * enemy.slowMoMultiplier;

        enemy.y += effectiveSpeed * speedMultiplier;

        return { overrideMovement: true };
    }
};
