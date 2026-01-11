const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

// 🔧 Normalize text
const normalize = text =>
  text.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

const scrapingReliance = async (name) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    args: ['--disable-notifications']
  });

  const page = await browser.newPage();

  const queryWords = normalize(name).split(' ').filter(w => w.length > 2);

  await page.goto('https://www.reliancedigital.in/', {
    waitUntil: 'domcontentloaded'
  });

  await page.waitForSelector('input.search-input', { timeout: 20000 });
  await page.type('input.search-input', name, { delay: 120 });
  await page.keyboard.press('Enter');

  await page.waitForSelector('.main-grid', { timeout: 10000 });

  // Let lazy images load
  await new Promise(resolve => setTimeout(resolve, 3000));

  const products = await page.evaluate((queryWords) => {
    const results = [];

    const normalize = text =>
      text.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

    const getPriceNumber = price =>
      Number(price.replace(/[^0-9]/g, ''));

    const productCards = document.querySelectorAll('.main-grid .product-card');

    for (const product of productCards) {
      const titleEl = product.querySelector('.product-card-title');
      const priceEl = product.querySelector('.price');
      const linkEl = product.querySelector('.details-container');
      const imgEl =
        product.querySelector('.product-card-image>picture>source');

      if (!titleEl || !priceEl || !linkEl) continue;

      const title = titleEl.innerText.trim();
      const cleanTitle = normalize(title);

      // 🧠 Relevance filtering
      const isRelevant = queryWords.some(word => cleanTitle.includes(word));
      if (!isRelevant) continue;

      let price = getPriceNumber(priceEl.innerText);
      price = price / 100;

      const image =
        imgEl?.getAttribute('src') ||
        imgEl?.getAttribute('srcset') ||
        null;

      const link = linkEl.href;

      if (!price || !image) continue;

      results.push({
        title,
        price,
        image,
        link,
        website: "Reliance Digital"
      });

      if (results.length === 5) break;
    }

    return results;
  }, queryWords);

  await browser.close();
  return products;
};

module.exports = scrapingReliance;
