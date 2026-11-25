import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, CheckCircle2, Ruler, Scissors } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import customOrderService from '../../services/customOrderService';
import { CATEGORY_COVER_IMAGES } from '../../constants/productImages';
import { resolveImageUrl } from '../../utils/resolveImage';
import { openRazorpayCheckout } from '../../utils/razorpay';

const CATEGORIES = [
  {
    id: 'single-shirt',
    label: 'Single Shirt',
    hint: 'Only formal shirt stitching',
    shows: ['shirt'],
    logo: CATEGORY_COVER_IMAGES['formal-shirt'],
  },
  {
    id: 'single-pant',
    label: 'Single Pant',
    hint: 'Only formal pant stitching',
    shows: ['pant'],
    logo: CATEGORY_COVER_IMAGES['formal-pant'],
  },
  {
    id: 'shirt-pant-pair',
    label: 'Pair Shirt + Pant',
    hint: 'Matching shirt and pant',
    shows: ['shirt', 'pant'],
    logo: CATEGORY_COVER_IMAGES.summer,
  },
  {
    id: 'single-coat',
    label: 'Single Coat',
    hint: 'Coat / blazer only',
    shows: ['coat'],
    logo: CATEGORY_COVER_IMAGES.coat,
  },
  {
    id: '2-piece',
    label: '2-Piece',
    hint: 'Shirt + Pant set',
    shows: ['shirt', 'pant'],
    logo: CATEGORY_COVER_IMAGES['2-piece'],
  },
  {
    id: '3-piece',
    label: '3-Piece',
    hint: 'Shirt + Pant + Coat + Waistcoat',
    shows: ['shirt', 'pant', 'coat', 'waistcoat'],
    logo: CATEGORY_COVER_IMAGES['3-piece'],
  },
  {
    id: 'kurta-pajama',
    label: 'Kurta Pajama',
    hint: 'Kurta + pajama set',
    shows: ['kurta'],
    logo: CATEGORY_COVER_IMAGES['kurta-pajama'],
  },
];

const PANT_DESIGNS = [
  { id: 'bootcut', label: 'Bootcut' },
  { id: 'baggy', label: 'Baggy' },
  { id: 'straight', label: 'Straight Fit' },
];

const PANT_LENGTHS = [
  { id: 'long', label: 'Long Length' },
  { id: 'ankle', label: 'Ankle Length' },
];

const emptyForm = {
  customerName: '',
  customerPhone: '',
  deliveryAddress: '',
  preferredColor: '',
  fabric: '',
  modelDesign: '',
  sizeOrMeasurements: '',
  extraNotes: '',
  shirtCollar: '',
  shirtFit: '',
  shirtSleeve: '',
  pantDesign: '',
  pantLength: '',
  pantFit: '',
  coatStyle: '',
  waistcoatNeeded: false,
  kurtaStyle: '',
  advanceAmount: '',
  advancePaymentMethod: 'upi',
  estimatedTotal: '',
};

const formatDate = (date) =>
  date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

const CustomizeOrderPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [form, setForm] = useState({
    ...emptyForm,
    customerName: user?.name || '',
    customerPhone: user?.mobile || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const selected = useMemo(() => CATEGORIES.find((c) => c.id === category), [category]);
  const shows = selected?.shows || [];
  const deliveryDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  }, []);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    if (!category) return 'Please select what you want to order';
    if (!form.customerName.trim() || !form.customerPhone.trim() || !form.deliveryAddress.trim()) {
      return 'Name, phone and delivery address are required';
    }
    if (!form.preferredColor.trim() || !form.modelDesign.trim()) {
      return 'Please share preferred color and model/design';
    }
    if (shows.includes('pant') && !form.pantDesign) return 'Please choose pant design (Bootcut / Baggy / Straight)';
    if (shows.includes('pant') && !form.pantLength) return 'Please choose pant length (Long / Ankle)';
    if (!Number(form.advanceAmount) || Number(form.advanceAmount) < 1) {
      return 'Advance amount is required for custom orders';
    }
    return '';
  };

  const payAdvance = async (order) => {
    const payRes = await customOrderService.initiatePayment(order.customOrderId);
    const payData = payRes?.data?.data || payRes?.data;

    if (payData?.alreadyPaid) {
      return payData.order || order;
    }

    const payment = await openRazorpayCheckout({
      keyId: payData.keyId,
      amount: payData.amount,
      currency: payData.currency || 'INR',
      orderId: payData.razorpayOrder?.id,
      description: `Advance for ${order.customOrderId}`,
      prefill: {
        name: order.customerName || user?.name || '',
        email: user?.email || '',
        contact: order.customerPhone || user?.mobile || '',
      },
      notes: {
        customOrderId: order.customOrderId,
        orderCategory: order.orderCategory,
      },
    });

    const verifyRes = await customOrderService.verifyPayment(order.customOrderId, {
      razorpay_order_id: payment.razorpay_order_id,
      razorpay_payment_id: payment.razorpay_payment_id,
      razorpay_signature: payment.razorpay_signature,
    });

    return verifyRes?.data?.data || verifyRes?.data || order;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/auth/login?redirect=/customize-order');
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        orderCategory: category,
        ...form,
        customerEmail: user?.email || '',
        advanceAmount: Number(form.advanceAmount),
        estimatedTotal: Number(form.estimatedTotal) || 0,
        waistcoatNeeded: shows.includes('waistcoat') ? true : Boolean(form.waistcoatNeeded),
        advancePaymentMethod: form.advancePaymentMethod === 'cash' ? 'cash' : 'upi',
      };
      const res = await customOrderService.create(payload);
      let order = res?.data?.data || res?.data;

      // UPI / Online → open Razorpay payment gateway
      if (payload.advancePaymentMethod !== 'cash') {
        try {
          order = await payAdvance(order);
        } catch (payErr) {
          setSuccess(order);
          setError(
            payErr?.response?.data?.message
            || payErr.message
            || 'Order placed, but payment was not completed. Pay advance from My Orders.'
          );
          return;
        }
      }

      setSuccess(order);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place custom order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] py-10">
        <div className="container-main max-w-xl">
          <div className="rounded-2xl border border-[#e8ecf1] bg-white p-8 text-center shadow-sm">
            <CheckCircle2 className={`mx-auto h-14 w-14 ${success.advancePaymentStatus === 'paid' ? 'text-[#16a34a]' : 'text-[#f59e0b]'}`} />
            <h1 className="mt-4 text-2xl font-semibold text-[#111827]">
              {success.advancePaymentStatus === 'paid' ? 'Order Confirmed' : 'Custom Order Placed'}
            </h1>
            <p className="mt-2 text-sm text-[#6b7280]">
              {success.advancePaymentStatus === 'paid'
                ? 'Advance payment received via UPI / Razorpay. Stitching will start soon.'
                : 'Your personal design request is saved. Complete advance payment to confirm stitching.'}
            </p>
            {error && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-left text-sm text-amber-800">
                {error}
              </div>
            )}
            <div className="mt-6 space-y-2 rounded-xl bg-[#f8fafc] p-4 text-left text-sm">
              <p><span className="text-[#6b7280]">Order ID:</span> <strong>{success.customOrderId}</strong></p>
              <p><span className="text-[#6b7280]">Category:</span> <strong>{success.orderCategory}</strong></p>
              <p><span className="text-[#6b7280]">Expected delivery:</span> <strong>{formatDate(new Date(success.expectedDelivery))}</strong></p>
              <p>
                <span className="text-[#6b7280]">Advance:</span>{' '}
                <strong>₹{success.advanceAmount}</strong>{' '}
                <span className={`capitalize ${success.advancePaymentStatus === 'paid' ? 'text-[#16a34a]' : 'text-[#c2410c]'}`}>
                  ({success.advancePaymentStatus})
                </span>
              </p>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {success.advancePaymentStatus !== 'paid' && success.advancePaymentMethod !== 'cash' && (
                <button
                  type="button"
                  onClick={async () => {
                    setSubmitting(true);
                    setError('');
                    try {
                      const paid = await payAdvance(success);
                      setSuccess(paid);
                    } catch (payErr) {
                      setError(payErr?.response?.data?.message || payErr.message || 'Payment failed');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  disabled={submitting}
                  className="rounded-lg bg-[#fb641b] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {submitting ? 'Opening UPI...' : 'Pay Advance via UPI'}
                </button>
              )}
              <Link to="/my-orders" className="rounded-lg bg-[#2874f0] px-5 py-2.5 text-sm font-semibold text-white">
                My Orders
              </Link>
              <Link to="/" className="rounded-lg border border-[#dbe3ef] px-5 py-2.5 text-sm font-semibold text-[#334155]">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] py-6 sm:py-10">
      <div className="container-main max-w-4xl">
        <div className="mb-6 rounded-2xl border border-[#e8ecf1] bg-white p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eff6ff] text-[#2874f0]">
              <Scissors className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold text-[#111827]">Customize Your Order</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6b7280]">
                Listed products pe seedha order karo, ya yahan apna design choose karke personal stitching order do.
                Hum aapke hisaab se stitch karke deliver karenge. Delivery target: <strong>1 week</strong>.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-xs text-[#475569]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8fafc] px-3 py-1.5 border border-[#e8ecf1]">
              <CalendarDays className="h-3.5 w-3.5 text-[#2874f0]" />
              Expected: {formatDate(deliveryDate)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff7ed] px-3 py-1.5 border border-[#fed7aa] text-[#c2410c]">
              Advance payment required for custom orders
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="rounded-2xl border border-[#e8ecf1] bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-[#111827]">1. What do you want to order?</h2>
            <p className="mt-1 text-sm text-[#6b7280]">Category choose karo — form usi ke hisaab se open hoga.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((item) => {
                const active = category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id)}
                    className={`rounded-xl border p-3 text-left transition sm:p-4 ${
                      active
                        ? 'border-[#2874f0] bg-[#eff6ff] shadow-[0_8px_24px_rgba(40,116,240,0.12)]'
                        : 'border-[#e8ecf1] bg-white hover:border-[#93c5fd]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-[#f8fafc] ${
                          active ? 'border-[#2874f0]' : 'border-[#e8ecf1]'
                        }`}
                      >
                        <img
                          src={resolveImageUrl(item.logo)}
                          alt={item.label}
                          className="h-full w-full object-contain object-center p-1"
                        />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-[#111827]">{item.label}</span>
                        <span className="mt-1 block text-xs text-[#64748b]">{item.hint}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {category && (
            <>
              <section className="rounded-2xl border border-[#e8ecf1] bg-white p-5 sm:p-6">
                <h2 className="text-base font-semibold text-[#111827]">2. Contact & delivery</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-[#334155]">Full name</span>
                    <input
                      value={form.customerName}
                      onChange={(e) => update('customerName', e.target.value)}
                      className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                      required
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-[#334155]">Phone</span>
                    <input
                      value={form.customerPhone}
                      onChange={(e) => update('customerPhone', e.target.value)}
                      className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                      required
                    />
                  </label>
                  <label className="block text-sm sm:col-span-2">
                    <span className="mb-1.5 block font-medium text-[#334155]">Delivery address</span>
                    <textarea
                      value={form.deliveryAddress}
                      onChange={(e) => update('deliveryAddress', e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                      required
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-2xl border border-[#e8ecf1] bg-white p-5 sm:p-6">
                <h2 className="text-base font-semibold text-[#111827]">3. Design details — {selected.label}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-[#334155]">Preferred color</span>
                    <input
                      value={form.preferredColor}
                      onChange={(e) => update('preferredColor', e.target.value)}
                      placeholder="e.g. Navy, Sky Blue, Ivory"
                      className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-[#334155]">Fabric preference</span>
                    <input
                      value={form.fabric}
                      onChange={(e) => update('fabric', e.target.value)}
                      placeholder="Cotton / Linen / Wool blend..."
                      className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                    />
                  </label>
                  <label className="block text-sm sm:col-span-2">
                    <span className="mb-1.5 block font-medium text-[#334155]">Model / design choice</span>
                    <input
                      value={form.modelDesign}
                      onChange={(e) => update('modelDesign', e.target.value)}
                      placeholder="Describe collar style, pocket style, look you want..."
                      className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                    />
                  </label>
                  <label className="block text-sm sm:col-span-2">
                    <span className="mb-1.5 flex items-center gap-1.5 font-medium text-[#334155]">
                      <Ruler className="h-3.5 w-3.5" /> Size / measurements
                    </span>
                    <textarea
                      value={form.sizeOrMeasurements}
                      onChange={(e) => update('sizeOrMeasurements', e.target.value)}
                      rows={2}
                      placeholder="Size (M/L/XL) or chest, waist, length, etc."
                      className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                    />
                  </label>

                  {shows.includes('shirt') && (
                    <>
                      <label className="block text-sm">
                        <span className="mb-1.5 block font-medium text-[#334155]">Shirt collar</span>
                        <select
                          value={form.shirtCollar}
                          onChange={(e) => update('shirtCollar', e.target.value)}
                          className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                        >
                          <option value="">Select</option>
                          <option value="regular">Regular</option>
                          <option value="cutaway">Cutaway</option>
                          <option value="button-down">Button Down</option>
                          <option value="mandarin">Mandarin</option>
                        </select>
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1.5 block font-medium text-[#334155]">Shirt fit</span>
                        <select
                          value={form.shirtFit}
                          onChange={(e) => update('shirtFit', e.target.value)}
                          className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                        >
                          <option value="">Select</option>
                          <option value="regular">Regular</option>
                          <option value="slim">Slim</option>
                          <option value="relaxed">Relaxed</option>
                        </select>
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1.5 block font-medium text-[#334155]">Sleeve</span>
                        <select
                          value={form.shirtSleeve}
                          onChange={(e) => update('shirtSleeve', e.target.value)}
                          className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                        >
                          <option value="">Select</option>
                          <option value="full">Full sleeve</option>
                          <option value="half">Half sleeve</option>
                        </select>
                      </label>
                    </>
                  )}

                  {shows.includes('pant') && (
                    <>
                      <div className="sm:col-span-2">
                        <p className="mb-2 text-sm font-medium text-[#334155]">Pant design</p>
                        <div className="grid grid-cols-3 gap-2">
                          {PANT_DESIGNS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => update('pantDesign', opt.id)}
                              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                                form.pantDesign === opt.id
                                  ? 'border-[#2874f0] bg-[#eff6ff] text-[#1f5fd0]'
                                  : 'border-[#dbe3ef] text-[#475569] hover:border-[#93c5fd]'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="mb-2 text-sm font-medium text-[#334155]">Pant length</p>
                        <div className="grid grid-cols-2 gap-2">
                          {PANT_LENGTHS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => update('pantLength', opt.id)}
                              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                                form.pantLength === opt.id
                                  ? 'border-[#2874f0] bg-[#eff6ff] text-[#1f5fd0]'
                                  : 'border-[#dbe3ef] text-[#475569] hover:border-[#93c5fd]'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {shows.includes('coat') && (
                    <label className="block text-sm sm:col-span-2">
                      <span className="mb-1.5 block font-medium text-[#334155]">Coat style</span>
                      <select
                        value={form.coatStyle}
                        onChange={(e) => update('coatStyle', e.target.value)}
                        className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                      >
                        <option value="">Select</option>
                        <option value="single-breasted">Single breasted</option>
                        <option value="double-breasted">Double breasted</option>
                        <option value="tuxedo">Tuxedo</option>
                        <option value="blazer">Blazer</option>
                      </select>
                    </label>
                  )}

                  {shows.includes('waistcoat') && (
                    <label className="flex items-center gap-2 text-sm sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={form.waistcoatNeeded}
                        onChange={(e) => update('waistcoatNeeded', e.target.checked)}
                        className="h-4 w-4 rounded border-[#cbd5e1]"
                      />
                      Include waistcoat (3-piece)
                    </label>
                  )}

                  {shows.includes('kurta') && (
                    <label className="block text-sm sm:col-span-2">
                      <span className="mb-1.5 block font-medium text-[#334155]">Kurta style</span>
                      <select
                        value={form.kurtaStyle}
                        onChange={(e) => update('kurtaStyle', e.target.value)}
                        className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                      >
                        <option value="">Select</option>
                        <option value="straight">Straight</option>
                        <option value="pathani">Pathani</option>
                        <option value="indo-western">Indo-western</option>
                        <option value="wedding">Wedding / festive</option>
                      </select>
                    </label>
                  )}

                  <label className="block text-sm sm:col-span-2">
                    <span className="mb-1.5 block font-medium text-[#334155]">Extra notes</span>
                    <textarea
                      value={form.extraNotes}
                      onChange={(e) => update('extraNotes', e.target.value)}
                      rows={2}
                      placeholder="Any special request for stitching..."
                      className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-2xl border border-[#e8ecf1] bg-white p-5 sm:p-6">
                <h2 className="text-base font-semibold text-[#111827]">4. Advance payment</h2>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Order place karte hi <strong>Razorpay UPI gateway</strong> open hoga. Expected delivery:{' '}
                  <strong>{formatDate(deliveryDate)}</strong> (1 week).
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-[#334155]">Advance amount (₹)</span>
                    <input
                      type="number"
                      min="1"
                      value={form.advanceAmount}
                      onChange={(e) => update('advanceAmount', e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                      required
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-[#334155]">Pay advance via</span>
                    <select
                      value={form.advancePaymentMethod}
                      onChange={(e) => update('advancePaymentMethod', e.target.value)}
                      className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                    >
                      <option value="upi">UPI (Razorpay gateway)</option>
                      <option value="online">UPI / Card / Netbanking</option>
                      <option value="cash">Cash at shop (pay later)</option>
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-[#334155]">Estimated total (optional)</span>
                    <input
                      type="number"
                      min="0"
                      value={form.estimatedTotal}
                      onChange={(e) => update('estimatedTotal', e.target.value)}
                      placeholder="If discussed"
                      className="w-full rounded-lg border border-[#dbe3ef] px-3 py-2.5 outline-none focus:border-[#2874f0]"
                    />
                  </label>
                </div>
                {form.advancePaymentMethod !== 'cash' && (
                  <p className="mt-3 rounded-lg bg-[#eff6ff] px-3 py-2 text-xs text-[#1f5fd0]">
                    Place Custom Order pe click ke baad secure Razorpay window open hogi — wahan UPI se advance pay kar sakte ho.
                  </p>
                )}
              </section>
            </>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={!category || submitting}
              className="rounded-lg bg-[#fb641b] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#e45712] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? (form.advancePaymentMethod === 'cash' ? 'Placing order...' : 'Opening UPI payment...')
                : (form.advancePaymentMethod === 'cash' ? 'Place Custom Order' : 'Place Order & Pay Advance')}
            </button>
            <Link to="/products" className="text-sm font-medium text-[#2874f0] hover:underline">
              Or shop listed products →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomizeOrderPage;
