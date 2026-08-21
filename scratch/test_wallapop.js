const axios = require('axios');

async function testWallapop() {
  const url = 'https://api.wallapop.com/api/v3/general/search?items=bicicleta&category_ids=12485';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'es-ES,es;q=0.9',
    'X-DeviceOS': '0',
  };

  try {
    const res = await axios.get(url, { headers, timeout: 5000 });
    console.log('STATUS:', res.status);
    console.log('ITEMS COUNT:', res.data.search_objects?.length);
    if (res.data.search_objects?.length > 0) {
      console.log('SAMPLE ITEM:', res.data.search_objects[0]);
    }
  } catch (err) {
    console.log('ERROR:', err.message, err.response?.status);
  }
}

testWallapop();
