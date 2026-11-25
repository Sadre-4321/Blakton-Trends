import React, { useEffect, useMemo, useState } from 'react';
import adminService from '../../services/adminService';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-IN') : '—');

const getInitials = (name = '') => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'NA';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const highlightMatch = (text = '', query = '') => {
  if (!query) return text;
  const safe = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${safe})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} className="rounded bg-amber-200 px-1 text-amber-900">{part}</mark>
    ) : (
      <span key={index}>{part}</span>
    )
  );
};

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [expandedIds, setExpandedIds] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await adminService.getCustomers();
        setCustomers(response?.data?.data ?? response?.data ?? []);
      } catch (err) {
        setError('Unable to load customers.');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredCustomers = useMemo(() => {
    if (!normalizedSearch) return customers;
    return customers.filter((customer) => {
      const values = [customer.name, customer.email, customer.mobile, customer.phone];
      return values.some((value) => value?.toString().toLowerCase().includes(normalizedSearch));
    });
  }, [customers, normalizedSearch]);

  const getStatusBadge = (isActive) =>
    isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800';

  const handleToggleExpand = (customerId) => {
    setExpandedIds((current) =>
      current.includes(customerId) ? current.filter((id) => id !== customerId) : [...current, customerId]
    );
  };

  const handleBlockUnblock = async () => {
    if (!confirmTarget) return;
    setConfirmLoading(true);
    try {
      await adminService.toggleCustomerStatus(confirmTarget.id, {
        isActive: !confirmTarget.isActive,
      });
      setCustomers((items) =>
        items.map((item) =>
          item.id === confirmTarget.id ? { ...item, isActive: !item.isActive } : item
        )
      );
      setMessage(`Customer ${confirmTarget.isActive ? 'blocked' : 'unblocked'} successfully.`);
      setConfirmTarget(null);
    } catch (err) {
      setError('Unable to update customer status.');
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Customers</h1>
          <p className="text-sm text-gray-500">Search, block/unblock, and inspect customer order history.</p>
        </div>
        <div className="w-full max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {message && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{message}</div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Email', 'Mobile', 'Total Orders', 'Total Spent', 'Joined Date', 'Status', 'Action'].map((label) => (
                <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading customers...</td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  <div className="mx-auto flex max-w-xs flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl text-gray-400">👥</div>
                    <div className="text-sm font-semibold">No customers found</div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => {
                const isActive = customer.isActive ?? customer.active ?? true;
                const name = customer.name || customer.fullName || 'N/A';
                const email = customer.email || '—';
                const mobile = customer.mobile || customer.phone || '—';
                const totalOrders = customer.totalOrders ?? customer.orderCount ?? 0;
                const totalSpent = customer.totalSpent ?? customer.total_spent ?? 0;
                const joinedAt = formatDate(customer.joinedAt || customer.createdAt || customer.created_at);
                const hasBlocked = !isActive;
                const isExpanded = expandedIds.includes(customer.id);

                const avatarClasses = `relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0B3D91] text-sm font-bold text-white ${hasBlocked ? 'opacity-60' : ''}`;

                return (
                  <React.Fragment key={customer.id}>
                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => handleToggleExpand(customer.id)}>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className={avatarClasses}>
                            {getInitials(name)}
                            {hasBlocked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 text-xs text-white">
                                🔒
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{highlightMatch(name, normalizedSearch)}</div>
                            <div className="text-xs text-gray-500">{highlightMatch(email, normalizedSearch)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">{highlightMatch(email, normalizedSearch)}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{highlightMatch(mobile, normalizedSearch)}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{totalOrders}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">₹{Number(totalSpent).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{joinedAt}</td>
                      <td className="px-4 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(isActive)}`}>{isActive ? 'Active' : 'Blocked'}</span>
                      </td>
                      <td className="px-4 py-4 text-right text-sm">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmTarget(customer);
                          }}
                          className={`inline-flex rounded-lg border px-3 py-2 text-xs font-semibold transition duration-150 ${isActive ? 'border-red-500 text-red-600 hover:border-red-500 hover:bg-red-500 hover:text-white active:scale-95' : 'border-emerald-500 text-emerald-600 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white active:scale-95'} hover:scale-105`}
                        >
                          {isActive ? 'Block' : 'Unblock'}
                        </button>
                      </td>
                    </tr>
                    <tr className={`${isExpanded ? 'bg-[#F8FAFC]' : ''}`}>
                      <td colSpan={8} className="p-0">
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-out ${isExpanded ? 'border-t border-dashed border-[#E2E8F0]' : ''}`}
                          style={{ maxHeight: isExpanded ? 600 : 0 }}
                        >
                          {isExpanded && (
                            <div className="p-4">
                              <div className="text-sm font-semibold text-gray-900">Recent orders</div>
                              <div className="mt-3 overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      {['Order ID', 'Date', 'Amount', 'Status'].map((title) => (
                                        <th key={title} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {(customer.orderHistory || customer.orders || []).map((order) => (
                                      <tr key={order.id || order.orderId}>
                                        <td className="px-3 py-2 text-sm text-gray-700">{order.id || order.orderId || 'N/A'}</td>
                                        <td className="px-3 py-2 text-sm text-gray-700">{formatDate(order.createdAt || order.date || order.created_at)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-700">₹{Number(order.amount ?? order.total ?? 0).toLocaleString('en-IN')}</td>
                                        <td className="px-3 py-2 text-sm text-gray-700">
                                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${order.status?.toLowerCase() === 'delivered' ? 'bg-emerald-100 text-emerald-800' : order.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                                            {order.status || 'Unknown'}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold">{confirmTarget.isActive ? 'Block customer' : 'Unblock customer'}</h2>
            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to {confirmTarget.isActive ? 'block' : 'unblock'} {confirmTarget.name || confirmTarget.fullName || 'this customer'}?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBlockUnblock}
                disabled={confirmLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {confirmLoading ? 'Saving...' : confirmTarget.isActive ? 'Block' : 'Unblock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomersPage;
