# IT Portal - Multi-stage Docker Build
# This Dockerfile supports flexible application development

# Stage 1: Base image with common dependencies
FROM python:3.11-slim as base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Stage 2: Development environment
FROM base as development

# Install development tools
RUN apt-get update && apt-get install -y \
    vim \
    nano \
    && rm -rf /var/lib/apt/lists/*

# Copy application code
COPY . /app

# Expose port for development server
EXPOSE 8000

# Default command for development
CMD ["python", "-m", "http.server", "8000"]

# Stage 3: Production environment
FROM base as production

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Copy application code
COPY --chown=appuser:appuser . /app

# Switch to non-root user
USER appuser

# Expose port for production server
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Default command for production
CMD ["python", "-m", "http.server", "8000"]
