const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shree_ganesha';

// Simple product schema
const productSchema = new mongoose.Schema({
    title: String,
    images: [String],
    brand: String,
    category: String
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

async function checkImages() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get all products
        const products = await Product.find({});
        console.log(`\n📦 Total products in database: ${products.length}`);

        let productsWithImages = 0;
        let productsWithoutImages = 0;
        let productsWithBrokenImages = 0;
        let cloudinaryImages = 0;
        let otherImages = 0;

        products.forEach(product => {
            const hasImages = product.images && product.images.length > 0;
            
            if (hasImages) {
                productsWithImages++;
                product.images.forEach(img => {
                    if (img.includes('cloudinary.com')) {
                        cloudinaryImages++;
                    } else if (img.includes('http')) {
                        otherImages++;
                    } else {
                        productsWithBrokenImages++;
                    }
                });
            } else {
                productsWithoutImages++;
            }
        });

        console.log('\n📊 Image Statistics:');
        console.log(`   - Products with images: ${productsWithImages}`);
        console.log(`   - Products without images: ${productsWithoutImages}`);
        console.log(`   - Cloudinary images: ${cloudinaryImages}`);
        console.log(`   - Other HTTP images: ${otherImages}`);
        console.log(`   - Potentially broken image URLs: ${productsWithBrokenImages}`);

        // Show sample products with image issues
        console.log('\n🔍 Sample Products (first 10):');
        products.slice(0, 10).forEach((product, index) => {
            console.log(`\n${index + 1}. ${product.title}`);
            console.log(`   Images: ${product.images?.length || 0}`);
            if (product.images?.length > 0) {
                product.images.forEach((img, i) => {
                    const status = img.includes('cloudinary.com') ? '✅' : (img.includes('http') ? '⚠️' : '❌');
                    console.log(`   ${status} [${i + 1}] ${img.substring(0, 60)}...`);
                });
            }
        });

        // Check for old folder references
        const oldFolderCount = products.filter(p => 
            p.images?.some(img => img.includes('shreeganesha'))
        ).length;
        
        if (oldFolderCount > 0) {
            console.log(`\n⚠️  WARNING: ${oldFolderCount} products still reference old 'shreeganesha' Cloudinary folder`);
            console.log('   These images may not load after the folder name change to "siddheshtelecome"');
        }

        await mongoose.connection.close();
        console.log('\n✅ Analysis complete');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkImages();
