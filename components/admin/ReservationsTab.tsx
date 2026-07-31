"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface Reservation {
  _id: string;
  customerName: string;
  phone: string;
  email: string;
  reservationDate: string;
  reservationTime: string;
  numberOfPeople: number;
  specialRequests: string;
  status: string;
}

const STATUSES = ["pending", "confirmed", "cancelled", "completed"] as const;

export default function ReservationsTab() {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/reservations");
    const data = await res.json();
    if (Array.isArray(data)) setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/reservations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm(t("deleteReservation"))) return;
    await fetch(`/api/reservations/${id}`, { method: "DELETE" });
    await load();
  }

  function statusLabel(status: string) {
    const key = `statuses.${status}` as
      | "statuses.pending"
      | "statuses.confirmed"
      | "statuses.cancelled"
      | "statuses.completed";
    try {
      return t(key);
    } catch {
      return status;
    }
  }

  if (loading) return <p className="admin-muted">{tc("loading")}</p>;

  return (
    <div className="text-dolce-text dark:text-[#f5e6d3]">
      <p className="admin-muted mb-4">
        {t("reservationsCount", { count: items.length })}
      </p>

      {items.length === 0 ? (
        <p className="admin-card p-8 text-center text-dolce-text/70 dark:text-white/60">
          {t("noReservations")}
        </p>
      ) : (
        <div className="admin-table-wrap">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="admin-thead">
              <tr>
                <th className="px-4 py-3 font-semibold">{t("name")}</th>
                <th className="px-4 py-3 font-semibold">{tc("phone")}</th>
                <th className="px-4 py-3 font-semibold">{t("date")}</th>
                <th className="px-4 py-3 font-semibold">{t("time")}</th>
                <th className="px-4 py-3 font-semibold">{t("guests")}</th>
                <th className="px-4 py-3 font-semibold">{t("status")}</th>
                <th className="px-4 py-3 font-semibold">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r._id} className="admin-row">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.customerName}</div>
                    {r.specialRequests && (
                      <div className="mt-0.5 text-xs text-dolce-text/55 dark:text-white/45">
                        {r.specialRequests}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">{r.phone}</td>
                  <td className="px-4 py-3">{r.reservationDate}</td>
                  <td className="px-4 py-3">{r.reservationTime}</td>
                  <td className="px-4 py-3">{r.numberOfPeople}</td>
                  <td className="px-4 py-3">
                    <select
                      className="admin-select"
                      value={r.status}
                      onChange={(e) => updateStatus(r._id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(r._id)}
                      className="rounded-lg p-1.5 text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                      aria-label={tc("delete")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
