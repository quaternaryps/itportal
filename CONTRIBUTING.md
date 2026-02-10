# Contributing to IT Portal

This guide helps Claude Code and other developers work effectively with this repository.

## Repository Structure

```
itportal/
├── src/                    # Source code
├── data/                   # Application data (git-ignored)
├── docker/                 # Additional Docker configurations
├── docs/                   # Documentation
├── Dockerfile              # Main Docker configuration
├── docker-compose.yml      # Multi-container orchestration
├── .gitignore             # Git ignore rules
├── .dockerignore          # Docker ignore rules
└── README.md              # Project overview
```

## Development Workflow

### Setting Up the Development Environment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/quaternaryps/itportal.git
   cd itportal
   ```

2. **Using Docker (Recommended):**
   ```bash
   # Start all services
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   
   # Stop services
   docker-compose down
   ```

3. **Without Docker:**
   ```bash
   # Set up Python virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies (when requirements.txt exists)
   pip install -r requirements.txt
   ```

### Version Control Best Practices

1. **Commit Often:** Save intermediate versions frequently
2. **Descriptive Messages:** Use clear commit messages
3. **Branch Strategy:**
   - `main` - Production-ready code
   - `develop` - Integration branch
   - `feature/*` - New features
   - `bugfix/*` - Bug fixes
   - `copilot/*` - Claude Code development branches

### Working with Claude Code

This repository is optimized for Claude Code development:

- **All intermediate versions are tracked** - Git automatically stores all changes
- **Docker specs are version-controlled** - Dockerfile and docker-compose.yml are committed
- **Clear structure** - Organized directories for easy navigation
- **Flexible configuration** - Docker setup supports development and production modes

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in the appropriate directory:
   - Application code → `src/`
   - Documentation → `docs/`
   - Docker configs → `docker/` or root-level Dockerfile/docker-compose.yml

3. **Test your changes:**
   ```bash
   # Using Docker
   docker-compose up --build
   
   # Or test locally
   python -m pytest  # (when tests exist)
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Clear description of changes"
   ```

5. **Push to remote:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Docker Container Specifications

#### Dockerfile
- Multi-stage build with `development` and `production` targets
- Base image: Python 3.11
- Configurable for different application types

#### docker-compose.yml
Includes services for:
- **app**: Main application container
- **db**: PostgreSQL database
- **cache**: Redis cache

Customize these services based on your application needs.

### File Organization

- **Keep source code in `src/`**
- **Store documentation in `docs/`**
- **Use `data/` for runtime data** (automatically git-ignored)
- **Put custom Docker configs in `docker/`**

### Environment Variables

Use `.env` file for environment-specific configuration (automatically git-ignored):

```env
ENVIRONMENT=development
DATABASE_URL=postgresql://itportal:itportal_password@db:5432/itportal
REDIS_URL=redis://cache:6379
```

## Adding Dependencies

### Python
```bash
pip install package-name
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Add package-name dependency"
```

### Node.js
```bash
npm install package-name
git add package.json package-lock.json
git commit -m "Add package-name dependency"
```

## CI/CD Integration

When ready, add CI/CD pipelines in `.github/workflows/` to:
- Run tests automatically
- Build Docker images
- Deploy to staging/production

## Questions or Issues?

Create an issue in the GitHub repository or reach out to the team.

## Version History

All versions are automatically tracked by Git:
```bash
# View commit history
git log --oneline

# View changes in a specific commit
git show <commit-hash>

# Compare versions
git diff <old-commit> <new-commit>
```
