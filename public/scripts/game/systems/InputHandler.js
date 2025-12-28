// ============================================
// INPUT HANDLER - NetDefender
// Keyboard, mouse, and touch controls
// ============================================

export class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;

        // Input state
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        this.shoot = false;
        this.pause = false;
        this.anyKey = false;

        // Touch state
        this.touchActive = false;
        this.touchX = 0;
        this.touchY = 0;

        // Mobile detection
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        this.bindEvents();
    }

    bindEvents() {
        // Keyboard events
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Mouse events
        this.canvas.addEventListener('mousedown', () => this.shoot = true);
        this.canvas.addEventListener('mouseup', () => this.shoot = false);

        // Touch events for mobile
        if (this.isMobile) {
            this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
            this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
            this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        }
    }

    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
            case 'q':
            case 'Q':
                this.left = true;
                e.preventDefault();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.right = true;
                e.preventDefault();
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
            case 'z':
            case 'Z':
                this.up = true;
                e.preventDefault();
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.down = true;
                e.preventDefault();
                break;
            case ' ':
                this.shoot = true;
                e.preventDefault();
                break;
            case 'Escape':
                this.pause = true;
                e.preventDefault();
                break;
        }

        // Track any key press for screen skipping
        this.anyKey = true;
    }

    handleKeyUp(e) {
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
            case 'q':
            case 'Q':
                this.left = false;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.right = false;
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
            case 'z':
            case 'Z':
                this.up = false;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.down = false;
                break;
            case ' ':
                this.shoot = false;
                break;
            case 'Escape':
                this.pause = false;
                break;
        }
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.touchActive = true;
        this.touchX = touch.clientX;
        this.touchY = touch.clientY;
        this.shoot = true;
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (!this.touchActive) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchX;
        const deltaY = touch.clientY - this.touchY;

        // Update position for player to follow
        this.touchX = touch.clientX;
        this.touchY = touch.clientY;

        // Convert to directional input
        const threshold = 5;
        this.left = deltaX < -threshold;
        this.right = deltaX > threshold;
        this.up = deltaY < -threshold;
        this.down = deltaY > threshold;
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.touchActive = false;
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        this.shoot = false;
    }

    consumePause() {
        const wasPaused = this.pause;
        this.pause = false;
        return wasPaused;
    }

    consumeAnyKey() {
        const wasPressed = this.anyKey;
        this.anyKey = false;
        return wasPressed;
    }

    reset() {
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        this.shoot = false;
        this.pause = false;
        this.anyKey = false;
    }

    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }
}
