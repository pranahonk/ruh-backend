const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  // Connect to PostgreSQL default database to create our application database
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres' // Connect to default database
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL default database');

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
