// ============================================
// SAGE CONFIG: Edward Snowden & Julian Assange
// Les Lanceurs d'Alerte
// Généré automatiquement par MCP Tools
// ============================================

export const sage_duo = {
  // Identité
  id: 'sage_duo',
  name: 'Edward Snowden & Julian Assange',
  title: 'Les Lanceurs d\'Alerte',
  portrait: '/images/game/sages/snowden_assange.jpg',

  // Apparition
  appearsAfterBoss: 'boss_messenger',  // Layer 5 - MSN Messenger
  isIntroSage: false,

  // Dialogues
  introDialogue: `Nous sommes Snowden et Assange. Bienvenue en Cinquième Couche, jeune OSI.

Ici règne la Session - la couche qui maintient les connexions vivantes. NetBIOS, RPC, les tokens d'authentification... C'est ici que ton login persiste, que tes cookies te reconnaissent, que les états de connexion sont mémorisés.

Mais cette couche a été détournée. Un fantôme vert surveille chaque connexion. Il refuse de te déconnecter, traque tes contacts, enregistre chaque statut. Les sessions ne se terminent jamais... même quand tu le veux.

Prends ce module - Session Privacy Lock. Il protégera tes états de connexion.

Un messager corrompu approche. Il veut que tu restes connecté... pour toujours.

La vérité doit circuler librement.`,

  postBossDialogue: `Bravo, jeune OSI.

Le Fantôme Vert est exorcisé. Plus de nudges invasifs, plus de tracking de statuts "absent/occupé/en ligne", plus de Winks espions. Fini les sessions infinies qui refusaient de se terminer, fini la surveillance de chaque contact.

La Cinquième Couche - Session - est libérée. Les connexions peuvent maintenant s'établir et se terminer proprement. Les tokens expirent comme ils le doivent. Les cookies respectent la vie privée. XMPP ouvert au lieu de protocoles fermés.

Les états de session t'appartiennent à nouveau.

Descends vers la Quatrième Couche - Transport. C'est là que les données sont segmentées, vérifiées, acheminées... Mais des mises à jour forcées corrompent les flux TCP.

Que la Source protège ta connexion.`,

  // Visuel
  backgroundColor: '#1a1a2e',
  accentColor: '#58CC02',

  // Pouvoirs associés (IDs)
  powers: ['power_streak_freeze', 'power_xp_burst'],
};
