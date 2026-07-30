"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  displayOrder: number;
}

const CATEGORIES = ["Boxes", "Pancakes", "Bubble", "Crêpe", "Drinks"];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "Crêpe",
  imageUrl: "",
  isAvailable: true,
  displayOrder: "0",
};

export default function MenuTab() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/menu");
    const data = await res.json();
    if (Array.isArray(data)) setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(item: MenuItem) {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      category: item.category,
      imageUrl: item.imageUrl || "",
      isAvailable: item.isAvailable,
      displayOrder: String(item.displayOrder ?? 0),
    });
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      imageUrl: form.imageUrl,
      isAvailable: form.isAvailable,
      displayOrder: Number(form.displayOrder) || 0,
    };

    try {
      const res = await fetch(
        editing ? `/api/menu/${editing._id}` : "/api/menu",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error || "Save failed");
        return;
      }
      setShowForm(false);
      await load();
    } catch {
      setMessage("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this menu item?")) return;
    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-dolce-text/60">{items.length} items</p>
        <button type="button" onClick={openCreate} className="btn-primary text-sm">
          <Plus size={16} /> Add item
        </button>
      </div>

      {message && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-dolce-text/60">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-dolce-secondary/50">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-dolce-secondary bg-dolce-secondary/40">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-b border-dolce-secondary/40">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3">{item.price} DT</td>
                  <td className="px-4 py-3">{item.displayOrder}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        item.isAvailable ? "text-green-700" : "text-red-600"
                      }
                    >
                      {item.isAvailable ? "Available" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="rounded-lg p-1.5 hover:bg-dolce-secondary"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-playfair text-xl font-semibold">
                {editing ? "Edit item" : "New item"}
              </h2>
              <button type="button" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="input-field"
                placeholder="Name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <textarea
                className="input-field resize-none"
                placeholder="Description"
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="input-field"
                  type="number"
                  step="0.1"
                  placeholder="Price"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
                <select
                  className="input-field"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <input
                className="input-field"
                placeholder="Image URL"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
              <input
                className="input-field"
                type="number"
                placeholder="Display order"
                value={form.displayOrder}
                onChange={(e) =>
                  setForm({ ...form, displayOrder: e.target.value })
                }
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) =>
                    setForm({ ...form, isAvailable: e.target.checked })
                  }
                />
                Available
              </label>
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? "Saving…" : "Save"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
