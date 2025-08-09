// Vercel serverless function wrapper for the Express app
// Routes will be available under /api/*

const app = require('../app');

// Trust Vercel proxy (needed for correct protocol/host and some middlewares)
app.set('trust proxy', 1);

module.exports = (req, res) => {
  // Vercel mounts this function at /api/* and strips the "/api" prefix from req.url.
  // Our Express app mounts routes at '/api/*', so we need to re-add the prefix here.
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : `/${req.url}`);
  }
  return app(req, res);
};
