"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import ImageUploadField from "@/components/ui/ImageUploadField";
import DiscountLabelPicker from "@/components/admin/DiscountLabelPicker";

interface OfferItem {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  discountLabel?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isHighlighted: boolean;
  buttonText?: string;
  buttonLink?: string;
}

const emptyForm = {
  title: "",
  description: "",
  imageUrl: "",
  discountLabel: "",
  startDate: "",
  endDate: "",
  isActive: true,
  isHighlighted: false,
  buttonText: "",
};

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function OffersTab() {
  const t = useTranslations("admin");
  const to = useTranslations("admin.offersPanel");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [items, setItems] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<OfferItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageOk, setMessageOk] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/offers");
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setMessage("");
    setShowForm(true);
  }

  function openEdit(item: OfferItem) {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      discountLabel: item.discountLabel || "",
      startDate: toDatetimeLocal(item.startDate),
      endDate: toDatetimeLocal(item.endDate),
      isActive: item.isActive,
      isHighlighted: item.isHighlighted,
      buttonText: item.buttonText || "",
    });
    setMessage("");
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    if (!form.title.trim() || !form.startDate || !form.endDate) {
      setMessageOk(false);
      setMessage(to("requiredFields"));
      setSaving(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      discountLabel: form.discountLabel.trim(),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      isActive: form.isActive,
      isHighlighted: form.isHighlighted,
      buttonText: form.buttonText.trim() || to("buttonTextDefault"),
      // Always deep-link guests to Reservation with this offer attached
      buttonLink: "/reservation",
    };

    try {
      const res = await fetch(
        editing ? `/api/admin/offers/${editing._id}` : "/api/admin/offers",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessageOk(false);
        setMessage(data.error || t("saveFailed"));
        return;
      }
      setShowForm(false);
      setMessageOk(true);
      setMessage(editing ? to("updated") : to("created"));
      await load();
    } catch {
      setMessageOk(false);
      setMessage(t("saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(to("deleteConfirm"))) return;
    await fetch(`/api/admin/offers/${id}`, { method: "DELETE" });
    await load();
  }

  async function toggleActive(item: OfferItem) {
    await fetch(`/api/admin/offers/${item._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    await load();
  }

  function formatRange(start: string, end: string) {
    try {
      const fmt = new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      });
      return `${fmt.format(new Date(start))} → ${fmt.format(new Date(end))}`;
    } catch {
      return `${start} → ${end}`;
    }
  }

  return (
    <div className="text-dolce-text dark:text-[#f5e6d3]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="admin-muted">{to("subtitle")}</p>
          <p className="mt-1 text-xs text-dolce-text/45 dark:text-white/35">
            {to("count", { count: items.length })}
          </p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary text-sm">
          <Plus size={16} /> {to("create")}
        </button>
      </div>

      {message && (
        <p
          className={`mb-4 ${messageOk ? "admin-alert-success" : "admin-alert-error"}`}
        >
          {message}
        </p>
      )}

      {loading ? (
        <p className="admin-muted">{tc("loading")}</p>
      ) : items.length === 0 ? (
        <p className="admin-card p-8 text-center text-dolce-text/70 dark:text-white/60">
          {to("noOffers")}
        </p>
      ) : (
        <div className="admin-table-wrap">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="admin-thead">
              <tr>
                <th className="px-4 py-3 font-semibold">{to("titleCol")}</th>
                <th className="px-4 py-3 font-semibold">{to("dates")}</th>
                <th className="px-4 py-3 font-semibold">{t("status")}</th>
                <th className="px-4 py-3 font-semibold">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="admin-row">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="h-12 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-dolce-secondary text-xs text-dolce-primary dark:bg-white/10 dark:text-dolce-accent">
                          Dolce
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <div className="mt-0.5 flex flex-wrap gap-1.5">
                          {item.discountLabel && (
                            <span className="rounded-full bg-dolce-brand/25 px-2 py-0.5 text-[10px] font-semibold text-dolce-primary dark:text-dolce-accent">
                              {item.discountLabel}
                            </span>
                          )}
                          {item.isHighlighted && (
                            <span className="rounded-full bg-dolce-accent/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-dolce-primary dark:text-dolce-accent">
                              {to("highlighted")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-dolce-text/70 dark:text-white/60">
                    {formatRange(item.startDate, item.endDate)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                          : "bg-neutral-200 text-neutral-700 dark:bg-white/10 dark:text-white/55"
                      }`}
                    >
                      {item.isActive ? to("active") : to("inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
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
                        onClick={() => toggleActive(item)}
                        className="rounded-full border border-dolce-secondary px-2.5 py-1 text-xs font-semibold transition hover:bg-dolce-secondary/50 dark:border-white/15 dark:hover:bg-white/10"
                      >
                        {item.isActive ? to("deactivate") : to("activate")}
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
                {editing ? to("edit") : to("create")}
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
              <div>
                <label className="admin-label">{to("titleField")}</label>
                <input
                  className="input-field"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="admin-label">{tc("description")}</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <DiscountLabelPicker
                value={form.discountLabel}
                disabled={saving}
                onChange={(discountLabel) =>
                  setForm({ ...form, discountLabel })
                }
              />

              <ImageUploadField
                value={form.imageUrl}
                disabled={saving}
                onChange={(imageUrl) => setForm({ ...form, imageUrl })}
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="admin-label">{to("start")}</label>
                  <input
                    type="datetime-local"
                    required
                    className="input-datetime"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="admin-label">{to("end")}</label>
                  <input
                    type="datetime-local"
                    required
                    className="input-datetime"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">{to("buttonText")}</label>
                <div className="mb-2 flex flex-wrap gap-2">
                  {[
                    to("ctaBookOffer"),
                    to("ctaReserve"),
                    to("ctaSeeOffer"),
                  ].map((preset) => {
                    const active = form.buttonText === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() =>
                          setForm({ ...form, buttonText: preset })
                        }
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          active
                            ? "bg-dolce-primary text-white dark:bg-dolce-accent dark:text-dolce-text"
                            : "border border-dolce-secondary/80 bg-white text-dolce-text hover:border-dolce-accent dark:border-white/15 dark:bg-[#2a1f18] dark:text-[#f5e6d3]"
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
                <input
                  className="input-field"
                  placeholder={to("buttonTextPlaceholder")}
                  value={form.buttonText}
                  onChange={(e) =>
                    setForm({ ...form, buttonText: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-wrap gap-4 rounded-xl border border-dolce-secondary/60 bg-dolce-secondary/20 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                    className="accent-dolce-primary"
                  />
                  {to("active")}
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={form.isHighlighted}
                    onChange={(e) =>
                      setForm({ ...form, isHighlighted: e.target.checked })
                    }
                    className="accent-dolce-primary"
                  />
                  {to("highlighted")}
                </label>
              </div>

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
