const express = require('express');
const scrapeProduct = require('./webscrape');

const app = express();

app.use(express.json());

app.post("/search",async (req,res)=>{
    try{
        console.log(req.body.name);
        const data = await scrapeProduct(req.body.name);
        res.status(200).json(data);
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: "Scraping failed" });
    }
})

app.listen(8000);