const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Appointment {
  static async getAll() {
    try {
      const result = await db.query(`
        SELECT a.*, c.name as client_name, c.email as client_email 
        FROM appointments a
        JOIN clients c ON a.client_id = c.id
        ORDER BY a.time ASC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const result = await db.query(`
        SELECT a.*, c.name as client_name, c.email as client_email 
        FROM appointments a
        JOIN clients c ON a.client_id = c.id
        WHERE a.id = $1
      `, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching appointment by ID:', error);
      throw error;
    }
  }

  static async create(appointmentData) {
    const { client_id, time } = appointmentData;
    const id = uuidv4();
    
    try {
      const result = await db.query(
        'INSERT INTO appointments (id, client_id, time) VALUES ($1, $2, $3) RETURNING *',
        [id, client_id, time]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  static async update(id, appointmentData) {
    const { client_id, time } = appointmentData;
    
    try {
      const result = await db.query(
        'UPDATE appointments SET client_id = $1, time = $2, updated_at = CURRENT_TIMESTAMP, synced = FALSE WHERE id = $3 RETURNING *',
        [client_id, time, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  static async markAsSynced(id) {
    try {
      const result = await db.query(
        'UPDATE appointments SET synced = TRUE WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error marking appointment as synced:', error);
      throw error;
    }
  }

  static async getUnsynced() {
    try {
      const result = await db.query('SELECT * FROM appointments WHERE synced = FALSE');
      return result.rows;
    } catch (error) {
      console.error('Error fetching unsynced appointments:', error);
      throw error;
    }
  }
}

module.exports = Appointment;
