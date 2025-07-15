const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const clientRoutes = require('./routes/clientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

// Import database initialization
const { initializeDatabase } = require('./config/init-db');

// Import sync service
const SyncService = require('./utils/syncService');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/clients', clientRoutes);
app.use('/api/appointments', appointmentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
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

// Initialize database and start server
async function startServer() {
  // Start the server first to ensure health checks pass
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  
  // Initialize database and sync service in the background
  initializeBackgroundServices().catch(error => {
    console.error('Error in background services:', error);
    // Don't exit the process, just log the error
  });
  
  return server;
}

// Initialize database and sync service in the background
async function initializeBackgroundServices() {
  try {
    console.log('Initializing database...');
    // Initialize database tables
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    // Only start sync service if API_KEY is provided
    if (process.env.API_KEY) {
      console.log('Initializing sync service...');
      // Initialize sync service
      const syncService = new SyncService(process.env.API_KEY);
      
      // Perform initial sync
      await syncService.performFullSync();
      
      // Schedule periodic sync (every 15 minutes)
      syncService.scheduleSync('*/15 * * * *');
      console.log('Sync service initialized successfully');
    } else {
      console.log('API_KEY not provided, skipping sync service initialization');
    }
  } catch (error) {
    console.error('Failed to initialize background services:', error);
    // Don't exit the process, just log the error
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
