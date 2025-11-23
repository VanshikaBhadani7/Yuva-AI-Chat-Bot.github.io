/* eslint-disable no-undef */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables FIRST, before any other imports
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
// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 5000;

// CORS - Secure and flexible for both local dev and deployment
const allowedOrigins = [
  'http://localhost:5173',                      // for local dev
  'http://localhost:3000',                      // (optional for create-react-app users)
  'https://vanshikabhadani7.github.io',         // your GitHub Pages domain (adjust if different)
];
// Set up CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // recommended if you use cookies/sessions
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
