// ============================================
// BEHAVIOR: Teleport
// Enemy randomly teleports horizontally
// ============================================

export const behaviorTeleport = {
    name: 'teleport',
    description: 'Téléportation aléatoire horizontale',

    params: {
        teleportChance: { type: 'number', default: 0.01 },
        cooldownFrames: { type: 'number', default: 60 }
    },

    /**
     * Update enemy position with random teleport
     * @param {object} enemy - Enemy instance
     * @param {object} params - Behavior parameters
     * @param {number} deltaTime - Time since last frame
     * @returns {object} Result flags
     */
    update: (enemy, params, deltaTime) => {
        const teleportChance = params.teleportChance ?? 0.01;
        const cooldownFrames = params.cooldownFrames ?? 60;
        const effectiveSpeed = enemy.speed * enemy.slowMoMultiplier;

        enemy.y += effectiveSpeed;
        enemy.teleportCooldown--;

        if (enemy.teleportCooldown <= 0 && Math.random() < teleportChance) {
            // Teleport to random X position
            enemy.x = 80 + Math.random() * (enemy.canvasWidth - 160);
            enemy.teleportCooldown = cooldownFrames;
        }

        return { overrideMovement: true };
    }
};
