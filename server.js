/**
 * ChadCan.Help - Simple Express Server
 * For development and testing purposes
 */

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Middleware for parsing JSON
app.use(express.json());

// API proxy route for OpenAI (to avoid exposing API key in frontend)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, options } = req.body;

    // Validate input
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Forward to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.MODEL_NAME || 'gpt-4o',
        messages: [
          { role: 'system', content: options?.systemPrompt || '' },
          ...(history || []).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: message }
        ],
        max_tokens: options?.maxTokens || 500,
        temperature: options?.temperature || 0.7,
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error proxying to OpenAI:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle streaming requests
app.post('/api/chat/stream', async (req, res) => {
  try {
    const { message, history, options } = req.body;

    // Validate input
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Forward to OpenAI with streaming
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.MODEL_NAME || 'gpt-4o',
        messages: [
          { role: 'system', content: options?.systemPrompt || '' },
          ...(history || []).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: message }
        ],
        max_tokens: options?.maxTokens || 500,
        temperature: options?.temperature || 0.7,
        stream: true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API error: ${error.error?.message || 'Unknown error'}`);
    }

    // Forward the stream to the client
    const reader = response.body.getReader();

    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        res.write(`data: ${Buffer.from(value).toString()}\n\n`);
      }
      res.end();
    };

    pump().catch(err => {
      console.error('Error streaming response:', err);
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    });
  } catch (error) {
    console.error('Error setting up stream to OpenAI:', error);
    res.status(500).json({ error: error.message });
  }
});

// Catch-all handler for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
