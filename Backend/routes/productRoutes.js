const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  getFeaturedProducts,
  getNewArrivals,
  getProductReviews,
  addProductReview,
} = require('../controllers/productController');
const { updateProductStatus, deleteProduct } = require('../controllers/adminController');

const router = express.Router();

router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', authenticate, addProductReview);
router.get('/:id', getProductById);
router.get('/', getAllProducts);
router.patch('/:id', authenticate, authorizeRoles('admin'), updateProductStatus);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteProduct);

module.exports = router;
