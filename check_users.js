require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./server/models/User');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shree_ganesha';

async function checkUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        const users = await User.find({});
        console.log(`Found ${users.length} users in DB:`);
        for (const u of users) {
            const isMatch = await bcrypt.compare('Admin@123', u.password);
            console.log(`- Email: ${u.email}, Role: ${u.role}, Admin@123 match: ${isMatch}`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
