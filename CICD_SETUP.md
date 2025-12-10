# CI/CD Deployment Setup Guide

## SSH-Deployment auf VPS konfigurieren

### 1. SSH-Schlüsselpaar generieren (auf deinem lokalen Rechner)

```bash
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy -N ""
```

Das erzeugt:

- `~/.ssh/github_deploy` (privater Schlüssel)
- `~/.ssh/github_deploy.pub` (öffentlicher Schlüssel)

### 2. Öffentlichen Schlüssel auf dem VPS installieren

```bash
ssh-copy-id -i ~/.ssh/github_deploy.pub user@deine-vps-ip
```

Oder manuell:

```bash
cat ~/.ssh/github_deploy.pub | ssh user@deine-vps-ip "cat >> ~/.ssh/authorized_keys"
```

### 3. GitHub Secrets konfigurieren

Gehe zu deinem Repository → **Settings → Secrets and variables → Actions** und füge folgende Secrets hinzu:

| Secret Name       | Wert                                                             |
| ----------------- | ---------------------------------------------------------------- |
| `VPS_HOST`        | deine-vps-ip (z.B. 123.45.67.89)                                 |
| `VPS_USER`        | Benutzername auf VPS (z.B. root oder deploy)                     |
| `VPS_SSH_KEY`     | Inhalt von `~/.ssh/github_deploy` (privater Schlüssel)           |
| `VPS_DEPLOY_PATH` | Pfad zum Projekt auf VPS (z.B. /home/user/apps/lyricsTranslator) |

### 4. Projekt auf VPS vorbereiten

Auf deinem VPS:

```bash
# Repository clonen
git clone https://github.com/dein-username/lyricsTranslator.git /home/user/apps/lyricsTranslator
cd /home/user/apps/lyricsTranslator

# Node.js und Java installieren (falls nicht vorhanden)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y openjdk-21-jdk

# Docker und docker-compose (optional, falls du Docker nutzt)
sudo apt-get install -y docker.io docker-compose
sudo usermod -aG docker $(whoami)
```

### 5. Deploy-Script testen

Zum Testen ohne Push:

```bash
ssh -i ~/.ssh/github_deploy user@vps-ip
cd /home/user/apps/lyricsTranslator/backend
git pull origin main
./gradlew build -x test
```

## Wie der Workflow funktioniert

1. **Build-Job** läuft bei jedem Push auf `main` oder `develop`

   - Testet und baut das Projekt
   - Speichert Test-Reports

2. **Deploy-Job** läuft NUR auf `main` Branch nach erfolgreichem Build
   - Verbindet sich via SSH zum VPS
   - Pulled die neuesten Änderungen
   - Baut das Projekt neu
   - Started Docker-Container (falls docker-compose verwendet)

## Alternative: Mit Docker-Image Building

Falls du auch Docker-Images builden und pushen möchtest:

```yaml
- name: Build Docker Image
  run: |
    docker build -t myregistry/backend:latest ./backend
    docker push myregistry/backend:latest
```

Dann auf dem VPS:

```bash
docker pull myregistry/backend:latest
docker-compose up -d
```

## Troubleshooting

**SSH-Verbindung schlägt fehl:**

- Prüfe, ob der öffentliche Schlüssel auf dem VPS in `~/.ssh/authorized_keys` ist
- Überprüfe SSH-Permissions: `chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys`

**Permission denied:**

- Der Benutzer muss Schreibrechte im Deploy-Verzeichnis haben
- Check: `ls -la /path/to/deploy`

**Git pull schlägt fehl:**

- SSH-Identität auf VPS muss GitHub-Keys haben, oder
- HTTPS mit Personal Access Token verwenden

**Docker-Fehler:**

- Stelle sicher, dass docker-compose.yml im Root-Verzeichnis existiert
- User muss in docker-Gruppe sein: `sudo usermod -aG docker $USER`
