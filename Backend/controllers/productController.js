const Product = require('../models/Product');
const Category = require('../models/Category');
const Collection = require('../models/Collection');
const { buildSmartProductQuery } = require('../utils/smartSearch');

const getAllProducts = async (req, res, next) => {
  try {
    const {
      category, collection, featured, newArrival, q, search, page, limit, season, pieceType, occasion, pantStyle, onOffer, fabric, color,
    } = req.query;
    const searchText = q || search;

    // Smart search path (Flipkart-style)
    if (searchText && String(searchText).trim()) {
      const { parsed, primary, fallbackCategory, fallbackBroad } = buildSmartProductQuery(searchText);
      let products = await Product.find(primary).limit(Number(limit) || 48);
      let matchType = 'exact';

      if (!products.length && fallbackCategory) {
        products = await Product.find(fallbackCategory).limit(Number(limit) || 48);
        matchType = 'category';
      }
      if (!products.length && fallbackBroad) {
        products = await Product.find(fallbackBroad).limit(Number(limit) || 48);
        matchType = 'related';
      }

      return res.json({
        success: true,
        data: products,
        meta: {
          query: parsed.original,
          matchType,
          filters: {
            category: parsed.category || null,
            color: parsed.color || null,
            pantStyle: parsed.pantStyle || null,
            occasion: parsed.occasion || null,
          },
        },
      });
    }

    const query = { status: 'active' };

    if (category) query.category = category;
    if (collection) query.collection = collection;
    if (season) query.season = season;
    if (pieceType) query.pieceType = pieceType;
    if (occasion) query.occasion = occasion;
    if (pantStyle) query.pantStyle = pantStyle;
    if (fabric) query.fabric = { $regex: fabric, $options: 'i' };
    if (color) query.color = { $regex: color, $options: 'i' };
    if (featured === 'true') query.featured = true;
    if (newArrival === 'true') query.newArrival = true;
    if (onOffer === 'true') {
      query.$or = [{ onOffer: true }, { discountPercent: { $gt: 0 } }];
    }

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 20;
    const products = await Product.find(query)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const getProductsByCategory = async (req, res, next) => {
  try {
    const products = await Product.find({ category: req.params.category, status: 'active' });
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const searchProducts = async (req, res, next) => {
  try {
    const q = req.query.q || req.query.search || '';
    if (!String(q).trim()) {
      const products = await Product.find({ status: 'active' }).limit(48);
      return res.json({
        success: true,
        data: products,
        meta: { query: '', matchType: 'all', filters: {} },
      });
    }

    const { parsed, primary, fallbackCategory, fallbackBroad } = buildSmartProductQuery(q);
    let products = await Product.find(primary).limit(48);
    let matchType = 'exact';

    if (!products.length && fallbackCategory) {
      products = await Product.find(fallbackCategory).limit(48);
      matchType = 'category';
    }
    if (!products.length && fallbackBroad) {
      products = await Product.find(fallbackBroad).limit(48);
      matchType = 'related';
    }
    if (!products.length) {
      products = await Product.find({ status: 'active' }).limit(24);
      matchType = 'popular';
    }

    res.json({
      success: true,
      data: products,
      meta: {
        query: parsed.original,
        matchType,
        filters: {
          category: parsed.category || null,
          color: parsed.color || null,
          pantStyle: parsed.pantStyle || null,
          occasion: parsed.occasion || null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

const getCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find();
    res.json({ success: true, data: collections });
  } catch (error) {
    next(error);
  }
};

const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ featured: true, status: 'active' }).limit(20);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const getNewArrivals = async (req, res, next) => {
  try {
    const products = await Product.find({ newArrival: true, status: 'active' }).limit(20);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product.reviews || [] });
  } catch (error) {
    next(error);
  }
};

const addProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const existingReview = product.reviews.find((review) => review.user?.toString() === req.user._id.toString());
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
    } else {
      product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
    }
    await product.save();
    res.status(201).json({ success: true, data: product.reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  getCategories,
  getCollections,
  getFeaturedProducts,
  getNewArrivals,
  getProductReviews,
  addProductReview,
};
