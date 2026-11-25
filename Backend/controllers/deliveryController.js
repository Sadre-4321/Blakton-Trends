const Order = require('../models/Order');

const deliveryStatusMap = {
  Dispatched: 'dispatched',
  'Out for Delivery': 'out_for_delivery',
  Delivered: 'delivered',
  Placed: 'placed',
  Confirmed: 'confirmed',
  Cancelled: 'cancelled',
};

const toDeliveryStatus = (status) => deliveryStatusMap[status] || status;

const apiToOrderStatus = {
  dispatched: 'Dispatched',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  placed: 'Placed',
  confirmed: 'Confirmed',
};

const getMyDeliveries = async (req, res, next) => {
  try {
    const orders = await Order.find({ deliveryBoy: req.user._id })
      .sort({ createdAt: -1 })
      .select('-payment -paymentStatus -amount');

    const mapped = orders.map((order) => {
      const item = order.toObject();
      item.status = toDeliveryStatus(item.status);
      return item;
    });

    res.json({ success: true, data: mapped });
  } catch (error) {
    next(error);
  }
};

const getDeliveryOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId }).populate('deliveryBoy', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Delivery order not found' });
    }
    const assignedId = order.deliveryBoy?._id?.toString() || order.deliveryBoy?.toString();
    if (req.user.role === 'delivery_boy' && assignedId && assignedId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Order not assigned to this delivery partner' });
    }

    const responseOrder = order.toObject();
    responseOrder.status = toDeliveryStatus(responseOrder.status);
    delete responseOrder.payment;
    delete responseOrder.paymentStatus;
    delete responseOrder.amount;

    res.json({ success: true, order: responseOrder });
  } catch (error) {
    next(error);
  }
};

const updateDeliveryStatus = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const assignedId = order.deliveryBoy?._id?.toString() || order.deliveryBoy?.toString();
    if (req.user.role === 'delivery_boy' && assignedId && assignedId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this order' });
    }

    const { status } = req.body;
    const normalizedStatus = apiToOrderStatus[status] || status;
    if (normalizedStatus) {
      order.status = normalizedStatus;
    }
    if (!order.trackingId) {
      order.trackingId = order.trackingId || `TRK-${Date.now().toString().slice(-5)}`;
    }
    if (!order.assignedAt) {
      order.assignedAt = new Date();
    }
    await order.save();

    const responseOrder = order.toObject();
    responseOrder.status = toDeliveryStatus(responseOrder.status);
    delete responseOrder.payment;
    delete responseOrder.paymentStatus;
    delete responseOrder.amount;

    res.json({ success: true, order: responseOrder });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyDeliveries,
  getDeliveryOrder,
  updateDeliveryStatus,
};
