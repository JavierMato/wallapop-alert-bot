const fs = require('fs');
const axios = require('axios');

async function inspectHtml() {
  const res = await axios.get('https://es.wallapop.com/app/search?keywords=bicicleta', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    }
  });

  const html = res.data;
  fs.writeFileSync('scratch/search_page.html', html);

  // Search for any URLs in html
  const apiUrls = html.match(/https?:\/\/[^"'\s<>]+/g) || [];
  const uniqueUrls = Array.from(new Set(apiUrls));
  console.log('Found URLs:', uniqueUrls.filter(u => u.includes('api') || u.includes('search') || u.includes('wallapop')));

  // Search for script tags
  const scripts = html.match(/<script src="([^"]+)"/g) || [];
  console.log('Script tags count:', scripts.length);
  console.log('Sample scripts:', scripts.slice(0, 5));
}

inspectHtml();
