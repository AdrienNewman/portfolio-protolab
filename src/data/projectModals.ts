// Project modals data - Extracted from individual modal files for centralization
// This file contains all project modal data

export type ProjectSectionType = 'text' | 'list' | 'tags';

export interface ProjectSection {
  title: string;
  type: ProjectSectionType;
  content?: string;        // For 'text' type
  items?: string[];        // For 'list' type
  tags?: string[];         // For 'tags' type
}

export interface ProjectModalData {
  id: string;
  title: string;
  iconSvg: string;         // SVG path content
  iconColorClass?: string; // e.g., 'modal-title-icon-magenta'
  sections: ProjectSection[];
}

export const projectModals: ProjectModalData[] = [
  {
    id: 'protolab',
    title: 'Infrastructure Protolab',
    iconSvg: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
    sections: [
      {
        title: 'Presentation',
        type: 'text',
        content: 'Protolab est mon laboratoire personnel, une infrastructure complete simulant un environnement d\'entreprise. Ce projet m\'a permis de mettre en pratique l\'ensemble de mes competences TSSR dans un contexte realiste.',
      },
      {
        title: 'Architecture Technique',
        type: 'list',
        items: [
          '<strong>Hyperviseur :</strong> Proxmox VE 8.x sur serveur physique dedie (AMD Ryzen 7 5800X, 32GB RAM, RTX 3060)',
          '<strong>Firewall :</strong> Palo Alto PA-VM-50 avec 4 interfaces (WAN, LAN, DMZ, VPN)',
          '<strong>Active Directory :</strong> Windows Server 2022 (DC01) - Protolab.local',
          '<strong>Reseau :</strong> 3 VLANs segmentes (Production, Admin, DMZ) avec routing inter-VLAN',
          '<strong>Monitoring :</strong> Stack OpenTelemetry + Victoria Logs + Grafana',
        ],
      },
      {
        title: 'Fonctionnalites Cles',
        type: 'list',
        items: [
          '<strong>VPN GlobalProtect :</strong> Acces distant securise avec authentification LDAP',
          '<strong>GPU Passthrough :</strong> RTX 3060 dediee aux workloads IA (Ollama)',
          '<strong>Backup automatise :</strong> Snapshots Proxmox + exports AD + config Palo Alto',
          '<strong>Zero Trust :</strong> Politiques de securite deny-by-default',
        ],
      },
      {
        title: 'Stack Technique',
        type: 'tags',
        tags: ['Proxmox VE', 'Palo Alto PAN-OS', 'Windows Server 2022', 'Active Directory', 'Docker', 'Grafana', 'OpenTelemetry', 'Bash', 'PowerShell'],
      },
    ],
  },
  {
    id: 'llm',
    title: 'LLM Local + GPU',
    iconSvg: 'M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6',
    iconColorClass: 'modal-title-icon-magenta',
    sections: [
      {
        title: 'Presentation',
        type: 'text',
        content: 'Deploiement d\'une infrastructure IA locale permettant d\'executer des modeles de langage (LLM) avec acceleration GPU. Ce projet combine virtualisation avancee et technologies d\'intelligence artificielle.',
      },
      {
        title: 'Architecture Technique',
        type: 'list',
        items: [
          '<strong>GPU Passthrough :</strong> NVIDIA RTX 3060 12GB dediee via IOMMU/VFIO',
          '<strong>Runtime :</strong> Ollama pour l\'execution des modeles LLM',
          '<strong>Interface :</strong> Open WebUI pour l\'interaction utilisateur',
          '<strong>Routing :</strong> LiteLLM pour le load-balancing multi-modeles',
          '<strong>Conteneurisation :</strong> Docker avec nvidia-container-toolkit',
        ],
      },
      {
        title: 'Modeles Deployes',
        type: 'list',
        items: [
          '<strong>Llama 3.1 8B :</strong> Modele generaliste pour conversations',
          '<strong>CodeLlama 7B :</strong> Assistance au developpement',
          '<strong>Mistral 7B :</strong> Alternative performante',
          '<strong>Phi-3 :</strong> Modele compact pour inference rapide',
        ],
      },
      {
        title: 'Defis Techniques Resolus',
        type: 'list',
        items: [
          'Configuration IOMMU et groupes de GPU dans Proxmox',
          'Installation drivers NVIDIA dans environnement virtualise',
          'Optimisation memoire VRAM pour modeles volumineux',
          'Securisation de l\'acces via reverse-proxy authentifie',
        ],
      },
      {
        title: 'Stack Technique',
        type: 'tags',
        tags: ['Ollama', 'Open WebUI', 'LiteLLM', 'CUDA 12', 'Docker', 'NVIDIA Container Toolkit', 'Proxmox GPU Passthrough'],
      },
    ],
  },
  {
    id: 'observability',
    title: 'Stack Observabilite',
    iconSvg: 'M22 12h-4l-3 9L9 3l-3 9H2',
    iconColorClass: 'modal-title-icon-green',
    sections: [
      {
        title: 'Presentation',
        type: 'text',
        content: 'Pipeline de collecte et visualisation de logs centralise, permettant une observabilite complete de l\'infrastructure Protolab. Base sur les standards CNCF avec OpenTelemetry.',
      },
      {
        title: 'Architecture du Pipeline',
        type: 'list',
        items: [
          '<strong>Collecteur :</strong> OpenTelemetry Collector - point d\'entree unique',
          '<strong>Stockage :</strong> Victoria Logs - haute performance, faible empreinte',
          '<strong>Visualisation :</strong> Grafana - dashboards temps reel',
          '<strong>Alerting :</strong> Grafana Alerting avec notifications',
        ],
      },
      {
        title: 'Sources de Donnees',
        type: 'list',
        items: [
          '<strong>Palo Alto :</strong> Logs firewall via Syslog (traffic, threat, system)',
          '<strong>Windows Server :</strong> Event Logs (Security, Application, System)',
          '<strong>Linux :</strong> Journald + fichiers logs applicatifs',
          '<strong>Docker :</strong> Logs conteneurs via driver OTLP',
        ],
      },
      {
        title: 'Dashboards Crees',
        type: 'list',
        items: [
          '<strong>Security Overview :</strong> Tentatives d\'intrusion, authentifications echouees',
          '<strong>Firewall Traffic :</strong> Flux reseau, top applications, menaces bloquees',
          '<strong>Infrastructure Health :</strong> Etat des VMs, ressources, uptime',
          '<strong>AD Audit :</strong> Connexions utilisateurs, modifications GPO',
        ],
      },
      {
        title: 'Stack Technique',
        type: 'tags',
        tags: ['OpenTelemetry', 'Victoria Logs', 'Grafana', 'Syslog', 'Docker Compose', 'OTLP'],
      },
    ],
  },
  {
    id: 'control-plane',
    title: 'Control-Plane IA',
    iconSvg: 'M12 2a4 4 0 0 1 4 4c0 1.1-.9 2-2 2h-4a2 2 0 0 1-2-2 4 4 0 0 1 4-4zM12 8v4M8 14a4 4 0 0 0-4 4c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2 4 4 0 0 0-4-4H8zM12 18m-1 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0M8 18m-1 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0M16 18m-1 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0',
    iconColorClass: 'modal-title-icon-purple',
    sections: [
      {
        title: 'Presentation',
        type: 'text',
        content: 'Le Control-Plane IA est le centre de commande intelligent de l\'infrastructure Protolab. Base sur le protocole MCP (Model Context Protocol) d\'Anthropic, il permet a Claude Code d\'interagir directement avec l\'infrastructure pour l\'inventaire, la surveillance et l\'orchestration automatisee.',
      },
      {
        title: 'Architecture Technique',
        type: 'list',
        items: [
          '<strong>MCP Server :</strong> Serveur Python exposant des tools pour l\'interaction avec l\'infrastructure',
          '<strong>Claude Code :</strong> Agent IA integre pour l\'orchestration et l\'automatisation',
          '<strong>API REST :</strong> Endpoints pour l\'inventaire, les metriques et les commandes',
          '<strong>Integration Proxmox :</strong> Gestion des VMs/CTs via API Proxmox VE',
          '<strong>Monitoring :</strong> Collecte de metriques temps reel pour le dashboard',
        ],
      },
      {
        title: 'Fonctionnalites Cles',
        type: 'list',
        items: [
          '<strong>Inventaire Intelligent :</strong> Liste dynamique des VMs, conteneurs et services',
          '<strong>Commandes Infrastructure :</strong> Start/stop/restart des ressources via IA',
          '<strong>Metriques Temps Reel :</strong> CPU, RAM, stockage, uptime de chaque service',
          '<strong>Audit Automatise :</strong> Verification de l\'etat de sante de l\'infrastructure',
          '<strong>Documentation Auto-generee :</strong> Generation de rapports d\'infrastructure',
        ],
      },
      {
        title: 'Tools MCP Disponibles',
        type: 'list',
        items: [
          '<code>get_infrastructure_inventory</code> - Liste complete des ressources',
          '<code>get_service_status</code> - Etat detaille d\'un service',
          '<code>get_metrics</code> - Metriques temps reel',
          '<code>execute_command</code> - Execution de commandes securisees',
        ],
      },
      {
        title: 'Stack Technique',
        type: 'tags',
        tags: ['MCP Server', 'Claude Code', 'Python', 'FastAPI', 'Proxmox API', 'VictoriaMetrics', 'Docker'],
      },
    ],
  },
  {
    id: 'web-interface',
    title: 'Interface Web',
    iconSvg: 'M12 12m-10 0a10 10 0 1 0 20 0 10 10 0 1 0-20 0M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
    iconColorClass: 'modal-title-icon-blue',
    sections: [
      {
        title: 'Presentation',
        type: 'text',
        content: 'Ce portfolio est lui-meme un projet technique a part entiere. Developpe avec Astro et TypeScript, il propose un design cyberpunk immersif avec animations avancees, dashboard temps reel et integration IA. Le site evolue continuellement avec de nouvelles fonctionnalites.',
      },
      {
        title: 'Architecture Technique',
        type: 'list',
        items: [
          '<strong>Framework :</strong> Astro 5.x avec rendu SSR via @astrojs/node',
          '<strong>Langage :</strong> TypeScript pour la type-safety et la maintenabilite',
          '<strong>Animations :</strong> Three.js pour les effets 3D, CSS animations custom',
          '<strong>API :</strong> Endpoints internes pour les donnees temps reel (LIVE_LAB)',
          '<strong>Deploiement :</strong> Container Docker avec reverse-proxy Traefik',
        ],
      },
      {
        title: 'Fonctionnalites Cles',
        type: 'list',
        items: [
          '<strong>LIVE_LAB Dashboard :</strong> Monitoring temps reel de l\'infrastructure Protolab',
          '<strong>Modals Interactifs :</strong> Details des competences et projets en overlay',
          '<strong>Design Cyberpunk :</strong> Effets neon, grilles animees, particules',
          '<strong>Responsive :</strong> Adaptation mobile-first avec breakpoints optimises',
          '<strong>Accessibilite :</strong> Navigation clavier, ARIA labels, focus visible',
        ],
      },
      {
        title: 'Evolutions Prevues',
        type: 'list',
        items: [
          '<strong>Chatbot IA :</strong> Assistant integre pour explorer le portfolio',
          '<strong>Mode Lab :</strong> Demonstrations interactives des projets',
          '<strong>API Publique :</strong> Exposition des metriques infrastructure',
          '<strong>PWA :</strong> Installation offline et notifications',
        ],
      },
      {
        title: 'Stack Technique',
        type: 'tags',
        tags: ['Astro', 'TypeScript', 'Three.js', 'CSS Variables', 'Docker', 'VictoriaMetrics', 'Traefik'],
      },
    ],
  },
];

// Helper to get a project modal by ID
export function getProjectModalById(id: string): ProjectModalData | undefined {
  return projectModals.find(project => project.id === id);
}

// Get all project modal IDs
export function getProjectModalIds(): string[] {
  return projectModals.map(project => project.id);
}
