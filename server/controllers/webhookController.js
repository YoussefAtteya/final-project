const db = require('../db');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const handleStripeWebhook = (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata?.orderId;

    if (!orderId) {
      return res.status(200).json({ received: true });
    }

    return db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['paid', orderId],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json({ received: true });
      }
    );
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata?.orderId;

    if (orderId) {
      db.query('UPDATE orders SET status = ? WHERE id = ?', ['failed', orderId], () => {});
    }
  }

  res.status(200).json({ received: true });
};

module.exports = { handleStripeWebhook };