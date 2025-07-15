#!/usr/bin/env node

// This script runs after deployment to set up the database tables on Fly.io
const { initializeDatabase } = require('../src/config/init-db');

async function setupFlyDatabase() {
  try {
    console.log('Starting Fly.io database setup...');
    
    // Initialize database tables
    await initializeDatabase();
    
    console.log('Fly.io database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Fly.io database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupFlyDatabase();
