const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    deliveryFee: {
        type: Number,
        default: 0,
        min: 0
    },
    category: {
        type: String,
        required: true
    },
    stockQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    images: [{
        type: String, // URLs
        required: true
    }],
    warranty: {
        type: String,
        default: 'No Warranty'
    },
    replacementPolicy: {
        type: String,
        enum: [
            'No Replacement',
            '1 Day Replacement',
            '3 Days Replacement',
            '7 Days Replacement',
            '10 Days Replacement'
        ],
        default: 'No Replacement'
    },
    specifications: [{
        title: { type: String },
        value: { type: String }
    }],
    reviews: [reviewSchema], // Keeping for backward compatibility
    rating: {
        type: Number,
        required: true,
        default: 0
    },
    numReviews: {
        type: Number,
        required: true,
        default: 0
    },
    ratingsAverage: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratingsCount: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true,
    indexes: [
        { title: 'text', description: 'text' },
        { category: 1 },
        { brand: 1 },
        { price: 1 },
        { rating: -1 },
        { createdAt: -1 }
    ]
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
