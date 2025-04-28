#!/bin/bash

# Deployment script for ChadCan.Help
# This script automates the deployment process for both frontend and backend

# Exit on error
set -e

# Configuration
DOMAIN="your-domain.com"
SERVER_IP="your-server-ip"
SSH_USER="chadcan"
APP_DIR="/home/$SSH_USER/chadcan.help"
FRONTEND_DIR="$APP_DIR/frontend"
BACKEND_DIR="$APP_DIR/backend"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
print_step() {
    echo -e "${YELLOW}==== $1 ====${NC}"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

# Check if required variables are set
if [ "$DOMAIN" = "your-domain.com" ] || [ "$SERVER_IP" = "your-server-ip" ]; then
    print_error "Please update the DOMAIN and SERVER_IP variables in this script before running."
    exit 1
fi

# Start deployment
print_step "Starting deployment of ChadCan.Help"

# Build frontend
print_step "Building frontend"
cd frontend
npm run build
print_success "Frontend build completed"

# Create deployment package
print_step "Creating deployment package"
mkdir -p deploy
cp -r frontend/dist deploy/frontend
cp -r backend deploy/backend
cp deployment_guide.md deploy/

# Create deployment script for server
cat > deploy/setup.sh << 'EOF'
#!/bin/bash

# Server setup script for ChadCan.Help
# This script should be run on the server after uploading the files

# Exit on error
set -e

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required dependencies
sudo apt install -y python3-pip python3-venv nginx certbot python3-certbot-nginx

# Set up backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Please update the .env file with your OpenAI API key and other settings"
fi

# Make run script executable
chmod +x run.sh

# Create systemd service
sudo tee /etc/systemd/system/chadcan.service > /dev/null << 'EOSVC'
[Unit]
Description=ChadCan.Help Chat Service
After=network.target

[Service]
User=$USER
WorkingDirectory=$PWD
ExecStart=$PWD/run.sh
Restart=always
RestartSec=5
Environment=PATH=$PWD/venv/bin:$PATH

[Install]
WantedBy=multi-user.target
EOSVC

# Enable and start the service
sudo systemctl enable chadcan
sudo systemctl start chadcan

# Configure Nginx
sudo tee /etc/nginx/sites-available/chadcan.help > /dev/null << 'EONGINX'
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    root /home/$USER/chadcan.help/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /socket.io {
        proxy_pass http://localhost:5000/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EONGINX

# Enable the site
sudo ln -s /etc/nginx/sites-available/chadcan.help /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Set up SSL with Certbot
echo "To set up SSL, run the following command:"
echo "sudo certbot --nginx -d your-domain.com -d www.your-domain.com"

echo "Setup completed successfully!"
EOF

chmod +x deploy/setup.sh

# Create README for deployment package
cat > deploy/README.md << 'EOF'
# ChadCan.Help Deployment Package

This package contains everything needed to deploy the ChadCan.Help application to a server.

## Contents

- `frontend/` - Pre-built frontend files
- `backend/` - Backend server code and dependencies
- `setup.sh` - Server setup script
- `deployment_guide.md` - Detailed deployment guide

## Quick Deployment Steps

1. Upload this entire package to your server:
   ```
   scp -r deploy/ user@your-server-ip:~/chadcan.help
   ```

2. SSH into your server:
   ```
   ssh user@your-server-ip
   ```

3. Navigate to the uploaded directory:
   ```
   cd chadcan.help
   ```

4. Run the setup script:
   ```
   ./setup.sh
   ```

5. Follow the prompts to complete the setup.

6. Set up SSL with Certbot:
   ```
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

For more detailed instructions, see `deployment_guide.md`.
EOF

print_success "Deployment package created in the 'deploy' directory"

print_step "Deployment preparation completed"
print_success "You can now upload the deployment package to your server"
print_success "Follow the instructions in deploy/README.md to complete the deployment"
