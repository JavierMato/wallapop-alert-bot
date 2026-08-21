const axios = require('axios');

async function testWallapopHeaders() {
  const configs = [
    {
      name: 'Web Chrome Headers',
      url: 'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta&latitude=40.416775&longitude=-3.703790',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'es-ES,es;q=0.9',
        'Origin': 'https://es.wallapop.com',
        'Referer': 'https://es.wallapop.com/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
      }
    },
    {
      name: 'Mobile App headers',
      url: 'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta&latitude=40.416775&longitude=-3.703790',
      headers: {
        'User-Agent': 'Wallapop/12.4.0 (iPhone; iOS 16.6; Scale/3.00)',
        'X-DeviceOS': '1',
        'Accept': 'application/json',
      }
    },
    {
      name: 'Web search backend endpoint',
      url: 'https://es.wallapop.com/api/v3/general/search?keywords=bicicleta',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      }
    }
  ];

  for (const cfg of configs) {
    console.log(`\nTesting ${cfg.name}...`);
    try {
      const res = await axios.get(cfg.url, { headers: cfg.headers, timeout: 6000 });
      console.log(`SUCCESS! Status: ${res.status}`);
      if (res.data?.search_objects) {
        console.log(`Items count: ${res.data.search_objects.length}`);
        if (res.data.search_objects.length > 0) {
          console.log('Sample item:', res.data.search_objects[0].title, res.data.search_objects[0].web_slug);
        }
      } else {
        console.log('Data keys:', Object.keys(res.data));
      }
    } catch (err) {
      console.log(`FAILED: ${err.response?.status || err.message}`);
    }
  }
}

testWallapopHeaders();
