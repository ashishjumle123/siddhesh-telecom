const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getBanners, createBanner, updateBanner, deleteBanner } = require('../controllers/bannerController');

router.route('/')
    .get(getBanners)
    .post(protect, adminOnly, createBanner);

router.route('/:id')
    .put(protect, adminOnly, updateBanner)
    .delete(protect, adminOnly, deleteBanner);

module.exports = router;
