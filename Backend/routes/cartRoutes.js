const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} = require('../controllers/cartController');

const router = express.Router();
router.use(authenticate);
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item/:productId', updateCartItem);
router.delete('/item/:productId', removeFromCart);
router.delete('/', clearCart);
router.post('/apply-coupon', applyCoupon);
router.post('/remove-coupon', removeCoupon);

module.exports = router;
