const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper function to calculate next due date
function calculateNextDueDate(startDate, cycle, cycleDays) {
  const start = new Date(startDate);
  let nextDue = new Date(start);

  switch (cycle) {
    case 'DAILY':
      nextDue.setDate(nextDue.getDate() + 1);
      break;
    case 'MONTHLY':
      nextDue.setMonth(nextDue.getMonth() + 1);
      break;
    case 'YEARLY':
      nextDue.setFullYear(nextDue.getFullYear() + 1);
      break;
    case 'CUSTOM_DAYS':
      nextDue.setDate(nextDue.getDate() + parseInt(cycleDays));
      break;
    default:
      throw new Error('Invalid billing cycle');
  }

  return nextDue.toISOString().split('T')[0];
}

// Get all subscriptions
router.get('/', authenticateToken, async (req, res) => {
  try {
    await db.connect();
    
    const { status, dueWithinDays, page = 1, pageSize = 50 } = req.query;
    
    let subscriptions = await db.getRows('Subscriptions', { 
      user_id: req.user.userId,
      is_deleted: 'FALSE'
    });

    // Filter by status
    if (status) {
      subscriptions = subscriptions.filter(sub => 
        sub.get('status') === status
      );
    }

    // Filter by due within days
    if (dueWithinDays) {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + parseInt(dueWithinDays));
      
      subscriptions = subscriptions.filter(sub => {
        const dueDate = new Date(sub.get('next_due_date'));
        return dueDate >= today && dueDate <= futureDate;
      });
    }

    // Pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + parseInt(pageSize);
    const paginatedSubscriptions = subscriptions.slice(startIndex, endIndex);

    const result = paginatedSubscriptions.map(sub => ({
      subscriptionId: sub.get('subscription_id'),
      serviceName: sub.get('service_name'),
      planName: sub.get('plan_name'),
      subscriptionType: sub.get('subscription_type') || 'RECURRING',
      cycle: sub.get('cycle'),
      cycleDays: sub.get('cycle_days'),
      amountPerCycle: parseFloat(sub.get('amount_per_cycle')),
      currency: sub.get('currency'),
      startDate: sub.get('start_date'),
      endDate: sub.get('end_date'),
      nextDueDate: sub.get('next_due_date'),
      reminderDays: parseInt(sub.get('reminder_days')),
      status: sub.get('status'),
      notes: sub.get('notes'),
      createdAt: sub.get('created_at'),
      updatedAt: sub.get('updated_at')
    }));

    res.json({
      success: true,
      data: {
        subscriptions: result,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total: subscriptions.length,
          totalPages: Math.ceil(subscriptions.length / pageSize)
        }
      },
      error: null
    });

  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscriptions',
      data: null
    });
  }
});

// Create subscription
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      accountId, 
      serviceName, 
      planName, 
      subscriptionType = 'RECURRING',
      cycle, 
      cycleDays, 
      amountPerCycle, 
      currency, 
      startDate, 
      endDate,
      nextDueDate,
      reminderDays = 3,
      notes 
    } = req.body;

    if (!serviceName || !cycle || !amountPerCycle || !currency || !startDate) {
      return res.status(400).json({
        success: false,
        error: 'Service name, cycle, amount, currency, and start date are required',
        data: null
      });
    }

    if (cycle === 'CUSTOM_DAYS' && !cycleDays) {
      return res.status(400).json({
        success: false,
        error: 'Cycle days required for custom cycle',
        data: null
      });
    }

    if (subscriptionType === 'FIXED_TERM' && !endDate) {
      return res.status(400).json({
        success: false,
        error: 'End date required for fixed term subscriptions',
        data: null
      });
    }

    await db.connect();

    const subscriptionId = uuidv4();
    const now = new Date().toISOString();
    
    // Calculate next due date if not provided (only for RECURRING)
    let calculatedNextDueDate = nextDueDate;
    if (subscriptionType === 'RECURRING' && !nextDueDate) {
      calculatedNextDueDate = calculateNextDueDate(startDate, cycle, cycleDays);
    }

    await db.addRow('Subscriptions', {
      subscription_id: subscriptionId,
      user_id: req.user.userId,
      account_id: accountId || '',
      service_name: serviceName,
      plan_name: planName || '',
      subscription_type: subscriptionType,
      cycle,
      cycle_days: cycleDays || '',
      amount_per_cycle: amountPerCycle.toString(),
      currency,
      start_date: startDate,
      end_date: endDate || '',
      next_due_date: calculatedNextDueDate || '',
      reminder_days: reminderDays.toString(),
      status: 'ACTIVE',
      notes: notes || '',
      is_deleted: 'FALSE',
      created_at: now,
      updated_at: now
    });

    res.status(201).json({
      success: true,
      data: {
        subscriptionId,
        serviceName,
        planName,
        subscriptionType,
        cycle,
        cycleDays,
        amountPerCycle,
        currency,
        startDate,
        endDate,
        nextDueDate: calculatedNextDueDate,
        reminderDays,
        status: 'ACTIVE',
        notes,
        createdAt: now
      },
      error: null
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription',
      data: null
    });
  }
});

// Get subscription by ID
router.get('/:subscriptionId', authenticateToken, async (req, res) => {
  try {
    await db.connect();
    
    const subscriptions = await db.getRows('Subscriptions', {
      subscription_id: req.params.subscriptionId,
      user_id: req.user.userId,
      is_deleted: 'FALSE'
    });

    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found',
        data: null
      });
    }

    const sub = subscriptions[0];
    
    res.json({
      success: true,
      data: {
        subscriptionId: sub.get('subscription_id'),
        serviceName: sub.get('service_name'),
        planName: sub.get('plan_name'),
        subscriptionType: sub.get('subscription_type') || 'RECURRING',
        cycle: sub.get('cycle'),
        cycleDays: sub.get('cycle_days'),
        amountPerCycle: parseFloat(sub.get('amount_per_cycle')),
        currency: sub.get('currency'),
        startDate: sub.get('start_date'),
        endDate: sub.get('end_date'),
        nextDueDate: sub.get('next_due_date'),
        reminderDays: parseInt(sub.get('reminder_days')),
        status: sub.get('status'),
        notes: sub.get('notes'),
        createdAt: sub.get('created_at'),
        updatedAt: sub.get('updated_at')
      },
      error: null
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription',
      data: null
    });
  }
});

// Move to next cycle
router.post('/:subscriptionId/move-next', authenticateToken, async (req, res) => {
  try {
    await db.connect();
    
    const subscriptions = await db.getRows('Subscriptions', {
      subscription_id: req.params.subscriptionId,
      user_id: req.user.userId,
      is_deleted: 'FALSE'
    });

    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found',
        data: null
      });
    }

    const sub = subscriptions[0];
    const currentDueDate = sub.get('next_due_date');
    const cycle = sub.get('cycle');
    const cycleDays = sub.get('cycle_days');

    // Calculate new due date
    const newDueDate = calculateNextDueDate(currentDueDate, cycle, cycleDays);

    await db.updateRow('Subscriptions', {
      subscription_id: req.params.subscriptionId,
      user_id: req.user.userId,
      is_deleted: 'FALSE'
    }, {
      next_due_date: newDueDate,
      updated_at: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        subscriptionId: req.params.subscriptionId,
        previousDueDate: currentDueDate,
        newDueDate,
        message: 'Moved to next cycle successfully'
      },
      error: null
    });

  } catch (error) {
    console.error('Move to next cycle error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to move to next cycle',
      data: null
    });
  }
});

// Update subscription status
router.post('/:subscriptionId/pause', authenticateToken, async (req, res) => {
  try {
    await db.connect();

    const updatedRow = await db.updateRow('Subscriptions', {
      subscription_id: req.params.subscriptionId,
      user_id: req.user.userId,
      is_deleted: 'FALSE'
    }, {
      status: 'PAUSED',
      updated_at: new Date().toISOString()
    });

    if (!updatedRow) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found',
        data: null
      });
    }

    res.json({
      success: true,
      data: {
        subscriptionId: req.params.subscriptionId,
        status: 'PAUSED',
        message: 'Subscription paused successfully'
      },
      error: null
    });

  } catch (error) {
    console.error('Pause subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to pause subscription',
      data: null
    });
  }
});

router.post('/:subscriptionId/resume', authenticateToken, async (req, res) => {
  try {
    await db.connect();

    const updatedRow = await db.updateRow('Subscriptions', {
      subscription_id: req.params.subscriptionId,
      user_id: req.user.userId,
      is_deleted: 'FALSE'
    }, {
      status: 'ACTIVE',
      updated_at: new Date().toISOString()
    });

    if (!updatedRow) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found',
        data: null
      });
    }

    res.json({
      success: true,
      data: {
        subscriptionId: req.params.subscriptionId,
        status: 'ACTIVE',
        message: 'Subscription resumed successfully'
      },
      error: null
    });

  } catch (error) {
    console.error('Resume subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resume subscription',
      data: null
    });
  }
});

router.post('/:subscriptionId/cancel', authenticateToken, async (req, res) => {
  try {
    await db.connect();

    const updatedRow = await db.updateRow('Subscriptions', {
      subscription_id: req.params.subscriptionId,
      user_id: req.user.userId,
      is_deleted: 'FALSE'
    }, {
      status: 'CANCELLED',
      updated_at: new Date().toISOString()
    });

    if (!updatedRow) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found',
        data: null
      });
    }

    res.json({
      success: true,
      data: {
        subscriptionId: req.params.subscriptionId,
        status: 'CANCELLED',
        message: 'Subscription cancelled successfully'
      },
      error: null
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription',
      data: null
    });
  }
});

// Update subscription
router.put('/:subscriptionId', authenticateToken, async (req, res) => {
  try {
    const { 
      serviceName, 
      planName, 
      subscriptionType = 'RECURRING',
      cycle, 
      cycleDays, 
      amountPerCycle, 
      currency, 
      startDate, 
      endDate,
      nextDueDate,
      reminderDays,
      notes 
    } = req.body;

    if (!serviceName || !cycle || !amountPerCycle || !currency || !startDate) {
      return res.status(400).json({
        success: false,
        error: 'Service name, cycle, amount, currency, and start date are required',
        data: null
      });
    }

    if (cycle === 'CUSTOM_DAYS' && !cycleDays) {
      return res.status(400).json({
        success: false,
        error: 'Cycle days required for custom cycle',
        data: null
      });
    }

    if (subscriptionType === 'FIXED_TERM' && !endDate) {
      return res.status(400).json({
        success: false,
        error: 'End date required for fixed term subscriptions',
        data: null
      });
    }

    await db.connect();

    // Check if subscription exists
    const subscriptions = await db.getRows('Subscriptions', {
      subscription_id: req.params.subscriptionId,
      user_id: req.user.userId,
      is_deleted: 'FALSE'
    });

    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found',
        data: null
      });
    }

    // Calculate next due date if not provided (only for RECURRING)
    let calculatedNextDueDate = nextDueDate;
    if (subscriptionType === 'RECURRING' && !nextDueDate) {
      calculatedNextDueDate = calculateNextDueDate(startDate, cycle, cycleDays);
    }

    const updatedRow = await db.updateRow('Subscriptions', {
      subscription_id: req.params.subscriptionId,
      user_id: req.user.userId,
      is_deleted: 'FALSE'
    }, {
      service_name: serviceName,
      plan_name: planName || '',
      subscription_type: subscriptionType,
      cycle,
      cycle_days: cycleDays || '',
      amount_per_cycle: amountPerCycle.toString(),
      currency,
      start_date: startDate,
      end_date: endDate || '',
      next_due_date: calculatedNextDueDate || '',
      reminder_days: reminderDays.toString(),
      notes: notes || '',
      updated_at: new Date().toISOString()
    });

    if (!updatedRow) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found',
        data: null
      });
    }

    res.json({
      success: true,
      data: {
        subscriptionId: req.params.subscriptionId,
        serviceName,
        planName,
        subscriptionType,
        cycle,
        cycleDays,
        amountPerCycle,
        currency,
        startDate,
        endDate,
        nextDueDate: calculatedNextDueDate,
        reminderDays,
        notes,
        message: 'Subscription updated successfully'
      },
      error: null
    });

  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update subscription',
      data: null
    });
  }
});

// Delete subscription (soft delete)
router.delete('/:subscriptionId', authenticateToken, async (req, res) => {
  try {
    await db.connect();

    const updatedRow = await db.updateRow('Subscriptions', {
      subscription_id: req.params.subscriptionId,
      user_id: req.user.userId,
      is_deleted: 'FALSE'
    }, {
      is_deleted: 'TRUE',
      updated_at: new Date().toISOString()
    });

    if (!updatedRow) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found',
        data: null
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Subscription deleted successfully'
      },
      error: null
    });

  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete subscription',
      data: null
    });
  }
});

module.exports = router;