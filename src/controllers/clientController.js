const Client = require('../models/client');

const clientController = {

  async getAllClients(req, res) {
    try {
      const clients = await Client.getAll();
      res.status(200).json(clients);
    } catch (error) {
      console.error('Error in getAllClients controller:', error);
      res.status(500).json({ error: 'Failed to fetch clients' });
    }
  },


  async getClientById(req, res) {
    try {
      const { id } = req.params;
      const client = await Client.getById(id);

      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      res.status(200).json(client);
    } catch (error) {
      console.error('Error in getClientById controller:', error);
      res.status(500).json({ error: 'Failed to fetch client' });
    }
  },


  async createClient(req, res) {
    try {
      const { name, email, phone } = req.body;


      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      const newClient = await Client.create({ name, email, phone });
      res.status(201).json(newClient);
    } catch (error) {
      console.error('Error in createClient controller:', error);


      if (error.code === '23505') {
        return res.status(409).json({ error: 'Email already exists' });
      }

      res.status(500).json({ error: 'Failed to create client' });
    }
  },


  async updateClient(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phone } = req.body;


      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }


      const existingClient = await Client.getById(id);
      if (!existingClient) {
        return res.status(404).json({ error: 'Client not found' });
      }

      const updatedClient = await Client.update(id, { name, email, phone });
      res.status(200).json(updatedClient);
    } catch (error) {
      console.error('Error in updateClient controller:', error);


      if (error.code === '23505') {
        return res.status(409).json({ error: 'Email already exists' });
      }

      res.status(500).json({ error: 'Failed to update client' });
    }
  }
};

module.exports = clientController;
