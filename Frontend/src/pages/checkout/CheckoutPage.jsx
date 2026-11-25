import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import CartContext from '../../context/CartContext';
import orderService from '../../services/orderService';
import userService from '../../services/userService';
import useAuth from '../../hooks/useAuth';
import { formatPrice, generateId, validatePhone } from '../../utils/helpers';

const emptyAddress = {
  fullName: '', mobile: '', house: '', street: '', city: '', state: '', pincode: '',
};

const CheckoutPage = () => {
  const { items, totals, clearCart } = useContext(CartContext);
  const { user, updateProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const isBuyNow = searchParams.get('mode') === 'buynow';
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [form, setForm] = useState(emptyAddress);
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [buyNowItem, setBuyNowItem] = useState(null);

  useEffect(() => {
    if (isBuyNow) {
      try {
        const raw = sessionStorage.getItem('buyNowItem');
        if (raw) setBuyNowItem(JSON.parse(raw));
      } catch (error) {
        setBuyNowItem(null);
      }
    }
  }, [isBuyNow]);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await userService.getAddresses();
        const list = response?.data?.data ?? response?.data ?? [];
        setAddresses(Array.isArray(list) ? list : []);
        const defaultAddress = list.find((a) => a.isDefault) || list[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setShowNewAddress(false);
        } else {
          setShowNewAddress(true);
          setForm({
            ...emptyAddress,
            fullName: user?.name || '',
            mobile: user?.mobile || '',
          });
        }
      } catch (error) {
        setShowNewAddress(true);
        setForm({
          ...emptyAddress,
          fullName: user?.name || '',
          mobile: user?.mobile || '',
        });
      }
    };
    loadAddresses();
  }, [user]);

  const checkoutItems = useMemo(() => {
    if (isBuyNow && buyNowItem) return [buyNowItem];
    return items;
  }, [isBuyNow, buyNowItem, items]);

  const checkoutTotals = useMemo(() => {
    const subtotal = checkoutItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity || 1), 0);
    const tax = subtotal * 0.18;
    const shipping = subtotal > 500 ? 0 : 100;
    return { subtotal, tax, shipping, total: subtotal + tax + shipping };
  }, [checkoutItems]);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const validateAddressForm = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!validatePhone(form.mobile)) errs.mobile = 'Enter a valid 10-digit mobile number';
    if (!form.house.trim()) errs.house = 'House/Flat is required';
    if (!form.street.trim()) errs.street = 'Street/Area is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state.trim()) errs.state = 'State is required';
    if (!/^[1-9][0-9]{5}$/.test(form.pincode)) errs.pincode = 'Enter a valid 6-digit pincode';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveNewAddress = async () => {
    if (!validateAddressForm()) return false;
    const newAddress = {
      id: generateId(),
      ...form,
      isDefault: addresses.length === 0,
    };
    const next = [...addresses.map((a) => ({ ...a, isDefault: false })), { ...newAddress, isDefault: true }];
    await userService.updateAddresses(next);
    setAddresses(next);
    setSelectedAddressId(newAddress.id);
    setShowNewAddress(false);
    return true;
  };

  const continueFromAddress = async () => {
    setApiError('');
    if (showNewAddress) {
      const saved = await saveNewAddress();
      if (!saved) return;
    } else if (!selectedAddress) {
      setApiError('Please select or add a delivery address');
      return;
    }
    setStep(2);
  };

  const placeOrder = async () => {
    if (!checkoutItems.length) {
      setApiError('No items to order');
      return;
    }

    let address = selectedAddress;
    if (showNewAddress) {
      const saved = await saveNewAddress();
      if (!saved) return;
      address = {
        ...form,
        id: selectedAddressId,
      };
    }

    if (!address) {
      setApiError('Please select a delivery address');
      return;
    }

    setLoading(true);
    setApiError('');

    const addressText = `${address.house}, ${address.street}, ${address.city}, ${address.state} - ${address.pincode}`;
    const orderPayload = {
      address: addressText,
      deliveryAddress: addressText,
      customerName: address.fullName,
      customerPhone: address.mobile,
      customerEmail: user?.email || '',
      paymentMethod: paymentMethod === 'online' ? 'Pay Online (UPI / Card)' : 'Cash on Delivery',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      items: checkoutItems.map((item) => ({
        productId: item.productId || item._id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity || 1,
        size: item.size || '',
        color: item.color || '',
      })),
    };

    try {
      if (user && (!user.mobile || user.mobile !== address.mobile)) {
        try {
          await updateProfile({ name: user.name || address.fullName, mobile: address.mobile });
        } catch (profileErr) {
          // non-blocking
        }
      }

      const response = await orderService.createOrder(orderPayload);
      const order = response?.data?.data || response?.data;
      const orderId = order?.orderId;
      if (!orderId) throw new Error('Order created but no order ID returned');

      sessionStorage.setItem(`order_${orderId}`, JSON.stringify(order));
      sessionStorage.removeItem('buyNowItem');

      if (paymentMethod === 'online') {
        try {
          await orderService.initiatePayment(orderId, {});
        } catch (payErr) {
          console.warn(payErr?.response?.data?.message || payErr.message);
        }
      }

      if (!isBuyNow) await clearCart();
      navigate(`/order-success/${orderId}`);
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!checkoutItems.length && !loading) {
    return (
      <div className="container-main section-padding text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <button type="button" onClick={() => navigate('/products')} className="mt-4 rounded-sm bg-[#2874f0] px-6 py-3 text-white">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <div className="flex h-[60px] items-center border-b border-[#e0e0e0] bg-white px-6">
        <div className="flex-1 font-bold text-[#2874f0]">Blakton</div>
        <div className="font-semibold">Secure Checkout</div>
        <div className="flex-1 text-right text-[#fb641b]">🔒</div>
      </div>

      <div className="container-main py-8">
        {apiError && <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{apiError}</div>}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-sm border border-[#e0e0e0] bg-white p-5">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xl font-semibold">1. Choose Delivery Details</h2>
                {!showNewAddress && addresses.length < 3 && (
                  <button type="button" onClick={() => { setShowNewAddress(true); setForm({ ...emptyAddress, fullName: user?.name || '', mobile: user?.mobile || '' }); }} className="text-sm font-semibold text-[#2874f0]">
                    + Add New Address
                  </button>
                )}
              </div>
              <p className="mb-4 text-sm text-[#878787]">
                Apne saved address me se choose karo. Order usi address, phone aur aapke account email ({user?.email || 'profile email'}) pe place hoga.
              </p>

              {!showNewAddress && addresses.length > 0 && (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label key={address.id} className={`block cursor-pointer rounded-sm border p-4 ${selectedAddressId === address.id ? 'border-2 border-[#2874f0] bg-[#eff6ff]' : 'border-[#e0e0e0]'}`}>
                      <div className="flex items-start gap-3">
                        <input type="radio" name="address" checked={selectedAddressId === address.id} onChange={() => setSelectedAddressId(address.id)} className="mt-1" />
                        <div>
                          <div className="font-semibold">{address.fullName} {address.isDefault && <span className="ml-2 text-xs text-[#388e3c]">DEFAULT</span>}</div>
                          <div className="text-sm text-[#475569]">{address.house}, {address.street}, {address.city}, {address.state} - {address.pincode}</div>
                          <div className="mt-1 text-sm text-[#878787]">Phone: {address.mobile}</div>
                          <div className="text-sm text-[#878787]">Email: {user?.email || '—'}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                  {addresses.length < 3 && (
                    <button type="button" onClick={() => { setShowNewAddress(true); setForm({ ...emptyAddress, fullName: user?.name || '', mobile: user?.mobile || '' }); }} className="text-sm font-semibold text-[#2874f0]">
                      Add another address
                    </button>
                  )}
                  <Link to="/profile" className="block text-sm font-medium text-[#64748b] hover:text-[#2874f0]">
                    Manage addresses in Profile →
                  </Link>
                </div>
              )}

              {showNewAddress && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[
                    ['fullName', 'Full Name'],
                    ['mobile', 'Mobile'],
                    ['house', 'House / Flat No.'],
                    ['street', 'Street / Area'],
                    ['city', 'City'],
                    ['pincode', 'Pincode'],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="mb-1 block text-[13px] text-[#878787]">{label}</label>
                      <input
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className={`w-full rounded-sm border p-3 text-sm ${errors[key] ? 'border-red-500' : 'border-[#e0e0e0]'}`}
                      />
                      {errors[key] && <div className="mt-1 text-sm text-red-600">{errors[key]}</div>}
                    </div>
                  ))}
                  <div>
                    <label className="mb-1 block text-[13px] text-[#878787]">State</label>
                    <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={`w-full rounded-sm border p-3 text-sm ${errors.state ? 'border-red-500' : 'border-[#e0e0e0]'}`}>
                      <option value="">Select State</option>
                      {['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal', 'Gujarat', 'Rajasthan'].map((state) => (
                        <option key={state}>{state}</option>
                      ))}
                    </select>
                    {errors.state && <div className="mt-1 text-sm text-red-600">{errors.state}</div>}
                  </div>
                  {addresses.length > 0 && (
                    <button type="button" onClick={() => setShowNewAddress(false)} className="md:col-span-2 text-left text-sm text-[#2874f0]">
                      Use saved address instead
                    </button>
                  )}
                </div>
              )}

              {step === 1 && (
                <button type="button" onClick={continueFromAddress} className="mt-5 w-full rounded-sm bg-[#fb641b] py-3 font-semibold text-white">
                  Deliver Here & Continue
                </button>
              )}
            </div>

            {step >= 2 && (
              <div className="rounded-sm border border-[#e0e0e0] bg-white p-5">
                <h2 className="mb-4 text-xl font-semibold">2. Payment Method</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { id: 'online', title: 'Pay Online (UPI / Card)', desc: 'Razorpay secure checkout' },
                    { id: 'cod', title: 'Cash on Delivery', desc: 'Pay when delivered' },
                  ].map((option) => (
                    <label key={option.id} className={`cursor-pointer rounded-sm border p-4 ${paymentMethod === option.id ? 'border-2 border-[#2874f0] bg-[#eff6ff]' : 'border-[#e0e0e0]'}`}>
                      <input type="radio" className="mr-2" checked={paymentMethod === option.id} onChange={() => setPaymentMethod(option.id)} />
                      <span className="font-semibold">{option.title}</span>
                      <div className="mt-1 text-sm text-[#878787]">{option.desc}</div>
                    </label>
                  ))}
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <button type="button" onClick={() => setStep(1)} className="rounded-sm border border-[#e0e0e0] py-3">Back</button>
                  <button type="button" onClick={() => setStep(3)} className="rounded-sm bg-[#2874f0] py-3 text-white">Continue to Review</button>
                </div>
              </div>
            )}

            {step >= 3 && (
              <div className="rounded-sm border border-[#e0e0e0] bg-white p-5">
                <h2 className="mb-4 text-xl font-semibold">3. Review Order</h2>
                <div className="space-y-3">
                  {checkoutItems.map((item) => (
                    <div key={`${item.productId}-${item.size}-${item.color}`} className="flex items-center gap-3 rounded-sm border border-[#e0e0e0] p-3">
                      <img src={item.image || 'https://via.placeholder.com/64'} alt={item.name} className="h-16 w-16 rounded object-contain bg-[#faf8f5]" />
                      <div className="flex-1">
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-[#878787]">Size: {item.size || 'N/A'} {item.color ? `· ${item.color}` : ''} · Qty: {item.quantity}</div>
                      </div>
                      <div className="font-semibold">{formatPrice(item.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>
                <button type="button" disabled={loading} onClick={placeOrder} className={`mt-5 w-full rounded-sm py-4 font-semibold text-white ${loading ? 'bg-[#94A3B8]' : 'bg-[#fb641b] hover:bg-[#e45712]'}`}>
                  {loading ? 'Placing order...' : 'Confirm & Place Order'}
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-sm border border-[#e0e0e0] bg-white p-5">
              <h4 className="text-lg font-semibold">Price Details</h4>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-[#878787]"><span>Subtotal</span><span>{formatPrice(checkoutTotals.subtotal)}</span></div>
                <div className="flex justify-between text-[#878787]"><span>Tax (GST)</span><span>{formatPrice(checkoutTotals.tax)}</span></div>
                <div className="flex justify-between text-[#878787]"><span>Delivery</span><span>{checkoutTotals.shipping === 0 ? 'FREE' : formatPrice(checkoutTotals.shipping)}</span></div>
                <div className="mt-3 flex justify-between border-t border-dashed border-[#e0e0e0] pt-3 font-bold">
                  <span>Total</span><span>{formatPrice(checkoutTotals.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
