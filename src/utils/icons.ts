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
  },
  'mcp': {
    svg: 'M15.688 2.343a2.588 2.588 0 00-3.61 0l-9.626 9.44a.863.863 0 01-1.203 0 .823.823 0 010-1.18l9.626-9.44a4.313 4.313 0 016.016 0 4.116 4.116 0 011.204 3.54 4.3 4.3 0 013.609 1.18l.05.05a4.115 4.115 0 010 5.9l-8.706 8.537a.274.274 0 000 .393l1.788 1.754a.823.823 0 010 1.18.863.863 0 01-1.203 0l-1.788-1.753a1.92 1.92 0 010-2.754l8.706-8.538a2.47 2.47 0 000-3.54l-.05-.049a2.588 2.588 0 00-3.607-.003l-7.172 7.034-.002.002-.098.097a.863.863 0 01-1.204 0 .823.823 0 010-1.18l7.273-7.133a2.47 2.47 0 00-.003-3.537zM14.485 4.703a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a4.115 4.115 0 000 5.9 4.314 4.314 0 006.016 0l7.12-6.982a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a2.588 2.588 0 01-3.61 0 2.47 2.47 0 010-3.54l7.12-6.982z',
    hex: 'ffffff',
    title: 'MCP'
  },
  'claude': {
    svg: 'm3.127 10.604 3.135-1.76.053-.153-.053-.085H6.11l-.525-.032-1.791-.048-1.554-.065-1.505-.08-.38-.081L0 7.832l.036-.234.32-.214.455.04 1.009.069 1.513.105 1.097.064 1.626.17h.259l.036-.105-.089-.065-.068-.064-1.566-1.062-1.695-1.121-.887-.646-.48-.327-.243-.306-.104-.67.435-.48.585.04.15.04.593.456 1.267.981 1.654 1.218.242.202.097-.068.012-.049-.109-.181-.9-1.626-.96-1.655-.428-.686-.113-.411a2 2 0 0 1-.068-.484l.496-.674L4.446 0l.662.089.279.242.411.94.666 1.48 1.033 2.014.302.597.162.553.06.17h.105v-.097l.085-1.134.157-1.392.154-1.792.052-.504.25-.605.497-.327.387.186.319.456-.045.294-.19 1.23-.37 1.93-.243 1.29h.142l.161-.16.654-.868 1.097-1.372.484-.545.565-.601.363-.287h.686l.505.751-.226.775-.707.895-.585.759-.839 1.13-.524.904.048.072.125-.012 1.897-.403 1.024-.186 1.223-.21.553.258.06.263-.218.536-1.307.323-1.533.307-2.284.54-.028.02.032.04 1.029.098.44.024h1.077l2.005.15.525.346.315.424-.053.323-.807.411-3.631-.863-.872-.218h-.12v.073l.726.71 1.331 1.202 1.667 1.55.084.383-.214.302-.226-.032-1.464-1.101-.565-.497-1.28-1.077h-.084v.113l.295.432 1.557 2.34.08.718-.112.234-.404.141-.444-.08-.911-1.28-.94-1.44-.759-1.291-.093.053-.448 4.821-.21.246-.484.186-.403-.307-.214-.496.214-.98.258-1.28.21-1.016.19-1.263.112-.42-.008-.028-.092.012-.953 1.307-1.448 1.957-1.146 1.227-.274.109-.477-.247.045-.44.266-.39 1.586-2.018.956-1.25.617-.723-.004-.105h-.036l-4.212 2.736-.75.096-.324-.302.04-.496.154-.162 1.267-.871z',
    hex: 'D4A574',
    title: 'Claude'
  },
  'github': {
    svg: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
    hex: 'f0f0f0',
    title: 'GitHub'
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
    'proxmoxve': 'proxmox',
    'vmware': 'vmware',
    'docker': 'docker',
    'bash': 'gnubash',
    'powershell': 'powershell',
    'grafana': 'grafana',
    'kubernetes': 'kubernetes',
    'nvidia': 'nvidia',
    'nvidiartx3060': 'nvidia',
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
    // Nouvelles technos V4.8
    'astro': 'astro',
    'typescript': 'typescript',
    'python': 'python',
    'ollama': 'ollama',
    'fastapi': 'fastapi',
    'prometheus': 'prometheus',
    'loki': 'grafana',
    'wazuh': 'wazuh',
    'mcpserver': 'anthropic',
    'claudecode': 'anthropic',
    'anthropic': 'anthropic',
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
