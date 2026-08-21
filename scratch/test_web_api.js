const axios = require('axios');

async function testWebApi() {
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  const endpoints = [
    'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta',
    'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta&source=search_box',
    'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta&category_ids=100',
    'https://es.wallapop.com/api/v3/general/search?keywords=bicicleta',
    'https://api.wallapop.com/api/v3/items?keywords=bicicleta',
    'https://api.wallapop.com/api/v3/search?keywords=bicicleta',
    'https://api.wallapop.com/api/v3/general/search?search_text=bicicleta',
  ];

  for (const ep of endpoints) {
    try {
      const res = await axios.get(ep, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'es-ES,es;q=0.9',
          'Origin': 'https://es.wallapop.com',
          'Referer': 'https://es.wallapop.com/',
          'DeviceOS': '0',
          'X-DeviceOS': '0',
        },
        timeout: 5000,
      });
      console.log(`[OK ${res.status}] Endpoint: ${ep}`);
      console.log('Keys:', Object.keys(res.data));
      if (res.data.search_objects) {
        console.log('search_objects:', res.data.search_objects.length);
        if (res.data.search_objects.length > 0) {
          console.log('Item 0:', res.data.search_objects[0].title);
        }
      }
    } catch (err) {
      console.log(`[ERR ${err.response?.status || err.message}] Endpoint: ${ep}`);
    }
  }
}

testWebApi();
