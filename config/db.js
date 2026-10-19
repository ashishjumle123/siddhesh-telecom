const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}
const mongoose = require('mongoose');
require('dotenv').config();

// ─── Configuration ─────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shree_ganesha';
const RETRY_DELAY = 5000;   // ms between reconnection attempts
const MAX_RETRIES = 10;     // max retry attempts before giving up
let retryCount = 0;
let isConnecting = false;  // Guard to prevent concurrent connect calls

// ─── Connection Options ─────────────────────────────────────────────────────
const MONGO_OPTIONS = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    retryReads: true,
};

// ─── Error Classifier ──────────────────────────────────────────────────────
const getTip = (message = '') => {
    if (message.includes('ENOTFOUND') || message.includes('querySrv'))
        return '👉 Check internet connection or Atlas cluster hostname.';
    if (message.includes('Authentication failed') || message.includes('bad auth'))
        return '👉 Check Atlas username/password in MONGO_URI inside .env';
    if (message.includes('whitelist') || message.includes('IP'))
        return '👉 Your IP is not whitelisted. Go to Atlas → Network Access → Add 0.0.0.0/0 for Cloud.';
    if (message.includes('timed out') || message.includes('ETIMEDOUT'))
        return '👉 Connection timed out. Ensure cluster is running and IP is whitelisted.';
    return '👉 Check that your MONGO_URI is correct and Atlas cluster is active.';
};

// ─── Core Connect Function ─────────────────────────────────────────────────
const connectDB = async () => {
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    if (mongoose.connection.readyState >= 1) {
        console.log('ℹ️  Using existing MongoDB connection.');
        return mongoose.connection;
    }

    if (isConnecting) return;
    isConnecting = true;

    if (!MONGO_URI) {
        console.error('❌ FATAL: MONGO_URI is not defined in environment variables.');
        isConnecting = false;
        // In production, we don't process.exit(1) here to allow the server to boot
        // and respond to health checks, even if it can't talk to DB yet.
        return;
    }

    try {
        console.log(`🔄 Attempting MongoDB connection... (attempt ${retryCount + 1})`);
        const conn = await mongoose.connect(MONGO_URI, MONGO_OPTIONS);

        retryCount = 0;
        isConnecting = false;

        console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
        return conn;

    } catch (error) {
        isConnecting = false;
        retryCount++;

        console.error(`❌ MongoDB Connection Error! (attempt ${retryCount}/${MAX_RETRIES})`);
        console.error(`   Reason : ${error.message}`);
        console.error(`   Tip    : ${getTip(error.message)}`);

        if (retryCount < MAX_RETRIES) {
            console.log(`⏳ Retrying in ${RETRY_DELAY / 1000}s...`);
            setTimeout(connectDB, RETRY_DELAY);
        } else {
            console.error('🚨 Max retry attempts reached. Please check your DB configuration.');
        }
    }
};

// ─── Connection Event Listeners ────────────────────────────────────────────
// Note: Mongoose 8+ handles reconnection automatically. 
// We only log events rather than triggering new connectDB() calls to avoid loops.

mongoose.connection.on('connected', () => {
    console.log('✅ Mongoose connected to MongoDB.');
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Mongoose will attempt to reconnect...');
});

mongoose.connection.on('reconnected', () => {
    retryCount = 0;
    console.log('✅ MongoDB reconnected successfully.');
});

mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB internal error: ${err.message}`);
});

// ─── Graceful Shutdown ─────────────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
    // Skip if nodemon is triggering a restart
    if (process.env.npm_lifecycle_script?.includes('nodemon')) return;

    console.log(`\n🛑 ${signal} received. Closing MongoDB connection...`);
    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed.');
        process.exit(0);
    } catch (err) {
        console.error('⚠️  Error during DB shutdown:', err.message);
        process.exit(1);
    }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = connectDB;
