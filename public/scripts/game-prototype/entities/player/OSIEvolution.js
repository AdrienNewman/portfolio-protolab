// ============================================
// OSI EVOLUTION - Layer Progression System
// SELF-CONTAINED (constantes inlinées pour éviter imports circulaires)
//
// Gère la progression du joueur à travers les couches OSI.
// Chaque boss vaincu débloque la couche suivante :
//
// Départ    → Layer 7 (APPLICATION) uniquement
// Clippe    → Layer 6 (PRESENTATION)
// Explorer  → Layer 5 (SESSION)
// Messenger → Layer 4 (TRANSPORT)
// Update    → Layer 3 (NETWORK)
// Norton    → Layer 2 (DATA LINK)
// Hub       → Layer 1 (PHYSICAL)
// Gates     → Full power (toutes couches)
// ============================================

// CONSTANTES INLINÉES - Plus de dépendance externe
const BOSS_TO_LAYER = {
    'boss_clippe':   6,
    'boss_explorer': 5,
    'boss_messenger': 4,
    'boss_update':   3,
    'boss_norton':   2,
    'boss_hub':      1,
    'boss_gates':    0
};

const LAYER_NAMES = {
    7: 'APPLICATION',
    6: 'PRESENTATION',
    5: 'SESSION',
    4: 'TRANSPORT',
    3: 'NETWORK',
    2: 'DATA LINK',
    1: 'PHYSICAL'
};

export class OSIEvolution {
    constructor() {
        // Couche actuelle du jeu (où se trouve le joueur)
        this.currentGameLayer = 7;

        // Couches débloquées (array de numéros 1-7)
        this.unlockedLayers = [7]; // Layer 7 débloquée au départ

        // Boss vaincus (pour tracking)
        this.defeatedBosses = [];

        // ===== CALLBACKS =====
        // Appelé quand une nouvelle couche est débloquée
        this.onLayerUnlocked = null; // (layerNumber, layerName) => void

        // Appelé quand toutes les couches sont débloquées
        this.onEvolutionComplete = null; // () => void

        // Appelé à chaque progression de niveau
        this.onLevelProgress = null; // (fromLayer, toLayer) => void
    }

    // ============================================
    // PROGRESSION API
    // ============================================

    /**
     * Appelé quand un boss est vaincu
     * @param {string} bossId - ID du boss (ex: 'boss_clippe')
     * @returns {{ unlocked: boolean, layerNumber: number|null, layerName: string|null }}
     */
    onBossDefeated(bossId) {
        // Évite les doublons
        if (this.defeatedBosses.includes(bossId)) {
            return { unlocked: false, layerNumber: null, layerName: null };
        }

        // Enregistre le boss vaincu
        this.defeatedBosses.push(bossId);

        // Trouve la couche à débloquer
        const layerToUnlock = BOSS_TO_LAYER[bossId];

        // 0 = boss final, pas de nouvelle couche
        if (layerToUnlock === undefined || layerToUnlock === 0) {
            // Vérifie si c'est le boss final (gates)
            if (bossId === 'boss_gates' && this.onEvolutionComplete) {
                this.onEvolutionComplete();
            }
            return { unlocked: false, layerNumber: null, layerName: null };
        }

        // Vérifie si déjà débloqué
        if (this.unlockedLayers.includes(layerToUnlock)) {
            return { unlocked: false, layerNumber: null, layerName: null };
        }

        // Débloque la couche
        this.unlockedLayers.push(layerToUnlock);
        this.unlockedLayers.sort((a, b) => b - a); // Tri décroissant (7, 6, 5...)

        const layerName = LAYER_NAMES[layerToUnlock] || `Layer ${layerToUnlock}`;

        // Callback
        if (this.onLayerUnlocked) {
            this.onLayerUnlocked(layerToUnlock, layerName);
        }

        // Vérifie évolution complète
        if (this.unlockedLayers.length === 7 && this.onEvolutionComplete) {
            this.onEvolutionComplete();
        }

        return {
            unlocked: true,
            layerNumber: layerToUnlock,
            layerName
        };
    }

    /**
     * Met à jour le niveau de jeu actuel
     * @param {number} newLayer - Nouveau niveau OSI (1-7)
     */
    setGameLayer(newLayer) {
        const oldLayer = this.currentGameLayer;
        if (newLayer !== oldLayer) {
            this.currentGameLayer = newLayer;
            if (this.onLevelProgress) {
                this.onLevelProgress(oldLayer, newLayer);
            }
        }
    }

    // ============================================
    // QUERIES
    // ============================================

    /**
     * Vérifie si une couche est débloquée
     */
    isLayerUnlocked(layerNumber) {
        return this.unlockedLayers.includes(layerNumber);
    }

    /**
     * Retourne toutes les couches débloquées
     */
    getUnlockedLayers() {
        return [...this.unlockedLayers];
    }

    /**
     * Retourne la prochaine couche à débloquer
     * @returns {number|null} Numéro de couche ou null si toutes débloquées
     */
    getNextLayerToUnlock() {
        // Parcourt de 6 à 1 pour trouver la première non débloquée
        for (let i = 6; i >= 1; i--) {
            if (!this.unlockedLayers.includes(i)) {
                return i;
            }
        }
        return null; // Toutes débloquées
    }

    /**
     * Retourne la progression actuelle
     * @returns {{ current: number, total: number, percent: number }}
     */
    getEvolutionProgress() {
        const current = this.unlockedLayers.length;
        const total = 7;
        return {
            current,
            total,
            percent: Math.round((current / total) * 100)
        };
    }

    /**
     * Retourne les boss vaincus
     */
    getBossesDefeated() {
        return [...this.defeatedBosses];
    }

    /**
     * Vérifie si l'évolution est complète
     */
    isEvolutionComplete() {
        return this.unlockedLayers.length === 7;
    }

    // ============================================
    // STATE MANAGEMENT
    // ============================================

    /**
     * Reset pour nouvelle partie
     */
    reset() {
        this.currentGameLayer = 7;
        this.unlockedLayers = [7];
        this.defeatedBosses = [];
    }

    /**
     * Sérialise l'état pour sauvegarde
     */
    serialize() {
        return JSON.stringify({
            currentGameLayer: this.currentGameLayer,
            unlockedLayers: this.unlockedLayers,
            defeatedBosses: this.defeatedBosses
        });
    }

    /**
     * Restaure l'état depuis une sauvegarde
     */
    deserialize(data) {
        try {
            const parsed = JSON.parse(data);
            if (parsed.currentGameLayer) this.currentGameLayer = parsed.currentGameLayer;
            if (parsed.unlockedLayers) this.unlockedLayers = parsed.unlockedLayers;
            if (parsed.defeatedBosses) this.defeatedBosses = parsed.defeatedBosses;
        } catch (e) {
            console.error('[OSIEvolution] Deserialize error:', e);
        }
    }

    // ============================================
    // DEBUG / DEV HELPERS
    // ============================================

    /**
     * Force le débloquage de toutes les couches (pour tests)
     */
    unlockAll() {
        this.unlockedLayers = [7, 6, 5, 4, 3, 2, 1];
        this.defeatedBosses = [
            'boss_clippe', 'boss_explorer', 'boss_messenger',
            'boss_update', 'boss_norton', 'boss_hub', 'boss_gates'
        ];
        if (this.onEvolutionComplete) {
            this.onEvolutionComplete();
        }
    }

    /**
     * Affiche l'état actuel en console
     */
    debugPrint() {
        console.log('=== OSI Evolution State ===');
        console.log('Current game layer:', this.currentGameLayer);
        console.log('Unlocked layers:', this.unlockedLayers.join(', '));
        console.log('Defeated bosses:', this.defeatedBosses.join(', '));
        console.log('Progress:', this.getEvolutionProgress().percent + '%');
        console.log('===========================');
    }
}
