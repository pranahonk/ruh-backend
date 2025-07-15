const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Client {
  static async getAll() {
    try {
      const result = await db.query('SELECT * FROM clients ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const result = await db.query('SELECT * FROM clients WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching client by ID:', error);
      throw error;
    }
  }

  static async create(clientData) {
    const { name, email, phone } = clientData;
    const id = uuidv4();
    
    try {
      const result = await db.query(
        'INSERT INTO clients (id, name, email, phone) VALUES ($1, $2, $3, $4) RETURNING *',
        [id, name, email, phone]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  static async update(id, clientData) {
    const { name, email, phone } = clientData;
    
    try {
      const result = await db.query(
        'UPDATE clients SET name = $1, email = $2, phone = $3, updated_at = CURRENT_TIMESTAMP, synced = FALSE WHERE id = $4 RETURNING *',
        [name, email, phone, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  static async markAsSynced(id) {
    try {
      const result = await db.query(
        'UPDATE clients SET synced = TRUE WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error marking client as synced:', error);
      throw error;
    }
  }

  static async getUnsynced() {
    try {
      const result = await db.query('SELECT * FROM clients WHERE synced = FALSE');
      return result.rows;
    } catch (error) {
      console.error('Error fetching unsynced clients:', error);
      throw error;
    }
  }
}

module.exports = Client;
