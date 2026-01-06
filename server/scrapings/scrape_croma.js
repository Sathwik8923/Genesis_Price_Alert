// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

const scrapingcroma = async (name) => {

    puppeteer.use(StealthPlugin())
    
    puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
    
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: false,
        args: [
            '--disable-notifications'
        ]
    });

    const page = await browser.newPage();

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

            results.push({ title, price, image, link ,website : "Croma"});

            if (results.length == 3) { break; }
        }
        return results;
    })
    await browser.close();
    return products;
}

module.exports = scrapingcroma;