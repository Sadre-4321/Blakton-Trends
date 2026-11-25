const Banner = require('../models/Banner');

const getPublicBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({
      $or: [{ active: true }, { isActive: true }],
    }).sort({ order: 1, createdAt: -1 });

    const data = banners.map((banner) => ({
      ...banner.toObject(),
      image: banner.image || banner.imageUrl,
      isActive: banner.isActive ?? banner.active,
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPublicBanners };
