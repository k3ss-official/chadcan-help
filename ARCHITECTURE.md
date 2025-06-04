# ChadCan.Help Architecture

## Overview

ChadCan.Help is built with a modern but simple architecture focused on:
- Privacy and GDPR compliance
- Real-time AI-powered analysis
- Clear user experience
- Deployment flexibility

## High-Level Architecture

```
                    +----------------+
                    |                |
                    |  Web Browser   |
                    |                |
                    +-------+--------+
                            |
                            | HTTP
                            |
           +----------------v-----------------+
           |                                  |
           |  Express.js Server (server.js)   |
           |                                  |
           +--+------------+---------------+--+
              |            |               |
              |            |               |
+-------------v--+ +-------v-------+ +-----v------+
|                | |               | |            |
| Static Content | |  AI API Proxy | |  Analytics |
|                | |               | |            |
+----------------+ +-------+-------+ +------------+
                            |
                   +--------v--------+
                   |                 |
                   |   OpenAI API    |
                   |                 |
                   +-----------------+
```

## Key Components

### Frontend
- Pure vanilla JavaScript (no frameworks)
- Modular component design
- Responsive CSS for all device sizes

### Backend
- Express.js server
- API proxy to protect OpenAI credentials
- Session-only data processing
- No database for privacy (optional integration possible)

### AI Integration
- OpenAI GPT-4o for scam detection
- System prompts for specialized knowledge
- Real-time streaming responses

### Data Flow
1. User enters potential scam information
2. Frontend sends request to Express server
3. Server proxies request to OpenAI with proper authentication
4. AI analyzes using specialized scam detection knowledge
5. Responses streamed back to user in real-time
6. Session data deleted when conversation ends

### Security Considerations
- No persistent storage of conversation data
- API keys stored server-side only
- HTTPS for all communications
- Content Security Policy implementation
- GDPR-compliant processing

## Deployment Architecture

### Docker Deployment
- Nginx container for serving static files
- Express.js container for API proxy
- Docker Compose for orchestration

### Static Deployment
- Can be deployed as static files on any web server
- API calls made directly to your backend

## Extensibility

The architecture allows for future expansion:
- Database integration for anonymous statistics
- Additional AI models for specialized analysis
- Admin dashboard for monitoring
- Mobile app integration via the same API

## Technology Stack

- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js, Express.js
- Visualization: Chart.js, LeafletJS
- Deployment: Docker, Nginx
- AI: OpenAI GPT-4o
