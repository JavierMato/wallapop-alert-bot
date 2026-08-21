const axios = require('axios');

async function testWeb() {
  const url = 'https://es.wallapop.com/app/search?keywords=bicicleta+carretera';
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      }
    });
    console.log('WEB STATUS:', res.status);
    console.log('HTML LEN:', res.data.length);

    // Extract item slugs from HTML
    const slugMatches = res.data.match(/\/item\/[a-z0-9\-]+\-\d+/g);
    console.log('REAL ITEM SLUGS FOUND:', slugMatches ? slugMatches.slice(0, 5) : 'NONE');
  } catch (err) {
    console.log('WEB ERROR:', err.message);
  }
}

testWeb();
