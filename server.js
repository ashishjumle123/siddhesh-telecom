const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const compression = require('compression');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const connectDB = require('./config/db');

process.on('uncaughtException', (err) => {
    console.error('⚠️ Uncaught Exception (handled safely):', err.message || err);
});
process.on('unhandledRejection', (reason) => {
    console.error('⚠️ Unhandled Rejection (handled safely):', reason);
});

const app = express();

// ─── Connect Database ──────────────────────────────────────────────────────────
connectDB();

// ─── Core Middleware ───────────────────────────────────────────────────────────
app.use(compression());

// Helmet — production-safe CSP that allows Cloudinary, Lordicon, Razorpay, Google Fonts
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                "https://checkout.razorpay.com",
                "https://cdn.lordicon.com"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "blob:",
                "https://res.cloudinary.com",
                "https://images.unsplash.com",
                "https://cdn.lordicon.com",
                "https://th.bing.com",
                "https://tse1.mm.bing.net",
                "https://tse2.mm.bing.net",
                "https://tse3.mm.bing.net",
                "https://tse4.mm.bing.net",
                "https://ui-avatars.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com",
                "data:"
            ],
            connectSrc: [
                "'self'",
                "https://api.razorpay.com",
                "https://cdn.lordicon.com",
                "https://*.mongodb.net"
            ],
            frameSrc: [
                "'self'",
                "https://checkout.razorpay.com"
            ],
            workerSrc: ["'self'", "blob:"]
        }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// CORS — allow configured origin or mirror request origin for credentials support
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:3000',
    'https://shree-ganesha.onrender.com',           // Existing Render URL
    'https://shree-ganesha-enterprises.vercel.app', // User's Vercel deployment URL
    'https://shree-ganesha-enterprises.vercel.app/'  // Including trailing slash variant if needed
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow same-origin requests (origin will be undefined)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            // In many production cases, you might want to mirror origin if it's your own subdomains
            // For now, we allow if on Render (same origin usually works without CORS)
            callback(null, true);
        }
    },
    credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Session (Memory-backed, as app uses JWT for auth)
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./server/routes/authRoutes'));
app.use('/api/users', require('./server/routes/userRoutes'));
app.use('/api/cart', require('./server/routes/cartRoutes'));
app.use('/api/payment', require('./server/routes/paymentRoutes'));
app.use('/api/orders', require('./server/routes/orderRoutes'));
app.use('/api/products', require('./server/routes/productRoutes'));
app.use('/api/upload', require('./server/routes/uploadRoutes'));
app.use('/api/contact', require('./server/routes/contactRoutes'));
app.use('/api/banners', require('./server/routes/bannerRoutes'));
app.use('/api/categories', require('./server/routes/categoryRoutes'));
app.use('/api/reviews', require('./server/routes/reviewRoutes'));

// ─── Serve React Frontend (Vite Build) ────────────────────────────────────────
// Must come AFTER all API routes so /api/* is never intercepted by static serving
const clientDistPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDistPath));

// SPA fallback — Express 5 compatible (no wildcard, use middleware function)
// This catches all non-API requests and returns index.html so React Router works
app.use((req, res, next) => {
    // Only serve index.html for non-API routes
    if (req.path.startsWith('/api/')) {
        return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must have exactly 4 params (err, req, res, next) — Express uses this to detect error handlers
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.message || err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

// Export for Vercel Serverless Functions
module.exports = app;