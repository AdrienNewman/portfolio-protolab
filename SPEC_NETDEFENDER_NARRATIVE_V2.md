---
title: "NetDefender V2 - Spécification Narrative Enrichie"
description: "Documentation complète de l'arc narratif 'Formation SysAdmin' avec boss, ennemis, transitions et easter eggs"
category: web-front
date: 2025-12-28
version: 2.0.0
author: Adrien Mercadier
status: EN VALIDATION
---

# NetDefender V2 - Arc Narratif "Formation SysAdmin"

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture Narrative](#architecture-narrative)
3. [Spécifications par Couche OSI](#spécifications-par-couche-osi)
4. [Écrans de Transition](#écrans-de-transition)
5. [Easter Eggs & Références](#easter-eggs--références)
6. [Modifications Techniques Requises](#modifications-techniques-requises)
7. [Plan d'Implémentation](#plan-dimplémentation)
8. [Checklist de Validation](#checklist-de-validation)

---

## Vue d'ensemble

### Concept Principal

**NetDefender V2** transforme le mini-jeu en **expérience pédagogique immersive** où chaque couche OSI devient un module de formation avec :

- ✅ Un **boss thématique** incarnant la menace principale de la couche
- ✅ Des **ennemis réalistes** basés sur des protocoles et vulnérabilités réels
- ✅ Des **écrans de transition pédagogiques** expliquant les concepts OSI
- ✅ Des **easter eggs** référençant la culture tech/cybersec

### Objectifs Pédagogiques

1. **Comprendre le modèle OSI** de manière ludique et mémorable
2. **Identifier les vulnérabilités réelles** par couche
3. **Reconnaître les protocoles** et leurs failles
4. **Créer du storytelling** autour de concepts techniques

### Ton Narratif

**"Formation SysAdmin en Temps Réel"** - Mélange de :
- 🎓 Pédagogie technique (tutoriel gamifié)
- 💻 Ambiance incident de production (logs système)
- 🎮 Références geek/culture hacker
- 😄 Humour technique (easter eggs)

---

## Architecture Narrative

### Menu Start (Écran d'Accueil)

```
╔════════════════════════════════════════════╗
║  SIMULATION NETDEFENDER™                  ║
║  Programme de Formation Protolab          ║
╠════════════════════════════════════════════╣
║                                            ║
║  Bienvenue dans le simulateur de crise    ║
║  réseau le plus réaliste du marché.       ║
║                                            ║
║  Objectif : Comprendre comment défendre   ║
║  CHAQUE COUCHE du modèle OSI en situation ║
║  d'attaque réelle.                         ║
║                                            ║
║  Note : Aucun réseau réel n'a été         ║
║  endommagé durant cette simulation.       ║
║                                            ║
║  >>> COMMENCER LA FORMATION <<<           ║
║  >>> VOIR LE HALL OF FAME <<<             ║
║  >>> CRÉDITS & RÉFÉRENCES <<<             ║
╚════════════════════════════════════════════╝

[03:47:22] SYSTÈME : Initialisation du module 1/7
[03:47:23] ALERTE : Intrusion L7 détectée sur Protolab
[03:47:24] ACTION REQUISE : Lancer contre-offensive
```

**Éléments techniques :**
- Animation de typing effect pour les logs
- Couleurs : cyan (#00ffff) pour les actions, jaune (#ffff00) pour les alertes
- Font : Monospace (style terminal)
- Effet sonore : Bip clavier mécanique à l'affichage

---

## Spécifications par Couche OSI

### 🔴 COUCHE 7 - APPLICATION

#### Boss : Bobby "DROP TABLE" Thompson

**Caractéristiques Techniques**

| Propriété | Valeur |
|-----------|--------|
| Type | `boss_bobby_droptable` |
| Nom Complet | Bobby "DROP TABLE" Thompson |
| HP | 150 |
| Speed | 1.5 |
| Points | 5000 |
| Behavior | `boss_injection` (nouveau) |
| Size | 80px |
| Couleur | Magenta (#ff0080) |

**Comportement Boss `boss_injection`**
```javascript
// Mouvement sinusoïdal lent + projection de "requêtes SQL"
// Toutes les 2 secondes : tire 3 projectiles en éventail
// Pattern de mouvement : descend de 30% de l'écran puis oscille horizontalement
```

**Intro Boss (Écran Modal)**
```
╔═══════════════════════════════════════════════╗
║ [ALERTE BOSS DÉTECTÉ]                        ║
║                                               ║
║ Signature reconnue dans les logs :           ║
║ Bobby "DROP TABLE" Thompson                  ║
║                                               ║
║ Connu pour avoir vidé la base de données     ║
║ de 3 banques en une seule requête SQL...     ║
║                                               ║
║ Capacité spéciale : INJECTION EN CASCADE     ║
║ Attaque : Projette des requêtes SQL mortelles║
║                                               ║
║ Citation :                                    ║
║ "Ma mère m'a appelé Robert'); DROP TABLE--"  ║
║                     - Bobby Thompson, 2018   ║
║                                               ║
║         [ESPACE] ENGAGER LE COMBAT           ║
╚═══════════════════════════════════════════════╝
```

**Projectile Boss**
- Type : `sql_query`
- Apparence : Texte défilant `"DROP TABLE;"` avec effet glow magenta
- Vitesse : 4px/frame
- Dégâts : 15 HP

**Easter Egg**
- Citation XKCD #327 affichée aléatoirement pendant le combat
- Si vaincu avec >80% HP restant : Achievement "Bobby Tables Hunter"

#### Nouveaux Ennemis L7

##### 1. HTTP Flooder
```javascript
{
    type: 'http_flood',
    name: 'HTTP Flooder',
    health: 1,
    speed: 4.0,
    points: 50,
    behavior: 'swarm',
    size: 25,
    icon: '📡',
    description: 'Saturation de requêtes HTTP GET/POST'
}
```

##### 2. DNS Smuggler
```javascript
{
    type: 'dns_tunneling',
    name: 'DNS Smuggler',
    health: 2,
    speed: 2.5,
    points: 100,
    behavior: 'teleport',
    size: 28,
    icon: '🕳️',
    description: 'Exfiltration de données via requêtes DNS'
}
```

##### 3. Spam Cannon
```javascript
{
    type: 'smtp_spam',
    name: 'Spam Cannon',
    health: 2,
    speed: 3.0,
    points: 75,
    behavior: 'zigzag',
    size: 30,
    icon: '📧',
    description: 'Botnet d\'envoi de spam SMTP'
}
```

##### 4. FTP Bouncer
```javascript
{
    type: 'ftp_bounce',
    name: 'FTP Bouncer',
    health: 3,
    speed: 2.0,
    points: 120,
    behavior: 'diagonal',
    size: 32,
    icon: '📂',
    description: 'Exploitation FTP Bounce Attack'
}
```

##### 5. NTP Bomber
```javascript
{
    type: 'ntp_amplifier',
    name: 'NTP Bomber',
    health: 4,
    speed: 1.5,
    points: 150,
    behavior: 'slow_tank',
    size: 40,
    icon: '⏰',
    description: 'Amplification NTP (facteur x556)'
}
```

##### 6. LDAP Phantom
```javascript
{
    type: 'ldap_injector',
    name: 'LDAP Phantom',
    health: 3,
    speed: 2.2,
    points: 130,
    behavior: 'phase',
    size: 30,
    icon: '👻',
    description: 'Injection LDAP dans annuaire'
}
```

##### 7. VoIP Crasher
```javascript
{
    type: 'sip_vomit',
    name: 'VoIP Crasher',
    health: 2,
    speed: 3.5,
    points: 90,
    behavior: 'erratic',
    size: 28,
    icon: '📞',
    description: 'SIP INVITE flood attack'
}
```

##### 8. Query Hog
```javascript
{
    type: 'graphql_abuser',
    name: 'Query Hog',
    health: 5,
    speed: 1.0,
    points: 200,
    behavior: 'slow_tank',
    size: 45,
    icon: '🐷',
    description: 'GraphQL nested query abuse'
}
```

**Configuration Vague L7**
```javascript
{
    layer: 7,
    name: 'APPLICATION',
    color: '#ff0080',
    enemies: [
        { type: 'sql_injection', count: 3 },      // Original
        { type: 'xss', count: 3 },                // Original
        { type: 'csrf', count: 2 },               // Original
        { type: 'http_flood', count: 5 },         // NOUVEAU - Swarm
        { type: 'dns_tunneling', count: 2 },      // NOUVEAU
        { type: 'smtp_spam', count: 3 },          // NOUVEAU
        { type: 'ftp_bounce', count: 2 },         // NOUVEAU
        { type: 'ntp_amplifier', count: 1 },      // NOUVEAU - Tank
        { type: 'ldap_injector', count: 2 },      // NOUVEAU
        { type: 'sip_vomit', count: 3 },          // NOUVEAU
        { type: 'graphql_abuser', count: 1 }      // NOUVEAU - Mini-boss
    ],
    boss: {
        type: 'boss_bobby_droptable',
        spawnAfter: 25  // Après 25 ennemis tués
    },
    spawnDelay: 1200,  // 1.2s entre chaque spawn
    totalEnemies: 27
}
```

---

### 🔴 COUCHE 6 - PRÉSENTATION

#### Boss : Ivan "Heartbleed" Volkov

**Caractéristiques Techniques**

| Propriété | Valeur |
|-----------|--------|
| Type | `boss_ivan_heartbleed` |
| Nom Complet | Ivan "Heartbleed" Volkov |
| HP | 180 |
| Speed | 1.3 |
| Points | 6000 |
| Behavior | `boss_heartbleed` (nouveau) |
| Size | 85px |
| Couleur | Magenta (#ff0080) |

**Comportement Boss `boss_heartbleed`**
```javascript
// Mouvement ondulatoire lent
// Capacité spéciale : "Memory Leak"
// - Toutes les 3 secondes : pulse rouge qui draine 5 HP si touché
// - Tire des "chunks de mémoire" (rectangles rouges)
// - Zone d'effet : cercle de 150px de rayon
```

**Intro Boss**
```
╔═══════════════════════════════════════════════╗
║ [MENACE CRYPTOGRAPHIQUE MAJEURE]            ║
║                                               ║
║ Ivan "Heartbleed" Volkov                     ║
║ AKA "Le Boucher de l'OpenSSL"                ║
║                                               ║
║ A volé 4,5 millions de mots de passe via     ║
║ une seule faille dans le heartbeat TLS...   ║
║                                               ║
║ Capacité : SAIGNEMENT DE MÉMOIRE             ║
║ Attaque : Extrait vos données chiffrées      ║
║                                               ║
║ Citation :                                    ║
║ "Le chiffrement n'est qu'une illusion de     ║
║  sécurité quand le code est cassé."          ║
║                     - Volkov, Dark Web 2014  ║
║                                               ║
║         [ESPACE] ENGAGER LE COMBAT           ║
╚═══════════════════════════════════════════════╝
```

**Easter Egg**
- Sprite du boss affiche un cœur pulsant (heartbeat) visible
- Quand touché : affiche "0x7F" (référence CVE-2014-0160)
- Achievement si vaincu sans subir de pulse : "Cold Hearted"

#### Nouveaux Ennemis L6

##### 1. SSL Downgrader
```javascript
{
    type: 'ssl_stripper',
    name: 'SSL Downgrader',
    health: 3,
    speed: 2.5,
    points: 120,
    behavior: 'zigzag',
    size: 32,
    icon: '🔓',
    description: 'Force HTTPS → HTTP downgrade'
}
```

##### 2. BEAST Exploit
```javascript
{
    type: 'tls_beast',
    name: 'BEAST Exploit',
    health: 4,
    speed: 2.0,
    points: 150,
    behavior: 'diagonal',
    size: 35,
    icon: '🦁',
    description: 'CVE-2011-3389 - CBC attack'
}
```

##### 3. POODLE Worm
```javascript
{
    type: 'poodle',
    name: 'POODLE Worm',
    health: 3,
    speed: 2.8,
    points: 130,
    behavior: 'wave',
    size: 30,
    icon: '🐩',
    description: 'SSL 3.0 padding oracle attack'
}
```

##### 4. Zip of Death
```javascript
{
    type: 'compression_bomb',
    name: 'Zip of Death',
    health: 6,
    speed: 1.0,
    points: 250,
    behavior: 'slow_tank',
    size: 50,
    icon: '💣',
    description: '42.zip - 4.5 PB décompressé'
}
```

##### 5. MIME Chameleon
```javascript
{
    type: 'mime_confusion',
    name: 'MIME Chameleon',
    health: 3,
    speed: 3.0,
    points: 110,
    behavior: 'teleport',
    size: 28,
    icon: '🦎',
    description: 'Content-Type header spoofing'
}
```

##### 6. ASN.1 Corruptor
```javascript
{
    type: 'asn1_parser',
    name: 'ASN.1 Corruptor',
    health: 4,
    speed: 2.2,
    points: 140,
    behavior: 'erratic',
    size: 33,
    icon: '📜',
    description: 'Parsing certificat X.509 corrompu'
}
```

##### 7. Unicode Shifter
```javascript
{
    type: 'unicode_normalizer',
    name: 'Unicode Shifter',
    health: 2,
    speed: 3.5,
    points: 90,
    behavior: 'phase',
    size: 26,
    icon: '🔀',
    description: 'Homograph attack (аррӏе.com)'
}
```

##### 8. ImageTragick
```javascript
{
    type: 'jpeg_rce',
    name: 'ImageTragick',
    health: 2,
    speed: 4.0,
    points: 100,
    behavior: 'fast',
    size: 28,
    icon: '🖼️',
    description: 'CVE-2016-3714 ImageMagick RCE'
}
```

**Configuration Vague L6**
```javascript
{
    layer: 6,
    name: 'PRESENTATION',
    color: '#ff0080',
    enemies: [
        { type: 'ssl_stripper', count: 3 },
        { type: 'ransomware', count: 2 },         // Original
        { type: 'tls_beast', count: 2 },
        { type: 'poodle', count: 3 },
        { type: 'compression_bomb', count: 1 },   // Tank
        { type: 'mime_confusion', count: 3 },
        { type: 'asn1_parser', count: 2 },
        { type: 'unicode_normalizer', count: 3 },
        { type: 'jpeg_rce', count: 4 }
    ],
    boss: {
        type: 'boss_ivan_heartbleed',
        spawnAfter: 23
    },
    spawnDelay: 1300,
    totalEnemies: 23
}
```

---

### 🟢 COUCHE 5 - SESSION

#### Boss : Alice "Cookie Monster" Chen

**Caractéristiques Techniques**

| Propriété | Valeur |
|-----------|--------|
| Type | `boss_alice_cookies` |
| Nom Complet | Alice "Cookie Monster" Chen |
| HP | 200 |
| Speed | 1.8 |
| Points | 7000 |
| Behavior | `boss_cookie_theft` (nouveau) |
| Size | 90px |
| Couleur | Vert (#00ff88) |

**Comportement Boss `boss_cookie_theft`**
```javascript
// Mouvement rapide en zigzag horizontal
// Capacité : "Clone Attack"
// - Toutes les 4 secondes : crée 2 clones temporaires (30 HP chacun)
// - Clones suivent le joueur pendant 3 secondes
// - Laisse tomber des "cookies" (heal 10 HP) aléatoirement
```

**Intro Boss**
```
╔═══════════════════════════════════════════════╗
║ [SESSION HIJACKING EN COURS]                 ║
║                                               ║
║ Alice "Cookie Monster" Chen                  ║
║ Spécialiste du vol de session                ║
║                                               ║
║ Responsable du piratage de 500k comptes     ║
║ Amazon via CSRF en 2019...                   ║
║                                               ║
║ Capacité : COOKIE THEFT STORM                ║
║ Attaque : Clone votre identité en temps réel ║
║                                               ║
║ Citation :                                    ║
║ "Me? Me just want cookies! Om nom nom nom!"  ║
║                     - Chen, DefCon 27        ║
║                                               ║
║         [ESPACE] ENGAGER LE COMBAT           ║
╚═══════════════════════════════════════════════╝
```

**Easter Egg**
- Boss laisse tomber des cookies pixelisés quand touché
- Cookie power-up apparaît : "🍪 Session Cookie (+10 HP)"
- Achievement : "No Cookie For You" (victoire sans ramasser de cookies)

#### Nouveaux Ennemis L5

##### 1. Session Fixer
```javascript
{
    type: 'session_fixation',
    name: 'Session Fixer',
    health: 2,
    speed: 2.8,
    points: 100,
    behavior: 'zigzag',
    size: 28,
    icon: '🔒',
    description: 'Fixation d\'ID de session'
}
```

##### 2. JWT Nullifier
```javascript
{
    type: 'jwt_none',
    name: 'JWT Nullifier',
    health: 2,
    speed: 3.5,
    points: 90,
    behavior: 'fast',
    size: 26,
    icon: '🎫',
    description: 'Algorithm "none" JWT bypass'
}
```

##### 3. OAuth Hijacker
```javascript
{
    type: 'oauth_redirect',
    name: 'OAuth Hijacker',
    health: 3,
    speed: 2.5,
    points: 120,
    behavior: 'diagonal',
    size: 30,
    icon: '🔑',
    description: 'Redirect URI manipulation'
}
```

##### 4. Golden Ticket
```javascript
{
    type: 'kerberos_ticket',
    name: 'Golden Ticket',
    health: 5,
    speed: 1.5,
    points: 200,
    behavior: 'slow_tank',
    size: 42,
    icon: '🎟️',
    description: 'Kerberos Pass-the-Ticket'
}
```

##### 5. SAML Repeater
```javascript
{
    type: 'saml_replay',
    name: 'SAML Repeater',
    health: 2,
    speed: 4.0,
    points: 80,
    behavior: 'swarm',
    size: 25,
    icon: '🔁',
    description: 'SAML assertion replay attack'
}
```

##### 6. Socket Snatcher
```javascript
{
    type: 'websocket_hijack',
    name: 'Socket Snatcher',
    health: 3,
    speed: 2.0,
    points: 110,
    behavior: 'teleport',
    size: 32,
    icon: '🔌',
    description: 'WebSocket session hijacking'
}
```

##### 7. Cookie Tosser
```javascript
{
    type: 'cookie_tossing',
    name: 'Cookie Tosser',
    health: 2,
    speed: 3.0,
    points: 95,
    behavior: 'wave',
    size: 28,
    icon: '🍪',
    description: 'Cookie injection subdomain'
}
```

##### 8. CSRF Forger
```javascript
{
    type: 'csrf_token',
    name: 'CSRF Forger',
    health: 4,
    speed: 2.2,
    points: 150,
    behavior: 'erratic',
    size: 35,
    icon: '⚔️',
    description: 'Cross-Site Request Forgery'
}
```

**Configuration Vague L5**
```javascript
{
    layer: 5,
    name: 'SESSION',
    color: '#00ff88',
    enemies: [
        { type: 'session_hijacker', count: 3 },   // Original
        { type: 'session_fixation', count: 3 },
        { type: 'jwt_none', count: 4 },
        { type: 'oauth_redirect', count: 2 },
        { type: 'kerberos_ticket', count: 1 },    // Tank
        { type: 'saml_replay', count: 5 },
        { type: 'websocket_hijack', count: 2 },
        { type: 'cookie_tossing', count: 3 },
        { type: 'csrf_token', count: 2 }
    ],
    boss: {
        type: 'boss_alice_cookies',
        spawnAfter: 25
    },
    spawnDelay: 1100,
    totalEnemies: 25
}
```

---

### 🟢 COUCHE 4 - TRANSPORT

#### Boss : Syn "The Flooder" McMurphy

**Caractéristiques Techniques**

| Propriété | Valeur |
|-----------|--------|
| Type | `boss_syn_flooder` |
| Nom Complet | Syn "The Flooder" McMurphy |
| HP | 220 |
| Speed | 2.0 |
| Points | 8000 |
| Behavior | `boss_syn_flood` (nouveau) |
| Size | 95px |
| Couleur | Vert (#00ff88) |

**Comportement Boss `boss_syn_flood`**
```javascript
// Mouvement rapide erratique
// Capacité : "Half-Open Storm"
// - Spam de projectiles "SYN" (petits paquets verts)
// - Tire 5 projectiles en même temps toutes les 1.5s
// - Les projectiles ralentissent le joueur (-30% speed pendant 2s)
```

**Intro Boss**
```
╔═══════════════════════════════════════════════╗
║ [SATURATION DES PORTS DÉTECTÉE]              ║
║                                               ║
║ Syn "The Flooder" McMurphy                   ║
║ Le Roi du Chaos TCP                          ║
║                                               ║
║ A mis à genoux les serveurs de Dyn DNS       ║
║ avec 1.2 Tbps de trafic SYN en 2016...      ║
║                                               ║
║ Capacité : TEMPÊTE DE DEMI-CONNEXIONS        ║
║ Attaque : Inonde vos ports de SYN orphelins  ║
║                                               ║
║ Citation :                                    ║
║ "SYN, SYN-ACK... mais jamais d'ACK !"        ║
║                     - McMurphy, Mirai Botnet ║
║                                               ║
║         [ESPACE] ENGAGER LE COMBAT           ║
╚═══════════════════════════════════════════════╝
```

**Easter Egg**
- Boss porte un T-shirt avec "Mirai was here"
- Projectiles affichent "SYN" "SYN-ACK" alternativement
- Achievement : "Three-Way Handshake Killer"

#### Nouveaux Ennemis L4

##### 1. SYN Bomber
```javascript
{
    type: 'syn_flood',
    name: 'SYN Bomber',
    health: 1,
    speed: 4.5,
    points: 60,
    behavior: 'swarm',
    size: 22,
    icon: '💥',
    description: 'TCP SYN flood classique'
}
```

##### 2. UDP Storm
```javascript
{
    type: 'udp_flood',
    name: 'UDP Storm',
    health: 2,
    speed: 4.0,
    points: 80,
    behavior: 'fast',
    size: 25,
    icon: '🌪️',
    description: 'UDP amplification DDoS'
}
```

##### 3. RST Injector
```javascript
{
    type: 'rst_injection',
    name: 'RST Injector',
    health: 2,
    speed: 3.0,
    points: 90,
    behavior: 'zigzag',
    size: 28,
    icon: '⚡',
    description: 'TCP RST injection attack'
}
```

##### 4. Frag Grenade
```javascript
{
    type: 'tcp_fragmentation',
    name: 'Frag Grenade',
    health: 3,
    speed: 2.5,
    points: 110,
    behavior: 'diagonal',
    size: 30,
    icon: '🧩',
    description: 'IP fragmentation attack'
}
```

##### 5. Ping of Death
```javascript
{
    type: 'icmp_flood',
    name: 'Ping of Death',
    health: 3,
    speed: 2.8,
    points: 120,
    behavior: 'wave',
    size: 32,
    icon: '🏓',
    description: 'ICMP flood oversized packets'
}
```

##### 6. SCTP Flooder
```javascript
{
    type: 'sctp_init',
    name: 'SCTP Flooder',
    health: 4,
    speed: 2.0,
    points: 140,
    behavior: 'erratic',
    size: 35,
    icon: '📡',
    description: 'SCTP INIT chunk flood'
}
```

##### 7. QUIC Corruptor
```javascript
{
    type: 'quic_version',
    name: 'QUIC Corruptor',
    health: 3,
    speed: 3.2,
    points: 100,
    behavior: 'phase',
    size: 28,
    icon: '🚀',
    description: 'QUIC version negotiation attack'
}
```

##### 8. Nmap Recon
```javascript
{
    type: 'port_scanner',
    name: 'Nmap Recon',
    health: 5,
    speed: 1.2,
    points: 180,
    behavior: 'slow_tank',
    size: 45,
    icon: '🔍',
    description: 'Port scanning reconnaissance'
}
```

**Configuration Vague L4**
```javascript
{
    layer: 4,
    name: 'TRANSPORT',
    color: '#00ff88',
    enemies: [
        { type: 'syn_flood', count: 6 },          // Swarm principal
        { type: 'udp_flood', count: 5 },
        { type: 'rst_injection', count: 3 },
        { type: 'tcp_fragmentation', count: 2 },
        { type: 'icmp_flood', count: 3 },
        { type: 'sctp_init', count: 2 },
        { type: 'quic_version', count: 3 },
        { type: 'port_scanner', count: 1 }        // Mini-boss
    ],
    boss: {
        type: 'boss_syn_flooder',
        spawnAfter: 25
    },
    spawnDelay: 1000,
    totalEnemies: 25
}
```

---

### 🔵 COUCHE 3 - NETWORK

#### Boss : Dimitri "Spoofer" Petrov

**Caractéristiques Techniques**

| Propriété | Valeur |
|-----------|--------|
| Type | `boss_dimitri_spoofer` |
| Nom Complet | Dimitri "Spoofer" Petrov |
| HP | 250 |
| Speed | 1.5 |
| Points | 9000 |
| Behavior | `boss_ip_masquerade` (nouveau) |
| Size | 100px |
| Couleur | Cyan (#00ffff) |

**Comportement Boss `boss_ip_masquerade`**
```javascript
// Mouvement téléportation
// Capacité : "IP Clone"
// - Se téléporte toutes les 2 secondes
// - Laisse un "clone fantôme" à l'ancien emplacement (20 HP, disparaît après 3s)
// - Les clones tirent aussi
// - Max 3 clones simultanés
```

**Intro Boss**
```
╔═══════════════════════════════════════════════╗
║ [ROUTAGE COMPROMIS - DÉTOURNEMENT BGP]       ║
║                                               ║
║ Dimitri "Spoofer" Petrov                     ║
║ Le Maître de l'Usurpation IP                 ║
║                                               ║
║ A redirigé le trafic de Google via le        ║
║ détournement BGP du Nigeria en 2018...       ║
║                                               ║
║ Capacité : IP MASQUERADE CHAOS               ║
║ Attaque : Clone votre adresse source         ║
║                                               ║
║ Citation :                                    ║
║ "Sur Internet, personne ne sait que tu       ║
║  n'es pas une route légitime."               ║
║                     - Petrov, BlackHat 2019  ║
║                                               ║
║         [ESPACE] ENGAGER LE COMBAT           ║
╚═══════════════════════════════════════════════╝
```

**Easter Egg**
- Boss porte une Ushanka (chapeau russe) pixelisée
- Clones affichent des IPs aléatoires au-dessus d'eux
- Achievement : "Real Petrov, Please Stand Up"

#### Nouveaux Ennemis L3

##### 1. IP Faker
```javascript
{
    type: 'ip_spoofer',
    name: 'IP Faker',
    health: 3,
    speed: 2.5,
    points: 110,
    behavior: 'teleport',
    size: 30,
    icon: '🎭',
    description: 'Source IP address spoofing'
}
```

##### 2. ICMP Deceiver
```javascript
{
    type: 'icmp_redirect',
    name: 'ICMP Deceiver',
    health: 3,
    speed: 2.8,
    points: 120,
    behavior: 'diagonal',
    size: 32,
    icon: '🧭',
    description: 'ICMP redirect malveillant'
}
```

##### 3. BGP Pirate
```javascript
{
    type: 'bgp_hijack',
    name: 'BGP Pirate',
    health: 6,
    speed: 1.0,
    points: 250,
    behavior: 'slow_tank',
    size: 50,
    icon: '🏴‍☠️',
    description: 'Border Gateway Protocol hijack'
}
```

##### 4. Smurf Amplifier
```javascript
{
    type: 'smurf_attack',
    name: 'Smurf Amplifier',
    health: 2,
    speed: 3.5,
    points: 90,
    behavior: 'swarm',
    size: 24,
    icon: '🍄',
    description: 'ICMP echo broadcast attack'
}
```

##### 5. RIP Poisoner
```javascript
{
    type: 'route_poisoning',
    name: 'RIP Poisoner',
    health: 4,
    speed: 2.0,
    points: 150,
    behavior: 'wave',
    size: 38,
    icon: '☠️',
    description: 'Routing table poison'
}
```

##### 6. GRE Smuggler
```javascript
{
    type: 'gre_tunnel',
    name: 'GRE Smuggler',
    health: 3,
    speed: 2.5,
    points: 130,
    behavior: 'phase',
    size: 32,
    icon: '🕳️',
    description: 'GRE tunnel encapsulation'
}
```

##### 7. MPLS Swapper
```javascript
{
    type: 'mpls_label',
    name: 'MPLS Swapper',
    health: 3,
    speed: 2.3,
    points: 110,
    behavior: 'zigzag',
    size: 30,
    icon: '🏷️',
    description: 'MPLS label manipulation'
}
```

##### 8. IPSec Breaker
```javascript
{
    type: 'ipsec_bypass',
    name: 'IPSec Breaker',
    health: 4,
    speed: 2.2,
    points: 140,
    behavior: 'erratic',
    size: 35,
    icon: '🔓',
    description: 'IPSec tunnel bypass'
}
```

**Configuration Vague L3**
```javascript
{
    layer: 3,
    name: 'NETWORK',
    color: '#00ffff',
    enemies: [
        { type: 'ip_spoofer', count: 4 },
        { type: 'ping_of_death', count: 3 },      // Original
        { type: 'icmp_redirect', count: 3 },
        { type: 'bgp_hijack', count: 1 },         // Tank boss
        { type: 'smurf_attack', count: 5 },
        { type: 'route_poisoning', count: 2 },
        { type: 'gre_tunnel', count: 3 },
        { type: 'mpls_label', count: 3 },
        { type: 'ipsec_bypass', count: 2 }
    ],
    boss: {
        type: 'boss_dimitri_spoofer',
        spawnAfter: 26
    },
    spawnDelay: 1200,
    totalEnemies: 26
}
```

---

### 🟡 COUCHE 2 - DATA LINK

#### Boss : Morgan "ARP Storm" Blake

**Caractéristiques Techniques**

| Propriété | Valeur |
|-----------|--------|
| Type | `boss_morgan_arp` |
| Nom Complet | Morgan "ARP Storm" Blake |
| HP | 280 |
| Speed | 2.2 |
| Points | 10000 |
| Behavior | `boss_arp_flood` (nouveau) |
| Size | 105px |
| Couleur | Jaune (#ffff00) |

**Comportement Boss `boss_arp_flood`**
```javascript
// Mouvement en vagues horizontales rapides
// Capacité : "CAM Table Overflow"
// - Tire des rafales de 7 projectiles "ARP Request"
// - Toutes les 3 secondes : crée une "ARP Storm" (zone AoE)
// - Zone AoE : cercle jaune qui inflige 10 HP/s pendant 2s
```

**Intro Boss**
```
╔═══════════════════════════════════════════════╗
║ [TABLE ARP CORROMPUE - ALERTE SWITCH]        ║
║                                               ║
║ Morgan "ARP Storm" Blake                     ║
║ La Terreur des Switches                      ║
║                                               ║
║ A paralysé le LAN d'une multinationale       ║
║ en saturant 4000 switches simultanément...   ║
║                                               ║
║ Capacité : MAC FLOODING TSUNAMI              ║
║ Attaque : Inonde vos tables ARP/CAM          ║
║                                               ║
║ Citation :                                    ║
║ "Qui a besoin de paquets routés quand on     ║
║  peut simplement les intercepter ?"          ║
║                     - Blake, DEF CON 29      ║
║                                               ║
║         [ESPACE] ENGAGER LE COMBAT           ║
╚═══════════════════════════════════════════════╝
```

**Easter Egg**
- Boss porte un bandana de pirate avec logo Cisco
- Projectiles affichent des adresses MAC aléatoires
- Achievement : "Switch Savior" (victoire sans subir d'ARP storm)

#### Nouveaux Ennemis L2

##### 1. ARP Liar
```javascript
{
    type: 'arp_spoofer',
    name: 'ARP Liar',
    health: 2,
    speed: 3.0,
    points: 100,
    behavior: 'zigzag',
    size: 28,
    icon: '🤥',
    description: 'ARP cache poisoning'
}
```

##### 2. CAM Bomber
```javascript
{
    type: 'mac_flooder',
    name: 'CAM Bomber',
    health: 1,
    speed: 4.5,
    points: 70,
    behavior: 'swarm',
    size: 22,
    icon: '💣',
    description: 'MAC address table flooding'
}
```

##### 3. VLAN Hopper
```javascript
{
    type: 'vlan_hopping',
    name: 'VLAN Hopper',
    health: 4,
    speed: 2.0,
    points: 150,
    behavior: 'teleport',
    size: 35,
    icon: '🦘',
    description: 'Double tagging VLAN hop'
}
```

##### 4. STP Manipulator
```javascript
{
    type: 'stp_attack',
    name: 'STP Manipulator',
    health: 5,
    speed: 1.5,
    points: 180,
    behavior: 'slow_tank',
    size: 42,
    icon: '🌉',
    description: 'Spanning Tree manipulation'
}
```

##### 5. DHCP Starver
```javascript
{
    type: 'dhcp_starvation',
    name: 'DHCP Starver',
    health: 2,
    speed: 3.8,
    points: 90,
    behavior: 'fast',
    size: 26,
    icon: '🏜️',
    description: 'DHCP pool exhaustion'
}
```

##### 6. CDP Sniffer
```javascript
{
    type: 'cdp_exploit',
    name: 'CDP Sniffer',
    health: 3,
    speed: 2.5,
    points: 120,
    behavior: 'phase',
    size: 30,
    icon: '👂',
    description: 'Cisco Discovery Protocol leak'
}
```

##### 7. LLC Injector
```javascript
{
    type: 'llc_injection',
    name: 'LLC Injector',
    health: 3,
    speed: 2.8,
    points: 110,
    behavior: 'diagonal',
    size: 32,
    icon: '💉',
    description: 'Logical Link Control injection'
}
```

##### 8. PPPoE Flooder
```javascript
{
    type: 'pppoe_flood',
    name: 'PPPoE Flooder',
    health: 3,
    speed: 2.5,
    points: 100,
    behavior: 'wave',
    size: 30,
    icon: '📞',
    description: 'PPPoE discovery flood'
}
```

**Configuration Vague L2**
```javascript
{
    layer: 2,
    name: 'DATA LINK',
    color: '#ffff00',
    enemies: [
        { type: 'arp_spoofer', count: 4 },
        { type: 'mac_flooder', count: 6 },        // Swarm principal
        { type: 'vlan_hopping', count: 2 },
        { type: 'stp_attack', count: 1 },         // Tank
        { type: 'dhcp_starvation', count: 4 },
        { type: 'cdp_exploit', count: 3 },
        { type: 'llc_injection', count: 3 },
        { type: 'pppoe_flood', count: 3 }
    ],
    boss: {
        type: 'boss_morgan_arp',
        spawnAfter: 26
    },
    spawnDelay: 1000,
    totalEnemies: 26
}
```

---

### 🟡 COUCHE 1 - PHYSICAL (BOSS FINAL)

#### Boss Final : "Le Gardien du Datacenter"

**Caractéristiques Techniques**

| Propriété | Valeur |
|-----------|--------|
| Type | `boss_guardian_final` |
| Nom Complet | Le Gardien du Datacenter |
| HP | 400 |
| Speed | 1.0 |
| Points | 15000 |
| Behavior | `boss_guardian` (nouveau) |
| Size | 150px |
| Couleur | Jaune (#ffff00) + Rouge (phases) |

**Comportement Boss `boss_guardian`**
```javascript
// Boss multi-phases (3 phases)
// Phase 1 (400-250 HP) : Mouvement lent + coupe câbles (projectiles linéaires)
// Phase 2 (250-120 HP) : Vitesse x1.5 + EM Pulse (zone AoE périodique)
// Phase 3 (<120 HP) : Berserk mode + Thermal Attack (laser continu)
// 
// Apparence : Rack serveur géant avec câbles fouettants comme tentacules
// Patterns spéciaux :
// - Toutes les 5s en Phase 1 : tire 8 câbles en cercle
// - Toutes les 4s en Phase 2 : pulse EM (freeze joueur 1s si touché)
// - Phase 3 : laser qui suit le joueur (dégâts continus)
```

**Intro Boss**
```
╔═══════════════════════════════════════════════╗
║ [ACCÈS PHYSIQUE COMPROMIS]                   ║
║ [ALERTE CRITIQUE - NIVEAU DATACENTER]        ║
║                                               ║
║ ENTITÉ NON IDENTIFIÉE DÉTECTÉE               ║
║ Nom de code : "LE GARDIEN"                   ║
║                                               ║
║ Archives : Cette entité a provoqué la        ║
║ destruction physique de 3 datacenters        ║
║ majeurs en 2020 (incident OVH Strasbourg)    ║
║                                               ║
║ Capacités identifiées :                      ║
║ - SECTIONNEMENT DE CÂBLES                    ║
║ - IMPULSION ÉLECTROMAGNÉTIQUE                ║
║ - SURCHAUFFE THERMIQUE                       ║
║                                               ║
║ Citation enregistrée :                       ║
║ "Vous avez sécurisé vos 6 couches           ║
║  supérieures... Mais avez-vous verrouillé    ║
║  la porte du serveur ?"                      ║
║                     - Le Gardien, 03:47 AM   ║
║                                               ║
║ [!] C'EST LE BOSS FINAL                      ║
║                                               ║
║    [ESPACE] DÉFENDRE LE DATACENTER           ║
╚═══════════════════════════════════════════════╝
```

**Transitions de Phase**

**Phase 1 → 2 (75% HP)**
```
╔══════════════════════════════════════╗
║ [ALERTE] Le Gardien s'adapte !      ║
║                                      ║
║ Nouvelle capacité détectée :        ║
║ IMPULSION ÉLECTROMAGNÉTIQUE         ║
║                                      ║
║ Évitez les zones bleues !           ║
╚══════════════════════════════════════╝
```

**Phase 2 → 3 (30% HP)**
```
╔══════════════════════════════════════╗
║ [DANGER CRITIQUE]                   ║
║                                      ║
║ Le Gardien entre en mode BERSERK    ║
║ Température du datacenter : 85°C    ║
║                                      ║
║ ATTAQUE LASER THERMIQUE ACTIVÉE     ║
║                                      ║
║ Mouvement constant requis !         ║
╚══════════════════════════════════════╝
```

**Easter Egg**
- Sprite : Rack serveur avec câbles RJ45/Fibre animés
- Quand vaincu : affiche un écran BSOD géant pixelisé
- Sons : Ventilateurs surchauffés, alarmes datacenter
- Achievement ultime : "Datacenter Hero"

#### Nouveaux Ennemis L1

##### 1. Wire Snipper
```javascript
{
    type: 'cable_cutter',
    name: 'Wire Snipper',
    health: 2,
    speed: 3.5,
    points: 90,
    behavior: 'fast',
    size: 26,
    icon: '✂️',
    description: 'Sabotage physique des câbles'
}
```

##### 2. EM Pulse
```javascript
{
    type: 'em_jammer',
    name: 'EM Pulse',
    health: 4,
    speed: 2.0,
    points: 140,
    behavior: 'wave',
    size: 38,
    icon: '⚡',
    description: 'Brouillage électromagnétique'
}
```

##### 3. Fiber Breaker
```javascript
{
    type: 'fiber_bender',
    name: 'Fiber Breaker',
    health: 3,
    speed: 2.5,
    points: 110,
    behavior: 'diagonal',
    size: 30,
    icon: '💫',
    description: 'Rupture fibre optique'
}
```

##### 4. Voltage Spike
```javascript
{
    type: 'power_surge',
    name: 'Voltage Spike',
    health: 5,
    speed: 1.8,
    points: 160,
    behavior: 'erratic',
    size: 40,
    icon: '⚡',
    description: 'Surtension électrique'
}
```

##### 5. Heat Blaster
```javascript
{
    type: 'thermal_attack',
    name: 'Heat Blaster',
    health: 6,
    speed: 1.2,
    points: 200,
    behavior: 'slow_tank',
    size: 48,
    icon: '🔥',
    description: 'Surchauffe des équipements'
}
```

##### 6. Signal Leech
```javascript
{
    type: 'wiretap',
    name: 'Signal Leech',
    health: 3,
    speed: 2.8,
    points: 120,
    behavior: 'phase',
    size: 32,
    icon: '🎧',
    description: 'Écoute physique sur câbles'
}
```

##### 7. Port Puller
```javascript
{
    type: 'rj45_yanker',
    name: 'Port Puller',
    health: 1,
    speed: 4.5,
    points: 60,
    behavior: 'swarm',
    size: 20,
    icon: '🔌',
    description: 'Déconnexion brutale RJ45'
}
```

##### 8. Hardware Logger
```javascript
{
    type: 'keylogger_hw',
    name: 'Hardware Logger',
    health: 4,
    speed: 2.0,
    points: 150,
    behavior: 'teleport',
    size: 35,
    icon: '⌨️',
    description: 'Keylogger USB physique'
}
```

**Configuration Vague L1**
```javascript
{
    layer: 1,
    name: 'PHYSICAL',
    color: '#ffff00',
    enemies: [
        { type: 'cable_cutter', count: 5 },
        { type: 'em_jammer', count: 3 },
        { type: 'fiber_bender', count: 3 },
        { type: 'power_surge', count: 2 },
        { type: 'thermal_attack', count: 1 },     // Tank
        { type: 'wiretap', count: 3 },
        { type: 'rj45_yanker', count: 6 },        // Swarm
        { type: 'keylogger_hw', count: 2 }
    ],
    boss: {
        type: 'boss_guardian_final',
        spawnAfter: 25
    },
    spawnDelay: 900,
    totalEnemies: 25,
    isFinal: true
}
```

---

## Écrans de Transition

### Template Standard (Entre Vagues)

```html
<div class="transition-screen" data-layer="X">
    <div class="transition-container">
        <div class="transition-header">
            [MODULE X : COUCHE {NOM}] ✓
        </div>
        
        <div class="transition-stats">
            Boss vaincu : {BOSS_NAME}
            Menaces neutralisées : {ENEMY_COUNT}
            Score bonus pédagogique : +{BONUS}
        </div>
        
        <div class="transition-learning">
            📚 CE QUE VOUS AVEZ APPRIS :
            
            • {POINT_1}
            
            • {POINT_2}
            
            • {POINT_3}
        </div>
        
        <div class="transition-next">
            ⚠️ MODULE SUIVANT : COUCHE {NEXT_LAYER}
            
            {TEASER_TEXT}
            
            Conseil : {TIP}
        </div>
        
        <div class="transition-cta">
            [ESPACE] CONTINUER LA FORMATION
        </div>
    </div>
</div>
```

### Exemple Rempli : L7 → L6

```
╔═══════════════════════════════════════════════╗
║ [MODULE 1 : COUCHE APPLICATION] ✓            ║
║                                               ║
║ Boss vaincu : Bobby "DROP TABLE" Thompson    ║
║ Menaces neutralisées : 27                    ║
║ Score bonus pédagogique : +5000               ║
║                                               ║
║ 📚 CE QUE VOUS AVEZ APPRIS :                 ║
║                                               ║
║ • HTTP/HTTPS : Les requêtes peuvent être     ║
║   interceptées et modifiées (HTTP Flood)     ║
║                                               ║
║ • DNS : Peut servir à exfiltrer des données  ║
║   en cachette (DNS Tunneling)                ║
║                                               ║
║ • SQL : Toujours valider les entrées user    ║
║   (merci Bobby pour la leçon...)             ║
║                                               ║
║ ⚠️ MODULE SUIVANT : COUCHE PRÉSENTATION       ║
║                                               ║
║ Ivan "Heartbleed" Volkov vous attend dans    ║
║ les profondeurs du chiffrement cassé...      ║
║                                               ║
║ Conseil : Cette couche gère SSL/TLS.         ║
║ Méfiez-vous des anciennes versions !         ║
║                                               ║
║         [ESPACE] CONTINUER LA FORMATION      ║
╚═══════════════════════════════════════════════╝
```

### Points Pédagogiques par Couche

#### L7 → L6
```
• HTTP/HTTPS : Requêtes modifiables (HTTP Flood, DNS Tunneling)
• SQL Injection : Validation des entrées utilisateur essentielle
• GraphQL : Attention aux requêtes imbriquées profondes
```

#### L6 → L5
```
• SSL/TLS : Versions obsolètes dangereuses (POODLE, BEAST)
• Heartbleed : Faille dans le heartbeat OpenSSL (CVE-2014-0160)
• Compression : Les bombes ZIP exploitent le parsing
```

#### L5 → L4
```
• Sessions : Tokens JWT vulnérables si mal implémentés
• Cookies : Peuvent être volés via XSS ou CSRF
• OAuth : Validation des redirect_uri critique
```

#### L4 → L3
```
• TCP : SYN flood exploite le three-way handshake
• UDP : Pas de vérification = amplification DDoS facile
• Ports : Le scan est la première étape d'une intrusion
```

#### L3 → L2
```
• IP Spoofing : L'adresse source est falsifiable
• BGP : Détournements possibles sans authentification
• Routage : Les tables peuvent être empoisonnées
```

#### L2 → L1
```
• ARP : Protocole non sécurisé par conception
• VLAN : Le double tagging permet le hopping
• Switches : Les tables CAM sont saturables
```

#### L1 → Victoire
```
• Couche Physique : La sécurité commence par le lock de la salle serveur
• Câbles : Un accès physique = game over
• EM : Les signaux peuvent être interceptés dans l'air
```

---

## Easter Eggs & Références

### Easter Eggs Boss

| Boss | Easter Egg | Déclencheur |
|------|-----------|-------------|
| Bobby Thompson | Citation XKCD #327 | Aléatoire pendant combat |
| Ivan Volkov | Cœur pulsant visible | Permanent (sprite) |
| Alice Chen | Cookies qui tombent | Quand touchée |
| Syn McMurphy | T-shirt "Mirai was here" | Permanent (sprite) |
| Dimitri Petrov | Ushanka russe | Permanent (sprite) |
| Morgan Blake | Bandana pirate Cisco | Permanent (sprite) |
| Le Gardien | BSOD à la mort | Victoire finale |

### Achievements Cachés

```javascript
const ACHIEVEMENTS = {
    // Boss-specific
    bobby_tables_hunter: {
        name: "Bobby Tables Hunter",
        description: "Vaincre Bobby avec >80% HP",
        icon: "🏆",
        points: 1000
    },
    cold_hearted: {
        name: "Cold Hearted",
        description: "Vaincre Volkov sans subir de pulse",
        icon: "❄️",
        points: 1500
    },
    no_cookie_for_you: {
        name: "No Cookie For You",
        description: "Vaincre Alice sans ramasser de cookies",
        icon: "🚫🍪",
        points: 1200
    },
    three_way_killer: {
        name: "Three-Way Handshake Killer",
        description: "Vaincre McMurphy en <60s",
        icon: "⚡",
        points: 1300
    },
    real_petrov: {
        name: "Real Petrov, Please Stand Up",
        description: "Ne toucher que le vrai Petrov (pas les clones)",
        icon: "🎯",
        points: 1800
    },
    switch_savior: {
        name: "Switch Savior",
        description: "Vaincre Blake sans subir d'ARP storm",
        icon: "🛡️",
        points: 2000
    },
    datacenter_hero: {
        name: "Datacenter Hero",
        description: "Vaincre le Gardien final",
        icon: "👑",
        points: 5000
    },
    
    // Gameplay
    pacifist_wave: {
        name: "Pacifist (Impossible)",
        description: "Terminer une vague sans tirer",
        icon: "☮️",
        points: 500,
        hidden: true
    },
    no_damage_run: {
        name: "Flawless Victory",
        description: "Terminer le jeu sans prendre de dégâts",
        icon: "💎",
        points: 10000,
        hidden: true
    },
    speedrunner: {
        name: "Speedrunner",
        description: "Terminer en <15 minutes",
        icon: "⏱️",
        points: 3000
    }
};
```

### Références Culturelles

| Référence | Source | Emplacement |
|-----------|--------|-------------|
| Bobby Tables | XKCD #327 | Boss L7 |
| Heartbleed | CVE-2014-0160 | Boss L6 |
| Cookie Monster | Sesame Street | Boss L5 |
| Mirai Botnet | Dyn Attack 2016 | Boss L4 |
| BGP Hijack Nigeria | Google 2018 | Boss L3 |
| OVH Fire | Strasbourg 2021 | Boss L1 |
| Alice & Bob | Crypto tradition | Boss L5 name |
| Ushanka | Stéréotype russe | Petrov sprite |

---

## Modifications Techniques Requises

### 1. Fichiers à Créer

```
public/scripts/game/
├── behaviors/
│   ├── bossBehaviors.js        # Comportements spéciaux boss
│   └── advancedPatterns.js     # Patterns ennemis avancés
├── screens/
│   ├── TransitionScreen.js     # Écrans entre vagues
│   └── BossIntro.js            # Intros boss modales
└── achievements/
    └── AchievementSystem.js    # Système achievements
```

### 2. Fichiers à Modifier

#### `gameConfig.js`
```javascript
// Ajouter 56 nouveaux ennemis (8 par couche)
// Ajouter 7 boss avec comportements uniques
// Ajouter configuration achievements
// Ajouter textes pédagogiques
```

#### `WaveManager.js`
```javascript
// Intégrer TransitionScreen entre vagues
// Gérer spawn des boss après X ennemis
// Tracker stats pour écrans de transition
// Gérer phases multiples du boss final
```

#### `Enemy.js`
```javascript
// Ajouter support sprites boss (taille 80-150px)
// Implémenter comportements boss (clones, téléportation, phases)
// Gestion projectiles boss
// Easter eggs visuels (cœur, cookies, etc.)
```

#### `GameOverlay.astro`
```javascript
// Intégrer BossIntro modal
// Afficher achievements débloqués
// HUD enrichi avec layer actuelle et texte pédagogique
```

### 3. Assets Visuels

```
public/images/game/
├── bosses/
│   ├── bobby-thompson.png      # 80x80px
│   ├── ivan-volkov.png         # 85x85px
│   ├── alice-chen.png          # 90x90px
│   ├── syn-mcmurphy.png        # 95x95px
│   ├── dimitri-petrov.png      # 100x100px
│   ├── morgan-blake.png        # 105x105px
│   └── guardian.png            # 150x150px (3 frames phases)
├── enemies/
│   └── [56 nouveaux sprites 20-50px]
├── effects/
│   ├── heart-pulse.png         # Easter egg Volkov
│   ├── cookie-drop.png         # Easter egg Alice
│   └── bsod-screen.png         # Easter egg Guardian
└── achievements/
    └── [Icons 32x32px pour achievements]
```

### 4. Audio

```
public/sounds/game/
├── bosses/
│   ├── bobby-quote.mp3         # "DROP TABLE"
│   ├── volkov-heartbeat.mp3    # Heartbeat pulse
│   ├── alice-cookies.mp3       # "Om nom nom"
│   ├── mcmurphy-syn.mp3        # "SYN, SYN-ACK..."
│   └── guardian-alarm.mp3      # Alarme datacenter
├── transitions/
│   └── typing-effect.mp3       # Logs système
└── achievements/
    └── unlock.mp3              # Achievement débloqué
```

---

## Plan d'Implémentation

### Phase 1 : Infrastructure (Semaine 1)
- [ ] Créer système de transitions (`TransitionScreen.js`)
- [ ] Créer système d'intro boss (`BossIntro.js`)
- [ ] Créer système achievements (`AchievementSystem.js`)
- [ ] Modifier `WaveManager` pour intégrer transitions

### Phase 2 : Boss (Semaine 2)
- [ ] Implémenter 7 comportements boss dans `bossBehaviors.js`
- [ ] Créer sprites boss (7 personnages)
- [ ] Intégrer intros modales avec textes narratifs
- [ ] Tester chaque boss individuellement

### Phase 3 : Ennemis (Semaine 3)
- [ ] Ajouter 56 nouveaux ennemis dans `gameConfig.js`
- [ ] Créer sprites ennemis (ou utiliser emojis Unicode)
- [ ] Équilibrer HP/Speed/Points
- [ ] Tester spawn et comportements

### Phase 4 : Contenu Narratif (Semaine 4)
- [ ] Rédiger tous les textes de transition (7 écrans)
- [ ] Rédiger points pédagogiques par couche
- [ ] Intégrer easter eggs visuels
- [ ] Créer écran de victoire finale

### Phase 5 : Polish & Testing (Semaine 5)
- [ ] Ajouter effets audio boss
- [ ] Implémenter achievements
- [ ] Balancing général (difficulté)
- [ ] Tests complets gameplay

### Phase 6 : Menu Start (Semaine 6)
- [ ] Refonte visuelle menu start (style terminal)
- [ ] Ajouter Hall of Fame
- [ ] Ajouter écran Crédits & Références
- [ ] Intégration finale

---

## Checklist de Validation

### ✅ Narrative
- [ ] Menu start remplacé par version "Formation SysAdmin"
- [ ] 7 intros boss avec textes uniques implémentées
- [ ] 7 écrans de transition avec contenu pédagogique
- [ ] Easter eggs boss tous présents
- [ ] Écran de victoire finale narratif

### ✅ Gameplay Boss
- [ ] Bobby Thompson : Injection en cascade fonctionne
- [ ] Ivan Volkov : Heartbleed pulse + memory leak
- [ ] Alice Chen : Clone attack + cookies
- [ ] Syn McMurphy : SYN flood spam
- [ ] Dimitri Petrov : IP masquerade + clones fantômes
- [ ] Morgan Blake : ARP storm AoE
- [ ] Le Gardien : 3 phases + attaques spéciales

### ✅ Ennemis
- [ ] 56 nouveaux ennemis ajoutés (8 par couche)
- [ ] Comportements variés (swarm, tank, teleport, etc.)
- [ ] Sprites/icônes pour tous les ennemis
- [ ] Équilibrage HP/Speed/Points cohérent

### ✅ Technique
- [ ] TransitionScreen.js fonctionnel
- [ ] BossIntro.js affichage modal
- [ ] AchievementSystem.js avec localStorage
- [ ] WaveManager intégration complète
- [ ] Enemy.js support comportements boss

### ✅ Audio/Visuel
- [ ] 7 sprites boss créés
- [ ] Sons boss spéciaux
- [ ] Easter eggs visuels (cœur, cookies, BSOD)
- [ ] Effets particules boss

### ✅ UX
- [ ] Transitions fluides entre vagues
- [ ] Textes lisibles et formatés
- [ ] Achievements notifiés à l'écran
- [ ] Hall of Fame fonctionnel

---

## Notes d'Implémentation

### Priorités de Développement

**P0 (Critique)**
1. Système de transitions (sans ça, pas de narrative)
2. Intros boss (expérience centrale)
3. Comportements boss basiques

**P1 (Important)**
4. Nouveaux ennemis L7-L4 (50% du contenu)
5. Easter eggs boss
6. Écran victoire finale

**P2 (Nice to have)**
7. Achievements système
8. Nouveaux ennemis L3-L1
9. Audio boss custom

### Contraintes Techniques

- **Performance** : Max 30 ennemis simultanés à l'écran
- **Mobile** : Transitions doivent être responsive
- **Taille** : Sprites boss <50KB chacun
- **Accessibilité** : Contraste texte transitions >4.5:1

### Références pour Développement

- Sprites boss : Style pixel art 8-bit (palette portfolio)
- Textes : Max 60 caractères par ligne pour lisibilité
- Animations : Utiliser les mêmes effets que le portfolio (glow, particles)
- Typographie : Monospace pour les écrans techniques

---

## Conclusion

Cette spécification transforme NetDefender en une **expérience pédagogique immersive** qui :

✅ **Enseigne** le modèle OSI de manière mémorable
✅ **Raconte** une histoire avec personnages et enjeux
✅ **Divertit** avec des références geek et easter eggs
✅ **Défie** avec des boss uniques et comportements variés

**Impact attendu** : Le jeu devient un véritable **atout portfolio** qui démontre :
- Compréhension profonde des réseaux
- Créativité dans la vulgarisation technique
- Capacité à créer du contenu engageant
- Culture tech/cybersécurité

---

**Document rédigé le** : 28 décembre 2025
**Version** : 2.0.0 - Spécification Complète
**Statut** : EN VALIDATION

**Prochaines étapes** :
1. Validation par le client (Adrien)
2. Création des maquettes visuelles (écrans transitions)
3. Début de l'implémentation Phase 1

---

*Ce document fait référence à `REFERENCE_PORTFOLIO.md` et `netdefender-game-reference.md` pour les détails techniques d'intégration.*
