const axios = require('axios');
const crypto = require('crypto');

// Genera un UUID v4 aleatorio para device_id y search_id (no necesita ser "real")
function uuid() {
  return crypto.randomUUID();
}

// Genera un ID numérico grande, estilo mpid/trackingUserId (parece analítica, no de sesión)
function randomTrackingId() {
  return Math.floor(Math.random() * 9e18).toString();
}

async function testSearchSection() {
  const deviceId = uuid();
  const searchId = uuid();
  const trackingId = randomTrackingId();

  const params = {
    keywords: 'bicicleta',
    source: 'search_box',
    search_id: searchId,
    latitude: '40.416775',
    longitude: '-3.703790',
    order_by: 'most_relevance',
    search_country: 'ES',
    section_type: 'organic_search_results',
    // category_id: omitido a propósito en el primer intento para ver si busca en todas las categorías
  };

  const headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'es,es-ES;q=0.9',
    'deviceos': '0',
    'x-deviceos': '0',
    'mpid': trackingId,
    'trackinguserid': trackingId,
    'x-appversion': '826230',
    'x-deviceid': deviceId,
    'origin': 'https://es.wallapop.com',
    'referer': 'https://es.wallapop.com/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
  };

  console.log('device_id generado:', deviceId);
  console.log('search_id generado:', searchId);
  console.log('tracking_id generado:', trackingId);

  try {
    const res = await axios.get('https://api.wallapop.com/api/v3/search/section', {
      params,
      headers,
      timeout: 10000,
      validateStatus: () => true,
    });

    console.log('\nHTTP status:', res.status);
    console.log('Respuesta completa (primeros 2000 chars):');
    console.log(JSON.stringify(res.data, null, 2).substring(0, 2000));
  } catch (err) {
    console.log('ERROR:', err.response?.status || err.message);
    if (err.response?.data) {
      console.log('Body error:', JSON.stringify(err.response.data).substring(0, 500));
    }
  }
}

testSearchSection();
