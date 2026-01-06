const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); 
const UserModel = require('../models/User');
const sendMail = require('../utils/sendEmail');

const FRONTEND_BASE = process.env.APP_BASE_URL || 'http://localhost:3000';

const makeToken = (size = 20) => crypto.randomBytes(size).toString('hex');

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists', success: false });
        }

        const token = makeToken();
        const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        const userModel = new UserModel({ 
            name, 
            email, 
            password, 
            verifyToken: token, 
            verifyTokenExpires: expires 
        });
        
        userModel.password = await bcrypt.hash(password, 10);
        await userModel.save();

        // Send Verification Email
        const verifyUrl = `${FRONTEND_BASE}/verify?token=${token}&email=${encodeURIComponent(email)}`;
        await sendMail({
            to: email,
            subject: 'Verify your email',
            html: `<p>Hello ${name},</p><p>Verify your email here: <a href="${verifyUrl}">${verifyUrl}</a></p>`
        });

        res.status(201).json({ message: "Signup successful. Check email to verify.", success: true });
    } catch (err) {
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token, email } = req.query;
        const user = await UserModel.findOne({ email, verifyToken: token });

        if (!user || (user.verifyTokenExpires && user.verifyTokenExpires < Date.now())) {
            return res.status(400).json({ message: "Invalid or expired token", success: false });
        }

        user.isVerified = true;
        user.verifyToken = undefined;
        user.verifyTokenExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Email verified successfully!", success: true });
    } catch (err) {
        res.status(500).json({ message: "Verification failed", success: false });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(403).json({ message: 'Invalid credentials', success: false });

        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) return res.status(403).json({ message: 'Invalid credentials', success: false });

        // Check if verified
        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email first", success: false, needVerify: true });
        }
        const jwtToken = jwt.sign(
            { email: user.email, userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({ message: "Login Success", success: true, jwtToken, email, name: user.name });
    } catch (err) {
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) return res.json({ message: "If that email exists, a reset link was sent" });

        const token = makeToken();
        user.resetToken = token;
        user.resetTokenExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetUrl = `${FRONTEND_BASE}/reset?token=${token}&email=${encodeURIComponent(email)}`;
        await sendMail({
            to: email,
            subject: 'Password Reset Request',
            html: `<p>Reset your password here: <a href="${resetUrl}">${resetUrl}</a></p>`
        });

        res.json({ message: "If that email exists, a reset link was sent" });
    } catch (err) {
        res.status(500).json({ message: "Error sending reset email" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, token, password } = req.body;
        
        // 1. Find the user
        const user = await UserModel.findOne({ email, resetToken: token });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired link", success: false });
        }

        // 2. CHECK: Is the new password the same as the old one?
        const isSamePassword = await bcrypt.compare(password, user.password);
        if (isSamePassword) {
            return res.status(400).json({ 
                message: "New password cannot be the same as your old password. Please choose a different one.", 
                success: false 
            });
        }

        // 3. If it's a new password, hash and save it
        user.password = await bcrypt.hash(password, 10);
        user.resetToken = undefined; // Clear the token
        user.resetTokenExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password updated successfully!", success: true });
    } catch (err) {
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(400).json({ message: 'No account found' });
        if (user.isVerified) return res.status(400).json({ message: 'Already verified' });

        const token = makeToken();
        user.verifyToken = token;
        user.verifyTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await user.save();

        const verifyUrl = `${FRONTEND_BASE}/verify?token=${token}&email=${encodeURIComponent(email)}`;
        await sendMail({
            to: email,
            subject: 'Verify your email',
            html: `<p>Click here to verify: <a href="${verifyUrl}">${verifyUrl}</a></p>`
        });

        res.json({ message: 'Verification email resent' });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};


const resetEmailVerify = async (req, res) => {
    try {
        const { token, email } = req.query;
        if (!token || !email) {
            return res.status(400).json({ message: 'Invalid link', success: false });
        }

        const user = await UserModel.findOne({ email, resetToken: token });
        
        if (!user || (user.resetTokenExpires && user.resetTokenExpires < Date.now())) {
            return res.status(400).json({ 
                message: 'Invalid or expired token', 
                success: false 
            });
        }
        res.status(200).json({ 
            message: "Token valid", 
            success: true, 
            email, 
            token 
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", success: false });
    }
};

// Update your module.exports at the bottom
module.exports = { 
    signup, 
    login, 
    verifyEmail, 
    resendVerification, 
    forgotPassword, 
    resetEmailVerify, // Added this
    resetPassword
};