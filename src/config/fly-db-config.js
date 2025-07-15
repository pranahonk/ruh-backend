// Special configuration for Fly.io deployment
require('dotenv').config();
const { Pool } = require('pg');

// Parse DATABASE_URL if it exists (provided by Fly.io)
const getDbConfigFromUrl = () => {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    return null;
  }
  
  // Parse the URL to extract connection details
  try {
    const url = new URL(dbUrl);
    const [username, password] = url.auth.split(':');
    
    return {
      user: username,
      password: password,
      host: url.hostname,
      port: url.port || 5432,
      database: url.pathname.substring(1),
      ssl: url.searchParams.get('sslmode') === 'require' ? { rejectUnauthorized: false } : false
    };
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
