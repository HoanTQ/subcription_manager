const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const subscriptionRoutes = require('./routes/subscriptions');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://gen-lang-client-0012236274.web.app',
  'https://gen-lang-client-0012236274.firebaseapp.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all origins for now to debug
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// API Info endpoint
app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    message: 'Subscription Manager API v1',
    data: {
      version: '1.0.0',
      endpoints: {
        auth: {
          'POST /api/v1/auth/login': 'User login',
          'POST /api/v1/auth/register': 'User registration',
          'GET /api/v1/auth/me': 'Get current user'
        },
        accounts: {
          'GET /api/v1/accounts': 'List accounts',
          'POST /api/v1/accounts': 'Create account',
          'GET /api/v1/accounts/:id': 'Get account',
          'PUT /api/v1/accounts/:id': 'Update account',
          'DELETE /api/v1/accounts/:id': 'Delete account'
        },
        subscriptions: {
          'GET /api/v1/subscriptions': 'List subscriptions',
          'POST /api/v1/subscriptions': 'Create subscription',
          'GET /api/v1/subscriptions/:id': 'Get subscription',
          'PUT /api/v1/subscriptions/:id': 'Update subscription',
          'DELETE /api/v1/subscriptions/:id': 'Delete subscription'
        },
        dashboard: {
          'GET /api/v1/dashboard/stats': 'Dashboard statistics',
          'GET /api/v1/dashboard/upcoming': 'Upcoming payments'
        }
      },
      health: '/health'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    data: null
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    data: null
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});