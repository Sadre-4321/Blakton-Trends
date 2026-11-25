import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import deliveryService from '../../services/deliveryService';
import { formatDate, getStatusColor } from '../../utils/helpers';

const statusTabs = ['All', 'Pending Pickup', 'In Transit', 'Delivered'];

const statusLabelMap = {
  pending: 'Pending Pickup',
  placed: 'Pending Pickup',
  confirmed: 'Pending Pickup',
  dispatched: 'Pending Pickup',
  out_for_delivery: 'In Transit',
  'in-transit': 'In Transit',
  delivered: 'Delivered',
};

const DeliveryDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadDeliveries = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await deliveryService.getMyOrders();
      const data = response?.data?.data ?? response?.data ?? [];
      setDeliveries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load deliveries');
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const filteredDeliveries = useMemo(() => {
    if (activeTab === 'All') return deliveries;
    return deliveries.filter((delivery) => {
      const label = statusLabelMap[delivery.status] || delivery.status;
      return label.toLowerCase() === activeTab.toLowerCase();
    });
  }, [activeTab, deliveries]);

  const counts = useMemo(() => ({
    totalAssigned: deliveries.length,
    pendingPickup: deliveries.filter((d) => ['pending', 'placed', 'confirmed', 'dispatched'].includes(d.status)).length,
    inTransit: deliveries.filter((d) => ['out_for_delivery', 'in-transit'].includes(d.status)).length,
    delivered: deliveries.filter((d) => d.status === 'delivered').length,
  }), [deliveries]);

  const handleUpdateStatus = async (orderId, currentStatus) => {
    const nextStatus = ['pending', 'placed', 'confirmed', 'dispatched'].includes(currentStatus)
      ? 'out_for_delivery'
      : 'delivered';

    try {
      await deliveryService.updateDeliveryStatus(orderId, { status: nextStatus });
      await loadDeliveries();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <div className="container-main py-8">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-[#878787]">Delivery partner</p>
          <h1 className="mt-2 text-3xl font-bold text-[#212121]">Hello, {user?.name || 'Partner'}</h1>
          <p className="mt-2 text-sm text-[#878787]">Assigned orders for Blakton Modern Fashion Studio</p>
        </div>

        {error && <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Assigned', counts.totalAssigned],
            ['Pending Pickup', counts.pendingPickup],
            ['In Transit', counts.inTransit],
            ['Delivered', counts.delivered],
          ].map(([label, value]) => (
            <div key={label} className="rounded-sm border border-[#e0e0e0] bg-white p-4">
              <p className="text-sm text-[#878787]">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{loading ? '—' : value}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-sm px-4 py-2 text-sm font-semibold ${activeTab === tab ? 'bg-[#2874f0] text-white' : 'bg-white border border-[#e0e0e0]'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-sm border border-[#e0e0e0] bg-white p-8 text-center text-[#878787]">Loading...</div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="rounded-sm border border-[#e0e0e0] bg-white p-8 text-center text-[#878787]">
            No delivery assignments yet. Ask admin to assign orders to you.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeliveries.map((delivery) => (
              <div key={delivery.orderId || delivery._id} className="rounded-sm border border-[#e0e0e0] bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#212121]">Order #{delivery.orderId}</p>
                    <p className="mt-1 text-sm text-[#878787]">{delivery.customerName}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(delivery.status)}`}>
                    {statusLabelMap[delivery.status] || delivery.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[#475569]">{delivery.deliveryAddress || delivery.shippingAddress}</p>
                <p className="mt-1 text-sm text-[#878787]">Items: {delivery.items?.length || 0} · ETA: {delivery.estimatedDelivery ? formatDate(delivery.estimatedDelivery) : 'N/A'}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/delivery/${delivery.orderId}`)}
                    className="rounded-sm border border-[#2874f0] px-4 py-2 text-sm font-semibold text-[#2874f0]"
                  >
                    View Details
                  </button>
                  {delivery.status !== 'delivered' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(delivery.orderId, delivery.status)}
                      className="rounded-sm bg-[#fb641b] px-4 py-2 text-sm font-semibold text-white"
                    >
                      {['out_for_delivery', 'in-transit'].includes(delivery.status) ? 'Mark Delivered' : 'Start Delivery'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboardPage;
