// Mock database for demo purposes (when Google Sheets is not configured)
class MockDatabase {
  constructor() {
    this.data = {
      Users: [],
      Accounts: [],
      Subscriptions: [],
      Categories: []
    };
    this.connected = false;
  }

  async connect() {
    console.log('Using Mock Database (Google Sheets not configured)');
    this.connected = true;
    return true;
  }

  async addRow(sheetName, data) {
    if (!this.data[sheetName]) {
      this.data[sheetName] = [];
    }
    
    const row = { ...data, _id: Date.now().toString() + Math.random().toString(36) };
    this.data[sheetName].push(row);
    
    // Mock row object with get/set methods
    return {
      _data: row,
      get: (key) => row[key],
      set: (key, value) => { row[key] = value; },
      save: async () => {
        // Update the row in data array
        const index = this.data[sheetName].findIndex(r => r._id === row._id);
        if (index > -1) {
          this.data[sheetName][index] = row;
        }
      },
      delete: async () => {
        const index = this.data[sheetName].findIndex(r => r._id === row._id);
        if (index > -1) {
          this.data[sheetName].splice(index, 1);
        }
      }
    };
  }

  async getRows(sheetName, filter = {}) {
    if (!this.data[sheetName]) {
      this.data[sheetName] = [];
    }

    let rows = [...this.data[sheetName]]; // Create a copy
    
    // Apply filters
    if (Object.keys(filter).length > 0) {
      rows = rows.filter(row => {
        return Object.entries(filter).every(([key, value]) => {
          return row[key] === value;
        });
      });
    }

    // Return mock row objects
    return rows.map(row => ({
      _data: row,
      get: (key) => row[key],
      set: (key, value) => { 
        row[key] = value;
        // Update in main data array
        const index = this.data[sheetName].findIndex(r => r._id === row._id);
        if (index > -1) {
          this.data[sheetName][index] = row;
        }
      },
      save: async () => {
        // Update the row in data array
        const index = this.data[sheetName].findIndex(r => r._id === row._id);
        if (index > -1) {
          this.data[sheetName][index] = row;
        }
      },
      delete: async () => {
        const index = this.data[sheetName].findIndex(r => r._id === row._id);
        if (index > -1) {
          this.data[sheetName].splice(index, 1);
        }
      }
    }));
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

module.exports = MockDatabase;