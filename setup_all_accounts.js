const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./server/models/User');

const MONGO_URI = process.env.MONGO_URI;

const ACCOUNTS = [
    { email: 'admin@siddhesh.com', name: 'Siddhesh Admin', role: 'admin', password: 'Admin@123' },
    { email: 'aashishjumle901@gmail.com', name: 'Aashish Jumle (Admin)', role: 'admin', password: 'Admin@123' },
    { email: 'aashishjumle03@gmail.com', name: 'Aashish Jumle', role: 'admin', password: 'Admin@123' },
    { email: 'dhanrajvaidhya@gmail.com', name: 'Dhanraj Vaidhya', role: 'admin', password: 'Admin@123' },
    { email: 'admin@shreeganesha.com', name: 'Ganesha Admin', role: 'admin', password: 'Admin@123' },
    { email: 'customer@gmail.com', name: 'Sample Customer', role: 'customer', password: 'Customer@123' }
];

async function setup() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected!');

        for (const acc of ACCOUNTS) {
            let user = await User.findOne({ email: acc.email.toLowerCase() });
            if (user) {
                user.name = acc.name;
                user.role = acc.role;
                user.password = acc.password; // pre-save hook will hash it
                await user.save();
                console.log(`✅ Updated account: ${acc.email} (Role: ${acc.role})`);
            } else {
                user = new User({
                    name: acc.name,
                    email: acc.email.toLowerCase(),
                    password: acc.password,
                    role: acc.role
                });
                await user.save();
                console.log(`✅ Created account: ${acc.email} (Role: ${acc.role})`);
            }
        }

        console.log('\n🎉 All accounts ready!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

setup();
