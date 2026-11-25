import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import deliveryService from '../../services/deliveryService';
import { formatDate, getStatusColor } from '../../utils/helpers';

const statusLabelMap = {
  dispatched: 'Dispatched',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

const DeliveryOrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await deliveryService.getDeliveryOrder(orderId);
        setOrder(response.data.order || response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load delivery order.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const addressLines = useMemo(() => {
    if (!order?.deliveryAddress) return [];
    return order.deliveryAddress.split(',').map((line) => line.trim()).filter(Boolean);
  }, [order]);

  const phoneNumber = order?.customerPhone || order?.phone || order?.mobile || '';
  const mapsUrl = order?.deliveryAddress ? `https://maps.google.com?q=${encodeURIComponent(order.deliveryAddress)}` : '#';

  const actionConfig = useMemo(() => {
    if (!order) return null;

    if (order.status === 'dispatched') {
      return {
        label: 'Mark as Picked Up',
        confirmText: 'Confirm you have picked up this package?',
        nextStatus: 'out_for_delivery',
      };
    }

    if (order.status === 'out_for_delivery') {
      return {
        label: 'Mark as Delivered',
        confirmText: 'Confirm this order has been delivered to the customer?',
        nextStatus: 'delivered',
      };
    }

    return null;
  }, [order]);

  const handleStatusUpdate = async () => {
    if (!order || !actionConfig) return;

    setUpdating(true);
    try {
      await deliveryService.updateDeliveryStatus(orderId, { status: actionConfig.nextStatus });
      setSuccessMessage(`Order marked as ${actionConfig.nextStatus.replace('_', ' ')}.`);
      navigate('/delivery');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update delivery status.');
    } finally {
      setUpdating(false);
      setConfirmAction(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-light">
        <div className="container-main section-padding">
          <div className="card p-8 text-center">
            <h1 className="font-serif text-3xl font-bold mb-4">Unable to load delivery details</h1>
            <p className="text-gray-600 mb-6">{error || 'Order not found or not assigned to your route.'}</p>
            <button type="button" onClick={() => navigate('/delivery')} className="btn-secondary">
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      <div className="container-main section-padding">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate('/delivery')}
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              ← Back to dashboard
            </button>
            <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Delivery order details</p>
            <h1 className="font-serif text-4xl font-bold mt-3">Order #{order._id}</h1>
            <p className="mt-2 text-gray-600">Assigned delivery details for your route. No pricing or payment information is shown.</p>
          </div>
          <div className="rounded-3xl bg-white p-4 shadow-sm border border-gray-200 text-sm text-gray-700 w-full sm:w-auto">
            <p className="font-semibold">Current status</p>
            <span className={`mt-2 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(order.status)}`}>
              {statusLabelMap[order.status] || order.status}
            </span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <section className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Customer</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">{order.customerName || 'Customer'}</h2>
                </div>
                {phoneNumber && (
                  <a
                    href={`tel:${phoneNumber}`}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Call
                  </a>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Delivery address</p>
                  <div className="mt-3 text-sm text-gray-700 space-y-1">
                    {addressLines.length > 0 ? (
                      addressLines.map((line, index) => <p key={index}>{line}</p>)
                    ) : (
                      <p>{order.deliveryAddress}</p>
                    )}
                  </div>
                </div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-3xl bg-[#1A3C5E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Items to deliver</p>
                  <h2 className="mt-3 text-xl font-semibold text-slate-900">{order.items?.length || 0} item{order.items?.length === 1 ? '' : 's'}</h2>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {order.items?.map((item, index) => (
                  <div key={`${order._id}-${index}`} className="rounded-3xl border border-gray-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name || item.productName || 'Product'}</p>
                        <p className="text-sm text-gray-600">Size: {item.size || item.variant || 'N/A'}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">Qty: {item.quantity || item.qty || 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-slate-900">Delivery details</h2>
              <div className="mt-5 space-y-4 text-sm text-gray-600">
                <div>
                  <p className="font-semibold text-slate-900">Pickup location</p>
                  <p className="mt-2">{order.pickupLocation || 'Pickup location not available'}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Assigned on</p>
                  <p className="mt-2">{order.assignedAt ? formatDate(order.assignedAt) : '—'}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Estimated delivery</p>
                  <p className="mt-2">{order.estimatedDelivery ? formatDate(order.estimatedDelivery) : '—'}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Tracking ID</p>
                  <p className="mt-2">{order.trackingId || '—'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
              {actionConfig ? (
                <button
                  type="button"
                  onClick={() => setConfirmAction(actionConfig)}
                  disabled={updating}
                  className="inline-flex w-full items-center justify-center rounded-3xl bg-emerald-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {updating ? 'Updating...' : actionConfig.label}
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-900">
                  Delivered ✓
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Confirm action</h2>
            <p className="text-gray-700 mb-6">{confirmAction.confirmText}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="btn-outline w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusUpdate}
                disabled={updating}
                className="btn-primary w-full sm:w-auto"
              >
                {updating ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-3xl bg-emerald-600 px-6 py-4 text-white shadow-xl">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default DeliveryOrderDetailPage;
