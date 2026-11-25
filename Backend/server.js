const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const userRoutes = require('./routes/userRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const customOrderRoutes = require('./routes/customOrderRoutes');
const {
  getAdminCustomOrders,
  getAdminCustomOrderById,
  updateAdminCustomOrder,
} = require('./controllers/customOrderController');
const { authenticate, authorizeRoles } = require('./middleware/authMiddleware');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve local tailor images (same folder as Frontend/public/Image)
app.use(
  '/Image',
  express.static(path.join(__dirname, '../Frontend/public/Image'))
);

// Profile avatars & other uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/custom-orders', customOrderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/banners', bannerRoutes);

// Admin custom design orders (personal stitching requests)
app.get('/api/admin/custom-orders', authenticate, authorizeRoles('admin'), getAdminCustomOrders);
app.get('/api/admin/custom-orders/:id', authenticate, authorizeRoles('admin'), getAdminCustomOrderById);
app.patch('/api/admin/custom-orders/:id', authenticate, authorizeRoles('admin'), updateAdminCustomOrder);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'Backend is running' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
