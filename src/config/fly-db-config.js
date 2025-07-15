// Special configuration for Fly.io deployment
require('dotenv').config();
const { Pool } = require('pg');
const constants = require('constants');

// Parse DATABASE_URL if it exists (provided by Fly.io)
const getDbConfigFromUrl = () => {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.log('No DATABASE_URL environment variable found');
    return null;
  }
  
  console.log('Found DATABASE_URL, attempting to parse...');
  
  // Parse the URL to extract connection details
  try {
    const url = new URL(dbUrl);
    
    // Handle auth - might be undefined in some connection strings
    let user = '';
    let password = '';
    
    if (url.username) {
      user = decodeURIComponent(url.username);
    }
    
    if (url.password) {
      password = decodeURIComponent(url.password);
    }
    
    // Extract database name from pathname (remove leading slash)
    const database = url.pathname ? url.pathname.substring(1) : 'postgres';
    
    // Check if SSL should be disabled based on URL parameters
    const sslMode = url.searchParams.get('sslmode');
    const sslEnabled = sslMode !== 'disable';
    
    console.log(`SSL mode from URL: ${sslMode}, SSL will be ${sslEnabled ? 'enabled' : 'disabled'}`);
    
    const config = {
      user,
      password,
      host: url.hostname,
      port: url.port || 5432,
      database
    };
    
    // Only add SSL configuration if not explicitly disabled
    if (sslEnabled) {
      config.ssl = {
        rejectUnauthorized: false,
        requestCert: true,
        secureOptions: constants.SSL_OP_NO_TLSv1_2
      };
    } else {
      console.log('SSL is disabled for this connection');
    }
    
    console.log(`Successfully parsed DATABASE_URL. Connecting to ${config.host}:${config.port}/${config.database}`);
    return config;
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error);
    return null;
  }
};

// Get config from DATABASE_URL or fall back to individual env vars
const dbConfig = getDbConfigFromUrl() || {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME
};

// Create a new pool using the configuration
const pool = new Pool(dbConfig);

// Export the query method and the pool
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
