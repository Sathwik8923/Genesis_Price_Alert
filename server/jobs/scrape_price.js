const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

puppeteer.use(StealthPlugin())

puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

const getPriceNumber = (text) =>{
    return Number(text.replace(/[^0-9]/g, ''));
}

const scraping_price = async (url, website) => {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: false
    });
    const page = await browser.newPage();

    await page.goto(url, {
        waitUntil: 'networkidle2'
    });
    let price;
    if (website === "Amazon") {
        price = await page.evaluate(()=>{
            return document.querySelector('.a-price-whole').textContent;
        })
    }
    else if (website === "Croma") {
        price = await page.evaluate(()=>{
            return document.querySelector('.amount').textContent;
        })
    }
    else {
        price = await page.evaluate(()=>{
            return document.querySelector('.hZ3P6w').textContent;
        })
    }
    await browser.close();
    price = getPriceNumber(price);
    return price;
}

module.exports=scraping_price;