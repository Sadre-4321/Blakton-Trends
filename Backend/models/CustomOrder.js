const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema(
  {
    customOrderId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderCategory: {
      type: String,
      enum: [
        'single-shirt',
        'single-pant',
        'shirt-pant-pair',
        'single-coat',
        '2-piece',
        '3-piece',
        'kurta-pajama',
      ],
      required: true,
    },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, default: '' },
    deliveryAddress: { type: String, required: true },

    // Shared design fields
    preferredColor: { type: String, default: '' },
    fabric: { type: String, default: '' },
    modelDesign: { type: String, default: '' },
    sizeOrMeasurements: { type: String, default: '' },
    extraNotes: { type: String, default: '' },

    // Shirt
    shirtCollar: { type: String, default: '' },
    shirtFit: { type: String, default: '' },
    shirtSleeve: { type: String, default: '' },

    // Pant
    pantDesign: {
      type: String,
      enum: ['', 'bootcut', 'baggy', 'straight'],
      default: '',
    },
    pantLength: {
      type: String,
      enum: ['', 'long', 'ankle'],
      default: '',
    },
    pantFit: { type: String, default: '' },

    // Coat / suit / kurta extras
    coatStyle: { type: String, default: '' },
    waistcoatNeeded: { type: Boolean, default: false },
    kurtaStyle: { type: String, default: '' },

    expectedDelivery: { type: Date, required: true },
    advanceAmount: { type: Number, required: true, min: 1 },
    advancePaymentMethod: {
      type: String,
      enum: ['upi', 'cash', 'online'],
      default: 'upi',
    },
    advancePaymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    payment: {
      provider: { type: String, default: 'razorpay' },
      razorpayOrderId: { type: String, default: '' },
      razorpayPaymentId: { type: String, default: '' },
      razorpaySignature: { type: String, default: '' },
    },
    estimatedTotal: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Placed', 'Confirmed', 'In Stitching', 'Ready', 'Dispatched', 'Delivered', 'Cancelled'],
      default: 'Placed',
    },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CustomOrder', customOrderSchema);
