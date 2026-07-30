"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

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

const STATUSES = ["pending", "confirmed", "cancelled", "completed"];

export default function ReservationsTab() {
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
    if (!confirm("Delete this reservation?")) return;
    await fetch(`/api/reservations/${id}`, { method: "DELETE" });
    await load();
  }

  if (loading) return <p className="text-dolce-text/60">Loading…</p>;

  return (
    <div>
      <p className="mb-4 text-sm text-dolce-text/60">
        {items.length} reservation{items.length !== 1 ? "s" : ""}
      </p>

      {items.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-dolce-text/60 ring-1 ring-dolce-secondary/50">
          No reservations yet
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-dolce-secondary/50">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-dolce-secondary bg-dolce-secondary/40">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r._id} className="border-b border-dolce-secondary/40">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.customerName}</div>
                    {r.specialRequests && (
                      <div className="mt-0.5 text-xs text-dolce-text/50">
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
                      className="rounded-lg border border-dolce-secondary px-2 py-1.5 text-sm"
                      value={r.status}
                      onChange={(e) => updateStatus(r._id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(r._id)}
                      className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
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
