#!/bin/bash

################################################################################
# Script d'Installation Web Gateway - PROTOLAB
#
# Description: Installation complète de Docker + Traefik sur CT210 web-gateway
# Phases: 1.3 à 2.5 (Configuration initiale + Traefik)
# Date: 28 décembre 2025
# Version: 1.0
#
# Prérequis:
#   - CT LXC Ubuntu 22.04 créé (CTID 210)
#   - IP: 10.1.10.50/24
#   - Accès SSH root
#   - Connectivité réseau (DNS, Internet)
#
# Usage:
#   1. Copier ce script sur CT210: scp install-web-gateway.sh root@10.1.10.50:/root/
#   2. Se connecter: ssh root@10.1.10.50
#   3. Rendre exécutable: chmod +x /root/install-web-gateway.sh
#   4. Exécuter: /root/install-web-gateway.sh
#
################################################################################

set -e  # Arrêter en cas d'erreur
set -u  # Erreur si variable non définie

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables globales
SCRIPT_VERSION="1.0"
LOG_FILE="/var/log/web-gateway-install.log"
DOCKER_BASE="/opt/docker"
TRAEFIK_DIR="${DOCKER_BASE}/traefik"
PORTFOLIO_DIR="${DOCKER_BASE}/portfolio"

################################################################################
# Fonctions utilitaires
################################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

print_header() {
    echo ""
    echo "========================================" | tee -a "$LOG_FILE"
    echo "$1" | tee -a "$LOG_FILE"
    echo "========================================" | tee -a "$LOG_FILE"
}

check_prerequisites() {
    print_header "Vérification des prérequis"

    # Vérifier que le script est exécuté en root
    if [[ $EUID -ne 0 ]]; then
        log_error "Ce script doit être exécuté en root"
        exit 1
    fi

    # Vérifier l'OS
    if ! grep -q "Ubuntu 22.04" /etc/os-release; then
        log_warning "OS non testé. Recommandé: Ubuntu 22.04"
    else
        log_success "Ubuntu 22.04 détecté"
    fi

    # Vérifier l'adresse IP
    local ip=$(hostname -I | awk '{print $1}')
    if [[ "$ip" != "10.1.10.50" ]]; then
        log_warning "IP actuelle: $ip (attendue: 10.1.10.50)"
    else
        log_success "IP correcte: $ip"
    fi

    # Vérifier la connectivité DNS
    if ping -c 1 -W 2 10.1.10.10 &>/dev/null; then
        log_success "Connectivité DNS (DC01) OK"
    else
        log_error "Impossible de joindre DC01 (10.1.10.10)"
        exit 1
    fi

        # Vérifier l'espace disque (minimum 5GB libre)
    local free_space=$(df / | awk 'NR==2 {print $4}')
    if [[ $free_space -lt 5242880 ]]; then
        log_warning "Espace disque faible: $(($free_space / 1024 / 1024))GB"
    else
        log_success "Espace disque suffisant: $(($free_space / 1024 / 1024))GB disponible"
    fi
}

################################################################################
# Phase 1.3 - Configuration Initiale
################################################################################

phase_1_3_system_update() {
    print_header "Phase 1.3 - Mise à jour du système"

    log_info "Mise à jour des paquets..."
    apt update -qq

    log_info "Mise à niveau du système..."
    DEBIAN_FRONTEND=noninteractive apt upgrade -y -qq

    log_success "Système mis à jour"
}

phase_1_3_install_packages() {
    print_header "Phase 1.3 - Installation des paquets essentiels"

    local packages=(
        ca-certificates
        curl
        gnupg
        lsb-release
        git
        htop
        nano
        wget
        net-tools
        dnsutils
        iputils-ping
        tree
        jq
    )

    log_info "Installation de ${#packages[@]} paquets..."
    DEBIAN_FRONTEND=noninteractive apt install -y -qq "${packages[@]}"

    log_success "Paquets essentiels installés"
}

phase_1_3_test_network() {
    print_header "Phase 1.3 - Test de la connectivité réseau"

    local targets=(
        "10.1.10.10:DC01 (DNS)"
        "10.1.40.25:VictoriaMetrics"
        "10.1.40.35:Grafana"
        "1.1.1.1:Internet"
    )

    for target in "${targets[@]}"; do
        local ip=$(echo "$target" | cut -d: -f1)
        local name=$(echo "$target" | cut -d: -f2)

        if ping -c 2 -W 2 "$ip" &>/dev/null; then
            log_success "Connectivité OK: $name ($ip)"
        else
            log_warning "Connectivité KO: $name ($ip)"
        fi
    done
}

################################################################################
# Phase 1.4 - Installation Docker
################################################################################

phase_1_4_install_docker() {
    print_header "Phase 1.4 - Installation Docker"

    # Vérifier si Docker est déjà installé
    if command -v docker &>/dev/null; then
        local docker_version=$(docker --version | awk '{print $3}' | tr -d ',')
        log_warning "Docker déjà installé (version $docker_version)"
        read -p "Réinstaller Docker? [y/N] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Installation Docker ignorée"
            return 0
        fi
    fi

    log_info "Téléchargement du script d'installation Docker..."
    curl -fsSL https://get.docker.com -o /tmp/get-docker.sh

    log_info "Exécution du script d'installation..."
    sh /tmp/get-docker.sh >> "$LOG_FILE" 2>&1

    log_info "Activation du service Docker..."
    systemctl enable docker
    systemctl start docker

    # Attendre que Docker soit prêt
    local retry=0
    while ! docker info &>/dev/null; do
        retry=$((retry + 1))
        if [[ $retry -gt 10 ]]; then
            log_error "Docker ne démarre pas"
            exit 1
        fi
        log_info "Attente du démarrage de Docker... ($retry/10)"
        sleep 2
    done

    local docker_version=$(docker --version | awk '{print $3}' | tr -d ',')
    log_success "Docker installé: version $docker_version"

    # Test Docker
    log_info "Test Docker avec hello-world..."
    if docker run --rm hello-world &>/dev/null; then
        log_success "Docker fonctionne correctement"
    else
        log_error "Échec du test Docker"
        exit 1
    fi

    # Nettoyage
    rm -f /tmp/get-docker.sh
}

phase_1_4_install_docker_compose() {
    print_header "Phase 1.4 - Installation Docker Compose"

    log_info "Installation du plugin Docker Compose..."
    DEBIAN_FRONTEND=noninteractive apt install -y -qq docker-compose-plugin

    local compose_version=$(docker compose version | awk '{print $4}' | tr -d 'v')
    log_success "Docker Compose installé: version $compose_version"
}

################################################################################
# Phase 1.5 - Création de l'arborescence
################################################################################

phase_1_5_create_structure() {
    print_header "Phase 1.5 - Création de l'arborescence des projets"

    log_info "Création des répertoires..."

    mkdir -p "${TRAEFIK_DIR}"/{dynamic,logs}
    mkdir -p "${PORTFOLIO_DIR}"
    mkdir -p "${DOCKER_BASE}/cloudflared"

    # Permissions
    chmod 755 "${DOCKER_BASE}"
    chmod 755 "${TRAEFIK_DIR}"
    chmod 755 "${PORTFOLIO_DIR}"
    chmod 755 "${TRAEFIK_DIR}/logs"

    log_success "Arborescence créée"

    # Afficher la structure
    if command -v tree &>/dev/null; then
        log_info "Structure créée:"
        tree -L 2 "${DOCKER_BASE}" | tee -a "$LOG_FILE"
    fi
}

################################################################################
# Phase 2 - Installation Traefik
################################################################################

phase_2_1_create_docker_compose() {
    print_header "Phase 2.1 - Création docker-compose.yml Traefik"

    cat > "${TRAEFIK_DIR}/docker-compose.yml" << 'EOF'
version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    container_name: traefik
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"  # Dashboard (interne uniquement)
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/etc/traefik/traefik.yml:ro
      - ./dynamic:/etc/traefik/dynamic:ro
      - ./acme.json:/acme.json
      - ./logs:/var/log/traefik
    networks:
      - traefik-public
    labels:
      - "traefik.enable=true"
      # Dashboard interne
      - "traefik.http.routers.traefik-dashboard.rule=Host(`traefik.protolab.local`)"
      - "traefik.http.routers.traefik-dashboard.service=api@internal"
      - "traefik.http.routers.traefik-dashboard.entrypoints=web"

networks:
  traefik-public:
    name: traefik-public
    driver: bridge
EOF

    log_success "docker-compose.yml créé"
}

phase_2_2_create_traefik_config() {
    print_header "Phase 2.2 - Création traefik.yml"

    cat > "${TRAEFIK_DIR}/traefik.yml" << 'EOF'
api:
  dashboard: true
  insecure: true  # Dashboard sur :8080 (interne)

entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: traefik-public
  file:
    directory: /etc/traefik/dynamic
    watch: true

log:
  level: INFO
  filePath: /var/log/traefik/traefik.log

accessLog:
  filePath: /var/log/traefik/access.log
EOF

    log_success "traefik.yml créé"
}

phase_2_3_create_dynamic_config() {
    print_header "Phase 2.3 - Création des configurations dynamiques"

    # Fichier internal-services.yml
    cat > "${TRAEFIK_DIR}/dynamic/internal-services.yml" << 'EOF'
http:
  routers:
    # Grafana
    grafana-router:
      rule: "Host(`grafana.protolab.local`)"
      service: grafana-service
      entryPoints:
        - web

    # Proxmox (HTTPS backend)
    proxmox-router:
      rule: "Host(`pve.protolab.local`)"
      service: proxmox-service
      entryPoints:
        - web

    # Palo Alto (HTTPS backend)
    paloalto-router:
      rule: "Host(`firewall.protolab.local`)"
      service: paloalto-service
      entryPoints:
        - web

  services:
    grafana-service:
      loadBalancer:
        servers:
          - url: "http://10.1.40.35:3000"

    proxmox-service:
      loadBalancer:
        servers:
          - url: "https://192.168.1.100:8006"
        serversTransport: insecure-transport

    paloalto-service:
      loadBalancer:
        servers:
          - url: "https://10.1.10.254:443"
        serversTransport: insecure-transport

  serversTransports:
    insecure-transport:
      insecureSkipVerify: true
EOF

    log_success "internal-services.yml créé"

    # Fichier middlewares.yml
    cat > "${TRAEFIK_DIR}/dynamic/middlewares.yml" << 'EOF'
http:
  middlewares:
    # Security headers
    secure-headers:
      headers:
        frameDeny: true
        browserXssFilter: true
        contentTypeNosniff: true
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        stsPreload: true
        customFrameOptionsValue: "SAMEORIGIN"

    # Rate limiting
    rate-limit:
      rateLimit:
        average: 100
        burst: 50
EOF

    log_success "middlewares.yml créé"
}

phase_2_4_init_acme() {
    print_header "Phase 2.4 - Initialisation acme.json"

    touch "${TRAEFIK_DIR}/acme.json"
    chmod 600 "${TRAEFIK_DIR}/acme.json"

    log_success "acme.json créé avec permissions 600"
}

phase_2_5_start_traefik() {
    print_header "Phase 2.5 - Démarrage de Traefik"

    cd "${TRAEFIK_DIR}"

    log_info "Pull de l'image Traefik..."
    docker compose pull

    log_info "Démarrage du conteneur..."
    docker compose up -d

    # Attendre que Traefik soit prêt
    local retry=0
    while ! docker compose ps | grep -q "Up"; do
        retry=$((retry + 1))
        if [[ $retry -gt 30 ]]; then
            log_error "Traefik ne démarre pas"
            docker compose logs
            exit 1
        fi
        log_info "Attente du démarrage de Traefik... ($retry/30)"
        sleep 2
    done

    log_success "Traefik démarré"

    # Afficher les logs
    log_info "Dernières lignes des logs:"
    docker compose logs --tail=10 | tee -a "$LOG_FILE"
}

phase_2_verify_traefik() {
    print_header "Phase 2 - Vérification Traefik"

    # Vérifier le statut du conteneur
    if docker ps | grep -q traefik; then
        log_success "Conteneur Traefik en cours d'exécution"
    else
        log_error "Conteneur Traefik non démarré"
        exit 1
    fi

    # Vérifier le port 8080 (dashboard)
    if netstat -tuln | grep -q ":8080"; then
        log_success "Dashboard Traefik accessible sur :8080"
    else
        log_warning "Port 8080 non ouvert"
    fi

    # Vérifier les ports 80 et 443
    if netstat -tuln | grep -q ":80" && netstat -tuln | grep -q ":443"; then
        log_success "Ports HTTP (80) et HTTPS (443) ouverts"
    else
        log_warning "Ports HTTP/HTTPS non tous ouverts"
    fi

    # Tester l'API Traefik
    sleep 5  # Attendre que l'API soit prête
    if curl -s http://localhost:8080/api/rawdata | jq . &>/dev/null; then
        log_success "API Traefik répond correctement"
    else
        log_warning "API Traefik non accessible (normal si Traefik démarre)"
    fi

    # Vérifier le réseau Docker
    if docker network ls | grep -q traefik-public; then
        log_success "Réseau traefik-public créé"
    else
        log_error "Réseau traefik-public manquant"
    fi
}

################################################################################
# Rapport final
################################################################################

generate_final_report() {
    print_header "Rapport d'Installation"

    echo "" | tee -a "$LOG_FILE"
    echo "╔════════════════════════════════════════════════════════╗" | tee -a "$LOG_FILE"
    echo "║     Installation Web Gateway - TERMINÉE               ║" | tee -a "$LOG_FILE"
    echo "╚════════════════════════════════════════════════════════╝" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # Informations système
    echo "📋 Informations Système:" | tee -a "$LOG_FILE"
    echo "   - Hostname: $(hostname)" | tee -a "$LOG_FILE"
    echo "   - IP: $(hostname -I | awk '{print $1}')" | tee -a "$LOG_FILE"
    echo "   - OS: $(lsb_release -d | cut -f2)" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # Versions installées
    echo "📦 Versions Installées:" | tee -a "$LOG_FILE"
    echo "   - Docker: $(docker --version | awk '{print $3}' | tr -d ',')" | tee -a "$LOG_FILE"
    echo "   - Docker Compose: $(docker compose version | awk '{print $4}' | tr -d 'v')" | tee -a "$LOG_FILE"
    echo "   - Traefik: $(docker exec traefik traefik version 2>/dev/null | grep Version | awk '{print $2}' || echo 'En cours...')" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # Services actifs
    echo "🐳 Conteneurs Docker:" | tee -a "$LOG_FILE"
    docker ps --format "   - {{.Names}}: {{.Status}}" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # URLs d'accès
    echo "🌐 URLs d'Accès:" | tee -a "$LOG_FILE"
    echo "   - Dashboard Traefik: http://10.1.10.50:8080" | tee -a "$LOG_FILE"
    echo "   - Dashboard Traefik: http://traefik.protolab.local:8080" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # Fichiers de configuration
    echo "📁 Fichiers de Configuration:" | tee -a "$LOG_FILE"
    echo "   - Base: ${DOCKER_BASE}" | tee -a "$LOG_FILE"
    echo "   - Traefik: ${TRAEFIK_DIR}" | tee -a "$LOG_FILE"
    echo "   - Logs: ${TRAEFIK_DIR}/logs" | tee -a "$LOG_FILE"
    echo "   - Log d'installation: ${LOG_FILE}" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # Prochaines étapes
    echo "📝 Prochaines Étapes:" | tee -a "$LOG_FILE"
    echo "   1. Vérifier le dashboard: http://10.1.10.50:8080" | tee -a "$LOG_FILE"
    echo "   2. Configurer DNS sur DC01 (voir documentation Phase 5)" | tee -a "$LOG_FILE"
    echo "   3. Configurer firewall PA-VM (voir documentation Phase 4)" | tee -a "$LOG_FILE"
    echo "   4. Déployer le portfolio (voir documentation Phase 3)" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # Commandes utiles
    echo "💡 Commandes Utiles:" | tee -a "$LOG_FILE"
    echo "   - Voir les logs Traefik:  docker logs traefik -f" | tee -a "$LOG_FILE"
    echo "   - Redémarrer Traefik:     cd ${TRAEFIK_DIR} && docker compose restart" | tee -a "$LOG_FILE"
    echo "   - Arrêter Traefik:        cd ${TRAEFIK_DIR} && docker compose down" | tee -a "$LOG_FILE"
    echo "   - Démarrer Traefik:       cd ${TRAEFIK_DIR} && docker compose up -d" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    log_success "Installation terminée avec succès !"
    echo ""
    echo "Consultez le log complet: $LOG_FILE"
}

################################################################################
# Fonction principale
################################################################################

main() {
    clear
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║   Installation Web Gateway - PROTOLAB v${SCRIPT_VERSION}            ║"
    echo "╠════════════════════════════════════════════════════════╣"
    echo "║   Phases: 1.3 à 2.5 (Config initiale + Traefik)       ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""

    # Initialiser le log
    echo "=== Installation démarrée le $(date) ===" > "$LOG_FILE"

    # Vérifications préalables
    check_prerequisites

    # Confirmation
    echo ""
    read -p "Continuer l'installation? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "Installation annulée par l'utilisateur"
        exit 0
    fi

    # Phase 1.3 - Configuration initiale
    phase_1_3_system_update
    phase_1_3_install_packages
    phase_1_3_test_network

    # Phase 1.4 - Docker
    phase_1_4_install_docker
    phase_1_4_install_docker_compose

    # Phase 1.5 - Arborescence
    phase_1_5_create_structure

    # Phase 2 - Traefik
    phase_2_1_create_docker_compose
    phase_2_2_create_traefik_config
    phase_2_3_create_dynamic_config
    phase_2_4_init_acme
    phase_2_5_start_traefik
    phase_2_verify_traefik

    # Rapport final
    generate_final_report

    echo ""
    echo "=== Installation terminée le $(date) ===" >> "$LOG_FILE"
}

################################################################################
# Exécution
################################################################################

# Gestion des signaux
trap 'log_error "Installation interrompue"; exit 130' INT TERM

# Lancer le script
main "$@"

exit 0
