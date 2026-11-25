import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CartContext from '../../context/CartContext';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const { clearCart } = useContext(CartContext);
  const [copied, setCopied] = useState(false);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    clearCart();
    const stored = sessionStorage.getItem(`order_${orderId}`);
    if (stored) {
      try {
        setOrderData(JSON.parse(stored));
      } catch {
        setOrderData(null);
      }
    }
  }, [clearCart, orderId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  const paymentPaid = orderData?.paymentStatus === 'paid' || orderData?.payment?.status === 'paid';
  const paymentLabel = paymentPaid ? 'Paid' : 'Payment pending';
  const address = orderData?.deliveryAddress || orderData?.shippingAddress || orderData?.address || 'Address saved with your order';
  const deliveryDate = orderData?.estimatedDelivery
    ? new Date(orderData.estimatedDelivery).toLocaleDateString()
    : '3-5 business days';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-16 fade-up">
      <div className="container-main text-center">
        <div className="mx-auto w-full max-w-2xl">
          <div className="relative mb-8">
            <div className="mx-auto mb-4 w-[100px] h-[100px] rounded-full bg-[#16A34A] flex items-center justify-center success-bounce">
              <svg className="w-12 h-12 text-white" viewBox="0 0 52 52" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                <path className="success-check" d="M14 27l7 7 17-17" />
              </svg>
            </div>
            <div className="absolute inset-x-0 top-16 flex justify-center pointer-events-none">
              <div className="confetti-dot bg-[#F59E0B]" />
              <div className="confetti-dot bg-[#3B82F6]" />
              <div className="confetti-dot bg-[#EC4899]" />
              <div className="confetti-dot bg-[#10B981]" />
              <div className="confetti-dot bg-[#8B5CF6]" />
              <div className="confetti-dot bg-[#F97316]" />
              <div className="confetti-dot bg-[#14B8A6]" />
              <div className="confetti-dot bg-[#E11D48]" />
            </div>
          </div>

          <h1 className="font-serif text-[36px] text-[#1A3C5E] mb-4">Order Placed Successfully!</h1>
          <p className="text-[15px] text-[#64748B] mb-10">Thank you for shopping with Blakton</p>

          <div className="mx-auto bg-white rounded-[16px] border border-[#E2E8F0] shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 max-w-xl success-card">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-sm text-[#64748B]">Order ID</div>
                <div className="font-mono font-semibold text-[#1A3C5E] mt-1">{orderData?.orderId || orderId}</div>
              </div>
              <button type="button" onClick={handleCopy} className="text-sm font-semibold text-[#1A3C5E] border border-[#E2E8F0] px-3 py-2 rounded-xl hover:bg-[#EFF6FF] transition">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="border-t border-[#E2E8F0] pt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="text-[#16A34A] text-xl"><i className="ti-truck-delivery" /></div>
                <div>
                  <div className="text-sm text-[#64748B]">Estimated Delivery</div>
                  <div className="text-[#16A34A] font-semibold">{deliveryDate}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-[#64748B]">Payment</div>
                  <div className="text-[#1A3C5E] font-semibold">{orderData?.paymentMethod || 'Payment method saved with your order'}</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${paymentPaid ? 'bg-[#DEF7EC] text-[#166534]' : 'bg-amber-100 text-amber-800'}`}>
                  {paymentLabel}
                </span>
              </div>
              <div>
                <div className="text-sm text-[#64748B] mb-2">Address</div>
                <div className="text-sm text-[#475569] leading-6">{address}</div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link to={`/orders/${orderId}`} className="inline-flex items-center justify-center rounded-xl bg-[#1A3C5E] px-8 py-3 text-white font-semibold transition hover:shadow-lg hover:scale-105">
              Track My Order
            </Link>
            <Link to="/products" className="inline-flex items-center justify-center rounded-xl border border-[#D97706] px-8 py-3 text-[#D97706] font-semibold transition hover:bg-[#D97706] hover:text-white hover:shadow-lg">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
