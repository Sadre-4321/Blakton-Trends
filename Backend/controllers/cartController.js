const Product = require('../models/Product');

const getCart = async (req, res, next) => {
  try {
    await req.user.populate('cart.productId', 'name price images stock originalPrice discountPercent');
    res.json({ success: true, data: req.user.cart });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, size = '', color = '' } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existingItem = req.user.cart.find(
      (item) => item.productId.toString() === productId
        && (item.size || '') === size
        && (item.color || '') === color,
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      req.user.cart.push({
        productId: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: product.price,
        quantity: Number(quantity),
        size,
        color,
      });
    }

    await req.user.save();
    res.status(201).json({ success: true, data: req.user.cart });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity, size = '', color = '' } = req.body;
    if (quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Quantity is required' });
    }

    const item = req.user.cart.find((cartItem) => {
      const sameProduct = cartItem.productId.toString() === productId;
      if (!sameProduct) return false;
      if (size || color) {
        return (cartItem.size || '') === size && (cartItem.color || '') === color;
      }
      return true;
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    item.quantity = Number(quantity);
    if (item.quantity <= 0) {
      req.user.cart = req.user.cart.filter((cartItem) => cartItem !== item);
    }

    await req.user.save();
    res.json({ success: true, data: req.user.cart });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { size, color } = req.query;
    req.user.cart = req.user.cart.filter((item) => {
      if (item.productId.toString() !== productId) return true;
      if (size !== undefined || color !== undefined) {
        return !((item.size || '') === (size || '') && (item.color || '') === (color || ''));
      }
      return false;
    });
    await req.user.save();
    res.json({ success: true, data: req.user.cart });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    req.user.cart = [];
    await req.user.save();
    res.json({ success: true, data: req.user.cart });
  } catch (error) {
    next(error);
  }
};

const applyCoupon = async (req, res, next) => {
  try {
    const { couponCode } = req.body;
    if (!couponCode) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }
    req.user.cartCoupon = couponCode;
    await req.user.save();
    res.json({ success: true, message: 'Coupon applied successfully', data: { couponCode } });
  } catch (error) {
    next(error);
  }
};

const removeCoupon = async (req, res, next) => {
  try {
    req.user.cartCoupon = '';
    await req.user.save();
    res.json({ success: true, message: 'Coupon removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
};
