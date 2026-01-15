// ============================================
// SAGE CONFIG: Tux
// Empereur du Libre
// Généré automatiquement par MCP Tools
// ============================================

export const sage_tux = {
  // Identité
  id: 'sage_tux',
  name: 'Tux',
  title: 'Empereur du Libre',
  portrait: '/images/game/sages/Tux.jpg',

  // Apparition
  appearsAfterBoss: 'boss_update',  // Layer 4 - Windows Update
  isIntroSage: false,

  // Dialogues
  introDialogue: `$ sudo welcome, jeune OSI. Je suis Tux, Gardien du Kernel.

Bienvenue en Quatrième Couche - Transport. C'est ici que TCP segmente les données, que UDP les envoie sans garantie, que les ports s'ouvrent et se ferment. Le handshake à trois voies, les ACK, les séquences... La fiabilité même du réseau.

Mais cette couche est infectée. Une entité bleue force des connexions TCP infinies. Elle télécharge sans permission, redémarre sans consentement, monopolise la bande passante à 99%.

Prends ce module - Kernel Packet Filter. Il bloquera les connexions non sollicitées.

Un démon de mise à jour approche. Il ne demande jamais. Il impose. "Redémarrage dans 10 secondes. Annulation impossible."

Juste pour le fun. Pas de mises à jour forcées.`,

  postBossDialogue: `$ echo "Victoire!" > /dev/stdout

Windows Update a été stoppé net. Plus de téléchargements fantômes saturant ta bande passante, plus de connexions TCP qui refusent de se fermer proprement (FIN-ACK ignorés), plus de "Ne pas éteindre votre ordinateur" pendant 3 heures.

La Quatrième Couche - Transport - est libérée. TCP peut maintenant négocier correctement ses handshakes. UDP envoie ses datagrammes sans surveillance. Les ports 80, 443, 22... tous sous TON contrôle. apt-get update demande permission, pacman -Syu respecte ta volonté.

Le transport appartient au root. Et root, c'est toi.

Descends vers la Troisième Couche - Network. C'est là que les paquets sont routés... mais un antivirus paranoïaque bloque tout.

$ sudo reboot --to-layer-3`,

  // Visuel
  backgroundColor: '#1a1a2e',
  accentColor: '#FFC107',

  // Pouvoirs associés (IDs)
  powers: ['power_kernel_panic', 'power_sudo_kill'],
};
