const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get dashboard summary
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    await db.connect();
    
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    // Get active subscriptions
    const subscriptions = await db.getRows('Subscriptions', { 
      user_id: req.user.userId,
      status: 'ACTIVE',
      is_deleted: 'FALSE'
    });

    // Calculate monthly total
    let monthlyTotal = 0;
    const monthlySubscriptions = [];

    subscriptions.forEach(sub => {
      const dueDate = new Date(sub.get('next_due_date'));
      const amount = parseFloat(sub.get('amount_per_cycle'));
      
      if (dueDate.getMonth() + 1 === targetMonth && dueDate.getFullYear() === targetYear) {
        monthlyTotal += amount;
        monthlySubscriptions.push({
          serviceName: sub.get('service_name'),
          amount,
          currency: sub.get('currency'),
          dueDate: sub.get('next_due_date')
        });
      }
    });

    // Calculate next 30 days total
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    let next30DaysTotal = 0;
    const upcomingSubscriptions = [];

    subscriptions.forEach(sub => {
      const dueDate = new Date(sub.get('next_due_date'));
      const amount = parseFloat(sub.get('amount_per_cycle'));
      
      if (dueDate >= today && dueDate <= next30Days) {
        next30DaysTotal += amount;
        upcomingSubscriptions.push({
          serviceName: sub.get('service_name'),
          amount,
          currency: sub.get('currency'),
          dueDate: sub.get('next_due_date'),
          daysUntilDue: Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
        });
      }
    });

    // Top 5 subscriptions by amount
    const topSubscriptions = subscriptions
      .map(sub => ({
        serviceName: sub.get('service_name'),
        amount: parseFloat(sub.get('amount_per_cycle')),
        currency: sub.get('currency'),
        cycle: sub.get('cycle')
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        summary: {
          monthlyTotal,
          next30DaysTotal,
          totalActiveSubscriptions: subscriptions.length,
          targetMonth,
          targetYear
        },
        monthlySubscriptions,
        upcomingSubscriptions: upcomingSubscriptions.sort((a, b) => a.daysUntilDue - b.daysUntilDue),
        topSubscriptions
      },
      error: null
    });

  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard summary',
      data: null
    });
  }
});

// Get upcoming dues
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    await db.connect();
    
    const { days = 30 } = req.query;
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + parseInt(days));

    const subscriptions = await db.getRows('Subscriptions', { 
      user_id: req.user.userId,
      status: 'ACTIVE',
      is_deleted: 'FALSE'
    });

    const overdue = [];
    const dueSoon = [];
    const later = [];

    subscriptions.forEach(sub => {
      const dueDate = new Date(sub.get('next_due_date'));
      const amount = parseFloat(sub.get('amount_per_cycle'));
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      
      const subscription = {
        subscriptionId: sub.get('subscription_id'),
        serviceName: sub.get('service_name'),
        planName: sub.get('plan_name'),
        amount,
        currency: sub.get('currency'),
        dueDate: sub.get('next_due_date'),
        daysUntilDue,
        reminderDays: parseInt(sub.get('reminder_days'))
      };

      if (daysUntilDue < 0) {
        overdue.push(subscription);
      } else if (daysUntilDue <= 7) {
        dueSoon.push(subscription);
      } else if (dueDate <= futureDate) {
        later.push(subscription);
      }
    });

    // Sort each category
    overdue.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
    dueSoon.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
    later.sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    res.json({
      success: true,
      data: {
        overdue,
        dueSoon,
        later,
        summary: {
          overdueCount: overdue.length,
          dueSoonCount: dueSoon.length,
          laterCount: later.length,
          totalAmount: [...overdue, ...dueSoon, ...later].reduce((sum, sub) => sum + sub.amount, 0)
        }
      },
      error: null
    });

  } catch (error) {
    console.error('Upcoming dues error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch upcoming dues',
      data: null
    });
  }
});

// Get forecast for multiple months
router.get('/forecast', authenticateToken, async (req, res) => {
  try {
    await db.connect();
    
    const { months = 6 } = req.query;
    const currentDate = new Date();
    
    const subscriptions = await db.getRows('Subscriptions', { 
      user_id: req.user.userId,
      status: 'ACTIVE',
      is_deleted: 'FALSE'
    });

    const forecast = [];

    for (let i = 0; i < parseInt(months); i++) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const month = targetDate.getMonth() + 1;
      const year = targetDate.getFullYear();
      
      let monthlyTotal = 0;
      const monthlySubscriptions = [];

      subscriptions.forEach(sub => {
        const dueDate = new Date(sub.get('next_due_date'));
        const amount = parseFloat(sub.get('amount_per_cycle'));
        
        // Simple calculation - can be enhanced for multiple cycles per month
        if (dueDate.getMonth() + 1 === month && dueDate.getFullYear() === year) {
          monthlyTotal += amount;
          monthlySubscriptions.push({
            serviceName: sub.get('service_name'),
            amount,
            currency: sub.get('currency')
          });
        }
      });

      forecast.push({
        month,
        year,
        monthName: targetDate.toLocaleString('default', { month: 'long' }),
        total: monthlyTotal,
        subscriptionCount: monthlySubscriptions.length,
        subscriptions: monthlySubscriptions
      });
    }

    res.json({
      success: true,
      data: {
        forecast,
        summary: {
          totalMonths: parseInt(months),
          averageMonthly: forecast.reduce((sum, month) => sum + month.total, 0) / forecast.length,
          totalForecast: forecast.reduce((sum, month) => sum + month.total, 0)
        }
      },
      error: null
    });

  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch forecast',
      data: null
    });
  }
});

module.exports = router;