import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, loading: authLoading } = useAuth();

  const redirectPath = new URLSearchParams(location.search).get('redirect')
    || location.state?.from
    || '/';

  useEffect(() => {
    if (!authLoading && user) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, authLoading, navigate, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      const loggedInUser = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (loggedInUser?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (loggedInUser?.role === 'delivery_boy') {
        navigate('/delivery', { replace: true });
      } else {
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch shadow-xl rounded-sm overflow-hidden bg-white border border-[#e0e0e0]">
        <div className="hidden md:flex flex-col justify-center gap-4 bg-[#2874f0] p-10 text-white">
          <div className="flex items-center gap-4">
            <img src="/Brand/blakton-logo.jpg" alt="Blakton" className="h-16 w-16 rounded-full object-cover bg-white" />
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/80">Blakton</p>
              <p className="text-sm text-white/70">Modern Fashion Studio</p>
            </div>
          </div>
          <h1 className="text-4xl font-bold">Blakton</h1>
          <p className="max-w-md text-white/85">
            Sign in to shop men&apos;s stitched formal wear and track your orders.
          </p>
        </div>

        <div className="p-8 md:p-10">
          <h2 className="text-3xl font-bold mb-2 text-[#212121]">Login</h2>
          <p className="text-[#878787] mb-6">Enter your account details to continue shopping.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#212121]">Email</label>
              <input
                type="email"
                className="w-full rounded-sm border border-[#e0e0e0] px-4 py-3 text-sm outline-none focus:border-[#2874f0]"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-[#212121]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-sm border border-[#e0e0e0] px-4 py-3 pr-16 text-sm outline-none focus:border-[#2874f0]"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#2874f0]"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-sm bg-[#fb641b] py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#e45712] disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-5 flex flex-col gap-3 text-sm text-[#878787]">
            <Link to="/auth/forgot-password" className="text-[#2874f0] font-medium hover:underline">
              Forgot Password?
            </Link>
            <p>
              Don&apos;t have an account?{' '}
              <Link to="/auth/register" className="text-[#2874f0] font-semibold hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
