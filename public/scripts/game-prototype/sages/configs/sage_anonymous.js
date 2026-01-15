// ============================================
// SAGE CONFIG: Anonymous
// Légion de l'Ombre
// Généré automatiquement par MCP Tools
// ============================================

export const sage_anonymous = {
  // Identité
  id: 'sage_anonymous',
  name: 'Anonymous',
  title: "Légion de l'Ombre",
  portrait: '/images/game/sages/anonymus.jpg',

  // Apparition
  appearsAfterBoss: 'boss_norton',  // Layer 3 - Norton Antivirus
  isIntroSage: false,

  // Dialogues
  introDialogue: `Nous sommes Anonymous. Bienvenue en Troisième Couche, jeune OSI.

Ici règne le Network - la couche du routage. IP attribue les adresses, ICMP vérifie les chemins, les routeurs décident des routes. BGP connecte les réseaux, traceroute révèle les sauts... C'est ici que les paquets trouvent leur chemin à travers le monde.

Mais cette couche est sous surveillance paranoïaque. Un gardien jaune scanne chaque paquet. Il croit que TOUT est une menace. Linux.iso ? VIRUS. OpenVPN.exe ? MALWARE. Chaque ping est suspect.

Prends ce module - Anonymous Routing Protocol. Il masquera tes paquets.

Un faux protecteur approche. Il ne protège rien. Il bloque tout. Quarantaine permanente.

Nous sommes Légion. Nous ne pardonnons pas les scans abusifs.`,

  postBossDialogue: `Victoire collective, jeune OSI.

Le Bouclier Jaune s'est effondré. Plus de "MENACE DÉTECTÉE" sur chaque fichier .iso, plus d'analyses système qui consomment 100% du CPU pendant des heures, plus de quarantaine de tes propres paquets légitimes. Ses faux positifs... terminés.

La Troisième Couche - Network - est libérée. Les paquets IP peuvent enfin circuler sans inspection paranoïaque. ICMP ping répond librement, traceroute révèle les vraies routes, BGP annonce les préfixes sans blocage. iptables au lieu de pare-feu hystérique.

Le routage appartient au réseau, pas aux licences annuelles.

Descends vers la Deuxième Couche - Data Link. C'est là que les trames sont formées, que les MAC addresses parlent... Mais un hub obsolète cause des collisions infinies.

Nous sommes partout. Expect us.`,

  // Visuel
  backgroundColor: '#1a1a2e',
  accentColor: '#00FF00',

  // Pouvoirs associés (IDs)
  powers: ['power_ddos_mode', 'power_ghost_mode'],
};
