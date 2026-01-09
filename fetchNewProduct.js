const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const affiliateUrls = [
    'https://amzn.to/4piUJSF',
    'https://amzn.to/4qtVLfM',
    'https://amzn.to/4pWHfx5',
    'https://amzn.to/49wj8iY',
    'https://amzn.to/3LbgfuO',
    'https://amzn.to/4awZtAF',
    'https://amzn.to/4pgiieW',
    'https://amzn.to/4sbFxcN',
    'https://amzn.to/4aCmfHq',
    'https://amzn.to/4jhIGnh',
    'https://amzn.to/4qtKYSD',
    'https://amzn.to/3Yfh5ty',
    'https://amzn.to/44NBSYH',
    'https://amzn.to/4awBeT9',
    'https://amzn.to/4sg3oYT'
];

async function fetchProduct(url) {
    try {
        // First, resolve the shortened URL
        const response = await axios.get(url, { maxRedirects: 0, validateStatus: () => true });
        let fullUrl;
        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.location;
            console.log('Redirect to:', location);
            // Assume location is the full URL
            fullUrl = location.startsWith('http') ? location : 'https://www.amazon.com' + location;
            console.log('Full URL:', fullUrl);
        } else {
            console.log('No redirect, using direct URL, status:', response.status);
            fullUrl = url;
        }

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
            // Try other selectors
            image = $('img[data-image-index="0"]').attr('src') || $('img[alt*="product"]').attr('src');
        }

        // Get additional images
        const images = [];
        if (image) images.push(image);
        // Get all image sources from various selectors
        $('img[data-image-index], .a-dynamic-image, img[alt*="product"]').each((i, el) => {
            const src = $(el).attr('data-old-hires') || $(el).attr('src');
            if (src && src.includes('m.media-amazon.com') && !images.includes(src)) {
                images.push(src);
            }
        });
        // Limit to 3 images
        const limitedImages = images.slice(0, 3);

        const price = $('#priceblock_ourprice').text().trim() || $('#priceblock_dealprice').text().trim() || $('#corePrice_desktop .a-price .a-offscreen').text().trim() || 'Price not available';

        console.log('Fetched:', title);

        return {
            name: title,
            url: url,
            image: image,
            images: limitedImages,
            price: price
        };
    } catch (error) {
        console.error('Error fetching product from', url, ':', error.message);
        return null;
    }
}

(async () => {
    const promises = affiliateUrls.map(url => fetchProduct(url));
    const products = await Promise.all(promises);
    const validProducts = products.filter(p => p !== null);
    // Read existing products
    let existingProducts = [];
    if (fs.existsSync('products.json')) {
        const data = fs.readFileSync('products.json', 'utf8');
        existingProducts = JSON.parse(data);
    }
    // Filter new products not already in existing
    const newProducts = validProducts.filter(p => !existingProducts.some(ep => ep.url === p.url));
    // Append new products
    existingProducts.push(...newProducts);
    // Write back
    fs.writeFileSync('products.json', JSON.stringify(existingProducts, null, 2));
    console.log('Added', newProducts.length, 'new products to products.json');
})();