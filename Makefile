.PHONY: setup dev install generate-db seed-db clean

# Define common colors for output
GREEN=\033[0;32m
NC=\033[0m # No Color

# Default target
all: help

help:
	@echo "Available commands:"
	@echo "  make setup   - First-time setup (copies .env, installs dependencies, generates Prisma client)"
	@echo "  make dev     - Run the fullstack application locally (Frontend + Backend concurrently)"
	@echo "  make clean   - Remove node_modules and built artifacts"

setup:
	@echo "$(GREEN)Setting up the fullstack template...$(NC)"
	@if [ ! -f packages/server/.env.dev ]; then \
		echo "Creating .env.dev from .env.example..."; \
		cp packages/server/.env.example packages/server/.env.dev || echo "No .env.example found, skipping."; \
	fi
	@echo "$(GREEN)Installing dependencies...$(NC)"
	pnpm install
	@echo "$(GREEN)Generating Prisma Client...$(NC)"
	pnpm --filter database generate
	@echo "$(GREEN)Setup complete! Run 'make dev' to start development.$(NC)"

dev:
	@echo "$(GREEN)Starting development servers...$(NC)"
	pnpm --filter database generate
	pnpm exec concurrently -c "cyan.bold,blue.bold" -n "web,server" "pnpm web" "pnpm server:local"

install:
	pnpm install

clean:
	@echo "$(GREEN)Cleaning node_modules and dist folders...$(NC)"
	rm -rf node_modules packages/*/node_modules
	rm -rf packages/*/dist
