import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import orderService from '../../services/orderService';
import { formatDate, formatPrice } from '../../utils/helpers';

const STEPS = ['Placed', 'Confirmed', 'Dispatched', 'Out for Delivery', 'Delivered'];

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        let response;
        try {
          response = await orderService.getOrderById(orderId);
        } catch (err) {
          response = await orderService.trackOrder(orderId);
        }
        const data = response?.data?.data ?? response?.data;
        if (mounted) setOrder(data);
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || 'Order not found');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [orderId]);

  const activeStep = useMemo(() => {
    if (!order) return 0;
    if (order.status === 'Cancelled') return -1;
    const index = STEPS.indexOf(order.status);
    return index === -1 ? 0 : index;
  }, [order]);

  if (loading) {
    return <div className="container-main py-16 text-center text-[#878787]">Loading order...</div>;
  }

  if (error || !order) {
    return (
      <div className="container-main py-16 text-center">
        <p className="text-red-600">{error || 'Order not found'}</p>
        <Link to="/my-orders" className="mt-4 inline-block text-[#2874f0]">Back to My Orders</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <div className="container-main py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Order #{order.orderId}</h1>
            <p className="mt-1 text-sm text-[#878787]">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <Link to="/my-orders" className="rounded-sm border border-[#e0e0e0] bg-white px-4 py-2 text-sm">Back to Orders</Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-sm border border-[#e0e0e0] bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold">Delivery Status</h2>
              {order.status === 'Cancelled' ? (
                <p className="rounded-sm bg-red-50 px-4 py-3 text-sm text-red-700">This order was cancelled.</p>
              ) : (
                <div className="flex justify-between gap-2">
                  {STEPS.map((step, index) => {
                    const done = index <= activeStep;
                    return (
                      <div key={step} className="flex flex-1 flex-col items-center text-center">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-[#2874f0] text-white' : 'bg-[#e0e0e0] text-[#878787]'}`}>
                          {done ? '✓' : index + 1}
                        </div>
                        <p className="mt-2 text-[11px] text-[#475569]">{step}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-sm border border-[#e0e0e0] bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold">Ordered Items</h2>
              <div className="space-y-3">
                {(order.items || []).map((item, index) => (
                  <div key={`${item.productId}-${index}`} className="flex items-center gap-3 border-b border-[#f0f0f0] pb-3 last:border-0">
                    <img src={item.image || 'https://via.placeholder.com/64'} alt={item.name} className="h-16 w-16 rounded object-contain bg-[#faf8f5]" />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-[#878787]">Qty: {item.quantity} {item.size ? `· Size ${item.size}` : ''}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-sm border border-[#e0e0e0] bg-white p-5">
              <h2 className="mb-3 text-lg font-semibold">Delivery & Contact</h2>
              <p className="text-sm text-[#212121] font-medium">Order ID: {order.orderId}</p>
              <p className="mt-2 text-sm text-[#475569]">{order.customerName}</p>
              <p className="text-sm text-[#475569]">{order.deliveryAddress || order.shippingAddress}</p>
              <p className="mt-2 text-sm text-[#878787]">Phone: {order.customerPhone || '—'}</p>
              <p className="text-sm text-[#878787]">Email: {order.customerEmail || '—'}</p>
            </div>
          </div>

          <div className="rounded-sm border border-[#e0e0e0] bg-white p-5 h-fit">
            <h3 className="mb-4 text-lg font-semibold">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Amount</span><span>{formatPrice(order.amount)}</span></div>
              <div className="flex justify-between"><span>Payment</span><span>{order.paymentMethod}</span></div>
              <div className="flex justify-between"><span>Payment Status</span><span className="capitalize">{order.paymentStatus}</span></div>
              <div className="flex justify-between font-bold border-t border-[#e0e0e0] pt-3 mt-3">
                <span>Status</span><span>{order.status}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  const response = await orderService.downloadInvoice(order.orderId);
                  const blob = new Blob([response.data], { type: 'application/pdf' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `invoice-${order.orderId}.pdf`;
                  link.click();
                  URL.revokeObjectURL(url);
                } catch (err) {
                  setError('Unable to download invoice');
                }
              }}
              className="mt-5 w-full rounded-sm border border-[#2874f0] py-2 text-sm font-semibold text-[#2874f0]"
            >
              Download Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
