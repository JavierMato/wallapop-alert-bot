const axios = require('axios');

async function testParams() {
  const headers = {
    'User-Agent': 'Wallapop/12.4.0 (iPhone; iOS 16.6; Scale/3.00)',
    'X-DeviceOS': '1',
    'Accept': 'application/json',
  };

  const paramNames = [
    'keywords',
    'items',
    'search_text',
    'query',
    'k',
  ];

  for (const paramName of paramNames) {
    const url = `https://api.wallapop.com/api/v3/general/search?${paramName}=bicicleta`;
    try {
      const res = await axios.get(url, { headers, timeout: 5000 });
      console.log(`Param "${paramName}": Status ${res.status}`);
      const objects = res.data?.search_objects || res.data?.items || res.data?.search_result?.items;
      console.log(`  Data keys:`, Object.keys(res.data));
      console.log(`  Items count:`, objects ? objects.length : 'undefined');
      if (objects && objects.length > 0) {
        console.log(`  SUCCESS! First item:`, objects[0].title, objects[0].web_slug, objects[0].price);
      }
    } catch (err) {
      console.log(`Param "${paramName}": FAILED ${err.response?.status || err.message}`);
    }
  }
}

testParams();
