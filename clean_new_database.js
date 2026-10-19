const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./server/models/User');

const MONGO_URI = process.env.MONGO_URI;

async function cleanAndSetup() {
    try {
        console.log('🔄 Connecting to MongoDB:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected successfully!');

        const db = mongoose.connection.db;

        // Collections to wipe completely
        const collectionsToWipe = ['products', 'orders', 'banners', 'reviews', 'sessions', 'otps', 'users'];
        for (const col of collectionsToWipe) {
            try {
                await db.collection(col).deleteMany({});
                console.log(`🧹 Cleaned collection: ${col}`);
            } catch (err) {
                console.warn(`Could not clear ${col}:`, err.message);
            }
        }

        // Create initial Admin user for the new client
        const adminEmail = 'admin@siddhesh.com';
        const adminPassword = 'Admin@123';
        const adminUser = new User({
            name: 'Siddhesh Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'admin'
        });
        await adminUser.save();
        console.log(`✅ Created fresh Admin account: ${adminEmail} (password: ${adminPassword})`);

        console.log('\n🎉 Old client data completely cleared! Ready for new client.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error cleaning database:', err);
        process.exit(1);
    }
}

cleanAndSetup();
