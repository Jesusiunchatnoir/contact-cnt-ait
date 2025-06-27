#!/bin/sh
set -e
CERT_DIR="/etc/nginx/certs"
if [ ! -f "$CERT_DIR/fullchain.pem" ] || [ ! -f "$CERT_DIR/privkey.pem" ]; then
  echo "[Nginx] Génération d'un certificat auto-signé pour HTTPS local..."
  mkdir -p "$CERT_DIR"
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$CERT_DIR/privkey.pem" \
    -out "$CERT_DIR/fullchain.pem" \
    -subj "/C=FR/ST=Anarco/L=Local/O=Liberchat/CN=liberchat.local"
  echo "[Nginx] Certificat auto-signé généré."
fi
exec nginx -g 'daemon off;'
