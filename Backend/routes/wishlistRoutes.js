const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  isInWishlist,
  moveToCart,
} = require('../controllers/wishlistController');

const router = express.Router();
router.use(authenticate);
router.get('/', getWishlist);
router.post('/add', addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.delete('/', clearWishlist);
router.get('/check/:productId', isInWishlist);
router.post('/:productId/move-to-cart', moveToCart);

module.exports = router;
