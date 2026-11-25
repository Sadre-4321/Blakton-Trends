import { useEffect, useMemo, useState } from 'react';
import adminService from '../../services/adminService';
import { useToasts } from '../../components/Toaster';

const CountUp = ({ value = 0, format = (v) => v }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 700;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <div className="mt-3 text-2xl font-semibold">{format(display)}</div>;
};

const PAYMENT_METHODS = ['All', 'Online', 'Cash on Delivery'];
const PAYMENT_STATUS = ['All', 'Pending', 'Success', 'Failed'];

const statusStyles = {
  pending: 'bg-amber-100 text-amber-800',
  success: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
};

const formatCurrency = (amount) =>
  amount != null ? `₹${Number(amount).toLocaleString('en-IN')}` : '₹0';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-IN') : '—');

const AdminPaymentsPage = () => {
  const [summary, setSummary] = useState({});
  const [payments, setPayments] = useState([]);
  const [method, setMethod] = useState('All');
  const [status, setStatus] = useState('All');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [confirmPayment, setConfirmPayment] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      setSummaryLoading(true);
      try {
        const response = await adminService.getPaymentSummary();
        setSummary(response?.data?.data ?? response?.data ?? {});
      } catch (err) {
        setError('Unable to load payment summary.');
      } finally {
        setSummaryLoading(false);
      }
    };
    fetchSummary();
  }, []);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const params = {};
        if (method && method !== 'All') {
          params.method = method === 'Online' ? 'online' : 'cod';
        }
        if (status && status !== 'All') params.status = status.toLowerCase();
        if (from) params.from = from;
        if (to) params.to = to;
        if (search) params.search = search;
        const response = await adminService.getPayments(params);
        setPayments(response?.data?.data ?? response?.data ?? []);
      } catch (err) {
        setError('Unable to load payment records.');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [method, status, from, to, search]);

  const filteredPayments = useMemo(() => payments, [payments]);

  const handleConfirmClick = (payment) => {
    setConfirmPayment(payment);
    setError('');
    setMessage('');
  };

  const handleConfirmPayment = async () => {
    if (!confirmPayment) return;
    setConfirmingId(confirmPayment.id);
    try {
      await adminService.confirmPayment(confirmPayment.id, { status: 'success' });
      // animate status change
      setPayments((items) =>
        items.map((item) => (item.id === confirmPayment.id ? { ...item, status: 'success', _anim: true } : item))
      );
      setTimeout(() => {
        setPayments((items) => items.map((it) => (it.id === confirmPayment.id ? { ...it, _anim: false } : it)));
      }, 400);
      setConfirmPayment(null);
      // toast success
      const { push } = toasts;
      push({ type: 'success', title: 'Payment confirmed', message: `Payment confirmed for ${confirmPayment.customerName || confirmPayment.customer || 'customer'}.` });
    } catch (err) {
      setError('Unable to confirm payment.');
      const { push } = toasts;
      push({ type: 'error', title: 'Error', message: err?.response?.data?.message || 'Unable to confirm payment' });
    } finally {
      setConfirmingId(null);
    }
  };

  const toasts = useToasts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Payments Management</h1>
          <p className="text-sm text-gray-500">Review payment receipts and confirm cash payments.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {['today', 'week', 'month', 'allTime'].map((key, index) => {
          const titles = ["Today's Revenue", 'This Week', 'This Month', 'All Time'];
          const values = [summary.today ?? 0, summary.week ?? 0, summary.month ?? 0, summary.allTime ?? 0];
          const colors = ['bg-navy-50 text-navy-700', 'bg-teal-50 text-teal-700', 'bg-amber-50 text-amber-700', 'bg-emerald-50 text-emerald-700'];
          return (
            <div key={key} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-gray-500 flex items-center justify-between">
                <div>{titles[index]}</div>
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                  {/* icon placeholder */}
                  <svg className="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M3 3h14v2H3V3zm2 4h10v10H5V7z"/></svg>
                </div>
              </div>
              <div className="mt-3">
                {summaryLoading ? (
                  <div className="text-2xl font-semibold">Loading...</div>
                ) : (
                  <CountUp value={values[index]} format={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-slate-500 focus:outline-none"
            >
              {PAYMENT_METHODS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-slate-500 focus:outline-none"
            >
              {PAYMENT_STATUS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Payment ID or Customer"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {message && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{message}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</div>}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Payment ID', 'Order ID', 'Customer', 'Amount', 'Method', 'Status', 'Date', 'Action'].map((label) => (
                <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading payments...</td>
              </tr>
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No payments found for selected filters.</td>
              </tr>
            ) : (
              filteredPayments.map((payment) => {
                const methodKey = (payment.method || payment.paymentMethod || '').toLowerCase();
                const label = payment.customerName || payment.customer || 'N/A';
                const statusKey = (payment.status || '').toLowerCase();
                return (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{payment.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{payment.orderId || payment.order_id || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{label}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, fontWeight: 600, color: '#0B3D91' }}>{formatCurrency(payment.amount)}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {(() => {
                        const m = methodKey;
                        const map = {
                          upi: 'bg-blue-100 text-blue-800',
                          card: 'bg-purple-100 text-purple-800',
                          cod: 'bg-amber-100 text-amber-800',
                        };
                        return (
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${map[m] ?? 'bg-gray-100 text-gray-800'}`}>{m === 'cod' ? 'COD' : (m === 'card' ? 'Card' : m === 'upi' ? 'UPI' : 'Online')}</span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {statusKey === 'pending' ? (
                        <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-800">
                          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                          Pending
                        </span>
                      ) : statusKey === 'success' ? (
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 ${payment._anim ? 'transition-colors duration-400' : ''}`}>Success</span>
                      ) : (
                        <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-red-100 text-red-800">Failed</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(payment.date || payment.createdAt)}</td>
                    <td className="px-4 py-3 text-sm">
                      {methodKey === 'cod' && statusKey === 'pending' ? (
                        <button
                          type="button"
                          onClick={() => handleConfirmClick(payment)}
                          className="rounded-lg bg-yellow-500 px-3 py-2 text-xs font-semibold text-white transform transition hover:scale-105 hover:shadow-md active:scale-95"
                        >
                          Mark as Paid
                        </button>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {confirmPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold">Confirm cash payment</h2>
            <p className="mt-3 text-sm text-gray-600">
              Confirm you have received {formatCurrency(confirmPayment.amount)} cash from {confirmPayment.customerName || confirmPayment.customer || 'customer'}?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmPayment(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={confirmingId === confirmPayment.id}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {confirmingId === confirmPayment.id ? 'Confirming...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
