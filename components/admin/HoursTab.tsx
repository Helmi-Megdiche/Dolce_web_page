"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Clock, Copy, Moon } from "lucide-react";

interface Hour {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function buildTimeOptions() {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 15, 30, 45]) {
      slots.push(
        `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
      );
    }
  }
  return slots;
}

function withCurrentValue(options: string[], value: string) {
  if (!value || options.includes(value)) return options;
  return [...options, value].sort();
}

export default function HoursTab() {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [hours, setHours] = useState<Hour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageOk, setMessageOk] = useState(false);
  const baseOptions = useMemo(() => buildTimeOptions(), []);

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

  function applyMondayToWeekdays() {
    const monday = hours.find((h) => h.day === "Monday");
    if (!monday) return;
    setHours((prev) =>
      prev.map((h) =>
        WEEKDAYS.includes(h.day)
          ? {
              ...h,
              openTime: monday.openTime,
              closeTime: monday.closeTime,
              isClosed: monday.isClosed,
            }
          : h
      )
    );
  }

  function applyFirstOpenToAll() {
    const source = hours.find((h) => !h.isClosed) || hours[0];
    if (!source) return;
    setHours((prev) =>
      prev.map((h) => ({
        ...h,
        openTime: source.openTime,
        closeTime: source.closeTime,
        isClosed: false,
      }))
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
        setMessageOk(false);
        setMessage(t("saveFailed"));
        return;
      }
      setMessageOk(true);
      setMessage(t("hoursSaved"));
    } catch {
      setMessageOk(false);
      setMessage(t("saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  function dayLabel(day: string) {
    const key = `days.${day}` as
      | "days.Monday"
      | "days.Tuesday"
      | "days.Wednesday"
      | "days.Thursday"
      | "days.Friday"
      | "days.Saturday"
      | "days.Sunday";
    try {
      return t(key);
    } catch {
      return day;
    }
  }

  function dayShort(day: string) {
    return dayLabel(day).slice(0, 3);
  }

  if (loading) return <p className="admin-muted">{tc("loading")}</p>;

  return (
    <div className="text-dolce-text dark:text-[#f5e6d3]">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="admin-muted">{t("hoursHint")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={applyMondayToWeekdays}
              className="inline-flex items-center gap-1.5 rounded-full border border-dolce-secondary/80 bg-white px-3 py-1.5 text-xs font-medium text-dolce-text transition hover:border-dolce-accent hover:bg-dolce-secondary/40 dark:border-white/15 dark:bg-[#241912] dark:text-[#f5e6d3] dark:hover:border-dolce-accent dark:hover:bg-white/5"
            >
              <Copy size={13} />
              {t("applyWeekdays")}
            </button>
            <button
              type="button"
              onClick={applyFirstOpenToAll}
              className="inline-flex items-center gap-1.5 rounded-full border border-dolce-secondary/80 bg-white px-3 py-1.5 text-xs font-medium text-dolce-text transition hover:border-dolce-accent hover:bg-dolce-secondary/40 dark:border-white/15 dark:bg-[#241912] dark:text-[#f5e6d3] dark:hover:border-dolce-accent dark:hover:bg-white/5"
            >
              <Clock size={13} />
              {t("applyAllDays")}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-primary shrink-0 self-start text-sm"
        >
          {saving ? tc("saving") : t("saveAll")}
        </button>
      </div>

      {message && (
        <p
          className={`mb-4 ${messageOk ? "admin-alert-success" : "admin-alert-error"}`}
        >
          {message}
        </p>
      )}

      <div className="admin-card overflow-hidden">
        <div className="hidden grid-cols-[9rem_1fr_auto] gap-4 border-b border-dolce-secondary/50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-dolce-text/50 dark:border-white/10 dark:text-white/40 md:grid">
          <span>{t("day")}</span>
          <span>{t("schedule")}</span>
          <span className="text-right">{t("status")}</span>
        </div>

        <ul className="divide-y divide-dolce-secondary/40 dark:divide-white/10">
          {hours.map((h, i) => {
            const openOptions = withCurrentValue(baseOptions, h.openTime);
            const closeOptions = withCurrentValue(baseOptions, h.closeTime);

            return (
              <li
                key={h.day}
                className={`grid grid-cols-1 gap-4 px-4 py-4 transition md:grid-cols-[9rem_1fr_auto] md:items-center md:gap-4 md:px-5 ${
                  h.isClosed
                    ? "bg-dolce-secondary/20 dark:bg-black/20"
                    : "bg-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold uppercase tracking-wide ${
                      h.isClosed
                        ? "bg-dolce-text/10 text-dolce-text/45 dark:bg-white/5 dark:text-white/35"
                        : "bg-dolce-primary/15 text-dolce-primary dark:bg-dolce-accent/20 dark:text-dolce-accent"
                    }`}
                  >
                    {dayShort(h.day)}
                  </span>
                  <div>
                    <p
                      className={`font-medium ${
                        h.isClosed
                          ? "text-dolce-text/50 dark:text-white/40"
                          : "text-dolce-text dark:text-[#f5e6d3]"
                      }`}
                    >
                      {dayLabel(h.day)}
                    </p>
                    <p className="text-xs text-dolce-text/45 dark:text-white/35 md:hidden">
                      {h.isClosed
                        ? tc("closed")
                        : `${h.openTime} – ${h.closeTime}`}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex flex-wrap items-end gap-2 sm:gap-3 ${
                    h.isClosed ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  <label className="min-w-[7.5rem] flex-1 sm:flex-none">
                    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-dolce-text/45 dark:text-white/35">
                      {t("opens")}
                    </span>
                    <select
                      value={h.openTime}
                      disabled={h.isClosed}
                      onChange={(e) => update(i, { openTime: e.target.value })}
                      className="input-field min-h-0 py-2.5 text-sm"
                      aria-label={`${dayLabel(h.day)} ${t("opens")}`}
                    >
                      {openOptions.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </label>

                  <span
                    className="mb-3 hidden text-dolce-accent sm:inline"
                    aria-hidden
                  >
                    –
                  </span>

                  <label className="min-w-[7.5rem] flex-1 sm:flex-none">
                    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-dolce-text/45 dark:text-white/35">
                      {t("closes")}
                    </span>
                    <select
                      value={h.closeTime}
                      disabled={h.isClosed}
                      onChange={(e) => update(i, { closeTime: e.target.value })}
                      className="input-field min-h-0 py-2.5 text-sm"
                      aria-label={`${dayLabel(h.day)} ${t("closes")}`}
                    >
                      {closeOptions.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </label>

                  {h.isClosed && (
                    <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-dolce-text/10 px-3 py-1.5 text-xs font-medium text-dolce-text/55 dark:bg-white/5 dark:text-white/45">
                      <Moon size={12} />
                      {tc("closed")}
                    </span>
                  )}
                </div>

                <div className="flex md:justify-end">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!h.isClosed}
                    onClick={() => update(i, { isClosed: !h.isClosed })}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
                      h.isClosed
                        ? "bg-dolce-text/10 text-dolce-text/60 hover:bg-dolce-text/15 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10"
                        : "bg-dolce-primary/15 text-dolce-primary hover:bg-dolce-primary/25 dark:bg-dolce-accent/15 dark:text-dolce-accent dark:hover:bg-dolce-accent/25"
                    }`}
                  >
                    <span
                      className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                        h.isClosed
                          ? "bg-dolce-text/25 dark:bg-white/20"
                          : "bg-dolce-primary dark:bg-dolce-accent"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                          h.isClosed ? "left-0.5" : "left-[1.125rem]"
                        }`}
                      />
                    </span>
                    {h.isClosed ? tc("closed") : t("dayOpen")}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
