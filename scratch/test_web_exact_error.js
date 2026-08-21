const axios = require('axios');

async function testWebExactError() {
  const url = 'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta';
  
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'es-ES,es;q=0.9',
    'Origin': 'https://es.wallapop.com',
    'Referer': 'https://es.wallapop.com/',
  };

  try {
    const res = await axios.get(url, { headers, timeout: 5000 });
    console.log('STATUS 200');
  } catch (err) {
    console.log('\n=== ERROR HTTP EN NAVEGADOR / AXIOS SINO CABECERAS DE APP ===');
    console.log('Status Code:', err.response?.status);
    console.log('Status Text:', err.response?.statusText);
    console.log('Headers:', err.response?.headers);
    console.log('Body:', err.response?.data);
  }
}

testWebExactError();
