const axios = require('axios');

async function explore() {
  // Test 1: Wallapop API endpoints
  const urls = [
    'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta',
    'https://api.wallapop.com/api/v3/general/search?items=bicicleta',
    'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta&category_ids=100',
    'https://es.wallapop.com/buscar?keywords=bicicleta',
    'https://es.wallapop.com/app/search?keywords=bicicleta',
  ];

  const headersList = [
    {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'es-ES,es;q=0.9',
      'X-DeviceOS': '0',
    },
    {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'X-DeviceOS': '0',
    },
    {
      'User-Agent': 'Wallapop/1.0 (Mobile)',
      'X-DeviceOS': '0',
    }
  ];

  for (const url of urls) {
    console.log('\n--- TESTING URL:', url);
    for (let i = 0; i < headersList.length; i++) {
      try {
        const res = await axios.get(url, { headers: headersList[i], timeout: 5000 });
        console.log(`[OK] H${i} Status: ${res.status}, Type: ${typeof res.data}`);
        if (typeof res.data === 'object') {
          console.log('Object Keys:', Object.keys(res.data));
          if (res.data.search_objects) console.log('search_objects length:', res.data.search_objects.length);
          if (res.data.items) console.log('items length:', res.data.items.length);
        } else if (typeof res.data === 'string') {
          console.log('HTML length:', res.data.length);
          const nextDataMatch = res.data.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
          if (nextDataMatch) {
            const parsed = JSON.parse(nextDataMatch[1]);
            console.log('NEXT DATA PROPS KEYS:', Object.keys(parsed.props?.pageProps || {}));
            console.log('NEXT DATA STATE KEYS:', Object.keys(parsed.props?.pageProps?.initialState || {}));
            if (parsed.props?.pageProps?.initialState?.search) {
              console.log('Search State Keys:', Object.keys(parsed.props.pageProps.initialState.search));
            }
          }
        }
        break;
      } catch (err) {
        console.log(`[ERR] H${i} ${err.response?.status || err.message}`);
      }
    }
  }
}

explore();
