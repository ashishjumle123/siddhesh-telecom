require('dotenv').config();
const cloudinary = require('cloudinary').v2;

const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = process.env;

if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_API_SECRET) {
    console.error('❌ Cloudinary credentials missing in .env!');
    console.log('👉 Please ensure CLOUD_NAME, CLOUD_API_KEY, and CLOUD_API_SECRET are defined in your .env file.');
    process.exit(1);
}

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_API_KEY,
    api_secret: CLOUD_API_SECRET
});

cloudinary.api.ping()
    .then((res) => {
        console.log('✅ Cloudinary connected successfully!');
        console.log('   Status:', res.status || 'OK');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Cloudinary Connection Error:', err.message || err);
        process.exit(1);
    });
