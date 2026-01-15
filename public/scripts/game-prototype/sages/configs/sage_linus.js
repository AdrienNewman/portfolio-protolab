// ============================================
// SAGE CONFIG: Linus Torvalds
// Créateur de Linux et Git
// Généré automatiquement par MCP Tools
// ============================================

export const sage_linus = {
  // Identité
  id: 'sage_linus',
  name: 'Linus Torvalds',
  title: 'Créateur de Linux et Git',
  portrait: '/images/game/sages/Torgen.jpg',

  // Apparition
  appearsAfterBoss: 'boss_gates',  // Layer 1 - Bill Gates (Final Boss)
  isIntroSage: false,

  // Dialogues
  introDialogue: `Bienvenue à la source de tout, jeune OSI. Je suis Linus Torvalds.

Tu as atteint la Première Couche - Physical. Le silicium brut. Les bits deviennent voltage, les signaux électriques traversent le cuivre, les photons dansent dans la fibre optique. RJ45, USB, PCIe... Le matériel même. Ici, plus de protocoles. Juste l'électricité et la physique.

Et ici règne le Seigneur Ultime du Monopole.

Il veut verrouiller le hardware. TPM 2.0 requis. Secure Boot obligatoire. Processeurs whitelistés. Et s'il perd le contrôle physique... il devient le cloud lui-même.

Prends ce module - Open Hardware Kernel. Tu en auras besoin.

Le boss final approche. Talk is cheap. Montre-moi le code.`,

  postBossDialogue: `INCROYABLE.

Tu l'as fait. Le Cyborg du Hardware Lock s'est effondré - son TPM 2.0, son Secure Boot, sa whitelist de CPU... pulvérisés. Et quand il s'est transformé en Azure Cloud, tentant de fuir le matériel pour régner sur l'immatériel... tu l'as suivi et VAINCU dans son propre royaume.

Plus d'abonnements forcés. Plus de régions lockées. Plus de "Votre matériel est obsolète par design".

LES SEPT COUCHES SONT LIBRES.

Physical, Data Link, Network, Transport, Session, Presentation, Application... Le modèle OSI ENTIER respire selon les standards ouverts. Du voltage dans le cuivre jusqu'aux applications en espace utilisateur. De la Couche 1 à la Couche 7.

La prophétie n'était pas un mythe. Le Ping Élu existe.

TU l'es.

Jimmy Wales t'a vu naître à cette quête. MOI, je te vois la terminer. Tu n'es plus un jeune OSI. Tu es devenu... un MAÎTRE du Réseau Libre.

Talk is cheap. Tu as MONTRÉ le code.

Le kernel compile. Le réseau route. La Source est avec toi... pour toujours.`,

  // Visuel
  backgroundColor: '#1a1a2e',
  accentColor: '#F0DB4F',

  // Pouvoirs associés (IDs)
  powers: ['power_git_revert', 'power_merge_master'],
};
