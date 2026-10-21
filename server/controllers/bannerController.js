const Banner = require('../models/Banner');

const getBanners = async (req, res) => {
    try {
        const query = req.query.all === 'true' ? {} : { isActive: true };
        const banners = await Banner.find(query).sort({ createdAt: -1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving banners', error: error.message });
    }
};

const createBanner = async (req, res) => {
    try {
        const { image, alt, link, isActive } = req.body;
        if (!image) {
            return res.status(400).json({ message: 'Banner image is required' });
        }
        const banner = new Banner({
            image,
            alt: alt || 'Banner Image',
            link: link || '/',
            isActive: isActive !== undefined ? isActive : true
        });
        const savedBanner = await banner.save();
        res.status(201).json(savedBanner);
    } catch (error) {
        res.status(400).json({ message: 'Invalid banner data', error: error.message });
    }
};

const updateBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) return res.status(404).json({ message: 'Banner not found' });

        const { image, alt, link, isActive } = req.body;
        if (image !== undefined) banner.image = image;
        if (alt !== undefined) banner.alt = alt;
        if (link !== undefined) banner.link = link;
        if (isActive !== undefined) banner.isActive = isActive;

        const updatedBanner = await banner.save();
        res.json(updatedBanner);
    } catch (error) {
        res.status(400).json({ message: 'Error updating banner', error: error.message });
    }
};

const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) return res.status(404).json({ message: 'Banner not found' });
        await banner.deleteOne();
        res.json({ message: 'Banner removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting banner', error: error.message });
    }
};

module.exports = { getBanners, createBanner, updateBanner, deleteBanner };
