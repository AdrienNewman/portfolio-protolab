// ============================================
// SAGE REGISTRY - Export centralisé
// Généré automatiquement par MCP Tools
// ============================================

import { sage_anonymous } from './configs/sage_anonymous.js';
import { sage_duo } from './configs/sage_duo.js';
import { sage_firefox } from './configs/sage_firefox.js';
import { sage_jimmy } from './configs/sage_jimmy.js';
import { sage_linus } from './configs/sage_linus.js';
import { sage_rpi } from './configs/sage_rpi.js';
import { sage_tux } from './configs/sage_tux.js';

// Re-exports individuels
export { sage_anonymous, sage_duo, sage_firefox, sage_jimmy, sage_linus, sage_rpi, sage_tux };

// Registry central
export const SAGES = {
  sage_anonymous,
  sage_duo,
  sage_firefox,
  sage_jimmy,
  sage_linus,
  sage_rpi,
  sage_tux,
};

// Ordre d'apparition des sages (après chaque boss)
export const SAGE_ORDER = [
  'sage_anonymous',
  'sage_duo',
  'sage_firefox',
  'sage_jimmy',
  'sage_linus',
  'sage_rpi',
  'sage_tux',
];

/**
 * Récupère la config d'un sage par son ID
 */
export function getSageConfig(sageId) {
  const normalizedId = sageId.startsWith('sage_') ? sageId : `sage_${sageId}`;
  return SAGES[normalizedId] || null;
}

/**
 * Liste tous les IDs de sages
 */
export function getAllSageIds() {
  return Object.keys(SAGES);
}

/**
 * Récupère le sage qui apparaît après un boss donné
 */
export function getSageForBoss(bossId) {
  return Object.values(SAGES).find(sage => sage.appearsAfterBoss === bossId) || null;
}

/**
 * Récupère le sage d'introduction (isIntroSage = true)
 */
export function getIntroSage() {
  return Object.values(SAGES).find(sage => sage.isIntroSage === true) || null;
}
