# Deployment-Dokumentation für das Bürgerbeteiligungssystem

Diese Dokumentation beschreibt den Prozess zur Installation, Konfiguration und Wartung des Bürgerbeteiligungssystems in einer Produktionsumgebung.

## Inhaltsverzeichnis

1. [Systemanforderungen](#1-systemanforderungen)
2. [Installationsanleitung](#2-installationsanleitung)
3. [Konfiguration](#3-konfiguration)
4. [Deployment](#4-deployment)
5. [Sicherheitsrichtlinien](#5-sicherheitsrichtlinien)
6. [Backup und Wiederherstellung](#6-backup-und-wiederherstellung)
7. [Monitoring und Wartung](#7-monitoring-und-wartung)
8. [Skalierung](#8-skalierung)
9. [Fehlerbehebung](#9-fehlerbehebung)
10. [Kontakt und Support](#10-kontakt-und-support)

## 1. Systemanforderungen

### 1.1 Hardware-Anforderungen

#### Minimale Anforderungen
- **CPU**: 4 Kerne
- **RAM**: 8 GB
- **Festplattenspeicher**: 50 GB SSD
- **Netzwerk**: 100 Mbit/s

#### Empfohlene Anforderungen
- **CPU**: 8+ Kerne
- **RAM**: 16+ GB
- **Festplattenspeicher**: 100+ GB SSD
- **Netzwerk**: 1 Gbit/s

### 1.2 Software-Anforderungen

- **Betriebssystem**: Ubuntu 20.04 LTS oder höher
- **Webserver**: Nginx 1.18 oder höher
- **Datenbank**: PostgreSQL 14 oder höher
- **Redis**: 6.0 oder höher (für Caching und Session-Management)
- **Node.js**: 18.x oder höher
- **Python**: 3.10 oder höher
- **Docker**: 20.10 oder höher (optional, für containerisiertes Deployment)
- **Kubernetes**: 1.24 oder höher (optional, für orchestriertes Deployment)

### 1.3 Netzwerkanforderungen

- **Eingehende Ports**: 80 (HTTP), 443 (HTTPS)
- **Ausgehende Ports**: 80, 443 (für externe API-Aufrufe)
- **Datenbank-Port**: 5432 (PostgreSQL)
- **Redis-Port**: 6379

## 2. Installationsanleitung

### 2.1 Vorbereitung des Servers

```bash
# System-Pakete aktualisieren
sudo apt update
sudo apt upgrade -y

# Erforderliche Pakete installieren
sudo apt install -y build-essential curl git nginx

# Node.js installieren
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# npm aktualisieren
sudo npm install -g npm@latest

# Python und pip installieren
sudo apt install -y python3 python3-pip python3-venv

# PostgreSQL installieren
sudo apt install -y postgresql postgresql-contrib

# Redis installieren
sudo apt install -y redis-server

# Firewall konfigurieren
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2.2 Datenbank einrichten

```bash
# PostgreSQL-Dienst starten
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Als postgres-Benutzer anmelden
sudo -i -u postgres

# Datenbank und Benutzer erstellen
psql -c "CREATE DATABASE buergervorschlaege;"
psql -c "CREATE USER buergerapp WITH ENCRYPTED PASSWORD 'IhrSicheresPasswort';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE buergervorschlaege TO buergerapp;"
psql -c "ALTER USER buergerapp WITH SUPERUSER;"

# Datenbankschema importieren
psql -d buergervorschlaege -f /pfad/zum/projekt/database/schema.sql

# Zurück zum normalen Benutzer
exit
```

### 2.3 Anwendung installieren

```bash
# Projektverzeichnis erstellen
sudo mkdir -p /opt/buergervorschlaege
sudo chown $USER:$USER /opt/buergervorschlaege

# Projektcode klonen
git clone https://github.com/ihre-organisation/buergervorschlaege.git /opt/buergervorschlaege

# In das Projektverzeichnis wechseln
cd /opt/buergervorschlaege

# Backend-Abhängigkeiten installieren
cd backend
npm install --production
cd ..

# Frontend-Abhängigkeiten installieren und Build erstellen
cd frontend
npm install
npm run build
cd ..

# Python-Umgebung für KI-Komponenten einrichten
cd ai
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..
```

### 2.4 Redis konfigurieren

```bash
# Redis-Konfiguration anpassen
sudo nano /etc/redis/redis.conf

# Folgende Änderungen vornehmen:
# - supervised systemd
# - maxmemory 256mb
# - maxmemory-policy allkeys-lru

# Redis-Dienst neu starten
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

## 3. Konfiguration

### 3.1 Umgebungsvariablen

Erstellen Sie eine `.env`-Datei im Backend-Verzeichnis:

```bash
cd /opt/buergervorschlaege/backend
nano .env
```

Fügen Sie folgende Umgebungsvariablen hinzu:

```
# Server-Konfiguration
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Datenbank-Konfiguration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=buergervorschlaege
DB_USER=buergerapp
DB_PASSWORD=IhrSicheresPasswort

# Redis-Konfiguration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT-Konfiguration
JWT_SECRET=IhrSuperGeheimesJWTSecret
JWT_EXPIRATION=24h

# KI-Konfiguration
AI_MODEL_PATH=/opt/buergervorschlaege/ai/models
AI_PYTHON_PATH=/opt/buergervorschlaege/ai/venv/bin/python

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/buergervorschlaege/app.log

# E-Mail-Konfiguration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=IhrEmailPasswort
EMAIL_FROM=Bürgerbeteiligungssystem <noreply@example.com>
```

### 3.2 Nginx-Konfiguration

Erstellen Sie eine Nginx-Konfigurationsdatei:

```bash
sudo nano /etc/nginx/sites-available/buergervorschlaege
```

Fügen Sie folgende Konfiguration hinzu:

```nginx
server {
    listen 80;
    server_name buergervorschlaege.example.com;
    
    # HTTP auf HTTPS umleiten
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name buergervorschlaege.example.com;
    
    # SSL-Konfiguration
    ssl_certificate /etc/letsencrypt/live/buergervorschlaege.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/buergervorschlaege.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Sicherheitsheader
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'";
    
    # Logging
    access_log /var/log/nginx/buergervorschlaege.access.log;
    error_log /var/log/nginx/buergervorschlaege.error.log;
    
    # Frontend (statische Dateien)
    location / {
        root /opt/buergervorschlaege/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend-API
    location /api {
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
    
    # Uploads-Verzeichnis
    location /uploads {
        alias /opt/buergervorschlaege/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```

Aktivieren Sie die Konfiguration:

```bash
sudo ln -s /etc/nginx/sites-available/buergervorschlaege /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3.3 SSL-Zertifikat einrichten

```bash
# Certbot installieren
sudo apt install -y certbot python3-certbot-nginx

# SSL-Zertifikat erstellen
sudo certbot --nginx -d buergervorschlaege.example.com

# Automatische Erneuerung testen
sudo certbot renew --dry-run
```

### 3.4 Systemd-Dienst einrichten

Erstellen Sie eine Systemd-Service-Datei für den Backend-Server:

```bash
sudo nano /etc/systemd/system/buergervorschlaege.service
```

Fügen Sie folgende Konfiguration hinzu:

```ini
[Unit]
Description=Bürgerbeteiligungssystem Backend
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/buergervorschlaege/backend
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=buergervorschlaege
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Aktivieren und starten Sie den Dienst:

```bash
sudo systemctl daemon-reload
sudo systemctl enable buergervorschlaege
sudo systemctl start buergervorschlaege
```

## 4. Deployment

### 4.1 Manuelles Deployment

```bash
# In das Projektverzeichnis wechseln
cd /opt/buergervorschlaege

# Aktuellen Code abrufen
git pull

# Backend-Abhängigkeiten aktualisieren
cd backend
npm install --production
cd ..

# Frontend-Build aktualisieren
cd frontend
npm install
npm run build
cd ..

# KI-Abhängigkeiten aktualisieren
cd ai
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

# Dienst neu starten
sudo systemctl restart buergervorschlaege
```

### 4.2 Automatisiertes Deployment mit CI/CD

#### 4.2.1 GitHub Actions Workflow

Erstellen Sie eine Datei `.github/workflows/deploy.yml` im Repository:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install Frontend Dependencies
        run: |
          cd frontend
          npm ci
          
      - name: Build Frontend
        run: |
          cd frontend
          npm run build
          
      - name: Deploy to Production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/buergervorschlaege
            git pull
            cd backend
            npm ci --production
            cd ../frontend
            npm ci
            npm run build
            cd ../ai
            source venv/bin/activate
            pip install -r requirements.txt
            deactivate
            sudo systemctl restart buergervorschlaege
```

### 4.3 Docker-basiertes Deployment

#### 4.3.1 Dockerfile für Backend

Erstellen Sie eine Datei `Dockerfile` im Backend-Verzeichnis:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

#### 4.3.2 Dockerfile für KI-Komponente

Erstellen Sie eine Datei `Dockerfile` im AI-Verzeichnis:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "api.py"]
```

#### 4.3.3 Docker Compose Konfiguration

Erstellen Sie eine Datei `docker-compose.yml` im Hauptverzeichnis:

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    image: buergervorschlaege-frontend
    volumes:
      - ./frontend/build:/usr/share/nginx/html
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    restart: always
    networks:
      - app-network

  backend:
    build: ./backend
    image: buergervorschlaege-backend
    env_file: ./backend/.env
    ports:
      - "3000:3000"
    depends_on:
      - db
      - redis
      - ai
    restart: always
    networks:
      - app-network

  ai:
    build: ./ai
    image: buergervorschlaege-ai
    ports:
      - "5000:5000"
    restart: always
    networks:
      - app-network

  db:
    image: postgres:14-alpine
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    environment:
      POSTGRES_DB: buergervorschlaege
      POSTGRES_USER: buergerapp
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    restart: always
    networks:
      - app-network

  redis:
    image: redis:6-alpine
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    restart: always
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
```

#### 4.3.4 Docker Deployment ausführen

```bash
# Docker Compose installieren (falls noch nicht vorhanden)
sudo apt install -y docker-compose

# Umgebungsvariablen für Docker Compose setzen
export DB_PASSWORD=IhrSicheresPasswort

# Container starten
docker-compose up -d

# Container-Status überprüfen
docker-compose ps
```

## 5. Sicherheitsrichtlinien

### 5.1 Passwort-Richtlinien

- Mindestens 12 Zeichen
- Kombination aus Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen
- Regelmäßige Passwortänderung (alle 90 Tage)
- Keine Wiederverwendung der letzten 5 Passwörter
- Sperrung nach 5 fehlgeschlagenen Anmeldeversuchen

### 5.2 Datenschutz

- Personenbezogene Daten werden verschlüsselt gespeichert
- Datenschutz-Einwilligung wird bei der Registrierung eingeholt
- Benutzer können ihre Daten herunterladen und löschen lassen
- Automatische Löschung inaktiver Konten nach 2 Jahren

### 5.3 Sicherheitsmaßnahmen

- Regelmäßige Sicherheitsupdates für alle Systemkomponenten
- Tägliche Sicherheitsscans
- Penetrationstests vor jedem Major-Release
- Zwei-Faktor-Authentifizierung für Administratoren und Ministeriumsmitarbeiter
- IP-basierte Zugriffsbeschränkungen für das Administrationsportal

### 5.4 Audit-Logging

- Alle Systemaktivitäten werden protokolliert
- Protokolle werden für 1 Jahr aufbewahrt
- Protokolle enthalten Zeitstempel, Benutzer-ID, Aktion und IP-Adresse
- Automatische Benachrichtigung bei verdächtigen Aktivitäten

## 6. Backup und Wiederherstellung

### 6.1 Backup-Strategie

- **Tägliche Backups**: Vollständige Sicherung der Datenbank und Uploads
- **Wöchentliche Backups**: Vollständige Systemsicherung
- **Monatliche Backups**: Archivierung für langfristige Aufbewahrung
- Aufbewahrung: Tägliche Backups für 14 Tage, wöchentliche für 3 Monate, monatliche für 5 Jahre

### 6.2 Backup-Einrichtung

```bash
# Backup-Verzeichnis erstellen
sudo mkdir -p /var/backups/buergervorschlaege
sudo chown postgres:postgres /var/backups/buergervorschlaege

# Cron-Job für tägliches Datenbank-Backup einrichten
sudo -u postgres crontab -e
```

Fügen Sie folgende Zeile hinzu:

```
0 2 * * * pg_dump buergervorschlaege | gzip > /var/backups/buergervorschlaege/db_$(date +\%Y\%m\%d).sql.gz
```

Backup-Skript für Dateien erstellen:

```bash
sudo nano /usr/local/bin/backup-buergervorschlaege-files.sh
```

Fügen Sie folgendes Skript ein:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/buergervorschlaege"
DATE=$(date +%Y%m%d)
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /opt/buergervorschlaege/backend/uploads
find $BACKUP_DIR -name "files_*.tar.gz" -mtime +14 -delete
```

Machen Sie das Skript ausführbar und richten Sie einen Cron-Job ein:

```bash
sudo chmod +x /usr/local/bin/backup-buergervorschlaege-files.sh
sudo crontab -e
```

Fügen Sie folgende Zeile hinzu:

```
0 3 * * * /usr/local/bin/backup-buergervorschlaege-files.sh
```

### 6.3 Wiederherstellung

#### 6.3.1 Datenbank-Wiederherstellung

```bash
# Datenbank wiederherstellen
sudo -i -u postgres
gunzip -c /var/backups/buergervorschlaege/db_YYYYMMDD.sql.gz | psql buergervorschlaege
exit
```

#### 6.3.2 Datei-Wiederherstellung

```bash
# Dateien wiederherstellen
sudo tar -xzf /var/backups/buergervorschlaege/files_YYYYMMDD.tar.gz -C /
```

## 7. Monitoring und Wartung

### 7.1 Monitoring-Einrichtung

#### 7.1.1 Prometheus und Grafana

```bash
# Prometheus installieren
sudo apt install -y prometheus prometheus-node-exporter

# Grafana installieren
sudo apt-get install -y apt-transport-https software-properties-common
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
sudo apt update
sudo apt install -y grafana

# Dienste starten
sudo systemctl enable prometheus prometheus-node-exporter grafana-server
sudo systemctl start prometheus prometheus-node-exporter grafana-server
```

#### 7.1.2 Prometheus-Konfiguration

```bash
sudo nano /etc/prometheus/prometheus.yml
```

Fügen Sie folgende Konfiguration hinzu:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'buergervorschlaege'
    static_configs:
      - targets: ['localhost:3000']
```

Prometheus neu starten:

```bash
sudo systemctl restart prometheus
```

### 7.2 Logging

#### 7.2.1 Logrotate-Konfiguration

```bash
sudo nano /etc/logrotate.d/buergervorschlaege
```

Fügen Sie folgende Konfiguration hinzu:

```
/var/log/buergervorschlaege/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        systemctl reload buergervorschlaege
    endscript
}
```

### 7.3 Wartungsplan

#### 7.3.1 Regelmäßige Wartungsaufgaben

- **Täglich**: Log-Überprüfung, Backup-Verifizierung
- **Wöchentlich**: Systemupdates, Leistungsüberwachung
- **Monatlich**: Sicherheitsaudits, Datenbankoptimierung
- **Vierteljährlich**: Vollständiger Systemtest, Kapazitätsplanung
- **Jährlich**: Penetrationstest, Disaster-Recovery-Test

#### 7.3.2 Wartungsfenster

- Geplante Wartungsarbeiten sollten in Zeiten geringer Nutzung durchgeführt werden
- Empfohlenes Wartungsfenster: Sonntags 02:00-04:00 Uhr
- Benutzer sollten 48 Stunden im Voraus über geplante Wartungsarbeiten informiert werden

## 8. Skalierung

### 8.1 Vertikale Skalierung

- Erhöhung der Ressourcen (CPU, RAM) des bestehenden Servers
- Empfohlen für kleinere bis mittlere Installationen

### 8.2 Horizontale Skalierung

#### 8.2.1 Load Balancer einrichten

```bash
# HAProxy installieren
sudo apt install -y haproxy

# HAProxy konfigurieren
sudo nano /etc/haproxy/haproxy.cfg
```

Fügen Sie folgende Konfiguration hinzu:

```
frontend http_front
    bind *:80
    stats uri /haproxy?stats
    default_backend http_back

backend http_back
    balance roundrobin
    server server1 backend1.example.com:80 check
    server server2 backend2.example.com:80 check
```

#### 8.2.2 Kubernetes-Deployment

Für größere Installationen empfehlen wir die Verwendung von Kubernetes. Eine beispielhafte Kubernetes-Konfiguration finden Sie im Verzeichnis `/opt/buergervorschlaege/kubernetes/`.

### 8.3 Datenbank-Skalierung

#### 8.3.1 Replikation einrichten

```bash
# Konfiguration für den Master
sudo nano /etc/postgresql/14/main/postgresql.conf
```

Ändern Sie folgende Einstellungen:

```
wal_level = replica
max_wal_senders = 10
wal_keep_segments = 64
```

```bash
# pg_hba.conf anpassen
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Fügen Sie folgende Zeile hinzu:

```
host    replication     replicator      slave_ip/32        md5
```

#### 8.3.2 Verbindungspooling mit PgBouncer

```bash
# PgBouncer installieren
sudo apt install -y pgbouncer

# PgBouncer konfigurieren
sudo nano /etc/pgbouncer/pgbouncer.ini
```

## 9. Fehlerbehebung

### 9.1 Häufige Probleme und Lösungen

#### 9.1.1 Backend startet nicht

**Symptom**: Der Backend-Dienst startet nicht oder stürzt sofort ab.

**Lösungen**:
1. Logs überprüfen: `sudo journalctl -u buergervorschlaege`
2. Umgebungsvariablen prüfen: `cat /opt/buergervorschlaege/backend/.env`
3. Datenbankverbindung testen: `psql -h localhost -U buergerapp -d buergervorschlaege`
4. Manueller Start für detaillierte Fehler: `cd /opt/buergervorschlaege/backend && node server.js`

#### 9.1.2 Datenbank-Verbindungsprobleme

**Symptom**: Backend kann keine Verbindung zur Datenbank herstellen.

**Lösungen**:
1. PostgreSQL-Dienst prüfen: `sudo systemctl status postgresql`
2. Netzwerkverbindung testen: `telnet localhost 5432`
3. Benutzerberechtigungen prüfen: `sudo -u postgres psql -c "\du"`
4. pg_hba.conf überprüfen: `sudo cat /etc/postgresql/14/main/pg_hba.conf`

#### 9.1.3 KI-Modell funktioniert nicht

**Symptom**: Vorschläge werden nicht kategorisiert oder analysiert.

**Lösungen**:
1. Python-Umgebung prüfen: `cd /opt/buergervorschlaege/ai && source venv/bin/activate`
2. Modellpfade überprüfen: `ls -la /opt/buergervorschlaege/ai/models`
3. Manuelle Ausführung testen: `python test_model.py`
4. Logs überprüfen: `cat /var/log/buergervorschlaege/ai.log`

### 9.2 Diagnose-Tools

```bash
# Systemstatus überprüfen
sudo systemctl status buergervorschlaege

# Logs anzeigen
sudo journalctl -u buergervorschlaege -f

# Datenbankverbindungen überprüfen
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Netzwerkverbindungen überprüfen
sudo netstat -tulpn | grep LISTEN

# Festplattennutzung überprüfen
df -h

# Speichernutzung überprüfen
free -m

# CPU-Auslastung überprüfen
top
```

## 10. Kontakt und Support

Bei Fragen oder Problemen wenden Sie sich bitte an:

- **E-Mail**: support@buergervorschlaege.example.com
- **Telefon**: +49 123 456789
- **Webseite**: https://support.buergervorschlaege.example.com
- **Geschäftszeiten**: Montag bis Freitag, 9:00-17:00 Uhr

Für dringende Probleme außerhalb der Geschäftszeiten:

- **Notfall-Hotline**: +49 123 456789 (24/7)
- **Notfall-E-Mail**: emergency@buergervorschlaege.example.com
