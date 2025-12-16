const express = require('express');
const scrapeProduct = require('./webscrape');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./db');
const User = require('./models/User');
const authMiddleware = require('./middleware/auth')
const Products = require('./models/Products');
const Trackedproducts = require('./models/Trackedproducts');

const app = express();

connectDB();

app.use(express.json());

const JWT_SECRET = "supersecretkey";

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

app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email:email })
        if (existingUser) {
            return res.status(400).json({ message: "User Already Exists" })
        }
        const hashedpassword = await bcrypt.hash(password, 10);
        const newuser = new User({
            name,
            email,
            password: hashedpassword
        })
        await newuser.save();
        res.status(201).json({ message: "User created successfully" });
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Signup failed" });
    }
})

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const existinguser = await User.findOne({ email })
        if (!existinguser) {
            return res.status(400).json({message : "User Not Found"})
        }
        const match = await bcrypt.compare(password, existinguser.password)
        if (!match) {
            return res.status(400).json({message : "Invalid Password"})
        }
        const token = jwt.sign(
            {userId : existinguser._id},
            JWT_SECRET,
            {expiresIn : "7d"}
        )
        console.log("Login Successful")
        res.status(200).json({
            message:"Login Successful",
            token
        })
    }
    catch (err) {
        console.log(err);
    }
})

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

app.listen(8000);