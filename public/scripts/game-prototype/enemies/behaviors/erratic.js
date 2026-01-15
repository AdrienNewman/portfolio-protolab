// ============================================
// BEHAVIOR: Erratic
// Unpredictable random horizontal movement
// ============================================

export const behaviorErratic = {
    name: 'erratic',
    description: 'Mouvement horizontal aléatoire imprévisible',

    params: {
        randomness: { type: 'number', default: 8 },
        bounceMargin: { type: 'number', default: 50 }
    },

    /**
     * Update enemy position with random movement
     * @param {object} enemy - Enemy instance
     * @param {object} params - Behavior parameters
     * @param {number} deltaTime - Time since last frame
     * @returns {object} Result flags
     */
    update: (enemy, params, deltaTime) => {
        const randomness = params.randomness ?? 8;
        const bounceMargin = params.bounceMargin ?? 50;
        const effectiveSpeed = enemy.speed * enemy.slowMoMultiplier;

        enemy.y += effectiveSpeed;
        enemy.x += (Math.random() - 0.5) * randomness;

        // Keep in bounds
        enemy.x = Math.max(bounceMargin, Math.min(enemy.canvasWidth - bounceMargin, enemy.x));

        return { overrideMovement: true };
    }
};
