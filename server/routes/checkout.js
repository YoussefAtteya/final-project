const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/config', async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT delivery_base_fee FROM restaurant_settings LIMIT 1'
    );

    const deliveryFee = Number(rows?.[0]?.delivery_base_fee || 0);

    res.json({
      deliveryFee,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

