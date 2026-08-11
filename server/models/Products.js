const mongoose = require('mongoose');

const Productschema = new mongoose.Schema({
    pname:{
        type:String,
        required:true
    },
    purl:{
        type:String,
        required:true,
        unique : true
    },
    imageurl:{
        type:String,
        required:true
    },
    currentprice:{
        type:Number,
        required:true
    },
    website:{
        type:String,
        required:true
    },
    lastcheckedAt:{
        type:Date,
        default:null
    },
    priceHistory: {
        type: [{
            price: { type: Number, required: true },
            date:  { type: Date,   default: Date.now }
        }],
        default: []
    }
})

module.exports = mongoose.model("Product",Productschema);