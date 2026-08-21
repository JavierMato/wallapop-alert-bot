const axios = require('axios');

async function testMobileParams() {
  const headers = {
    'User-Agent': 'Wallapop/12.4.0 (iPhone; iOS 16.6; Scale/3.00)',
    'X-DeviceOS': '1',
    'Accept': 'application/json',
    'Accept-Language': 'es-ES',
  };

  const urls = [
    'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta',
    'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta&latitude=40.416775&longitude=-3.703790',
    'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta&latitude=40.416775&longitude=-3.703790&order_by=creation_date_desc',
    'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta&latitude=40.416775&longitude=-3.703790&distance=100000',
    'https://api.wallapop.com/api/v3/general/search?items=bicicleta&latitude=40.416775&longitude=-3.703790',
    'https://api.wallapop.com/api/v3/general/search?search_text=bicicleta&latitude=40.416775&longitude=-3.703790',
    'https://api.wallapop.com/api/v3/search?keywords=bicicleta',
    'https://api.wallapop.com/api/v3/search?keywords=bicicleta&latitude=40.416775&longitude=-3.703790',
  ];

  for (const url of urls) {
    try {
      const res = await axios.get(url, { headers, timeout: 5000 });
      console.log(`\nURL: ${url}`);
      console.log(`Status: ${res.status}`);
      console.log(`Data keys: ${Object.keys(res.data)}`);
      const objs = res.data?.search_objects || res.data?.items || res.data?.search_result?.items || [];
      console.log(`Objects length: ${objs.length}`);
      if (objs.length > 0) {
        console.log('>>> GOT ITEMS! <<<');
        console.log('Sample item:', objs[0].title, objs[0].price, objs[0].web_slug);
      }
    } catch (err) {
      console.log(`\nURL: ${url} -> ERR ${err.response?.status || err.message}`);
      if (err.response?.data) {
        console.log('Error data:', JSON.stringify(err.response.data).substring(0, 200));
      }
    }
  }
}

testMobileParams();
