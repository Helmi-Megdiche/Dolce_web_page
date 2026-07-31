"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { digitsOnly } from "@/lib/validation";

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
] as const;

export default function SettingsTab() {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageOk, setMessageOk] = useState(false);

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
        setMessageOk(false);
        setMessage(t("saveFailed"));
        return;
      }
      setMessageOk(true);
      setMessage(t("settingsSaved"));
    } catch {
      setMessageOk(false);
      setMessage(t("saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  function labelFor(key: (typeof KEYS)[number]) {
    return t(`settingLabels.${key}` as `settingLabels.${typeof key}`);
  }

  if (loading) return <p className="admin-muted">{tc("loading")}</p>;

  return (
    <div className="text-dolce-text dark:text-[#f5e6d3]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="admin-muted">{t("settingsHint")}</p>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-primary shrink-0 text-sm"
        >
          {saving ? tc("saving") : t("saveSettings")}
        </button>
      </div>

      {message && (
        <p className={`mb-4 ${messageOk ? "admin-alert-success" : "admin-alert-error"}`}>
          {message}
        </p>
      )}

      <div className="admin-card space-y-4 p-6">
        {KEYS.map((key) => (
          <div key={key}>
            <label className="admin-label">{labelFor(key)}</label>
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
                inputMode={key === "phone" ? "numeric" : undefined}
                value={settings[key] || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    [key]:
                      key === "phone"
                        ? digitsOnly(e.target.value)
                        : e.target.value,
                  })
                }
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
