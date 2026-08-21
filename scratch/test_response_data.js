const axios = require('axios');

async function testInspectResponse() {
  const headers = {
    'User-Agent': 'Wallapop/12.4.0 (iPhone; iOS 16.6; Scale/3.00)',
    'X-DeviceOS': '1',
    'Accept': 'application/json',
    'Accept-Language': 'es-ES',
  };

  const url = 'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta&latitude=40.416775&longitude=-3.703790';
  const res = await axios.get(url, { headers });
  console.log(JSON.stringify(res.data, null, 2));
}

testInspectResponse();
