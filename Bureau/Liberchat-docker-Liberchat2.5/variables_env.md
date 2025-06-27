# Documentation des variables d’environnement Liberchat

## ALLOWED_DOMAINS
- **Description** : Liste des domaines autorisés pour les requêtes CORS, WebSocket, CSP, etc.
- **Format** : Chaîne de domaines séparés par des virgules
- **Exemple** :
  ```env
  ALLOWED_DOMAINS=https://monsite.fr,http://krzndhtu4puxi3h57s4dqgrzyf3ox5fd6ujcpt64qqyzzam7suzjngad.onion,http://localhost:5173
  ```
- **Remarque** :
  - Prend en charge les domaines classiques, .onion, IP locales, etc.
  - Toute modification nécessite un redémarrage du backend.

## PORT
- **Description** : Port d’écoute du serveur Express/Socket.IO.
- **Format** : Nombre (ex : 3000)
- **Exemple** :
  ```env
  PORT=3000
  ```
- **Remarque** :
  - Défaut : 3000

## NODE_ENV
- **Description** : Mode d’exécution (`development` ou `production`).
- **Format** : `development` ou `production`
- **Exemple** :
  ```env
  NODE_ENV=production
  ```
- **Remarque** :
  - Peut activer des optimisations ou logs spécifiques.

## VITE_SOCKET_TARGET
- **Description** : Cible du proxy WebSocket/HTTP pour le frontend Vite (utile pour le multi-domaine).
- **Format** : URL complète (ex : http://localhost:3000 ou http://monservice.onion)
- **Exemple** :
  ```env
  VITE_SOCKET_TARGET=http://krzndhtu4puxi3h57s4dqgrzyf3ox5fd6ujcpt64qqyzzam7suzjngad.onion
  ```
- **Remarque** :
  - Utilisée dans `vite.config.ts` pour router `/socket.io` vers le bon backend selon l’environnement.
  - Change selon le domaine cible (dev, prod, .onion, etc.).

---

**Pour ajouter un domaine, modifiez simplement la variable `ALLOWED_DOMAINS` dans le fichier `.env` à la racine du projet.**

**Exemple de `.env` complet :**
```env
ALLOWED_DOMAINS=https://monsite.fr,http://krzndhtu4puxi3h57s4dqgrzyf3ox5fd6ujcpt64qqyzzam7suzjngad.onion,http://localhost:5173
PORT=3000
NODE_ENV=production
VITE_SOCKET_TARGET=http://krzndhtu4puxi3h57s4dqgrzyf3ox5fd6ujcpt64qqyzzam7suzjngad.onion
```
