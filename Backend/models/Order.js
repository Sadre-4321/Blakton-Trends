const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  size: { type: String },
  color: { type: String },
});

const paymentSchema = new mongoose.Schema({
  method: { type: String, default: 'online' },
  status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  provider: { type: String, default: 'razorpay' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: { type: String, default: '' },
  deliveryAddress: { type: String, default: '' },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String, default: '' },
  paymentMethod: { type: String, enum: ['online', 'cod', 'Pay Online (UPI / Card)', 'Cash on Delivery'], default: 'online' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  payment: paymentSchema,
  amount: { type: Number, default: 0 },
  status: { type: String, enum: ['Placed', 'Confirmed', 'Dispatched', 'Out for Delivery', 'Delivered', 'Cancelled'], default: 'Placed' },
  deliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  trackingId: { type: String, default: '' },
  pickupLocation: { type: String, default: '' },
  assignedAt: { type: Date },
  estimatedDelivery: { type: Date },
  deliveryNotes: { type: String, default: '' },
  invoiceNumber: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
