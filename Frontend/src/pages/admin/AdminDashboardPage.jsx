import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import adminService from '../../services/adminService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A'];

const StatCard = ({ title, value, hint }) => (
  <div className="bg-white shadow rounded p-4">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-2xl font-semibold">{value}</div>
    {hint && <div className="text-xs text-gray-400">{hint}</div>}
  </div>
);

const AdminDashboardPage = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [pendingDeliveries, setPendingDeliveries] = useState(0);
  const [deliveryBoysCount, setDeliveryBoysCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const computePendingDeliveries = (statuses) =>
      statuses.reduce((sum, item) => {
        const name = (item.name || '').toString().toLowerCase();
        if (['delivered', 'cancelled'].includes(name)) return sum;
        return sum + (Number(item.value) || 0);
      }, 0);

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [revRes, statusRes, ordersRes, lowStockRes, customersRes, deliveryBoysRes] = await Promise.all([
          adminService.getRevenue({ months: 6 }),
          adminService.getOrderStatus(),
          adminService.getRecentOrders({ limit: 10, sort: 'newest' }),
          adminService.getLowStock({ stock_lt: 5 }),
          adminService.getCustomers(),
          adminService.getDeliveryBoys(),
        ]);

        const revenue = revRes?.data?.data ?? sampleRevenue();
        const orderStatus = statusRes?.data?.data ?? sampleOrderStatus();
        const recent = ordersRes?.data?.data ?? sampleOrders();
        const customers = customersRes?.data?.data ?? customersRes?.data ?? [];
        const deliveryBoys = deliveryBoysRes?.data?.data ?? deliveryBoysRes?.data ?? [];

        setRevenueData(revenue);
        setOrderStatusData(orderStatus);
        setRecentOrders(recent);
        setLowStock(lowStockRes?.data?.data ?? sampleLowStock());
        setTotalCustomers(Array.isArray(customers) ? customers.length : 0);
        setDeliveryBoysCount(Array.isArray(deliveryBoys) ? deliveryBoys.length : 0);
        setPendingDeliveries(computePendingDeliveries(orderStatus));
      } catch (err) {
        setRevenueData(sampleRevenue());
        setOrderStatusData(sampleOrderStatus());
        setRecentOrders(sampleOrders());
        setLowStock(sampleLowStock());
        setTotalCustomers(0);
        setDeliveryBoysCount(0);
        setPendingDeliveries(computePendingDeliveries(sampleOrderStatus()));
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const totalOrders = orderStatusData.reduce((sum, item) => sum + (item.value || 0), 0);
  const totalRevenue = revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={loading ? '—' : totalOrders} hint="Total orders by status" />
        <StatCard title="Total Revenue" value={loading ? '—' : `$${totalRevenue}`} hint="Last 6 months" />
        <StatCard title="Pending Deliveries" value={loading ? '—' : pendingDeliveries} hint="Orders that still need delivery" />
        <StatCard title="Total Customers" value={loading ? '—' : totalCustomers} hint="Registered customers" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-5 rounded shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Revenue (last 6 months)</h2>
            <span className="text-sm text-gray-500">{loading ? 'Loading...' : 'Updated now'}</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Order Status</h2>
            <span className="text-sm text-gray-500">{loading ? 'Loading...' : 'Live'}</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={4}
                  label
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 bg-white rounded shadow overflow-hidden">
          <div className="border-b px-5 py-4 bg-slate-50">
            <h3 className="font-semibold">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Order ID', 'Customer', 'Items', 'Amount', 'Status', 'Date'].map((label) => (
                    <th key={label} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.customerName || order.customer || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.itemCount ?? order.items?.length ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">${Number(order.amount ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{new Date(order.createdAt || order.date || Date.now()).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="bg-white rounded shadow p-5">
          <div className="mb-4 border-b pb-3">
            <h3 className="font-semibold">Low Stock</h3>
            <p className="text-sm text-gray-500">Products below 5 units</p>
          </div>
          <ul className="space-y-3">
            {lowStock.map((product) => (
              <li key={product.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                <div>
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                </div>
                <a href={`/admin/products/edit/${product.id}`} className="text-blue-600 hover:underline text-sm">
                  Edit
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};

function sampleRevenue() {
  return [
    { month: 'Jan', revenue: 1200 },
    { month: 'Feb', revenue: 2100 },
    { month: 'Mar', revenue: 1800 },
    { month: 'Apr', revenue: 2400 },
    { month: 'May', revenue: 1900 },
    { month: 'Jun', revenue: 2600 },
  ];
}

function sampleOrderStatus() {
  return [
    { name: 'Placed', value: 72 },
    { name: 'Confirmed', value: 48 },
    { name: 'Dispatched', value: 30 },
    { name: 'Delivered', value: 145 },
    { name: 'Cancelled', value: 12 },
  ];
}

function sampleOrders() {
  return Array.from({ length: 8 }).map((_, index) => ({
    id: `ORD-${1000 + index}`,
    customerName: `Customer ${index + 1}`,
    itemCount: Math.floor(Math.random() * 4) + 1,
    amount: Math.floor(Math.random() * 260) + 40,
    status: ['Placed', 'Confirmed', 'Dispatched', 'Delivered'][index % 4],
    createdAt: Date.now() - index * 86400000,
  }));
}

function sampleLowStock() {
  return [
    { id: 'p1', name: 'Blue Shirt', stock: 2 },
    { id: 'p2', name: 'Red Kurta', stock: 1 },
    { id: 'p3', name: 'Black Trousers', stock: 4 },
  ];
}

export default AdminDashboardPage;

