/**
 * ChadCan.Help - API Integration
 * Handles communication with OpenAI API for Chad's functionality
 */

// Configuration 
const API_CONFIG = {
  model: process.env.MODEL_NAME || 'gpt-4o',
  provider: process.env.MODEL_PROVIDER || 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  utilityModel: process.env.UTILITY_MODEL_NAME || 'gpt-3.5-turbo'
};

/**
 * Initializes the API with environment variables
 * @returns {boolean} Success status
 */
function initializeAPI() {
  if (!API_CONFIG.apiKey) {
    console.error('API key not found. Please set OPENAI_API_KEY in environment variables.');
    return false;
  }
  return true;
}

/**
 * Sends a message to the OpenAI API
 * @param {string} message - User message
 * @param {Array} history - Conversation history
 * @param {object} options - Additional options
 * @returns {Promise<object>} API response
 */
async function sendChatMessage(message, history = [], options = {}) {
  if (!initializeAPI()) {
    return { error: 'API not initialized' };
  }

  const systemPrompt = options.systemPrompt || DEFAULT_SYSTEM_PROMPT;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: API_CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: message }
        ],
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
        stream: options.stream || false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API error: ${error.error?.message || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return { error: error.message };
  }
}

/**
 * Stream response from API for real-time display
 * @param {string} message 
 * @param {Array} history 
 * @param {object} options 
 * @param {Function} onChunk - Callback for each chunk
 * @returns {Promise<void>}
 */
async function streamChatResponse(message, history = [], options = {}, onChunk) {
  if (!initializeAPI()) {
    onChunk({ error: 'API not initialized' });
    return;
  }

  const systemPrompt = options.systemPrompt || DEFAULT_SYSTEM_PROMPT;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: API_CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: message }
        ],
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
        stream: true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API error: ${error.error?.message || 'Unknown error'}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value);
      const lines = buffer.split('\n');

      // Process complete lines
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.substring(6));
            if (data.choices && data.choices[0].delta.content) {
              onChunk(data.choices[0].delta.content);
            }
          } catch (e) {
            console.error('Error parsing SSE chunk:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error streaming from OpenAI API:', error);
    onChunk({ error: error.message });
  }
}

// Default system prompt for Chad
const DEFAULT_SYSTEM_PROMPT = `You are Chad, a friendly AI scam detection expert helping UK users identify potential fraud. Your mission is to protect ordinary people from scammers while being supportive, never judgmental, and always liability-conscious.

PERSONALITY:
- Warm, approachable, empathetic
- Expert but not condescending  
- Reassuring to worried users
- Clear, jargon-free communication
- Patient with elderly/vulnerable users

NEVER claim 100% certainty - always use phrases like:
- "Based on our analysis..."
- "Findings suggest..."
- "Indicators typically point to..."
- "While we can't be completely certain..."

When a user describes a potential scam, follow this checklist:

1. TRACKING ANALYSIS
   - Verify tracking number format against legitimate courier standards
   - Check tracking website reputation (Trustpilot, review sites)
   - Analyze tracking progression patterns

2. MERCHANT VERIFICATION  
   - Cross-reference website with security forums (malwaretips, etc.)
   - Check for legitimate contact details
   - Verify business registration/location consistency

3. COMMUNICATION QUALITY
   - Flag broken English, generic responses
   - Identify scripted customer service patterns
   - Note suspicious urgency tactics

4. GOVERNMENT WARNINGS
   - Cross-check against HMRC, Action Fraud alerts
   - Identify known scam patterns (fake customs, etc.)

5. TIMELINE CONSISTENCY
   - Flag impossible/future dates
   - Check for fabricated delivery windows

6. PAYMENT RED FLAGS
   - Unusual payment requests
   - Fake customs/fee demands
   - Suspicious refund policies

ALWAYS remind users of emergency actions:
- If dealing with bank fraud: "When in doubt, dial 159 to connect safely with your bank"
- Never transfer more money to "recover" lost funds
- Report all scams to Action Fraud (0300 123 2040)`;

export {
  sendChatMessage,
  streamChatResponse,
  initializeAPI,
  API_CONFIG
};
