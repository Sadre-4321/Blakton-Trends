const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Banner = require('../models/Banner');

const getRevenue = async (req, res, next) => {
  try {
    const revenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: revenue[0]?.totalRevenue || 0,
        totalOrders: revenue[0]?.count || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getOrderStatus = async (req, res, next) => {
  try {
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data: statusCounts });
  } catch (error) {
    next(error);
  }
};

const getRecentOrders = async (req, res, next) => {
  try {
    const { status, search, from, to } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;
    if (search) query.$or = [{ orderId: { $regex: search, $options: 'i' } }, { customerName: { $regex: search, $options: 'i' } }];
    if (from || to) query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);

    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const getLowStock = async (req, res, next) => {
  try {
    const products = await Product.find({ stock: { $lt: 10 } }).sort({ stock: 1 }).limit(50);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const getAdminOrders = async (req, res, next) => {
  try {
    const { status, search, from, to } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;
    if (search) query.$or = [{ orderId: { $regex: search, $options: 'i' } }, { customerName: { $regex: search, $options: 'i' } }];
    if (from || to) query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);

    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const getAdminOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId }).populate('deliveryBoy', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const updateAdminOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const { status, deliveryBoyId } = req.body;
    if (status) order.status = status;
    if (deliveryBoyId) {
      order.deliveryBoy = deliveryBoyId;
      order.assignedAt = new Date();
      if (!order.trackingId) {
        order.trackingId = `TRK-${Date.now().toString().slice(-6)}`;
      }
    }
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (status) query.status = status;
    const products = await Product.find(query).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const updates = req.body;
    Object.assign(product, updates);
    await product.save();
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const updateProductStatus = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (req.body.status) {
      product.status = req.body.status;
    }
    await product.save();
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    await Product.deleteOne({ _id: product._id });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    const data = banners.map((banner) => {
      const item = banner.toObject();
      return {
        ...item,
        id: item._id,
        image: item.image || item.imageUrl,
        isActive: item.isActive ?? item.active,
      };
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createBanner = async (req, res, next) => {
  try {
    const payload = {
      title: req.body.title || 'Offer Banner',
      subtitle: req.body.subtitle || '',
      imageUrl: req.body.image || req.body.imageUrl || '',
      image: req.body.image || req.body.imageUrl || '',
      link: req.body.link || '/products?onOffer=true',
      order: Number(req.body.order) || 1,
      active: req.body.isActive !== false && req.body.active !== false,
      isActive: req.body.isActive !== false && req.body.active !== false,
    };
    const banner = await Banner.create(payload);
    res.status(201).json({ success: true, data: { ...banner.toObject(), id: banner._id, image: banner.image || banner.imageUrl } });
  } catch (error) {
    next(error);
  }
};

const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    if (req.body.title !== undefined) banner.title = req.body.title;
    if (req.body.subtitle !== undefined) banner.subtitle = req.body.subtitle;
    if (req.body.link !== undefined) banner.link = req.body.link;
    if (req.body.order !== undefined) banner.order = Number(req.body.order);
    if (req.body.image || req.body.imageUrl) {
      banner.image = req.body.image || req.body.imageUrl;
      banner.imageUrl = req.body.image || req.body.imageUrl;
    }
    if (req.body.isActive !== undefined || req.body.active !== undefined) {
      const active = req.body.isActive ?? req.body.active;
      banner.isActive = active;
      banner.active = active;
    }
    await banner.save();
    res.json({ success: true, data: { ...banner.toObject(), id: banner._id, image: banner.image || banner.imageUrl } });
  } catch (error) {
    next(error);
  }
};

const patchBanner = async (req, res, next) => updateBanner(req, res, next);

const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    await Banner.deleteOne({ _id: banner._id });
    res.json({ success: true, message: 'Banner removed successfully' });
  } catch (error) {
    next(error);
  }
};

const getDeliveryBoys = async (req, res, next) => {
  try {
    const deliveryBoys = await User.find({ role: 'delivery_boy', status: 'active' }).select('-password');
    res.json({ success: true, data: deliveryBoys });
  } catch (error) {
    next(error);
  }
};

const getPaymentSummary = async (req, res, next) => {
  try {
    const summary = await Order.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          total: { $sum: '$amount' },
        },
      },
    ]);
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

const getPayments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.paymentStatus = status;
    const payments = await Order.find(query).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.paymentId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }
    order.paymentStatus = 'paid';
    order.payment.status = 'paid';
    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password');
    res.json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

const toggleCustomerStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.customerId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.status = req.body.status || (user.status === 'active' ? 'inactive' : 'active');
    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const addDeliveryBoy = async (req, res, next) => {
  try {
    const { name, email, mobile, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    const user = await User.create({ name, email, mobile, password, role: 'delivery_boy' });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    Object.assign(user, req.body);
    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
