const Product = require('../models/Product');
const { productCreateSchema } = require('../validation/productValidation');
const redisClient = require('../../config/redis');

// Helper to invalidate product cache keys
const clearProductCache = async () => {
    if (redisClient.isReady) {
        try {
            const keys = await redisClient.keys('products_*');
            if (keys.length > 0) {
                await redisClient.del(keys);
            }
        } catch (e) {
            console.error('Redis cache clear error:', e);
        }
    }
};

// Get all products (Public - Support Advanced E-commerce Filtering)
const getProducts = async (req, res) => {
    try {
        const { keyword, category, brand, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
        let query = {};

        if (keyword) {
            query.title = {
                $regex: keyword,
                $options: 'i', // case-insensitive
            };
        }

        if (category && category !== 'All Categories') {
            const categoryArray = category.split(',').map(c => c.trim());
            query.category = { $in: categoryArray.map(c => new RegExp(`^${c}$`, 'i')) };
        }

        if (brand && brand !== 'Select Brand') {
            const brandArray = brand.split(',').map(b => b.trim());
            query.brand = { $in: brandArray };
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        // Secure cache key mapping exactly to all querying vectors
        const cacheKey = `products_page_${pageNum}_limit_${limitNum}_${JSON.stringify({ keyword, category, brand, minPrice, maxPrice })}`;

        // CACHE HIT CHECK
        if (redisClient.isReady) {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                return res.json(JSON.parse(cachedData));
            }
        }

        const [totalProducts, products] = await Promise.all([
            Product.countDocuments(query),
            Product.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 }).lean()
        ]);
        const totalPages = Math.ceil(totalProducts / limitNum);

        const responseObj = {
            products,
            totalProducts,
            totalPages,
            currentPage: pageNum
        };

        // SET CACHE
        if (redisClient.isReady) {
            // TTL is set to 300 seconds (5 minutes)
            await redisClient.setEx(cacheKey, 300, JSON.stringify(responseObj));
        }

        res.json(responseObj);
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving products', error: error.message });
    }
};

// Get Unique Brands by Category
const getUniqueBrands = async (req, res) => {
    try {
        const brands = await Product.distinct('brand', { category: req.params.category });
        res.json(brands);
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving brands', error: error.message });
    }
};

// Get single product by ID (Public)
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving product', error: error.message });
    }
};

// Get product recommendations (Similar category)
const getProductRecommendations = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const recommendations = await Product.find({
            category: product.category,
            _id: { $ne: product._id } // exclude current
        })
            .sort({ rating: -1, numReviews: -1 })
            .limit(6)
            .lean();

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving recommendations', error: error.message });
    }
};

// Create a new product (Admin Only)
const createProduct = async (req, res) => {
    // Convert string inputs to numbers mapping if arriving from 'multipart/form-data' or directly
    let specsInput = req.body.specifications;
    // If specifications comes as a JSON string (form-data), parse it
    if (typeof specsInput === 'string') {
        try { specsInput = JSON.parse(specsInput); } catch (_) { specsInput = []; }
    }

    const inputData = {
        ...req.body,
        price: Number(req.body.price),
        stockQuantity: Number(req.body.stockQuantity),
        specifications: specsInput || []
    };

    // Input validation with Zod
    const validationResult = productCreateSchema.safeParse(inputData);
    if (!validationResult.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: (validationResult.error.issues || validationResult.error.errors || []).map(err => ({
                field: err.path[0],
                message: err.message
            }))
        });
    }

    try {
        const { brand, deliveryFee, images, warranty, replacementPolicy } = req.body;

        const product = new Product({
            title: validationResult.data.title,
            brand: brand || 'Generic',
            description: validationResult.data.description,
            price: validationResult.data.price,
            deliveryFee: deliveryFee || 0,
            category: validationResult.data.category,
            stockQuantity: validationResult.data.stockQuantity,
            images,
            warranty: warranty || 'No Warranty',
            replacementPolicy: replacementPolicy || 'No Replacement',
            specifications: validationResult.data.specifications || []
        });

        const savedProduct = await product.save();
        await clearProductCache(); // Cache Invalidation
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Invalid product data', error: error.message });
    }
};

// Update an existing product (Admin Only)
const updateProduct = async (req, res) => {
    try {
        const { title, brand, description, price, deliveryFee, category, stockQuantity, images, warranty, replacementPolicy } = req.body;
        let specifications = req.body.specifications;
        if (typeof specifications === 'string') {
            try { specifications = JSON.parse(specifications); } catch (_) { specifications = undefined; }
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.title = title || product.title;
        product.brand = brand || product.brand;
        product.description = description || product.description;
        product.price = price !== undefined ? price : product.price;
        product.deliveryFee = deliveryFee !== undefined ? deliveryFee : product.deliveryFee;
        product.category = category || product.category;
        product.stockQuantity = stockQuantity !== undefined ? stockQuantity : product.stockQuantity;
        product.images = images || product.images;
        product.warranty = warranty !== undefined ? warranty : product.warranty;
        product.replacementPolicy = replacementPolicy !== undefined ? replacementPolicy : product.replacementPolicy;
        product.specifications = specifications !== undefined ? specifications : product.specifications;

        const updatedProduct = await product.save();
        await clearProductCache(); // Cache Invalidation
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data to update', error: error.message });
    }
};

// Delete a product (Admin Only)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.deleteOne();
        await clearProductCache(); // Cache Invalidation
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting product', error: error.message });
    }
};

// Create new review
const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'Product already reviewed' });
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        const newReviews = [...product.reviews, review];
        const numReviews = newReviews.length;
        const avgRating = newReviews.reduce((acc, item) => item.rating + acc, 0) / newReviews.length;

        // Use findByIdAndUpdate to bypass strict schema validation on existing older products
        await Product.findByIdAndUpdate(req.params.id, {
            reviews: newReviews,
            numReviews: numReviews,
            rating: avgRating
        }, { runValidators: false });

        res.status(201).json({ message: 'Review added' });
    } catch (error) {
        res.status(500).json({ message: 'Server error creating review', error: error.message });
    }
};

// Delete review
const deleteProductReview = async (req, res) => {
    try {
        const { id: productId, reviewId } = req.params;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const reviewIndex = product.reviews.findIndex(r => r._id.toString() === reviewId);

        if (reviewIndex === -1) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const review = product.reviews[reviewIndex];

        // Ensure user is authorized (either the review creator or an admin)
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        const newReviews = product.reviews.filter(r => r._id.toString() !== reviewId);
        const numReviews = newReviews.length;
        const avgRating = numReviews > 0 ? newReviews.reduce((acc, item) => item.rating + acc, 0) / newReviews.length : 0;

        await Product.findByIdAndUpdate(productId, {
            reviews: newReviews,
            numReviews: numReviews,
            rating: avgRating
        }, { runValidators: false });

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting review', error: error.message });
    }
};

module.exports = {
    getProducts,
    getUniqueBrands,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    deleteProductReview,
    getProductRecommendations
};
