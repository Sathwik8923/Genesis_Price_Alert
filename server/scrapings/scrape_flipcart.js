// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

const scrapingflipkart = async (name) => {

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

    await page.goto(`https://www.flipkart.com/search?q=${name}`, {
        waitUntil: 'networkidle2'
    });

    await page.waitForSelector('.lvJbLV');


const products = await page.evaluate(() => {
    const results = [];

    const getPriceNumber = (price) => {
        if (!price) return null;
        return Number(price.replace(/[^0-9]/g, ""));
    };

    const productDetails = document.querySelectorAll('.lvJbLV');

    for (const productDetail of productDetails) {

        let titleEl = productDetail.querySelector('.RG5Slk');
        let priceEl = productDetail.querySelector('.hZ3P6w');
        let imgEl = productDetail.querySelector('img');
        let linkEl = productDetail.querySelector('a');

        if (!titleEl || !priceEl || !imgEl || !linkEl){
            imgEl = productDetail.querySelector('img.UCc1lI');
            titleEl = productDetail.querySelector('a.pIpigb');
            linkEl = productDetail.querySelector('a.pIpigb');
            priceEl = productDetail.querySelector('a.fb4uj3>div>div.hZ3P6w');
            if(!titleEl || !priceEl || !imgEl || !linkEl){
                continue;
            }
        }

        const title = titleEl.textContent.trim();
        const price = getPriceNumber(priceEl.textContent);
        const image = imgEl.src;
        const link = "https://www.flipkart.com" + linkEl.getAttribute('href');

        results.push({ title, price, image, link,website : "Flipkart" });

        if (results.length === 3) break;
    }

    return results;
});

    await browser.close();
    return products;
}

module.exports = scrapingflipkart;