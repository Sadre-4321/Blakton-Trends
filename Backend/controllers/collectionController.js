const Collection = require('../models/Collection');

const getCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find();
    res.json({ success: true, data: collections });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCollections,
};
