const axios = require('axios');

async function testEsApi() {
  const url = 'https://es.wallapop.com/api/v3/general/search?items=bicicleta';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'es-ES,es;q=0.9',
  };

  try {
    const res = await axios.get(url, { headers, timeout: 5000 });
    console.log('STATUS:', res.status);
    console.log('ITEMS COUNT:', res.data.search_objects?.length);
    if (res.data.search_objects?.length > 0) {
      const item = res.data.search_objects[0];
      console.log('REAL ITEM ID:', item.id);
      console.log('REAL WEB SLUG:', item.web_slug);
      console.log('REAL FULL URL:', `https://es.wallapop.com/item/${item.web_slug}`);
    }
  } catch (err) {
    console.log('ERROR:', err.message, err.response?.status);
  }
}

testEsApi();
