const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:3001';

// Sample data
const sampleAccounts = [
  {
    serviceName: 'Netflix',
    loginId: 'hoantq58@gmail.com',
    password: 'netflix2024',
    url: 'https://netflix.com',
    notes: 'Premium Family Plan'
  },
  {
    serviceName: 'Spotify',
    loginId: 'hoantq.music@gmail.com',
    password: 'spotify123',
    url: 'https://spotify.com',
    notes: 'Premium Individual'
  },
  {
    serviceName: 'Google Drive',
    loginId: 'hoantq58@gmail.com',
    password: 'googledrive456',
    url: 'https://drive.google.com',
    notes: '2TB Storage Plan'
  },
  {
    serviceName: 'Adobe Creative Cloud',
    loginId: 'hoantq.design@gmail.com',
    password: 'adobe789',
    url: 'https://adobe.com',
    notes: 'All Apps Plan'
  },
  {
    serviceName: 'Microsoft 365',
    loginId: 'hoantq58@gmail.com',
    password: 'microsoft365',
    url: 'https://office.com',
    notes: 'Family Subscription'
  },
  {
    serviceName: 'YouTube Premium',
    loginId: 'hoantq58@gmail.com',
    password: 'youtube2024',
    url: 'https://youtube.com',
    notes: 'Ad-free + Music'
  },
  {
    serviceName: 'Dropbox',
    loginId: 'hoantq.storage@gmail.com',
    password: 'dropbox123',
    url: 'https://dropbox.com',
    notes: 'Plus 2TB Plan'
  },
  {
    serviceName: 'Canva Pro',
    loginId: 'hoantq58@gmail.com',
    password: 'canva456',
    url: 'https://canva.com',
    notes: 'Design Pro Account'
  },
  {
    serviceName: 'Figma',
    loginId: 'hoantq.design@gmail.com',
    password: 'figma789',
    url: 'https://figma.com',
    notes: 'Professional Plan'
  },
  {
    serviceName: 'GitHub Pro',
    loginId: 'hoantq58@gmail.com',
    password: 'github2024',
    url: 'https://github.com',
    notes: 'Developer Pro Account'
  }
];

const sampleSubscriptions = [
  {
    serviceName: 'Netflix Premium',
    planName: 'Family Plan',
    cycle: 'MONTHLY',
    amountPerCycle: 260000,
    currency: 'VND',
    startDate: '2024-01-15',
    reminderDays: 3,
    notes: '4 screens, Ultra HD'
  },
  {
    serviceName: 'Spotify Premium',
    planName: 'Individual',
    cycle: 'MONTHLY',
    amountPerCycle: 59000,
    currency: 'VND',
    startDate: '2024-02-01',
    reminderDays: 5,
    notes: 'Ad-free music streaming'
  },
  {
    serviceName: 'Google Drive',
    planName: '2TB Storage',
    cycle: 'MONTHLY',
    amountPerCycle: 65000,
    currency: 'VND',
    startDate: '2024-01-10',
    reminderDays: 7,
    notes: 'Cloud storage for files'
  },
  {
    serviceName: 'Adobe Creative Cloud',
    planName: 'All Apps',
    cycle: 'MONTHLY',
    amountPerCycle: 52,
    currency: 'USD',
    startDate: '2024-03-01',
    reminderDays: 5,
    notes: 'Photoshop, Illustrator, etc.'
  },
  {
    serviceName: 'Microsoft 365',
    planName: 'Family',
    cycle: 'YEARLY',
    amountPerCycle: 2100000,
    currency: 'VND',
    startDate: '2024-01-01',
    reminderDays: 14,
    notes: 'Office apps + 1TB OneDrive'
  },
  {
    serviceName: 'YouTube Premium',
    planName: 'Individual',
    cycle: 'MONTHLY',
    amountPerCycle: 79000,
    currency: 'VND',
    startDate: '2024-02-15',
    reminderDays: 3,
    notes: 'Ad-free YouTube + Music'
  },
  {
    serviceName: 'Dropbox Plus',
    planName: '2TB Plan',
    cycle: 'MONTHLY',
    amountPerCycle: 10,
    currency: 'USD',
    startDate: '2024-01-20',
    reminderDays: 5,
    notes: 'File sync and backup'
  },
  {
    serviceName: 'Canva Pro',
    planName: 'Pro Plan',
    cycle: 'YEARLY',
    amountPerCycle: 119,
    currency: 'USD',
    startDate: '2024-01-05',
    reminderDays: 10,
    notes: 'Premium design tools'
  },
  {
    serviceName: 'Figma Professional',
    planName: 'Professional',
    cycle: 'MONTHLY',
    amountPerCycle: 12,
    currency: 'USD',
    startDate: '2024-02-10',
    reminderDays: 7,
    notes: 'Advanced design features'
  },
  {
    serviceName: 'GitHub Pro',
    planName: 'Pro Plan',
    cycle: 'MONTHLY',
    amountPerCycle: 4,
    currency: 'USD',
    startDate: '2024-01-25',
    reminderDays: 5,
    notes: 'Private repositories'
  }
];

async function seedData() {
  console.log('🌱 Starting data seeding process...\n');

  try {
    // Step 1: Register user
    console.log('👤 Step 1: Creating user account...');
    let token;
    
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/register`, {
        email: 'hoantq58@gmail.com',
        password: '123456',
        confirmPassword: '123456'
      });

      if (registerResponse.data.success) {
        token = registerResponse.data.data.token;
        console.log('✅ User created successfully');
      }
    } catch (error) {
      if (error.response?.data?.error === 'User already exists') {
        console.log('ℹ️  User already exists, trying to login...');
        
        // Try to login instead
        const loginResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
          email: 'hoantq58@gmail.com',
          password: '123456'
        });

        if (loginResponse.data.success) {
          token = loginResponse.data.data.token;
          console.log('✅ Logged in successfully');
        } else {
          throw new Error('Cannot login with existing user: ' + loginResponse.data.error);
        }
      } else {
        throw error;
      }
    }

    console.log('🔑 Token obtained:', token.substring(0, 50) + '...\n');

    // Set authorization header
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Create accounts
    console.log('🏦 Step 2: Creating accounts...');
    const createdAccounts = [];
    
    for (let i = 0; i < sampleAccounts.length; i++) {
      const account = sampleAccounts[i];
      console.log(`  Creating account ${i + 1}/10: ${account.serviceName}`);
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/accounts`, account, {
          headers: authHeaders
        });
        
        if (response.data.success) {
          createdAccounts.push(response.data.data);
          console.log(`  ✅ ${account.serviceName} - Created`);
        } else {
          console.log(`  ❌ ${account.serviceName} - Failed: ${response.data.error}`);
        }
      } catch (error) {
        console.log(`  ❌ ${account.serviceName} - Error: ${error.response?.data?.error || error.message}`);
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n✅ Created ${createdAccounts.length}/10 accounts\n`);

    // Step 3: Create subscriptions
    console.log('💳 Step 3: Creating subscriptions...');
    const createdSubscriptions = [];
    
    for (let i = 0; i < sampleSubscriptions.length; i++) {
      const subscription = sampleSubscriptions[i];
      console.log(`  Creating subscription ${i + 1}/10: ${subscription.serviceName}`);
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/subscriptions`, subscription, {
          headers: authHeaders
        });
        
        if (response.data.success) {
          createdSubscriptions.push(response.data.data);
          console.log(`  ✅ ${subscription.serviceName} - Created`);
        } else {
          console.log(`  ❌ ${subscription.serviceName} - Failed: ${response.data.error}`);
        }
      } catch (error) {
        console.log(`  ❌ ${subscription.serviceName} - Error: ${error.response?.data?.error || error.message}`);
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n✅ Created ${createdSubscriptions.length}/10 subscriptions\n`);

    // Step 4: Summary
    console.log('📊 Summary:');
    console.log(`👤 User: hoantq58@gmail.com`);
    console.log(`🏦 Accounts: ${createdAccounts.length}/10 created`);
    console.log(`💳 Subscriptions: ${createdSubscriptions.length}/10 created`);
    
    // Calculate total monthly cost
    const monthlyTotal = createdSubscriptions.reduce((total, sub) => {
      if (sub.cycle === 'MONTHLY') {
        return total + sub.amountPerCycle;
      } else if (sub.cycle === 'YEARLY') {
        return total + (sub.amountPerCycle / 12);
      }
      return total;
    }, 0);

    console.log(`💰 Estimated monthly cost: ${monthlyTotal.toLocaleString()} VND`);
    console.log('\n🎉 Data seeding completed successfully!');
    console.log('\n🌐 You can now login to the web app with:');
    console.log('   Email: hoantq58@gmail.com');
    console.log('   Password: 123456');
    console.log('\n📱 Or test the mobile app with the same credentials.');

  } catch (error) {
    console.error('❌ Error during data seeding:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Helper function to format currency
function formatCurrency(amount, currency) {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
}

// Run the seeding
if (require.main === module) {
  seedData().catch(console.error);
}

module.exports = { seedData, sampleAccounts, sampleSubscriptions };