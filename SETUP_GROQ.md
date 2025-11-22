# Quick Setup Guide: Using Groq (Free & Fast!)

## Why Groq?
- ✅ **100% FREE** with generous rate limits
- ✅ **VERY FAST** responses (faster than OpenAI)
- ✅ **No credit card required**
- ✅ **Easy setup** (just like OpenAI)

## Step 1: Get Your Free Groq API Key

1. Visit: **https://console.groq.com/**
2. Click **"Sign Up"** or **"Sign In"**
3. Once logged in, go to **"API Keys"** in the sidebar
4. Click **"Create API Key"**
5. Copy your API key (it starts with `gsk_...`)

## Step 2: Update Your Backend .env File

Open `backend/.env` and update it to:

```env
AI_PROVIDER=groq
AI_API_KEY=gsk_your_groq_api_key_here
PORT=5000
```

**Replace `gsk_your_groq_api_key_here` with your actual Groq API key!**

## Step 3: Restart Your Backend Server

1. Stop your current backend server (Ctrl+C)
2. Start it again:
   ```bash
   cd backend
   npm start
   ```

You should see: `Initialized AI client with provider: groq`

## Step 4: Test It!

1. Open your frontend (usually http://localhost:5173)
2. Send a message to Nexora
3. Enjoy fast, free AI responses! 🎉

## Troubleshooting

**If you get "API key not set" error:**
- Make sure `AI_API_KEY` is in your `.env` file
- Make sure you copied the entire API key (starts with `gsk_`)
- Restart the backend server after updating `.env`

**If you get rate limit errors:**
- Groq has generous free limits, but if you hit them, wait a few minutes
- Check your usage at https://console.groq.com/

## Switch Back to OpenAI Anytime

Just change your `.env` to:
```env
AI_PROVIDER=openai
AI_API_KEY=your_openai_key_here
PORT=5000
```

And restart the server!

---

**That's it! Groq is free, fast, and works great with Nexora! 🚀**

