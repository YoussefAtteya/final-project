import { useEffect, useState } from "react";
import { Alert, Button, Form, Spinner } from "react-bootstrap";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSettings = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/settings`);
      const data = await res.json();

      setSettings(data);
    } catch (err) {
      setError("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings.");
      }

      setSuccess("Settings updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="admin-page">

      <div className="admin-page-head">
        <h1>Settings</h1>
        <p>Restaurant opening hours, delivery fee, and contact info.</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <div className="admin-card">
        <Form onSubmit={handleSave}>

          <div className="admin-form-grid">

            <Form.Group>
              <Form.Label>Opening Time</Form.Label>
              <Form.Control
                type="time"
                name="opening_time"
                value={settings?.opening_time || ""}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Closing Time</Form.Label>
              <Form.Control
                type="time"
                name="closing_time"
                value={settings?.closing_time || ""}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Delivery Fee ($)</Form.Label>
              <Form.Control
                type="number"
                name="delivery_fee"
                value={settings?.delivery_fee || ""}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Phone</Form.Label>
              <Form.Control
                name="phone"
                value={settings?.phone || ""}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="liveStatus"
                value={settings?.liveStatus || ""}
                onChange={handleChange}
              >
                <option value="Open Now">Open Now</option>
                <option value="Closed">Closed</option>
                <option value="On Holiday">Holiday</option>
              </Form.Select>
            </Form.Group>

          </div>

          <Button className="btn-order mt-4" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>

        </Form>
      </div>

    </div>
  );
}