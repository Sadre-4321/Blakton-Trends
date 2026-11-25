import React, { createContext, useState, useEffect, useCallback } from 'react';
import cartService from '../services/cartService';
import { getLocalStorage, setLocalStorage, calculateCartTotals } from '../utils/helpers';
import { STORAGE_KEYS } from '../constants/appConstants';
import useAuth from '../hooks/useAuth';

const CartContext = createContext();

const normalizeCartItem = (item) => {
  const product = item.productId && typeof item.productId === 'object' ? item.productId : null;
  const productId = product?._id || item.productId || item._id;
  return {
    _id: productId,
    productId,
    name: item.name || product?.name || 'Product',
    image: item.image || product?.images?.[0] || '',
    price: Number(item.price ?? product?.price ?? 0),
    quantity: Number(item.quantity || item.qty || 1),
    size: item.size || '',
    color: item.color || product?.color || '',
  };
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coupon, setCoupon] = useState(null);

  const persistLocal = useCallback((nextItems) => {
    setLocalStorage(STORAGE_KEYS.CART, nextItems);
  }, []);

  const syncFromServer = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const response = await cartService.getCart();
      const serverCart = response?.data?.data ?? response?.data ?? [];
      const normalized = Array.isArray(serverCart) ? serverCart.map(normalizeCartItem) : [];
      setItems(normalized);
      persistLocal(normalized);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, persistLocal]);

  useEffect(() => {
    const storedCart = getLocalStorage(STORAGE_KEYS.CART, []);
    if (Array.isArray(storedCart) && storedCart.length) {
      setItems(storedCart.map(normalizeCartItem));
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      syncFromServer();
    }
  }, [isAuthenticated, syncFromServer]);

  useEffect(() => {
    persistLocal(items);
  }, [items, persistLocal]);

  const addToCart = useCallback(async (product, quantity = 1, size = '') => {
    const productId = product._id || product.id || product.productId;
    if (!productId) return;

    const optimisticItem = normalizeCartItem({
      productId,
      name: product.name,
      image: product.images?.[0] || product.image || '',
      price: product.price,
      quantity,
      size,
      color: product.color || '',
    });

    setItems((current) => {
      const color = product.color || '';
      const existing = current.find((item) => (
        String(item.productId) === String(productId) && item.size === size && item.color === color
      ));
      if (existing) {
        return current.map((item) => (
          String(item.productId) === String(productId) && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
      }
      return [...current, optimisticItem];
    });

    if (isAuthenticated) {
      try {
        setLoading(true);
        await cartService.addToCart(productId, quantity, size, product.color || '');
        await syncFromServer();
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    }
  }, [isAuthenticated, syncFromServer]);

  const removeFromCart = useCallback(async (productId) => {
    setItems((current) => current.filter((item) => String(item.productId) !== String(productId) && String(item._id) !== String(productId)));

    if (isAuthenticated) {
      try {
        await cartService.removeFromCart(productId);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    }
  }, [isAuthenticated]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    setItems((current) => current.map((item) => (
      String(item.productId) === String(productId) || String(item._id) === String(productId)
        ? { ...item, quantity }
        : item
    )));

    if (isAuthenticated) {
      try {
        await cartService.updateCartItem(productId, quantity);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    }
  }, [isAuthenticated, removeFromCart]);

  const clearCart = useCallback(async () => {
    setItems([]);
    setCoupon(null);
    if (isAuthenticated) {
      try {
        await cartService.clearCart();
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    }
  }, [isAuthenticated]);

  const applyCoupon = useCallback(async (couponCode) => {
    setCoupon({ code: couponCode, discount: 10 });
    if (isAuthenticated) {
      try {
        await cartService.applyCoupon(couponCode);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    }
  }, [isAuthenticated]);

  const removeCoupon = useCallback(async () => {
    setCoupon(null);
    if (isAuthenticated) {
      try {
        await cartService.removeCoupon();
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    }
  }, [isAuthenticated]);

  const totals = calculateCartTotals(items);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    items,
    itemCount,
    totals,
    coupon,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    refreshCart: syncFromServer,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
