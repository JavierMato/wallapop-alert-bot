const axios = require('axios');

async function testLocationParams() {
  const headers = {
    'User-Agent': 'Wallapop/12.4.0 (iPhone; iOS 16.6; Scale/3.00)',
    'X-DeviceOS': '1',
    'Accept': 'application/json',
    'Accept-Language': 'es-ES',
  };

  const tests = [
    { name: 'keywords + lat/lng', url: 'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta&latitude=40.416775&longitude=-3.703790' },
    { name: 'keywords + lat/lng + distance', url: 'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta&latitude=40.416775&longitude=-3.703790&distance=50000' },
    { name: 'keywords + step=0', url: 'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta&step=0' },
    { name: 'keywords + category_ids=100', url: 'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta&category_ids=100' },
    { name: 'keywords + order_by=most_relevant', url: 'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta&order_by=most_relevant' },
    { name: 'keywords + order_by=creation_date_desc', url: 'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta&order_by=creation_date_desc' },
    { name: 'no keywords (lat/lng)', url: 'https://api.wallapop.com/api/v3/general/search?latitude=40.416775&longitude=-3.703790' },
    { name: 'keywords=ps5', url: 'https://api.wallapop.com/api/v3/general/search?keywords=ps5&latitude=40.416775&longitude=-3.703790' },
  ];

  for (const t of tests) {
    try {
      const res = await axios.get(t.url, { headers, timeout: 5000 });
      const count = res.data?.search_objects?.length || 0;
      console.log(`[${t.name}] Status: ${res.status}, search_objects: ${count}`);
      if (count > 0) {
        const item = res.data.search_objects[0];
        console.log('   SAMPLE ITEM 0:', {
          id: item.id,
          title: item.title,
          price: item.price,
          web_slug: item.web_slug,
          user_id: item.user?.id,
          images: item.images?.[0]?.original,
        });
      }
    } catch (err) {
      console.log(`[${t.name}] FAILED: ${err.response?.status || err.message}`);
    }
  }
}

testLocationParams();
