const axios = require('axios');
const cheerio = require('cheerio');

const affiliateUrls = [
    'https://amzn.to/48lYgcs',
    'https://amzn.to/4rEO6ge',
    'https://amzn.to/48NZ8In',
    'https://amzn.to/4oyHzAW',
    'https://amzn.to/48Og2Xi',
    'https://amzn.to/4pJhLD1',
    'https://amzn.to/4rtM02p',
    'https://amzn.to/3Xxi2gf',
    'https://amzn.to/4ovb3iQ',
    'https://amzn.to/4pOYIY8',
    'https://amzn.to/3Xxi7k3',
    'https://amzn.to/4pJhMXB',
    'https://amzn.to/441yPfg',
    'https://amzn.to/4ovmTK0',
    'https://amzn.to/3Y2ai67',
    'https://amzn.to/443sShK',
    'https://amzn.to/44FAx67',
    'https://amzn.to/4aqfyYC'
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
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    'Cache-Control': 'max-age=0',
                    'Referer': 'https://www.amazon.com/'
                },
                timeout: 15000
            });

            const $ = cheerio.load(productResponse.data);

            const title = $('#productTitle').text().trim() || $('.a-size-large.product-title-word-break').text().trim();
            let image = $('#landingImage').attr('data-old-hires') || $('#landingImage').attr('src');
            if (!image) {
                image = $('#imgTagWrapperId img').attr('src');
            }
            if (!image) {
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

            const price = $('.a-price .a-offscreen').first().text().trim() || $('#priceblock_ourprice').text().trim() || $('#priceblock_dealprice').text().trim() || 'Price not available';

            console.log('Product:', title);
            console.log('Image:', image);

            return {
                name: title,
                url: url,
                image: image,
                images: limitedImages,
                price: price
            };
        }
    } catch (error) {
        console.error('Error fetching product:', error.message);
        return null;
    }
}

async function fetchAllProducts() {
    const products = [];

    for (const url of affiliateUrls) {
        console.log('Fetching:', url);
        const product = await fetchProduct(url);
        if (product) {
            products.push(product);
        }
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return products;
}

fetchAllProducts().then(products => {
    console.log('Fetched', products.length, 'products');
    console.log(JSON.stringify(products, null, 2));
    // Write to file
    const fs = require('fs');
    fs.writeFileSync('products_new.json', JSON.stringify(products, null, 2));
    console.log('Products saved to products_new.json');
});