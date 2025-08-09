const app = require('../../app');

app.set('trust proxy', 1);

module.exports = (req, res) => {
  // Ensure the Express app sees the /api prefix
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : `/${req.url}`);
  }

  // If this function is hit directly at /api/auth/owner-register, req.url will be '/api/auth/owner-register'
  return app(req, res);
};
