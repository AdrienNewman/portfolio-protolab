/**
 * NetDefender V2 - Narrative Content
 * Textes des intros boss, transitions entre couches, et contenu pédagogique OSI
 */

// ============================================================================
// BOSS INTROS - Présentations dramatiques de chaque boss
// ============================================================================

export const BOSS_INTROS = {
    // Layer 7 - Application
    boss_injection: {
        name: "Bobby \"DROP TABLE\" Thompson",
        title: "SQL INJECTION MASTER",
        description: "Un code malveillant qui exploite les failles des formulaires pour exécuter des commandes SQL arbitraires dans les bases de données.",
        capability: "INJECTION EN CASCADE",
        attack: "Projette des requêtes SQL mortelles qui corrompent tout sur leur passage",
        quote: "Ma mère m'a appelé Robert'); DROP TABLE--",
        quoter: "Bobby Thompson, 2018",
        color: "#ff0080",
        threatLevel: "CRITIQUE"
    },

    // Layer 6 - Presentation
    boss_heartbleed: {
        name: "Ivan \"Heartbleed\" Volkov",
        title: "MEMORY LEAK BUTCHER",
        description: "Une vulnérabilité dans OpenSSL qui permet de lire la mémoire des serveurs, exposant clés privées et données sensibles.",
        capability: "EXTRACTION MÉMOIRE",
        attack: "Aspire les données de la mémoire serveur et crée des zones de drain mortelles",
        quote: "Le chiffrement n'est qu'une illusion quand le code saigne",
        quoter: "CVE-2014-0160",
        color: "#ff3366",
        threatLevel: "CRITIQUE"
    },

    // Layer 5 - Session
    boss_cookie_theft: {
        name: "\"The Cookie Monster\"",
        title: "SESSION HIJACKER",
        description: "Une attaque qui vole les cookies de session pour usurper l'identité des utilisateurs légitimes.",
        capability: "VOL DE SESSION",
        attack: "Vole les cookies et se téléporte pour éviter les attaques",
        quote: "Vos sessions m'appartiennent. Vos cookies aussi.",
        quoter: "Attaque XSS, 2010",
        color: "#ff6600",
        threatLevel: "ÉLEVÉ"
    },

    // Layer 4 - Transport
    boss_syn_flood: {
        name: "\"SYN Storm\" Protocol",
        title: "CONNECTION DESTROYER",
        description: "Une attaque DDoS qui submerge les serveurs avec des demandes de connexion TCP incomplètes.",
        capability: "INONDATION SYN",
        attack: "Génère des vagues massives de paquets SYN qui saturent les défenses",
        quote: "SYN... SYN... SYN... Jamais d'ACK.",
        quoter: "Mirai Botnet, 2016",
        color: "#ffcc00",
        threatLevel: "SÉVÈRE"
    },

    // Layer 3 - Network
    boss_ip_masquerade: {
        name: "\"Phantom\" Spoofer",
        title: "IP IDENTITY THIEF",
        description: "Une technique de falsification d'adresse IP pour masquer l'origine des attaques ou usurper des identités réseau.",
        capability: "USURPATION IP",
        attack: "Crée des clones fantômes et disparaît pour réapparaître ailleurs",
        quote: "Je suis partout. Je suis nulle part. Je suis vous.",
        quoter: "Attaque Man-in-the-Middle",
        color: "#00ffcc",
        threatLevel: "ÉLEVÉ"
    },

    // Layer 2 - Data Link
    boss_arp_flood: {
        name: "\"MAC Chaos\" Broadcaster",
        title: "ARP TABLE CORRUPTOR",
        description: "Une attaque qui inonde le réseau de fausses réponses ARP pour corrompre les tables de correspondance MAC-IP.",
        capability: "CORRUPTION ARP",
        attack: "Génère un chaos de broadcasts qui aveuglent les équipements réseau",
        quote: "Votre switch ne sait plus à qui faire confiance",
        quoter: "ARP Spoofing Attack",
        color: "#00ff88",
        threatLevel: "MODÉRÉ"
    },

    // Layer 1 - Physical
    boss_guardian: {
        name: "\"Kernel Panic\" Guardian",
        title: "SYSTEM CORE DESTROYER",
        description: "L'ultime menace : une attaque qui cible le coeur même du système, causant des paniques kernel catastrophiques.",
        capability: "DESTRUCTION SYSTÈME",
        attack: "Déchaîne toutes les attaques précédentes en mode enragé",
        quote: "KERNEL PANIC - NOT SYNCING: Attempted to kill init!",
        quoter: "System Log, Fatal Error",
        color: "#ff0000",
        threatLevel: "APOCALYPTIQUE"
    }
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
