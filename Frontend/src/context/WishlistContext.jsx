import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getLocalStorage, setLocalStorage } from '../utils/helpers';
import { STORAGE_KEYS } from '../constants/appConstants';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize wishlist from localStorage
  useEffect(() => {
    const storedWishlist = getLocalStorage(STORAGE_KEYS.WISHLIST, []);
    setItems(storedWishlist);
  }, []);

  // Save wishlist to localStorage
  useEffect(() => {
    setLocalStorage(STORAGE_KEYS.WISHLIST, items);
  }, [items]);

  const addToWishlist = useCallback((product) => {
    try {
      setLoading(true);
      const exists = items.some((item) => item._id === product._id);
      if (!exists) {
        setItems([...items, product]);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [items]);

  const removeFromWishlist = useCallback((productId) => {
    try {
      setItems(items.filter((item) => item._id !== productId));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [items]);

  const isInWishlist = useCallback((productId) => {
    return items.some((item) => item._id === productId);
  }, [items]);

  const toggleWishlist = useCallback((product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  }, [isInWishlist, removeFromWishlist, addToWishlist]);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const value = {
    items,
    loading,
    error,
    itemCount: items.length,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export default WishlistContext;
