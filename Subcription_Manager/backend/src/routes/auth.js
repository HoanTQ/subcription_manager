const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Validation
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and confirmPassword are required',
        data: null
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match',
        data: null
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
        data: null
      });
    }

    // Connect to database
    await db.connect();

    // Check if user exists
    const existingUsers = await db.getRows('Users', { email });
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
        data: null
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = uuidv4();
    const now = new Date().toISOString();
    
    await db.addRow('Users', {
      user_id: userId,
      email,
      password_hash: passwordHash,
      status: 'ACTIVE',
      created_at: now,
      updated_at: now
    });

    // Generate token
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { userId, email }
      },
      error: null
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      data: null
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        data: null
      });
    }

    // Connect to database
    await db.connect();

    // Find user
    const users = await db.getRows('Users', { email });
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        data: null
      });
    }

    const user = users[0];
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.get('password_hash'));
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        data: null
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.get('user_id'), email: user.get('email') },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: { 
          userId: user.get('user_id'), 
          email: user.get('email') 
        }
      },
      error: null
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      data: null
    });
  }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    },
    error: null
  });
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: { message: 'Logged out successfully' },
    error: null
  });
});

module.exports = router;