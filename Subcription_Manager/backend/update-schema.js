const db = require('./src/config/database');
require('dotenv').config();

async function updateSubscriptionSchema() {
  console.log('🔄 Updating Subscription schema...');
  
  try {
    await db.connect();
    console.log('✅ Connected to Google Sheets');

    // Get current subscriptions to check if we need to add new columns
    const subscriptions = await db.getRows('Subscriptions', {});
    
    if (subscriptions.length > 0) {
      const firstRow = subscriptions[0];
      
      // Check if subscription_type column exists
      if (!firstRow.get('subscription_type')) {
        console.log('📝 Adding subscription_type column...');
        
        // Update all existing subscriptions to have RECURRING type
        for (const sub of subscriptions) {
          await db.updateRow('Subscriptions', {
            subscription_id: sub.get('subscription_id')
          }, {
            subscription_type: 'RECURRING',
            end_date: '' // Add empty end_date column
          });
        }
        
        console.log(`✅ Updated ${subscriptions.length} existing subscriptions`);
      } else {
        console.log('ℹ️  Schema already up to date');
      }
    } else {
      console.log('ℹ️  No existing subscriptions found');
    }

    // Test creating a new subscription with new schema
    console.log('🧪 Testing new schema...');
    
    const testData = {
      subscription_id: 'test-' + Date.now(),
      user_id: 'test-user',
      service_name: 'Test Service',
      plan_name: 'Test Plan',
      subscription_type: 'FIXED_TERM',
      cycle: 'MONTHLY',
      cycle_days: '',
      amount_per_cycle: '100000',
      currency: 'VND',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      next_due_date: '2024-02-01',
      reminder_days: '3',
      status: 'ACTIVE',
      notes: 'Test subscription',
      is_deleted: 'FALSE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.addRow('Subscriptions', testData);
    console.log('✅ Test subscription created successfully');

    // Clean up test data
    await db.updateRow('Subscriptions', {
      subscription_id: testData.subscription_id
    }, {
      is_deleted: 'TRUE'
    });
    console.log('🧹 Test data cleaned up');

    console.log('🎉 Schema update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating schema:', error);
  }
}

// Run the update
if (require.main === module) {
  updateSubscriptionSchema().catch(console.error);
}

module.exports = { updateSubscriptionSchema };