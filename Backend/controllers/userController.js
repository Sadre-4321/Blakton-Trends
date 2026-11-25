const User = require('../models/User');
const crypto = require('crypto');

const updateAddresses = async (req, res, next) => {
  try {
    const { addresses } = req.body;
    if (!Array.isArray(addresses)) {
      return res.status(400).json({ success: false, message: 'Addresses must be an array' });
    }

    if (addresses.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'You can save maximum 3 addresses on your profile',
      });
    }

    const normalized = addresses.map((address) => ({
      id: address.id || crypto.randomBytes(8).toString('hex'),
      fullName: address.fullName,
      mobile: address.mobile,
      house: address.house,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: Boolean(address.isDefault),
    }));

    // Ensure only one default
    let hasDefault = false;
    const withDefault = normalized.map((address, index) => {
      if (address.isDefault && !hasDefault) {
        hasDefault = true;
        return address;
      }
      return { ...address, isDefault: false };
    });
    if (!hasDefault && withDefault.length > 0) {
      withDefault[0].isDefault = true;
    }

    const user = await User.findById(req.user._id);
    user.addresses = withDefault;
    await user.save();
    res.json({ success: true, data: user.addresses, user });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

const getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    res.json({ success: true, data: user.addresses || [] });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateAddresses,
  changePassword,
  getAddresses,
};
