#!/bin/bash

################################################################################
# Script d'Installation Portfolio - PROTOLAB
#
# Description: Déploiement du Portfolio V4.7 avec support SSR
# Phase: 3 (Déploiement Portfolio complet)
# Date: 28 décembre 2025
# Version: 1.0
#
# Prérequis:
#   - CT210 web-gateway configuré
#   - Docker et Docker Compose installés
#   - Traefik opérationnel
#   - Réseau traefik-public existant
#   - Accès à VictoriaMetrics (10.1.40.25:8428)
#
# Usage:
#   1. Copier ce script sur CT210: scp install-portfolio.sh root@10.1.10.50:/root/
#   2. Se connecter: ssh root@10.1.10.50
#   3. Rendre exécutable: chmod +x /root/install-portfolio.sh
#   4. Exécuter: /root/install-portfolio.sh
#
################################################################################

set -e  # Arrêter en cas d'erreur
set -u  # Erreur si variable non définie

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables globales
SCRIPT_VERSION="1.0"
LOG_FILE="/var/log/portfolio-install.log"
PORTFOLIO_DIR="/opt/docker/portfolio"
GIT_REPO="https://github.com/AdrienNewman/portfolio-protolab.git"
VICTORIA_METRICS_URL="http://10.1.40.25:8428"

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

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1" | tee -a "$LOG_FILE"
}

print_header() {
    echo ""
    echo "========================================" | tee -a "$LOG_FILE"
    echo "$1" | tee -a "$LOG_FILE"
    echo "========================================" | tee -a "$LOG_FILE"
}

print_banner() {
    cat << "EOF"
╔════════════════════════════════════════════════════════╗
║   Installation Portfolio V4.7 - PROTOLAB              ║
╠════════════════════════════════════════════════════════╣
║   Phase 3: Déploiement complet avec SSR               ║
╚════════════════════════════════════════════════════════╝
EOF
}

################################################################################
# Vérifications préalables
################################################################################

check_prerequisites() {
    print_header "Vérification des prérequis"

    # Vérifier root
    if [[ $EUID -ne 0 ]]; then
        log_error "Ce script doit être exécuté en root"
        exit 1
    fi

    # Vérifier Docker
    if ! command -v docker &>/dev/null; then
        log_error "Docker n'est pas installé"
        exit 1
    fi
    log_success "Docker installé: $(docker --version | awk '{print $3}' | tr -d ',')"

    # Vérifier Docker Compose
    if ! docker compose version &>/dev/null; then
        log_error "Docker Compose n'est pas installé"
        exit 1
    fi
    log_success "Docker Compose installé: $(docker compose version | awk '{print $4}' | tr -d 'v')"

    # Vérifier que Docker tourne
    if ! docker info &>/dev/null; then
        log_error "Docker daemon non démarré"
        exit 1
    fi
    log_success "Docker daemon actif"

    # Vérifier Traefik
    if ! docker ps | grep -q traefik; then
        log_error "Traefik n'est pas démarré. Exécutez install-web-gateway.sh d'abord"
        exit 1
    fi
    log_success "Traefik opérationnel"

    # Vérifier le réseau traefik-public
    if ! docker network ls | grep -q traefik-public; then
        log_error "Réseau traefik-public manquant"
        exit 1
    fi
    log_success "Réseau traefik-public détecté"

    # Vérifier Git
    if ! command -v git &>/dev/null; then
        log_warning "Git non installé, installation en cours..."
        apt update -qq && apt install -y -qq git
    fi
    log_success "Git installé: $(git --version | awk '{print $3}')"

    # Vérifier la connectivité à VictoriaMetrics
    log_info "Test de connectivité à VictoriaMetrics..."
    if curl -s --max-time 5 "${VICTORIA_METRICS_URL}/api/v1/query?query=up" &>/dev/null; then
        log_success "VictoriaMetrics accessible (${VICTORIA_METRICS_URL})"
    else
        log_warning "VictoriaMetrics non accessible. L'API LiveLab ne fonctionnera pas."
        log_warning "Vérifiez les règles firewall PA-VM (Phase 4 de la doc)"
    fi

    # Vérifier l'espace disque
    local free_space=$(df / | awk 'NR==2 {print $4}')
    if [[ $free_space -lt 2097152 ]]; then  # 2GB
        log_warning "Espace disque faible: $(($free_space / 1024 / 1024))GB"
    else
        log_success "Espace disque: $(($free_space / 1024 / 1024))GB disponible"
    fi
}

################################################################################
# Phase 3.1 - Clonage du Repository
################################################################################

phase_3_1_clone_repository() {
    print_header "Phase 3.1 - Clonage du Repository GitHub"

    # Vérifier si le répertoire existe déjà
    if [[ -d "${PORTFOLIO_DIR}/.git" ]]; then
        log_warning "Repository déjà cloné dans ${PORTFOLIO_DIR}"

        read -p "Voulez-vous: [1] Pull les dernières modifications [2] Réinitialiser complètement? [1/2] " -n 1 -r
        echo

        if [[ $REPLY == "1" ]]; then
            log_info "Pull des dernières modifications..."
            cd "${PORTFOLIO_DIR}"
            git pull origin master
            log_success "Repository mis à jour"
            return 0
        elif [[ $REPLY == "2" ]]; then
            log_warning "Suppression du répertoire existant..."
            rm -rf "${PORTFOLIO_DIR}"
        else
            log_info "Utilisation du repository existant"
            return 0
        fi
    fi

    # Créer le répertoire parent si nécessaire
    mkdir -p "$(dirname "${PORTFOLIO_DIR}")"

    # Cloner le repository
    log_info "Clonage depuis ${GIT_REPO}..."
    if git clone "${GIT_REPO}" "${PORTFOLIO_DIR}"; then
        log_success "Repository cloné avec succès"
    else
        log_error "Échec du clonage Git"
        exit 1
    fi

    # Afficher la branche et le dernier commit
    cd "${PORTFOLIO_DIR}"
    local branch=$(git rev-parse --abbrev-ref HEAD)
    local commit=$(git log -1 --format="%h - %s" | head -1)
    log_info "Branche: ${branch}"
    log_info "Dernier commit: ${commit}"

    # Compter les fichiers
    local file_count=$(find . -type f | wc -l)
    log_success "Repository contient ${file_count} fichiers"
}

################################################################################
# Phase 3.2 - Création du Dockerfile SSR
################################################################################

phase_3_2_create_dockerfile_ssr() {
    print_header "Phase 3.2 - Création du Dockerfile SSR"

    cd "${PORTFOLIO_DIR}"

    # Sauvegarder l'ancien Dockerfile si existant
    if [[ -f "Dockerfile" ]]; then
        log_info "Sauvegarde de l'ancien Dockerfile..."
        cp Dockerfile Dockerfile.nginx.bak
        log_success "Ancien Dockerfile sauvegardé (Dockerfile.nginx.bak)"
    fi

    # Créer le nouveau Dockerfile SSR
    log_info "Création de Dockerfile.ssr..."
    cat > Dockerfile.ssr << 'EOF'
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copier package files
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build Astro en mode SSR
RUN npm run build

# Production stage - Node.js runtime
FROM node:20-alpine AS runtime

WORKDIR /app

# Copier uniquement les fichiers nécessaires
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Variables d'environnement par défaut
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

# Exposer le port
EXPOSE 4321

# Healthcheck pour Docker
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4321/api/lab-status.json', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Démarrer le serveur Node.js
CMD ["node", "./dist/server/entry.mjs"]
EOF

    log_success "Dockerfile.ssr créé"

    # Afficher les différences si ancien Dockerfile existe
    if [[ -f "Dockerfile.nginx.bak" ]]; then
        log_info "Différences avec l'ancien Dockerfile:"
        echo "  - Ancien: Nginx statique (multi-stage avec nginx:alpine)"
        echo "  - Nouveau: Node.js SSR (runtime Node.js pour /api/lab-status.json)"
    fi
}

################################################################################
# Phase 3.3 - Création du fichier .env
################################################################################

phase_3_3_create_env_file() {
    print_header "Phase 3.3 - Création du fichier .env"

    cd "${PORTFOLIO_DIR}"

    # Demander si on veut personnaliser les URLs
    local victoria_url="${VICTORIA_METRICS_URL}"

    echo ""
    read -p "URL VictoriaMetrics par défaut: ${VICTORIA_METRICS_URL}. Modifier? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Nouvelle URL VictoriaMetrics: " victoria_url
    fi

    # Créer le fichier .env
    log_info "Création du fichier .env..."
    cat > .env << EOF
# Environment Configuration - Portfolio PROTOLAB
# Generated: $(date)

NODE_ENV=production
VICTORIA_METRICS_URL=${victoria_url}
VICTORIA_LOGS_URL=${victoria_url/8428/9428}
EOF

    # Permissions sécurisées
    chmod 600 .env

    log_success "Fichier .env créé"
    log_info "Configuration:"
    echo "  - VICTORIA_METRICS_URL=${victoria_url}"
    echo "  - VICTORIA_LOGS_URL=${victoria_url/8428/9428}"
}

################################################################################
# Phase 3.4 - Création du docker-compose.yml
################################################################################

phase_3_4_create_docker_compose() {
    print_header "Phase 3.4 - Création du docker-compose.yml"

    cd "${PORTFOLIO_DIR}"

    # Sauvegarder l'ancien docker-compose.yml si existant
    if [[ -f "docker-compose.yml" ]]; then
        log_info "Sauvegarde de l'ancien docker-compose.yml..."
        cp docker-compose.yml docker-compose.yml.bak
    fi

    # Créer le nouveau docker-compose.yml
    log_info "Création de docker-compose.yml..."
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  portfolio:
    build:
      context: .
      dockerfile: Dockerfile.ssr
    container_name: protolab-portfolio
    restart: unless-stopped
    env_file:
      - .env
    networks:
      - traefik-public
    labels:
      - "traefik.enable=true"
      # Route interne (protolab.local)
      - "traefik.http.routers.portfolio-internal.rule=Host(`portfolio.protolab.local`)"
      - "traefik.http.routers.portfolio-internal.entrypoints=web"
      - "traefik.http.services.portfolio.loadbalancer.server.port=4321"
      # Middlewares de sécurité
      - "traefik.http.routers.portfolio-internal.middlewares=secure-headers@file"
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:4321/api/lab-status.json"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  traefik-public:
    external: true
EOF

    log_success "docker-compose.yml créé"
    log_info "Configuration:"
    echo "  - Image: Dockerfile.ssr (Node.js SSR)"
    echo "  - Réseau: traefik-public (externe)"
    echo "  - Route: portfolio.protolab.local"
    echo "  - Healthcheck: /api/lab-status.json"
}

################################################################################
# Phase 3.5 - Build de l'Image Docker
################################################################################

phase_3_5_build_image() {
    print_header "Phase 3.5 - Build de l'Image Docker"

    cd "${PORTFOLIO_DIR}"

    log_info "Vérification de package.json..."
    if [[ ! -f "package.json" ]]; then
        log_error "package.json manquant"
        exit 1
    fi

    # Afficher les dépendances
    log_info "Dépendances du projet:"
    if command -v jq &>/dev/null; then
        jq -r '.dependencies | keys[]' package.json 2>/dev/null | while read dep; do
            echo "  - ${dep}"
        done | tee -a "$LOG_FILE"
    fi

    log_step "Démarrage du build Docker (cela peut prendre 5-10 minutes)..."
    echo "  ⏳ Installation des dépendances npm..."
    echo "  ⏳ Build Astro SSR..."
    echo "  ⏳ Création de l'image de production..."
    echo ""

    # Build avec affichage en temps réel
    if docker compose build --progress=plain 2>&1 | tee -a "$LOG_FILE"; then
        log_success "Build Docker terminé avec succès"
    else
        log_error "Échec du build Docker"
        log_error "Consultez les logs: ${LOG_FILE}"
        exit 1
    fi

    # Vérifier que l'image existe
    if docker images | grep -q "protolab-portfolio"; then
        local image_size=$(docker images protolab-portfolio --format "{{.Size}}")
        log_success "Image créée: protolab-portfolio (Taille: ${image_size})"
    else
        log_error "Image Docker non créée"
        exit 1
    fi
}

################################################################################
# Phase 3.6 - Démarrage du Conteneur
################################################################################

phase_3_6_start_container() {
    print_header "Phase 3.6 - Démarrage du Conteneur Portfolio"

    cd "${PORTFOLIO_DIR}"

    # Arrêter le conteneur existant si présent
    if docker ps -a | grep -q protolab-portfolio; then
        log_warning "Conteneur existant détecté, arrêt en cours..."
        docker compose down
    fi

    log_info "Démarrage du conteneur..."
    docker compose up -d

    # Attendre que le conteneur soit prêt
    log_step "Attente du démarrage du conteneur..."
    local retry=0
    local max_retries=60

    while [[ $retry -lt $max_retries ]]; do
        if docker ps | grep -q protolab-portfolio; then
            if docker exec protolab-portfolio wget --quiet --tries=1 --spider http://localhost:4321/api/lab-status.json 2>/dev/null; then
                log_success "Conteneur démarré et API répond"
                break
            fi
        fi

        retry=$((retry + 1))
        echo -ne "\r  ⏳ Tentative ${retry}/${max_retries}..."
        sleep 2
    done
    echo ""

    if [[ $retry -ge $max_retries ]]; then
        log_error "Le conteneur ne démarre pas correctement"
        log_error "Affichage des logs:"
        docker compose logs --tail=50
        exit 1
    fi
}

################################################################################
# Phase 3.7 - Tests et Vérifications
################################################################################

phase_3_7_test_portfolio() {
    print_header "Phase 3.7 - Tests et Vérifications"

    cd "${PORTFOLIO_DIR}"

    # Test 1: Vérifier que le conteneur tourne
    log_step "Test 1/5: Statut du conteneur"
    if docker ps | grep -q protolab-portfolio; then
        local uptime=$(docker ps --format "{{.Status}}" --filter "name=protolab-portfolio")
        log_success "Conteneur actif: ${uptime}"
    else
        log_error "Conteneur non démarré"
        return 1
    fi

    # Test 2: Vérifier l'API LiveLab
    log_step "Test 2/5: API LiveLab (/api/lab-status.json)"
    if curl -s --max-time 5 http://localhost:4321/api/lab-status.json | jq . &>/dev/null; then
        log_success "API LiveLab répond avec JSON valide"

        # Extraire le statut Proxmox si disponible
        local pve_status=$(curl -s http://localhost:4321/api/lab-status.json | jq -r '.services.proxmox.status' 2>/dev/null || echo "unknown")
        log_info "Statut Proxmox: ${pve_status}"
    else
        log_warning "API LiveLab ne répond pas (vérifier règles PA-VM)"
    fi

    # Test 3: Vérifier la page d'accueil
    log_step "Test 3/5: Page d'accueil HTML"
    if curl -s --max-time 5 http://localhost:4321/ | grep -q "<!DOCTYPE html>"; then
        log_success "Page d'accueil accessible"
    else
        log_error "Page d'accueil non accessible"
    fi

    # Test 4: Vérifier Traefik routing
    log_step "Test 4/5: Routing Traefik (portfolio.protolab.local)"
    local host_ip=$(hostname -I | awk '{print $1}')
    if curl -s --max-time 5 -H "Host: portfolio.protolab.local" "http://${host_ip}/" | grep -q "<!DOCTYPE html>"; then
        log_success "Routing Traefik fonctionnel"
    else
        log_warning "Routing Traefik non fonctionnel (vérifier DNS)"
    fi

    # Test 5: Vérifier les logs
    log_step "Test 5/5: Logs du conteneur"
    if docker compose logs --tail=5 2>&1 | grep -q -E "(listening|server|started)"; then
        log_success "Logs indiquent un démarrage normal"
    else
        log_warning "Logs inhabituels, vérification recommandée"
    fi

    echo ""
    log_success "Tests terminés"
}

################################################################################
# Rapport Final
################################################################################

generate_final_report() {
    print_header "Rapport d'Installation Portfolio"

    echo "" | tee -a "$LOG_FILE"
    echo "╔════════════════════════════════════════════════════════╗" | tee -a "$LOG_FILE"
    echo "║     Portfolio V4.7 - DÉPLOYÉ AVEC SUCCÈS              ║" | tee -a "$LOG_FILE"
    echo "╚════════════════════════════════════════════════════════╝" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # Informations du déploiement
    echo "📦 Informations Déploiement:" | tee -a "$LOG_FILE"
    echo "   - Version: V4.7 (LiveLab + SSR)" | tee -a "$LOG_FILE"
    echo "   - Framework: Astro 5.16.x" | tee -a "$LOG_FILE"
    echo "   - Runtime: Node.js 20 (Alpine)" | tee -a "$LOG_FILE"
    echo "   - Répertoire: ${PORTFOLIO_DIR}" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # Conteneur
    echo "🐳 Conteneur Docker:" | tee -a "$LOG_FILE"
    docker ps --filter "name=protolab-portfolio" --format "   - {{.Names}}: {{.Status}}" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # URLs d'accès
    echo "🌐 URLs d'Accès:" | tee -a "$LOG_FILE"
    echo "   - Portfolio (direct): http://10.1.10.50:4321" | tee -a "$LOG_FILE"
    echo "   - Portfolio (Traefik): http://portfolio.protolab.local" | tee -a "$LOG_FILE"
    echo "   - API LiveLab: http://portfolio.protolab.local/api/lab-status.json" | tee -a "$LOG_FILE"
    echo "   - Dashboard Traefik: http://traefik.protolab.local:8080" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # Test rapide de l'API
    log_info "Test de l'API LiveLab..."
    local api_test=$(curl -s --max-time 3 http://localhost:4321/api/lab-status.json 2>/dev/null)
    if [[ -n "$api_test" ]]; then
        echo "✅ API LiveLab opérationnelle" | tee -a "$LOG_FILE"
        if command -v jq &>/dev/null; then
            echo "$api_test" | jq -r '"   - Services monitorés: \(.services | keys | join(", "))"' 2>/dev/null | tee -a "$LOG_FILE"
        fi
    else
        echo "⚠️  API LiveLab non accessible (vérifier règles PA-VM)" | tee -a "$LOG_FILE"
    fi
    echo "" | tee -a "$LOG_FILE"

    # Prochaines étapes
    echo "📝 Prochaines Étapes:" | tee -a "$LOG_FILE"
    echo "   1. ✅ Configurer DNS sur DC01 (Phase 5):" | tee -a "$LOG_FILE"
    echo "      PowerShell: Add-DnsServerResourceRecordCName -ZoneName 'protolab.local' \\" | tee -a "$LOG_FILE"
    echo "                  -Name 'portfolio' -HostNameAlias 'web-gateway.protolab.local'" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    echo "   2. ✅ Vérifier règles firewall PA-VM (Phase 4):" | tee -a "$LOG_FILE"
    echo "      - SERVERS → INFRA : web-gateway → victorialogs (TCP/8428)" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    echo "   3. 🌐 Tester depuis un navigateur:" | tee -a "$LOG_FILE"
    echo "      http://portfolio.protolab.local" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # Commandes utiles
    echo "💡 Commandes Utiles:" | tee -a "$LOG_FILE"
    echo "   - Voir les logs:        docker logs protolab-portfolio -f" | tee -a "$LOG_FILE"
    echo "   - Redémarrer:           cd ${PORTFOLIO_DIR} && docker compose restart" | tee -a "$LOG_FILE"
    echo "   - Arrêter:              cd ${PORTFOLIO_DIR} && docker compose down" | tee -a "$LOG_FILE"
    echo "   - Rebuild:              cd ${PORTFOLIO_DIR} && docker compose up -d --build" | tee -a "$LOG_FILE"
    echo "   - Shell dans conteneur: docker exec -it protolab-portfolio sh" | tee -a "$LOG_FILE"
    echo "   - Tester API:           curl http://localhost:4321/api/lab-status.json | jq" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # Dépannage
    echo "🔧 Dépannage Rapide:" | tee -a "$LOG_FILE"
    echo "   - API 502 Bad Gateway → Vérifier règles PA-VM (portfolio-to-victoria)" | tee -a "$LOG_FILE"
    echo "   - DNS ne résout pas   → Ajouter CNAME sur DC01" | tee -a "$LOG_FILE"
    echo "   - Conteneur crash     → docker logs protolab-portfolio" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    log_success "Installation Portfolio terminée avec succès !"
    echo ""
    echo "📄 Log complet: ${LOG_FILE}"
    echo ""
}

################################################################################
# Fonction Principale
################################################################################

main() {
    clear
    print_banner
    echo ""

    # Initialiser le log
    echo "=== Installation Portfolio démarrée le $(date) ===" > "$LOG_FILE"

    # Vérifications
    check_prerequisites

    # Confirmation
    echo ""
    read -p "Continuer le déploiement du Portfolio? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "Installation annulée par l'utilisateur"
        exit 0
    fi

    # Phases d'installation
    phase_3_1_clone_repository
    phase_3_2_create_dockerfile_ssr
    phase_3_3_create_env_file
    phase_3_4_create_docker_compose
    phase_3_5_build_image
    phase_3_6_start_container
    phase_3_7_test_portfolio

    # Rapport final
    generate_final_report

    echo ""
    echo "=== Installation Portfolio terminée le $(date) ===" >> "$LOG_FILE"
}

################################################################################
# Exécution
################################################################################

# Gestion des signaux
trap 'log_error "Installation interrompue"; exit 130' INT TERM

# Lancer le script
main "$@"

exit 0
