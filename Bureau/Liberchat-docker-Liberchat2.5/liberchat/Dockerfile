# Dockerfile pour Liberchat (Node.js + Vite/React) - build distant depuis GitHub
FROM node:20-alpine as build
WORKDIR /app

ARG BRANCH=Liberchat6.1.20
ENV BRANCH=${BRANCH}

# Forcer le build Vite à générer des URLs absolues en http (pas https)
ARG VITE_BASE_URL=/
ENV VITE_BASE_URL=${VITE_BASE_URL}

# Télécharger la branche ou le tag souhaité du projet Liberchat
RUN apk add --no-cache wget tar \
  && wget -O liberchat.tar.gz https://github.com/Liberchat/Liberchat/archive/refs/heads/${BRANCH}.tar.gz || wget -O liberchat.tar.gz https://github.com/Liberchat/Liberchat/archive/refs/tags/${BRANCH}.tar.gz \
  && tar -xzf liberchat.tar.gz --strip-components=1 \
  && rm liberchat.tar.gz \
  && echo "if ('serviceWorker' in navigator) {\n  window.addEventListener('load', function() {\n    navigator.serviceWorker.register('/service-worker.js');\n  });\n}" | sed 's/\\n/\n/g' > /app/register-sw.js

RUN npm install && VITE_BASE_URL=$VITE_BASE_URL npm run build

FROM node:20-alpine as prod
WORKDIR /app
COPY --from=build /app .
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server.js"]

RUN mkdir -p /app/letsencrypt \
    && touch /app/letsencrypt/acme.json \
    && chmod 600 /app/letsencrypt/acme.json \
    && echo "self.addEventListener('install', event => {\n  self.skipWaiting();\n});\nself.addEventListener('activate', event => {\n  event.waitUntil(self.clients.claim());\n});\nself.addEventListener('fetch', event => {\n  // Par défaut, laisse passer toutes les requêtes\n});" > /app/service-worker.js
