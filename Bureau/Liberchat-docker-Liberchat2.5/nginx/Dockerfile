FROM nginx:alpine

RUN apk add --no-cache openssl

# Copie la conf nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ajoute l'entrypoint qui génère le certificat auto-signé si besoin
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 443 80
ENTRYPOINT ["/entrypoint.sh"]
