const fs = require('fs');

function inspectDeep() {
  const html = fs.readFileSync('scratch/search_page.html', 'utf8');

  console.log('HTML Total Length:', html.length);

  // 1. Find all script tags
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let scriptCount = 0;
  while ((match = scriptRegex.exec(html)) !== null) {
    scriptCount++;
    const content = match[1];
    if (content.includes('item') || content.includes('price') || content.includes('title') || content.includes('card')) {
      console.log(`\nScript #${scriptCount} snippet (len ${content.length}):`, content.substring(0, 300));
    }
  }

  // 2. Find any occurrences of 'item/' or price patterns
  const itemLinks = html.match(/\/item\/[^\s"'>]+/g) || [];
  console.log('\nItem Links found:', Array.from(new Set(itemLinks)).slice(0, 10));

  // 3. Find image URLs
  const imgUrls = html.match(/https?:\/\/[^\s"'>]+\.(jpg|jpeg|png|webp)/gi) || [];
  console.log('\nImage URLs found:', Array.from(new Set(imgUrls)).slice(0, 5));
}

inspectDeep();
