/**
 * Simple test script to test authentication
 * Run this with: node test-auth.js
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test 1: Register a new user
    console.log('1️⃣ Testing user registration...');
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      }),
    });

    const registerData = await registerResponse.json();
    console.log('Register response:', registerData);

    if (registerData.success) {
      console.log('✅ Registration successful!');
      const token = registerData.data.token;
      
      // Test 2: Test shop data with authentication
      console.log('\n2️⃣ Testing shop data with authentication...');
      const shopResponse = await fetch(`${BASE_URL}/api/shop/complete`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const shopData = await shopResponse.json();
      console.log('Shop data response:', shopData);

      if (shopData.success) {
        console.log('✅ Shop data retrieved successfully!');
      } else {
        console.log('❌ Failed to retrieve shop data:', shopData.message);
      }
    } else {
      console.log('❌ Registration failed:', registerData.message);
    }

    // Test 3: Test login
    console.log('\n3️⃣ Testing user login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (loginData.success) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed:', loginData.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAuth();
