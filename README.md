# ChadCan.Help - AI Scam Detection Platform

## Overview

ChadCan.Help is an AI-powered platform designed to help users identify and protect themselves from online scams, particularly those targeting UK users on Facebook, Instagram, and WhatsApp. The platform features an interactive AI chatbot named Chad, comprehensive scam analytics, and educational resources.

## Features

- **AI-powered Chat Assistant**: Chad uses GPT-4o to analyze and detect potential scams with near-perfect accuracy
- **GDPR-compliant**: Session-only data processing with no permanent storage of sensitive information
- **UK Scam Heatmap**: Visual representation of scam activity across the UK
- **Global Threat Intelligence**: Visualization of non-UK scam origins
- **Professional Reports**: Downloadable PDF reports with comprehensive scam analysis
- **Emergency Guidance**: Clear instructions for contacting banks and reporting fraud
- **Scam Categories**: Detailed information on romance scams, marketplace fraud, parcel scams, and more

## Project Structure

```
/
├── index.html               # Main HTML page
├── server.js                # Express server for API proxying
├── css/
│   └── styles.css           # All styling for the platform
├── js/
│   ├── app.js               # Core application logic
│   ├── chad.js              # Chad AI chatbot implementation
│   ├── api.js               # OpenAI API integration
│   └── dashboard.js         # Analytics and visualizations
├── assets/                  # Images, icons, and other static files
├── .env.example             # Template for API configuration
├── package.json             # Project dependencies
├── Dockerfile               # Container configuration
├── nginx.conf               # Nginx web server configuration
└── README.md                # This file
```

## Setup Instructions

### Local Development

1. Clone this repository
   ```
   git clone https://github.com/k3ss-official/chadcan-help.git
   cd chadcan-help
   ```

2. Copy .env.example to .env and add your OpenAI API key
   ```
   cp .env.example .env
   # Edit .env with your API key
   ```

3. Install dependencies
   ```
   npm install
   ```

4. Start the development server
   ```
   npm run dev
   ```

5. Visit http://localhost:3000 in your browser

### Production Deployment

#### Using Docker

1. Build the Docker image
   ```
   docker build -t chadcan-help .
   ```

2. Run the container
   ```
   docker run -p 80:80 -e OPENAI_API_KEY=your_api_key chadcan-help
   ```

#### Deploying to Hetzner

1. Create a new Hetzner Cloud server with Docker installed

2. SSH into your server
   ```
   ssh root@your_server_ip
   ```

3. Clone the repository
   ```
   git clone https://github.com/k3ss-official/chadcan-help.git
   ```

4. Set up environment variables
   ```
   cd chadcan-help
   cp .env.example .env
   nano .env  # Add your API keys
   ```

5. Deploy using Docker Compose
   ```
   docker-compose up -d
   ```

6. Configure domain and SSL with Nginx/Certbot

## Technical Details

The platform uses:
- **GPT-4o** for AI-powered scam detection
- **Express.js** for the backend API proxy
- **Session-only data processing** for GDPR compliance
- **Chart.js** for data visualization
- **LeafletJS** for interactive maps
- **Vanilla JavaScript** for frontend (no framework dependencies)

## Legal Compliance

- Session-only processing under GDPR Article 6(1)(f) legitimate interest
- User consent required via click-through agreement
- No permanent storage of conversation data
- PDF reports are only stored if user requests email

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

All Rights Reserved - ChadCan.Help Team

## Contact

For support or inquiries, contact help@chadcan.help
