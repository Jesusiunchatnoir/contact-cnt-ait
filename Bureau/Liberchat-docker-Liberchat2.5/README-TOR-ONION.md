# 🧅 Liberchat .onion — Passage du local au réseau Tor

## 🎯 Introduction

Tu as Liberchat qui tourne en local sur ton IP (`127.0.0.1:3000` ou `192.168.x.x:3000`), mais tu veux le rendre accessible anonymement et de façon sécurisée via le réseau décentralisé Tor. Ce guide te montre comment créer un service caché Tor pour ton Liberchat avec Docker.

---

## ⚙️ Prérequis

- Liberchat installé et fonctionnel en local (ex. via Docker sur le port 3000)
- Tor installé sur ta machine (service tor)
- Accès root ou sudo

---

## 📝 Étapes

### 1️⃣ Installer Tor

Sur Debian/Ubuntu :

```bash
sudo apt update
sudo apt install tor
```

---

### 2️⃣ Configurer Tor pour exposer Liberchat en .onion

Édite le fichier `/etc/tor/torrc` et ajoute ces lignes à la fin :

```conf
HiddenServiceDir /var/lib/tor/liberchat_hidden_service/
HiddenServicePort 80 127.0.0.1:3000
```
- `HiddenServiceDir` : dossier où Tor génèrera ton adresse .onion
- `HiddenServicePort` : redirige le port 80 de Tor vers ton Liberchat local

---

### 3️⃣ Redémarrer Tor

```bash
sudo systemctl restart tor
```

---

### 4️⃣ Trouver ton adresse .onion

Une fois Tor lancé, récupère l’adresse cachée :

```bash
sudo cat /var/lib/tor/liberchat_hidden_service/hostname
```
Cette chaîne de caractères `.onion` est ton accès sécurisé et anonyme à Liberchat.

---

### 5️⃣ Utiliser Tor Browser

- Télécharge et installe Tor Browser : https://www.torproject.org/
- Ouvre Tor Browser et accède à ton Liberchat via l’URL .onion récupérée.

---

## 🔒 Conseils et sécurité

- Garde bien privé ton dossier `liberchat_hidden_service/` — il contient les clés privées.
- L’adresse .onion est accessible uniquement via Tor, pas via le réseau normal.
- Ce système protège ta liberté et ta vie privée contre toute surveillance.

---

> 🦾 Libère ta communication, protège ton anonymat. Utilise Tor, brise les chaînes de la surveillance.
