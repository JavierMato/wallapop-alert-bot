const axios = require('axios');

async function testParseSearch() {
  const keywords = 'bicicleta';
  const url = `https://es.wallapop.com/search?keywords=${encodeURIComponent(keywords)}`;
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9',
      }
    });

    const html = res.data;
    // Look for items in __NEXT_DATA__
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (match) {
      const json = JSON.parse(match[1]);
      const searchCards = json.props?.pageProps?.searchCards || json.props?.pageProps?.initSearchCards?.cards || [];
      console.log('SEARCH CARDS COUNT:', searchCards.length);
      if (searchCards.length > 0) {
        console.log('FIRST CARD:', JSON.stringify(searchCards[0], null, 2));
      } else {
        // Find any item urls in pageProps
        const str = JSON.stringify(json.props?.pageProps || {});
        const itemUrls = str.match(/\/item\/[a-zA-Z0-9\-]+/g);
        console.log('FOUND ITEM URLS IN PROPS:', itemUrls ? itemUrls.slice(0, 5) : 'NONE');
      }
    } else {
      console.log('NO NEXT DATA MATCH');
    }
  } catch (err) {
    console.log('ERROR:', err.message);
  }
}

testParseSearch();
