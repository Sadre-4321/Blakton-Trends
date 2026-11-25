import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartContext from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';

const CountUp = ({ value, duration = 300 }) => {
  const [display, setDisplay] = useState(value);
  const rafRef = useRef();
  const startRef = useRef(null);
  const fromRef = useRef(value);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const from = fromRef.current;
    const to = value;
    const start = performance.now();
    startRef.current = start;

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const val = Math.round(from + (to - from) * t);
      setDisplay(val);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else fromRef.current = to;
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span>{formatPrice(display)}</span>;
};

const CartPage = () => {
  const {
    items,
    itemCount,
    totals,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useContext(CartContext);

  const [qtyAnimating, setQtyAnimating] = useState(null);
  const [removingIds, setRemovingIds] = useState([]);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleQtyChange = (id, newQty) => {
    setQtyAnimating(id);
    updateQuantity(id, newQty);
    setTimeout(() => setQtyAnimating(null), 180);
  };

  const handleRemove = (id) => {
    setRemovingIds((s) => [...s, id]);
    setTimeout(() => {
      removeFromCart(id);
      setRemovingIds((s) => s.filter((x) => x !== id));
    }, 350);
  };

  const goCheckout = () => {
    if (!items || items.length === 0) return;
    navigate('/checkout');
  };

  return (
    <div className={`container-main section-padding ${mounted ? 'fade-up' : ''}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[36px] font-bold text-[#1A3C5E]">Your Cart</h1>
            <div className="inline-flex items-center bg-white border border-[#E2E8F0] rounded-full px-3 py-1">
              <span className="text-sm text-[#64748B] mr-2">Items</span>
              <span className="text-sm font-semibold text-[#475569] bg-[#F1F5F9] px-3 py-1 rounded-full">{itemCount}</span>
            </div>
          </div>

          {(!items || items.length === 0) ? (
            <div className="min-h-[56vh] flex flex-col items-center justify-center text-center">
              <i className="ti-shopping-cart text-[80px] text-[#1A3C5E] mb-4 hero-float-1" />
              <h2 className="text-2xl font-semibold text-[#1A3C5E] mb-3">Your cart is empty</h2>
              <button
                onClick={() => navigate('/category/singles')}
                className="bg-[#D97706] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-transform duration-200 hover:scale-105 shadow-lg"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div>
              {items.map((item) => {
                const removing = removingIds.includes(item._id);
                return (
                  <div
                    key={item._id}
                    className={`bg-white rounded-[12px] border border-[#E2E8F0] p-4 mb-4 transition-all duration-200 ${removing ? 'opacity-0 translate-x-[100%] max-h-0 overflow-hidden' : 'hover:border-[#1A3C5E] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]'}`}
                    style={{
                      transitionProperty: 'transform, opacity, max-height',
                    }}
                  >
                    <div className="flex items-center">
                      <img src={item.image || '/src/assets/placeholder.jpg'} alt={item.name} className="w-20 h-20 object-contain bg-[#faf8f5] rounded-[8px] mr-4" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[15px] font-semibold text-[#1E293B]">{item.name}</div>
                            {item.size && (
                              <span className="inline-block mt-2 bg-[#1A3C5E] text-white text-[11px] font-medium px-2 py-1 rounded-full">{item.size}</span>
                            )}
                          </div>
                          <div className="text-[16px] font-bold text-[#1A3C5E]">{formatPrice(item.price * item.quantity)}</div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQtyChange(item._id, Math.max(1, item.quantity - 1))}
                              className="w-9 h-9 rounded-md border border-[#1A3C5E] text-[#1A3C5E] flex items-center justify-center hover:bg-[#1A3C5E] hover:text-white transition-colors duration-150"
                            >
                              −
                            </button>
                            <div className={`w-10 text-center text-[15px] font-semibold ${qtyAnimating === item._id ? 'transform scale-100' : ''}`}>
                              <span style={{ display: 'inline-block', transition: 'transform 0.15s ease', transform: qtyAnimating === item._id ? 'scale(1)' : 'scale(0.9)' }}>{item.quantity}</span>
                            </div>
                            <button
                              onClick={() => handleQtyChange(item._id, item.quantity + 1)}
                              className="w-9 h-9 rounded-md border border-[#1A3C5E] text-[#1A3C5E] flex items-center justify-center hover:bg-[#1A3C5E] hover:text-white transition-colors duration-150"
                            >
                              +
                            </button>
                          </div>

                          <div className="flex items-center gap-4">
                            <button onClick={() => handleRemove(item._id)} className="text-[#DC2626] hover:text-[#B91C1C] transition-colors duration-150 text-lg">
                              <i className="ti-trash" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="card-surface p-6 sticky" style={{ top: '80px' }}>
            <h3 className="text-[22px] font-bold text-[#1A3C5E] mb-4">Order Summary</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#64748B]">Subtotal</span>
              <span className="text-sm font-semibold text-[#1E293B]">{formatPrice(totals.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#64748B]">Delivery charge</span>
              <span className="text-sm font-semibold text-[#1E293B]">{formatPrice(totals.shipping)}</span>
            </div>
            <div className="border-t border-dashed border-[#E2E8F0] my-4" />
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-semibold text-[#1A3C5E]">Total</span>
              <span className="text-lg font-bold text-[#1A3C5E]"><CountUp value={Math.round(totals.total)} duration={350} /></span>
            </div>

            <button
              onClick={goCheckout}
              disabled={!items || items.length === 0}
              className={`w-full py-4 rounded-xl text-white font-semibold text-[16px] ${(!items || items.length === 0) ? 'bg-[#1A3C5E] opacity-50 cursor-not-allowed' : 'bg-[#1A3C5E] hover:shadow-[0_6px_20px_rgba(26,60,94,0.35)] active:scale-95 transition-all duration-200'}`}
            >
              Proceed to Checkout
            </button>

            {items && items.length > 0 && (
              <button onClick={clearCart} className="mt-3 w-full py-2 rounded-md border border-[#E2E8F0] text-sm text-[#475569]">Clear Cart</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
