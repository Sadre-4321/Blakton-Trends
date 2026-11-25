const Product = require('../models/Product');

const getWishlist = async (req, res, next) => {
  try {
    await req.user.populate('wishlist', 'name price images category collection');
    res.json({ success: true, data: req.user.wishlist });
  } catch (error) {
    next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const exists = req.user.wishlist.some((id) => id.toString() === productId);
    if (!exists) {
      req.user.wishlist.push(product._id);
      await req.user.save();
    }

    res.status(201).json({ success: true, data: req.user.wishlist });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    req.user.wishlist = req.user.wishlist.filter((id) => id.toString() !== productId);
    await req.user.save();
    res.json({ success: true, data: req.user.wishlist });
  } catch (error) {
    next(error);
  }
};

const clearWishlist = async (req, res, next) => {
  try {
    req.user.wishlist = [];
    await req.user.save();
    res.json({ success: true, data: req.user.wishlist });
  } catch (error) {
    next(error);
  }
};

const isInWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const exists = req.user.wishlist.some((id) => id.toString() === productId);
    res.json({ success: true, data: { inWishlist: exists } });
  } catch (error) {
    next(error);
  }
};

const moveToCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    req.user.wishlist = req.user.wishlist.filter((id) => id.toString() !== productId);
    const existingCartItem = req.user.cart.find((item) => item.productId.toString() === productId);
    if (existingCartItem) {
      existingCartItem.quantity += 1;
    } else {
      req.user.cart.push({
        productId: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: product.price,
        quantity: 1,
      });
    }

    await req.user.save();
    res.json({ success: true, data: { wishlist: req.user.wishlist, cart: req.user.cart } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  isInWishlist,
  moveToCart,
};
