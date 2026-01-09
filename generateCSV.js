const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const affiliateUrls = [
    'https://amzn.to/4rxA6EL',
    'https://amzn.to/3M60RjA',
    'https://amzn.to/4rxAfbh',
    'https://amzn.to/4rzOA6W',
    'https://amzn.to/3MzUIfu',
    'https://amzn.to/48zTpEN',
    'https://amzn.to/4iyKSXn',
    'https://amzn.to/3KsRzNS',
    'https://amzn.to/4pIhPD1'
];

async function fetchProduct(url) {
    try {
        // First, resolve the shortened URL
        const response = await axios.get(url, { maxRedirects: 0, validateStatus: () => true });
        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.location;
            const fullUrl = location.startsWith('http') ? location : 'https://www.amazon.com' + location;

            // Now fetch the product page
            const productResponse = await axios.get(fullUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                },
                timeout: 10000
            });

            const $ = cheerio.load(productResponse.data);

            const title = $('#productTitle').text().trim();
            let image = $('#landingImage').attr('src');
            if (!image) {
                image = $('#imgBlkFront').attr('src');
            }
            if (!image) {
                image = $('img[data-image-index="0"]').attr('src') || $('img[alt*="product"]').attr('src');
            }
            const price = $('#priceblock_ourprice').text().trim() || $('#priceblock_dealprice').text().trim() || $('#corePrice_desktop .a-price .a-offscreen').text().trim() || 'Price not available';

            return {
                name: title,
                url: url,
                image: image,
                price: price
            };
        }
    } catch (error) {
        console.error('Error fetching product:', error.message);
        return null;
    }
}

async function generateCSV() {
    const products = [];

    for (const url of affiliateUrls) {
        console.log('Fetching:', url);
        const product = await fetchProduct(url);
        if (product) {
            products.push(product);
        }
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Generate CSV content
    let csv = 'Name,URL,Image,Price\n';
    products.forEach(product => {
        const name = `"${product.name.replace(/"/g, '""')}"`;
        const url = product.url;
        const image = product.image;
        const price = `"${product.price}"`;
        csv += `${name},${url},${image},${price}\n`;
    });

    // Write to file
    fs.writeFileSync('products_full.csv', csv);
    console.log('CSV generated: products_full.csv');
}

generateCSV();