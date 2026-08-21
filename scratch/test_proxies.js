const axios = require('axios');

async function testProxies() {
  const targetUrl = 'https://api.wallapop.com/api/v3/general/search?items=bicicleta';
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    `https://thingproxy.freeboard.io/fetch/${targetUrl}`,
  ];

  for (const p of proxies) {
    try {
      console.log('Testing proxy:', p);
      const res = await axios.get(p, {
        headers: {
          'User-Agent': 'Wget/1.21.4',
          'X-DeviceOS': '0',
        },
        timeout: 6000
      });
      console.log('SUCCESS! Status:', res.status, 'Items count:', res.data?.search_objects?.length);
      if (res.data?.search_objects?.length > 0) {
        console.log('REAL ITEM SLUG:', res.data.search_objects[0].web_slug);
        console.log('REAL ITEM URL:', `https://es.wallapop.com/item/${res.data.search_objects[0].web_slug}`);
      }
    } catch (e) {
      console.log('FAILED:', e.message);
    }
  }
}

testProxies();
