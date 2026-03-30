import { useEffect, useState } from "react";
import { Table, Button, Form, Modal } from "react-bootstrap";

export default function AdminAddons() {

  const [addons, setAddons] = useState([]);
  const [show, setShow] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const fetchAddons = async () => {
    const res = await fetch("/api/admin/addons");
    const data = await res.json();
    setAddons(data);
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  const addAddon = async () => {
    await fetch("/api/admin/addons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        price,
      }),
    });

    setShow(false);
    setName("");
    setPrice("");

    fetchAddons();
  };

  const deleteAddon = async (id) => {
    await fetch(`/api/admin/addons/${id}`, {
      method: "DELETE",
    });

    fetchAddons();
  };

  return (
    <div>

      <h3>Addons</h3>

      <Button onClick={() => setShow(true)}>
        Add Addon
      </Button>

      <Table striped bordered hover className="mt-3">

        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {addons.map((addon) => (
            <tr key={addon.id}>
              <td>{addon.id}</td>
              <td>{addon.name}</td>
              <td>${addon.price}</td>

              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteAddon(addon.id)}
                >
                  Delete
                </Button>
              </td>

            </tr>
          ))}
        </tbody>

      </Table>


      <Modal show={show} onHide={() => setShow(false)}>

        <Modal.Header closeButton>
          <Modal.Title>Add Addon</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <Form>

            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>

              <Form.Control
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Price</Form.Label>

              <Form.Control
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Form.Group>

          </Form>

        </Modal.Body>

        <Modal.Footer>

          <Button
            variant="secondary"
            onClick={() => setShow(false)}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={addAddon}
          >
            Save
          </Button>

        </Modal.Footer>

      </Modal>

    </div>
  );
}