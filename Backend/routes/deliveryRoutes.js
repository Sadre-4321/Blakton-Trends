const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { getMyDeliveries, getDeliveryOrder, updateDeliveryStatus } = require('../controllers/deliveryController');

const router = express.Router();
router.use(authenticate, authorizeRoles('delivery_boy'));
router.get('/orders', getMyDeliveries);
router.get('/orders/:orderId', getDeliveryOrder);
router.patch('/orders/:orderId', updateDeliveryStatus);

module.exports = router;
