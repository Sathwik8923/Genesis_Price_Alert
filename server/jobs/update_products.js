const Products = require('../models/Products');
const scraping_price = require('./scrape_price');

const updating_products = async ()=>{
    const products =await Products.find({});
    for(const product of products){
        const newPrice = await scraping_price(
            product.purl,
            product.website
        )
        if (!newPrice) continue;
        // Always update price (up or down) so alert history is accurate
        if (newPrice !== product.currentprice) {
            product.currentprice = newPrice;
            product.lastcheckedAt = new Date();
        }
        product.priceHistory.push({ price: newPrice, date: new Date() });
        if (product.priceHistory.length > 90) {
            product.priceHistory = product.priceHistory.slice(-90);
        }
        await product.save();
    }
}

module.exports = updating_products;