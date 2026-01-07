require('dotenv').config();
const express = require('express');
const scrapeProduct = require('./webscrape');
const scrapingcroma = require('./scrapings/scrape_croma');
const scrapingflipkart = require('./scrapings/scrape_flipcart');
const connectDB = require('./db');
const authMiddleware = require('./middleware/auth')
const Products = require('./models/Products');
const Trackedproducts = require('./models/Trackedproducts');
const { 
   signup, 
    login, 
    verifyEmail, 
    resendVerification, 
    forgotPassword, 
    resetEmailVerify, 
    resetPassword
} = require('./Controllers/AuthController');
const { 
    signupValidation, 
    loginValidation, 
    forgotPasswordValidation, 
    resetPasswordValidation 
} = require('./middleware/Validation');

const cors = require('cors');
const app = express();

connectDB();

app.use(express.json());
app.use(cors());
app.post("/search", async (req, res) => {
    try {
        console.log(req.body.name);
        const oname = req.body.name;
        const fname = oname.replace(" ", "%20");
        const data_a = await scrapeProduct(req.body.name);
        const data_c = await scrapingcroma(fname);
        const data_f = await scrapingflipkart(fname);
        const data = [...data_a,...data_c,...data_f];
        data.sort((a,b)=>a.price-b.price);
        res.status(200).json(data);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Scraping failed" });
    }
})


app.get('/test-email', async (req, res) => {
    await updateUserPrices();
    res.send("Email check completed");
});

app.post("/track", authMiddleware, async (req, res) => {
    try {
        const pname = req.body.detail.title
        const purl = req.body.detail.link
        const imageurl = req.body.detail.image
        const currentprice = req.body.detail.price;
        const provider = req.body.detail.website;
        const userId = req.user.userId;
        let existingproduct = await Products.findOne({ purl });
        if (!existingproduct) {
            existingproduct = new Products({
                pname, purl, imageurl, currentprice, website : provider,lastcheckedAt: new Date()
            });

            await existingproduct.save();
        }

        const alreadytracked = await Trackedproducts.findOne({
            uid: userId,
            pid: existingproduct._id
        })

        if (alreadytracked) {
            return res.status(400).json({ message: "Already tracking this product" });
        }

        const tracked = new Trackedproducts({
            uid: userId,
            pid: existingproduct._id,
            tprice: Number(req.body.target_price),
            website : provider,
            lastNotifiedPrice: null,
            isActive: true
        })

        await tracked.save();

        res.status(201).json({ message: "Product tracked successfully" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Tracking failed" });
    }
})

app.get("/tracked", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const products_tracked = await Trackedproducts.find({ uid: userId }).populate("pid")
        if (products_tracked.length === 0) {
            res.status(200).json({ message: "No Tracked Products" });
        }
        else {
            res.status(200).json(products_tracked);
        }
    }
    catch (err) {
        console.log(err);
        res.status(400).json({
            message: "Failed To Track Products"
        })
    }
})

app.delete("/tracked/:id", authMiddleware, async (req, res) => {
  try {
    const trackedId = req.params.id;
    const userId = req.user.userId; // from auth middleware

    const deleted = await Trackedproducts.findOneAndDelete({
      _id: trackedId,
      uid: userId
    });

    if (!deleted) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Tracked product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/signup", signupValidation, signup);
app.post("/login", loginValidation, login);
app.get("/verify", verifyEmail); 
app.post("/resend", resendVerification); 
app.post("/forgot", forgotPasswordValidation, forgotPassword);
app.get("/reset", resetEmailVerify); 
app.post("/reset", resetPasswordValidation, resetPassword); 

require('./jobs/cron');

app.listen(8000, () => console.log("Server running on 8000"));