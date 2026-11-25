const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, default: 0 },
  originalPrice: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  category: { type: String, required: true },
  collection: { type: String, default: '' },
  season: {
    type: String,
    enum: ['all-season', 'summer', 'winter'],
    default: 'all-season',
  },
  pieceType: {
    type: String,
    enum: ['single', 'pair', '2-piece', '3-piece'],
    default: 'single',
  },
  pantStyle: {
    type: String,
    enum: ['', 'straight', 'bootcut', 'baggy', 'slim', 'regular'],
    default: '',
  },
  occasion: {
    type: String,
    enum: ['regular', 'formal', 'party', 'wedding'],
    default: 'formal',
  },
  fabric: { type: String, default: 'Cotton' },
  material: { type: String, default: '' },
  fit: { type: String, default: 'Regular Fit' },
  color: { type: String, default: '' },
  colors: [{ type: String }],
  included: [{ type: String }],
  careInstructions: { type: String, default: 'Dry clean or gentle hand wash. Do not bleach.' },
  returnDays: { type: Number, default: 7 },
  refundDays: { type: Number, default: 7 },
  deliveryDays: { type: String, default: '3-5 business days' },
  onOffer: { type: Boolean, default: false },
  offerBadge: { type: String, default: '' },
  sizes: [{ type: String }],
  images: [{ type: String }],
  featured: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
  stock: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  reviews: [reviewSchema],
}, { timestamps: true, suppressReservedKeysWarning: true });

productSchema.pre('save', function (next) {
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discountPercent = Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100,
    );
    if (this.discountPercent > 0) this.onOffer = true;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
