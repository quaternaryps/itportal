# Docker Configurations

This directory contains additional Docker configuration files for specific services or environments.

## Structure

- `dev/` - Development-specific Docker configurations
- `prod/` - Production-specific Docker configurations  
- `services/` - Individual service Dockerfiles

## Usage

Reference these files from docker-compose.yml or use them standalone:

```bash
docker build -f docker/dev/Dockerfile.dev .
```
