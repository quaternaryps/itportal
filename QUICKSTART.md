# IT Portal - Quick Start Guide

## Overview

This is a fully containerized web portal for IT architectural management, built with:
- **Frontend**: Next.js 16 with TypeScript and Tailwind CSS
- **Backend**: Deno with Oak framework
- **Database**: PostgreSQL 17
- **Orchestration**: Docker Compose

## Quick Start

### 1. Prerequisites
- Docker (v20.10+)
- Docker Compose (v2.0+)

### 2. Start the Application

```bash
# Clone the repository
git clone https://github.com/quaternaryps/itportal.git
cd itportal

# Start all services
docker compose up -d

# View logs
docker compose logs -f
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Database**: localhost:5432

### 4. Stop the Application

```bash
# Stop all services
docker compose down

# Stop and remove volumes (delete data)
docker compose down -v
```

## Development

### Using the Makefile

```bash
# Build containers
make build

# Start services
make up

# View logs
make logs

# Stop services
make down

# Connect to database
make db-shell
```

## API Examples

### Health Check
```bash
curl http://localhost:8000/health
```

### Get All Items
```bash
curl http://localhost:8000/api/items
```

### Create New Item
```bash
curl -X POST http://localhost:8000/api/items \
  -H "Content-Type: application/json" \
  -d '{"title":"My Item","description":"Description","category":"General"}'
```

### Update Item
```bash
curl -X PUT http://localhost:8000/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'
```

### Delete Item
```bash
curl -X DELETE http://localhost:8000/api/items/1
```

## Project Structure

```
itportal/
├── frontend/              # Next.js application
│   ├── app/              # Next.js app directory
│   └── package.json      # Frontend dependencies
├── backend/              # Deno API
│   ├── src/main.ts      # Main server file
│   └── config/init.sql  # Database initialization
├── docker-compose.yml    # Container orchestration
├── Dockerfile.frontend   # Frontend container
├── Dockerfile.backend    # Backend container
└── Makefile             # Development shortcuts
```

## Troubleshooting

### Containers won't start
```bash
# Check logs
docker compose logs

# Rebuild containers
docker compose build --no-cache
docker compose up
```

### Database connection issues
```bash
# Check PostgreSQL is running
docker compose ps postgres

# View database logs
docker compose logs postgres
```

### Frontend can't connect to backend
- Ensure all containers are running: `docker compose ps`
- Check backend logs: `docker compose logs backend`
- Verify NEXT_PUBLIC_API_URL in docker-compose.yml

## Security Notes

For production deployment:
- [ ] Change default database credentials
- [ ] Configure CORS to allow only specific origins
- [ ] Enable HTTPS/SSL
- [ ] Implement authentication and authorization
- [ ] Use environment-specific configuration files
- [ ] Regular security updates for dependencies

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Deno Documentation](https://deno.land/manual)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
