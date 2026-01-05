import { useEffect, useState } from "react";
import usePageTitle from "../../hooks/usePageTitle";

const initialForm = {
  name: "",
  description: "",
  price: "",
  stock_quantity: "",
  image: null,
};

const MangoCategoryAdmin = () => {
  usePageTitle("Manage Mangoes");

  const [mangoes, setMangoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [formError, setFormError] = useState("");

  const fetchMangoes = () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/api/mangoes/", {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => res.json())
      .then(setMangoes)
      .catch(() => setError("Failed to load mangoes"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMangoes();
    // eslint-disable-next-line
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this mango?")) return;
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8000/api/mangoes/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => {
        if (res.ok) fetchMangoes();
        else setError("Delete failed");
      })
      .catch(() => setError("Delete failed"));
  };

  const handleEdit = (mango) => {
    setEditId(mango.id);
    setForm({
      name: mango.name,
      description: mango.description,
      price: mango.price,
      stock_quantity: mango.stock_quantity,
      image: null,
    });
    setShowForm(true);
    setFormError("");
  };

  const handleAdd = () => {
    setEditId(null);
    setForm(initialForm);
    setShowForm(true);
    setFormError("");
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("stock_quantity", form.stock_quantity);
    if (form.image) formData.append("image", form.image);
    const url = editId
      ? `http://localhost:8000/api/mangoes/${editId}/`
      : "http://localhost:8000/api/mangoes/";
    fetch(url, {
      method: editId ? "PUT" : "POST",
      headers: {
        Authorization: `Token ${token}`,
      },
      body: formData,
    })
      .then(async (res) => {
        if (res.ok) {
          setShowForm(false);
          fetchMangoes();
        } else {
          const data = await res.json();
          setFormError(data.error || "Save failed");
        }
      })
      .catch(() => setFormError("Save failed"));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Mango Category Admin</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-2">Image</th>
            <th className="border px-2">Name</th>
            <th className="border px-2">Description</th>
            <th className="border px-2">Price</th>
            <th className="border px-2">Stock</th>
            <th className="border px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mangoes.map((mango) => (
            <tr key={mango.id}>
              <td className="border px-2 py-1">
                <img
                  src={mango.image}
                  alt={mango.name}
                  className="w-16 h-16 object-cover"
                />
              </td>
              <td className="border px-2">{mango.name}</td>
              <td className="border px-2">{mango.description}</td>
              <td className="border px-2">{mango.price}</td>
              <td className="border px-2">{mango.stock_quantity}</td>
              <td className="border px-2">
                <button
                  className="btn btn-xs btn-warning mr-2"
                  onClick={() => handleEdit(mango)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-xs btn-error"
                  onClick={() => handleDelete(mango.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-success mt-4" onClick={handleAdd}>
        Add New Mango
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-[#0000009c] backdrop-blur-sm flex items-center justify-center z-50">
          <form
            className="bg-white p-6 rounded shadow w-full max-w-md relative"
            onSubmit={handleFormSubmit}
            encType="multipart/form-data"
          >
            <h3 className="text-lg font-bold mb-4">
              {editId ? "Edit Mango" : "Add Mango"}
            </h3>
            {formError && <div className="text-red-600 mb-2">{formError}</div>}
            <div className="mb-2">
              <label className="block mb-1">Name</label>
              <input
                type="text"
                name="name"
                className="w-full border rounded px-2 py-1"
                value={form.name}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Description</label>
              <textarea
                name="description"
                className="w-full border rounded px-2 py-1"
                value={form.description}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Price</label>
              <input
                type="number"
                name="price"
                className="w-full border rounded px-2 py-1"
                value={form.price}
                onChange={handleFormChange}
                required
                step="0.01"
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Stock Quantity</label>
              <input
                type="number"
                name="stock_quantity"
                className="w-full border rounded px-2 py-1"
                value={form.stock_quantity}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Image</label>
              <input
                type="file"
                name="image"
                className="w-full"
                accept="image/*"
                onChange={handleFormChange}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-success">
                {editId ? "Update" : "Add"}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MangoCategoryAdmin;
