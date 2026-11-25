const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const sendOrderNotification = require('../utils/sendOrderNotification');

const orderStatusMap = {
  dispatched: 'Dispatched',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  placed: 'Placed',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
};

const normalizeDeliveryStatus = (status) => orderStatusMap[status] || status;

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.id,
      user: req.user._id,
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const { orderId, address, deliveryAddress, customerName, customerPhone, customerEmail, paymentMethod, estimatedDelivery, items } = req.body;
    const sourceItems = Array.isArray(items) && items.length > 0 ? items : req.user.cart;
    if (!sourceItems || sourceItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items available' });
    }

    const orderItems = sourceItems.map((item) => ({
      productId: item.productId || item._id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity || item.qty || 1,
      size: item.size || item.variant || '',
      color: item.color || '',
    }));

    const amount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const nextOrderId = orderId || `YLTS-${Date.now().toString().slice(-6)}`;
    const payableMethod = paymentMethod === 'Cash on Delivery' ? 'Cash on Delivery' : 'Pay Online (UPI / Card)';
    const paymentStatus = payableMethod === 'Cash on Delivery' ? 'pending' : 'pending';

    const order = await Order.create({
      orderId: nextOrderId,
      user: req.user._id,
      items: orderItems,
      shippingAddress: address || deliveryAddress || '',
      deliveryAddress: deliveryAddress || address || '',
      customerName: customerName || req.user.name,
      customerPhone: customerPhone || req.user.mobile || '',
      customerEmail: customerEmail || req.user.email || '',
      paymentMethod: payableMethod,
      paymentStatus,
      payment: { method: payableMethod, status: paymentStatus },
      amount,
      status: 'Placed',
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
    });

    const emailNotification = await sendOrderNotification(order);
    res.status(201).json({ success: true, data: order, emailNotification });
  } catch (error) {
    next(error);
  }
};

const trackOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const initiatePayment = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      return res.json({ success: true, data: { message: 'Order already paid' } });
    }

    const amount = order.amount * 100;
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: 'Razorpay credentials are not configured' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount,
      currency: 'INR',
      receipt: order.orderId,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    order.payment = {
      method: order.paymentMethod,
      status: 'pending',
      provider: 'razorpay',
      razorpayOrderId: razorpayOrder.id,
    };
    await order.save();

    res.json({ success: true, data: { orderId: order.orderId, razorpayOrder, amount, currency: 'INR' } });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      order.payment.status = 'failed';
      await order.save();
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    order.payment.status = 'paid';
    order.payment.razorpayOrderId = razorpay_order_id;
    order.payment.razorpayPaymentId = razorpay_payment_id;
    order.payment.razorpaySignature = razorpay_signature;
    order.paymentStatus = 'paid';
    order.status = 'Confirmed';
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const downloadInvoice = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const invoiceText = `Invoice for ${order.orderId}\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nAmount: ₹${order.amount.toFixed(2)}\nStatus: ${order.status}\n\nItems:\n${order.items
      .map((item) => `- ${item.name} x${item.quantity} @ ₹${item.price}`)
      .join('\n')}`;

    const buffer = Buffer.from(invoiceText, 'utf8');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderId}.pdf`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyOrders,
  getOrderById,
  createOrder,
  trackOrder,
  initiatePayment,
  verifyPayment,
  downloadInvoice,
};
