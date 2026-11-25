const Razorpay = require('razorpay');
const crypto = require('crypto');
const CustomOrder = require('../models/CustomOrder');

const VALID_CATEGORIES = [
  'single-shirt',
  'single-pant',
  'shirt-pant-pair',
  'single-coat',
  '2-piece',
  '3-piece',
  'kurta-pajama',
];

const oneWeekLater = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(18, 0, 0, 0);
  return date;
};

const createCustomOrder = async (req, res, next) => {
  try {
    const {
      orderCategory,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      preferredColor,
      fabric,
      modelDesign,
      sizeOrMeasurements,
      extraNotes,
      shirtCollar,
      shirtFit,
      shirtSleeve,
      pantDesign,
      pantLength,
      pantFit,
      coatStyle,
      waistcoatNeeded,
      kurtaStyle,
      advanceAmount,
      advancePaymentMethod,
      estimatedTotal,
    } = req.body;

    if (!VALID_CATEGORIES.includes(orderCategory)) {
      return res.status(400).json({ success: false, message: 'Invalid order category' });
    }

    if (!customerName?.trim() || !customerPhone?.trim() || !deliveryAddress?.trim()) {
      return res.status(400).json({ success: false, message: 'Name, phone and address are required' });
    }

    const advance = Number(advanceAmount);
    if (!advance || advance < 1) {
      return res.status(400).json({ success: false, message: 'Advance amount is required for custom orders' });
    }

    const needsPant = ['single-pant', 'shirt-pant-pair', '2-piece', '3-piece'].includes(orderCategory);
    if (needsPant && pantDesign && !['bootcut', 'baggy', 'straight'].includes(pantDesign)) {
      return res.status(400).json({ success: false, message: 'Invalid pant design' });
    }
    if (needsPant && pantLength && !['long', 'ankle'].includes(pantLength)) {
      return res.status(400).json({ success: false, message: 'Invalid pant length' });
    }

    const customOrderId = `CO-${Date.now().toString().slice(-8)}`;

    const order = await CustomOrder.create({
      customOrderId,
      user: req.user._id,
      orderCategory,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: (customerEmail || req.user.email || '').trim().toLowerCase(),
      deliveryAddress: deliveryAddress.trim(),
      preferredColor: preferredColor || '',
      fabric: fabric || '',
      modelDesign: modelDesign || '',
      sizeOrMeasurements: sizeOrMeasurements || '',
      extraNotes: extraNotes || '',
      shirtCollar: shirtCollar || '',
      shirtFit: shirtFit || '',
      shirtSleeve: shirtSleeve || '',
      pantDesign: needsPant ? pantDesign || '' : '',
      pantLength: needsPant ? pantLength || '' : '',
      pantFit: pantFit || '',
      coatStyle: coatStyle || '',
      waistcoatNeeded: Boolean(waistcoatNeeded),
      kurtaStyle: kurtaStyle || '',
      expectedDelivery: oneWeekLater(),
      advanceAmount: advance,
      advancePaymentMethod: advancePaymentMethod || 'upi',
      advancePaymentStatus: 'pending',
      estimatedTotal: Number(estimatedTotal) || 0,
      status: 'Placed',
    });

    res.status(201).json({
      success: true,
      message: 'Custom design order placed successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const getMyCustomOrders = async (req, res, next) => {
  try {
    const orders = await CustomOrder.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const getMyCustomOrderById = async (req, res, next) => {
  try {
    const order = await CustomOrder.findOne({
      customOrderId: req.params.id,
      user: req.user._id,
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Custom order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getAdminCustomOrders = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.orderCategory) filter.orderCategory = req.query.orderCategory;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.advancePaymentStatus) filter.advancePaymentStatus = req.query.advancePaymentStatus;

    const orders = await CustomOrder.find(filter)
      .populate('user', 'name email mobile')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const getAdminCustomOrderById = async (req, res, next) => {
  try {
    const order = await CustomOrder.findOne({ customOrderId: req.params.id }).populate(
      'user',
      'name email mobile'
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Custom order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const updateAdminCustomOrder = async (req, res, next) => {
  try {
    const order = await CustomOrder.findOne({ customOrderId: req.params.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Custom order not found' });
    }

    const allowed = ['status', 'advancePaymentStatus', 'adminNotes', 'estimatedTotal', 'expectedDelivery'];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) order[key] = req.body[key];
    });

    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const initiateCustomOrderPayment = async (req, res, next) => {
  try {
    const order = await CustomOrder.findOne({
      customOrderId: req.params.id,
      user: req.user._id,
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Custom order not found' });
    }

    if (order.advancePaymentStatus === 'paid') {
      return res.json({
        success: true,
        data: { message: 'Advance already paid', alreadyPaid: true, order },
      });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay credentials are not configured',
      });
    }

    const amountPaise = Math.round(Number(order.advanceAmount) * 100);
    if (amountPaise < 100) {
      return res.status(400).json({
        success: false,
        message: 'Advance amount must be at least ₹1',
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: order.customOrderId.slice(0, 40),
      payment_capture: 1,
      notes: {
        customOrderId: order.customOrderId,
        orderCategory: order.orderCategory,
        type: 'custom_order_advance',
      },
    });

    order.payment = {
      provider: 'razorpay',
      razorpayOrderId: razorpayOrder.id,
      razorpayPaymentId: order.payment?.razorpayPaymentId || '',
      razorpaySignature: order.payment?.razorpaySignature || '',
    };
    order.advancePaymentMethod = order.advancePaymentMethod === 'cash' ? 'upi' : order.advancePaymentMethod;
    order.advancePaymentStatus = 'pending';
    await order.save();

    res.json({
      success: true,
      data: {
        keyId: process.env.RAZORPAY_KEY_ID,
        customOrderId: order.customOrderId,
        amount: amountPaise,
        currency: 'INR',
        razorpayOrder,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyCustomOrderPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const order = await CustomOrder.findOne({
      customOrderId: req.params.id,
      user: req.user._id,
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Custom order not found' });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment details missing' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      order.advancePaymentStatus = 'failed';
      await order.save();
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    order.advancePaymentStatus = 'paid';
    order.advancePaymentMethod = 'upi';
    order.status = order.status === 'Placed' ? 'Confirmed' : order.status;
    order.payment = {
      provider: 'razorpay',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    };
    await order.save();

    res.json({ success: true, data: order, message: 'Advance payment successful' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCustomOrder,
  getMyCustomOrders,
  getMyCustomOrderById,
  getAdminCustomOrders,
  getAdminCustomOrderById,
  updateAdminCustomOrder,
  initiateCustomOrderPayment,
  verifyCustomOrderPayment,
};
