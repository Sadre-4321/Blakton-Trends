const nodemailer = require('nodemailer');

const sendOrderNotification = async (order) => {
  const emailUser = process.env.SMTP_USER;
  const emailPassword = process.env.SMTP_PASSWORD;
  if (!emailUser || !emailPassword) {
    console.warn('Order email not sent: configure SMTP_USER and SMTP_PASSWORD.');
    return {
      status: 'not_configured',
      message: 'Order was placed, but email notifications are not configured.',
    };
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === 'true'
      : port === 465,
    auth: { user: emailUser, pass: emailPassword },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });

  const items = order.items
    .map((item) => {
      const variant = [item.color, item.size].filter(Boolean).join(' / ');
      return `- ${item.name}${variant ? ` (${variant})` : ''} x${item.quantity} @ INR ${item.price}`;
    })
    .join('\n');

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || emailUser,
      to: process.env.ORDER_NOTIFICATION_EMAIL || 'blakton.officila@gmail.com',
      subject: `New Blakton order ${order.orderId}`,
      text: [
        `Order ID: ${order.orderId}`,
        `Customer: ${order.customerName}`,
        `Email: ${order.customerEmail || 'Not provided'}`,
        `Phone: ${order.customerPhone}`,
        `Delivery address: ${order.deliveryAddress || order.shippingAddress || 'Not provided'}`,
        `Payment: ${order.paymentMethod} (${order.paymentStatus})`,
        `Total: INR ${order.amount}`,
        '',
        'Items:',
        items,
      ].join('\n'),
    });
    return { status: 'sent', message: 'Order notification email sent.' };
  } catch (error) {
    console.error(`Order email failed for ${order.orderId}:`, error);
    return {
      status: 'failed',
      message: 'Order was placed, but its email notification could not be sent.',
    };
  }
};

module.exports = sendOrderNotification;
