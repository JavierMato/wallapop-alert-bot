const axios = require('axios');

async function testAll() {
  const query = 'bicicleta';
  const rawUrl = `https://api.wallapop.com/api/v3/general/search?keywords=${encodeURIComponent(query)}&latitude=40.416775&longitude=-3.703790`;
  const rawUrl2 = `https://api.wallapop.com/api/v3/general/search?items=${encodeURIComponent(query)}`;

  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(rawUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(rawUrl2)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl2)}`,
  ];

  console.log('--- TESTING PROXIES ---');
  for (const proxyUrl of proxies) {
    try {
      const res = await axios.get(proxyUrl, { timeout: 8000 });
      console.log(`[SUCCESS PROXY] ${proxyUrl.substring(0, 60)}...`);
      console.log('Status:', res.status);
      const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
      console.log('Search objects count:', data?.search_objects?.length || data?.items?.length || 0);
      if (data?.search_objects?.[0]) {
        console.log('Item 0 title:', data.search_objects[0].title);
        console.log('Item 0 web_slug:', data.search_objects[0].web_slug);
      }
    } catch (err) {
      console.log(`[FAILED PROXY] ${proxyUrl.substring(0, 60)}... Error: ${err.message}`);
    }
  }
}

testAll();
