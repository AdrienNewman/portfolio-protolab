export const CATEGORY_CONFIG = {
  'active-directory': {
    displayName: 'Active Directory',
    icon: 'windows',
    color: '#0078D4',
    description: 'Gestion des domaines et GPO'
  },
  'paloalto': {
    displayName: 'Réseau & Sécurité',
    icon: 'paloaltonetworks',
    color: '#E74856',
    description: 'Pare-feu et sécurité réseau'
  },
  'monitoring': {
    displayName: 'Monitoring & Logs',
    icon: 'grafana',
    color: '#10893E',
    description: 'Observabilité et supervision'
  },
  'proxmox': {
    displayName: 'Virtualisation',
    icon: 'proxmox',
    color: '#498205',
    description: 'Machines virtuelles et conteneurs'
  },
  'linux': {
    displayName: 'Linux',
    icon: 'linux',
    color: '#FCC624',
    description: 'Administration système Linux'
  },
  'windows': {
    displayName: 'Windows Server',
    icon: 'windows',
    color: '#0078D4',
    description: 'Administration Windows'
  },
  'docker': {
    displayName: 'Docker',
    icon: 'docker',
    color: '#2496ED',
    description: 'Conteneurisation et orchestration'
  },
  'backup': {
    displayName: 'Backup & DR',
    icon: 'git',
    color: '#8764B8',
    description: 'Sauvegarde et récupération'
  },
  'network': {
    displayName: 'Réseau',
    icon: 'cisco',
    color: '#1BA0D7',
    description: 'Infrastructure réseau'
  },
  'security': {
    displayName: 'Sécurité',
    icon: 'security',
    color: '#D83B01',
    description: 'Hardening et conformité'
  },
  'documentation': {
    displayName: 'Documentation Tech',
    icon: 'markdown',
    color: '#5C2D91',
    description: 'Documentation technique et guides'
  },
  'architecture': {
    displayName: 'Architecture',
    icon: 'diagrams',
    color: '#00BCF2',
    description: 'Architecture système et infrastructure'
  },
  'multimedia': {
    displayName: 'Multimédia',
    icon: 'youtube',
    color: '#7719AA',
    description: 'Solutions multimédia et streaming'
  },
  'llm': {
    displayName: 'LLM & IA',
    icon: 'nvidia',
    color: '#FFB900',
    description: 'Intelligence artificielle et LLM'
  },
  'web-front': {
    displayName: 'Web Frontend',
    icon: 'html5',
    color: '#E34F26',
    description: 'Développement web frontend et interfaces'
  }
} as const;

export type CategoryKey = keyof typeof CATEGORY_CONFIG;
