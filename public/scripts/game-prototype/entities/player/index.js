// ============================================
// PLAYER MODULES - Central Export Registry
// OSI Layer System for Player Entity
//
// ORDRE RÉSEAU (comme un vrai paquet) :
// - L7 (Application) = CORE au centre
// - L1 (Physical) = SHELL externe
//
// Le joueur commence avec L7 (ses données)
// et gagne des couches de protection vers l'extérieur
// ============================================

import { OSIHealthSystem } from './OSIHealthSystem.js';
import { OSIRenderer } from './OSIRenderer.js';
import { OSIEvolution } from './OSIEvolution.js';

export { OSIHealthSystem, OSIRenderer, OSIEvolution };
