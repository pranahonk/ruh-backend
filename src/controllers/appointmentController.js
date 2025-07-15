const Appointment = require('../models/appointment');
const Client = require('../models/client');

const appointmentController = {
  // Get all appointments
  async getAllAppointments(req, res) {
    try {
      const appointments = await Appointment.getAll();
      res.status(200).json(appointments);
    } catch (error) {
      console.error('Error in getAllAppointments controller:', error);
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  },

  // Get appointment by ID
  async getAppointmentById(req, res) {
    try {
      const { id } = req.params;
      const appointment = await Appointment.getById(id);
      
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      
      res.status(200).json(appointment);
    } catch (error) {
      console.error('Error in getAppointmentById controller:', error);
      res.status(500).json({ error: 'Failed to fetch appointment' });
    }
  },

  // Create new appointment
  async createAppointment(req, res) {
    try {
      const { client_id, time } = req.body;
      
      // Validate required fields
      if (!client_id || !time) {
        return res.status(400).json({ error: 'Client ID and time are required' });
      }
      
      // Validate time format
      const timeDate = new Date(time);
      if (isNaN(timeDate.getTime())) {
        return res.status(400).json({ error: 'Invalid time format' });
      }
      
      // Check if client exists
      const client = await Client.getById(client_id);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      const newAppointment = await Appointment.create({ client_id, time });
      
      // Fetch client details to include in response
      const appointmentWithClient = {
        ...newAppointment,
        client_name: client.name,
        client_email: client.email
      };
      
      res.status(201).json(appointmentWithClient);
    } catch (error) {
      console.error('Error in createAppointment controller:', error);
      res.status(500).json({ error: 'Failed to create appointment' });
    }
  },

  // Update appointment
  async updateAppointment(req, res) {
    try {
      const { id } = req.params;
      const { client_id, time } = req.body;
      
      // Validate required fields
      if (!client_id || !time) {
        return res.status(400).json({ error: 'Client ID and time are required' });
      }
      
      // Validate time format
      const timeDate = new Date(time);
      if (isNaN(timeDate.getTime())) {
        return res.status(400).json({ error: 'Invalid time format' });
      }
      
      // Check if appointment exists
      const existingAppointment = await Appointment.getById(id);
      if (!existingAppointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      
      // Check if client exists
      const client = await Client.getById(client_id);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      const updatedAppointment = await Appointment.update(id, { client_id, time });
      
      // Fetch client details to include in response
      const appointmentWithClient = {
        ...updatedAppointment,
        client_name: client.name,
        client_email: client.email
      };
      
      res.status(200).json(appointmentWithClient);
    } catch (error) {
      console.error('Error in updateAppointment controller:', error);
      res.status(500).json({ error: 'Failed to update appointment' });
    }
  }
};

module.exports = appointmentController;
