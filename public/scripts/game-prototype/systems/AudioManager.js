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

    // ============================================
    // SYNTHESIZED SOUNDS (Web Audio API)
    // For transition screens and boss intros
    // ============================================

    /**
     * Play typing bip for terminal effect
     */
    playTypingBip() {
        if (!this.enabled || !this.audioContext) return;

        try {
            const ctx = this.audioContext;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            // Random pitch for variety
            osc.frequency.value = 700 + Math.random() * 400;
            osc.type = 'square';

            // Quick envelope
            const now = ctx.currentTime;
            gain.gain.setValueAtTime(0.04 * this.masterVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.04);
        } catch (e) {
            // Silently fail
        }
    }

    /**
     * Play line complete sweep sound
     */
    playLineComplete() {
        if (!this.enabled || !this.audioContext) return;

        try {
            const ctx = this.audioContext;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);

            const now = ctx.currentTime;
            gain.gain.setValueAtTime(0.06 * this.masterVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.1);
        } catch (e) {
            // Silently fail
        }
    }

    /**
     * Play stats counter tick
     */
    playStatsTick() {
        if (!this.enabled || !this.audioContext) return;

        try {
            const ctx = this.audioContext;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.frequency.value = 1200 + Math.random() * 200;
            osc.type = 'square';

            const now = ctx.currentTime;
            gain.gain.setValueAtTime(0.025 * this.masterVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.02);
        } catch (e) {
            // Silently fail
        }
    }

    /**
     * Play boss alert siren (3 pulses)
     */
    playBossAlert() {
        if (!this.enabled || !this.audioContext) return;

        try {
            const ctx = this.audioContext;

            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    if (!this.enabled) return;

                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc.frequency.value = 150;
                    osc.type = 'sawtooth';

                    const now = ctx.currentTime;
                    gain.gain.setValueAtTime(0.12 * this.masterVolume, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start(now);
                    osc.stop(now + 0.18);
                }, i * 220);
            }
        } catch (e) {
            // Silently fail
        }
    }

    /**
     * Play boss name reveal impact
     */
    playBossReveal() {
        if (!this.enabled || !this.audioContext) return;

        try {
            const ctx = this.audioContext;

            // Low impact
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();

            osc1.frequency.value = 60;
            osc1.type = 'sine';

            const now = ctx.currentTime;
            gain1.gain.setValueAtTime(0.2 * this.masterVolume, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

            osc1.connect(gain1);
            gain1.connect(ctx.destination);

            osc1.start(now);
            osc1.stop(now + 0.4);

            // Higher harmonic
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();

            osc2.frequency.value = 120;
            osc2.type = 'triangle';

            gain2.gain.setValueAtTime(0.08 * this.masterVolume, now);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

            osc2.connect(gain2);
            gain2.connect(ctx.destination);

            osc2.start(now);
            osc2.stop(now + 0.3);
        } catch (e) {
            // Silently fail
        }
    }

    /**
     * Play transition swoosh sound
     */
    playTransitionSwoosh() {
        if (!this.enabled || !this.audioContext) return;

        try {
            const ctx = this.audioContext;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);

            filter.type = 'lowpass';
            filter.frequency.value = 2000;

            const now = ctx.currentTime;
            gain.gain.setValueAtTime(0.08 * this.masterVolume, now);
            gain.gain.linearRampToValueAtTime(0.1 * this.masterVolume, now + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.3);
        } catch (e) {
            // Silently fail
        }
    }
}
