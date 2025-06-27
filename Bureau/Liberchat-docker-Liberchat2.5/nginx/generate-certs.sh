#!/bin/sh
# Génère un certificat auto-signé pour usage local
set -e
CERT_DIR="$(dirname "$0")/certs"
mkdir -p "$CERT_DIR"
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$CERT_DIR/privkey.pem" \
  -out "$CERT_DIR/fullchain.pem" \
  -subj "/C=FR/ST=Anarco/L=Local/O=Liberchat/CN=liberchat.local"
echo "Certificat auto-signé généré dans $CERT_DIR."
