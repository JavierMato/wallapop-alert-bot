const axios = require('axios');
const fs = require('fs');

async function inspectHTML() {
  const url = 'https://es.wallapop.com/search?keywords=bicicleta';
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });
    fs.writeFileSync('scratch/search_page.html', res.data);
    console.log('Saved search_page.html. Length:', res.data.length);

    // Regex search for item slugs or links in html
    const matches = res.data.match(/item\/[a-zA-Z0-9\-]+/g);
    console.log('ITEM MATCHES:', matches ? matches.slice(0, 10) : 'NONE');

    const cardMatches = res.data.match(/class="[^\"]*card[^\"]*"/g);
    console.log('CARD MATCHES:', cardMatches ? cardMatches.slice(0, 5) : 'NONE');
  } catch (err) {
    console.log('ERROR:', err.message);
  }
}

inspectHTML();
