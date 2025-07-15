const Client = require('../models/client');
const Appointment = require('../models/appointment');
const db = require('../config/db');
const cron = require('node-cron');


class MockApiClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://mock.api';
  }


  async fetchClients() {
    console.log('Fetching clients from external API...');

    return [
      { id: '1', name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '9876543210' }
    ];
  }

  async fetchAppointments() {
    console.log('Fetching appointments from external API...');

    return [
      { id: 'a1', client_id: '1', time: '2025-07-10T10:00:00Z' },
      { id: 'a2', client_id: '2', time: '2025-07-11T11:00:00Z' }
    ];
  }

  async createAppointment(appointmentData) {
    console.log('Creating appointment in external API...', appointmentData);

    return {
      id: `a${Math.floor(Math.random() * 1000)}`,
      client_id: appointmentData.client_id,
      time: appointmentData.time
    };
  }
}

class SyncService {
  constructor(apiKey) {
    this.apiClient = new MockApiClient(apiKey);
    this.isSyncing = false;
  }


  async logSync(entityType, operation, entityId, success, message = '') {
    try {
      await db.query(
        'INSERT INTO sync_logs (entity_type, operation, entity_id, success, message) VALUES ($1, $2, $3, $4, $5)',
        [entityType, operation, entityId, success, message]
      );
    } catch (error) {
      console.error('Error logging sync operation:', error);
    }
  }


  async syncClientsFromApi() {
    try {
      const clients = await this.apiClient.fetchClients();
      const syncedClients = [];

      for (const client of clients) {
        try {

          const existingClientById = await Client.getById(client.id);

          if (existingClientById) {

            await Client.update(client.id, client);
            console.log(`Updated existing client with ID: ${client.id}`);
          } else {

            const result = await db.query('SELECT * FROM clients WHERE email = $1', [client.email]);
            const existingClientByEmail = result.rows[0];

            if (existingClientByEmail) {
              console.log(`Client with email ${client.email} already exists with ID: ${existingClientByEmail.id}`);

            } else {

              await Client.create(client);
              console.log(`Created new client with ID: ${client.id}`);
            }
          }


          await Client.markAsSynced(client.id);
          await this.logSync('client', 'pull', client.id, true);
          syncedClients.push(client);
        } catch (clientError) {
          console.error(`Error processing client ${client.id}:`, clientError);
          await this.logSync('client', 'pull', client.id, false, clientError.message);

        }
      }

      console.log(`Successfully synced ${syncedClients.length} out of ${clients.length} clients from API`);
      return syncedClients;
    } catch (error) {
      console.error('Error syncing clients from API:', error);
      await this.logSync('client', 'pull', 'batch', false, error.message);

      return [];
    }
  }


  async syncAppointmentsFromApi() {
    try {
      const appointments = await this.apiClient.fetchAppointments();
      const syncedAppointments = [];

      for (const appointment of appointments) {
        try {

          const client = await Client.getById(appointment.client_id);
          if (!client) {
            console.log(`Skipping appointment ${appointment.id} - client ${appointment.client_id} does not exist`);
            await this.logSync('appointment', 'pull', appointment.id, false, `Client ${appointment.client_id} not found`);
            continue;
          }


          const existingAppointment = await Appointment.getById(appointment.id);

          if (existingAppointment) {
            // Update appointment if needed
            await Appointment.update(appointment.id, appointment);
            console.log(`Updated existing appointment with ID: ${appointment.id}`);
          } else {
            // Create new appointment
            await Appointment.create(appointment);
            console.log(`Created new appointment with ID: ${appointment.id}`);
          }

          // Mark as synced
          await Appointment.markAsSynced(appointment.id);
          await this.logSync('appointment', 'pull', appointment.id, true);
          syncedAppointments.push(appointment);
        } catch (appointmentError) {
          console.error(`Error processing appointment ${appointment.id}:`, appointmentError);
          await this.logSync('appointment', 'pull', appointment.id, false, appointmentError.message);
          // Continue with next appointment instead of failing the entire batch
        }
      }

      console.log(`Successfully synced ${syncedAppointments.length} out of ${appointments.length} appointments from API`);
      return syncedAppointments;
    } catch (error) {
      console.error('Error syncing appointments from API:', error);
      await this.logSync('appointment', 'pull', 'batch', false, error.message);
      // Return empty array instead of throwing to allow the sync process to continue
      return [];
    }
  }

  // Push unsynced clients to external API
  async pushUnsyncedClients() {
    try {
      const unsyncedClients = await Client.getUnsynced();

      for (const client of unsyncedClients) {
        try {
          // Simulate API call to update client
          console.log(`Pushing client ${client.id} to API`);

          // Mark as synced
          await Client.markAsSynced(client.id);
          await this.logSync('client', 'push', client.id, true);
        } catch (error) {
          console.error(`Error pushing client ${client.id} to API:`, error);
          await this.logSync('client', 'push', client.id, false, error.message);
        }
      }

      console.log(`Pushed ${unsyncedClients.length} clients to API`);
      return unsyncedClients;
    } catch (error) {
      console.error('Error pushing unsynced clients to API:', error);
      throw error;
    }
  }

  // Push unsynced appointments to external API
  async pushUnsyncedAppointments() {
    try {
      const unsyncedAppointments = await Appointment.getUnsynced();

      for (const appointment of unsyncedAppointments) {
        try {
          // Simulate API call to update appointment
          console.log(`Pushing appointment ${appointment.id} to API`);

          // Mark as synced
          await Appointment.markAsSynced(appointment.id);
          await this.logSync('appointment', 'push', appointment.id, true);
        } catch (error) {
          console.error(`Error pushing appointment ${appointment.id} to API:`, error);
          await this.logSync('appointment', 'push', appointment.id, false, error.message);
        }
      }

      console.log(`Pushed ${unsyncedAppointments.length} appointments to API`);
      return unsyncedAppointments;
    } catch (error) {
      console.error('Error pushing unsynced appointments to API:', error);
      throw error;
    }
  }

  // Full sync process
  async performFullSync() {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    this.isSyncing = true;
    console.log('Starting full sync process...');

    try {
      // Pull data from API - clients first, then appointments
      // This ensures clients exist before we try to create appointments
      const clients = await this.syncClientsFromApi();
      console.log('Clients sync completed, now syncing appointments');

      // Add a small delay to ensure all client operations are complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Now sync appointments
      await this.syncAppointmentsFromApi();

      // Push unsynced data to API
      await this.pushUnsyncedClients();
      await this.pushUnsyncedAppointments();

      console.log('Full sync completed successfully');
    } catch (error) {
      console.error('Error during full sync:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // Schedule periodic sync
  scheduleSync(cronExpression = '*/15 * * * *') { // Default: every 15 minutes
    cron.schedule(cronExpression, async () => {
      console.log(`Scheduled sync triggered at ${new Date().toISOString()}`);
      await this.performFullSync();
    });
    console.log(`Sync scheduled with cron expression: ${cronExpression}`);
  }
}

module.exports = SyncService;
