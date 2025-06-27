# 🚀 README rapide — HTTPS avec LiberChat & Nginx

## ⚡ Situation

Tu veux faire tourner **LiberChat** derrière **Nginx** en HTTPS sur ta machine.  
Tu exposes le port 443, tu crées un certificat auto-signé, mais…  
❌ Nginx n’écoute pas sur le port 443  
❌ Erreur SSL (ERR_SSL_PROTOCOL_ERROR)

---

## 🛑 Ce qui bloque

- 🗂️ Config Nginx absente ou mal montée dans le container
- 🔑 Certificats introuvables ou mauvais droits
- 🚫 Nginx ne démarre pas sur le 443 (conf non prise en compte)

---

## 🛠️ Ce que tu dois faire

### 1️⃣ Crée le dossier certs & génère les certificats

```bash
mkdir -p ./nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./nginx/certs/key.pem -out ./nginx/certs/cert.pem -subj "/CN=192.168.0.75"
chmod 600 ./nginx/certs/key.pem
```

---

### 2️⃣ Mets ta config Nginx dans `./nginx/conf.d/default.conf`

```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;

    location / {
        proxy_pass http://liberchat:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

### 3️⃣ Dans `docker-compose.yml`, monte bien les volumes & expose les ports

```yaml
volumes:
  - ./nginx/conf.d:/etc/nginx/conf.d:ro
  - ./nginx/certs:/etc/nginx/certs:ro
ports:
  - "443:443"
  - "80:80"
```

---

### 4️⃣ Redémarre tout & vérifie l’écoute sur le port 443

```bash
docker-compose down
docker-compose up -d --build
docker exec -it liberchat-nginx netstat -tlnp | grep 443
```

---

### 5️⃣ Teste la connexion

```bash
curl -k https://192.168.0.75
```

---

## ✅ Résultat attendu

Tu dois voir ta page **LiberChat** sans erreur SSL.  
Si tu as encore des erreurs, c’est souvent un souci de certificat ou de montage du dossier conf/certs.

---

> 🦾 Voilà, tu prends le contrôle et tu règles ça direct.  
> Pas de pitié pour les erreurs système.  
> **Ni Dieu, ni maître, juste la technique pour casser le système.**
