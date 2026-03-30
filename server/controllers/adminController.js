const db = require("../db");
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

const deleteUploadFile = (imagePath) => {
  if (!imagePath) return;

  const fileName = imagePath.replace("/uploads/", "");
  const fullPath = path.join(__dirname, "..", "uploads", fileName);

  fs.unlink(fullPath, () => {});
};

// =========================
// Dishes CRUD
// =========================

const getDishes = (req, res) => {
  db.query(
    `
    SELECT 
      d.id,
      d.name,
      d.description,
      d.price,
      d.image,
      d.category_id,
      d.is_featured,
      d.is_special,
      d.is_active,
      c.name AS category_name
    FROM dishes d
    LEFT JOIN categories c ON c.id = d.category_id
    ORDER BY d.id DESC
    `,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

const addDish = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, price, category_id, is_featured } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ error: "name, price, category_id are required" });
  }

  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  db.query(
    `INSERT INTO dishes (name, description, price, image, category_id, is_featured, is_special)
     VALUES (?, ?, ?, ?, ?, ?, 0)`,
    [
      name,
      description || null,
      price,
      imagePath,
      category_id,
      is_featured ? 1 : 0,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        message: "Dish created successfully",
        dishId: result.insertId,
        image: imagePath,
      });
    }
  );
};

const updateDish = (req, res) => {
  const { id } = req.params;
  const { name, description, price, category_id, is_featured } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ error: "name, price, category_id are required" });
  }

  const newImagePath = req.file ? `/uploads/${req.file.filename}` : null;

  db.query("SELECT image FROM dishes WHERE id = ? LIMIT 1", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ error: "Dish not found" });

    const oldImage = rows[0].image;

    if (newImagePath && oldImage && oldImage !== newImagePath) {
      deleteUploadFile(oldImage);
    }

    db.query(
      `UPDATE dishes
       SET name = ?, description = ?, price = ?, image = ?, category_id = ?, is_featured = ?
       WHERE id = ?`,
      [
        name,
        description || null,
        price,
        newImagePath || oldImage,
        category_id,
        is_featured ? 1 : 0,
        id,
      ],
      (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });

        res.json({
          message: "Dish updated successfully",
          image: newImagePath || oldImage,
        });
      }
    );
  });
};

const deleteDish = (req, res) => {
  const { id } = req.params;

  db.query("SELECT image FROM dishes WHERE id = ? LIMIT 1", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ error: "Dish not found" });

    const image = rows[0].image;

    db.query("DELETE FROM dishes WHERE id = ?", [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });

      if (image) deleteUploadFile(image);

      res.json({ message: "Dish deleted successfully" });
    });
  });
};

// =========================
// Today Special
// =========================

const setTodaySpecial = (req, res) => {
  const { dishId } = req.params;

  db.query("UPDATE dishes SET is_special = 0", (err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query("UPDATE dishes SET is_special = 1 WHERE id = ?", [dishId], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });

      res.json({ message: "Today special updated" });
    });
  });
};

// =========================
// Orders
// =========================

const getAllOrders = (req, res) => {
  db.query(
    `
    SELECT 
      o.id AS order_id,
      o.user_id,
      o.total,
      o.order_type,
      o.delivery_fee,
      o.status,
      o.created_at,
      u.name AS user_name,
      u.email AS user_email
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    ORDER BY o.created_at DESC
    `,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

const getOrderById = (req, res) => {
  const { id } = req.params;

  db.query(
    `
    SELECT 
      o.id AS order_id,
      o.user_id,
      o.total,
      o.order_type,
      o.delivery_fee,
      o.status,
      o.created_at,
      u.name AS user_name,
      u.email AS user_email
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE o.id = ?
    LIMIT 1
    `,
    [id],
    (err, orderRows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!orderRows.length) return res.status(404).json({ error: "Order not found" });

      db.query(
        `
        SELECT 
          oi.id,
          oi.order_id,
          oi.dish_id,
          oi.quantity,
          -- order_items uses price (see ordersController). Alias it so the API response stays consistent.
          oi.price AS unit_price,
          d.name AS dish_name,
          d.image AS dish_image
        FROM order_items oi
        LEFT JOIN dishes d ON d.id = oi.dish_id
        WHERE oi.order_id = ?
        `,
        [id],
        (err2, itemRows) => {
          if (err2) return res.status(500).json({ error: err2.message });

          res.json({
            ...orderRows[0],
            items: itemRows,
          });
        }
      );
    }
  );
};

const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["pending", "paid", "preparing", "out_for_delivery", "completed", "cancelled"];

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  db.query(
    "UPDATE orders SET status = ? WHERE id = ?",
    [status, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json({ message: "Order status updated" });
    }
  );
};

// =========================
// Categories CRUD
// =========================

const getCategories = (req, res) => {
  db.query("SELECT id, name FROM categories ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

const addCategory = (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: "Category name is required" });

  db.query("INSERT INTO categories (name) VALUES (?)", [name], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "Category added", categoryId: result.insertId });
  });
};

const updateCategory = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: "Category name is required" });

  db.query("UPDATE categories SET name = ? WHERE id = ?", [name, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "Category updated" });
  });
};

const deleteCategory = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM categories WHERE id = ?", [id], (err, result) => {
    if (err) {
      if (err.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(400).json({
          error: "Cannot delete this category because it is used by existing dishes.",
        });
      }

      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  });
};
// =========================
// Settings
// =========================

const getSettings = (req, res) => {
  db.query("SELECT * FROM restaurant_settings WHERE id = 1 LIMIT 1", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!rows.length) {
      return res.status(404).json({ error: "Settings not found" });
    }

    res.json(rows[0]);
  });
};

const updateSettings = (req, res) => {
  const { is_open, is_holiday, opening_time, closing_time, delivery_base_fee } = req.body;

  db.query(
    `
    UPDATE restaurant_settings
    SET is_open = ?, is_holiday = ?, opening_time = ?, closing_time = ?, delivery_base_fee = ?
    WHERE id = 1
    `,
    [
      is_open ? 1 : 0,
      is_holiday ? 1 : 0,
      opening_time,
      closing_time,
      delivery_base_fee,
    ],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "Settings updated" });
    }
  );
};


// =========================
// Dashboard Stats
// =========================



// =========================
// Dashboard Stats
// =========================
const getDashboardStats = (req, res) => {
  const stats = {};

  db.query(
    "SELECT COUNT(*) AS total_orders FROM orders",
    (err, totalRows) => {
      if (err) return res.status(500).json({ error: err.message });

      stats.total_orders = Number(totalRows[0].total_orders || 0);

      db.query(
        "SELECT COUNT(*) AS pending_orders FROM orders WHERE status = 'pending'",
        (err2, pendingRows) => {
          if (err2) return res.status(500).json({ error: err2.message });

          stats.pending_orders = Number(pendingRows[0].pending_orders || 0);

          db.query(
            "SELECT COALESCE(SUM(total), 0) AS revenue FROM orders WHERE status != 'cancelled'",
            (err3, revenueRows) => {
              if (err3) return res.status(500).json({ error: err3.message });

              stats.revenue = Number(revenueRows[0].revenue || 0);

              db.query(
                "SELECT COALESCE(SUM(total), 0) AS revenue_today FROM orders WHERE DATE(created_at) = CURDATE() AND status != 'cancelled'",
                (err4, revenueTodayRows) => {
                  if (err4) return res.status(500).json({ error: err4.message });

                  stats.revenue_today = Number(revenueTodayRows[0].revenue_today || 0);

                  db.query(
                    "SELECT is_open, is_holiday FROM restaurant_settings WHERE id = 1 LIMIT 1",
                    (err5, settingsRows) => {
                      if (err5) return res.status(500).json({ error: err5.message });

                      const settings = settingsRows[0] || {};
                      let restaurant_status = "Closed";

                      if (settings.is_holiday) {
                        restaurant_status = "Holiday";
                      } else if (settings.is_open) {
                        restaurant_status = "Open";
                      }

                      stats.restaurant_status = restaurant_status;

                      db.query(
                        `
                        SELECT 
                          d.id AS dish_id,
                          d.name,
                          COALESCE(SUM(oi.quantity), 0) AS total_qty
                        FROM order_items oi
                        JOIN dishes d ON d.id = oi.dish_id
                        JOIN orders o ON o.id = oi.order_id
                        WHERE o.status != 'cancelled'
                        GROUP BY d.id, d.name
                        ORDER BY total_qty DESC
                        LIMIT 1
                        `,
                        (err6, topDishRows) => {
                          if (err6) return res.status(500).json({ error: err6.message });

                          stats.top_selling_dish = topDishRows.length
                            ? {
                                dish_id: topDishRows[0].dish_id,
                                name: topDishRows[0].name,
                                total_qty: Number(topDishRows[0].total_qty || 0),
                              }
                            : null;

                          db.query(
                            `
                            SELECT 
                              o.id AS order_id,
                              o.total,
                              o.order_type,
                              o.status,
                              o.created_at,
                              u.name AS user_name
                            FROM orders o
                            LEFT JOIN users u ON u.id = o.user_id
                            WHERE o.status IN ('pending', 'paid', 'preparing', 'out_for_delivery')
                            ORDER BY o.created_at DESC
                            LIMIT 8
                            `,
                            (err7, liveOrdersRows) => {
                              if (err7) return res.status(500).json({ error: err7.message });

                              stats.live_orders = liveOrdersRows;

                              db.query(
                                `
                                SELECT 
                                  DATE(created_at) AS day,
                                  COUNT(*) AS orders_count,
                                  COALESCE(SUM(total), 0) AS revenue
                                FROM orders
                                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                                  AND status != 'cancelled'
                                GROUP BY DATE(created_at)
                                ORDER BY day ASC
                                `,
                                (err8, dailyOrdersRows) => {
                                  if (err8) return res.status(500).json({ error: err8.message });

                                  stats.daily_orders = dailyOrdersRows.map((row) => ({
                                    day: row.day,
                                    orders_count: Number(row.orders_count || 0),
                                    revenue: Number(row.revenue || 0),
                                  }));

                                  db.query(
                                    `
                                    SELECT 
                                      o.id AS order_id,
                                      o.total,
                                      o.order_type,
                                      o.status,
                                      o.created_at,
                                      u.name AS user_name
                                    FROM orders o
                                    LEFT JOIN users u ON u.id = o.user_id
                                    ORDER BY o.created_at DESC
                                    LIMIT 5
                                    `,
                                    (err9, latestOrders) => {
                                      if (err9) return res.status(500).json({ error: err9.message });

                                      res.json({
                                        ...stats,
                                        latest_orders: latestOrders,
                                      });
                                    }
                                  );
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};
module.exports = {
  getDishes,
  addDish,
  updateDish,
  deleteDish,
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
  getDashboardStats,
};