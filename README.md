# ChadCan.Help

A lightweight landing page with a free chat feature triggered from Facebook CTA.

## Project Overview

ChadCan.Help is a web application that provides a landing page with a Messenger-style chat popout window. The application allows visitors to chat with an AI assistant for up to 15 minutes per session.

## Features

- Responsive landing page with TailwindCSS styling
- Messenger-style chat popout window (separate window, not iframe)
- Speech bubbles and typing indicator for a Messenger-like feel
- 15-minute maximum chat session per visitor
- Real-time chat messaging using WebSocket
- Integration with OpenAI Chat Completions API

## Repository Structure

- `frontend/` - Frontend code with HTML, CSS, and TypeScript
- `backend/` - Flask server with WebSocket support and OpenAI integration
- `deployment_guide.md` - Comprehensive guide for setting up and deploying the application
- `deploy.sh` - Deployment script for automating the deployment process

## Setup and Installation

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the frontend:
   ```bash
   npm run build
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

5. Update the `.env` file with your OpenAI API key and other settings.

## Running the Application Locally

1. Start the backend server:
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python app.py
   ```

2. Open the frontend in a web browser:
   ```
   file:///path/to/frontend/dist/index.html
   ```

## Deployment

For detailed deployment instructions, please refer to the `deployment_guide.md` file. The guide covers:

1. Setting up a Cloud VM (Lightsail or DigitalOcean)
2. Configuring SSL certificates
3. Deploying the frontend and backend
4. Testing the deployment

You can also use the provided `deploy.sh` script to automate the deployment process.

## Session Management

The application enforces a 15-minute maximum chat session per visitor using:
- Server-side session tracking
- Signed cookies
- IP+UserAgent hash for identification

## License

Private repository - All rights reserved.
