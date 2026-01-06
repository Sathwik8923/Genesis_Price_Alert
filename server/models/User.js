const mongoose = require('mongoose');

const Userschema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    isVerified: { type: Boolean, default: false },
    verifyToken: String,
    verifyTokenExpires: Date,
    
    resetToken: String,
    resetTokenExpires: Date
}, {
    timestamps: true
});

module.exports = mongoose.model("User", Userschema);