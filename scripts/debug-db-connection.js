// Debug script to check database connection configuration
require('dotenv').config();
const { URL } = require('url');

// Function to mask sensitive parts of the URL
function maskDatabaseUrl(url) {
  try {
    const parsedUrl = new URL(url);
    
    // Mask username and password if they exist
    if (parsedUrl.username) {
      parsedUrl.username = '****';
    }
    
    if (parsedUrl.password) {
      parsedUrl.password = '****';
    }
    
    return parsedUrl.toString();
  } catch (error) {
    return 'Invalid URL format';
  }
}

// Check if DATABASE_URL exists
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  console.log('DATABASE_URL exists with format:', maskDatabaseUrl(dbUrl));
  
  try {
    const url = new URL(dbUrl);
    
    console.log('Parsed URL components:');
    console.log('- Protocol:', url.protocol);
    console.log('- Host:', url.hostname);
    console.log('- Port:', url.port || '(default)');
    console.log('- Username exists:', !!url.username);
    console.log('- Password exists:', !!url.password);
    console.log('- Pathname:', url.pathname);
    console.log('- Search params:', url.search || '(none)');
    
    // Check if SSL should be disabled based on URL parameters
    const sslMode = url.searchParams.get('sslmode');
    const sslEnabled = sslMode !== 'disable';
    
    console.log(`SSL mode from URL: ${sslMode}, SSL will be ${sslEnabled ? 'enabled' : 'disabled'}`);
    
    // Try to create a connection config
    const config = {
      user: url.username || '',
      password: url.password || '',
      host: url.hostname,
      port: url.port || 5432,
      database: url.pathname ? url.pathname.substring(1) : 'postgres'
    };
    
    // Only add SSL configuration if not explicitly disabled
    if (sslEnabled) {
      config.ssl = {
        rejectUnauthorized: false,
        requestCert: true,
        secureOptions: require('constants').SSL_OP_NO_TLSv1_2
      };
    } else {
      console.log('SSL is disabled for this connection');
    }
    
    console.log('\nGenerated database config:');
    console.log('- Host:', config.host);
    console.log('- Port:', config.port);
    console.log('- Database:', config.database);
    console.log('- User exists:', !!config.user);
    console.log('- Password exists:', !!config.password);
    console.log('- SSL config:', JSON.stringify(config.ssl));
    
    // Test connection
    const { Pool } = require('pg');
    const pool = new Pool(config);
    
    console.log('\nAttempting to connect to database...');
    pool.connect()
      .then(client => {
        console.log('Successfully connected to the database!');
        client.release();
        pool.end();
      })
      .catch(err => {
        console.error('Error connecting to database:', err);
        pool.end();
      });
    
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error);
  }
} else {
  console.log('DATABASE_URL environment variable is not set');
}
