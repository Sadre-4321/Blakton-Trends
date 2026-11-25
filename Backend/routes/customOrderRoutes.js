const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const {
  createCustomOrder,
  getMyCustomOrders,
  getMyCustomOrderById,
  initiateCustomOrderPayment,
  verifyCustomOrderPayment,
} = require('../controllers/customOrderController');

const router = express.Router();

router.use(authenticate, authorizeRoles('customer', 'admin'));

router.post('/', createCustomOrder);
router.get('/mine', getMyCustomOrders);
router.get('/mine/:id', getMyCustomOrderById);
router.post('/:id/payment', initiateCustomOrderPayment);
router.post('/:id/verify-payment', verifyCustomOrderPayment);

module.exports = router;
