const { Client } = require('pg');
require('dotenv').config();


function getDbConfigFromUrl() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return null;
  }

  try {
    const url = new URL(dbUrl);
    const [username, password] = url.auth.split(':');

    return {
      user: username,
      password: password,
      host: url.hostname,
      port: url.port || 5432,
      database: url.pathname.substring(1) || 'postgres',
      ssl: url.searchParams.get('sslmode') === 'require' ? { rejectUnauthorized: false } : false
    };
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error);
    return null;
  }
}

async function createDatabase() {
  // Get connection config from DATABASE_URL or fall back to individual env vars
  const dbConfig = getDbConfigFromUrl() || {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres' // Connect to default database
  };

  // If we're using DATABASE_URL, we don't need to create a database
  // as Fly.io has already created it for us
  const usingFlyDb = !!process.env.DATABASE_URL;

  // Connect to PostgreSQL
  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('Connected to PostgreSQL default database');

    // If using Fly.io, the database is already created for us
    if (usingFlyDb) {
      console.log('Using Fly.io managed database - skipping database creation');
    } else {
      // Check if database already exists
      const checkResult = await client.query(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        [process.env.DB_NAME]
      );

      if (checkResult.rows.length === 0) {
        // Database doesn't exist, create it
        console.log(`Creating database: ${process.env.DB_NAME}`);
        await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
        console.log(`Database ${process.env.DB_NAME} created successfully`);
      } else {
        console.log(`Database ${process.env.DB_NAME} already exists`);
      }
    }

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the database creation function
createDatabase()
  .then(() => {
    console.log('Database setup script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Database setup script failed:', error);
    process.exit(1);
  });
