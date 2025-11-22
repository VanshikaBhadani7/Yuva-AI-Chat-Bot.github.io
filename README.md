# Nexora - AI Chat Assistant

A fully functional ChatGPT-like AI chat application built with React and Node.js, supporting multiple AI providers including Groq, OpenAI, and more.

## Features

- 🤖 **AI-Powered Conversations**: Chat with multiple AI models (Groq, OpenAI, etc.)
- 💬 **Real-time Chat Interface**: Beautiful, responsive chat UI with message history
- ⚡ **Streaming Responses**: See AI responses appear in real-time as they're generated
- 🎨 **Modern UI/UX**: Sleek design with smooth animations and transitions
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🔄 **Conversation Management**: Create new chats and manage conversation history
- 🚀 **Fast & Efficient**: Optimized performance with React hooks and state management

## AI Providers Supported

### 🟢 Groq (Recommended - Fast & Free!)
- **Why**: Very fast responses, generous free tier
- **Get API Key**: https://console.groq.com/
- **Free Tier**: Yes, with rate limits

### ⚪ OpenAI
- **Why**: High quality responses, widely used
- **Get API Key**: https://platform.openai.com/api-keys
- **Free Tier**: Limited, requires billing

### 🔵 Other Providers
- Can be easily added (Anthropic Claude, Hugging Face, etc.)

## Project Structure

```
voiceRecogAi/
├── frontend/               (React app)
│   ├── src/
│   │   ├── App.jsx         # Main app component
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx   # Chat message display
│   │   │   ├── Message.jsx      # Individual message component
│   │   │   └── PromptInput.jsx  # Message input component
│   │   └── api/
│   │       └── chat.js     # API service functions
│   └── package.json
│
└── backend/               (Node.js server)
    ├── server.js          # Express server setup
    ├── routes/
    │   └── chat.js        # Chat API routes
    ├── .env               # Environment variables (create this)
    └── package.json
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- AI Provider API Key (Groq recommended for free tier)

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory (see `backend/ENV_SETUP.md` for details):

**For Groq (Recommended - Free):**
```env
AI_PROVIDER=groq
AI_API_KEY=your_groq_api_key_here
PORT=5000
```

**Get Groq API Key:**
- Visit: https://console.groq.com/
- Sign up (free)
- Go to API Keys → Create API Key
- Copy and paste in `.env`

**For OpenAI:**
```env
AI_PROVIDER=openai
AI_API_KEY=your_openai_api_key_here
PORT=5000
```

4. Start the backend server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### 2. Frontend Setup

1. Navigate to the project root (if not already there):
```bash
cd ..
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Create a `.env` file in the root directory (optional, defaults to localhost:5000):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is taken)

### 3. Build for Production

**Frontend:**
```bash
npm run build
```

**Backend:**
The backend is already production-ready. Just use:
```bash
npm start
```

## Usage

1. Start the backend server first (port 5000)
2. Start the frontend development server (usually port 5173)
3. Open your browser and navigate to the frontend URL
4. Start chatting with Nexora!

## API Endpoints

### POST `/api/chat`
Send a message to the AI (streaming response)
- **Body**: `{ message: string, conversationId?: string }`
- **Response**: Server-Sent Events (SSE) stream

### POST `/api/chat/new`
Create a new conversation
- **Response**: `{ conversationId: string }`

### DELETE `/api/chat/:conversationId`
Clear a conversation's history
- **Response**: `{ message: string }`

### GET `/api/chat/provider`
Get current AI provider information
- **Response**: `{ provider: string, model: string, hasApiKey: boolean }`

### GET `/api/health`
Health check endpoint
- **Response**: `{ status: string, message: string }`

## Environment Variables

### Backend (.env)
- `AI_PROVIDER`: AI provider to use (`groq`, `openai`, etc.) - Default: `openai`
- `AI_API_KEY`: API key for the selected provider (can also use `OPENAI_API_KEY` for backwards compatibility)
- `PORT`: Server port (default: 5000)

### Frontend (.env)
- `VITE_API_URL`: Backend API URL (default: http://localhost:5000/api)

## Troubleshooting

### Backend won't start
- Make sure port 5000 is not already in use
- Check that all dependencies are installed: `npm install` in the backend directory
- Verify your `.env` file exists and has the correct `AI_API_KEY` or `OPENAI_API_KEY`

### Frontend can't connect to backend
- Ensure the backend server is running on port 5000
- Check that `VITE_API_URL` in your frontend `.env` matches your backend URL
- Verify CORS is enabled in the backend (it should be by default)

### API Errors

**Quota Exceeded (429):**
- If using OpenAI: Add credits at https://platform.openai.com/account/billing
- If using Groq: Check rate limits at https://console.groq.com/
- Consider switching to Groq for a free alternative

**Invalid API Key (401):**
- Verify your API key is correct
- Make sure it's set in the `.env` file
- Check that the API key hasn't expired

### Which AI Provider to Choose?

**Choose Groq if:**
- ✅ You want a free option
- ✅ You want very fast responses
- ✅ You're building a demo or personal project

**Choose OpenAI if:**
- ✅ You need the highest quality responses
- ✅ You have budget for API costs
- ✅ You need GPT-4 capabilities

## Development

### Running both servers simultaneously

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues and enhancement requests!

---

**Note**: Make sure to keep your API keys secure and never commit them to version control. The `.env` file should be in your `.gitignore`.

**Tip**: Start with Groq for a free, fast alternative to OpenAI!
