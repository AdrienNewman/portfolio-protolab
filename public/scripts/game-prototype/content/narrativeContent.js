/**
 * Le Retour d'UNIX - Narrative Content
 * Textes des intros boss, transitions entre couches, et contenu pédagogique OSI
 * Thème : Star Wars / Indiana Jones
 */

// ============================================================================
// BOSS INTROS - Présentations dramatiques des boss "Le Retour d'UNIX"
// ============================================================================

export const BOSS_INTROS = {
    // Layer 7 - Application - CLIPP-E (Le Trombone Maléfique)
    boss_clippe: {
        name: "CLIPP-E LE TRAÎTRE",
        title: "ASSISTANT MALÉFIQUE",
        description: "L'ancien assistant a trahi les utilisateurs. Il bloque l'installation de Linux avec ses popups infernaux.",
        capability: "MACRO VIRUS",
        attack: "Lance des lettres E.U.L.A. et déclenche des tempêtes de popups",
        quote: "Je vois que vous essayez d'installer Linux. Je ne peux pas laisser faire ça.",
        quoter: "Couche Application",
        color: "#ff0080",
        threatLevel: "MODÉRÉ"
    },

    // Layer 6 - Presentation - INTERNET EXPLORER 6
    boss_explorer: {
        name: "INTERNET EXPLORER 6",
        title: "LE MONOPOLE ABSOLU",
        description: "Le navigateur qui a tenté de s'emparer du web. Il refuse les standards ouverts.",
        capability: "ACTIVEX INJECTION",
        attack: "Lance des popups et des rayons ActiveX qui balaient l'écran",
        quote: "Vous voulez des standards web ouverts ? Trop tard. JE SUIS le web.",
        quoter: "Couche Présentation",
        color: "#0078D4",
        threatLevel: "ÉLEVÉ"
    },

    // Layer 5 - Session - MSN MESSENGER
    boss_messenger: {
        name: "MSN MESSENGER",
        title: "LE FANTÔME DE VOS CONTACTS",
        description: "Le fantôme des messageries instantanées. Vous êtes connecté. Pour toujours.",
        capability: "NUDGE STORM",
        attack: "Spam de nudges, pluie d'emoticons et requêtes de contact infinies",
        quote: "Vous êtes CONNECTÉ. Pour toujours. Impossible de vous déconnecter.",
        quoter: "Couche Session",
        color: "#7FBA00",
        threatLevel: "ÉLEVÉ"
    },

    // Layer 4 - Transport - WINDOWS UPDATE
    boss_update: {
        name: "WINDOWS UPDATE",
        title: "REDÉMARRAGE FORCÉ",
        description: "La mise à jour qui ne vous laisse pas le choix. Redémarrage dans 10 secondes.",
        capability: "FORCED REBOOT",
        attack: "Flash d'écran, zones de ralentissement et salves de paquets de mise à jour",
        quote: "Téléchargement : 99%... Redémarrage forcé dans 10 secondes.",
        quoter: "Couche Transport",
        color: "#0078D4",
        threatLevel: "CRITIQUE"
    },

    // Layer 3 - Network - NORTON ANTIVIRUS
    boss_norton: {
        name: "NORTON ANTIVIRUS",
        title: "FAUX POSITIF TOTAL",
        description: "L'antivirus paranoïaque qui considère tout comme une menace. Même Linux.",
        capability: "FULL SCAN",
        attack: "Ralentit tout, spawn des faux positifs et crée des zones de quarantaine",
        quote: "MENACE DÉTECTÉE : Linux.iso. QUARANTAINE PERMANENTE.",
        quoter: "Couche Réseau",
        color: "#FFD700",
        threatLevel: "CRITIQUE"
    },

    // Layer 2 - Data Link - HUB 10BASE-T
    boss_hub: {
        name: "HUB 10BASE-T",
        title: "COLLISIONS INFINIES",
        description: "Le hub obsolète qui broadcast tout à tout le monde. Collisions garanties.",
        capability: "BROADCAST CHAOS",
        attack: "Vagues circulaires de broadcasts et projectiles qui se multiplient",
        quote: "Half-duplex. Collisions infinies. Personne ne passe.",
        quoter: "Couche Liaison",
        color: "#C0C0C0",
        threatLevel: "EXTRÊME"
    },

    // Layer 1 - Physical - BILL GATES
    boss_gates: {
        name: "BILL GATES",
        title: "CYBORG HARDWARE LOCK",
        description: "Le boss final : Bill Gates veut verrouiller votre matériel. TPM 2.0 requis.",
        capability: "HARDWARE LOCK",
        attack: "Vérifications TPM, zones Secure Boot et rayons de licence",
        quote: "Votre matériel est trop VIEUX pour Windows 11.",
        quoter: "Couche Physique",
        color: "#0078D4",
        threatLevel: "MAXIMAL"
    },

};

// ============================================================================
// TRANSITIONS - Textes entre les couches OSI
// ============================================================================

export const TRANSITIONS = {
    // Après Layer 7, avant Layer 6
    layer_7_to_6: {
        completedLayer: 7,
        completedName: "APPLICATION",
        nextLayer: 6,
        nextName: "PRESENTATION",
        successMessage: "Couche Application sécurisée !",
        briefing: "La couche Présentation gère le formatage et le chiffrement des données.",
        threat: "Attention : des vulnérabilités SSL/TLS ont été détectées.",
        tip: "Les attaques Heartbleed exploitent les failles de chiffrement.",
        osiInfo: "La couche 6 traduit les données entre le format réseau et le format application (encodage, compression, chiffrement)."
    },

    // Après Layer 6, avant Layer 5
    layer_6_to_5: {
        completedLayer: 6,
        completedName: "PRESENTATION",
        nextLayer: 5,
        nextName: "SESSION",
        successMessage: "Protocoles de chiffrement renforcés !",
        briefing: "La couche Session gère les connexions et les états de communication.",
        threat: "Alerte : tentatives de vol de session détectées.",
        tip: "Protégez vos cookies et tokens d'authentification.",
        osiInfo: "La couche 5 établit, maintient et termine les sessions entre applications (authentification, points de reprise)."
    },

    // Après Layer 5, avant Layer 4
    layer_5_to_4: {
        completedLayer: 5,
        completedName: "SESSION",
        nextLayer: 4,
        nextName: "TRANSPORT",
        successMessage: "Sessions utilisateurs protégées !",
        briefing: "La couche Transport assure la fiabilité des communications.",
        threat: "Danger : attaque DDoS par inondation SYN imminente.",
        tip: "Les SYN floods saturent les connexions TCP.",
        osiInfo: "La couche 4 segmente les données et assure leur livraison fiable (TCP) ou rapide (UDP)."
    },

    // Après Layer 4, avant Layer 3
    layer_4_to_3: {
        completedLayer: 4,
        completedName: "TRANSPORT",
        nextLayer: 3,
        nextName: "NETWORK",
        successMessage: "Connexions TCP/UDP stabilisées !",
        briefing: "La couche Réseau gère l'adressage IP et le routage.",
        threat: "Intrusion : usurpation d'adresses IP détectée.",
        tip: "Le spoofing IP masque l'origine réelle des attaques.",
        osiInfo: "La couche 3 route les paquets entre réseaux différents via les adresses IP et les routeurs."
    },

    // Après Layer 3, avant Layer 2
    layer_3_to_2: {
        completedLayer: 3,
        completedName: "NETWORK",
        nextLayer: 2,
        nextName: "DATA LINK",
        successMessage: "Routage réseau sécurisé !",
        briefing: "La couche Liaison gère les communications au niveau local.",
        threat: "Corruption : empoisonnement des tables ARP en cours.",
        tip: "Les attaques ARP ciblent la résolution MAC-IP.",
        osiInfo: "La couche 2 structure les données en trames et gère l'accès au médium physique via les adresses MAC."
    },

    // Après Layer 2, avant Layer 1
    layer_2_to_1: {
        completedLayer: 2,
        completedName: "DATA LINK",
        nextLayer: 1,
        nextName: "PHYSICAL",
        successMessage: "Tables MAC/ARP nettoyées !",
        briefing: "La couche Physique : le coeur de l'infrastructure.",
        threat: "ALERTE MAXIMALE : Le Guardian du système approche.",
        tip: "Préparez-vous à l'affrontement final.",
        osiInfo: "La couche 1 transmet les bits bruts sur le médium physique (câbles, ondes, signaux électriques)."
    },

    // Victoire finale
    victory: {
        completedLayer: 1,
        completedName: "PHYSICAL",
        nextLayer: 0,
        nextName: "COMPLETE",
        successMessage: "SYSTÈME ENTIÈREMENT SÉCURISÉ !",
        briefing: "Félicitations ! Vous avez défendu les 7 couches OSI.",
        threat: "Aucune menace détectée. Réseau protégé.",
        tip: "Vous maîtrisez maintenant les bases de la sécurité réseau.",
        osiInfo: "Le modèle OSI est le fondement de la compréhension des réseaux. Continuez à apprendre !"
    }
};

// ============================================================================
// LAYER INFO - Informations pédagogiques par couche
// ============================================================================

export const LAYER_INFO = {
    7: {
        name: "Application",
        shortName: "APP",
        color: "#ff0080",
        protocols: ["HTTP", "HTTPS", "FTP", "SMTP", "DNS", "SSH"],
        description: "Interface entre l'utilisateur et le réseau",
        realExample: "Votre navigateur web, client email, applications",
        vulnerabilities: ["Injection SQL", "XSS", "CSRF", "Command Injection"],
        protection: "Validation des entrées, WAF, sanitization"
    },
    6: {
        name: "Presentation",
        shortName: "PRES",
        color: "#ff3366",
        protocols: ["SSL/TLS", "JPEG", "MPEG", "ASCII", "EBCDIC"],
        description: "Traduction et chiffrement des données",
        realExample: "Chiffrement HTTPS, compression d'images",
        vulnerabilities: ["Heartbleed", "POODLE", "BEAST", "Downgrade attacks"],
        protection: "Certificats à jour, TLS 1.3, HSTS"
    },
    5: {
        name: "Session",
        shortName: "SESS",
        color: "#ff6600",
        protocols: ["NetBIOS", "RPC", "PPTP", "SAP"],
        description: "Gestion des sessions et connexions",
        realExample: "Login/logout, tokens de session, cookies",
        vulnerabilities: ["Session hijacking", "Session fixation", "Cookie theft"],
        protection: "Tokens sécurisés, HTTPS only, expiration"
    },
    4: {
        name: "Transport",
        shortName: "TRANS",
        color: "#ffcc00",
        protocols: ["TCP", "UDP", "SCTP", "DCCP"],
        description: "Fiabilité et segmentation des données",
        realExample: "TCP pour web/email, UDP pour streaming/gaming",
        vulnerabilities: ["SYN flood", "UDP flood", "TCP hijacking"],
        protection: "SYN cookies, rate limiting, firewalls"
    },
    3: {
        name: "Network",
        shortName: "NET",
        color: "#00ffcc",
        protocols: ["IP", "ICMP", "IGMP", "IPsec", "BGP", "OSPF"],
        description: "Adressage logique et routage",
        realExample: "Adresses IP, routeurs, Internet",
        vulnerabilities: ["IP spoofing", "Smurf attack", "Route hijacking"],
        protection: "Ingress filtering, uRPF, ACLs"
    },
    2: {
        name: "Data Link",
        shortName: "LINK",
        color: "#00ff88",
        protocols: ["Ethernet", "Wi-Fi", "PPP", "ARP", "STP"],
        description: "Accès au médium et adressage physique",
        realExample: "Switches, adresses MAC, cartes réseau",
        vulnerabilities: ["ARP spoofing", "MAC flooding", "VLAN hopping"],
        protection: "Port security, DAI, 802.1X"
    },
    1: {
        name: "Physical",
        shortName: "PHY",
        color: "#ff0000",
        protocols: ["Ethernet PHY", "USB", "Bluetooth", "DSL", "SONET"],
        description: "Transmission physique des bits",
        realExample: "Câbles, fibres optiques, ondes radio",
        vulnerabilities: ["Wiretapping", "Jamming", "Physical access"],
        protection: "Chiffrement, blindage, accès physique contrôlé"
    }
};

// ============================================================================
// ENEMY DESCRIPTIONS - Descriptions des types d'ennemis
// ============================================================================

export const ENEMY_DESCRIPTIONS = {
    // Layer 7 enemies
    malware: {
        name: "Malware",
        description: "Logiciel malveillant générique",
        tip: "Utilisez un antivirus à jour"
    },
    trojan: {
        name: "Trojan",
        description: "Cheval de Troie déguisé en logiciel légitime",
        tip: "Ne téléchargez que de sources fiables"
    },
    worm: {
        name: "Worm",
        description: "Ver qui se propage automatiquement",
        tip: "Isolez les systèmes infectés"
    },
    ransomware: {
        name: "Ransomware",
        description: "Chiffre vos données contre rançon",
        tip: "Sauvegardez régulièrement vos données"
    },

    // Layer 6 enemies
    mitm: {
        name: "Man-in-the-Middle",
        description: "Intercepte les communications",
        tip: "Vérifiez les certificats HTTPS"
    },

    // Layer 5 enemies
    session_hijack: {
        name: "Session Hijacker",
        description: "Vole les sessions actives",
        tip: "Déconnectez-vous après utilisation"
    },

    // Layer 4 enemies
    syn_packet: {
        name: "SYN Packet",
        description: "Demande de connexion malveillante",
        tip: "Activez les SYN cookies"
    },

    // Layer 3 enemies
    spoofed_ip: {
        name: "Spoofed IP",
        description: "Paquet avec fausse adresse source",
        tip: "Utilisez le filtrage ingress"
    },

    // Layer 2 enemies
    arp_poison: {
        name: "ARP Poison",
        description: "Corrompt les tables ARP",
        tip: "Activez Dynamic ARP Inspection"
    },

    // Layer 1 enemies
    signal_jam: {
        name: "Signal Jammer",
        description: "Perturbe les signaux physiques",
        tip: "Utilisez des fréquences protégées"
    }
};

// ============================================================================
// GAME TIPS - Conseils de gameplay
// ============================================================================

export const GAME_TIPS = [
    "Visez les ennemis les plus proches du bas en priorité",
    "Les boss ont des patterns d'attaque prévisibles - observez et adaptez",
    "Évitez les zones rouges au sol - elles infligent des dégâts continus",
    "Les projectiles boss peuvent être esquivés en bougeant latéralement",
    "Certains boss entrent en rage à 30% de vie - soyez prêt",
    "Les ennemis rapides valent moins de points mais sont plus dangereux",
    "Gardez un oeil sur votre barre de vie - pas de seconde chance",
    "Le score bonus dépend de votre précision et de votre vitesse",
    "Chaque couche OSI a ses propres types de menaces",
    "Apprenez les vulnérabilités pour mieux comprendre la sécurité réseau"
];

// ============================================================================
// ACHIEVEMENT TEXTS - Textes des succès (pour future implémentation)
// ============================================================================

export const ACHIEVEMENT_TEXTS = {
    first_blood: {
        name: "Premier Sang",
        description: "Éliminez votre premier ennemi"
    },
    boss_slayer: {
        name: "Tueur de Boss",
        description: "Vainquez votre premier boss"
    },
    layer_complete: {
        name: "Couche Sécurisée",
        description: "Complétez une couche OSI"
    },
    perfect_wave: {
        name: "Vague Parfaite",
        description: "Terminez une vague sans prendre de dégâts"
    },
    speedrunner: {
        name: "Speedrunner",
        description: "Terminez une vague en moins de 30 secondes"
    },
    sharpshooter: {
        name: "Tireur d'Élite",
        description: "Atteignez 95% de précision sur une vague"
    },
    survivor: {
        name: "Survivant",
        description: "Terminez le jeu avec moins de 10% de vie"
    },
    network_master: {
        name: "Maître du Réseau",
        description: "Défendez les 7 couches OSI"
    }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Récupère les données d'intro pour un boss donné
 * @param {string} bossId - L'identifiant du boss
 * @returns {Object|null} Les données d'intro ou null si non trouvé
 */
export function getBossIntro(bossId) {
    return BOSS_INTROS[bossId] || null;
}

/**
 * Récupère les données de transition entre deux couches
 * @param {number} fromLayer - La couche complétée
 * @param {number} toLayer - La prochaine couche
 * @returns {Object|null} Les données de transition ou null
 */
export function getTransition(fromLayer, toLayer) {
    if (fromLayer === 1 && toLayer === 0) {
        return TRANSITIONS.victory;
    }
    const key = `layer_${fromLayer}_to_${toLayer}`;
    return TRANSITIONS[key] || null;
}

/**
 * Récupère les informations d'une couche OSI
 * @param {number} layer - Le numéro de couche (1-7)
 * @returns {Object|null} Les informations de la couche
 */
export function getLayerInfo(layer) {
    return LAYER_INFO[layer] || null;
}

/**
 * Récupère un conseil de jeu aléatoire
 * @returns {string} Un conseil de jeu
 */
export function getRandomTip() {
    return GAME_TIPS[Math.floor(Math.random() * GAME_TIPS.length)];
}

/**
 * Récupère la description d'un type d'ennemi
 * @param {string} enemyType - Le type d'ennemi
 * @returns {Object|null} La description de l'ennemi
 */
export function getEnemyDescription(enemyType) {
    return ENEMY_DESCRIPTIONS[enemyType] || null;
}
