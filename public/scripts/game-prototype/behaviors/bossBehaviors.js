// ============================================
// BOSS BEHAVIORS - LEGACY RE-EXPORT
// This file is kept for backwards compatibility
// All logic has been moved to /bosses/ directory
// ============================================

// Re-export everything from new modular structure
export { BossBehaviorController } from '../bosses/BossBehaviorController.js';
export {
    BOSS_BEHAVIORS,
    LAYER_BOSS_MAP,
    getBossBehavior,
    getBossForLayer,
    getAllBossIds,
    boss_clippe,
    boss_explorer,
    boss_messenger,
    boss_update,
    boss_norton,
    boss_hub,
    boss_gates
} from '../bosses/index.js';
