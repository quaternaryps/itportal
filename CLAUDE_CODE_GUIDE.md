# Quick Reference for Claude Code

## Repository Overview
This repository (`quaternaryps/itportal`) is configured for AI-assisted development with full version control and Docker support.

## What's Already Set Up

### ✅ Version Control (Git)
- All intermediate code versions are automatically tracked
- Every commit creates a permanent snapshot
- Easy to review history with `git log`

### ✅ Docker Container Specs
- **Dockerfile**: Multi-stage build (development + production)
- **docker-compose.yml**: Complete orchestration with app, database, and cache
- All Docker configs are version-controlled

### ✅ Project Structure
```
itportal/
├── src/          ← Put application code here
├── docker/       ← Additional Docker configs
├── docs/         ← Documentation
├── data/         ← Runtime data (git-ignored)
└── [config files]
```

## Quick Commands

### Start Development
```bash
docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f app
```

### Stop Services
```bash
docker-compose down
```

### Validate Setup
```bash
./validate-setup.sh
```

## Making Changes

1. **Edit files** in `src/` directory
2. **Test changes** using Docker or locally
3. **Git tracks everything** automatically
4. **Commit frequently** for version history

## Key Files

- **Dockerfile**: Application container configuration
- **docker-compose.yml**: Multi-service orchestration  
- **.gitignore**: Excludes temporary files from version control
- **.env.example**: Template for environment variables
- **CONTRIBUTING.md**: Detailed development guide

## Environment Setup

Copy environment template:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Important Notes

✅ All code changes are version-controlled  
✅ Docker specs are committed to Git  
✅ Temporary files (logs, caches) are excluded via .gitignore  
✅ Data directory is for runtime data only (not committed)

## Next Steps

1. Read `CONTRIBUTING.md` for detailed guidelines
2. Start coding in `src/` directory
3. Use Docker for consistent development environment
4. Commit changes regularly to track progress

---

For more details, see README.md and CONTRIBUTING.md
