// ============================================
// SCREEN SHAKE EFFECT - NetDefender
// Camera shake for impact feedback
// ============================================

export class ScreenShake {
    constructor() {
        this.intensity = 0;
        this.decay = 0.9;
        this.offsetX = 0;
        this.offsetY = 0;
        this.maxIntensity = 15;
    }

    trigger(intensity = 5) {
        this.intensity = Math.min(intensity, this.maxIntensity);
    }

    // Light shake for bullet hits
    triggerLight() {
        this.trigger(3);
    }

    // Medium shake for enemy deaths
    triggerMedium() {
        this.trigger(6);
    }

    // Heavy shake for damage/boss deaths
    triggerHeavy() {
        this.trigger(12);
    }

    update() {
        if (this.intensity > 0.1) {
            // Random offset based on intensity
            this.offsetX = (Math.random() - 0.5) * this.intensity * 2;
            this.offsetY = (Math.random() - 0.5) * this.intensity * 2;

            // Decay the intensity
            this.intensity *= this.decay;
        } else {
            this.intensity = 0;
            this.offsetX = 0;
            this.offsetY = 0;
        }
    }

    apply(ctx) {
        ctx.translate(this.offsetX, this.offsetY);
    }

    reset(ctx) {
        ctx.translate(-this.offsetX, -this.offsetY);
    }

    isActive() {
        return this.intensity > 0.1;
    }
}
