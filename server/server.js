require('dotenv').config();
const express = require('express');
const scrapeProduct = require('./webscrape');
const connectDB = require('./db');
const authMiddleware = require('./middleware/auth')
const Products = require('./models/Products');
const Trackedproducts = require('./models/Trackedproducts');
const { signup, login }=require('./Controllers/AuthController');
const { signupValidation, loginValidation } = require('./middleware/Validation');
const cors = require('cors');
const app = express();

connectDB();

app.use(express.json());
app.use(cors());
app.post("/search", async (req, res) => {
    try {
        console.log(req.body.name);
        const data = await scrapeProduct(req.body.name);
        res.status(200).json(data);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Scraping failed" });
    }
})
app.post("/signup",signupValidation, signup);

app.post("/login",loginValidation , login);

app.post("/track", authMiddleware ,async (req, res) => {
    try {
        const pname = req.body.title
        const purl = req.body.link
        const imageurl = req.body.image
        const currentprice = req.body.price
        const userId = req.user.userId;
        let existingproduct = await Products.findOne({ purl });
        if (!existingproduct) {
            existingproduct = new Products({
                pname,purl,imageurl,currentprice,lastcheckedAt:new Date()
            });

            await existingproduct.save();
        }

        const alreadytracked = await Trackedproducts.findOne({
            uid : userId,
            pid : existingproduct._id
        })

        if(alreadytracked){
            return res.status(400).json({ message: "Already tracking this product" });
        }

        const tracked = new Trackedproducts({
            uid:userId,
            pid:existingproduct._id,
            tprice: currentprice,
            lastNotifiedPrice: currentprice,
            isActive: true
        })

        await  tracked.save();

        res.status(201).json({ message: "Product tracked successfully" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Tracking failed" });
    }
})

app.listen(8000,() => console.log("Server running on 8000"));