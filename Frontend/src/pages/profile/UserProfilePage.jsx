import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, LogOut, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import { formatDate, validatePhone } from '../../utils/helpers';
import { resolveImageUrl } from '../../utils/resolveImage';

const emptyAddress = {
  id: null,
  fullName: '',
  mobile: '',
  house: '',
  street: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
};

const emptyPassword = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const UserProfilePage = () => {
  const { user, logout, updateProfile, syncUser } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({ name: '', mobile: '', email: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddress, setEditingAddress] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressMessage, setAddressMessage] = useState('');
  const [addressError, setAddressError] = useState('');

  const [passwordForm, setPasswordForm] = useState(emptyPassword);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name || '',
      mobile: user.mobile || '',
      email: user.email || '',
    });
    setAvatarPreview(user.avatar ? resolveImageUrl(user.avatar) : '');
    setAddresses(user.addresses || []);
  }, [user]);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await userService.getAddresses();
        const list = response?.data?.data ?? response?.data ?? [];
        if (Array.isArray(list)) setAddresses(list);
      } catch {
        // keep from user object
      }
    };
    loadAddresses();
  }, []);

  const memberSince = useMemo(() => (user?.createdAt ? formatDate(user.createdAt) : 'N/A'), [user]);
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];

  const syncUserAddresses = (nextAddresses, nextUser) => {
    setAddresses(nextAddresses);
    if (nextUser) {
      syncUser(nextUser);
    } else if (user) {
      syncUser({ ...user, addresses: nextAddresses });
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileError('Please choose an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError('Image must be under 2MB.');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setProfileError('');
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileMessage('');
    setProfileError('');

    if (!profileForm.name.trim()) {
      setProfileError('Username / full name is required.');
      return;
    }
    if (!validatePhone(profileForm.mobile)) {
      setProfileError('Enter a valid 10-digit phone number.');
      return;
    }
    if (!profileForm.email.trim()) {
      setProfileError('Email is required.');
      return;
    }

    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', profileForm.name.trim());
      formData.append('mobile', profileForm.mobile.trim());
      formData.append('email', profileForm.email.trim().toLowerCase());
      if (avatarFile) formData.append('avatar', avatarFile);

      await updateProfile(formData);
      setAvatarFile(null);
      setProfileMessage('Profile details saved.');
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Unable to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const openAddAddress = () => {
    if (addresses.length >= 3) {
      setAddressError('Maximum 3 addresses allowed. Edit or delete one first.');
      return;
    }
    setAddressForm({
      ...emptyAddress,
      fullName: user?.name || '',
      mobile: user?.mobile || '',
    });
    setEditingAddress(false);
    setShowAddressForm(true);
    setAddressError('');
    setAddressMessage('');
  };

  const openEditAddress = (address) => {
    setAddressForm({ ...address });
    setEditingAddress(true);
    setShowAddressForm(true);
    setAddressError('');
    setAddressMessage('');
  };

  const handleAddressSave = async (event) => {
    event.preventDefault();
    setAddressMessage('');
    setAddressError('');

    if (!addressForm.fullName.trim() || !validatePhone(addressForm.mobile)) {
      setAddressError('Name and valid phone are required for address.');
      return;
    }
    if (!addressForm.house.trim() || !addressForm.street.trim() || !addressForm.city.trim() || !addressForm.state.trim()) {
      setAddressError('Complete address fields are required.');
      return;
    }
    if (!/^[1-9][0-9]{5}$/.test(addressForm.pincode.trim())) {
      setAddressError('Enter a valid 6-digit pincode.');
      return;
    }

    const prepared = {
      ...addressForm,
      id: addressForm.id || `addr-${Date.now()}`,
      fullName: addressForm.fullName.trim(),
      mobile: addressForm.mobile.trim(),
      house: addressForm.house.trim(),
      street: addressForm.street.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      pincode: addressForm.pincode.trim(),
    };

    let next = editingAddress
      ? addresses.map((addr) => (addr.id === prepared.id ? prepared : addr))
      : [...addresses, prepared];

    if (next.length > 3) {
      setAddressError('Maximum 3 addresses allowed.');
      return;
    }

    if (addressForm.isDefault || next.length === 1) {
      next = next.map((addr) => ({ ...addr, isDefault: addr.id === prepared.id }));
    }

    try {
      const response = await userService.updateAddresses(next);
      const saved = response?.data?.data ?? next;
      const nextUser = response?.data?.user;
      syncUserAddresses(saved, nextUser);
      setAddressMessage('Address saved. You can choose it at Buy Now / checkout.');
      setShowAddressForm(false);
      setAddressForm(emptyAddress);
    } catch (error) {
      setAddressError(error.response?.data?.message || 'Unable to save address.');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    const next = addresses.filter((address) => address.id !== addressId);
    try {
      const response = await userService.updateAddresses(next);
      const saved = response?.data?.data ?? next;
      syncUserAddresses(saved, response?.data?.user);
    } catch (error) {
      setAddressError(error.response?.data?.message || 'Unable to delete address.');
    }
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords must match.');
      return;
    }

    try {
      await userService.changePassword({ currentPassword, newPassword });
      setPasswordMessage('Password updated successfully.');
      setPasswordForm(emptyPassword);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Unable to update password.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f1f3f6]">
        <p className="text-[#878787]">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <div className="container-main max-w-3xl py-6 sm:py-8">
        {/* Existing details on top */}
        <section className="mb-5 rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-full border border-[#e0e0e0] bg-[#eff6ff]">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-[#2874f0]">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[#212121]">{user.name}</h1>
                <p className="text-sm text-[#878787]">{user.email}</p>
                <p className="mt-1 text-sm text-[#475569]">Phone: {user.mobile || 'Not set'}</p>
                <p className="mt-1 text-xs text-[#94a3b8]">Member since {memberSince}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-[#f8fafc] p-3 text-sm">
              <p className="text-xs uppercase tracking-wide text-[#94a3b8]">Username</p>
              <p className="mt-1 font-medium text-[#212121]">{user.name}</p>
            </div>
            <div className="rounded-lg bg-[#f8fafc] p-3 text-sm">
              <p className="text-xs uppercase tracking-wide text-[#94a3b8]">Email</p>
              <p className="mt-1 font-medium text-[#212121] break-all">{user.email}</p>
            </div>
            <div className="rounded-lg bg-[#f8fafc] p-3 text-sm">
              <p className="text-xs uppercase tracking-wide text-[#94a3b8]">Phone</p>
              <p className="mt-1 font-medium text-[#212121]">{user.mobile || '—'}</p>
            </div>
          </div>

          {defaultAddress && (
            <div className="mt-4 rounded-lg border border-[#e8ecf1] bg-[#f8fafc] p-3 text-sm">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                <MapPin className="h-3.5 w-3.5" /> Default delivery address
              </p>
              <p className="font-medium text-[#212121]">{defaultAddress.fullName} · {defaultAddress.mobile}</p>
              <p className="mt-1 text-[#475569]">
                {defaultAddress.house}, {defaultAddress.street}, {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
              </p>
            </div>
          )}

          <p className="mt-4 text-xs text-[#64748b]">
            Profile me naam, email, phone aur max 3 addresses save rahenge. Buy Now pe aap inme se choose karke order kar sakte ho.
          </p>
        </section>

        {/* All edit options in one place */}
        <section className="space-y-5 rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-xl font-semibold text-[#212121]">Edit Profile</h2>
            <p className="mt-1 text-sm text-[#878787]">Update username, phone, email, photo and password here.</p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4 border-b border-[#f0f0f0] pb-6">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border border-[#e0e0e0] bg-[#f8fafc]">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-[#2874f0]">
                    {profileForm.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#dbe3ef] px-3 py-2 text-sm font-medium text-[#334155] hover:border-[#2874f0] hover:text-[#2874f0]">
                <Camera className="h-4 w-4" />
                Upload photo
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-[#334155]">Username / Full name</span>
                <input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                  required
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-[#334155]">Phone number</span>
                <input
                  value={profileForm.mobile}
                  onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                  maxLength={10}
                  className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                  required
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1.5 block font-medium text-[#334155]">Email</span>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                  required
                />
              </label>
            </div>

            {profileError && <p className="text-sm text-red-600">{profileError}</p>}
            {profileMessage && <p className="text-sm text-green-600">{profileMessage}</p>}

            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-lg bg-[#2874f0] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Details'}
            </button>
          </form>

          {/* Addresses */}
          <div className="border-b border-[#f0f0f0] pb-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[#212121]">Saved Addresses</h3>
                <p className="text-sm text-[#878787]">Max 3 addresses — choose at checkout / Buy Now.</p>
              </div>
              <button
                type="button"
                onClick={openAddAddress}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#fb641b] px-3 py-2 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" /> Add new address
              </button>
            </div>

            <div className="space-y-3">
              {addresses.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#dbe3ef] bg-[#f8fafc] p-6 text-center text-sm text-[#878787]">
                  No address saved yet. Add one for faster checkout.
                </div>
              ) : (
                addresses.map((address) => (
                  <div key={address.id} className="rounded-lg border border-[#e8ecf1] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-[#212121]">{address.fullName}</p>
                          {address.isDefault && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[#475569]">
                          {address.house}, {address.street}, {address.city}, {address.state} - {address.pincode}
                        </p>
                        <p className="mt-1 text-[#878787]">Phone: {address.mobile}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditAddress(address)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#dbe3ef] px-3 py-1.5 text-xs font-semibold text-[#334155]"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(address.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddressSave} className="mt-4 space-y-3 rounded-lg border border-[#dbe3ef] bg-[#f8fafc] p-4">
                <h4 className="font-semibold text-[#212121]">{editingAddress ? 'Edit address' : 'Add new address'}</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ['fullName', 'Full name'],
                    ['mobile', 'Phone'],
                    ['house', 'House / Flat'],
                    ['street', 'Street / Area'],
                    ['city', 'City'],
                    ['state', 'State'],
                    ['pincode', 'Pincode'],
                  ].map(([key, label]) => (
                    <label key={key} className="block text-sm">
                      <span className="mb-1 block text-[#64748b]">{label}</span>
                      <input
                        value={addressForm[key]}
                        onChange={(e) => setAddressForm({ ...addressForm, [key]: e.target.value })}
                        maxLength={key === 'mobile' ? 10 : key === 'pincode' ? 6 : undefined}
                        className="w-full rounded-lg border border-[#dbe3ef] bg-white px-3 py-2 outline-none focus:border-[#2874f0]"
                        required
                      />
                    </label>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-sm text-[#334155]">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  />
                  Set as default address
                </label>
                <div className="flex flex-wrap gap-2">
                  <button type="submit" className="rounded-lg bg-[#2874f0] px-4 py-2 text-sm font-semibold text-white">
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddressForm(false); setAddressForm(emptyAddress); }}
                    className="rounded-lg border border-[#dbe3ef] px-4 py-2 text-sm font-semibold text-[#475569]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {addressError && <p className="mt-3 text-sm text-red-600">{addressError}</p>}
            {addressMessage && <p className="mt-3 text-sm text-green-600">{addressMessage}</p>}
          </div>

          {/* Password */}
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <h3 className="text-lg font-semibold text-[#212121]">Change Password</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-[#334155]">Current password</span>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                  required
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-[#334155]">New password</span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                  required
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-[#334155]">Confirm password</span>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                  required
                />
              </label>
            </div>
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            {passwordMessage && <p className="text-sm text-green-600">{passwordMessage}</p>}
            <button type="submit" className="rounded-lg border border-[#2874f0] px-5 py-2.5 text-sm font-semibold text-[#2874f0]">
              Update Password
            </button>
          </form>

          <div className="pt-2">
            <Link to="/my-orders" className="text-sm font-semibold text-[#2874f0] hover:underline">
              View My Orders →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserProfilePage;
