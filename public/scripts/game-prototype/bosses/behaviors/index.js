// ============================================
// BEHAVIOR REGISTRY - Central Router
// Routes behavior execution to individual modules
// V1.0 - Modular boss behaviors system
// ============================================

import { behaviorStickyAssistant } from './stickyAssistant.js';
import { behaviorGoOffline } from './goOffline.js';
import { behaviorProgressBar } from './progressBar.js';
import { behaviorQuarantine } from './quarantine.js';

// ============================================
// BEHAVIOR HANDLERS MAP
// ============================================
const behaviorHandlers = {
    'sticky_assistant': behaviorStickyAssistant,
    'go_offline': behaviorGoOffline,
    'progress_bar': behaviorProgressBar,
    'quarantine': behaviorQuarantine
};

// ============================================
// BEHAVIOR STATE MANAGER
// Tracks active behaviors per boss instance
// ============================================
export class BehaviorStateManager {
    constructor() {
        this.states = new Map();
    }

    getState(bossId, behaviorType) {
        const key = `${bossId}_${behaviorType}`;
        if (!this.states.has(key)) {
            this.states.set(key, {
                active: false,
                cooldown: 0,
                timer: 0,
                triggered: false,
                data: {}
            });
        }
        return this.states.get(key);
    }

    setState(bossId, behaviorType, updates) {
        const state = this.getState(bossId, behaviorType);
        Object.assign(state, updates);
    }

    reset(bossId) {
        for (const key of this.states.keys()) {
            if (key.startsWith(`${bossId}_`)) {
                this.states.delete(key);
            }
        }
    }
}

// Global state manager instance
export const behaviorStateManager = new BehaviorStateManager();

/**
 * Execute a behavior based on its type
 * @param {object} controller - BossBehaviorController instance
 * @param {object} behaviorConfig - Behavior configuration from boss config
 * @param {object} enemy - Enemy entity
 * @param {object} player - Player entity
 * @param {number} deltaTime - Time since last frame
 * @param {object} result - Result object to populate
 * @returns {object} Behavior result with any effects
 */
export function executeBehavior(controller, behaviorConfig, enemy, player, deltaTime, result) {
    if (!behaviorConfig || !behaviorConfig.type) return null;

    const handler = behaviorHandlers[behaviorConfig.type];
    if (!handler) {
        console.warn(`[Behavior] Unknown type: ${behaviorConfig.type}`);
        return null;
    }

    const state = behaviorStateManager.getState(enemy.id || 'boss', behaviorConfig.type);

    return handler(controller, behaviorConfig, enemy, player, deltaTime, state, result);
}

/**
 * Check if a behavior should trigger based on health threshold
 * @param {object} enemy - Enemy entity
 * @param {number} threshold - Health percentage threshold (0-1)
 * @returns {boolean}
 */
export function shouldTriggerBehavior(enemy, threshold) {
    const healthPercent = enemy.health / enemy.maxHealth;
    return healthPercent <= threshold;
}

/**
 * Get list of all available behavior types
 * @returns {string[]}
 */
export function getAvailableBehaviors() {
    return Object.keys(behaviorHandlers);
}

/**
 * Check if a behavior type exists
 * @param {string} type - Behavior type
 * @returns {boolean}
 */
export function behaviorExists(type) {
    return behaviorHandlers.hasOwnProperty(type);
}

// Re-export individual behaviors for direct access
export {
    behaviorStickyAssistant,
    behaviorGoOffline,
    behaviorProgressBar,
    behaviorQuarantine
};
