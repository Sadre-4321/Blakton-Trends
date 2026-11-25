import { useEffect, useState } from 'react';
import customOrderService from '../../services/customOrderService';

const CATEGORY_LABELS = {
  'single-shirt': 'Single Shirt',
  'single-pant': 'Single Pant',
  'shirt-pant-pair': 'Pair Shirt + Pant',
  'single-coat': 'Single Coat',
  '2-piece': '2-Piece',
  '3-piece': '3-Piece',
  'kurta-pajama': 'Kurta Pajama',
};

const STATUS_OPTIONS = ['Placed', 'Confirmed', 'In Stitching', 'Ready', 'Dispatched', 'Delivered', 'Cancelled'];
const ADVANCE_OPTIONS = ['pending', 'paid', 'failed'];

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const AdminCustomOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (categoryFilter) params.orderCategory = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await customOrderService.getAdminAll(params);
      setOrders(res?.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load custom orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [categoryFilter, statusFilter]);

  const updateOrder = async (customOrderId, body) => {
    setSaving(true);
    try {
      const res = await customOrderService.updateAdmin(customOrderId, body);
      const updated = res?.data?.data;
      setOrders((prev) => prev.map((o) => (o.customOrderId === customOrderId ? updated : o)));
      setSelected(updated);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Personal Design Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          Customers ne listed product ke alawa personally design choose karke jo orders diye hain — yahan alag se dikhte hain.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={load}
          className="rounded-lg bg-[#1A3C5E] px-4 py-2 text-sm font-medium text-white"
        >
          Refresh
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Advance</th>
                  <th className="px-4 py-3">Delivery</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No personal design orders yet</td></tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => setSelected(order)}
                      className={`cursor-pointer border-t border-gray-100 hover:bg-[#f8fafc] ${
                        selected?.customOrderId === order.customOrderId ? 'bg-[#eff6ff]' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-[#1A3C5E]">{order.customOrderId}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                          {CATEGORY_LABELS[order.orderCategory] || order.orderCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-xs text-gray-500">{order.customerPhone}</div>
                      </td>
                      <td className="px-4 py-3">
                        ₹{order.advanceAmount}
                        <div className="text-xs capitalize text-gray-500">{order.advancePaymentStatus}</div>
                      </td>
                      <td className="px-4 py-3">{formatDate(order.expectedDelivery)}</td>
                      <td className="px-4 py-3">{order.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          {!selected ? (
            <p className="text-sm text-gray-500">Select a personal order to view full design details.</p>
          ) : (
            <div className="space-y-4 text-sm">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selected.customOrderId}</h2>
                <p className="mt-1 text-orange-700 font-medium">
                  {CATEGORY_LABELS[selected.orderCategory] || selected.orderCategory}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-3 space-y-1">
                <p><strong>Order ID:</strong> {selected.customOrderId}</p>
                <p><strong>Customer:</strong> {selected.customerName}</p>
                <p><strong>Phone:</strong> {selected.customerPhone}</p>
                <p><strong>Email:</strong> {selected.customerEmail || selected.user?.email || '—'}</p>
                <p><strong>Address:</strong> {selected.deliveryAddress}</p>
              </div>

              <div className="space-y-1">
                <p><strong>Color:</strong> {selected.preferredColor || '—'}</p>
                <p><strong>Fabric:</strong> {selected.fabric || '—'}</p>
                <p><strong>Model / design:</strong> {selected.modelDesign || '—'}</p>
                <p><strong>Size / measurements:</strong> {selected.sizeOrMeasurements || '—'}</p>
                {selected.shirtCollar && <p><strong>Shirt collar:</strong> {selected.shirtCollar}</p>}
                {selected.shirtFit && <p><strong>Shirt fit:</strong> {selected.shirtFit}</p>}
                {selected.shirtSleeve && <p><strong>Sleeve:</strong> {selected.shirtSleeve}</p>}
                {selected.pantDesign && <p><strong>Pant design:</strong> {selected.pantDesign}</p>}
                {selected.pantLength && <p><strong>Pant length:</strong> {selected.pantLength}</p>}
                {selected.coatStyle && <p><strong>Coat style:</strong> {selected.coatStyle}</p>}
                {selected.kurtaStyle && <p><strong>Kurta style:</strong> {selected.kurtaStyle}</p>}
                {selected.waistcoatNeeded && <p><strong>Waistcoat:</strong> Yes</p>}
                {selected.extraNotes && <p><strong>Notes:</strong> {selected.extraNotes}</p>}
              </div>

              <div className="grid gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase text-gray-500">Status</span>
                  <select
                    value={selected.status}
                    disabled={saving}
                    onChange={(e) => updateOrder(selected.customOrderId, { status: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase text-gray-500">Advance payment</span>
                  <select
                    value={selected.advancePaymentStatus}
                    disabled={saving}
                    onChange={(e) => updateOrder(selected.customOrderId, { advancePaymentStatus: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 capitalize"
                  >
                    {ADVANCE_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase text-gray-500">Admin notes</span>
                  <textarea
                    defaultValue={selected.adminNotes || ''}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    onBlur={(e) => {
                      if (e.target.value !== (selected.adminNotes || '')) {
                        updateOrder(selected.customOrderId, { adminNotes: e.target.value });
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCustomOrdersPage;
