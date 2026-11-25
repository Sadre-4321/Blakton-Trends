import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  User,
  X,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import useWishlist from '../../hooks/useWishlist';

const CATEGORY_LINKS = [
  { label: 'Offers', to: '/products?onOffer=true' },
  { label: 'Customize Order', to: '/customize-order' },
  { label: 'Formal Shirt', to: '/products/category/formal-shirt' },
  { label: 'Formal Pant', to: '/products/category/formal-pant' },
  { label: '2-Piece', to: '/products/category/2-piece' },
  { label: 'Coat', to: '/products/category/coat' },
  { label: '3-Piece', to: '/products/category/3-piece' },
  { label: 'Kurta', to: '/products/category/kurta-pajama' },
  { label: 'Summer', to: '/products?season=summer' },
  { label: 'Winter', to: '/products?season=winter' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const accountRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  // Keep navbar search text in sync with URL ?q=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (location.pathname.startsWith('/search')) {
      setSearchQuery(params.get('q') || '');
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setAccountOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50">
      <nav className="border-b border-[#1f4fbf] bg-[#2874f0] text-white shadow-[0_2px_12px_rgba(15,39,68,0.18)]">
        <div className="container-main flex h-[64px] items-center gap-2 sm:gap-3">
          <Link to="/" className="group flex min-w-0 shrink items-center gap-2 sm:gap-2.5">
            <motion.img
              whileHover={{ scale: 1.04 }}
              src="/Brand/blakton-logo.jpg"
              alt="Blakton"
              className="h-9 w-9 shrink-0 rounded-full object-cover shadow-sm sm:h-11 sm:w-11"
            />
            <div className="min-w-0 leading-tight">
              <p className="font-sans text-[13px] font-semibold tracking-tight sm:text-[15px]">BLAKTON</p>
              <p className="hidden text-[9px] font-medium uppercase tracking-[0.16em] text-white/75 min-[360px]:block">Modern Fashion Studio</p>
            </div>
          </Link>

          <form
            onSubmit={handleSearch}
            className="hidden h-11 flex-1 items-center overflow-hidden rounded-md bg-white shadow-sm transition focus-within:ring-2 focus-within:ring-[#fdd835]/70 md:flex"
          >
            <Search className="ml-3 h-4 w-4 shrink-0 text-[#878787]" strokeWidth={2} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for shirts, pants, coats, 3-piece..."
              className="h-full w-full bg-transparent px-3 font-sans text-sm text-[#212121] outline-none placeholder:text-[#9aa0a6]"
            />
            <button
              type="submit"
              className="mr-1 rounded-md bg-[#2874f0] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#1f5fd0]"
            >
              Search
            </button>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
            {user ? (
              <div className="relative" ref={accountRef}>
                <motion.button
                  type="button"
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium"
                >
                  <User className="h-4 w-4" strokeWidth={2} />
                  <span className="hidden sm:inline">{user.name?.split(' ')[0] || 'Account'}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition ${accountOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-2 w-56 overflow-hidden rounded-md border border-[#e8e8e8] bg-white py-1 text-[#212121] shadow-[0_12px_40px_rgba(0,0,0,0.14)]"
                    >
                      <Link to="/profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm transition hover:bg-[#f5f7fb]">
                        <User className="h-4 w-4 text-[#2874f0]" /> My Profile
                      </Link>
                      <Link to="/my-orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm transition hover:bg-[#f5f7fb]">
                        <Package className="h-4 w-4 text-[#2874f0]" /> My Orders
                      </Link>
                      <Link to="/wishlist" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm transition hover:bg-[#f5f7fb]">
                        <Heart className="h-4 w-4 text-[#2874f0]" /> Wishlist
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-[#2874f0] transition hover:bg-[#f5f7fb]">
                          Admin Dashboard
                        </Link>
                      )}
                      {user.role === 'delivery_boy' && (
                        <Link to="/delivery" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-[#2874f0] transition hover:bg-[#f5f7fb]">
                          Delivery Panel
                        </Link>
                      )}
                      <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-[#fff5f5]">
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="rounded-md bg-white px-2 py-2 text-xs font-semibold text-[#2874f0] shadow-sm transition hover:bg-[#f5f8ff] sm:px-3.5 sm:text-sm"
              >
                Login
              </Link>
            )}

            <Link
              to="/wishlist"
              className="relative hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium transition hover:bg-white/12 sm:flex"
            >
              <Heart className="h-4 w-4" strokeWidth={2} />
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#fb641b] px-1 text-[10px] font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center gap-1 rounded-md px-1.5 py-2 text-sm font-medium transition hover:bg-white/12 sm:gap-1.5 sm:px-2.5"
            >
              <ShoppingCart className="h-4 w-4" strokeWidth={2} />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#fb641b] px-1 text-[10px] font-bold"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/25 transition hover:bg-white/12 sm:h-10 sm:w-10 md:hidden"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="hidden border-t border-white/15 bg-[#1f5fd0] md:block">
          <div className="container-main flex gap-1 overflow-x-auto py-2.5 scrollbar-hidden">
            {CATEGORY_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="whitespace-nowrap rounded-md px-3 py-1.5 font-sans text-[13px] font-medium text-white/95 transition hover:bg-white/12 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-[#e8e8e8] bg-white md:hidden"
          >
            <div className="container-main space-y-3 py-4">
              <form onSubmit={handleSearch} className="flex overflow-hidden rounded-md border border-[#e0e0e0]">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-3 py-2.5 text-sm text-[#212121] outline-none"
                />
                <button type="submit" className="bg-[#2874f0] px-4 text-white">
                  <Search className="h-4 w-4" />
                </button>
              </form>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-md border border-[#eceff3] bg-[#f8fafc] px-3 py-2.5 text-sm font-medium text-[#212121] transition hover:border-[#2874f0] hover:text-[#2874f0]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
