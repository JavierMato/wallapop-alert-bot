const axios = require('axios');

async function getRealWallapopItems() {
  // We can query Wallapop web search using desktop user agent and extract real item links from Next.js state or API
  const queries = ['bicicleta', 'playstation 5', 'macbook air', 'iphone'];

  for (const q of queries) {
    try {
      const url = `https://es.wallapop.com/search?keywords=${encodeURIComponent(q)}`;
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        }
      });

      const html = res.data;
      // Search for item slugs in the HTML string: /item/[slug]-[id]
      const matches = html.match(/\/item\/[a-z0-9\-]+\-\d+/g);
      console.log(`QUERY "${q}":`, matches ? matches.slice(0, 3) : 'NONE');
    } catch (e) {
      console.log(`QUERY "${q}" ERROR:`, e.message);
    }
  }
}

getRealWallapopItems();
