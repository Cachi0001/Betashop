require('dotenv').config();
const axios = require('axios');

async function testSimpleRegistration() {
  try {
    console.log('Testing simple owner registration without bank details...');
    
    const registrationData = {
      email: 'simple@example.com',
      password: 'password123',
      full_name: 'Simple Owner',
      phone: '+2348012345678',
      business_name: 'Simple Business',
      business_type: 'retail',
      address: {
        street: '123 Simple Street',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria'
      }
    };

    const response = await axios.post('http://localhost:3000/api/auth/owner-register', registrationData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('Registration successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Registration failed:');
    if (error.code === 'ECONNREFUSED') {
      console.error('Cannot connect to server. Make sure backend is running on port 3000');
    } else {
      console.error('Status:', error.response?.status);
      console.error('Error:', error.response?.data || error.message);
    }
  }
}

testSimpleRegistration();