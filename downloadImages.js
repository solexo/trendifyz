const fs = require('fs');
const https = require('https');
const path = require('path');

// Read CSV
const csv = fs.readFileSync('canva_videos.csv', 'utf8');
const lines = csv.split('\n').slice(1); // skip header

const folder = 'images of products';

lines.forEach((line, index) => {
  if (!line.trim()) return;
  const cols = line.split(',');
  const imageUrl = cols[2]; // 3rd column is image URL
  if (!imageUrl || !imageUrl.startsWith('https://')) return;

  const filename = `product_${index + 1}.jpg`;
  const filepath = path.join(folder, filename);

  https.get(imageUrl, (res) => {
    if (res.statusCode !== 200) {
      console.error(`Failed to download ${filename}: ${res.statusCode}`);
      return;
    }
    const fileStream = fs.createWriteStream(filepath);
    res.pipe(fileStream);
    fileStream.on('finish', () => {
      console.log(`Downloaded ${filename}`);
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${filename}: ${err.message}`);
  });
});

console.log('Download script started. Images will be saved to "images of products" folder.');