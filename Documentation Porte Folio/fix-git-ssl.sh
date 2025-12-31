#!/bin/bash

################################################################################
# Fix Git SSL/TLS - PROTOLAB
#
# Description: Résout les problèmes de clonage Git (gnutls_handshake failed)
# Date: 28 décembre 2025
# Version: 1.0
#
# Usage: ./fix-git-ssl.sh
#
################################################################################

set -e

echo "=== Fix Git SSL/TLS Issues ==="
echo ""

# Solution 1: Installer ca-certificates à jour
echo "[1/4] Mise à jour des certificats CA..."
apt update -qq
apt install -y ca-certificates --reinstall
update-ca-certificates

# Solution 2: Configurer Git pour utiliser OpenSSL au lieu de GnuTLS
echo "[2/4] Configuration Git..."
git config --global http.sslVerify true
git config --global http.sslCAInfo /etc/ssl/certs/ca-certificates.crt

# Solution 3: Augmenter le timeout
echo "[3/4] Configuration timeout Git..."
git config --global http.postBuffer 524288000
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999

# Solution 4: Test de clonage
echo "[4/4] Test de clonage GitHub..."
if git ls-remote https://github.com/AdrienNewman/portfolio-protolab.git HEAD &>/dev/null; then
    echo "✅ Connexion GitHub OK"
else
    echo "⚠️  Problème persistant"
    echo ""
    echo "Solutions alternatives:"
    echo "1. Temporairement désactiver SSL (non recommandé):"
    echo "   git config --global http.sslVerify false"
    echo ""
    echo "2. Cloner via SSH au lieu de HTTPS:"
    echo "   git clone git@github.com:AdrienNewman/portfolio-protolab.git"
    echo ""
    echo "3. Télécharger le ZIP depuis GitHub:"
    echo "   wget https://github.com/AdrienNewman/portfolio-protolab/archive/refs/heads/master.zip"
fi

echo ""
echo "Configuration Git actuelle:"
git config --global --list | grep -E "(http|ssl)"
