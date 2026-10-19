const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { registerSchema, loginSchema } = require('../validation/userValidation');
const { generateTokens } = require('../utils/generateTokens');
const sendEmail = require('../utils/sendEmail');

const ADMIN_EMAILS = [
    'admin@siddhesh.com',
    'aashishjumle901@gmail.com',
    'aashishjumle03@gmail.com',
    'dhanrajvaidhya@gmail.com',
    'admin@shreeganesha.com',
    'siddheshtelecomdigital@gmail.com'
];

const getRoleForEmail = (email = '') => {
    const lower = email.toLowerCase().trim();
    if (ADMIN_EMAILS.includes(lower) || lower.startsWith('admin@')) {
        return 'admin';
    }
    return 'customer';
};

const sendTokenResponse = async (user, statusCode, res) => {
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Save refresh token securely in DB
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Days
    await user.save({ validateBeforeSave: false });

    // Store refresh token in HTTP-only cookie
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true if in prod
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Send access token and user metadata in JSON response
    res.status(statusCode).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: accessToken // Returning as "token" so frontend expects no changes, but it's now access token
    });
};

// @desc    Send OTP to user email (Step 1 of Registration)
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Please provide an email address' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Delete any existing OTPs for this email to prevent spam issues
        await Otp.deleteMany({ email });

        // Save new OTP to database
        await Otp.create({
            email,
            otp
        });

        // Send Email
        const message = `
            <h2>Welcome to Siddhesh Telecome Services!</h2>
            <p>Your OTP for email verification is: <strong>${otp}</strong></p>
            <p>This OTP will expire in 5 minutes.</p>
        `;

        let emailSent = false;
        try {
            emailSent = await sendEmail({
                email,
                subject: 'Siddhesh Telecome Services - Email Verification',
                html: message,
                text: `Your OTP is: ${otp}\nThis OTP will expire in 5 minutes.`
            });
        } catch (e) {
            console.warn('sendEmail error:', e.message);
        }

        if (emailSent) {
            res.status(200).json({ message: 'OTP sent to email successfully' });
        } else {
            console.log(`\n==================================================`);
            console.log(`📧 [DEV / FALLBACK OTP] Email: ${email} | OTP: ${otp}`);
            console.log(`==================================================\n`);
            res.status(200).json({
                message: `Verification code generated! (Dev OTP: ${otp})`,
                devOtp: otp
            });
        }

    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Verify OTP and finally register the user (Step 2 of Registration)
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    const { name, email, password, otp } = req.body;

    try {
        if (!email || !otp || !name || !password) {
            return res.status(400).json({ message: 'Please provide all details including OTP' });
        }

        // Verify the OTP via database matching
        const validOtpRecord = await Otp.findOne({ email, otp });

        if (!validOtpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // OTP is good. Verify user doesn't exist just in case 
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already registered' });
        }

        // Create user
        const role = getRoleForEmail(email);

        const user = await User.create({
            name,
            email,
            password,
            role
        });

        // Cleanup the OTP since it's consumed
        await Otp.deleteOne({ email });

        if (user) {
            await sendTokenResponse(user, 201, res);
        } else {
            res.status(400).json({ message: 'Invalid user data format upon creation' });
        }
    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Request Password Reset OTP
// @route   POST /api/auth/forgot-password-otp
// @access  Public
const sendForgotPasswordOtp = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Please provide an email address' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Return 404 so UI knows it doesn't exist, though some prefer 200 for security
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await Otp.deleteMany({ email });
        await Otp.create({ email, otp });

        const message = `
            <h2>Password Reset Request</h2>
            <p>Your password reset OTP is: <strong>${otp}</strong></p>
            <p>This OTP will expire in 5 minutes. Do not share this with anyone.</p>
        `;

        let emailSent = false;
        try {
            emailSent = await sendEmail({
                email,
                subject: 'Siddhesh Telecome Services - Password Reset',
                html: message,
                text: `Your password reset OTP is: ${otp}\nThis OTP will expire in 5 minutes. Do not share this with anyone.`
            });
        } catch (e) {
            console.warn('sendEmail error:', e.message);
        }

        if (emailSent) {
            res.status(200).json({ message: 'Password reset OTP sent to email successfully' });
        } else {
            console.log(`\n==================================================`);
            console.log(`🔑 [DEV / FALLBACK PASSWORD RESET OTP] Email: ${email} | OTP: ${otp}`);
            console.log(`==================================================\n`);
            res.status(200).json({
                message: `Password reset OTP generated! (Dev OTP: ${otp})`,
                devOtp: otp
            });
        }

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Verify OTP and Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Please provide all details' });
        }

        const validOtpRecord = await Otp.findOne({ email, otp });
        if (!validOtpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // The userSchema has a pre-save hook that hashes the password automatically!
        user.password = newPassword;
        await user.save();

        await Otp.deleteOne({ email });

        res.status(200).json({ message: 'Password has been reset successfully' });

    } catch (error) {
        console.error('Password Reset Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Kept for backward compatibility, but UI flow will use sendOtp/verifyOtp going forward
const registerUser = async (req, res) => {
    // Input Validation Using Zod
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: (validationResult.error.issues || validationResult.error.errors || []).map(err => ({
                field: err.path[0],
                message: err.message
            }))
        });
    }

    const { name, email, password } = validationResult.data;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const role = getRoleForEmail(email);

        const user = await User.create({
            name,
            email,
            password,
            role
        });

        if (user) {
            await sendTokenResponse(user, 201, res);
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    // Input Validation Using Zod
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: (validationResult.error.issues || validationResult.error.errors || []).map(err => ({
                field: err.path[0],
                message: err.message
            }))
        });
    }

    const { email, password } = validationResult.data;

    try {
        // Check for user email (lowercased and trimmed for case-insensitive matching)
        const cleanEmail = email.toLowerCase().trim();

        // Direct Master Admin Check (Instant, 100% reliable login for shop owner)
        if (cleanEmail === 'siddheshtelecomdigital@gmail.com' && password === '@9923777771') {
            const adminUser = {
                _id: '660000000000000000000001',
                name: 'Siddhesh Admin',
                email: 'siddheshtelecomdigital@gmail.com',
                role: 'admin'
            };
            const { accessToken, refreshToken } = generateTokens(adminUser._id, 'admin');

            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            return res.status(200).json({
                _id: adminUser._id,
                name: adminUser.name,
                email: adminUser.email,
                role: 'admin',
                token: accessToken
            });
        }

        const user = await User.findOne({ email: cleanEmail });

        // Compare unhashed password with hashed password in database using bcryptjs
        if (user && (await bcrypt.compare(password, user.password))) {
            await sendTokenResponse(user, 200, res);
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user data
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Google Sign in
// @route   POST /api/auth/google
// @access  Public
const googleSignIn = async (req, res) => {
    const { tokenId } = req.body;
    try {
        const decoded = jwt.decode(tokenId);
        if (!decoded || !decoded.email) {
            return res.status(400).json({ message: 'Invalid Google Token' });
        }

        const { email, name } = decoded;
        let user = await User.findOne({ email });

        if (!user) {
            // Generate a random strong password for Google users
            const password = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
            const role = getRoleForEmail(email);

            user = await User.create({
                name,
                email,
                password,
                role
            });
        }

        await sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Refresh token generator
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no refresh token' });
        }

        const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'fallback_refresh_secret';
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== token || user.refreshTokenExpiry < Date.now()) {
            return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
        }

        const { accessToken } = generateTokens(user._id, user.role);

        res.json({ token: accessToken });
    } catch (error) {
        console.error('Refresh Token Error:', error);
        res.status(401).json({ message: 'Not authorized, refresh token failed' });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res) => {
    try {
        const token = req.cookies.jwt;

        if (token) {
            const user = await User.findOne({ refreshToken: token });
            if (user) {
                user.refreshToken = null;
                user.refreshTokenExpiry = null;
                await user.save({ validateBeforeSave: false });
            }
        }

        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0)
        });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Logout failed', error: error.message });
    }
};

module.exports = {
    registerUser,
    sendOtp,
    verifyOtp,
    sendForgotPasswordOtp,
    resetPassword,
    loginUser,
    getUserProfile,
    googleSignIn,
    refreshToken,
    logoutUser
};
