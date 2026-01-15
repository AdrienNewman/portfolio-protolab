// ============================================
// SAGE CONFIG: Raspberry Pi
// Micro-Ordinateur Éducatif
// Généré automatiquement par MCP Tools
// ============================================

export const sage_rpi = {
  // Identité
  id: 'sage_rpi',
  name: 'Raspberry Pi',
  title: 'Micro-Ordinateur Éducatif',
  portrait: '/images/game/sages/RaspBerry_mentor.jpg',

  // Apparition
  appearsAfterBoss: 'boss_hub',  // Layer 2 - Hub 10BASE-T
  isIntroSage: false,

  // Dialogues
  introDialogue: `Salutations, jeune OSI. Je suis Raspberry Pi, Gardien du Hardware Ouvert.

Bienvenue en Deuxième Couche - Data Link. C'est ici que les paquets IP deviennent des trames Ethernet. Les adresses MAC identifient les cartes réseau, ARP résout les correspondances, les switches apprennent et routent intelligemment... Le lien physique entre les machines.

Mais cette couche est bloquée par de l'obsolescence forcée. Un hub préhistorique cause des collisions infinies. Half-duplex, broadcast aveugle sur tous les ports, 10 Mbps maximum... alors que le Gigabit existe depuis 20 ans.

Prends ce module - Smart Switching Protocol. Il remplacera le chaos par l'intelligence.

Un dinosaure réseau approche. Il ne comprend pas le full-duplex. Collision. Retry. Collision. Retry. Infiniment.

50€ pour changer le monde. Pas besoin de plus.`,

  postBossDialogue: `Excellent travail, jeune OSI.

Le Hub Préhistorique s'est éteint. Plus de collisions CSMA/CD à chaque transmission, plus de broadcast aveugle saturant tous les ports, plus de half-duplex bridant les débits. Ses LED orange clignotant en mode panique... éteintes pour toujours.

La Deuxième Couche - Data Link - est libérée. Les trames Ethernet peuvent maintenant circuler intelligemment via des switches. Full-duplex, apprentissage des tables MAC, VLANs pour segmenter... 1000 Mbps au lieu de 10. Tout ça avec du matériel ouvert, documenté, £35.

Les adresses physiques respirent enfin.

Descends vers la Première Couche - Physical. Le matériel brut. Les signaux électriques, les bits sur le cuivre... Un seigneur veut verrouiller le silicium même.

Built, not bought. Always.`,

  // Visuel
  backgroundColor: '#1a1a2e',
  accentColor: '#C51A4A',

  // Pouvoirs associés (IDs)
  powers: ['power_gpio_boost', 'power_overclock'],
};
