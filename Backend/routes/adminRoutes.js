const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getRevenue,
  getOrderStatus,
  getRecentOrders,
  getLowStock,
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrder,
  getProducts,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  getBanners,
  createBanner,
  updateBanner,
  patchBanner,
  deleteBanner,
  getDeliveryBoys,
  getPaymentSummary,
  getPayments,
  confirmPayment,
  getCustomers,
  toggleCustomerStatus,
  addDeliveryBoy,
  updateUser,
} = require('../controllers/adminController');

const router = express.Router();
router.use(authenticate, authorizeRoles('admin'));

router.get('/stats/revenue', getRevenue);
router.get('/stats/orders', getOrderStatus);

router.get('/orders', getAdminOrders);
router.get('/orders/:orderId', getAdminOrderById);
router.patch('/orders/:orderId', updateAdminOrder);

router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);

router.patch('/products/:id', updateProductStatus);
router.delete('/products/:id', deleteProduct);

router.get('/banners', getBanners);
router.post('/banners', createBanner);
router.put('/banners/:id', updateBanner);
router.patch('/banners/:id', patchBanner);
router.delete('/banners/:id', deleteBanner);

router.get('/delivery-boys', getDeliveryBoys);
router.post('/users', addDeliveryBoy);
router.get('/users', async (req, res, next) => {
  if (req.query.role === 'delivery_boy') {
    return getDeliveryBoys(req, res, next);
  }
  return getCustomers(req, res, next);
});
router.patch('/users/:id', updateUser);
router.get('/payments/summary', getPaymentSummary);
router.get('/payments', getPayments);
router.patch('/payments/:paymentId', confirmPayment);
router.get('/customers', getCustomers);
router.patch('/users/:customerId/status', toggleCustomerStatus);

module.exports = router;
