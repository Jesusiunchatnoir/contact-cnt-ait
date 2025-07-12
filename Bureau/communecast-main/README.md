# CommuneCast 🏴

**Vidéoconférence libre, chiffrée et décentralisée**

> *"La liberté de communication est un droit fondamental"*

CommuneCast est une application de vidéoconférence entièrement libre et chiffrée, conçue pour protéger votre vie privée et permettre une communication horizontale sans surveillance.

## 🔥 Caractéristiques Révolutionnaires

- **🔒 Chiffrement de bout en bout (E2EE)** - Vos conversations restent privées
- **🏴 Zéro stockage** - Aucune donnée n'est enregistrée, tout est éphémère
- **⚡ P2P WebRTC** - Communication directe entre pairs
- **📱 Responsive** - Fonctionne sur mobile, tablette et desktop
- **🌐 Auto-hébergeable** - Gardez le contrôle de votre infrastructure
- **💬 Chat chiffré intégré** - Messages sécurisés en temps réel
- **🎥 Partage d'écran** - Collaboration sans limites
- **🚫 Anti-surveillance** - Pas de tracking, pas de Google, pas de BigTech

## 🛠️ Installation Manuelle

### Prérequis
- Node.js 16+ ([télécharger](https://nodejs.org/))
- npm (inclus avec Node.js)

### Installation rapide

```bash
# Cloner le dépôt
git clone https://github.com/votre-repo/communecast.git
cd communecast

# Rendre le script exécutable
chmod +x start.sh

# Lancer l'application
./start.sh
```

### Installation pas à pas

```bash
# 1. Installer les dépendances
npm install

# 2. Construire l'application
npm run build

# 3. Démarrer le serveur
npm start
```

L'application sera disponible sur `http://localhost:3000`

## 🐳 Installation Docker

### Docker Compose (Recommandé)

```bash
# Déploiement simple
docker-compose up -d

# Avec proxy Nginx
docker-compose --profile with-proxy up -d

# Avec domaine personnalisé
DOMAIN=votre-domaine.com PORT=3000 docker-compose up -d
```

### Docker simple

```bash
# Construire l'image
docker build -t communecast .

# Lancer le conteneur
docker run -d -p 3000:3000 --name communecast communecast
```

## 🌐 Configuration Domaine & Reverse Proxy

### Nginx

Créez `/etc/nginx/sites-available/communecast`:

```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    
    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com;
    
    # SSL Configuration (Let's Encrypt recommandé)
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    # Proxy vers CommuneCast
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket support pour Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activez la configuration:
```bash
sudo ln -s /etc/nginx/sites-available/communecast /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Caddy (Plus simple)

Créez un `Caddyfile`:

```caddy
votre-domaine.com {
    reverse_proxy localhost:3000
}
```

Lancez Caddy:
```bash
caddy run
```

### SSL avec Let's Encrypt

```bash
# Avec Certbot
sudo certbot --nginx -d votre-domaine.com

# Avec Caddy (automatique)
# Caddy gère automatiquement les certificats SSL
```

## ⚙️ Variables d'Environnement

```bash
# Port d'écoute (défaut: 3000)
export PORT=3000

# Domaine pour les liens partageables (défaut: localhost)
export DOMAIN=votre-domaine.com

# Mode de production
export NODE_ENV=production
```

## 🏴 Usage

1. **Accédez à votre instance**: `https://votre-domaine.com`
2. **Choisissez un pseudo** (stocké localement uniquement)
3. **Créez une salle** ou **rejoignez avec un ID**
4. **Partagez le lien** avec vos camarades
5. **Communiquez librement** avec chiffrement E2EE

### Fonctionnalités

- **Caméra ON/OFF** - Contrôle de votre vidéo
- **Micro ON/OFF** - Contrôle de votre audio  
- **Partage d'écran** - Partagez votre écran ou fenêtre
- **Chat chiffré** - Messages sécurisés avec indicateur 🔒
- **Copier le lien** - Partagez facilement l'accès à la salle

## 🔒 Sécurité & Vie Privée

### Chiffrement
- **WebRTC P2P** avec chiffrement DTLS/SRTP natif
- **Messages** chiffrés avec AES-256
- **Clés éphémères** générées côté client
- **Pas d'homme du milieu** - le serveur ne voit que le signaling

### Données
- **Zéro stockage** - Aucune conversation ni métadonnée sauvegardée
- **Pseudos locaux** - Stockés uniquement dans votre navigateur
- **Salles éphémères** - Disparaissent quand le dernier utilisateur part
- **Pas de tracking** - Aucun cookie de suivi ou analytics

### Infrastructure
- **Auto-hébergeable** - Gardez le contrôle total
- **Code ouvert** - Auditez et modifiez le code
- **Pas de dépendances propriétaires** - Technologies libres uniquement

## 🛠️ Développement

### Mode développement

```bash
# Serveur de développement (client + serveur)
npm run dev

# Ou séparément:
npm run dev:client  # Next.js sur :3000
npm run dev:server  # Socket.IO sur :3001
```

### Structure du projet

```
communecast/
├── app/                 # Pages Next.js (App Router)
│   ├── page.tsx        # Page d'accueil
│   ├── room/[id]/      # Pages de salles dynamiques
│   └── layout.tsx      # Layout global
├── components/         # Composants React
│   ├── VideoRoom.tsx   # Composant principal de vidéoconférence
│   └── Logo.tsx        # Logo CommuneCast
├── lib/               # Utilitaires
│   ├── crypto.ts      # Fonctions de chiffrement
│   └── utils.ts       # Utilitaires généraux
├── server/            # Serveur Backend
│   └── index.js       # Serveur Express + Socket.IO
├── public/            # Assets statiques
├── Dockerfile         # Configuration Docker
├── docker-compose.yml # Orchestration Docker
└── start.sh          # Script de démarrage
```

## 🌟 Extensions Futures (Optionnelles)

- **Tableau blanc collaboratif** - Dessinez ensemble
- **Vote anonyme** - Prise de décision collective
- **Salles temporaires avec mot de passe** - Sécurité renforcée
- **Intégration Tor** - Adresses .onion pour l'anonymat
- **Enregistrement local** - Sauvegarde optionnelle côté client
- **Modération décentralisée** - Outils d'auto-gouvernance

## 🤝 Contribution

CommuneCast est un projet communautaire. Contributions bienvenues!

1. **Fork** le projet
2. **Créez une branche** pour votre fonctionnalité
3. **Committez** vos changements
4. **Poussez** vers la branche
5. **Ouvrez une Pull Request**

### Principes de contribution
- Code lisible et documenté
- Respect des libertés fondamentales
- Pas de backdoors ou fonctionnalités de surveillance
- Tests pour les nouvelles fonctionnalités

## 📜 Licence

Ce projet est sous licence libre (MIT). Vous êtes libres de:
- Utiliser le code à des fins personnelles et commerciales
- Modifier et distribuer le code
- Contribuer aux améliorations

## 🏴 Philosophie

CommuneCast incarne les valeurs d'égalité, de liberté et de fraternité dans le monde numérique:

- **Égalité** - Tous les utilisateurs ont les mêmes droits
- **Liberté** - Code ouvert, auto-hébergeable, sans surveillance
- **Fraternité** - Communication horizontale et collaborative

*"La technologie doit servir le peuple, pas le contraire"*

## 🆘 Support & Communauté

- **Issues GitHub** - Rapportez les bugs et demandes de fonctionnalités
- **Discussions** - Échangez avec la communauté
- **Wiki** - Documentation collaborative
- **Matrix/IRC** - Chat en temps réel avec les développeurs

---

**Vive la communication libre!** 🏴🔥

*CommuneCast - Pour le peuple, par le peuple*