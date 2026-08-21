const axios = require('axios');

async function testHeaderCombinations() {
  const userAgents = [
    'Wallapop/12.4.0 (iPhone; iOS 16.6; Scale/3.00)',
    'Wallapop/12.4.0 (Android 13; Scale/2.75)',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    'Dalvik/2.1.0 (Linux; U; Android 11; Pixel 4 Build/RQ3A.210905.001)',
    'Wget/1.21.4',
    'curl/7.68.0'
  ];

  for (const ua of userAgents) {
    try {
      const res = await axios.get('https://api.wallapop.com/api/v3/general/search?items=bicicleta', {
        headers: {
          'User-Agent': ua,
          'X-DeviceOS': '0',
          'Accept': 'application/json',
          'Accept-Language': 'es-ES',
        },
        timeout: 5000
      });
      console.log(`[SUCCESS] UA "${ua}": status ${res.status}, items: ${res.data?.search_objects?.length}`);
      if (res.data?.search_objects?.length > 0) {
        console.log('REAL ITEM 0 SLUG:', res.data.search_objects[0].web_slug);
      }
    } catch (err) {
      console.log(`[FAILED] UA "${ua}": status ${err.response?.status || err.message}`);
    }
  }
}

testHeaderCombinations();
