# Dockerfile monolithique pour Liberchat (Node.js + Vite/React)
# Le backend Node.js sert automatiquement le frontend Vite/React compilé (dossier dist/)
FROM node:20-alpine as build
WORKDIR /app

ARG BRANCH=Liberchat6.1.16
ENV BRANCH=${BRANCH}

# Forcer le build Vite à générer des URLs absolues en http (pas https)
ARG VITE_BASE_URL=/
ENV VITE_BASE_URL=${VITE_BASE_URL}

# Télécharger la branche ou le tag souhaité du projet Liberchat
RUN apk add --no-cache wget tar \
  && wget -O liberchat.tar.gz https://github.com/Liberchat/Liberchat/archive/refs/heads/${BRANCH}.tar.gz || wget -O liberchat.tar.gz https://github.com/Liberchat/Liberchat/archive/refs/tags/${BRANCH}.tar.gz \
  && tar -xzf liberchat.tar.gz --strip-components=1 \
  && rm liberchat.tar.gz

# Build du frontend (dist/) et backend
RUN npm install && VITE_BASE_URL=$VITE_BASE_URL npm run build

FROM node:20-alpine as prod
WORKDIR /app
COPY --from=build /app .
# Frontend ET backend accessibles sur ce port
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server.js"]

# Ce conteneur ne sert que du http sur le port 3000. Pour du https, placez un reverse proxy devant (voir doc).

# Variante avancée :
# Pour servir le frontend via Nginx, builder le front puis copier dist/ dans une image nginx
# Voir docker-compose.example.yml pour un exemple de séparation front/back
