import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ToasterProvider } from '../components/Toaster';

const SidebarLink = ({ to, label, icon }) => {
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(to + '/');
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${active ? 'bg-[#112235] border-l-4 border-[#1A3C5E]' : 'hover:bg-gray-800'}`}
    >
      <span className="text-xl">{icon}</span>
      <span className="hidden lg:inline-block">{label}</span>
    </Link>
  );
};

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 z-30 bg-gray-900 text-white transition-all ${isOpen ? 'w-64' : 'w-16'}`}>
        <div className="h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 p-4 border-b border-gray-800">
              <div className="h-10 w-10 rounded-full bg-[#274472] flex items-center justify-center font-bold">Y</div>
              {isOpen && (
                <div>
                  <div className="font-bold">Admin Panel</div>
                  <div className="text-xs text-gray-400">Blakton Modern Fashion Studio</div>
                </div>
              )}
            </div>

            <nav className="p-3 space-y-1">
              <SidebarLink to="/admin" label="Dashboard" icon="📊" />
              <SidebarLink to="/admin/products" label="Products" icon="📦" />
              <SidebarLink to="/admin/orders" label="Orders" icon="🛒" />
              <SidebarLink to="/admin/custom-orders" label="Design Orders" icon="✂️" />
              <SidebarLink to="/admin/payments" label="Payments" icon="💳" />
              <SidebarLink to="/admin/customers" label="Customers" icon="👥" />
              <SidebarLink to="/admin/delivery-boys" label="Delivery Boys" icon="🚚" />
              <SidebarLink to="/admin/banners" label="Banners" icon="🖼️" />
            </nav>
          </div>

          <div className="p-4 border-t border-gray-800">
            <button
              type="button"
              onClick={logout}
              className="w-full text-left text-red-400 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className={`flex-1 ml-${isOpen ? '64' : '16'} min-h-screen w-full`} style={{ marginLeft: isOpen ? 256 : 64 }}>
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsOpen((s) => !s)} className="text-gray-600 md:hidden">☰</button>
              <div className="text-lg font-semibold">Welcome, {user?.name?.split(' ')[0] || 'Admin'}</div>
            </div>
            <div className="text-sm text-gray-600">{new Date().toLocaleDateString()}</div>
          </div>
        </header>

        <main className="p-6">
          <ToasterProvider>
            <Outlet />
          </ToasterProvider>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
