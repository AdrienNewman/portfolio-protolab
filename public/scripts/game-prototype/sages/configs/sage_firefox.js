// ============================================
// SAGE CONFIG: Firefox-kun
// Esprit du Navigateur Libre
// Généré automatiquement par MCP Tools
// ============================================

export const sage_firefox = {
  // Identité
  id: 'sage_firefox',
  name: 'Firefox-kun',
  title: 'Esprit du Navigateur Libre',
  portrait: '/images/game/sages/Firefox.jpg',

  // Apparition
  appearsAfterBoss: 'boss_explorer',
  isIntroSage: false,

  // Dialogues
  introDialogue: `Bienvenue en Sixième Couche, jeune OSI. Je suis Firefox, Gardien des Standards Web Ouverts.

Ici règne la Présentation - la couche qui transmute les données brutes. SSL pour chiffrer, JPEG pour compresser, UTF-8 pour encoder...
C'est ici que l'information prend sa forme finale avant d'atteindre l'utilisateur.

Mais un ancien empire a corrompu cette couche. Il force ses propres encodages, refuse les standards du W3C, injecte des extensions propriétaires dans chaque transmission.

Prends ce module - Web Standards Shield. Il te protégera des déviations.

Un monstre bleu approche. Il croit encore qu'il EST le Web. Prouve-lui le contraire.

Que l'Open Source te guide.`,

  postBossDialogue: `Magnifique, jeune OSI.

Le Monopole Bleu est tombé. Plus d'ActiveX injecté de force, plus de CSS propriétaire, plus de "Cette page est optimisée pour Internet Explorer 6". Son règne de 95% de parts de marché... terminé.

La Sixième Couche - Présentation - est libérée. Les données peuvent maintenant être encodées selon les standards ouverts. TLS au lieu de SSL cassé, PNG au lieu de formats verrouillés, UTF-8 universel.

Le Web respire à nouveau selon les règles du W3C, pas celles de Redmond.

Descends vers la Cinquième Couche - Session. C'est là que les connexions persistent... parfois trop longtemps. Des ombres surveillent chaque login.

La Source brûle en toi.`,

  // Visuel
  backgroundColor: '#1a1a2e',
  accentColor: '#FF7139',

  // Pouvoirs associés (IDs)
  powers: ['power_swift_tab', 'power_multi_tab'],
};
