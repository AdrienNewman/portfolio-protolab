// Technology Icons Helper
// Import des icônes depuis simple-icons

import * as simpleIcons from 'simple-icons';

export interface IconData {
  svg: string;
  hex: string;
  title: string;
}

// Icônes personnalisées pour les technologies non disponibles dans Simple Icons
const customIcons: Record<string, IconData> = {
  'windows': {
    svg: 'M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801',
    hex: '0078D4',
    title: 'Windows'
  }
};

/**
 * Récupère une icône depuis Simple Icons
 * @param name - Nom de l'icône (ex: 'windows', 'linux', 'docker')
 * @returns SVG path et couleur hex
 */
export function getIcon(name: string): IconData | null {
  // Normaliser le nom (enlever espaces, mettre en minuscules)
  const normalizedName = name.toLowerCase().replace(/\s+/g, '');

  // Mapping des noms custom vers les noms Simple Icons
  const nameMapping: Record<string, string> = {
    'windowsserver': 'windows',
    'windows': 'windows',
    'linux': 'linux',
    'debian': 'debian',
    'ubuntu': 'ubuntu',
    'paloalto': 'paloaltonetworks',
    'paloaltonetworks': 'paloaltonetworks',
    'proxmox': 'proxmox',
    'vmware': 'vmware',
    'docker': 'docker',
    'bash': 'gnubash',
    'powershell': 'powershell',
    'grafana': 'grafana',
    'kubernetes': 'kubernetes',
    'nvidia': 'nvidia',
    'git': 'git',
    'markdown': 'markdown',
    'security': 'shieldcheck',
    'diagrams': 'diagramsdotnet',
    'youtube': 'youtube',
    'file': 'files',
    'document': 'googledocs',
    'chart': 'chartdotjs',
    'clock': 'clockify',
    'code': 'visualstudiocode',
  };

  const iconName = nameMapping[normalizedName] || normalizedName;

  // Vérifier d'abord les icônes personnalisées
  if (customIcons[iconName]) {
    return customIcons[iconName];
  }

  try {
    // Construire le nom de la clé pour simple-icons
    // simple-icons utilise le format 'siIconname'
    const iconKey = `si${iconName.charAt(0).toUpperCase()}${iconName.slice(1)}`;
    const icon = (simpleIcons as any)[iconKey];

    if (icon) {
      return {
        svg: icon.path,
        hex: icon.hex,
        title: icon.title
      };
    }
  } catch (error) {
    console.warn(`Icon not found: ${iconName}`);
  }

  return null;
}

/**
 * Génère le SVG complet avec les bonnes couleurs
 */
export function generateIconSvg(name: string, customColor?: string): string {
  const icon = getIcon(name);
  if (!icon) return '';

  const color = customColor || `#${icon.hex}`;

  return `<svg viewBox="0 0 24 24" fill="${color}">
    <path d="${icon.svg}"/>
  </svg>`;
}

/**
 * Récupère seulement le path SVG pour utilisation inline
 */
export function getIconPath(name: string): string {
  const icon = getIcon(name);
  return icon ? icon.svg : '';
}

/**
 * Récupère la couleur officielle de la marque
 */
export function getIconColor(name: string): string {
  const icon = getIcon(name);
  return icon ? `#${icon.hex}` : '#00ffff'; // Fallback cyan
}
