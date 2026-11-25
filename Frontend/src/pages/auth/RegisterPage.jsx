import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { validateEmail, validatePhone } from '../../utils/helpers';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register, user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Full Name is required.');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Enter a valid email address.');
      return;
    }

    if (!validatePhone(formData.mobile)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        password: formData.password,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message
          || (err.request
            ? 'Could not reach the server. Check your connection and try again.'
            : 'Registration failed. Please try again.'),
      );
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
            Create your account to shop men&apos;s stitched formal wear online.
          </p>
        </div>

        <div className="p-8 md:p-10">
          <h2 className="text-3xl font-bold mb-2 text-[#212121]">Register</h2>
          <p className="text-[#878787] mb-6">Create your account and start shopping today.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name</label>
              <input
                type="text"
                className="w-full rounded-sm border border-[#e0e0e0] px-4 py-3 text-sm outline-none focus:border-[#2874f0]"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                className="w-full rounded-sm border border-[#e0e0e0] px-4 py-3 text-sm outline-none focus:border-[#2874f0]"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Mobile Number</label>
              <input
                type="tel"
                className="w-full rounded-sm border border-[#e0e0e0] px-4 py-3 text-sm outline-none focus:border-[#2874f0]"
                placeholder="Enter your mobile number"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                maxLength={10}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                className="w-full rounded-sm border border-[#e0e0e0] px-4 py-3 text-sm outline-none focus:border-[#2874f0]"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Confirm Password</label>
              <input
                type="password"
                className="w-full rounded-sm border border-[#e0e0e0] px-4 py-3 text-sm outline-none focus:border-[#2874f0]"
                placeholder="Enter your password again"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                autoComplete="new-password"
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-sm bg-[#fb641b] py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#e45712] disabled:opacity-60"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="mt-5 text-sm text-[#878787]">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-[#2874f0] font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
