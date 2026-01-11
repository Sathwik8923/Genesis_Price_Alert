const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const scrapeProduct = async (name) => {
  console.log("🔍 Scraping for:", name);

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--disable-blink-features=AutomationControlled',
      '--start-maximized'
    ]
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/121.0.0.0 Safari/537.36'
  );

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  await new Promise(resolve => setTimeout(resolve, 5000));

  const url = `https://www.amazon.in/s?k=${encodeURIComponent(name)}`;

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });


await new Promise(resolve => setTimeout(resolve, 5000));

const blocked = await page.evaluate(() => {
  const h1 = document.querySelector('h1');
  return h1 && h1.innerText.includes('Oops');
});

if (blocked) {
  console.log("⛔ Amazon blocked this request.");
  await browser.close();
  return [];
}

  await page.waitForSelector('div[data-component-type="s-search-result"]', { timeout: 0 });

  const products = await page.evaluate(() => {
    const results = [];

    const productCards = document.querySelectorAll('div[data-component-type="s-search-result"]');

    const getNumber = (text) => Number(text.replace(/[^0-9]/g, ''));

    for (const card of productCards) {
      if (card.innerText.includes("Sponsored")) continue;

      const title = card.querySelector('a > h2 > span')?.innerText;
      const image = card.querySelector('img.s-image')?.src;
      const link = "https://www.amazon.in" + card.querySelector('a.a-link-normal')?.getAttribute('href');

      let price = "N/A";

      const offscreen = card.querySelector('span.a-offscreen');
      if (offscreen) price = offscreen.innerText;

      price = price !== "N/A" ? getNumber(price) : null;

      if (title && image && link && price) {
        results.push({ title, price, image, link, website: "Amazon" });
      }

      if (results.length === 5) break;
    }

    return results;
  });

  await browser.close();
  return products;
};

module.exports = scrapeProduct;