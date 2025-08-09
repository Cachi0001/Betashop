require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet());
app.use(cors());

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

app.get('/', (req, res) => {
  res.send('E-commerce Backend API is running!');
});

app.use(require('./src/middleware/error.middleware'));

module.exports = app;

