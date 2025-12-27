// ============================================
// AUDIO MANAGER - NetDefender
// Sound effects and music management
// ============================================

import { CONFIG } from '../config/gameConfig.js';

export class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.masterVolume = CONFIG.AUDIO.MASTER_VOLUME;
        this.sfxVolume = CONFIG.AUDIO.SFX_VOLUME;
        this.loaded = false;

        // Audio context for better control
        this.audioContext = null;

        this.init();
    }

    async init() {
        try {
            // Create audio context on user interaction
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Define sounds to load
            const soundFiles = {
                shoot: '/audio/game/shoot.mp3',
                explosion: '/audio/game/explosion.mp3',
                powerupPositive: '/audio/game/powerup-positive.mp3',
                powerupNegative: '/audio/game/powerup-negative.mp3',
                waveComplete: '/audio/game/wave-complete.mp3',
                damage: '/audio/game/damage.mp3',
                gameOver: '/audio/game/game-over.mp3'
            };

            // Preload all sounds
            const loadPromises = Object.entries(soundFiles).map(async ([key, path]) => {
                try {
                    const audio = new Audio(path);
                    audio.volume = this.sfxVolume * this.masterVolume;
                    audio.preload = 'auto';

                    // Wait for audio to be ready
                    await new Promise((resolve, reject) => {
                        audio.addEventListener('canplaythrough', resolve, { once: true });
                        audio.addEventListener('error', () => {
                            console.warn(`Could not load sound: ${path}`);
                            resolve(); // Don't fail, just skip
                        }, { once: true });
                    });

                    this.sounds[key] = audio;
                } catch (err) {
                    console.warn(`Failed to load sound ${key}:`, err);
                }
            });

            await Promise.all(loadPromises);
            this.loaded = true;
            console.log('AudioManager: Sounds loaded');
        } catch (err) {
            console.warn('AudioManager: Could not initialize audio', err);
            this.enabled = false;
        }
    }

    play(soundName, options = {}) {
        if (!this.enabled || !this.sounds[soundName]) return;

        try {
            const sound = this.sounds[soundName];

            // Clone for overlapping sounds
            const clone = sound.cloneNode();
            clone.volume = (options.volume ?? 1) * this.sfxVolume * this.masterVolume;

            // Pitch variation for variety
            if (options.pitchVariation) {
                clone.playbackRate = 0.9 + Math.random() * 0.2;
            }

            clone.play().catch(() => {
                // Ignore autoplay restrictions
            });

            // Clean up clone after playing
            clone.addEventListener('ended', () => {
                clone.remove();
            }, { once: true });
        } catch (err) {
            // Silently fail
        }
    }

    playShoot() {
        this.play('shoot', { volume: 0.5, pitchVariation: true });
    }

    playExplosion(isBoss = false) {
        this.play('explosion', { volume: isBoss ? 1 : 0.7, pitchVariation: true });
    }

    playPowerUp(isPositive) {
        this.play(isPositive ? 'powerupPositive' : 'powerupNegative', { volume: 0.8 });
    }

    playWaveComplete() {
        this.play('waveComplete', { volume: 0.9 });
    }

    playDamage() {
        this.play('damage', { volume: 0.8 });
    }

    playGameOver() {
        this.play('gameOver', { volume: 1 });
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.sfxVolume * this.masterVolume;
        });
    }

    mute() {
        this.enabled = false;
    }

    unmute() {
        this.enabled = true;
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // Resume audio context (required after user interaction)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}
