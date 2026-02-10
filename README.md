# ITMenu - IT Admin Dashboard

Interactive SVG network map showing infrastructure compliance status, IT ticketing system, and configuration management.

## Features

- **Network Map Dashboard** — Visual overview of 14 infrastructure components with color-coded compliance status
- **Compliance Tracking** — Detailed metrics per component (Green/Yellow/Red status)
- **IT Ticketing System** — User and Admin portals for ticket lifecycle management
- **Configuration Management** — Set destination URLs for each dashboard node

## Quick Start (Docker)

### Deploy from GitHub Container Registry

```bash
# Pull the latest image
docker pull ghcr.io/quaternaryps/itportal:latest

# Run with persistent data
docker run -d \
  --name itmenu \
  -p 3001:3000 \
  -v itmenu-data:/app/data \
  --restart unless-stopped \
  ghcr.io/quaternaryps/itportal:latest
```

### Deploy with Docker Compose

```yaml
services:
  itmenu:
    image: ghcr.io/quaternaryps/itportal:latest
    container_name: itmenu
    ports:
      - "3001:3000"
    volumes:
      - itmenu-data:/app/data
    restart: unless-stopped

volumes:
  itmenu-data:
```

```bash
docker compose up -d
```

## Access URLs

| Portal | URL |
|--------|-----|
| Dashboard | http://localhost:3001 |
| User Ticket Portal | http://localhost:3001/tickets/user |
| Admin Ticket Portal | http://localhost:3001/tickets/admin |
| Configuration | http://localhost:3001/config |

## Data Persistence

All data is stored in the Docker volume `itmenu-data`:
- `config.json` — Node URL configuration
- `tickets.json` — Ticket data
- `users.json` — User accounts
- `compliance.json` — Compliance metrics

### Backup Data
```bash
docker cp itmenu:/app/data ./data-backup
```

### Restore Data
```bash
docker cp ./data-backup/. itmenu:/app/data
```

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build Local Docker Image

```bash
docker build -t itmenu:latest .
```
