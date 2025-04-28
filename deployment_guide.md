# Cloud VM Setup and Deployment Guide for ChadCan.Help

This guide provides instructions for setting up a Cloud VM (either Lightsail or DigitalOcean), configuring SSL, and deploying the ChadCan.Help application.

## 1. Cloud VM Setup

### Option 1: AWS Lightsail

1. **Create a Lightsail instance**:
   - Go to [AWS Lightsail](https://aws.amazon.com/lightsail/)
   - Click "Create instance"
   - Select "Linux/Unix" platform
   - Choose "Ubuntu 22.04 LTS" blueprint
   - Select a plan with at least 2GB RAM (recommended: $10/month plan)
   - Name your instance (e.g., "chadcan-help-server")
   - Click "Create instance"

2. **Configure static IP**:
   - Go to the "Networking" tab of your instance
   - Click "Create static IP"
   - Attach it to your instance
   - Note down the static IP address

3. **Configure firewall**:
   - Go to the "Networking" tab
   - Add the following firewall rules:
     - HTTP (TCP port 80)
     - HTTPS (TCP port 443)
     - Custom (TCP port 5000) - for development only, can be removed later

### Option 2: DigitalOcean

1. **Create a Droplet**:
   - Go to [DigitalOcean](https://www.digitalocean.com/)
   - Click "Create" > "Droplets"
   - Choose "Ubuntu 22.04 LTS" image
   - Select a plan with at least 2GB RAM (Basic plan, $12/month)
   - Choose a datacenter region close to your target audience
   - Add your SSH key or select password authentication
   - Name your Droplet (e.g., "chadcan-help-server")
   - Click "Create Droplet"

2. **Note the IP address**:
   - The Droplet comes with a static IP by default
   - Note down this IP address

## 2. Server Configuration

1. **Connect to your server**:
   ```bash
   ssh root@YOUR_SERVER_IP
   ```

2. **Update system packages**:
   ```bash
   apt update && apt upgrade -y
   ```

3. **Install required dependencies**:
   ```bash
   apt install -y python3-pip python3-venv nginx certbot python3-certbot-nginx git
   ```

4. **Create a non-root user** (optional but recommended):
   ```bash
   adduser chadcan
   usermod -aG sudo chadcan
   ```

5. **Switch to the new user**:
   ```bash
   su - chadcan
   ```

## 3. SSL Certificate Setup

1. **Configure your domain**:
   - Point your domain to your server's IP address by updating the A record at your domain registrar
   - Wait for DNS propagation (can take up to 24 hours)

2. **Configure Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/chadcan.help
   ```

3. **Add the following configuration**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/chadcan.help /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **Obtain SSL certificate**:
   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```
   - Follow the prompts to complete the certificate setup
   - Choose to redirect HTTP traffic to HTTPS

## 4. Application Deployment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/k3ss-official/chadcan.help.git
   cd chadcan.help
   ```

2. **Set up the backend**:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   nano .env
   ```
   - Update the `SECRET_KEY` with a secure random string
   - Add your `OPENAI_API_KEY`

4. **Create a systemd service**:
   ```bash
   sudo nano /etc/systemd/system/chadcan.service
   ```

5. **Add the following configuration**:
   ```ini
   [Unit]
   Description=ChadCan.Help Chat Service
   After=network.target

   [Service]
   User=chadcan
   WorkingDirectory=/home/chadcan/chadcan.help/backend
   ExecStart=/home/chadcan/chadcan.help/backend/run.sh
   Restart=always
   RestartSec=5
   Environment=PATH=/home/chadcan/chadcan.help/backend/venv/bin:$PATH

   [Install]
   WantedBy=multi-user.target
   ```

6. **Enable and start the service**:
   ```bash
   sudo systemctl enable chadcan
   sudo systemctl start chadcan
   sudo systemctl status chadcan
   ```

7. **Deploy the frontend**:
   ```bash
   cd ../frontend
   ```
   - The frontend is already built and ready in the `dist` directory
   - No additional build steps are needed

8. **Update Nginx configuration**:
   ```bash
   sudo nano /etc/nginx/sites-available/chadcan.help
   ```

9. **Modify the configuration to serve static files**:
   ```nginx
   server {
       listen 443 ssl;
       server_name your-domain.com www.your-domain.com;
       
       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
       
       root /home/chadcan/chadcan.help/frontend/dist;
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
   
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       return 301 https://$host$request_uri;
   }
   ```

10. **Restart Nginx**:
    ```bash
    sudo nginx -t
    sudo systemctl restart nginx
    ```

## 5. Testing the Deployment

1. **Visit your domain**:
   - Open a web browser and navigate to your domain (https://your-domain.com)
   - Verify that the landing page loads correctly

2. **Test the chat functionality**:
   - Click the "Try It" button
   - Verify that the chat window opens
   - Send a test message and check for a response
   - Verify that the 15-minute timer is working

3. **Check logs if needed**:
   ```bash
   sudo journalctl -u chadcan -f
   ```

## 6. Maintenance and Updates

1. **Update the application**:
   ```bash
   cd ~/chadcan.help
   git pull
   
   # Update backend
   cd backend
   source venv/bin/activate
   pip install -r requirements.txt
   sudo systemctl restart chadcan
   
   # Update frontend if needed
   cd ../frontend
   # No additional steps needed if frontend is pre-built
   
   # Restart Nginx if needed
   sudo systemctl restart nginx
   ```

2. **Renew SSL certificate**:
   - Certificates auto-renew with Certbot, but you can manually renew with:
   ```bash
   sudo certbot renew
   ```

3. **Monitor server health**:
   ```bash
   htop
   df -h
   ```

## 7. Troubleshooting

1. **Check application logs**:
   ```bash
   sudo journalctl -u chadcan -f
   ```

2. **Check Nginx logs**:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   sudo tail -f /var/log/nginx/access.log
   ```

3. **Restart services**:
   ```bash
   sudo systemctl restart chadcan
   sudo systemctl restart nginx
   ```

4. **Check firewall settings**:
   ```bash
   sudo ufw status
   ```

5. **Verify SSL certificate**:
   ```bash
   sudo certbot certificates
   ```
