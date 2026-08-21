const axios = require('axios');

async function testInspectHTML() {
  const url = 'https://es.wallapop.com/app/search?keywords=bicicleta+carretera';
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      }
    });
    const html = res.data;
    
    // Look for __NEXT_DATA__ or json scripts
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (nextDataMatch) {
      console.log('FOUND NEXT_DATA JSON!');
      const data = JSON.parse(nextDataMatch[1]);
      console.log('KEYS:', Object.keys(data.props?.pageProps || {}));
      const items = data.props?.pageProps?.searchCards || data.props?.pageProps?.items || [];
      console.log('ITEMS COUNT:', items.length);
      if (items.length > 0) {
        console.log('SAMPLE ITEM:', JSON.stringify(items[0], null, 2));
      }
    } else {
      console.log('NO NEXT_DATA, searching for item links or json...');
      const matches = html.match(/href="\/item\/([^"]+)"/g);
      console.log('HREF MATCHES:', matches ? matches.slice(0, 5) : 'NONE');
    }
  } catch (err) {
    console.log('ERROR:', err.message);
  }
}

testInspectHTML();
