require('dotenv').config();
const { Pool } = require('pg');
const constants = require('constants');


const getDbConfigFromUrl = () => {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.log('No DATABASE_URL environment variable found');
    return null;
  }

  console.log('Found DATABASE_URL, attempting to parse...');


  try {
    const url = new URL(dbUrl);


    let user = '';
    let password = '';

    if (url.username) {
      user = decodeURIComponent(url.username);
    }

    if (url.password) {
      password = decodeURIComponent(url.password);
    }


    const database = url.pathname ? url.pathname.substring(1) : 'postgres';


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


    if (sslEnabled) {
      config.ssl = {
        rejectUnauthorized: false,
        requestCert: true,
        secureOptions: constants.SSL_OP_NO_TLSv1_2
      };
      console.log('SSL is enabled for this connection');
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


const dbConfig = getDbConfigFromUrl() || {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME
};


const pool = new Pool(dbConfig);


pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Database connection error:', err));

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
