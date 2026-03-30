import { useEffect, useState } from "react";
import { Alert, Button, Form, Modal, Spinner, Table } from "react-bootstrap";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newName, setNewName] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/admin/categories`, {
        credentials: "include",
      });

      const data = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load categories.");
      }

      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!newName.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const res = await fetch(`${API_BASE}/api/admin/categories`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newName.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to add category.");
      }

      setSuccess("Category added successfully.");
      setNewName("");
      await loadCategories();
    } catch (err) {
      setError(err.message || "Failed to add category.");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setEditName(category.name || "");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditingCategory(null);
    setEditName("");
    setShowEditModal(false);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    if (!editingCategory) return;

    if (!editName.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const res = await fetch(
        `${API_BASE}/api/admin/categories/${editingCategory.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editName.trim(),
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to update category.");
      }

      setSuccess("Category updated successfully.");
      closeEditModal();
      await loadCategories();
    } catch (err) {
      setError(err.message || "Failed to update category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const ok = window.confirm("Delete this category?");
    if (!ok) return;

    try {
      setError("");
      setSuccess("");

      const res = await fetch(`${API_BASE}/api/admin/categories/${categoryId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete category.");
      }

      setSuccess("Category deleted successfully.");
      await loadCategories();
    } catch (err) {
      setError(err.message || "Failed to delete category.");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Categories</h1>
        <p>Manage menu categories.</p>
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
        <h3 className="mb-4">Add New Category</h3>

        <Form onSubmit={handleAddCategory}>
          <div className="d-flex flex-column flex-md-row gap-3">
            <Form.Control
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category name"
            />

            <Button type="submit" className="btn-order" disabled={saving}>
              {saving ? "Saving..." : "Add Category"}
            </Button>
          </div>
        </Form>
      </div>

      <div className="admin-card">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h3 className="mb-0">All Categories</h3>
          {loading && <Spinner size="sm" />}
        </div>

        <div className="table-responsive">
          <Table hover className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {!loading && categories.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-muted">
                    No categories found.
                  </td>
                </tr>
              )}

              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td className="fw-semibold">{category.name}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline-dark"
                        onClick={() => openEditModal(category)}
                      >
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDeleteCategory(category.id)}
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

      <Modal show={showEditModal} onHide={closeEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Category</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleUpdateCategory}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Category name"
              />
            </Form.Group>
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