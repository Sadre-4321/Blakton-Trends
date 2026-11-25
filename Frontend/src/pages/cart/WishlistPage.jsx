import React from 'react';
import { Link } from 'react-router-dom';
import useWishlist from '../../hooks/useWishlist';
import useCart from '../../hooks/useCart';

const WishlistPage = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold mb-4">Your Wishlist is Empty</h1>
          <Link to="/products" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      <div className="container-main section-padding">
        <h1 className="font-serif text-4xl font-bold mb-8">My Wishlist</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item._id} className="card overflow-hidden">
              <div className="w-full h-60 bg-gray-300" />
              <div className="p-4">
                <h4 className="font-bold text-lg mb-2">{item.name}</h4>
                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-secondary font-bold">₹{item.price}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(item)}
                      className="btn-secondary text-sm"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item._id)}
                      className="text-error text-lg"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
