// ============================================
// PLAYER STATE MANAGER - Les Sages du Libre
// Gestion des pouvoirs roguelike du joueur
// ============================================

import { POWERS, getPowerConfig } from '../sages/powers/index.js';
import { SAGES, getSageForBoss } from '../sages/index.js';

export class PlayerStateManager {
    constructor() {
        // Pouvoirs actifs (IDs)
        this.activePowers = [];

        // Cache des modifiers calculés
        this.cachedModifiers = null;
        this.modifiersDirty = true;

        // Systèmes spéciaux actifs
        this.autoShieldCooldown = 0;
        this.checkpointHP = 0;
        this.checkpointTimer = 0;
        this.damageAuraActive = false;

        // Stats de session
        this.powersChosen = 0;
        this.sagesMet = [];
    }

    /**
     * Reset pour nouvelle partie
     */
    reset() {
        this.activePowers = [];
        this.cachedModifiers = null;
        this.modifiersDirty = true;
        this.autoShieldCooldown = 0;
        this.checkpointHP = 0;
        this.checkpointTimer = 0;
        this.powersChosen = 0;
        this.sagesMet = [];
    }

    /**
     * Ajoute un pouvoir au joueur
     */
    addPower(powerId) {
        const normalizedId = powerId.startsWith('power_') ? powerId : `power_${powerId}`;

        if (this.activePowers.includes(normalizedId)) {
            console.warn(`[PlayerStateManager] Pouvoir déjà actif: ${normalizedId}`);
            return false;
        }

        const power = getPowerConfig(normalizedId);
        if (!power) {
            console.error(`[PlayerStateManager] Pouvoir inconnu: ${normalizedId}`);
            return false;
        }

        this.activePowers.push(normalizedId);
        this.modifiersDirty = true;
        this.powersChosen++;

        console.log(`[PlayerStateManager] Pouvoir ajouté: ${power.name} (${power.effect.type})`);
        return true;
    }

    /**
     * Vérifie si un pouvoir est actif
     */
    hasPower(powerId) {
        const normalizedId = powerId.startsWith('power_') ? powerId : `power_${powerId}`;
        return this.activePowers.includes(normalizedId);
    }

    /**
     * Récupère le sage correspondant au boss vaincu
     */
    getSageForDefeatedBoss(bossId) {
        const normalizedId = bossId.startsWith('boss_') ? bossId : `boss_${bossId}`;
        return getSageForBoss(normalizedId);
    }

    /**
     * Enregistre une rencontre avec un sage
     */
    recordSageMet(sageId) {
        if (!this.sagesMet.includes(sageId)) {
            this.sagesMet.push(sageId);
        }
    }

    /**
     * Calcule tous les modifiers combinés des pouvoirs actifs
     * Gère la logique spéciale de Merge Master (buff_amplifier)
     */
    calculateModifiers() {
        if (!this.modifiersDirty && this.cachedModifiers) {
            return this.cachedModifiers;
        }

        // Modifiers de base
        const modifiers = {
            // Multiplicateurs (appliqués par multiplication)
            speedMultiplier: 1.0,
            fireRateMultiplier: 1.0,
            projectileSpeedMultiplier: 1.0,
            scoreMultiplier: 1.0,
            hitboxMultiplier: 1.0,

            // Bonus additifs
            maxHealthBonus: 0,
            healthRegenPerSecond: 0,

            // Effets spéciaux (booléens ou valeurs)
            multiShot: { active: false, projectiles: 1, spreadAngle: 0 },
            autoShield: { active: false, hits: 0, cooldown: 0 },
            invincibilityOnHit: { active: false, duration: 0 },
            instantKillChance: 0,
            aoeDamage: { active: false, radius: 0, damage: 0 },
            damageAura: { active: false, radius: 0, damagePerSecond: 0 },
            checkpointRestore: { active: false, interval: 0 },

            // Amplificateur global (Merge Master)
            buffAmplifier: 1.0
        };

        // Première passe : détecter buff_amplifier (Merge Master)
        for (const powerId of this.activePowers) {
            const power = getPowerConfig(powerId);
            if (power && power.effect.type === 'buff_amplifier') {
                modifiers.buffAmplifier = power.effect.multiplier || 1.2;
            }
        }

        // Deuxième passe : appliquer tous les effets avec amplification
        for (const powerId of this.activePowers) {
            const power = getPowerConfig(powerId);
            if (!power) continue;

            const effect = power.effect;
            const amp = modifiers.buffAmplifier;

            switch (effect.type) {
                case 'score_multiplier':
                    modifiers.scoreMultiplier *= this.amplify(effect.value, amp);
                    break;

                case 'speed_boost':
                    modifiers.speedMultiplier *= this.amplify(effect.multiplier, amp);
                    break;

                case 'fire_rate_boost':
                    modifiers.fireRateMultiplier *= this.amplify(effect.multiplier, amp);
                    break;

                case 'projectile_speed_boost':
                    modifiers.projectileSpeedMultiplier *= this.amplify(effect.multiplier, amp);
                    break;

                case 'hitbox_reduction':
                    // Pour la réduction, on amplifie l'effet inverse
                    const reduction = 1 - effect.multiplier; // ex: 0.7 -> 0.3 reduction
                    const amplifiedReduction = reduction * amp;
                    modifiers.hitboxMultiplier *= (1 - amplifiedReduction);
                    break;

                case 'health_boost':
                    modifiers.maxHealthBonus += Math.round(effect.value * amp);
                    modifiers.healthRegenPerSecond += (effect.regenPerSecond || 0) * amp;
                    break;

                case 'multi_shot':
                    modifiers.multiShot.active = true;
                    modifiers.multiShot.projectiles = effect.projectiles || 3;
                    modifiers.multiShot.spreadAngle = effect.spreadAngle || 15;
                    break;

                case 'auto_shield':
                    modifiers.autoShield.active = true;
                    modifiers.autoShield.hits = effect.hits || 2;
                    modifiers.autoShield.cooldown = effect.cooldown / amp; // Plus rapide avec amp
                    break;

                case 'invincibility_on_hit':
                    modifiers.invincibilityOnHit.active = true;
                    modifiers.invincibilityOnHit.duration = effect.duration * amp;
                    break;

                case 'instant_kill_chance':
                    modifiers.instantKillChance += effect.chance * amp;
                    break;

                case 'aoe_damage':
                    modifiers.aoeDamage.active = true;
                    modifiers.aoeDamage.radius = effect.radius * amp;
                    modifiers.aoeDamage.damage = effect.damage * amp;
                    break;

                case 'damage_aura':
                    modifiers.damageAura.active = true;
                    modifiers.damageAura.radius = effect.radius * amp;
                    modifiers.damageAura.damagePerSecond = effect.damagePerSecond * amp;
                    break;

                case 'checkpoint_restore':
                    modifiers.checkpointRestore.active = true;
                    modifiers.checkpointRestore.interval = effect.interval / amp;
                    break;

                case 'buff_amplifier':
                    // Déjà traité en première passe
                    break;

                default:
                    console.warn(`[PlayerStateManager] Type d'effet inconnu: ${effect.type}`);
            }
        }

        this.cachedModifiers = modifiers;
        this.modifiersDirty = false;

        return modifiers;
    }

    /**
     * Amplifie une valeur multiplicative
     * Ex: amplify(1.25, 1.2) = 1 + (0.25 * 1.2) = 1.3
     */
    amplify(value, amplifier) {
        if (value >= 1) {
            // Multiplicateur positif (ex: 1.25 speed)
            const bonus = value - 1;
            return 1 + (bonus * amplifier);
        } else {
            // Multiplicateur négatif (ex: 0.7 hitbox)
            const reduction = 1 - value;
            return 1 - (reduction * amplifier);
        }
    }

    /**
     * Update appelé chaque frame pour les effets temporels
     */
    update(deltaTime, player) {
        const modifiers = this.calculateModifiers();

        // Auto Shield cooldown
        if (modifiers.autoShield.active) {
            this.autoShieldCooldown -= deltaTime;
            if (this.autoShieldCooldown <= 0 && !player.shielded) {
                player.activateShield(modifiers.autoShield.hits);
                this.autoShieldCooldown = modifiers.autoShield.cooldown;
            }
        }

        // Health regen
        if (modifiers.healthRegenPerSecond > 0) {
            player.health = Math.min(
                player.maxHealth,
                player.health + (modifiers.healthRegenPerSecond * deltaTime / 1000)
            );
        }

        // Checkpoint restore
        if (modifiers.checkpointRestore.active) {
            this.checkpointTimer -= deltaTime;
            if (this.checkpointTimer <= 0) {
                this.checkpointHP = player.health;
                this.checkpointTimer = modifiers.checkpointRestore.interval;
            }
        }
    }

    /**
     * Appelé quand le joueur prend des dégâts
     */
    onPlayerHit(player, damage) {
        const modifiers = this.calculateModifiers();

        // Checkpoint restore
        if (modifiers.checkpointRestore.active && this.checkpointHP > player.health) {
            player.health = this.checkpointHP;
            console.log('[PlayerStateManager] Git Revert! HP restaurés à', this.checkpointHP);
        }

        // Invincibility on hit
        if (modifiers.invincibilityOnHit.active) {
            player.setInvincible(modifiers.invincibilityOnHit.duration);
        }
    }

    /**
     * Appelé quand le joueur touche un ennemi
     * @returns {boolean} true si l'ennemi doit être tué instantanément
     */
    onEnemyHit(enemy) {
        const modifiers = this.calculateModifiers();

        // Instant kill chance
        if (modifiers.instantKillChance > 0) {
            if (Math.random() < modifiers.instantKillChance) {
                console.log('[PlayerStateManager] Sudo Kill! Ennemi éliminé instantanément');
                return true;
            }
        }

        return false;
    }

    /**
     * Applique les modifiers au joueur
     */
    applyToPlayer(player) {
        const modifiers = this.calculateModifiers();

        // Vitesse
        player.speed = player.baseSpeed * modifiers.speedMultiplier;

        // Cadence de tir
        player.shootCooldown = player.baseShootCooldown / modifiers.fireRateMultiplier;

        // HP max
        const newMaxHealth = player.baseMaxHealth + modifiers.maxHealthBonus;
        if (newMaxHealth !== player.maxHealth) {
            const healthRatio = player.health / player.maxHealth;
            player.maxHealth = newMaxHealth;
            player.health = Math.round(healthRatio * newMaxHealth);
        }

        // Hitbox
        player.hitboxMultiplier = modifiers.hitboxMultiplier;

        // Multi-shot
        player.multiShot = modifiers.multiShot;

        // Store modifiers reference for other systems
        player.activeModifiers = modifiers;
    }

    /**
     * Retourne un résumé des pouvoirs actifs pour l'UI
     */
    getActivePowersSummary() {
        return this.activePowers.map(powerId => {
            const power = getPowerConfig(powerId);
            return {
                id: powerId,
                name: power?.name || 'Inconnu',
                icon: power?.icon || '?',
                description: power?.description || ''
            };
        });
    }

    /**
     * Debug: affiche l'état actuel
     */
    debugLog() {
        console.log('=== PlayerStateManager Debug ===');
        console.log('Active Powers:', this.activePowers);
        console.log('Modifiers:', this.calculateModifiers());
        console.log('Sages Met:', this.sagesMet);
    }
}

// Singleton pour accès global
export const playerStateManager = new PlayerStateManager();
