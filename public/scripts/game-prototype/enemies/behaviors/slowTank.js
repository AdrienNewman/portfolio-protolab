// ============================================
// BEHAVIOR: Slow Tank
// Heavy enemy with slow, steady movement
// ============================================

export const behaviorSlowTank = {
    name: 'slow_tank',
    description: 'Mouvement lent et régulier (tank lourd)',

    params: {
        speedMultiplier: { type: 'number', default: 0.7 }
    },

    /**
     * Update enemy position (slow and steady)
     * @param {object} enemy - Enemy instance
     * @param {object} params - Behavior parameters
     * @param {number} deltaTime - Time since last frame
     * @returns {object} Result flags
     */
    update: (enemy, params, deltaTime) => {
        const speedMultiplier = params.speedMultiplier ?? 0.7;
        const effectiveSpeed = enemy.speed * enemy.slowMoMultiplier;

        enemy.y += effectiveSpeed * speedMultiplier;

        return { overrideMovement: true };
    }
};
