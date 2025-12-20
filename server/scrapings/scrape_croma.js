const puppeteer = require('puppeteer');

const scrapingcroma = async (name) => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false,
        args: [
            '--disable-notifications'
        ]
    });

    const page = await browser.newPage();

    const context = browser.defaultBrowserContext();
    await context.overridePermissions('https://www.croma.com', ['geolocation']);

    await page.setGeolocation({
        latitude: 19.0760,
        longitude: 72.8777
    });

    await page.goto(`https://www.croma.com/searchB?q=${name}%3Arelevance&text=${name}`, {
        waitUntil: 'networkidle2'
    });

    await page.waitForSelector('li.product-item');


    const products = await page.evaluate(() => {
        const results = [];

        const getPriceNumber = (price) => {
            return Number(price.replace(/[^0-9]/g, ""));
        };

        const productDetails = document.querySelectorAll('li.product-item');

        for (const productDetail of productDetails) {
            const title = productDetail.querySelector('.product-title').textContent;
            const image = productDetail.querySelector('img').src;
            const link = "https://www.croma.com" + productDetail.querySelector('a').getAttribute('href');
            let price = productDetail.querySelector('.amount').textContent;

            price = getPriceNumber(price);

            results.push({ title, price, image, link });

            if (results.length == 3) { break; }
        }
        return results;
    })
    await browser.close();
    return products;
}

module.exports = scrapingcroma;