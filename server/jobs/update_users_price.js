const Trackedproducts = require('../models/Trackedproducts');
const PriceAlertHistory = require('../models/PriceAlertHistory');
let nodemailer = require('nodemailer');


const updating_target_prices = async () => {
    const trackedproducts = await Trackedproducts
        .find({})
        .populate("pid")
        .populate("uid");

    for (const tp of trackedproducts) {

        if (
            tp.tprice >= tp.pid.currentprice &&
            (tp.lastNotifiedPrice === null || tp.pid.currentprice < tp.lastNotifiedPrice)
        ) {

            const oldPrice = tp.lastNotifiedPrice ?? tp.pid.currentprice;
            const newPrice = tp.pid.currentprice;

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            let mailOptions = {
                from: process.env.EMAIL_USER,
                to: tp.uid.email,
                subject: 'Price Drop Alert!',
                text: `Good News!! The price for ${tp.pid.pname} has dropped from to ${newPrice} rupees`
            };

            await transporter.sendMail(mailOptions, function (error, info) { if (error) { console.log(error); } else { console.log('Email sent: ' + info.response); } });

            await PriceAlertHistory.create({
                uid: tp.uid._id,
                pid: tp.pid._id,
                oldPrice,
                newPrice,
                website: tp.website
            });

            tp.lastNotifiedPrice = newPrice;
            await tp.save();
        }
    }
};


module.exports = updating_target_prices;