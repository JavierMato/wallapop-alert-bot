const axios = require('axios');

async function checkChunk() {
  const url = 'https://web-static.wallapop.com/nextjs/_next/static/chunks/pages/search-9ae60e98d846f684.js';
  const res = await axios.get(url);
  const js = res.data;
  
  // Find any API paths or fetch endpoints
  const apiMatches = js.match(/\/api\/[a-zA-Z0-9_\/]+/g) || [];
  console.log('API Paths in search chunk:', Array.from(new Set(apiMatches)));

  // Find header names
  const headers = js.match(/X-[a-zA-Z0-9\-]+/g) || [];
  console.log('Custom X- Headers found:', Array.from(new Set(headers)));
}

checkChunk();
