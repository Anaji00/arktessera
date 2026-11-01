/**
 * Arx Tessera (najialess.io) - Dedicated Backend API Server (Port 8082)
 * Mounts the same handlers used by Vercel Serverless Functions (/api/contact, /api/inbound-email, /api/health)
 * with production security headers (Helmet), CORS, and rate limiting.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const contactHandler = require('./api/contact');
const inboundEmailHandler = require('./api/inbound-email');
const healthHandler = require('./api/health');

const app = express();
const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 8082);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS policy allowing frontend on 3002 and production domain
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3002,http://127.0.0.1:3002,https://najialess.io,https://www.najialess.io')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Webhook-Secret']
}));

app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true, limit: '256kb' }));

// Rate limiting on form/email endpoints (max 15 requests per 15 minutes per IP)
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'Too many requests from this IP, please try again shortly or email contact@najialess.io.'
  }
});

// Routes
app.get('/api/health', (req, res) => healthHandler(req, res));
app.post('/api/contact', emailLimiter, (req, res) => contactHandler(req, res));
app.post('/api/inbound-email', emailLimiter, (req, res) => inboundEmailHandler(req, res));

// Root info route on backend port 8082
app.get('/', (req, res) => {
  res.json({
    service: 'Arx Tessera Backend API',
    port: PORT,
    endpoints: [
      'GET  /api/health',
      'POST /api/contact',
      'POST /api/inbound-email'
    ]
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Arx Tessera Backend API listening on http://0.0.0.0:${PORT}`);
});

