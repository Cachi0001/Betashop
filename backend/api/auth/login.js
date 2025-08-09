const app = require('../../app');

app.set('trust proxy', 1);

module.exports = (req, res) => {
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : `/${req.url}`);
  }
  return app(req, res);
};
