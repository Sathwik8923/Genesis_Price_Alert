const Trackedproducts = require('../models/Trackedproducts');
let nodemailer = require('nodemailer');


const updating_target_prices = async () => {
    const trackedproducts = await Trackedproducts.find({}).populate("pid").populate("uid");

    

    for (const tp of trackedproducts) {
        if ((tp.tprice >= tp.pid.currentprice) && ((tp.lastNotifiedPrice === null) || (tp.pid.currentprice < tp.lastNotifiedPrice))) {

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
                subject:  'Price Drop Alert !',
                text: `Good Newss!! The price for ${tp.pid.pname} has dropped to ${tp.pid.currentprice} rupees`
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });


            tp.lastNotifiedPrice = tp.pid.currentprice;
            await tp.save();
        }
    }
}

module.exports = updating_target_prices;