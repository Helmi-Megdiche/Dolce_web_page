"use client";

import { FormEvent, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Logo from "@/components/ui/Logo";
import FieldError, { fieldErrorClass } from "@/components/ui/FieldError";
import PasswordInput from "@/components/ui/PasswordInput";

function ResetPasswordForm() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    if (!token) {
      setError(t("invalidToken"));
      setLoading(false);
      return;
    }

    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get("newPassword") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    const next: { newPassword?: string; confirmPassword?: string } = {};
    if (!newPassword) next.newPassword = tc("fieldRequired");
    else if (newPassword.length < 6) {
      next.newPassword = "Min. 6 characters";
    }
    if (!confirmPassword) next.confirmPassword = tc("fieldRequired");
    else if (newPassword !== confirmPassword) {
      next.confirmPassword = t("passwordMismatch");
    }

    if (Object.keys(next).length > 0) {
      setFieldErrors(next);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("tokenExpired"));
        return;
      }
      setSuccess(true);
    } catch {
      setError(t("unableToConnect"));
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
        {t("invalidToken")}
      </p>
    );
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
          {t("resetSuccess")}
        </p>
        <Link
          href="/admin/login"
          className="text-sm text-dolce-primary hover:underline dark:text-dolce-accent"
        >
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-dolce-accent/40 bg-dolce-secondary/50 px-4 py-3 text-sm text-dolce-text dark:border-dolce-accent/50 dark:bg-[#2a1f18] dark:text-dolce-secondary">
          {error}
        </div>
      )}
      <div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor="newPassword">
          {t("newPassword")}
        </label>
        <PasswordInput
          id="newPassword"
          name="newPassword"
          minLength={6}
          autoComplete="new-password"
          inputClassName={`input-field ${fieldErrorClass(!!fieldErrors.newPassword)}`}
          onChange={() =>
            setFieldErrors((prev) => ({ ...prev, newPassword: undefined }))
          }
        />
        <FieldError message={fieldErrors.newPassword} />
      </div>
      <div>
        <label
          className="mb-1.5 block text-sm font-medium"
          htmlFor="confirmPassword"
        >
          {t("confirmPassword")}
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          minLength={6}
          autoComplete="new-password"
          inputClassName={`input-field ${fieldErrorClass(!!fieldErrors.confirmPassword)}`}
          onChange={() =>
            setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
          }
        />
        <FieldError message={fieldErrors.confirmPassword} />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? t("sending") : t("resetSubmit")}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations("auth");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-dolce-bg via-dolce-secondary to-dolce-bg px-4 dark:from-[#1a120e] dark:via-[#241912] dark:to-[#1a120e]">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-[#241912] dark:ring-1 dark:ring-white/10">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size="md" href="/" />
          <h1 className="mt-4 font-playfair text-2xl font-semibold">
            {t("resetTitle")}
          </h1>
        </div>
        <Suspense fallback={<p className="text-center text-sm">{t("sending")}</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
