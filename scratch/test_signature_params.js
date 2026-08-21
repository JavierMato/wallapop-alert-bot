const crypto = require('crypto');
const axios = require('axios');

const SECRET_KEY = '9f8373b313bb652b07e5ab91238914b4';

function generateSignature(method, pathWithParams, timestamp) {
  const signatureString = `${method.toUpperCase()}|${pathWithParams}|${timestamp}|`;
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(signatureString);
  return hmac.digest('base64');
}

async function testSignatureParams() {
  const method = 'GET';
  const timestamp = Date.now().toString();

  const testPaths = [
    '/api/v3/general/search?keywords=bicicleta',
    '/api/v3/general/search?keywords=bicicleta&source=search_box',
    '/api/v3/general/search?keywords=bicicleta&category_ids=100',
    '/api/v3/general/search?keywords=bicicleta&latitude=40.416775&longitude=-3.703790',
    '/api/v3/general/search?items=bicicleta',
    '/api/v3/general/search?search_text=bicicleta',
    '/api/v3/general/search?keywords=iphone',
    '/api/v3/general/search?keywords=ps5',
    '/api/v3/general/search?keywords=bicicleta&density=3.00&language=es_ES',
  ];

  for (const path of testPaths) {
    const fullUrl = `https://api.wallapop.com${path}`;
    const signature = generateSignature(method, path, timestamp);

    const headers = {
      'User-Agent': 'Wallapop/12.4.0 (iPhone; iOS 16.6; Scale/3.00)',
      'X-DeviceOS': '1',
      'X-Signature': signature,
      'X-Timestamp': timestamp,
      'Accept': 'application/json',
      'Accept-Language': 'es-ES',
    };

    try {
      const res = await axios.get(fullUrl, { headers, timeout: 5000 });
      const objs = res.data?.search_objects || res.data?.items || [];
      console.log(`Path: ${path}`);
      console.log(` -> Status: ${res.status}, Objects count: ${objs.length}`);
      if (objs.length > 0) {
        console.log(' ---> FOUND REAL ITEMS! <---');
        console.log('Sample item:', objs[0].title, objs[0].price, objs[0].web_slug);
      }
    } catch (err) {
      console.log(`Path: ${path} -> FAILED ${err.response?.status || err.message}`);
    }
  }
}

testSignatureParams();
