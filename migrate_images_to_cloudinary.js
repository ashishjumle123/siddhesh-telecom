/**
 * Script to migrate product images from external URLs to Cloudinary
 * This will improve performance and reliability of image loading
 */

const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const https = require('https');
const http = require('http');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shree_ganesha';

// Simple product schema
const productSchema = new mongoose.Schema({
    title: String,
    images: [String],
    brand: String,
    category: String
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

/**
 * Download image from URL
 */
async function downloadImage(url) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    if (!res.ok) {
        throw new Error(`Failed to download image: ${res.status}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Upload buffer to Cloudinary
 */
function uploadToCloudinary(buffer, publicId) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'siddheshtelecome/products',
                public_id: publicId,
                resource_type: 'auto',
                transformation: [
                    { quality: 'auto', fetch_format: 'auto' },
                    { width: 800, crop: 'limit' }
                ]
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
}

/**
 * Main migration function
 */
async function migrateImages() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check Cloudinary credentials
        if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
            console.error('❌ Cloudinary credentials not found in .env');
            console.log('   Please add: CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET');
            process.exit(1);
        }

        console.log('\n🔄 Starting image migration to Cloudinary...\n');

        const products = await Product.find({});
        console.log(`📦 Found ${products.length} products to process\n`);

        let migratedCount = 0;
        let failedCount = 0;
        let skippedCount = 0;

        for (const product of products) {
            console.log(`\n📝 Processing: ${product.title}`);
            
            const newImages = [];
            
            for (let i = 0; i < product.images.length; i++) {
                const oldUrl = product.images[i];
                
                // Skip if already on Cloudinary
                if (oldUrl.includes('cloudinary.com')) {
                    console.log(`   ⏭️  Image ${i + 1} already on Cloudinary - skipping`);
                    newImages.push(oldUrl);
                    skippedCount++;
                    continue;
                }

                try {
                    console.log(`   ⬇️  Downloading image ${i + 1}...`);
                    const imageBuffer = await downloadImage(oldUrl);
                    
                    // Generate public ID from product title and index
                    const publicId = `${product.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${i}`;
                    
                    console.log(`   ⬆️  Uploading to Cloudinary...`);
                    const cloudinaryUrl = await uploadToCloudinary(imageBuffer, publicId);
                    
                    newImages.push(cloudinaryUrl);
                    console.log(`   ✅ Uploaded: ${cloudinaryUrl.substring(0, 60)}...`);
                    migratedCount++;
                    
                } catch (error) {
                    console.error(`   ❌ Failed to migrate image ${i + 1}: ${error.message}`);
                    // Keep old URL if migration fails
                    newImages.push(oldUrl);
                    failedCount++;
                }
            }

            // Update product with new image URLs
            if (newImages.length > 0) {
                product.images = newImages;
                await product.save();
                console.log(`   💾 Updated product in database`);
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('📊 Migration Summary:');
        console.log(`   ✅ Successfully migrated: ${migratedCount} images`);
        console.log(`   ❌ Failed: ${failedCount} images`);
        console.log(`   ⏭️  Skipped (already on Cloudinary): ${skippedCount} images`);
        console.log(`   📦 Total products processed: ${products.length}`);
        console.log('='.repeat(50));

        await mongoose.connection.close();
        console.log('\n✅ Migration complete');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

migrateImages();
