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
    }
})

module.exports = mongoose.model("Product",Productschema);