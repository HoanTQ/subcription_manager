const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/encryption');

const router = express.Router();

// Get all accounts
router.get('/', authenticateToken, async (req, res) => {
  try {
    await db.connect();
    
    const { search, category, page = 1, pageSize = 50 } = req.query;
    
    let accounts = await db.getRows('Accounts', { 
      user_id: req.user.userId,
      is_deleted: 'FALSE'
    });

    // Filter by search
    if (search) {
      accounts = accounts.filter(account => 
        account.get('service_name').toLowerCase().includes(search.toLowerCase()) ||
        account.get('login_id').toLowerCase().includes(search.toLowerCase()) ||
        (account.get('notes') || '').toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by category
    if (category) {
      accounts = accounts.filter(account => 
        account.get('category_id') === category
      );
    }

    // Pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + parseInt(pageSize);
    const paginatedAccounts = accounts.slice(startIndex, endIndex);

    const result = paginatedAccounts.map(account => ({
      accountId: account.get('account_id'),
      serviceName: account.get('service_name'),
      loginId: account.get('login_id'),
      url: account.get('url'),
      categoryId: account.get('category_id'),
      tags: account.get('tags'),
      notes: account.get('notes'),
      createdAt: account.get('created_at'),
      updatedAt: account.get('updated_at')
    }));

    res.json({
      success: true,
      data: {
        accounts: result,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total: accounts.length,
          totalPages: Math.ceil(accounts.length / pageSize)
        }
      },
      error: null
    });

  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch accounts',
      data: null
    });
  }
});

// Create account
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { serviceName, loginId, password, url, categoryId, tags, notes, twoFAInfo } = req.body;

    if (!serviceName || !loginId || !password) {
      return res.status(400).json({
        success: false,
        error: 'Service name, login ID, and password are required',
        data: null
      });
    }

    await db.connect();

    // Encrypt password
    const encryptedPassword = encrypt(password);
    
    const accountId = uuidv4();
    const now = new Date().toISOString();

    await db.addRow('Accounts', {
      account_id: accountId,
      user_id: req.user.userId,
      service_name: serviceName,
      login_id: loginId,
      password_ciphertext: encryptedPassword.ciphertext,
      password_iv: encryptedPassword.iv,
      password_tag: encryptedPassword.tag,
      url: url || '',
      category_id: categoryId || '',
      tags: tags || '',
      notes: notes || '',
      is_deleted: 'FALSE',
      created_at: now,
      updated_at: now
    });

    res.status(201).json({
      success: true,
      data: {
        accountId,
        serviceName,
        loginId,
        url,
        categoryId,
        tags,
        notes,
        createdAt: now
      },
      error: null
    });

  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create account',
      data: null
    });
  }
});

// Get account by ID
router.get('/:accountId', authenticateToken, async (req, res) => {
  try {
    await db.connect();
    
    const accounts = await db.getRows('Accounts', {
      account_id: req.params.accountId,
      user_id: req.user.userId,
      is_deleted: 'FALSE'
    });

    if (accounts.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Account not found',
        data: null
      });
    }

    const account = accounts[0];
    
    res.json({
      success: true,
      data: {
        accountId: account.get('account_id'),
        serviceName: account.get('service_name'),
        loginId: account.get('login_id'),
        url: account.get('url'),
        categoryId: account.get('category_id'),
        tags: account.get('tags'),
        notes: account.get('notes'),
        createdAt: account.get('created_at'),
        updatedAt: account.get('updated_at')
      },
      error: null
    });

  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch account',
      data: null
    });
  }
});

// Reveal password
router.post('/:accountId/reveal-password', authenticateToken, async (req, res) => {
  try {
    await db.connect();
    
    const accounts = await db.getRows('Accounts', {
      account_id: req.params.accountId,
      user_id: req.user.userId,
      is_deleted: 'FALSE'
    });

    if (accounts.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Account not found',
        data: null
      });
    }

    const account = accounts[0];
    
    // Decrypt password
    const decryptedPassword = decrypt(
      account.get('password_ciphertext'),
      account.get('password_iv'),
      account.get('password_tag')
    );

    if (!decryptedPassword) {
      return res.status(500).json({
        success: false,
        error: 'Failed to decrypt password',
        data: null
      });
    }

    res.json({
      success: true,
      data: {
        password: decryptedPassword
      },
      error: null
    });

  } catch (error) {
    console.error('Reveal password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reveal password',
      data: null
    });
  }
});

// Update account
router.put('/:accountId', authenticateToken, async (req, res) => {
  try {
    const { serviceName, loginId, password, url, categoryId, tags, notes } = req.body;

    await db.connect();

    const updates = {
      updated_at: new Date().toISOString()
    };

    if (serviceName) updates.service_name = serviceName;
    if (loginId) updates.login_id = loginId;
    if (url !== undefined) updates.url = url;
    if (categoryId !== undefined) updates.category_id = categoryId;
    if (tags !== undefined) updates.tags = tags;
    if (notes !== undefined) updates.notes = notes;

    // If password is being updated, encrypt it
    if (password) {
      const encryptedPassword = encrypt(password);
      updates.password_ciphertext = encryptedPassword.ciphertext;
      updates.password_iv = encryptedPassword.iv;
      updates.password_tag = encryptedPassword.tag;
    }

    const updatedRow = await db.updateRow('Accounts', {
      account_id: req.params.accountId,
      user_id: req.user.userId,
      is_deleted: 'FALSE'
    }, updates);

    if (!updatedRow) {
      return res.status(404).json({
        success: false,
        error: 'Account not found',
        data: null
      });
    }

    res.json({
      success: true,
      data: {
        accountId: req.params.accountId,
        message: 'Account updated successfully'
      },
      error: null
    });

  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update account',
      data: null
    });
  }
});

// Delete account (soft delete)
router.delete('/:accountId', authenticateToken, async (req, res) => {
  try {
    await db.connect();

    const updatedRow = await db.updateRow('Accounts', {
      account_id: req.params.accountId,
      user_id: req.user.userId,
      is_deleted: 'FALSE'
    }, {
      is_deleted: 'TRUE',
      updated_at: new Date().toISOString()
    });

    if (!updatedRow) {
      return res.status(404).json({
        success: false,
        error: 'Account not found',
        data: null
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Account deleted successfully'
      },
      error: null
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account',
      data: null
    });
  }
});

module.exports = router;