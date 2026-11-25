import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-IN') : '—');

const AdminDeliveryBoysPage = () => {
  const [boys, setBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await adminService.getDeliveryBoys();
        setBoys(res?.data?.data ?? res?.data ?? []);
      } catch (err) {
        setError('Failed to load delivery boys.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDeliveryBoys();
      setBoys(res?.data?.data ?? res?.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = (id) => {
    setExpandedIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    // basic validation
    if (!form.fullName || !form.email || !form.mobile || !form.password) {
      setError('All fields are required');
      setSaving(false);
      return;
    }
    if (!/^\d{10}$/.test(form.mobile)) {
      setError('Mobile must be 10 digits');
      setSaving(false);
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      setSaving(false);
      return;
    }

    try {
      await adminService.addDeliveryBoy({ name: form.fullName, email: form.email, mobile: form.mobile, password: form.password });
      setShowModal(false);
      setForm({ fullName: '', email: '', mobile: '', password: '' });
      refresh();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add delivery boy');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id, isActive) => {
    try {
      await adminService.updateUser(id, { isActive: !isActive });
      setBoys((items) => items.map((it) => (it.id === id ? { ...it, isActive: !isActive } : it)));
    } catch (err) {
      // ignore for now
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Delivery Boys</h1>
          <p className="text-sm text-gray-500">Manage delivery boy accounts and view assigned orders.</p>
        </div>
        <div>
          <button onClick={() => setShowModal(true)} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">+ Add Delivery Boy</button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</div>}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Mobile', 'Active Orders', 'Completed', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : boys.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No delivery boys found.</td></tr>
            ) : (
              boys.map((boy) => (
                <React.Fragment key={boy.id}>
                  <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => handleToggleExpand(boy.id)}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{boy.name || boy.fullName || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{boy.mobile || boy.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{boy.activeOrders ?? boy.assignedOrdersCount ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{boy.completedOrders ?? boy.completed ?? 0}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${boy.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {boy.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={(e) => { e.stopPropagation(); toggleActive(boy.id, boy.isActive); }} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${boy.isActive ? 'border-red-500 text-red-600 hover:bg-red-50' : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'}`}>{boy.isActive ? 'Deactivate' : 'Activate'}</button>
                      </div>
                    </td>
                  </tr>
                  {expandedIds.includes(boy.id) && (
                    <tr className="bg-slate-50">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-900">Assigned orders</h3>
                          <div className="mt-3 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  {['Order ID', 'Date', 'Amount', 'Status'].map((t) => (
                                    <th key={t} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {(boy.assignedOrders || boy.orders || []).map((o) => (
                                  <tr key={o.id || o.orderId}>
                                    <td className="px-3 py-2 text-sm text-gray-700">{o.id || o.orderId || 'N/A'}</td>
                                    <td className="px-3 py-2 text-sm text-gray-700">{formatDate(o.createdAt || o.date || o.created_at)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-700">{o.total ?? o.amount ?? 0}</td>
                                    <td className="px-3 py-2 text-sm text-gray-700">{o.status || 'Unknown'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold">Add Delivery Boy</h2>
            <form onSubmit={handleAdd} className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile</label>
                <input name="mobile" value={form.mobile} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60">{saving ? 'Saving...' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeliveryBoysPage;
