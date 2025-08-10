require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testImageUpload() {
  try {
    console.log('🚀 Testing Image Upload...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'onyemechicaleb40@gmail.com',
      password: '111111111'
    });
    const authToken = loginResponse.data.data.token;
    console.log('✅ Admin logged in successfully');

    // Step 2: Create a simple test image buffer
    console.log('\n2. Creating test image...');
    
    // Create a simple 1x1 pixel PNG image buffer
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    console.log('✅ Test image buffer created');

    // Step 3: Test image upload
    console.log('\n3. Testing image upload...');
    
    const formData = new FormData();
    formData.append('image', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });

    try {
      const uploadResponse = await axios.post('http://localhost:3000/api/upload/image', formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${authToken}`
        }
      });

      console.log('✅ Image upload successful!');
      console.log('   URL:', uploadResponse.data.data.url);
      console.log('   Public ID:', uploadResponse.data.data.public_id);

      // Step 4: Test image deletion
      console.log('\n4. Testing image deletion...');
      const publicId = uploadResponse.data.data.public_id;
      
      const encodedPublicId = encodeURIComponent(publicId);
      const deleteResponse = await axios.delete(`http://localhost:3000/api/upload/image/${encodedPublicId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      console.log('✅ Image deletion successful!');
      console.log('   Result:', deleteResponse.data.message);

    } catch (uploadError) {
      console.log('❌ Image upload failed:');
      if (uploadError.response) {
        console.log('   Status:', uploadError.response.status);
        console.log('   Error:', uploadError.response.data);
      } else {
        console.log('   Error:', uploadError.message);
      }
    }

    console.log('\n🎉 Image upload test completed!');

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testImageUpload();