# Getting Started with ChadCan.Help

This guide will help you get the ChadCan.Help platform up and running quickly.

## Prerequisites

- Node.js 16+ (for server functionality)
- OpenAI API key for GPT-4o
- Docker (optional, for containerized deployment)

## Quick Start

1. **Set up your environment**

   Copy the `.env.example` file to `.env`:
   ```
   cp .env.example .env
   ```

   Add your OpenAI API key to the `.env` file:
   ```
   OPENAI_API_KEY=your_key_here
   ```

2. **Install dependencies**

   ```
   npm install
   ```

3. **Start the server**

   ```
   npm start
   ```

4. **Access the application**

   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Docker Deployment

For production environments, we recommend using Docker:

```
docker-compose up -d
```

This will set up the application with proper Nginx configuration.

## Key Components

- **Chad AI Chatbot**: The core of the platform, powered by GPT-4o
- **Scam Database**: Structured information about known scams
- **Analytics Dashboard**: Visual representation of scam activity

## Testing

Run the test suite with:

```
npm test
```

## Customization

- Modify the system prompt in `js/api.js` to adjust Chad's behavior
- Update scam information in `js/scam-database.json`
- Customize styling in `css/styles.css`

For more detailed information, see the full [README.md](README.md).
