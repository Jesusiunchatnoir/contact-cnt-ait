# Bot Discord Anti-Droitard 🤖

Un bot Discord puissant conçu pour protéger et gérer votre serveur avec des fonctionnalités avancées de modération et de sécurité.

## ✨ Fonctionnalités

- **Commande Anti-Raid** : Protection avancée contre les raids
- **Système de Vérification** : Filtrage des utilisateurs suspects
- **Logs Détaillés** : Suivi complet des actions de modération
- **Gestion des Rôles** : Configuration automatique des permissions

## 📋 Prérequis

- Node.js 16.x ou supérieur
- npm (généralement installé avec Node.js)
- Un compte Discord avec les permissions pour créer des bots
- Un serveur Discord avec les permissions administrateur

## 🚀 Installation

1. **Clonez le dépôt :**
```bash
git clone https://github.com/AnARCHIS12/antidroitard-.git
cd antidroitard-
```

2. **Installez les dépendances :**
```bash
npm install
```

3. **Configurez le bot :**
- Créez un fichier `.env` à partir du modèle :
  ```bash
  cp .env.example .env
  ```
- Ajoutez votre token Discord dans le fichier `.env` :
  ```
  DISCORD_TOKEN=votre_token_ici
  ```

## 💻 Utilisation

1. **Démarrez le bot :**
```bash
npm start
```

2. **Commandes principales :**
- `/antiraid` : Protection contre les raids (réservé aux administrateurs)
- `/verify` : Système de vérification des utilisateurs
- `/config` : Configuration des paramètres du bot

## 🛡️ Sécurité

⚠️ **ATTENTION :**
- Les commandes administrateur sont restreintes aux rôles autorisés
- La commande `/antiraid` nécessite une double confirmation
- Un délai de sécurité de 5 secondes est appliqué avant les actions critiques

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :
1. Forkez le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 💪 Support

Pour obtenir de l'aide ou signaler un bug :
- Ouvrez une issue sur GitHub
- Rejoignez notre [serveur Discord de support](lien_du_serveur)
