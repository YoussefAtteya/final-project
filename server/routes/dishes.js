const express = require('express');
const router = express.Router();
const { getAllDishes, getFeaturedDishes,getTodaySpecial } = require('../controllers/dishesController');

router.get('/featured', getFeaturedDishes); 
router.get('/special', getTodaySpecial);
router.get('/', getAllDishes);

module.exports = router;
