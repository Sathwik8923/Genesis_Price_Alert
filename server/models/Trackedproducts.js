const mongoose = require('mongoose')

const TrackedproductsSchema = mongoose.Schema({
    uid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    pid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    tprice:{
        type:Number,
        requied:true
    },
    lastNotifiedPrice:{
        type:Number,
        default:null
    },
    isActive:{
        type:Boolean,
        default:true
    }
})

module.exports = mongoose.model("Trackedproduct",TrackedproductsSchema);