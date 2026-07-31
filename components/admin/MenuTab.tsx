"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import ImageUploadField from "@/components/ui/ImageUploadField";

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

const CATEGORIES = ["Boxes", "Pancakes", "Bubble", "Crêpe", "Drinks"] as const;

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "Crêpe",
  imageUrl: "",
  isAvailable: true,
};

export default function MenuTab() {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
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

  function nextOrder() {
    if (items.length === 0) return 1;
    return Math.max(...items.map((i) => i.displayOrder || 0)) + 1;
  }

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
        setMessage(data.error || t("saveFailed"));
        return;
      }
      setShowForm(false);
      await load();
    } catch {
      setMessage(t("saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t("deleteMenuItem"))) return;
    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    await load();
  }

  function categoryLabel(category: string) {
    const key = `categories.${category}` as
      | "categories.Boxes"
      | "categories.Pancakes"
      | "categories.Bubble"
      | "categories.Crêpe"
      | "categories.Drinks";
    try {
      return t(key);
    } catch {
      return category;
    }
  }

  return (
    <div className="text-dolce-text dark:text-[#f5e6d3]">
      <div className="mb-4 flex items-center justify-between">
        <p className="admin-muted">{t("itemsCount", { count: items.length })}</p>
        <button type="button" onClick={openCreate} className="btn-primary text-sm">
          <Plus size={16} /> {t("addItem")}
        </button>
      </div>

      {message && <p className="admin-alert-error mb-4">{message}</p>}

      {loading ? (
        <p className="admin-muted">{tc("loading")}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="admin-thead">
              <tr>
                <th className="px-4 py-3 font-semibold">{t("name")}</th>
                <th className="px-4 py-3 font-semibold">{t("category")}</th>
                <th className="px-4 py-3 font-semibold">{t("price")}</th>
                <th className="px-4 py-3 font-semibold">{t("order")}</th>
                <th className="px-4 py-3 font-semibold">{t("status")}</th>
                <th className="px-4 py-3 font-semibold">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="admin-row">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">{categoryLabel(item.category)}</td>
                  <td className="px-4 py-3">{item.price} DT</td>
                  <td className="px-4 py-3">{item.displayOrder}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        item.isAvailable
                          ? "font-medium text-green-700 dark:text-green-400"
                          : "font-medium text-red-600 dark:text-red-400"
                      }
                    >
                      {item.isAvailable ? t("available") : t("hidden")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="admin-icon-btn"
                        aria-label={tc("edit")}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="rounded-lg p-1.5 text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                        aria-label={tc("delete")}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]">
          <div className="admin-card max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-playfair text-xl font-semibold">
                {editing ? t("editItem") : t("newItem")}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="admin-icon-btn"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="input-field"
                placeholder={t("name")}
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <textarea
                className="input-field resize-none"
                placeholder={t("description")}
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
                  placeholder={t("price")}
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
                      {categoryLabel(c)}
                    </option>
                  ))}
                </select>
              </div>
              <ImageUploadField
                value={form.imageUrl}
                disabled={saving}
                onChange={(imageUrl) => setForm({ ...form, imageUrl })}
              />
              <p className="rounded-xl border border-dolce-secondary/60 bg-dolce-secondary/30 px-4 py-3 text-sm text-dolce-text/80 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                {t("displayOrderAuto", {
                  order: editing ? editing.displayOrder : nextOrder(),
                })}
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) =>
                    setForm({ ...form, isAvailable: e.target.checked })
                  }
                />
                {t("available")}
              </label>
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? tc("saving") : tc("save")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
