const axios = require('axios');

async function testNominatim() {
  const queries = ['Alcalá de Henares', 'Mósto', 'Sevilla', 'Badalona'];

  for (const q of queries) {
    try {
      const res = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: q,
          format: 'json',
          addressdetails: 1,
          countrycodes: 'es',
          limit: 3
        },
        headers: {
          'User-Agent': 'WallapopAlertBotTest/1.0',
        }
      });

      console.log(`\nQuery: "${q}" -> Results: ${res.data.length}`);
      if (res.data.length > 0) {
        console.log(' Top result:', res.data[0].display_name);
        console.log(' Lat, Lon:', res.data[0].lat, res.data[0].lon);
      }
    } catch (err) {
      console.log(`Query: "${q}" -> Error: ${err.message}`);
    }
  }
}

testNominatim();
