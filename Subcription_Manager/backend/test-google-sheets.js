const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config();

async function testGoogleSheetsConnection() {
  console.log('🔍 Testing Google Sheets Connection...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('GOOGLE_SHEETS_ID:', process.env.GOOGLE_SHEETS_ID ? '✅ Set' : '❌ Missing');
  console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅ Set' : '❌ Missing');
  console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
  console.log();

  if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.log('❌ Missing required environment variables');
    return;
  }

  try {
    console.log('🔐 Creating Service Account Auth...');
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    console.log('📊 Connecting to Google Sheets...');
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID, serviceAccountAuth);
    
    console.log('📖 Loading document info...');
    await doc.loadInfo();
    
    console.log('✅ SUCCESS! Connected to Google Sheets');
    console.log('📄 Document Title:', doc.title);
    console.log('📅 Created:', doc.createdTime);
    console.log('👤 Owner:', doc.ownerEmail);
    console.log('📊 Sheet Count:', doc.sheetCount);
    console.log();

    console.log('📋 Existing Sheets:');
    Object.values(doc.sheetsByIndex).forEach((sheet, index) => {
      console.log(`  ${index + 1}. ${sheet.title} (${sheet.rowCount} rows, ${sheet.columnCount} cols)`);
    });
    console.log();

    // Test creating a sheet if needed
    const requiredSheets = ['Users', 'Accounts', 'Subscriptions', 'Categories'];
    console.log('🔧 Checking required sheets...');
    
    for (const sheetName of requiredSheets) {
      if (doc.sheetsByTitle[sheetName]) {
        console.log(`  ✅ ${sheetName} - exists`);
      } else {
        console.log(`  ⚠️  ${sheetName} - missing, creating...`);
        try {
          await doc.addSheet({ 
            title: sheetName,
            headerValues: getHeadersForSheet(sheetName)
          });
          console.log(`  ✅ ${sheetName} - created successfully`);
        } catch (err) {
          console.log(`  ❌ ${sheetName} - failed to create:`, err.message);
        }
      }
    }

    console.log('\n🎉 Google Sheets connection test completed successfully!');
    console.log('🔗 Sheets URL: https://docs.google.com/spreadsheets/d/' + process.env.GOOGLE_SHEETS_ID);

  } catch (error) {
    console.log('❌ FAILED to connect to Google Sheets');
    console.log('Error:', error.message);
    console.log();
    
    if (error.message.includes('403')) {
      console.log('🔧 Possible solutions for 403 Forbidden:');
      console.log('1. Share the Google Sheet with service account email:');
      console.log('   ' + process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
      console.log('2. Give "Editor" permission to the service account');
      console.log('3. Make sure Google Sheets API is enabled in Google Cloud Console');
    } else if (error.message.includes('404')) {
      console.log('🔧 Possible solutions for 404 Not Found:');
      console.log('1. Check if the Google Sheets ID is correct');
      console.log('2. Make sure the sheet exists and is accessible');
    } else if (error.message.includes('401')) {
      console.log('🔧 Possible solutions for 401 Unauthorized:');
      console.log('1. Check if the service account key is correct');
      console.log('2. Make sure the private key format is correct (with \\n)');
    }
    
    console.log('\n📋 Current configuration:');
    console.log('Sheets ID:', process.env.GOOGLE_SHEETS_ID);
    console.log('Service Account:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log('Private Key Length:', process.env.GOOGLE_PRIVATE_KEY.length, 'characters');
  }
}

function getHeadersForSheet(sheetName) {
  const headers = {
    Users: ['user_id', 'email', 'password_hash', 'status', 'created_at', 'updated_at'],
    Accounts: ['account_id', 'user_id', 'service_name', 'login_id', 'password_ciphertext', 'password_iv', 'password_tag', 'url', 'category_id', 'tags', 'notes', 'is_deleted', 'created_at', 'updated_at'],
    Subscriptions: ['subscription_id', 'user_id', 'account_id', 'service_name', 'plan_name', 'cycle', 'cycle_days', 'amount_per_cycle', 'currency', 'start_date', 'next_due_date', 'reminder_days', 'status', 'notes', 'is_deleted', 'created_at', 'updated_at'],
    Categories: ['category_id', 'user_id', 'name', 'created_at']
  };
  return headers[sheetName] || [];
}

// Run the test
testGoogleSheetsConnection().catch(console.error);