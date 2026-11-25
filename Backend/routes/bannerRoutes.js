const express = require('express');
const { getPublicBanners } = require('../controllers/bannerController');

const router = express.Router();
router.get('/', getPublicBanners);

module.exports = router;
