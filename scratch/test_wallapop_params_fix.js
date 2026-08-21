const axios = require('axios');

async function testFix() {
  const headers = {
    'User-Agent': 'Wallapop/12.4.0 (iPhone; iOS 16.6; Scale/3.00)',
    'X-DeviceOS': '1',
    'Accept': 'application/json',
    'Accept-Language': 'es-ES,es;q=0.9',
  };

  const queries = [
    'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta&latitude=40.416775&longitude=-3.703790&distance=500000',
    'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta&latitude=40.416775&longitude=-3.703790&order_by=creation_date_desc',
    'https://api.wallapop.com/api/v3/general/search?items=bicicleta&latitude=40.416775&longitude=-3.703790',
    'https://api.wallapop.com/api/v3/general/search?keywords=nintendo&latitude=40.416775&longitude=-3.703790',
    'https://api.wallapop.com/api/v3/general/search?keywords=iphone&latitude=40.416775&longitude=-3.703790',
    'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta&latitude=40.416775&longitude=-3.703790&source=search_box',
  ];

  for (const url of queries) {
    try {
      const res = await axios.get(url, { headers });
      console.log(`\nURL: ${url}`);
      console.log('Search Point:', res.data.search_point);
      console.log('Keywords in response:', res.data.keywords);
      console.log('Search objects count:', res.data.search_objects?.length);
      if (res.data.search_objects?.length > 0) {
        console.log('>>> GOT REAL ITEMS! <<<');
        console.log('Item 0:', res.data.search_objects[0].title);
        console.log('Item 0 web_slug:', res.data.search_objects[0].web_slug);
        console.log('Item 0 price:', res.data.search_objects[0].price);
        console.log('Item 0 image:', res.data.search_objects[0].images?.[0]?.original);
      }
    } catch (err) {
      console.log(`ERR for ${url}: ${err.message}`);
    }
  }
}

testFix();
