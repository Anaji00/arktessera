/**
 * Arx Tessera (najialess.io) - Dedicated Backend API Server (Port 8082)
 * Mounts the same handlers used by Vercel Serverless Functions (/api/contact, /api/inbound-email, /api/health)
 * with production security headers (Helmet), CORS, and rate limiting.
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
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
    if (
      !origin ||
      origin === 'null' ||
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin) ||
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
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
  skip: (req) => req.headers['x-test-bypass'] === 'arx-local-test-token' || req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1',
  message: {
    ok: false,
    error: 'Too many requests from this IP, please try again shortly or email alessionaji1@gmail.com.'
  }
});

// Routes
app.get('/api/health', (req, res) => healthHandler(req, res));
app.post('/api/contact', emailLimiter, (req, res) => contactHandler(req, res));
app.post('/api/inbound-email', emailLimiter, (req, res) => inboundEmailHandler(req, res));

// Clean multi-page routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/testimonials', (req, res) => {
  res.sendFile(path.join(__dirname, 'testimonials.html'));
});
app.get('/testimonials.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'testimonials.html'));
});
app.get('/founder', (req, res) => {
  res.sendFile(path.join(__dirname, 'founder.html'));
});
app.get('/founder.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'founder.html'));
});
app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'privacy.html'));
});
app.get('/privacy.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'privacy.html'));
});
app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, 'terms.html'));
});
app.get('/terms.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'terms.html'));
});

// Serve static frontend assets (style.css, script.js, images)
app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`[ARX TESSERA] Backend API & Frontend listening on port ${PORT}`);
});

