const express = require('express');
const router = express.Router();

const { createOrder, getMyOrders } = require('../controllers/ordersController');
const { requireRestaurantOpen } = require('../middlewares/restaurantOpen');

const requireUser = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Login required' });
  }
  next();
};

router.post('/', requireUser, requireRestaurantOpen, createOrder);

router.get('/my', requireUser, getMyOrders);

module.exports = router;