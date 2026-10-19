const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}
const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./server/models/Category');

const categories = [
    {
        name: "AC",
        image: "https://tse4.mm.bing.net/th/id/OIP.U5Kz7N59I3v67vS6V1u3AHaHa?pid=ImgDet&rs=1",
        fallback: "AC",
        route: "/category/AC",
        type: "Electronics"
    },
    {
        name: "Almirah",
        image: "https://th.bing.com/th/id/OIP.jBxoAro1xYPz7m4NKScPnwHaHa?w=192&h=192&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
        fallback: "Al",
        route: "/category/Almirah",
        type: "Furniture"
    },
    {
        name: "Bed",
        image: "https://images.unsplash.com/photo-1505693419148-4030a90441c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        fallback: "Be",
        route: "/category/Bed",
        type: "Furniture"
    },
    {
        name: "Ceiling Fan",
        image: "https://th.bing.com/th/id/OIP.bivmvb3nB0d9PWAdYZfw2gHaHa?w=203&h=203&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
        fallback: "CF",
        route: "/category/Home Appliances",
        type: "Home Appliances"
    },
    {
        name: "Dining",
        image: "https://th.bing.com/th/id/OIP.LKpxtY-0v0jhJqMepqwMCQHaHa?w=163&h=150&c=6&o=7&dpr=1.3&pid=1.7&rm=3",
        fallback: "Di",
        route: "/category/Dining",
        type: "Furniture"
    },
    {
        name: "Home Theatre",
        image: "https://tse1.mm.bing.net/th/id/OIP.q3EJYGRLOPufOgJm6PSGggHaHa?pid=ImgDet&w=187&h=187&c=7&dpr=1.3&o=7&rm=3",
        fallback: "HT",
        route: "/category/Home Theatre",
        type: "Electronics"
    },
    {
        name: "Refrigerators",
        image: "https://tse4.mm.bing.net/th/id/OIP.DWeH9qsyl3B3xdSbmML_ZQHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
        fallback: "Re",
        route: "/category/Refrigerators",
        type: "Home Appliances"
    },
    {
        name: "Small Appliances",
        image: "https://th.bing.com/th?q=Small+Electronic+Drum+Set&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&dpr=1.3&pid=InlineBlock&rm=3&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247",
        fallback: "SA",
        route: "/category/Small Appliances",
        type: "Home Appliances"
    },
    {
        name: "Sofa",
        image: "https://th.bing.com/th/id/OIP.J83SxVi9L12fQX6PmaVcvwHaE4?w=274&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
        fallback: "So",
        route: "/category/Sofa",
        type: "Furniture"
    },
    {
        name: "TV",
        image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        fallback: "TV",
        route: "/category/TV",
        type: "Electronics"
    },
    {
        name: "Washing Machine",
        image: "https://th.bing.com/th/id/OIP.i8-eNpg4fCG6CzTqkwPycwHaE8?w=296&h=197&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
        fallback: "WM",
        route: "/category/Washing Machine",
        type: "Home Appliances"
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB Atlas');

        // Clear existing categories to avoid duplicates or outdated routes
        await Category.deleteMany({});
        console.log('Cleared existing categories');

        await Category.insertMany(categories);
        console.log('Categories seeded successfully!');

        process.exit();
    } catch (err) {
        console.error('Error seeding categories:', err);
        process.exit(1);
    }
}

seed();
