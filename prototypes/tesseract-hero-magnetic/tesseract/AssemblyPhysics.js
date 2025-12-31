// ============================================
// ASSEMBLY PHYSICS
// Magnetic attraction force (inverse square law 1/d²)
// Snap animation when pieces reach center
// ============================================

class AssemblyPhysics {
    constructor() {
        this.magneticStrength = 1.2;
        this.epsilon = 0.1; // Avoid division by zero
        this.dampingFactor = 0.95;
        this.snapDistance = 0.15;
        this.snapDuration = 0.3; // 300ms
        this.corePosition = new THREE.Vector3(0, 0, 0);

        // Target positions for snapped pieces (arranged around center)
        this.targetPositions = this.generateTargetPositions(15);
        this.targetIndex = 0;
    }

    /**
     * Generate target positions for snapped pieces
     * Distributed in a small sphere around origin
     */
    generateTargetPositions(count) {
        const targets = [];
        const radius = 0.1;

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            targets.push(new THREE.Vector3(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi)
            ));
        }

        return targets;
    }

    /**
     * Easing function for elastic snap effect
     */
    easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    /**
     * Update all pieces with magnetic physics
     * @param {Array} pieces - Array of piece groups
     * @param {number} deltaTime - Time since last frame
     */
    update(pieces, deltaTime) {
        pieces.forEach((piece) => {
            if (piece.userData.snapped) {
                // Piece is in snap animation
                this.updateSnapAnimation(piece, deltaTime);
            } else {
                // Apply magnetic force
                this.applyMagneticForce(piece, deltaTime);

                // Check if close enough to snap
                const distance = piece.position.distanceTo(this.corePosition);
                if (distance < this.snapDistance) {
                    this.initSnap(piece);
                }
            }
        });
    }

    /**
     * Apply magnetic attraction force (F = k / (d² + ε))
     * @param {THREE.Group} piece - Piece to apply force to
     * @param {number} deltaTime - Time since last frame
     */
    applyMagneticForce(piece, deltaTime) {
        // Direction to core (normalized)
        const direction = new THREE.Vector3()
            .subVectors(this.corePosition, piece.position)
            .normalize();

        // Distance to core
        const distance = piece.position.distanceTo(this.corePosition);

        // Magnetic force (inverse square law)
        const forceMagnitude = this.magneticStrength / (distance * distance + this.epsilon);

        // Apply force to velocity
        const force = direction.multiplyScalar(forceMagnitude);
        piece.userData.velocity.add(force.multiplyScalar(deltaTime));

        // Apply damping
        piece.userData.velocity.multiplyScalar(this.dampingFactor);

        // Update position
        const displacement = piece.userData.velocity.clone().multiplyScalar(deltaTime * 60);
        piece.position.add(displacement);

        // Rotation tumble (proportional to velocity)
        const velocityMag = piece.userData.velocity.length();
        piece.rotation.x += velocityMag * 0.5 * deltaTime * 60;
        piece.rotation.y += velocityMag * 0.3 * deltaTime * 60;
        piece.rotation.z += velocityMag * 0.4 * deltaTime * 60;
    }

    /**
     * Initialize snap animation for a piece
     * @param {THREE.Group} piece - Piece to snap
     */
    initSnap(piece) {
        piece.userData.snapped = true;
        piece.userData.snapStartTime = performance.now();
        piece.userData.snapStartPosition = piece.position.clone();
        piece.userData.snapStartRotation = piece.rotation.clone();

        // Assign target position
        piece.userData.snapTargetPosition = this.targetPositions[this.targetIndex % this.targetPositions.length];
        this.targetIndex++;

        // Target rotation (aligned)
        piece.userData.snapTargetRotation = new THREE.Euler(0, 0, 0);
    }

    /**
     * Update piece during snap animation (lerp with easeOutBack)
     * @param {THREE.Group} piece - Piece in snap animation
     * @param {number} deltaTime - Time since last frame
     */
    updateSnapAnimation(piece, deltaTime) {
        const elapsed = (performance.now() - piece.userData.snapStartTime) / 1000;
        const progress = Math.min(elapsed / this.snapDuration, 1);
        const easedProgress = this.easeOutBack(progress);

        // Lerp position
        piece.position.lerpVectors(
            piece.userData.snapStartPosition,
            piece.userData.snapTargetPosition,
            easedProgress
        );

        // Lerp rotation
        piece.rotation.x = THREE.MathUtils.lerp(
            piece.userData.snapStartRotation.x,
            piece.userData.snapTargetRotation.x,
            easedProgress
        );
        piece.rotation.y = THREE.MathUtils.lerp(
            piece.userData.snapStartRotation.y,
            piece.userData.snapTargetRotation.y,
            easedProgress
        );
        piece.rotation.z = THREE.MathUtils.lerp(
            piece.userData.snapStartRotation.z,
            piece.userData.snapTargetRotation.z,
            easedProgress
        );

        // Snap complete
        if (progress >= 1) {
            piece.userData.snapComplete = true;
        }
    }
}

// Export for use in tesseract-hero.js
if (typeof window !== 'undefined') {
    window.AssemblyPhysics = AssemblyPhysics;
}
