import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables FIRST, before any other imports
// Explicitly load from backend directory
dotenv.config({ path: join(__dirname, '.env') });

// Log loaded environment variables (without exposing keys)
console.log('Environment variables loaded:');
console.log('- AI_PROVIDER:', process.env.AI_PROVIDER || 'not set (defaults to openai)');
console.log('- PORT:', process.env.PORT || '5000');
console.log('- Has AI_API_KEY:', !!process.env.AI_API_KEY);
console.log('- Has OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY);

import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Yuva API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Yuva backend server running on port ${PORT}`);
});

