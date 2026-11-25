const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/**
 * Opens Razorpay checkout (UPI / Card / Netbanking).
 * Resolves with payment response on success; rejects on dismiss/failure.
 */
export const openRazorpayCheckout = async ({
  keyId,
  amount,
  currency = 'INR',
  orderId,
  name = 'Blakton',
  description = 'Order payment',
  prefill = {},
  notes = {},
}) => {
  const ready = await loadRazorpayScript();
  if (!ready || !window.Razorpay) {
    throw new Error('Unable to load Razorpay payment gateway');
  }

  return new Promise((resolve, reject) => {
    const options = {
      key: keyId,
      amount,
      currency,
      name,
      description,
      order_id: orderId,
      prefill: {
        name: prefill.name || '',
        email: prefill.email || '',
        contact: prefill.contact || '',
      },
      notes,
      theme: { color: '#2874f0' },
      // Prefer UPI first in checkout
      config: {
        display: {
          blocks: {
            utib: {
              name: 'Pay using UPI',
              instruments: [{ method: 'upi' }],
            },
            other: {
              name: 'Other payment methods',
              instruments: [
                { method: 'card' },
                { method: 'netbanking' },
                { method: 'wallet' },
              ],
            },
          },
          sequence: ['block.utib', 'block.other'],
          preferences: { show_default_blocks: false },
        },
      },
      handler(response) {
        resolve(response);
      },
      modal: {
        ondismiss() {
          reject(new Error('Payment cancelled. You can pay advance later from My Orders.'));
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      reject(new Error(response?.error?.description || 'Payment failed. Please try again.'));
    });
    rzp.open();
  });
};

export default openRazorpayCheckout;
