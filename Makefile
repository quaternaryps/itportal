.PHONY: help build up down restart logs clean test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all Docker containers
	docker-compose build

up: ## Start all services
	docker-compose up -d

up-build: ## Build and start all services
	docker-compose up --build -d

down: ## Stop all services
	docker-compose down

down-volumes: ## Stop all services and remove volumes
	docker-compose down -v

restart: ## Restart all services
	docker-compose restart

logs: ## View logs from all services
	docker-compose logs -f

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-postgres: ## View database logs
	docker-compose logs -f postgres

clean: ## Stop services and clean up containers, networks, and volumes
	docker-compose down -v
	docker system prune -f

dev-frontend: ## Run frontend in development mode
	cd frontend && npm run dev

dev-backend: ## Run backend in development mode
	cd backend && deno task dev

db-shell: ## Connect to PostgreSQL database
	docker-compose exec postgres psql -U postgres -d itportal

backend-shell: ## Open shell in backend container
	docker-compose exec backend sh

frontend-shell: ## Open shell in frontend container
	docker-compose exec frontend sh

status: ## Show status of all services
	docker-compose ps

test: ## Run tests
	@echo "Running tests..."
	cd frontend && npm test
