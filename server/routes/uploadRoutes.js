const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { protect, adminOnly } = require('../middleware/authMiddleware');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   POST /api/upload
// @desc    Upload multiple images to Cloudinary
// @access  Private/Admin
router.post('/', protect, adminOnly, upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded' });
        }

        const uploadPromises = req.files.map((file) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'siddheshtelecome/products',
                        resource_type: 'auto',
                        transformation: [
                            { quality: 'auto', fetch_format: 'auto' }
                        ]
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary Upload Error:', error);
                            reject(error);
                        } else {
                            resolve(result.secure_url);
                        }
                    }
                );

                streamifier.createReadStream(file.buffer).pipe(uploadStream);
            });
        });

        // Resolve all uploads
        const imageUrls = await Promise.all(uploadPromises);

        // Return array of Cloudinary URLs
        res.status(200).json(imageUrls);
    } catch (error) {
        console.error('File Upload Error:', error);
        res.status(500).json({ message: 'Error uploading images', error: error.message });
    }
});

module.exports = router;
