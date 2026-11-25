import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import customOrderService from '../../services/customOrderService';
import { formatDate, formatPrice, getStatusColor } from '../../utils/helpers';
import { openRazorpayCheckout } from '../../utils/razorpay';
import useAuth from '../../hooks/useAuth';

const statusTabs = ['All', 'Placed', 'Confirmed', 'Dispatched', 'Out for Delivery', 'Delivered', 'Cancelled'];

const CATEGORY_LABELS = {
  'single-shirt': 'Single Shirt',
  'single-pant': 'Single Pant',
  'shirt-pant-pair': 'Pair Shirt + Pant',
  'single-coat': 'Single Coat',
  '2-piece': '2-Piece',
  '3-piece': '3-Piece',
  'kurta-pajama': 'Kurta Pajama',
};

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [payingId, setPayingId] = useState('');
  const { user } = useAuth();

  const payCustomAdvance = async (order) => {
    setPayingId(order.customOrderId);
    setError('');
    try {
      const payRes = await customOrderService.initiatePayment(order.customOrderId);
      const payData = payRes?.data?.data || payRes?.data;
      if (payData?.alreadyPaid) {
        setCustomOrders((prev) =>
          prev.map((item) => (item.customOrderId === order.customOrderId ? payData.order : item))
        );
        return;
      }

      const payment = await openRazorpayCheckout({
        keyId: payData.keyId,
        amount: payData.amount,
        currency: payData.currency || 'INR',
        orderId: payData.razorpayOrder?.id,
        description: `Advance for ${order.customOrderId}`,
        prefill: {
          name: order.customerName || user?.name || '',
          email: user?.email || '',
          contact: order.customerPhone || user?.mobile || '',
        },
      });

      const verifyRes = await customOrderService.verifyPayment(order.customOrderId, {
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_signature: payment.razorpay_signature,
      });
      const paid = verifyRes?.data?.data || verifyRes?.data;
      setCustomOrders((prev) =>
        prev.map((item) => (item.customOrderId === order.customOrderId ? paid : item))
      );
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setPayingId('');
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [response, customRes] = await Promise.all([
          orderService.getOrders(),
          customOrderService.getMine().catch(() => null),
        ]);
        const data = response?.data?.data ?? response?.data ?? [];
        const customData = customRes?.data?.data ?? customRes?.data ?? [];
        if (mounted) {
          setOrders(Array.isArray(data) ? data : []);
          setCustomOrders(Array.isArray(customData) ? customData : []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.message || 'Unable to load orders');
          setOrders([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'All') return orders;
    return orders.filter((order) => order.status === activeTab);
  }, [activeTab, orders]);

  if (!loading && orders.length === 0 && customOrders.length === 0) {
    return (
      <div className="min-h-screen bg-[#f1f3f6]">
        <div className="container-main py-10">
          <h1 className="mb-6 text-3xl font-bold">My Orders</h1>
          {error && <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div className="rounded-sm border border-[#e0e0e0] bg-white p-8 text-center">
            <p className="mb-4 text-[#878787]">You haven&apos;t placed any orders yet.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/products" className="inline-block rounded-sm bg-[#2874f0] px-5 py-3 text-sm font-semibold text-white">Shop Products</Link>
              <Link to="/customize-order" className="inline-block rounded-sm bg-[#fb641b] px-5 py-3 text-sm font-semibold text-white">Customize Order</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <div className="container-main py-8">
        <h1 className="mb-2 text-3xl font-bold">My Orders</h1>
        <p className="mb-6 text-sm text-[#878787]">Track listed-product orders and personal design orders</p>

        {customOrders.length > 0 && (
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#111827]">Personal Design Orders</h2>
              <Link to="/customize-order" className="text-sm font-semibold text-[#fb641b]">New custom order</Link>
            </div>
            <div className="space-y-3">
              {customOrders.map((order) => (
                <div key={order.customOrderId} className="rounded-sm border border-[#fed7aa] bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">Order ID: {order.customOrderId}</p>
                      <p className="mt-1 text-sm text-[#c2410c] font-medium">
                        {CATEGORY_LABELS[order.orderCategory] || order.orderCategory}
                      </p>
                      <p className="mt-1 text-sm text-[#475569]">
                        Phone: {order.customerPhone || '—'} · Email: {order.customerEmail || user?.email || '—'}
                      </p>
                      <p className="mt-1 text-sm text-[#878787]">
                        Expected: {formatDate(order.expectedDelivery)} · Advance ₹{order.advanceAmount} ({order.advancePaymentStatus})
                      </p>
                    </div>
                    <span className="rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-semibold text-[#c2410c]">
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[#475569]">
                    {order.preferredColor} · {order.modelDesign || 'Custom design'}
                    {order.pantDesign ? ` · Pant: ${order.pantDesign}/${order.pantLength}` : ''}
                  </p>
                  {order.advancePaymentStatus !== 'paid' && order.advancePaymentMethod !== 'cash' && (
                    <button
                      type="button"
                      onClick={() => payCustomAdvance(order)}
                      disabled={payingId === order.customOrderId}
                      className="mt-3 rounded-sm bg-[#fb641b] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {payingId === order.customOrderId ? 'Opening UPI...' : 'Pay Advance via UPI'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="mb-4 flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-sm px-3 py-1.5 text-sm font-semibold ${activeTab === tab ? 'bg-[#2874f0] text-white' : 'border border-[#e0e0e0] bg-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-sm border border-[#e0e0e0] bg-white p-8 text-center text-[#878787]">Loading orders...</div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.orderId || order._id} className="rounded-sm border border-[#e0e0e0] bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">Order ID: {order.orderId}</p>
                    <p className="mt-1 text-sm text-[#878787]">Placed on {formatDate(order.createdAt)}</p>
                    <p className="mt-1 text-sm text-[#475569]">
                      Phone: {order.customerPhone || '—'} · Email: {order.customerEmail || user?.email || '—'}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(String(order.status || '').toLowerCase().replace(/\s+/g, '-'))}`}>
                    {order.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {(order.items || []).slice(0, expandedOrderId === order.orderId ? undefined : 2).map((item, index) => (
                    <div key={`${order.orderId}-${index}`} className="flex items-center gap-3 text-sm">
                      <img src={item.image || 'https://via.placeholder.com/48'} alt={item.name} className="h-12 w-12 rounded object-contain bg-[#faf8f5]" />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-[#878787]">Qty: {item.quantity} {item.size ? `· Size ${item.size}` : ''}</p>
                      </div>
                      <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0f0f0] pt-4">
                  <div className="text-sm text-[#878787]">
                    Payment: {order.paymentMethod} · Total: <span className="font-semibold text-[#212121]">{formatPrice(order.amount)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedOrderId((current) => (current === order.orderId ? null : order.orderId))}
                      className="rounded-sm border border-[#e0e0e0] px-3 py-2 text-sm"
                    >
                      {expandedOrderId === order.orderId ? 'Hide details' : 'View details'}
                    </button>
                    <Link to={`/orders/${order.orderId}`} className="rounded-sm bg-[#2874f0] px-3 py-2 text-sm font-semibold text-white">
                      Track
                    </Link>
                  </div>
                </div>

                {expandedOrderId === order.orderId && (
                  <div className="mt-4 rounded-sm bg-[#f8fafc] p-4 text-sm text-[#475569]">
                    <p><span className="font-semibold text-[#212121]">Order ID:</span> {order.orderId}</p>
                    <p className="mt-2"><span className="font-semibold text-[#212121]">Ship to:</span> {order.deliveryAddress || order.shippingAddress}</p>
                    <p className="mt-2"><span className="font-semibold text-[#212121]">Name:</span> {order.customerName}</p>
                    <p className="mt-2"><span className="font-semibold text-[#212121]">Phone:</span> {order.customerPhone}</p>
                    <p className="mt-2"><span className="font-semibold text-[#212121]">Email:</span> {order.customerEmail || user?.email || '—'}</p>
                    <p className="mt-2"><span className="font-semibold text-[#212121]">Payment status:</span> {order.paymentStatus}</p>
                    {order.estimatedDelivery && (
                      <p className="mt-2"><span className="font-semibold text-[#212121]">ETA:</span> {formatDate(order.estimatedDelivery)}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
