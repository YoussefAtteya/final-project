const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const requireAdmin = require('../middlewares/requireAdmin');
const upload = require('../middlewares/upload');
const {
  addDish,
  updateDish,
  deleteDish,
  getDishes,
  setTodaySpecial,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getSettings,
  updateSettings,
  getDashboardStats
} = require('../controllers/adminController');

// Protect all admin routes
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Dishes
router.get('/dishes', getDishes);

router.post(
  '/dishes',
  upload.single('image'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('category_id').isInt().withMessage('Category must be integer')
  ],
  addDish
);

router.put(
  '/dishes/:id',
  upload.single('image'),
  [
    param('id').isInt().withMessage('Dish id must be integer')
  ],
  updateDish
);

router.delete(
  '/dishes/:id',
  [
    param('id').isInt().withMessage('Dish id must be integer')
  ],
  deleteDish
);

// Today Special
router.put(
  '/special/:dishId',
  [
    param('dishId').isInt().withMessage('Dish id must be integer')
  ],
  setTodaySpecial
);

// Orders
router.get('/orders', getAllOrders);

router.get(
  '/orders/:id',
  [
    param('id').isInt().withMessage('Order id must be integer')
  ],
  getOrderById
);

router.put(
  '/orders/:id/status',
  [
    param('id').isInt().withMessage('Order id must be integer'),
    body('status')
      .isIn(['pending', 'paid', 'preparing', 'out_for_delivery', 'completed', 'cancelled'])
      .withMessage('Invalid order status')
  ],
  updateOrderStatus
);

// Categories
router.get('/categories', getCategories);

router.post(
  '/categories',
  [
    body('name').notEmpty().withMessage('Category name is required')
  ],
  addCategory
);

router.put(
  '/categories/:id',
  [
    param('id').isInt().withMessage('Category id must be integer'),
    body('name').notEmpty().withMessage('Category name is required')
  ],
  updateCategory
);

router.delete(
  '/categories/:id',
  [
    param('id').isInt().withMessage('Category id must be integer')
  ],
  deleteCategory
);

// Settings
router.get('/settings', getSettings);

router.put(
  '/settings',
  [
    body('delivery_base_fee').optional().isFloat({ min: 0 }).withMessage('Delivery fee must be valid'),
    body('opening_time').optional().notEmpty().withMessage('Opening time is required'),
    body('closing_time').optional().notEmpty().withMessage('Closing time is required')
  ],
  updateSettings
);

// Upload
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    message: 'Image uploaded successfully',
    imageUrl: `/uploads/${req.file.filename}`
  });
});

module.exports = router;