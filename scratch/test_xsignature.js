const crypto = require('crypto');
const axios = require('axios');

// Secret keys documented in public reverse-engineering analysis for Wallapop
const SECRET_KEYS = [
  'wallapopSecretKey1',
  'wallapop',
  '9f8373b313bb652b07e5ab91238914b4',
  '314a51e60058e137452d3a3c945145b2061e56b82531a7ff7c30089ffc71b6fa'
];

function generateSignature(method, pathWithParams, timestamp, secretKey) {
  // Signature string formula: METHOD|PATH_AND_PARAMS|TIMESTAMP|
  const signatureString = `${method.toUpperCase()}|${pathWithParams}|${timestamp}|`;
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(signatureString);
  return hmac.digest('base64');
}

async function testXSignature() {
  const method = 'GET';
  const path = '/api/v3/general/search?keywords=bicicleta&latitude=40.416775&longitude=-3.703790';
  const fullUrl = `https://api.wallapop.com${path}`;
  const timestamp = Date.now().toString();

  console.log('--- Testing Wallapop X-Signature HMAC-SHA256 ---');
  console.log(`URL: ${fullUrl}`);
  console.log(`Timestamp: ${timestamp}\n`);

  for (let i = 0; i < SECRET_KEYS.length; i++) {
    const key = SECRET_KEYS[i];
    const signature = generateSignature(method, path, timestamp, key);

    const headers = {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
      'X-DeviceOS': '1',
      'X-Signature': signature,
      'X-Timestamp': timestamp,
      'Accept': 'application/json',
      'Accept-Language': 'es-ES',
    };

    try {
      console.log(`[Test ${i + 1}] Secret key snippet: "${key.substring(0, 10)}..."`);
      const res = await axios.get(fullUrl, { headers, timeout: 6000 });
      console.log(` -> SUCCESS! Status: ${res.status}`);
      const objects = res.data?.search_objects || res.data?.items || [];
      console.log(` -> Objects count: ${objects.length}`);
      if (objects.length > 0) {
        console.log(' -> SAMPLE ITEM:', objects[0].title, objects[0].price, objects[0].web_slug);
      }
    } catch (err) {
      console.log(` -> FAILED: Status ${err.response?.status || err.message}`);
    }
  }
}

testXSignature();
