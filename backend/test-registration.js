require('dotenv').config();
const axios = require('axios');

async function testRegistration() {
  try {
    console.log('Testing owner registration...');
    
    const registrationData = {
      email: 'testowner@example.com',
      password: 'password123',
      full_name: 'Test Owner',
      phone: '+2348012345678',
      business_name: 'Test Business',
      business_type: 'retail',
      address: {
        street: '123 Test Street',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria'
      },
      bank_details: {
        account_name: 'Test Owner',
        account_number: '0123456789',
        bank_name: 'Access Bank',
        bank_code: '044'
      }
    };

    const response = await axios.post('http://localhost:3000/api/auth/owner-register', registrationData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Registration successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Registration failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
  }
}

testRegistration();