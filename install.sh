#!/bin/bash
# install.sh - ChadCan.Help MVP Setup Script

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Banner
echo -e "${BLUE}"
echo "   _____ _               _  _____                _   _      _       "
echo "  / ____| |             | |/ ____|              | | | |    | |      "
echo " | |    | |__   __ _  __| | |     __ _ _ __      | |_| | ___| |_ __  "
echo " | |    | '_ \ / _\` |/ _\` | |    / _\` | '_ \     |  _  |/ _ \ | '_ \ "
echo " | |____| | | | (_| | (_| | |___| (_| | | | | _  | | | |  __/ | |_) |"
echo "  \_____|_| |_|\__,_|\__,_|\_____\__,_|_| |_|(_) |_| |_|\___|_| .__/ "
echo "                                                             | |    "
echo "                                                             |_|    "
echo -e "${NC}"
echo -e "${YELLOW}MVP Development Environment Setup${NC}"
echo -e "${CYAN}Professional-grade scam detection platform${NC}"
echo

# Functions
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

prompt_api_key() {
    echo -e "${YELLOW}🔑 OpenAI API Key Setup${NC}"
    echo "Chad requires an OpenAI API key to function."
    echo -e "${CYAN}You can get one at: https://platform.openai.com/api-keys${NC}"
    echo
    
    read -p "Enter your OpenAI API key (or press Enter to skip): " api_key
    
    if [ -n "$api_key" ]; then
        # Validate API key format (starts with sk-)
        if [[ $api_key == sk-* ]]; then
            echo "OPENAI_API_KEY=$api_key" >> .env
            echo "MODEL_NAME=gpt-4o" >> .env
            echo "MODEL_PROVIDER=openai" >> .env
            echo -e "${GREEN}✅ API key configured successfully${NC}"
            return 0
        else
            echo -e "${RED}❌ Invalid API key format. Should start with 'sk-'${NC}"
            echo -e "${YELLOW}📝 You can add it manually to .env later${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}📝 Skipped API key setup. Remember to add it to .env before running Chad${NC}"
        return 1
    fi
}

check_dependencies() {
    echo -e "${YELLOW}🔍 Checking system dependencies...${NC}"
    
    local missing_deps=()
    
    # Check conda
    if ! command_exists conda; then
        missing_deps+=("conda")
    fi
    
    # Check git
    if ! command_exists git; then
        missing_deps+=("git")
    fi
    
    # Check node/npm
    if ! command_exists node; then
        missing_deps+=("node.js")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing dependencies: ${missing_deps[*]}${NC}"
        echo
        echo "Please install the missing dependencies:"
        echo "• Conda: https://docs.conda.io/en/latest/miniconda.html"
        echo "• Git: https://git-scm.com/downloads"
        echo "• Node.js: https://nodejs.org/en/download/"
        exit 1
    fi
    
    # Optional dependencies
    if ! command_exists docker; then
        echo -e "${YELLOW}⚠️  Docker not found. Manual server mode will be used.${NC}"
    fi
    
    echo -e "${GREEN}✅ All required dependencies found${NC}"
}

setup_conda_env() {
    echo -e "${YELLOW}🐍 Setting up conda environment 'chadcan'...${NC}"
    
    if ! conda env list | grep -q "chadcan"; then
        echo "Creating new conda environment with Python 3.12..."
        conda create -n chadcan python=3.12 -y
        echo -e "${GREEN}✅ Conda environment 'chadcan' created${NC}"
    else
        echo -e "${GREEN}✅ Conda environment 'chadcan' already exists${NC}"
    fi
}

install_python_deps() {
    echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
    
    # Activate environment
    eval "$(conda shell.bash hook)"
    conda activate chadcan
    
    # Install from requirements.txt if it exists, otherwise install manually
    if [ -f "requirements.txt" ]; then
        echo "Installing from requirements.txt..."
        pip install -r requirements.txt
    else
        echo "Installing core dependencies manually..."
        pip install -q redis flask flask-session psycopg2-binary
        pip install -q nltk beautifulsoup4 requests python-dotenv
        pip install -q python-socketio eventlet gunicorn
    fi
    
    echo -e "${GREEN}✅ Python dependencies installed${NC}"
}

install_node_deps() {
    echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
    
    if [ -f "package.json" ]; then
        npm install --silent
        echo -e "${GREEN}✅ Node.js dependencies installed${NC}"
    else
        echo -e "${YELLOW}📝 No package.json found, skipping Node.js dependencies${NC}"
    fi
}

setup_env_file() {
    echo -e "${YELLOW}⚙️  Setting up environment configuration...${NC}"
    
    # Create .env from template
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env from template${NC}"
    else
        # Create basic .env if no template exists
        cat > .env << EOF
# ChadCan.Help Environment Configuration
OPENAI_API_KEY=your_api_key_here
MODEL_NAME=gpt-4o
MODEL_PROVIDER=openai
PORT=3000
NODE_ENV=development
SESSION_SECRET=$(openssl rand -base64 32)
EOF
        echo -e "${GREEN}✅ Created basic .env file${NC}"
    fi
    
    # Prompt for API key
    prompt_api_key
}

test_installation() {
    echo -e "${YELLOW}🧪 Testing installation...${NC}"
    
    # Check if .env has API key
    if grep -q "your_api_key_here" .env; then
        echo -e "${YELLOW}⚠️  API key not configured in .env${NC}"
        return 1
    fi
    
    # Test conda environment
    eval "$(conda shell.bash hook)"
    if conda activate chadcan; then
        echo -e "${GREEN}✅ Conda environment activation successful${NC}"
        conda deactivate
    else
        echo -e "${RED}❌ Conda environment activation failed${NC}"
        return 1
    fi
    
    return 0
}

start_services() {
    echo -e "${YELLOW}🚀 Starting development services...${NC}"
    
    if command_exists docker-compose && [ -f "docker-compose.yml" ]; then
        echo "Starting with Docker Compose..."
        docker-compose up -d
        echo -e "${GREEN}✅ Services started with Docker Compose${NC}"
        echo -e "${BLUE}🌐 Chad is running at http://localhost:3000${NC}"
    else
        echo "Starting manual development server..."
        eval "$(conda shell.bash hook)"
        conda activate chadcan
        
        if [ -f "server.js" ]; then
            node server.js &
        elif [ -f "server.py" ]; then
            python server.py &
        fi
        
        echo -e "${GREEN}✅ Development server started${NC}"
        echo -e "${BLUE}🌐 Chad should be running at http://localhost:3000${NC}"
    fi
}

show_next_steps() {
    echo
    echo -e "${GREEN}🎉 ChadCan.Help MVP installation complete!${NC}"
    echo
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Activate environment: ${CYAN}conda activate chadcan${NC}"
    
    if grep -q "your_api_key_here" .env; then
        echo "2. Add OpenAI API key to .env file"
        echo "3. Start services: ${CYAN}docker-compose up -d${NC} or ${CYAN}npm start${NC}"
    else
        echo "2. Start services: ${CYAN}docker-compose up -d${NC} or ${CYAN}npm start${NC}"
    fi
    
    echo
    echo -e "${YELLOW}Manual installation alternative:${NC}"
    echo "• ${CYAN}pip install -r requirements.txt${NC} (for Python deps)"
    echo "• ${CYAN}npm install${NC} (for Node.js deps)"
    echo
    echo -e "${BLUE}Documentation: README.md${NC}"
    echo -e "${BLUE}Happy scam fighting! 🛡️${NC}"
}

# Main installation flow
main() {
    echo -e "${BLUE}Starting ChadCan.Help MVP installation...${NC}"
    echo
    
    check_dependencies
    setup_conda_env
    install_python_deps
    install_node_deps
    setup_env_file
    
    echo
    if test_installation; then
        echo -e "${GREEN}✅ Installation validation passed${NC}"
        
        read -p "Start development services now? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            start_services
        fi
    else
        echo -e "${YELLOW}⚠️  Installation completed with warnings${NC}"
    fi
    
    show_next_steps
}

# Run main function
main "$@"
