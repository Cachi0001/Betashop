// Vercel serverless function wrapper for the Express app
// Routes will be available under /api/*

const app = require('../app');

// Trust Vercel proxy (needed for correct protocol/host and some middlewares)
app.set('trust proxy', 1);

module.exports = (req, res) => {
  return app(req, res);
};
