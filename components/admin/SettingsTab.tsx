"use client";

import { useEffect, useState } from "react";

const KEYS = [
  "hero_title",
  "hero_subtitle",
  "phone",
  "address",
  "instagram_url",
  "tiktok_url",
  "facebook_url",
  "glovo_url",
  "rating",
  "price_range",
];

const LABELS: Record<string, string> = {
  hero_title: "Hero title",
  hero_subtitle: "Hero subtitle",
  phone: "Phone",
  address: "Address",
  instagram_url: "Instagram URL",
  tiktok_url: "TikTok URL",
  facebook_url: "Facebook URL",
  glovo_url: "Glovo URL",
  rating: "Rating",
  price_range: "Price range",
};

export default function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") setSettings(data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const payload: Record<string, string> = {};
      KEYS.forEach((k) => {
        payload[k] = settings[k] || "";
      });
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setMessage("Failed to save");
        return;
      }
      setMessage("Settings saved successfully");
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
        <p className="text-sm text-dolce-text/60">Site content & links</p>
        <button type="button" onClick={save} disabled={saving} className="btn-primary text-sm">
          {saving ? "Saving…" : "Save settings"}
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

      <div className="space-y-4 rounded-xl bg-white p-6 ring-1 ring-dolce-secondary/50">
        {KEYS.map((key) => (
          <div key={key}>
            <label className="mb-1.5 block text-sm font-medium">
              {LABELS[key] || key}
            </label>
            {key === "hero_subtitle" || key === "address" ? (
              <textarea
                className="input-field resize-none"
                rows={2}
                value={settings[key] || ""}
                onChange={(e) =>
                  setSettings({ ...settings, [key]: e.target.value })
                }
              />
            ) : (
              <input
                className="input-field"
                value={settings[key] || ""}
                onChange={(e) =>
                  setSettings({ ...settings, [key]: e.target.value })
                }
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
