const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const {
  getMyOrders,
  getOrderById,
  createOrder,
  trackOrder,
  initiatePayment,
  verifyPayment,
  downloadInvoice,
} = require('../controllers/orderController');

const router = express.Router();
router.use(authenticate);
router.get('/', getMyOrders);
router.post('/', createOrder);
router.get('/:id', getOrderById);
router.get('/:id/track', trackOrder);
router.post('/:id/payment', initiatePayment);
router.post('/:id/verify-payment', verifyPayment);
router.get('/:id/invoice', downloadInvoice);

module.exports = router;
