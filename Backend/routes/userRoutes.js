const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { updateAddresses, changePassword, getAddresses } = require('../controllers/userController');

const router = express.Router();
router.use(authenticate);
router.get('/addresses', getAddresses);
router.patch('/addresses', updateAddresses);
router.put('/addresses', updateAddresses);
router.patch('/change-password', changePassword);

module.exports = router;
