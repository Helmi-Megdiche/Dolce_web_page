"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsDownUp, ChevronsUpDown, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

interface ReclamationItem {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  message: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

export default function ReclamationsTab() {
  const t = useTranslations("admin");
  const tr = useTranslations("admin.reclamationsPanel");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [items, setItems] = useState<ReclamationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/reclamations");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("saveFailed"));
        return;
      }
      if (Array.isArray(data)) setItems(data);
    } catch {
      setError(t("saveFailed"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(
    id: string,
    status: "resolved" | "dismissed" | "pending"
  ) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/reclamations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || t("saveFailed"));
        return;
      }
      await load();
    } catch {
      setError(t("saveFailed"));
    } finally {
      setUpdatingId(null);
    }
  }

  function formatDate(value: string) {
    try {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value));
    } catch {
      return value;
    }
  }

  function contactLabel(item: ReclamationItem) {
    const name = item.name?.trim();
    const email = item.email?.trim();
    const phone = item.phone?.trim();
    if (!name && !email && !phone) return tr("anonymous");
    return (
      <div>
        <p className="font-medium">{name || tr("anonymous")}</p>
        {email && (
          <p className="text-xs text-dolce-text/55 dark:text-white/45">
            {email}
          </p>
        )}
        {phone && (
          <p className="text-xs text-dolce-text/55 dark:text-white/45">
            {phone}
          </p>
        )}
      </div>
    );
  }

  function statusBadge(status: ReclamationItem["status"]) {
    const styles = {
      pending:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
      resolved:
        "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
      dismissed:
        "bg-neutral-200 text-neutral-700 dark:bg-white/10 dark:text-white/60",
    } as const;

    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
      >
        {tr(status)}
      </span>
    );
  }

  if (loading) return <p className="admin-muted">{tc("loading")}</p>;

  return (
    <div className="text-dolce-text dark:text-[#f5e6d3]">
      <p className="admin-muted mb-4">
        {tr("count", { count: items.length })}
      </p>

      {error && <p className="admin-alert-error mb-4">{error}</p>}

      {items.length === 0 ? (
        <p className="admin-card p-8 text-center text-dolce-text/70 dark:text-white/60">
          {tr("noData")}
        </p>
      ) : (
        <div className="admin-table-wrap">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="admin-thead">
              <tr>
                <th className="px-4 py-3 font-semibold">{tr("date")}</th>
                <th className="px-4 py-3 font-semibold">{tr("contact")}</th>
                <th className="px-4 py-3 font-semibold">{tr("messageCol")}</th>
                <th className="px-4 py-3 font-semibold">{t("status")}</th>
                <th className="px-4 py-3 font-semibold">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isLong = item.message.length > 140;
                const isOpen = !!expanded[item._id];
                const shown =
                  isLong && !isOpen
                    ? `${item.message.slice(0, 140).trim()}…`
                    : item.message;

                return (
                  <tr key={item._id} className="admin-row align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-dolce-text/80 dark:text-white/70">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-3">{contactLabel(item)}</td>
                    <td className="max-w-md px-4 py-3">
                      <p className="whitespace-pre-wrap text-dolce-text dark:text-[#f5e6d3]">
                        {shown}
                      </p>
                      {isLong && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded((prev) => ({
                              ...prev,
                              [item._id]: !prev[item._id],
                            }))
                          }
                          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-dolce-primary hover:underline dark:text-dolce-accent"
                        >
                          {isOpen ? (
                            <>
                              <ChevronsDownUp size={12} />
                              {tr("seeLess")}
                            </>
                          ) : (
                            <>
                              <ChevronsUpDown size={12} />
                              {tr("seeMore")}
                            </>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">{statusBadge(item.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {item.status !== "resolved" && (
                          <button
                            type="button"
                            disabled={updatingId === item._id}
                            onClick={() => updateStatus(item._id, "resolved")}
                            className="inline-flex items-center gap-1 rounded-full bg-green-600/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                          >
                            <Check size={13} />
                            {tr("markResolved")}
                          </button>
                        )}
                        {item.status !== "dismissed" && (
                          <button
                            type="button"
                            disabled={updatingId === item._id}
                            onClick={() => updateStatus(item._id, "dismissed")}
                            className="inline-flex items-center gap-1 rounded-full border border-dolce-secondary px-3 py-1.5 text-xs font-semibold text-dolce-text/70 transition hover:bg-dolce-secondary/50 disabled:opacity-50 dark:border-white/15 dark:text-white/60 dark:hover:bg-white/10"
                          >
                            <X size={13} />
                            {tr("dismiss")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
