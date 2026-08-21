const axios = require('axios');

async function getExactErrors() {
  const url = 'https://api.wallapop.com/api/v3/general/search?keywords=bicicleta&latitude=40.416775&longitude=-3.703790';
  
  const headers = {
    'User-Agent': 'Wallapop/12.4.0 (iPhone; iOS 16.6; Scale/3.00)',
    'X-DeviceOS': '1',
    'Accept': 'application/json',
    'Accept-Language': 'es-ES',
  };

  console.log('--- DETALLES EXACTOS DE LA PETICIÓN Y RESPUESTA ---');
  console.log(`URL: ${url}`);
  
  try {
    const res = await axios.get(url, { headers, timeout: 5000 });
    console.log('STATUS:', res.status);
    console.log('HEADERS:', res.headers);
    console.log('DATA:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log('\n--- ERROR CAPTURADO ---');
    console.log('Error Name:', err.name);
    console.log('Error Message:', err.message);
    console.log('Error Code (Node/Axios):', err.code);

    if (err.response) {
      console.log('\n--- DETALLES DE LA RESPUESTA HTTP DEL SERVIDOR ---');
      console.log('HTTP Status Code:', err.response.status);
      console.log('HTTP Status Text:', err.response.statusText);
      console.log('\nHTTP Response Headers:');
      console.log(JSON.stringify(err.response.headers, null, 2));
      console.log('\nHTTP Response Body (Primeros 500 caracteres):');
      const bodyStr = typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : String(err.response.data);
      console.log(bodyStr.substring(0, 500));
    } else if (err.request) {
      console.log('\n--- SIN RESPUESTA DEL SERVIDOR (Error de Red/Timeout) ---');
      console.log(err.request);
    }
  }
}

getExactErrors();
