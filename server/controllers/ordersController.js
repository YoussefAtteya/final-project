const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const db = require('../db');

const createOrder = async (req, res) => {
  const { items, order_type } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items provided' });
  }

  if (!['pickup', 'delivery'].includes(order_type)) {
    return res.status(400).json({ error: 'Invalid order type' });
  }

  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();

    const dishIds = items.map(i => i.id);

    const [dishes] = await connection.query(
      'SELECT id, price FROM dishes WHERE id IN (?)',
      [dishIds]
    );

    if (dishes.length !== items.length) {
      throw new Error('Invalid dish detected');
    }

    let itemsTotal = 0;

    const orderItemsValues = items.map(i => {
      const dish = dishes.find(d => d.id === i.id);
      const quantity = parseInt(i.quantity);

      if (!dish || Number.isNaN(quantity) || quantity <= 0) {
        throw new Error('Invalid item data');
      }

      const price = Number(dish.price);
      itemsTotal += price * quantity;

      return [null, dish.id, quantity, price];
    });

    const [settings] = await connection.query(
      'SELECT delivery_base_fee FROM restaurant_settings LIMIT 1'
    );

    const baseFee = Number(settings[0]?.delivery_base_fee || 0);
    const deliveryFee = order_type === 'delivery' ? baseFee : 0;
    const finalTotal = itemsTotal + deliveryFee;

    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total, order_type, delivery_fee, status) VALUES (?, ?, ?, ?, ?)',
      [userId, finalTotal, order_type, deliveryFee, 'pending']
    );

    const orderId = orderResult.insertId;

    const finalOrderItems = orderItemsValues.map(row => {
      row[0] = orderId;
      return row;
    });

    await connection.query(
      'INSERT INTO order_items (order_id, dish_id, quantity, price) VALUES ?',
      [finalOrderItems]
    );

    //  Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalTotal * 100),
      currency: 'usd',
      payment_method_types: ['card'],   // ✅ card only
      // automatic_payment_methods: { enabled: true }, // ✅ يسمح بالطرق اللي مفعلة في Dashboard
      metadata: { orderId }
    });

    // 7️⃣ تخزين payment_intent_id في DB
    await connection.query(
      'UPDATE orders SET payment_intent_id = ? WHERE id = ?',
      [paymentIntent.id, orderId]
    );

    await connection.commit();
    connection.release();

    res.json({
      message: 'Order created securely with transaction',
      orderId,
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    await connection.rollback();
    connection.release();
    res.status(400).json({ error: error.message });
  }
};



const getMyOrders = async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [results] = await db.promise().query(
      `
      SELECT 
        o.id AS order_id,
        o.total,
        o.order_type,
        o.delivery_fee,
        o.status,
        o.created_at,
        oi.id AS item_id,
        oi.dish_id,
        oi.quantity,
        oi.price
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
      `,
      [userId]
    );

    const ordersMap = {};

    results.forEach(row => {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          orderId: row.order_id,
          total: row.total,
          orderType: row.order_type,
          deliveryFee: row.delivery_fee,
          status: row.status,
          createdAt: row.created_at,
          items: []
        };
      }

      if (row.item_id) {
        ordersMap[row.order_id].items.push({
          itemId: row.item_id,
          dishId: row.dish_id,
          quantity: row.quantity,
          price: row.price
        });
      }
    });

    res.json(Object.values(ordersMap));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { createOrder, getMyOrders };
