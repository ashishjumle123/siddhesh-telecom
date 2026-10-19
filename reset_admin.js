require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./server/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shree_ganesha';
const NEW_PASSWORD = 'Admin@123';
const ADMIN_EMAILS = ['aashishjumle901@gmail.com', 'dhanrajvaidhya@gmail.com'];

async function resetAdminPassword() {
    try {
        console.log('🔄 Connecting to database...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Database connected.');

        for (const email of ADMIN_EMAILS) {
            let user = await User.findOne({ email: email.toLowerCase() });

            if (user) {
                console.log(`🔑 Updating password for existing admin account: ${email}`);
                user.password = NEW_PASSWORD;
                user.role = 'admin';
                await user.save();
                console.log(`✅ Password successfully updated for ${email}`);
            } else {
                console.log(`👤 Admin account not found. Creating new admin account for ${email}`);
                user = new User({
                    name: 'Admin User',
                    email: email.toLowerCase(),
                    password: NEW_PASSWORD,
                    role: 'admin'
                });
                await user.save();
                console.log(`✅ Admin account created successfully for ${email}`);
            }
        }

        console.log('\n🎉 Admin password reset process complete!');
        console.log(`👉 You can now login with email (e.g., dhanrajvaidhya@gmail.com or aashishjumle901@gmail.com) and password: ${NEW_PASSWORD}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting admin password:', error);
        process.exit(1);
    }
}

resetAdminPassword();
