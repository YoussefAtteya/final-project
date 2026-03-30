import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Form, Modal, Spinner, Table } from "react-bootstrap";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  is_featured: false,
  image: null,
};

export default function AdminDishes() {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState(emptyForm);

  const [editingDish, setEditingDish] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [showEditModal, setShowEditModal] = useState(false);

  const hasCategories = categories.length > 0;

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [dishesRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/dishes`, {
          credentials: "include",
        }),
        fetch(`${API_BASE}/api/admin/categories`, {
          credentials: "include",
        }),
      ]);

      const dishesData = await dishesRes.json().catch(() => []);
      const categoriesData = await categoriesRes.json().catch(() => []);

      if (!dishesRes.ok) {
        throw new Error(dishesData?.error || "Failed to load dishes.");
      }

      if (!categoriesRes.ok) {
        throw new Error(categoriesData?.error || "Failed to load categories.");
      }

      setDishes(Array.isArray(dishesData) ? dishesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      setError(err.message || "Failed to load admin dishes data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files?.[0] || null
          : value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files?.[0] || null
          : value,
    }));
  };

  const resetCreateForm = () => {
    setForm(emptyForm);
  };

  const openEditModal = (dish) => {
    setEditingDish(dish);
    setEditForm({
      name: dish.name || "",
      description: dish.description || "",
      price: dish.price ?? "",
      category_id: dish.category_id ?? "",
      is_featured: Boolean(dish.is_featured),
      image: null,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditingDish(null);
    setEditForm(emptyForm);
    setShowEditModal(false);
  };

  const buildDishFormData = (values) => {
    const fd = new FormData();
    fd.append("name", values.name);
    fd.append("description", values.description || "");
    fd.append("price", values.price);
    fd.append("category_id", values.category_id);
    fd.append("is_featured", values.is_featured ? "1" : "0");

    if (values.image) {
      fd.append("image", values.image);
    }

    return fd;
  };

  const handleCreateDish = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.price || !form.category_id) {
      setError("Name, price, and category are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const res = await fetch(`${API_BASE}/api/admin/dishes`, {
        method: "POST",
        credentials: "include",
        body: buildDishFormData({
          ...form,
          name: form.name.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.error ||
            data?.errors?.[0]?.msg ||
            "Failed to add dish."
        );
      }

      setSuccess("Dish added successfully.");
      resetCreateForm();
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to add dish.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateDish = async (e) => {
    e.preventDefault();

    if (!editingDish) return;

    if (!editForm.name.trim() || !editForm.price || !editForm.category_id) {
      setError("Name, price, and category are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const res = await fetch(`${API_BASE}/api/admin/dishes/${editingDish.id}`, {
        method: "PUT",
        credentials: "include",
        body: buildDishFormData({
          ...editForm,
          name: editForm.name.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.error ||
            data?.errors?.[0]?.msg ||
            "Failed to update dish."
        );
      }

      setSuccess("Dish updated successfully.");
      closeEditModal();
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to update dish.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDish = async (dishId) => {
    const ok = window.confirm("Delete this dish?");
    if (!ok) return;

    try {
      setError("");
      setSuccess("");

      const res = await fetch(`${API_BASE}/api/admin/dishes/${dishId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete dish.");
      }

      setSuccess("Dish deleted successfully.");
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to delete dish.");
    }
  };

  const handleSetTodaySpecial = async (dishId) => {
    try {
      setError("");
      setSuccess("");

      const res = await fetch(`${API_BASE}/api/admin/special/${dishId}`, {
        method: "PUT",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to update today special.");
      }

      setSuccess("Today special updated.");
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to update today special.");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Menu Items</h1>
        <p>Add, edit, remove, and manage dishes.</p>
      </div>

      {error && (
        <Alert variant="danger" className="rounded-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="rounded-4">
          {success}
        </Alert>
      )}

      <div className="admin-card mb-4">
        <h3 className="mb-4">Add New Dish</h3>

        {!hasCategories && !loading && (
          <Alert variant="warning" className="rounded-4">
            You need at least one category before adding dishes.
          </Alert>
        )}

        <Form onSubmit={handleCreateDish}>
          <div className="admin-form-grid">
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={form.name}
                onChange={handleCreateChange}
                placeholder="Dish name"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Price</Form.Label>
              <Form.Control
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleCreateChange}
                placeholder="0.00"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category_id"
                value={form.category_id}
                onChange={handleCreateChange}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Image</Form.Label>
              <Form.Control
                name="image"
                type="file"
                accept="image/*"
                onChange={handleCreateChange}
              />
            </Form.Group>

            <Form.Group className="admin-form-col-full">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={form.description}
                onChange={handleCreateChange}
                placeholder="Dish description"
              />
            </Form.Group>

            <Form.Group className="admin-form-col-full">
              <Form.Check
                type="checkbox"
                label="Featured item"
                name="is_featured"
                checked={form.is_featured}
                onChange={handleCreateChange}
              />
            </Form.Group>
          </div>

          <div className="d-flex gap-2 mt-4">
            <Button
              type="submit"
              className="btn-order"
              disabled={saving || !hasCategories}
            >
              {saving ? "Saving..." : "Add Dish"}
            </Button>

            <Button
              type="button"
              variant="outline-secondary"
              onClick={resetCreateForm}
              disabled={saving}
            >
              Reset
            </Button>
          </div>
        </Form>
      </div>

      <div className="admin-card">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h3 className="mb-0">All Dishes</h3>
          {loading && <Spinner size="sm" />}
        </div>

        <div className="table-responsive">
          <Table hover className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Featured</th>
                <th>Special</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {!loading && dishes.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No dishes found.
                  </td>
                </tr>
              )}

              {dishes.map((dish) => (
                <tr key={dish.id}>
                  <td>{dish.id}</td>

                  <td>
                    {dish.image ? (
                      <img
                        src={`${API_BASE}${dish.image}`}
                        alt={dish.name}
                        className="admin-dish-thumb"
                      />
                    ) : (
                      <div className="admin-dish-thumb placeholder-thumb">No image</div>
                    )}
                  </td>

                  <td>
                    <div className="fw-bold">{dish.name}</div>
                    <div className="small text-muted">
                      {dish.description || "No description"}
                    </div>
                  </td>

                  <td>{dish.category_name || categoryMap[dish.category_id] || "-"}</td>
                  <td>${Number(dish.price || 0).toFixed(2)}</td>
                  <td>{dish.is_featured ? "Yes" : "No"}</td>
                  <td>{dish.is_special ? "Yes" : "No"}</td>

                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline-dark"
                        onClick={() => openEditModal(dish)}
                      >
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="outline-warning"
                        onClick={() => handleSetTodaySpecial(dish.id)}
                      >
                        Set Special
                      </Button>

                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDeleteDish(dish.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      <Modal show={showEditModal} onHide={closeEditModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Dish</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleUpdateDish}>
          <Modal.Body>
            <div className="admin-form-grid">
              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  placeholder="Dish name"
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Price</Form.Label>
                <Form.Control
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.price}
                  onChange={handleEditChange}
                  placeholder="0.00"
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category_id"
                  value={editForm.category_id}
                  onChange={handleEditChange}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label>Replace image</Form.Label>
                <Form.Control
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleEditChange}
                />
              </Form.Group>

              <Form.Group className="admin-form-col-full">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  placeholder="Dish description"
                />
              </Form.Group>

              <Form.Group className="admin-form-col-full">
                <Form.Check
                  type="checkbox"
                  label="Featured item"
                  name="is_featured"
                  checked={editForm.is_featured}
                  onChange={handleEditChange}
                />
              </Form.Group>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="outline-secondary" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button type="submit" className="btn-order" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}