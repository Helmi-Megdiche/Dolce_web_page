"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Shield, Trash2, UserRound } from "lucide-react";
import FieldError, { fieldErrorClass } from "@/components/ui/FieldError";
import PasswordInput from "@/components/ui/PasswordInput";
import { isValidEmail } from "@/lib/validation";

type AdminAccount = {
  id: string;
  email: string;
  role: string;
  isCurrent: boolean;
};

function initials(email: string) {
  const local = email.split("@")[0] || "?";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export default function ProfileTab({ email }: { email: string }) {
  const t = useTranslations("admin");
  const ta = useTranslations("auth");
  const tc = useTranslations("common");

  const [pwdStatus, setPwdStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [pwdMessage, setPwdMessage] = useState("");
  const [pwdFieldError, setPwdFieldError] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addStatus, setAddStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [addMessage, setAddMessage] = useState("");
  const [addFieldErrors, setAddFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAdmins = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/accounts");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setAdmins(data);
    } finally {
      setAdminsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwdLoading(true);
    setPwdStatus("idle");
    setPwdMessage("");
    setPwdFieldError("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const oldPassword = String(data.get("oldPassword") || "");
    const newPassword = String(data.get("newPassword") || "");
    const confirm = String(data.get("confirm") || "");

    if (!oldPassword || !newPassword || !confirm) {
      setPwdFieldError(ta("passwordFieldsRequired"));
      setPwdLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPwdFieldError(ta("passwordMinLength"));
      setPwdLoading(false);
      return;
    }

    if (newPassword !== confirm) {
      setPwdFieldError(ta("passwordMismatch"));
      setPwdLoading(false);
      return;
    }

    if (oldPassword === newPassword) {
      setPwdFieldError(ta("passwordDifferent"));
      setPwdLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setPwdStatus("error");
        setPwdMessage(payload.error || ta("changePasswordFailed"));
        return;
      }

      setPwdStatus("success");
      setPwdMessage(t("passwordUpdated"));
      form.reset();
    } catch {
      setPwdStatus("error");
      setPwdMessage(ta("serverUnreachable"));
    } finally {
      setPwdLoading(false);
    }
  }

  async function handleAddAdmin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddLoading(true);
    setAddStatus("idle");
    setAddMessage("");
    setAddFieldErrors({});

    const form = e.currentTarget;
    const data = new FormData(form);
    const emailValue = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");
    const confirm = String(data.get("confirm") || "");

    const next: { email?: string; password?: string; confirm?: string } = {};
    if (!emailValue) next.email = tc("emailRequired");
    else if (!isValidEmail(emailValue)) next.email = tc("emailInvalid");
    if (!password) next.password = tc("fieldRequired");
    else if (password.length < 6) next.password = ta("passwordMinLength");
    if (!confirm) next.confirm = tc("fieldRequired");
    else if (password !== confirm) next.confirm = ta("passwordMismatch");

    if (Object.keys(next).length > 0) {
      setAddFieldErrors(next);
      setAddLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, password }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setAddStatus("error");
        setAddMessage(payload.error || t("adminCreateFailed"));
        return;
      }

      setAdmins((prev) =>
        [...prev, payload as AdminAccount].sort((a, b) =>
          a.email.localeCompare(b.email)
        )
      );
      setAddStatus("success");
      setAddMessage(t("adminCreated"));
      form.reset();
      setAddEmail("");
      setShowAddForm(false);
    } catch {
      setAddStatus("error");
      setAddMessage(ta("serverUnreachable"));
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDeleteAdmin(admin: AdminAccount) {
    if (admin.isCurrent) return;
    if (!window.confirm(t("deleteAdminConfirm", { email: admin.email }))) {
      return;
    }

    setDeletingId(admin.id);
    setAddStatus("idle");
    setAddMessage("");

    try {
      const res = await fetch(
        `/api/admin/accounts?id=${encodeURIComponent(admin.id)}`,
        { method: "DELETE" }
      );
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setAddStatus("error");
        setAddMessage(payload.error || t("adminDeleteFailed"));
        return;
      }

      setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
      setAddStatus("success");
      setAddMessage(t("adminDeleted"));
    } catch {
      setAddStatus("error");
      setAddMessage(ta("serverUnreachable"));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 text-dolce-text lg:grid-cols-2 lg:items-start dark:text-[#f5e6d3]">
      <div className="space-y-6">
        <div className="admin-card overflow-hidden">
          <div className="flex items-center gap-4 bg-gradient-to-r from-dolce-primary/10 via-dolce-accent/10 to-transparent px-6 py-5 dark:from-dolce-accent/15 dark:via-dolce-primary/10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-dolce-primary text-lg font-semibold text-white shadow-sm dark:bg-dolce-accent dark:text-dolce-text">
              {initials(email)}
            </div>
            <div className="min-w-0">
              <p className="admin-muted">{t("signedInAs")}</p>
              <p className="truncate font-medium text-dolce-text dark:text-white">
                {email}
              </p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-dolce-primary/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-dolce-primary dark:bg-dolce-accent/20 dark:text-dolce-accent">
                <Shield size={11} />
                {t("adminRole")}
              </span>
            </div>
          </div>
        </div>

        <form
          noValidate
          onSubmit={handlePasswordSubmit}
          className="admin-card space-y-4 p-6"
        >
          <div>
            <h2 className="font-playfair text-lg font-semibold text-dolce-text dark:text-[#f5e6d3]">
              {t("changePassword")}
            </h2>
            <p className="mt-1 text-sm text-dolce-text/55 dark:text-white/45">
              {t("changePasswordHint")}
            </p>
          </div>

          {pwdStatus === "success" && (
            <p className="admin-alert-success">{pwdMessage}</p>
          )}
          {pwdStatus === "error" && (
            <p className="admin-alert-error">{pwdMessage}</p>
          )}

          <div>
            <label className="admin-label" htmlFor="oldPassword">
              {t("currentPassword")}
            </label>
            <PasswordInput
              id="oldPassword"
              name="oldPassword"
              autoComplete="current-password"
              inputClassName={`input-field ${fieldErrorClass(!!pwdFieldError)}`}
              onChange={() => setPwdFieldError("")}
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="newPassword">
              {ta("newPassword")}
            </label>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              autoComplete="new-password"
              minLength={6}
              inputClassName={`input-field ${fieldErrorClass(!!pwdFieldError)}`}
              onChange={() => setPwdFieldError("")}
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="confirmPassword">
              {t("confirmNewPassword")}
            </label>
            <PasswordInput
              id="confirmPassword"
              name="confirm"
              autoComplete="new-password"
              minLength={6}
              inputClassName={`input-field ${fieldErrorClass(!!pwdFieldError)}`}
              onChange={() => setPwdFieldError("")}
            />
            <FieldError message={pwdFieldError} />
          </div>

          <button
            type="submit"
            disabled={pwdLoading}
            className="btn-primary w-full"
          >
            {pwdLoading ? t("updating") : t("updatePassword")}
          </button>
        </form>
      </div>

      <div className="admin-card flex flex-col overflow-hidden">
        <div className="flex items-start justify-between gap-3 border-b border-dolce-secondary/50 px-6 py-5 dark:border-white/10">
          <div>
            <h2 className="font-playfair text-lg font-semibold text-dolce-text dark:text-[#f5e6d3]">
              {t("teamAdmins")}
            </h2>
            <p className="mt-1 text-sm text-dolce-text/55 dark:text-white/45">
              {t("teamAdminsHint")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowAddForm((v) => !v);
              setAddStatus("idle");
              setAddMessage("");
              setAddFieldErrors({});
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-dolce-primary px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#6f4a2f] dark:bg-dolce-accent dark:text-dolce-text dark:hover:bg-[#c4925f]"
          >
            <Plus size={14} />
            {showAddForm ? tc("cancel") : t("addAdmin")}
          </button>
        </div>

        <div className="space-y-4 p-6">
          {addStatus === "success" && (
            <p className="admin-alert-success">{addMessage}</p>
          )}
          {addStatus === "error" && (
            <p className="admin-alert-error">{addMessage}</p>
          )}

          {showAddForm && (
            <form
              noValidate
              onSubmit={handleAddAdmin}
              className="space-y-3 rounded-2xl border border-dashed border-dolce-accent/50 bg-dolce-secondary/30 p-4 dark:border-dolce-accent/40 dark:bg-[#2a1f18]/70"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-dolce-primary dark:text-dolce-accent">
                <UserRound size={16} />
                {t("newAdminTitle")}
              </div>

              <div>
                <label className="admin-label" htmlFor="adminEmail">
                  {tc("email")}
                </label>
                <input
                  id="adminEmail"
                  name="email"
                  type="text"
                  inputMode="email"
                  autoComplete="off"
                  value={addEmail}
                  onChange={(e) => {
                    setAddEmail(e.target.value);
                    setAddFieldErrors((prev) => ({
                      ...prev,
                      email: undefined,
                    }));
                  }}
                  className={`input-field ${fieldErrorClass(!!addFieldErrors.email)}`}
                  placeholder="name@example.com"
                />
                <FieldError message={addFieldErrors.email} />
              </div>

              <div>
                <label className="admin-label" htmlFor="adminPassword">
                  {ta("password")}
                </label>
                <PasswordInput
                  id="adminPassword"
                  name="password"
                  autoComplete="new-password"
                  minLength={6}
                  inputClassName={`input-field ${fieldErrorClass(!!addFieldErrors.password)}`}
                  onChange={() =>
                    setAddFieldErrors((prev) => ({
                      ...prev,
                      password: undefined,
                    }))
                  }
                />
                <FieldError message={addFieldErrors.password} />
              </div>

              <div>
                <label className="admin-label" htmlFor="adminConfirm">
                  {t("confirmNewPassword")}
                </label>
                <PasswordInput
                  id="adminConfirm"
                  name="confirm"
                  autoComplete="new-password"
                  minLength={6}
                  inputClassName={`input-field ${fieldErrorClass(!!addFieldErrors.confirm)}`}
                  onChange={() =>
                    setAddFieldErrors((prev) => ({
                      ...prev,
                      confirm: undefined,
                    }))
                  }
                />
                <FieldError message={addFieldErrors.confirm} />
              </div>

              <button
                type="submit"
                disabled={addLoading}
                className="btn-primary w-full text-sm"
              >
                {addLoading ? t("creatingAdmin") : t("createAdmin")}
              </button>
            </form>
          )}

          {adminsLoading ? (
            <p className="admin-muted py-6 text-center">{tc("loading")}</p>
          ) : admins.length === 0 ? (
            <div className="rounded-2xl border border-dolce-secondary/60 px-4 py-10 text-center dark:border-white/10">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-dolce-secondary dark:bg-white/5">
                <Shield size={22} className="text-dolce-primary dark:text-dolce-accent" />
              </div>
              <p className="text-sm text-dolce-text/60 dark:text-white/50">
                {t("noAdmins")}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-dolce-secondary/40 dark:divide-white/10">
              {admins.map((admin) => (
                <li
                  key={admin.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                      admin.isCurrent
                        ? "bg-dolce-primary text-white dark:bg-dolce-accent dark:text-dolce-text"
                        : "bg-dolce-secondary text-dolce-primary dark:bg-white/10 dark:text-dolce-accent"
                    }`}
                  >
                    {initials(admin.email)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-dolce-text dark:text-white">
                      {admin.email}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-dolce-text/45 dark:text-white/35">
                        {t("adminRole")}
                      </span>
                      {admin.isCurrent && (
                        <span className="rounded-full bg-dolce-accent/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-dolce-primary dark:text-dolce-accent">
                          {t("youBadge")}
                        </span>
                      )}
                    </div>
                  </div>
                  {!admin.isCurrent && (
                    <button
                      type="button"
                      disabled={deletingId === admin.id || admins.length <= 1}
                      onClick={() => handleDeleteAdmin(admin)}
                      className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-900/30"
                      aria-label={tc("delete")}
                      title={t("removeAdmin")}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {!adminsLoading && admins.length > 0 && (
            <p className="text-center text-xs text-dolce-text/40 dark:text-white/30">
              {t("adminsCount", { count: admins.length })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
