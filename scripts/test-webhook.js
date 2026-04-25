const axios = require('axios');

/**
 * TEST SCRIPT: Simulate a WhatsApp Webhook response
 * Run this from your terminal to test if your dashboard handles responses correctly.
 */

const LOCAL_URL = 'http://localhost:3000/api/whatsapp/webhook';
const TEST_PHONE = '918755884929'; // Change this to your registered number in MongoDB
const VERIFY_TOKEN = 'naruto'; // From your .env.local

async function testVerification() {
  console.log('Testing Webhook Verification (GET)...');
  try {
    const res = await axios.get(`${LOCAL_URL}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=12345`);
    console.log('Verification status:', res.status);
    console.log('Verification response:', res.data);
    if (res.data === 12345) console.log('✅ GET Verification passed!');
  } catch (err) {
    console.error('❌ GET Verification failed:', err.message);
  }
}

async function testResponse(text = 'YES') {
  console.log(`\nSimulating incoming message: "${text}" from ${TEST_PHONE}...`);
  const payload = {
    object: 'whatsapp_business_account',
    entry: [{
      changes: [{
        value: {
          messages: [{
            from: TEST_PHONE,
            text: { body: text }
          }]
        },
        field: 'messages'
      }]
    }]
  };

  try {
    const res = await axios.post(LOCAL_URL, payload);
    console.log('POST status:', res.status);
    console.log('POST response:', res.data);
    console.log('✅ POST Request successful! Check your terminal and WhatsApp (if using live tokens) for results.');
  } catch (err) {
    console.error('❌ POST Request failed:', err.response?.data || err.message);
  }
}

async function run() {
  await testVerification();
  // Change 'YES' to 'BAL' or 'HELP' to test other commands
  await testResponse('YES'); 
}

run();
