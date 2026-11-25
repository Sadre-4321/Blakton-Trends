import { useEffect, useMemo, useState } from 'react';
import adminService from '../../services/adminService';

const STATUS_OPTIONS = ['All', 'Placed', 'Confirmed', 'Dispatched', 'Out for Delivery', 'Delivered', 'Cancelled'];
const ORDER_STATUS_FLOW = ['Placed', 'Confirmed', 'Dispatched', 'Out for Delivery', 'Delivered'];

const statusBadgeClass = (status) => {
  switch (status) {
    case 'Placed': return 'bg-blue-100 text-blue-800';
    case 'Confirmed': return 'bg-yellow-100 text-yellow-800';
    case 'Dispatched': return 'bg-orange-100 text-orange-800';
    case 'Out for Delivery': return 'bg-cyan-100 text-cyan-800';
    case 'Delivered': return 'bg-emerald-100 text-emerald-800';
    case 'Cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (value) => value ? new Date(value).toLocaleDateString() : '—';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState('');
  const [statusUpdatingOrderId, setStatusUpdatingOrderId] = useState(null);
  const [filtering, setFiltering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const params = {};
        if (status !== 'All') params.status = status;
        if (fromDate) params.from = fromDate;
        if (toDate) params.to = toDate;
        if (search) params.search = search;
        const response = await adminService.getAdminOrders(params);
        const raw = response?.data?.data ?? response?.data ?? [];
        const normalized = (Array.isArray(raw) ? raw : []).map((order) => ({
          ...order,
          id: order.orderId || order.id || order._id,
          orderId: order.orderId || order.id,
        }));
        setOrders(normalized);
      } catch (error) {
        setErrorMessage('Unable to load orders.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [status, fromDate, toDate, search]);

  useEffect(() => {
    const loadDeliveryBoys = async () => {
      try {
        const response = await adminService.getDeliveryBoys();
        const raw = response?.data?.data ?? response?.data ?? [];
        setDeliveryBoys((Array.isArray(raw) ? raw : []).map((boy) => ({
          ...boy,
          id: boy._id || boy.id,
          name: boy.name || boy.fullName,
        })));
      } catch (error) {
        setDeliveryBoys([]);
      }
    };

    loadDeliveryBoys();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders;
  }, [orders]);

  const handleStatusChange = async (order, nextStatus) => {
    if (nextStatus === 'Dispatched') {
      setSelectedOrder({ order, nextStatus });
      setAssignModal(true);
      return;
    }

    await updateOrderStatus(order.orderId || order.id, nextStatus);
  };

  const updateOrderStatus = async (orderId, nextStatus, deliveryBoyId) => {
    setStatusUpdatingOrderId(orderId);
    try {
      const payload = { status: nextStatus };
      if (deliveryBoyId) payload.deliveryBoyId = deliveryBoyId;
      await adminService.updateAdminOrder(orderId, payload);
      setOrders((items) =>
        items.map((item) =>
          (item.orderId || item.id) === orderId
            ? { ...item, status: nextStatus, deliveryBoyId, id: orderId, orderId }
            : item
        )
      );
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Unable to update order status.');
    } finally {
      setStatusUpdatingOrderId(null);
      setSelectedOrder(null);
      setAssignModal(false);
      setSelectedDeliveryBoy('');
    }
  };

  const handleDispatchConfirm = async () => {
    if (!selectedOrder?.order || !selectedDeliveryBoy) return;
    await updateOrderStatus(selectedOrder.order.orderId || selectedOrder.order.id, 'Dispatched', selectedDeliveryBoy);
  };

  const handleViewOrder = async (order) => {
    setDrawerOpen(true);
    try {
      const response = await adminService.getAdminOrderById(order.orderId || order.id);
      const orderDetail = response?.data?.data ?? response?.data ?? order;
      setDetailOrder({
        ...orderDetail,
        id: orderDetail.orderId || orderDetail.id,
        shippingAddress: { line1: orderDetail.deliveryAddress || orderDetail.shippingAddress || '' },
      });
    } catch (error) {
      setDetailOrder({
        ...order,
        shippingAddress: { line1: order.deliveryAddress || order.shippingAddress || '' },
      });
      setErrorMessage('Unable to load full order details.');
    }
  };

  const exportCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Items', 'Amount', 'Payment Method', 'Payment Status', 'Order Status', 'Date'];
    const rows = filteredOrders.map((order) => [
      order.id,
      order.customerName || order.customer || '',
      order.items?.length ?? order.itemCount ?? 0,
      order.amount ?? '',
      order.paymentMethod || order.payment?.method || '',
      order.paymentStatus || order.payment?.status || '',
      order.status,
      formatDate(order.createdAt || order.date),
    ]);
    const csvContent = [headers, ...rows].map((row) => row.map((value) => `"${String(value || '')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'admin-orders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const orderStatusOptions = (currentStatus) => {
    const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);
    if (currentIndex === -1) return [];
    return ORDER_STATUS_FLOW.slice(currentIndex + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Orders Management</h1>
          <p className="text-sm text-gray-500">Filter, review, and update orders from the admin panel.</p>
        </div>
        <button
          type="button"
          onClick={exportCSV}
          className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Export CSV
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-slate-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Order ID or Customer Name"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Order ID', 'Customer / Contact', 'Items', 'Amount', 'Payment', 'Order Status', 'Date', 'Actions'].map((label) => (
                <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading orders...</td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No orders found for selected filters.</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold text-[#1A3C5E]">{order.orderId || order.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="font-medium">{order.customerName || order.customer || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{order.customerPhone || order.phone || '—'}</div>
                    <div className="text-xs text-gray-500">{order.customerEmail || order.email || '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{order.items?.length ?? order.itemCount ?? 0}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">₹{Number(order.amount ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="space-y-1">
                      <div>{order.paymentMethod || order.payment?.method || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{order.paymentStatus || order.payment?.status || 'Unknown'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDate(order.createdAt || order.date)}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium space-x-2">
                    <button
                      type="button"
                      onClick={() => handleViewOrder(order)}
                      className="text-slate-700 hover:text-slate-900"
                    >
                      View
                    </button>
                    <select
                      value=""
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
                    >
                      <option value="">Change status</option>
                      {orderStatusOptions(order.status).map((next) => (
                        <option key={next} value={next}>{next}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {assignModal && selectedOrder?.order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold">Assign Delivery Boy</h2>
            <p className="mt-2 text-sm text-gray-600">Select a delivery boy before moving the order to Dispatched.</p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Delivery Boy</label>
              <select
                value={selectedDeliveryBoy}
                onChange={(e) => setSelectedDeliveryBoy(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-slate-500 focus:outline-none"
              >
                <option value="">Choose delivery boy</option>
                {deliveryBoys.map((boy) => (
                  <option key={boy.id} value={boy.id}>{boy.name || boy.fullName || `Boy ${boy.id}`}</option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setAssignModal(false);
                  setSelectedOrder(null);
                  setSelectedDeliveryBoy('');
                }}
                className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDispatchConfirm}
                disabled={!selectedDeliveryBoy || statusUpdatingOrderId === selectedOrder?.order?.id}
                className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {statusUpdatingOrderId === selectedOrder?.order?.id ? 'Assigning...' : 'Assign & Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="relative ml-auto h-full w-full max-w-[400px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">Order Details</h2>
                <p className="text-sm text-gray-500">{detailOrder?.id || ''}</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="text-gray-500 hover:text-gray-900">Close</button>
            </div>
            <div className="space-y-5 p-5 overflow-y-auto h-[calc(100vh-80px)]">
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Customer</h3>
                <div className="mt-3 space-y-1 text-sm text-gray-700">
                  <p className="font-semibold text-[#1A3C5E]">Order ID: {detailOrder?.orderId || detailOrder?.id}</p>
                  <p>{detailOrder?.customerName || detailOrder?.customer || 'N/A'}</p>
                  <p>Email: {detailOrder?.customerEmail || detailOrder?.email || '—'}</p>
                  <p>Phone: {detailOrder?.customerPhone || detailOrder?.phone || '—'}</p>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Delivery Address</h3>
                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  <p>{detailOrder?.shippingAddress?.line1 || detailOrder?.address?.line1 || ''}</p>
                  <p>{detailOrder?.shippingAddress?.line2 || detailOrder?.address?.line2 || ''}</p>
                  <p>{detailOrder?.shippingAddress?.city || detailOrder?.address?.city || ''} {detailOrder?.shippingAddress?.postalCode || detailOrder?.address?.postalCode || ''}</p>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Items</h3>
                <div className="mt-3 space-y-3">
                  {(detailOrder?.items || []).map((item) => (
                    <div key={item.id || item.productId || item.name} className="flex gap-3 rounded-xl border border-gray-200 p-3">
                      <div className="h-16 w-16 overflow-hidden rounded-md bg-gray-100">
                        <img src={item.image || item.thumbnail || 'https://via.placeholder.com/80'} alt={item.name} className="h-full w-full object-contain bg-[#faf8f5]" />
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-gray-600">Qty: {item.quantity ?? item.qty ?? 1}</p>
                        <p className="text-gray-600">Size: {item.size || 'N/A'}</p>
                      </div>
                      <div className="text-right text-sm text-gray-900">₹{Number(item.price ?? item.amount ?? 0).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Payment</h3>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <p>Method: {detailOrder?.paymentMethod || detailOrder?.payment?.method || 'N/A'}</p>
                  <p>Status: {detailOrder?.paymentStatus || detailOrder?.payment?.status || 'N/A'}</p>
                  <p>Total: ₹{Number(detailOrder?.amount ?? 0).toFixed(2)}</p>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Order Timeline</h3>
                <div className="mt-3 space-y-3">
                  {(detailOrder?.timeline || sampleTimeline(detailOrder?.status)).map((step) => (
                    <div key={step.label} className="rounded-xl border border-gray-200 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>{step.label}</span>
                        <span className="text-gray-500">{formatDate(step.date)}</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{step.note}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function sampleDeliveryBoys() {
  return [
    { id: 'db1', name: 'Ravi Kumar' },
    { id: 'db2', name: 'Amit Singh' },
    { id: 'db3', name: 'Sonal Shah' },
  ];
}

function sampleTimeline(status) {
  const now = new Date();
  const steps = [
    { label: 'Placed', date: now, note: 'Order received' },
    { label: 'Confirmed', date: now, note: 'Payment confirmed' },
    { label: 'Dispatched', date: now, note: 'Order is on the way' },
    { label: 'Delivered', date: now, note: 'Order delivered' },
  ];
  const index = ORDER_STATUS_FLOW.indexOf(status);
  return steps.slice(0, index + 1);
}

export default AdminOrdersPage;
