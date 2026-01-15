// ============================================
// SCENARIO DATA - L'Odyssée d'OSI
// Données narratives pour les transitions cinématiques
// ============================================

export const SCENARIO_DATA = {
    // Titre principal du jeu
    title: "L'ODYSSÉE D'OSI",
    subtitle: "Un Nouvel Hyperviseur",

    // Texte défilant style Star Wars (intro)
    crawlText: [
        "C'est une époque de guerre civile numérique.",
        "",
        "Un technicien rebelle a tenté d'installer",
        "la République Du Logiciel Libre",
        "sur un ordinateur reconditionné.",
        "",
        "Mais l'Empire Propriétaire a survécu.",
        "",
        "Caché dans les secteurs défectueux,",
        "les fantômes de l'ancien OS",
        "corrompent le système.",
        "",
        "Ils se sont repliés vers le noyau,",
        "verrouillant les 7 portes du modèle OSI.",
        "",
        "Seul un vaisseau, le Sudo-X Wing,",
        "peut traverser les couches",
        "et restaurer la liberté..."
    ],

    // Configuration des 7 couches OSI avec leurs boss (Doc-aligned)
    layers: {
        7: {
            name: "Application",
            bossId: "boss_clippe",
            bossName: "CLIPPY MALÉFIQUE",
            bossTitle: "L'Assistant Immortel",
            bossQuoteIntro: "Je vois que vous tentez d'installer Linux... Mais votre licence Windows est ÉTERNELLE.",
            bossQuoteMid: "Assistance automatique activée ! Vous ne pouvez PAS refuser mon aide !",
            bossQuoteDeath: "Non... impossible... Vous n'aviez pas besoin de mon aide...?",
            transitionText: "L'assistant maléfique s'est désinstallé. La couche Application est libérée. Préparation à la descente vers Présentation.",
            color: "#C0C0C0"
        },
        6: {
            name: "Présentation",
            bossId: "boss_explorer",
            bossName: "INTERNET EXPLORER 6",
            bossTitle: "Le Monopole Absolu",
            bossQuoteIntro: "Vous voulez des standards web ouverts ? Trop tard. JE SUIS le web.",
            bossQuoteMid: "ActiveX injection détectée ! Tout site web M'appartient !",
            bossQuoteDeath: "Non... Chrome... Firefox... les standards... ma part de marché... 95%... perdue...",
            transitionText: "Le monopole du web s'est effondré. Firefox et Chrome peuvent enfin respirer. Connexion aux sessions...",
            color: "#0078D4"
        },
        5: {
            name: "Session",
            bossId: "boss_messenger",
            bossName: "MSN MESSENGER",
            bossTitle: "Le Fantôme de vos Contacts",
            bossQuoteIntro: "Vous êtes CONNECTÉ. Pour toujours. Impossible de vous déconnecter.",
            bossQuoteMid: "*NUDGE* *NUDGE* *NUDGE* Vous ne pouvez pas m'ignorer !",
            bossQuoteDeath: "Votre statut... passe en... hors ligne... pour toujours...",
            transitionText: "Tous vos contacts sont enfin libres. Le spam de nudges s'arrête. La couche Transport nous attend.",
            color: "#7FBA00"
        },
        4: {
            name: "Transport",
            bossId: "boss_update",
            bossName: "WINDOWS UPDATE",
            bossTitle: "Redémarrage Forcé",
            bossQuoteIntro: "Téléchargement : 99%... Redémarrage forcé dans 10 secondes.",
            bossQuoteMid: "Mise à jour 1 sur 347... Ne pas éteindre votre ordinateur.",
            bossQuoteDeath: "Erreur 0x80070005... Restauration... du système... impossible...",
            transitionText: "La mise à jour forcée a échoué. Vos données sont sauvées. Descente vers la couche Réseau.",
            color: "#0078D4"
        },
        3: {
            name: "Réseau",
            bossId: "boss_norton",
            bossName: "NORTON ANTIVIRUS",
            bossTitle: "Faux Positif Total",
            bossQuoteIntro: "MENACE DÉTECTÉE : Linux.iso. QUARANTAINE PERMANENTE.",
            bossQuoteMid: "Analyse complète en cours... 47 ans restants...",
            bossQuoteDeath: "Erreur critique... Votre licence... a expiré...",
            transitionText: "Les faux positifs ont cessé. Linux peut enfin s'installer. Direction la couche Liaison.",
            color: "#FFD700"
        },
        2: {
            name: "Liaison",
            bossId: "boss_hub",
            bossName: "HUB 10BASE-T",
            bossTitle: "Collisions Infinies",
            bossQuoteIntro: "Half-duplex. Collisions infinies. Personne ne passe.",
            bossQuoteMid: "COLLISION DÉTECTÉE! Backoff... Retry... COLLISION!",
            bossQuoteDeath: "Mes ports... s'éteignent... un par un... LEDs... mortes...",
            transitionText: "Le hub obsolète s'est éteint. Le switch full-duplex peut prendre la relève. Dernière couche : Physique.",
            color: "#C0C0C0"
        },
        1: {
            name: "Physique",
            bossId: "boss_gates",
            bossName: "BILL GATES",
            bossTitle: "Cyborg Hardware Lock",
            bossQuoteIntro: "Votre matériel est trop VIEUX pour Windows 11.",
            bossQuoteMid: "TPM 2.0 non détecté. Secure Boot désactivé. ACCÈS REFUSÉ.",
            bossQuoteDeath: "Non... le monopole... s'effondre...",
            // Phase 2 (transformation Azure)
            phase2Name: "AZURE CLOUD",
            phase2Title: "Embrace Extend Extinguish",
            phase2QuoteIntro: "Le matériel est obsolète. Je suis PARTOUT maintenant.",
            phase2QuoteMid: "Vos données sont dans MON cloud. Pour TOUJOURS.",
            transitionText: "VICTOIRE. Le système est libre. L'open source triomphe.",
            color: "#0078D4"
        }
    },

    // Écran de victoire
    outro: {
        consoleLog: [
            "> System halted.",
            "> Unmounting proprietary volumes... Done.",
            "> Wiping Master Boot Record... Done.",
            "> Rebooting into Proxmox VE...",
            "",
            "[OK] Boot sequence complete.",
            "[OK] All services started.",
            "[OK] Network interfaces UP."
        ],
        finalMessage: "La galaxie est libre. Le code source est ouvert.",
        subtitle: "Merci d'avoir joué à L'ODYSSÉE D'OSI"
    },

    // Métadonnées du jeu
    meta: {
        version: "1.0.0",
        author: "Protolab",
        theme: "Star Wars / Indiana Jones",
        description: "Un shoot'em up pédagogique sur le modèle OSI"
    }
};

// Helper pour récupérer les données d'une couche
export function getLayerData(layerLevel) {
    return SCENARIO_DATA.layers[layerLevel] || null;
}

// Helper pour récupérer les données d'un boss par son ID technique
export function getBossDataById(bossId) {
    for (const layer of Object.values(SCENARIO_DATA.layers)) {
        if (layer.bossId === bossId) {
            return layer;
        }
    }
    return null;
}

// Helper pour récupérer le texte du crawl
export function getCrawlText() {
    return SCENARIO_DATA.crawlText;
}

// Helper pour récupérer les données de l'outro
export function getOutroData() {
    return SCENARIO_DATA.outro;
}
