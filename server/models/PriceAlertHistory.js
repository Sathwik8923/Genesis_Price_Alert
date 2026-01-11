const mongoose = require('mongoose');

const PriceAlertHistorySchema = new mongoose.Schema({
    uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    oldPrice: {
        type: Number,
        required: true
    },
    newPrice: {
        type: Number,
        required: true
    },
    website: {
        type: String,
        required: true
    },
    alertedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PriceAlertHistory', PriceAlertHistorySchema);