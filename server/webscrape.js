const puppeteer = require('puppeteer')

const scrapeProduct = async (name) => {
    console.log("Scraping for:", name);
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false
    });
    const page = await browser.newPage();

    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    );

    await page.goto(`https://www.amazon.in/s?k=${name}`, {
        waitUntil: 'networkidle2'
    });

    await page.waitForSelector('div[data-component-type="s-search-result"]');

    const products = await page.evaluate(() => {

        const results = [];

        const productDetails = document.querySelectorAll('div[data-component-type="s-search-result"]');


        for (const productDetail of productDetails) {
            if (productDetail.textContent.includes("Sponsored")) { continue; }
            const title = productDetail.querySelector('a > h2 > span').textContent;
            const image = productDetail.querySelector('img.s-image').src;
            const link = "https://www.amazon.in" + productDetail.querySelector('.a-link-normal').getAttribute('href');


            let price = "N/A";

            const offscreen =
                productDetail.querySelector('span.a-offscreen');
            if (offscreen) {
                price = offscreen.textContent.trim();
            }

            if (price === "N/A") {
                const whole =
                    productDetail.querySelector('span.a-price-whole')?.textContent;
                const fraction =
                    productDetail.querySelector('span.a-price-fraction')?.textContent;

                if (whole) {
                    price = fraction ? `${whole}.${fraction}` : whole;
                }
            }

            if (price === "N/A") {
                const altPrice =
                    productDetail.querySelector(
                        'div.a-section.a-spacing-none.a-spacing-top-mini > div > span.a-color-base'
                    );

                if (altPrice) {
                    price = altPrice.textContent.trim();
                }
            }

            results.push({ title, price, image, link });
            if(results.length==3){break;}
        }
        return results;
    })

    // await page.screenshot({path : "example.png"});

    await browser.close();

    return products;
}

module.exports = scrapeProduct;