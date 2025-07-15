const https = require('https');


const API_KEY = '0d9ed8dbdc56012aa1b9161dc997a350'; // The API key we just set
const BASE_URL = 'wellness-platform-api.fly.dev'; // Your Fly.io domain

// Helper function to make HTTPS requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          console.log(`\n${method} ${path} - Status: ${res.statusCode}`);
          console.log(JSON.stringify(parsedData, null, 2));
          resolve({ status: res.statusCode, data: parsedData });
        } catch (error) {
          console.error('Error parsing response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`Error with request: ${error.message}`);
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('Testing health check endpoint...');
  return makeRequest('GET', '/api/health');
}

async function testRootEndpoint() {
  console.log('Testing root endpoint...');
  return makeRequest('GET', '/');
}

async function testGetClients() {
  console.log('Testing GET clients endpoint...');
  return makeRequest('GET', '/api/clients');
}

async function testGetAppointments() {
  console.log('Testing GET appointments endpoint...');
  return makeRequest('GET', '/api/appointments');
}

// Run all tests
async function runTests() {
  try {
    await testHealthCheck();
    await testRootEndpoint();
    await testGetClients();
    await testGetAppointments();

    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Test suite failed:', error);
  }
}

// Run the tests
runTests();
