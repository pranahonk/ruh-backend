const http = require('http');
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          console.log(`\n${method} ${path} - Status: ${res.statusCode}`);
          console.log('Response:', JSON.stringify(parsedData, null, 2));
          resolve({ statusCode: res.statusCode, data: parsedData });
        } catch (error) {
          console.log(`\n${method} ${path} - Status: ${res.statusCode}`);
          console.log('Response:', responseData);
          resolve({ statusCode: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`Error with request ${method} ${path}:`, error);
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test API endpoints
async function testApi() {
  try {
    console.log('=== Testing Wellness Platform API ===');
    
    // Test health endpoint
    await makeRequest('GET', '/health');
    
    // Test clients endpoint
    const clientsResponse = await makeRequest('GET', '/api/clients');
    
    // Test creating a client
    const newClient = {
      name: 'Test Client',
      email: 'test@example.com',
      phone: '5551234567'
    };
    const createClientResponse = await makeRequest('POST', '/api/clients', newClient);
    
    // Test appointments endpoint
    const appointmentsResponse = await makeRequest('GET', '/api/appointments');
    
    // Test creating an appointment (using the client we just created)
    if (createClientResponse.statusCode === 201) {
      const clientId = createClientResponse.data.id;
      const newAppointment = {
        client_id: clientId,
        time: '2025-07-20T14:00:00Z'
      };
      await makeRequest('POST', '/api/appointments', newAppointment);
    }
    
    console.log('\n=== API Testing Complete ===');
  } catch (error) {
    console.error('API testing failed:', error);
  }
}

// Run the tests
testApi();
