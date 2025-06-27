<!-- Logo Liberchat -->
<p align="center">
  <img src="https://github.com/Liberchat/Liberchat/blob/Liberchat6.1.16/icon.png?raw=true" alt="Liberchat Logo" width="120" />
</p>

<p align="center">
  <a href="https://hub.docker.com/r/liberchat/liberchat"><img src="https://img.shields.io/docker/pulls/liberchat/liberchat?style=for-the-badge&color=2496ED&logo=docker" alt="Docker Pulls" /></a>
  <a href="https://hub.docker.com/r/liberchat/liberchat"><img src="https://img.shields.io/docker/image-size/liberchat/liberchat/latest?style=for-the-badge&color=2496ED&logo=docker" alt="Docker Image Size" /></a>
  <img src="https://img.shields.io/badge/Platform-Linux%20%7C%20x86--64-informational?style=for-the-badge&logo=linux" alt="Platform" />
  <a href="https://github.com/Liberchat/Liberchat/blob/Liberchat6.1.16/LICENSE"><img src="https://img.shields.io/github/license/Liberchat/Liberchat?color=success&style=for-the-badge" alt="License" /></a>
</p>

---

# Déploiement Liberchat autonome avec Docker

Ce dossier permet de déployer Liberchat sans avoir besoin du code source local : tout est téléchargé automatiquement depuis GitHub lors du build.

## Utilisation rapide (build distant depuis GitHub)

1. Placez-vous dans le dossier `docker` du projet.
2. Lancez le script interactif :
   ```bash
   bash configurer.sh
   ```
   - Le script vous demandera le mode (développement ou production) et la branche/tag à utiliser.
   - Le Dockerfile `docker/liberchat/Dockerfile` télécharge le code, installe les dépendances et build l’application.
   - Nginx reverse proxy gère le HTTPS (auto-signé en dev, Let's Encrypt en prod).

3. Accédez à l’application :
   - En local : https://localhost
   - Depuis le réseau : https://<IP_de_votre_machine>
   - Acceptez le certificat auto-signé si le navigateur affiche un avertissement.

4. Limitations en HTTPS auto-signé :
   - Les Service Workers (PWA, notifications, etc.) ne fonctionnent qu’en HTTPS avec un certificat valide ou sur `localhost`.
   - Sur une IP locale, il faut un vrai certificat pour lever toutes les restrictions navigateur.

---

## Structure des Dockerfiles

- `docker/liberchat/Dockerfile` : build distant (télécharge le code depuis GitHub, usage prod/CI)
- `docker/nginx/Dockerfile` : Nginx reverse proxy avec HTTPS (auto-signé ou Let's Encrypt)

---

## Conseils

- Pour la production, configurez un vrai domaine et ouvrez les ports 80/443.
- Pour le développement, privilégiez `localhost` pour tester les fonctionnalités avancées (PWA, etc.).

---

Pour toute question ou contribution, ouvrez une issue ou consultez la documentation principale du projet.

---

# (Ancienne documentation ci-dessous)

## Utilisation ultra-simple (débutant)

1. Clonez ce dépôt Docker officiel (recommandé) :
   ```bash
   git clone https://github.com/Liberchat/Liberchat-docker.git
   cd Liberchat-docker
   ```
2. Rendez le script exécutable :
   ```bash
   chmod +x configurer.sh
   ```
3. Lancez le script interactif :
   ```bash
   ./configurer.sh
   ```
4. Répondez simplement aux questions (mode développement ou non, version, domaine si besoin)
5. Le script lance la bonne commande Docker pour vous !
6. À la fin, l'adresse d'accès locale et réseau vous sera affichée (ex : https://localhost:3000 ou https://192.168.x.x:3000)
   - En production, vous pouvez autoriser l'accès réseau local en ajoutant l'IP proposée dans les domaines autorisés.
   - Si besoin, ouvrez le port 3000 dans votre pare-feu (ex : sudo ufw allow 3000/tcp)

## Utilisation rapide (manuel)

```bash
# Mode autonome (production, code téléchargé depuis GitHub)
ALLOWED_DOMAINS="https://votre-domaine.com" docker-compose up --build -d
```

```bash
# Mode développement local (hot reload, code source local monté en volume)
# Décommentez la section volumes: dans docker-compose.yml
NODE_ENV=development ALLOWED_DOMAINS="https://localhost:3000,https://<IP locale>:3000" docker-compose up --build
```

- Par défaut, la variable BRANCH vaut `Liberchat6.1.16` (ou la branche/tag que vous définissez dans le Dockerfile). Si vous changez la branche par défaut dans le projet, pensez à préciser la bonne valeur lors du build.
- Pour builder une branche ou un tag spécifique, ajoutez la variable `BRANCH` (ex : `BRANCH=dev docker-compose up --build -d`).
- Le conteneur télécharge et construit la version choisie de Liberchat.
- Le port 3000 est exposé (modifiez-le si besoin dans le compose).
- La variable `ALLOWED_DOMAINS` permet de définir les domaines autorisés pour les images, WebSocket, etc. (⚠️ Utilisez uniquement des URLs en https://)

## Arrêt du service

```bash
docker-compose down
```

## Mise à jour

- Relancez simplement la commande `docker-compose up --build -d` pour récupérer la dernière version de la branche/tag choisi.

## Personnalisation
- Modifiez le port, le nom du conteneur ou les variables d’environnement dans `docker-compose.yml`.
- Pour plusieurs instances : dupliquez le service ou adaptez les ports.

---

## Accès sécurisé HTTPS (local & production)

### 1. HTTPS local automatique (auto-signé)
- Par défaut, le service Nginx inclus dans le compose génère un certificat auto-signé à chaque lancement.
- Accédez à https://localhost ou https://<IP locale> (acceptez le certificat dans votre navigateur).
- Idéal pour tester sur mobile/tablette en réseau local.

### 2. HTTPS production automatique (Let’s Encrypt)
- Un service Traefik est inclus pour obtenir un vrai certificat SSL Let’s Encrypt automatiquement.
- Prérequis : avoir un vrai nom de domaine pointant sur votre serveur (A/AAAA record).
- Modifiez dans `docker-compose.yml` :
  - Remplacez `ton-domaine.com` par votre domaine réel.
  - Remplacez `ton.email@domaine.com` par votre email.
- Ouvrez les ports 80 et 443 sur votre serveur.
- Le certificat sera généré et renouvelé automatiquement.
- Accédez à https://votre-domaine.com (aucun avertissement navigateur).

### 3. Les deux modes peuvent coexister
- Le HTTPS local (auto-signé) reste accessible pour le réseau local.
- Le HTTPS Let’s Encrypt (Traefik) prend le relais dès que le domaine est configuré.

---

## Exemples de commandes

```bash
# Lancer en local avec HTTPS auto-signé (Nginx)
docker-compose up --build

# Lancer en production avec Let’s Encrypt (Traefik)
# (après avoir configuré le domaine et l’email dans le compose)
docker-compose up --build
```

---

## Exemple de configuration manuelle du conteneur

Vous pouvez lancer le conteneur Docker sans le script interactif, en passant directement les variables d'environnement nécessaires :

```bash
# Exemple : lancer Liberchat en production avec un domaine personnalisé
export ALLOWED_DOMAINS="https://votre-domaine.com,https://autre-domaine.com"
export BRANCH="Liberchat6.1.16" # (optionnel, pour choisir une branche/tag spécifique)
docker-compose up --build -d
```

```bash
# Exemple : lancer en développement local (hot reload, code local monté)
export NODE_ENV=development
export ALLOWED_DOMAINS="https://localhost:3000,https://192.168.1.42:3000"
docker-compose up --build
```

- Vous pouvez aussi passer les variables en ligne de commande, sans export :
  ```bash
  ALLOWED_DOMAINS="https://votre-domaine.com" docker-compose up --build -d
  ```
- Pour la production avec HTTPS Let’s Encrypt (Traefik), ajoutez aussi :
  ```bash
  export TRAEFIK_EMAIL="votre.email@domaine.com"
  docker-compose up --build -d
  ```

Adaptez les variables selon vos besoins (voir la section Personnalisation ci-dessus).

Pour toute question ou adaptation, ouvrez une issue sur le dépôt officiel : https://github.com/Liberchat/Liberchat

## Lancement automatique (méthode recommandée)

Vous pouvez utiliser directement l'image officielle sans aucun script ni code local :

```bash
docker run -d \
  -p 3000:3000 \
  -e ALLOWED_DOMAINS="https://votre-domaine.com" \
  liberchat/liberchat:6.1.16
```

- Accès local : https://localhost:3000
- Accès réseau local (LAN) : https://IP_DE_VOTRE_MACHINE:3000 (en production, autorisez l'IP dans ALLOWED_DOMAINS)
- Accès production : https://votre-domaine.com (configuré dans ALLOWED_DOMAINS)
- Ouvrez le port 3000 sur votre pare-feu si besoin.

Pour la configuration avancée (multi-domaines, branche spécifique, etc.), ajoutez d'autres variables d'environnement :

```bash
docker run -d \
  -p 3000:3000 \
  -e ALLOWED_DOMAINS="https://votre-domaine.com,https://autre-domaine.com" \
  -e BRANCH="Liberchat6.1.16" \
  liberchat/liberchat:6.1.16
```

Pour le développement local (hot reload), voir la section "Utilisation rapide (manuel)" ci-dessus.

Pour plus d'exemples, consultez le dépôt officiel : https://github.com/Liberchat/Liberchat-docker
 
Section des erreurs recontrées 
- [HTTPS ERROR SSL doc voir ](https://github.com/Liberchat/Liberchat-docker/blob/Liberchat2.5/README-HTTPS-NGINX.md)

---

## Variables d’environnement Liberchat

Voir aussi le fichier `variables_env.md` pour la documentation complète.

### Principales variables disponibles

- **ALLOWED_DOMAINS** : Liste des domaines autorisés pour CORS, WebSocket, CSP, etc. (séparés par des virgules)
- **PORT** : Port d’écoute du serveur Express/Socket.IO (défaut : 3000)
- **NODE_ENV** : Mode d’exécution (`development` ou `production`)
- **VITE_SOCKET_TARGET** : Cible du proxy WebSocket/HTTP pour le frontend Vite

**Exemple de fichier `.env` :**
```env
ALLOWED_DOMAINS=https://monsite.fr,http://krzndhtu4puxi3h57s4dqgrzyf3ox5fd6ujcpt64qqyzzam7suzjngad.onion,http://localhost:5173
PORT=3000
NODE_ENV=production
VITE_SOCKET_TARGET=http://krzndhtu4puxi3h57s4dqgrzyf3ox5fd6ujcpt64qqyzzam7suzjngad.onion
```

Pour plus de détails, consultez `variables_env.md`.
