# IT Portal
IT Architectural Portal for Agentic Management

## Overview

This repository is designed to support Claude Code development with full version control and Docker container management. All intermediate code versions and container specifications are stored and tracked.

## Features

- ✅ **Full Version Control** - All code changes tracked via Git
- ✅ **Docker Support** - Complete container specifications with multi-stage builds
- ✅ **Development Ready** - Organized structure for iterative development
- ✅ **Claude Code Optimized** - Configured for AI-assisted development workflows

## Quick Start

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Manual Setup

```bash
# Clone the repository
git clone https://github.com/quaternaryps/itportal.git
cd itportal

# Set up environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

## Project Structure

```
itportal/
├── src/                    # Application source code
├── data/                   # Runtime data (git-ignored)
├── docker/                 # Additional Docker configurations
├── docs/                   # Project documentation
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Container orchestration
├── .gitignore             # Version control exclusions
├── .dockerignore          # Docker build exclusions
├── CONTRIBUTING.md        # Development guidelines
└── README.md              # This file
```

## Docker Configuration

### Services

- **app**: Main application (Python-based, customizable)
- **db**: PostgreSQL database
- **cache**: Redis cache

### Building Images

```bash
# Development build
docker-compose build

# Production build
docker build --target production -t itportal:prod .
```

## Development Workflow

1. **Make changes** in the `src/` directory
2. **Test locally** using Docker or your preferred method
3. **Commit frequently** to track intermediate versions
4. **Push changes** to maintain remote backup

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Version Control

All intermediate versions are automatically tracked:

```bash
# View history
git log --oneline

# See changes
git diff

# View specific version
git show <commit-hash>
```

## Environment Variables

Create a `.env` file for local configuration:

```env
ENVIRONMENT=development
DATABASE_URL=postgresql://itportal:itportal_password@db:5432/itportal
REDIS_URL=redis://cache:6379
```

## Claude Code Integration

This repository is optimized for Claude Code:

- **Automatic version tracking** of all code iterations
- **Docker specs version controlled** for reproducible builds
- **Clear structure** for easy navigation and development
- **Comprehensive documentation** to guide development

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and best practices.

## License

[Specify your license here]

## Support

For questions or issues, please open a GitHub issue.
