require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet());
// Configure CORS to explicitly allow the frontend origin(s)
// FRONTEND_ORIGIN can be a single origin or comma-separated list
const rawOrigins = process.env.FRONTEND_ORIGIN || '';
const allowedOrigins = rawOrigins
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)
  // Normalize: remove trailing slashes
  .map(o => o.replace(/\/$/, ''));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser or same-origin requests (like curl, server-to-server)
    if (!origin) return callback(null, true);
    if (!allowedOrigins.length) return callback(null, true);

    // Extract hostnames for comparison (protocol-agnostic)
    const getHost = (url) => {
      try { return new URL(url).hostname; } catch { return url.replace(/^https?:\/\//, '').replace(/\/$/, ''); }
    };
    const requestHost = getHost(origin);
    const allowedHosts = allowedOrigins.map(getHost);
    const ok = allowedHosts.some(h => h === requestHost);

    if (!ok && process.env.NODE_ENV !== 'production') {
      console.warn('[CORS] Blocked origin:', origin, 'Allowed:', allowedOrigins);
    }
    return callback(ok ? null : new Error('CORS: Origin not allowed'), ok);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per 15 minutes per IP
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);

// Capture raw body for webhook signature verification (e.g., Paystack)
app.use(express.json({
  verify: (req, res, buf) => {
    try {
      req.rawBody = buf;
    } catch (e) {
      // no-op
    }
  }
}));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/owner-register', require('./src/routes/admin.routes'));
app.use('/api/products', require('./src/routes/products.routes'));
app.use('/api/categories', require('./src/routes/categories.routes'));
app.use('/api/orders', require('./src/routes/orders.routes'));
app.use('/api/payments', require('./src/routes/payments.routes'));
app.use('/api/whatsapp', require('./src/routes/whatsapp.routes'));
app.use('/api/upload', require('./src/routes/upload.routes'));
app.use('/api/admin', require('./src/routes/admin-earnings.routes'));

// Health endpoints that work on Vercel (function wraps requests to start with /api)
app.get('/api', (req, res) => {
  res.send('E-commerce Backend API is running!');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Debug: list all routes (temporary helper)
app.get('/api/_routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Route middleware
      routes.push({ method: Object.keys(middleware.route.methods)[0].toUpperCase(), path: middleware.route.path });
    } else if (middleware.name === 'router' && middleware.handle.stack) {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods)
            .filter(Boolean)
            .map((m) => m.toUpperCase());
          methods.forEach((m) => routes.push({ method: m, path: handler.route.path, base: middleware.regexp?.toString() }));
        }
      });
    }
  });
  res.json({ routes });
});

app.get('/', (req, res) => {
  res.send('E-commerce Backend API is running!');
});

app.use(require('./src/middleware/error.middleware'));

module.exports = app;
