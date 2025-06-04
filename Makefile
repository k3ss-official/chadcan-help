# ChadCan.Help - Because we're in the AI Vibe Coder age now, Son!
# Professional-grade scam detection platform

.PHONY: install setup oldschool test clean deploy help dev

help:
	@echo "🤖 ChadCan.Help - AI Scam Detection Platform"
	@echo "============================================="
	@echo ""
	@echo "Hey, I see you're doing this old school!"
	@echo "We're in the AI Vibe Coder age now, Son!! 🚀"
	@echo ""
	@echo "Available commands:"
	@echo "  make install     - Smart automated setup (recommended)"
	@echo "  make setup       - Same as install but cooler name"
	@echo "  make oldschool   - Manual pip install (if you insist)"
	@echo "  make dev         - Start development server"
	@echo "  make test        - Run tests"
	@echo "  make deploy      - Deploy to production"
	@echo "  make clean       - Clean up build files"
	@echo ""

install setup:
	@echo "🎉 Running the smart installer..."
	@echo "This will set up conda env, dependencies, API keys, and more!"
	@chmod +x install.sh
	@./install.sh

oldschool:
	@echo "🙄 Alright, old school it is..."
	@echo "Installing dependencies manually..."
	@pip install -r requirements.txt
	@echo ""
	@echo "✅ Dependencies installed"
	@echo "📝 Manual steps you still need to do:"
	@echo "  1. Create conda environment: conda create -n chadcan python=3.12"
	@echo "  2. Activate environment: conda activate chadcan"
	@echo "  3. Copy .env.example to .env"
	@echo "  4. Add your OpenAI API key to .env"
	@echo "  5. Run the server with: make dev"
	@echo ""
	@echo "💡 Pro tip: Just run 'make install' next time!"

dev:
	@echo "🚀 Starting development server..."
	@if [ -f "docker-compose.yml" ]; then \
		docker-compose up -d; \
		echo "🌐 Chad is running at http://localhost:3000"; \
	else \
		echo "Starting manual server..."; \
		conda activate chadcan && node server.js; \
	fi

test:
	@echo "🧪 Running tests..."
	@conda activate chadcan && python -m pytest tests/ -v

deploy:
	@echo "🚀 Deploying to production..."
	@docker-compose -f docker-compose.prod.yml up -d --build
	@echo "✅ Production deployment complete"

clean:
	@echo "🧹 Cleaning up..."
	@rm -rf __pycache__/ .pytest_cache/ *.pyc
	@docker system prune -f
	@echo "✅ Cleanup complete"

# Default target
all: help