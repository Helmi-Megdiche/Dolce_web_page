"use client";

import { useEffect, useState } from "react";

interface Hour {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export default function HoursTab() {
  const [hours, setHours] = useState<Hour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/hours")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setHours(data);
      })
      .finally(() => setLoading(false));
  }, []);

  function update(index: number, patch: Partial<Hour>) {
    setHours((prev) =>
      prev.map((h, i) => (i === index ? { ...h, ...patch } : h))
    );
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hours),
      });
      if (!res.ok) {
        setMessage("Failed to save");
        return;
      }
      setMessage("Hours saved successfully");
    } catch {
      setMessage("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-dolce-text/60">Loading…</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-dolce-text/60">Opening hours for each day</p>
        <button type="button" onClick={save} disabled={saving} className="btn-primary text-sm">
          {saving ? "Saving…" : "Save all"}
        </button>
      </div>

      {message && (
        <p
          className={`mb-4 rounded-lg px-3 py-2 text-sm ${
            message.includes("success")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </p>
      )}

      <div className="space-y-3">
        {hours.map((h, i) => (
          <div
            key={h.day}
            className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-dolce-secondary/50"
          >
            <span className="w-28 font-medium">{h.day}</span>
            <input
              type="time"
              className="input-field max-w-[140px]"
              value={h.openTime}
              disabled={h.isClosed}
              onChange={(e) => update(i, { openTime: e.target.value })}
            />
            <span className="text-dolce-text/40">–</span>
            <input
              type="time"
              className="input-field max-w-[140px]"
              value={h.closeTime}
              disabled={h.isClosed}
              onChange={(e) => update(i, { closeTime: e.target.value })}
            />
            <label className="ml-auto flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={h.isClosed}
                onChange={(e) => update(i, { isClosed: e.target.checked })}
              />
              Closed
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
