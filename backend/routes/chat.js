import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

// Store conversation history for each session (in production, use a database)
const conversations = new Map();

// AI Provider Configuration - Load lazily to ensure env vars are available
function getAIProvider() {
  return (process.env.AI_PROVIDER || 'openai').toLowerCase();
}

function getProviderAPIKey() {
  return process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
}

// Log configuration on first access
let configLogged = false;

// Lazy initialization of AI clients
let aiClient = null;

function getAIClient() {
  if (!aiClient) {
    const AI_PROVIDER = getAIProvider();
    const PROVIDER_API_KEY = getProviderAPIKey();
    
    if (!configLogged) {
      console.log('=== AI Provider Configuration ===');
      console.log('- AI_PROVIDER:', AI_PROVIDER);
      console.log('- Has AI_API_KEY:', !!process.env.AI_API_KEY);
      console.log('- Has OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY);
      console.log('- Has GROQ_API_KEY:', !!process.env.GROQ_API_KEY);
      console.log('- PROVIDER_API_KEY found:', !!PROVIDER_API_KEY);
      configLogged = true;
    }
    
    if (!PROVIDER_API_KEY) {
      const errorMsg = `AI_API_KEY environment variable is not set. Current provider: ${AI_PROVIDER}. Please check your backend/.env file.`;
      console.error('ERROR:', errorMsg);
      throw new Error(errorMsg);
    }
    
    switch (AI_PROVIDER) {
      case 'groq':
        // Groq uses OpenAI-compatible API
        console.log(`Initializing Groq client...`);
        aiClient = new OpenAI({
          apiKey: PROVIDER_API_KEY,
          baseURL: 'https://api.groq.com/openai/v1',
        });
        console.log(`✅ Initialized AI client with provider: Groq`);
        break;
      
      case 'openai':
      default:
        console.log(`Initializing OpenAI client...`);
        aiClient = new OpenAI({
          apiKey: PROVIDER_API_KEY,
        });
        console.log(`✅ Initialized AI client with provider: OpenAI`);
        break;
    }
  }
  return aiClient;
}

// Get model name based on provider
function getModelName() {
  const AI_PROVIDER = getAIProvider();
  switch (AI_PROVIDER) {
    case 'groq':
      // Updated to use currently supported models (as of 2024)
      // Options: 
      // - llama-3.3-70b-versatile (recommended - newest, best quality)
      // - llama-3.1-8b-instant (faster, smaller)
      // - mixtral-8x7b-32768 (alternative)
      return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'; // Latest supported model
    case 'openai':
    default:
      return 'gpt-3.5-turbo';
  }
}

// POST /api/chat - Streaming response
router.post('/', async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    const AI_PROVIDER = getAIProvider();
    console.log('Received chat request:', { message: message?.substring(0, 50), conversationId, provider: AI_PROVIDER });

    if (!message || typeof message !== 'string') {
      console.error('Invalid message received');
      return res.status(400).json({ 
        error: 'Message is required and must be a string',
        message: 'Message is required and must be a string'
      });
    }

    // Get or create conversation history
    let conversationHistory = conversations.get(conversationId) || [];
    
    // Add user message to history
    conversationHistory.push({
      role: 'user',
      content: message,
    });

    // Set up Server-Sent Events for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for nginx
    res.setHeader('Access-Control-Allow-Origin', '*'); // CORS for SSE

    // Call AI API with streaming
    const client = getAIClient();
    const modelName = getModelName();
    console.log(`Calling ${AI_PROVIDER} API with model: ${modelName}...`);
    
    const stream = await client.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: 'system',
          content: 'You are Yuva, a helpful and friendly AI assistant. Be concise, clear, and engaging. Keep responses brief and to the point unless more detail is requested.',
        },
        ...conversationHistory,
      ],
      temperature: 0.7,
      max_tokens: 500, // Optimized for faster responses
      stream: true, // Enable streaming
    });

    let fullResponse = '';
    let chunkCount = 0;
    
    // Stream the response
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        chunkCount++;
        fullResponse += content;
        // Send each chunk to the client
        res.write(`data: ${JSON.stringify({ content, done: false })}\n\n`);
      }
    }
    
    console.log(`Stream complete. Total chunks: ${chunkCount}, Response length: ${fullResponse.length}`);

    // Add AI response to history
    conversationHistory.push({
      role: 'assistant',
      content: fullResponse,
    });

    // Store updated conversation history
    conversations.set(conversationId, conversationHistory);

    // Send final message
    res.write(`data: ${JSON.stringify({ done: true, conversationId })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Error in chat route:', error);
    console.error('Error stack:', error.stack);
    
    // Handle specific API errors
    let errorMessage = error.message || 'An error occurred';
    let statusCode = 500;
    
    if (error.status === 429) {
      errorMessage = '429 You exceeded your current quota, please check your plan and billing details. For more information on this error, read the docs: https://platform.openai.com/docs/guides/error-codes/api-errors.';
      statusCode = 429;
    } else if (error.status === 401) {
      errorMessage = `401 Invalid API key for ${AI_PROVIDER}. Please check your API key in the .env file.`;
      statusCode = 401;
    } else if (error.response) {
      // API error
      const apiError = error.response.data?.error;
      if (apiError) {
        errorMessage = `${apiError.code || error.status}: ${apiError.message || errorMessage}`;
        statusCode = error.response.status || 500;
      }
    }
    
    // If headers haven't been sent yet, send a regular JSON error
    if (!res.headersSent) {
      return res.status(statusCode).json({
        error: true,
        message: errorMessage,
        status: statusCode,
      });
    }
    
    // Otherwise, send error through SSE
    res.write(`data: ${JSON.stringify({ 
      error: true, 
      message: errorMessage,
      status: statusCode,
      done: true 
    })}\n\n`);
    res.end();
  }
});

// POST /api/chat/new - Create a new conversation
router.post('/new', (req, res) => {
  const conversationId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  conversations.set(conversationId, []);
  res.json({ conversationId });
});

// DELETE /api/chat/:conversationId - Clear conversation history
router.delete('/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  conversations.delete(conversationId);
  res.json({ message: 'Conversation cleared' });
});

// GET /api/chat/provider - Get current AI provider info
router.get('/provider', (req, res) => {
  const AI_PROVIDER = getAIProvider();
  const PROVIDER_API_KEY = getProviderAPIKey();
  res.json({
    provider: AI_PROVIDER,
    model: getModelName(),
    hasApiKey: !!PROVIDER_API_KEY,
  });
});

export default router;
