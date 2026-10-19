const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./server/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shree_ganesha';

const ADMIN_EMAIL = 'siddheshtelecomdigital@gmail.com';
const ADMIN_PASSWORD = '@9923777771';
const ADMIN_NAME = 'Siddhesh Admin';

async function addAdmin(attempt = 1) {
    try {
        console.log(`🔄 Connecting to database... (attempt ${attempt})`);
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
        });
        console.log('✅ Database connected.');

        let user = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

        if (user) {
            console.log('🔑 Admin account already exists. Updating password and role...');
            user.password = ADMIN_PASSWORD;
            user.role = 'admin';
            await user.save();
            console.log('✅ Admin account updated successfully!');
        } else {
            console.log('👤 Creating new admin account...');
            user = new User({
                name: ADMIN_NAME,
                email: ADMIN_EMAIL.toLowerCase(),
                password: ADMIN_PASSWORD,
                role: 'admin'
            });
            await user.save();
            console.log('✅ Admin account created successfully!');
        }

        console.log('\n🎉 Done!');
        console.log(`📧 Email: ${ADMIN_EMAIL}`);
        console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
        console.log(`👑 Role: admin`);
        process.exit(0);
    } catch (error) {
        console.error(`❌ Error (attempt ${attempt}):`, error.message);
        if (attempt < 3) {
            console.log('⏳ Retrying in 5s...');
            await new Promise(r => setTimeout(r, 5000));
            return addAdmin(attempt + 1);
        }
        process.exit(1);
    }
}

addAdmin();
