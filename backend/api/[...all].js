// Vercel serverless function wrapper for the Express app
// Routes will be available under /api/*

const app = require('../app');

// Trust Vercel proxy (needed for correct protocol/host and some middlewares)
app.set('trust proxy', 1);

module.exports = (req, res) => {
  // Handle CORS preflight at the edge of the serverless function
  if (req.method === 'OPTIONS') {
    try {
      const rawOrigins = process.env.FRONTEND_ORIGIN || '';
      const allowed = rawOrigins
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);
      const getHost = (url) => {
        try { return new URL(url).hostname; } catch { return url.replace(/^https?:\/\//, '').replace(/\/$/, ''); }
      };
      const origin = req.headers.origin || '';
      const ok = !allowed.length || (origin && allowed.map(getHost).includes(getHost(origin)));
      if (ok && origin) {
        res.setHeader('Access-Control-Allow-Origin', origin.replace(/\/$/, ''));
      }
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Pragma, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version');
      return res.status(204).end();
    } catch (_) {
      // Fallthrough to app on any unexpected error
    }
  }

  // Vercel mounts this function at /api/* and strips the "/api" prefix from req.url.
  // Our Express app mounts routes at '/api/*', so we need to re-add the prefix here.
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : `/${req.url}`);
  }
  return app(req, res);
};
