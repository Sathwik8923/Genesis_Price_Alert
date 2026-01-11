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
    let price = null;
    if (website === "Amazon") {
        price = await page.evaluate(()=>{
            const el = document.querySelector('.a-price-whole');
            return el? el.textContent: null;
        })
    }
    else if (website === "Croma") {
        price = await page.evaluate(()=>{
            const el = document.querySelector('.amount');
            return el? el.textContent:null;
        })
    }
    else if(website === "Flipkart"){
        price = await page.evaluate(()=>{
            const el = document.querySelector('.hZ3P6w');
            return el? el.textContent:null;
        })
    }
    else {
        price = await page.evaluate(()=>{
            const box =  document.querySelector('.product-price');
            if(!box){
                return null;
            }
            return box.textContent || box.innerHTML;
        })
    }
    await browser.close();
    if (!price) return null;
    price = getPriceNumber(price);
    return price;
}

module.exports=scraping_price;