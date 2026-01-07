const cron = require('node-schedule');
const updateProducts = require('./update_products');
const updateTargetPrices = require('./update_users_price');

const job = cron.scheduleJob('0 * * * *', async () => {
    console.log("Cron Started:")
    try{
        await updateProducts();
        console.log("Products Updated");
        await updateTargetPrices();
        console.log("User Price Checks Done")
    }
    catch(err){
        console.log("Cron Error:",err);
    }
    console.log("Cron Finished");
})