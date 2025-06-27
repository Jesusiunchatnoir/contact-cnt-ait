#!/bin/bash
# Toujours exécuter le script depuis son propre dossier (docker/)
cd "$(dirname "$0")"
# Script interactif pour configurer, builder et lancer Liberchat avec Docker

# Banner stylisée moderne
clear
echo -e "\e[1;31m╔══════════════════════════════════════════════════════╗\e[0m"
echo -e "\e[1;31m║\e[0m        \e[1;37mConfiguration Liberchat Docker\e[0m         \e[1;31m║\e[0m"
echo -e "\e[1;31m╚══════════════════════════════════════════════════════╝\e[0m"
echo
# Message anarco-syndicaliste stylisé
sleep 0.3
echo -e "\e[1;33mⒶ Bienvenue camarade, ce déploiement Docker est autogéré et libre !\e[0m"
sleep 0.3
echo -e "\e[1;36mⒶ Chaque utilisateur est libre de son instance, vive l'autonomie numérique !\e[0m"
sleep 0.3
echo

# Mode de déploiement
CONFIG_FILE=".env.liberchat"

# Chargement config existante si présente (prod uniquement)
if [ -f "$CONFIG_FILE" ]; then
  source "$CONFIG_FILE"
  CONFIG_EXIST=1
else
  CONFIG_EXIST=0
fi

while true; do
    read -p "Voulez-vous le mode développement local (hot reload) ? [o/N] : " dev
    case $dev in
        [oO]* ) MODE_DEV=1; break;;
        [nN]* | "" ) MODE_DEV=0; break;;
        * ) echo "Répondez par o (oui) ou n (non).";;
    esac
done

# Domaine autorisé
if [ $MODE_DEV -eq 1 ]; then
  IP=$(hostname -I | awk '{print $1}')
  ALLOWED_DOMAINS="http://localhost:3000,http://$IP:3000"
  echo "Le domaine autorisé par défaut pour le développement local est : $ALLOWED_DOMAINS"
  # Ajout accès réseau local seulement en dev
  read -p "Voulez-vous aussi autoriser l'accès réseau local (http://$IP:3000) ? [o/N] : " addlocal
  if [[ $addlocal =~ ^[oO]$ ]]; then
    ALLOWED_DOMAINS="$ALLOWED_DOMAINS,http://$IP:3000"
    echo "Ajout de http://$IP:3000 aux domaines autorisés."
  fi
else
  IP=$(hostname -I | awk '{print $1}')
  if [ $CONFIG_EXIST -eq 1 ]; then
    echo "Configuration précédente détectée :"
    echo "  Domaine(s) autorisé(s) : $ALLOWED_DOMAINS"
    echo "  Branche/tag : ${BRANCH:-<défaut>}"
    read -p "Voulez-vous réutiliser cette configuration ? [O/n] : " reuse
    if [[ $reuse =~ ^[nN]$ ]]; then
      read -p "Entrez le(s) domaine(s) autorisé(s) (ex: https://votre-domaine.com) : " ALLOWED_DOMAINS
      read -p "Voulez-vous une branche ou un tag spécifique ? (laisser vide pour la version par défaut) : " BRANCH
    fi
  else
    read -p "Entrez le(s) domaine(s) autorisé(s) (ex: https://votre-domaine.com) : " ALLOWED_DOMAINS
    read -p "Voulez-vous une branche ou un tag spécifique ? (laisser vide pour la version par défaut) : " BRANCH
  fi
  # On interdit d'ajouter une IP locale en prod
  if [[ $ALLOWED_DOMAINS =~ $IP ]]; then
    echo -e "\e[1;31m❌ En production, il est interdit d'ajouter une IP locale dans ALLOWED_DOMAINS. Utilisez uniquement un vrai domaine public.\e[0m"
    exit 1
  fi
  # Avertissement si l'utilisateur met https sur une IP locale
  if [[ $ALLOWED_DOMAINS =~ https://$IP ]]; then
    echo -e "\e[1;33m⚠️  Attention : L'accès direct en HTTPS sur une IP locale n'est pas supporté par défaut. Utilisez http://$IP:3000 ou mettez un reverse proxy HTTPS devant.\e[0m"
  fi
  # Sauvegarde config prod
  echo "ALLOWED_DOMAINS=\"$ALLOWED_DOMAINS\"" > "$CONFIG_FILE"
  echo "BRANCH=\"$BRANCH\"" >> "$CONFIG_FILE"
fi

# Choix de la branche/tag
read -p "Voulez-vous une branche ou un tag spécifique ? (laisser vide pour la version par défaut) : " BRANCH

# Build de l'image
echo -e "\nConstruction de l'image Docker..."
BUILD_CMD="ALLOWED_DOMAINS=\"$ALLOWED_DOMAINS\""
if [ ! -z "$BRANCH" ]; then
  BUILD_CMD="$BUILD_CMD BRANCH=$BRANCH"
fi
if [ $MODE_DEV -eq 1 ]; then
  BUILD_CMD="$BUILD_CMD NODE_ENV=development docker-compose build"
else
  BUILD_CMD="$BUILD_CMD docker-compose build"
fi

eval $BUILD_CMD

# Lancement du conteneur
echo -e "\nLancement de l'application..."
RUN_CMD="ALLOWED_DOMAINS=\"$ALLOWED_DOMAINS\""
if [ ! -z "$BRANCH" ]; then
  RUN_CMD="$RUN_CMD BRANCH=$BRANCH"
fi
if [ $MODE_DEV -eq 1 ]; then
  RUN_CMD="$RUN_CMD NODE_ENV=development docker-compose up"
else
  RUN_CMD="$RUN_CMD docker-compose up -d"
fi

eval $RUN_CMD

# Affichage de l'adresse d'accès
if [ $MODE_DEV -eq 1 ]; then
  IP=$(hostname -I | awk '{print $1}')
  echo -e "\nLiberchat est lancé en mode développement !"
  echo -e "Utilisez \e[1;32mhttp://localhost:3000\e[0m ou \e[1;32mhttp://$IP:3000\e[0m depuis un autre appareil du réseau local."
  echo -e "\e[1;33m⚠️  N'utilisez pas https:// en local, sauf si vous avez configuré un reverse proxy HTTPS.\e[0m"
  echo "\n⚠️  Si vous n'arrivez pas à accéder depuis un autre appareil, vérifiez que le port 3000 est ouvert dans le pare-feu de votre machine."
  echo "  Exemple pour ouvrir le port sur Linux (ufw) : sudo ufw allow 3000/tcp"
else
  IP=$(hostname -I | awk '{print $1}')
  echo -e "\nLiberchat est lancé en mode production !"
  echo "Accédez à l'application sur : $ALLOWED_DOMAINS"
  # Afficher l'accès local uniquement si l'IP locale est autorisée
  if [[ $ALLOWED_DOMAINS =~ $IP ]]; then
    echo "Ou, depuis le réseau local : http://$IP:3000 (si autorisé dans ALLOWED_DOMAINS)"
  fi
  echo -e "\e[1;33m⚠️  N'utilisez pas https:// sur l'IP locale sans reverse proxy HTTPS.\e[0m"
  echo "\n⚠️  Si vous n'arrivez pas à accéder depuis un autre appareil, vérifiez que le port 3000 est ouvert dans le pare-feu de votre machine."
  echo "  Exemple pour ouvrir le port sur Linux (ufw) : sudo ufw allow 3000/tcp"
fi
if [ $MODE_DEV -eq 1 ]; then
  echo "(Mode développement : logs affichés, arrêt avec Ctrl+C)"
else
  echo "(Mode production : conteneur en arrière-plan, arrêtez avec 'docker-compose down')"
fi
