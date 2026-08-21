const axios = require('axios');

async function testEndpoints() {
  const endpoints = [
    {
      url: 'https://api.wallapop.com/api/v3/general/search?items=bicicleta',
      headers: {
        'User-Agent': 'Wget/1.21.4',
        'X-DeviceOS': '0',
        'Accept': '*/*',
      }
    },
    {
      url: 'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta',
      headers: {
        'User-Agent': 'Wallapop/1.0 (Android 11; Mobile)',
        'X-DeviceOS': '0',
      }
    },
    {
      url: 'https://es.wallapop.com/search?keywords=bicicleta',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      }
    }
  ];

  for (let i = 0; i < endpoints.length; i++) {
    try {
      console.log(`Testing [${i}] ${endpoints[i].url}`);
      const res = await axios.get(endpoints[i].url, { headers: endpoints[i].headers, timeout: 5000 });
      console.log(`[${i}] SUCCESS Status: ${res.status}`);
      if (res.data.search_objects) {
        console.log(`[${i}] Found ${res.data.search_objects.length} items`);
        console.log(`[${i}] First slug:`, res.data.search_objects[0]?.web_slug);
      }
    } catch (err) {
      console.log(`[${i}] ERROR:`, err.message, err.response?.status);
    }
  }
}

testEndpoints();
