const fs = require('fs');

// Import products from server.js (assuming it's in the same directory)
const products = require('./server.js').products || [];

function generateCanvaCSV() {
  // CSV headers for Canva bulk video generation
  let csv = 'Video Title,Description,Image URL,CTA Text,Category,Link\n';

  products.forEach(product => {
    const title = `"${product.name.replace(/"/g, '""')}"`;
    const description = `"${(product.review || product.whyBuy || '').replace(/"/g, '""')}"`;
    const imageUrl = product.image;
    const ctaText = '"Shop Now"';
    const category = `"${product.category}"`;
    const link = product.url;

    csv += `${title},${description},${imageUrl},${ctaText},${category},${link}\n`;
  });

  // Write to file
  fs.writeFileSync('canva_videos.csv', csv);
  console.log('Canva CSV generated: canva_videos.csv');
  console.log(`Generated ${products.length} video entries`);
}

generateCanvaCSV();