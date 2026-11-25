const express = require('express');
const { getCollections } = require('../controllers/collectionController');

const router = express.Router();
router.get('/', getCollections);

module.exports = router;
