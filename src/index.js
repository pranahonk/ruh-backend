const express = require('express');
const cors = require('cors');
require('dotenv').config();


const clientRoutes = require('./routes/clientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');


const { initializeDatabase } = require('./config/init-db');


const SyncService = require('./utils/syncService');


const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());


app.use('/api/clients', clientRoutes);
app.use('/api/appointments', appointmentRoutes);


app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});


app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Wellness Platform API',
    version: '1.0.0',
    endpoints: {
      clients: '/api/clients',
      appointments: '/api/appointments'
    }
  });
});


async function startServer() {


  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on 0.0.0.0:${PORT}`);
  });


  initializeBackgroundServices().catch(error => {
    console.error('Error in background services:', error);

  });

  return server;
}


async function initializeBackgroundServices() {
  try {
    console.log('Initializing database...');

    await initializeDatabase();
    console.log('Database initialized successfully');


    if (process.env.API_KEY) {
      console.log('Initializing sync service...');

      const syncService = new SyncService(process.env.API_KEY);


      await syncService.performFullSync();


      syncService.scheduleSync('*/15 * * * *');
      console.log('Sync service initialized successfully');
    } else {
      console.log('API_KEY not provided, skipping sync service initialization');
    }
  } catch (error) {
    console.error('Failed to initialize background services:', error);

  }
}


process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});


process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});


startServer();
