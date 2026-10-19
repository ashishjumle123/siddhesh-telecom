const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./server/models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shree_ganesha';

const dummyProducts = [
    {
        title: "Samsung 55-inch Crystal 4K UHD Smart TV",
        brand: "Samsung",
        description: "Experience crystal clear picture quality with this Samsung 4K Smart TV. Features include HDR, Tizen OS, and multiple voice assistants.",
        price: 45000,
        deliveryFee: 500,
        category: "TV",
        stockQuantity: 15,
        images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        specifications: [
            { key: "Screen Size", value: "55 Inches" },
            { key: "Resolution", value: "4K UHD (3840 x 2160)" },
            { key: "Refresh Rate", value: "60 Hz" }
        ]
    },
    {
        title: "LG 260 L 3 Star Frost Free Double Door Refrigerator",
        brand: "LG",
        description: "Keep your food fresh longer with this energy-efficient LG refrigerator. Features Smart Inverter Compressor and Multi Air Flow cooling.",
        price: 26500,
        deliveryFee: 1000,
        category: "Fridge",
        stockQuantity: 10,
        images: ["https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        specifications: [
            { key: "Capacity", value: "260 Litres" },
            { key: "Energy Rating", value: "3 Star" },
            { key: "Defrost System", value: "Frost Free" }
        ]
    },
    {
        title: "Symphony Diet 12T Personal Tower Air Cooler",
        brand: "Symphony",
        description: "Beat the heat with this compact and efficient Symphony air cooler. Ideal for spot cooling in small rooms.",
        price: 5500,
        deliveryFee: 200,
        category: "Cooler",
        stockQuantity: 25,
        images: ["https://images.unsplash.com/photo-1618218168354-e75c2e173eec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        specifications: [
            { key: "Tank Capacity", value: "12 Litres" },
            { key: "Cooling Area", value: "Up to 100 sq. ft." },
            { key: "Power Consumption", value: "170 Watts" }
        ]
    }
];

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ MongoDB connected successfully for seeding');

        // Clear existing products to prevent duplicates on multiple runs
        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products');

        // Insert new dummy products
        const inserted = await Product.insertMany(dummyProducts);
        console.log(`🌱 Successfully seeded ${inserted.length} products!`);

        process.exit();
    })
    .catch(err => {
        console.error('❌ MongoDB connection error during seeding:', err);
        process.exit(1);
    });
