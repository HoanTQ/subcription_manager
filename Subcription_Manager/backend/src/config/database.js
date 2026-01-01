const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const MockDatabase = require('./mockDatabase');

class GoogleSheetsDB {
  constructor() {
    this.doc = null;
    this.sheets = {};
    this.connected = false;
    this.connecting = false;
  }

  async connect() {
    // Prevent multiple connections
    if (this.connected) return true;
    if (this.connecting) {
      // Wait for existing connection
      while (this.connecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.connected;
    }

    this.connecting = true;

    try {
      // Check if Google Sheets is configured
      if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || 
          process.env.GOOGLE_SHEETS_ID === 'your-google-sheets-id-here') {
        console.log('Google Sheets not configured, using mock database for demo');
        const mockDb = new MockDatabase();
        await mockDb.connect();
        
        // Replace this instance with mock database
        this.connected = true;
        this.connecting = false;
        
        // Override methods to use mock database
        this.addRow = mockDb.addRow.bind(mockDb);
        this.getRows = mockDb.getRows.bind(mockDb);
        this.updateRow = mockDb.updateRow.bind(mockDb);
        this.deleteRow = mockDb.deleteRow.bind(mockDb);
        
        return true;
      }

      const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID, serviceAccountAuth);
      await this.doc.loadInfo();
      
      console.log('Connected to Google Sheets:', this.doc.title);
      
      // Initialize sheets
      await this.initializeSheets();
      
      this.connected = true;
      this.connecting = false;
      return true;
    } catch (error) {
      console.error('Failed to connect to Google Sheets:', error);
      console.log('Falling back to mock database for demo');
      const mockDb = new MockDatabase();
      // Copy mock database methods to this instance
      Object.assign(this, mockDb);
      this.connecting = false;
      return await mockDb.connect();
    }
  }

  async initializeSheets() {
    const sheetNames = ['Users', 'Accounts', 'Subscriptions', 'Categories'];
    
    for (const sheetName of sheetNames) {
      let sheet = this.doc.sheetsByTitle[sheetName];
      
      if (!sheet) {
        sheet = await this.doc.addSheet({ 
          title: sheetName,
          headerValues: this.getHeadersForSheet(sheetName)
        });
        console.log(`Created sheet: ${sheetName}`);
      } else {
        await sheet.loadHeaderRow();
      }
      
      this.sheets[sheetName] = sheet;
    }
  }

  getHeadersForSheet(sheetName) {
    const headers = {
      Users: ['user_id', 'email', 'password_hash', 'status', 'created_at', 'updated_at'],
      Accounts: ['account_id', 'user_id', 'service_name', 'login_id', 'password_ciphertext', 'password_iv', 'password_tag', 'url', 'category_id', 'tags', 'notes', 'is_deleted', 'created_at', 'updated_at'],
      Subscriptions: ['subscription_id', 'user_id', 'account_id', 'service_name', 'plan_name', 'subscription_type', 'cycle', 'cycle_days', 'amount_per_cycle', 'currency', 'start_date', 'end_date', 'next_due_date', 'reminder_days', 'status', 'notes', 'is_deleted', 'created_at', 'updated_at'],
      Categories: ['category_id', 'user_id', 'name', 'created_at']
    };
    return headers[sheetName] || [];
  }

  async addRow(sheetName, data) {
    const sheet = this.sheets[sheetName];
    if (!sheet) throw new Error(`Sheet ${sheetName} not found`);
    
    const row = await sheet.addRow(data);
    return row;
  }

  async getRows(sheetName, filter = {}) {
    const sheet = this.sheets[sheetName];
    if (!sheet) throw new Error(`Sheet ${sheetName} not found`);
    
    const rows = await sheet.getRows();
    
    if (Object.keys(filter).length === 0) {
      return rows;
    }
    
    return rows.filter(row => {
      return Object.entries(filter).every(([key, value]) => {
        return row.get(key) === value;
      });
    });
  }

  async updateRow(sheetName, filter, updates) {
    const rows = await this.getRows(sheetName, filter);
    if (rows.length === 0) return null;
    
    const row = rows[0];
    Object.entries(updates).forEach(([key, value]) => {
      row.set(key, value);
    });
    
    await row.save();
    return row;
  }

  async deleteRow(sheetName, filter) {
    const rows = await this.getRows(sheetName, filter);
    if (rows.length === 0) return false;
    
    await rows[0].delete();
    return true;
  }
}

const db = new GoogleSheetsDB();

module.exports = db;