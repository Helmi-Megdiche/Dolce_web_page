"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import FieldError, { fieldErrorClass } from "@/components/ui/FieldError";
import PasswordInput from "@/components/ui/PasswordInput";
import { isValidEmail } from "@/lib/validation";

export default function AdminLoginPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const emailValue = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    const next: { email?: string; password?: string } = {};
    if (!emailValue) next.email = tc("emailRequired");
    else if (!isValidEmail(emailValue)) next.email = tc("emailInvalid");
    if (!password) next.password = tc("fieldRequired");

    setFieldErrors(next);
    if (Object.keys(next).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("loginFailed"));
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError(t("unableToConnect"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-dolce-bg via-dolce-secondary to-dolce-bg px-4 dark:from-[#1a120e] dark:via-[#241912] dark:to-[#1a120e]">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-[#241912] dark:ring-1 dark:ring-white/10">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size="lg" href="/" priority />
          <p className="mt-4 text-sm text-dolce-text/60 dark:text-white/50">
            {t("loginTitle")}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-dolce-accent/40 bg-dolce-secondary/50 px-4 py-3 text-sm text-dolce-text dark:border-dolce-accent/50 dark:bg-[#2a1f18] dark:text-dolce-secondary">
            {error}
          </div>
        )}

        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="email">
              {t("email")}
            </label>
            <input
              id="email"
              name="email"
              type="text"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className={`input-field ${fieldErrorClass(!!fieldErrors.email)}`}
              placeholder="admin@dolce.tn"
            />
            <FieldError message={fieldErrors.email} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="password">
              {t("password")}
            </label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              onChange={() =>
                setFieldErrors((prev) => ({ ...prev, password: undefined }))
              }
              inputClassName={`input-field ${fieldErrorClass(!!fieldErrors.password)}`}
            />
            <FieldError message={fieldErrors.password} />
          </div>
          <div className="text-right">
            <Link
              href="/admin/forgot-password"
              className="text-sm text-dolce-primary hover:underline dark:text-dolce-accent"
            >
              {t("forgotPassword")}
            </Link>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t("signingIn") : t("signIn")}
          </button>
        </form>
      </div>
    </div>
  );
}
