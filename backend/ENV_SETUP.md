# Backend Environment Setup

## Step 1: Create .env file

Create a file named `.env` in the `backend` directory with the following content:

### Option 1: Using Groq (Recommended - Fast & Free)

```env
AI_PROVIDER=groq
AI_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
PORT=5000
```

**Available Groq Models:**
- `llama-3.3-70b-versatile` (recommended - best quality, default)
- `llama-3.1-8b-instant` (faster, smaller)
- `mixtral-8x7b-32768` (alternative)

**Get Groq API Key (FREE):**
1. Go to https://console.groq.com/
2. Sign up for free
3. Go to API Keys section
4. Create a new API key
5. Copy and paste it in the `.env` file

### Option 2: Using OpenAI

```env
AI_PROVIDER=openai
AI_API_KEY=your_openai_api_key_here
# OR use the old variable name:
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
```

**Get OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Create a new API key
4. Copy the key and paste it in the `.env` file

### Other Options:

You can also use:
- `AI_PROVIDER=openai` with OpenAI API key
- Other providers can be added later

## Step 2: Install Dependencies

```bash
cd backend
npm install
```

## Step 3: Start the Server

```bash
npm start
```

For development (with auto-reload):
```bash
npm run dev
```

The server will start on port 5000 (or the port specified in your .env file).

## Notes

- **Groq is recommended** because it's fast and has a generous free tier
- The API key variable name can be either `AI_API_KEY` or `OPENAI_API_KEY` (for backwards compatibility)
- Make sure your API key is correct and has available credits/quota
