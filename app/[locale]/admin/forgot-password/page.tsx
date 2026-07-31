"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Logo from "@/components/ui/Logo";
import FieldError, { fieldErrorClass } from "@/components/ui/FieldError";
import { isValidEmail } from "@/lib/validation";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setEmailError("");

    const emailValue = email.trim();
    if (!emailValue) {
      setEmailError(tc("emailRequired"));
      setLoading(false);
      return;
    }
    if (!isValidEmail(emailValue)) {
      setEmailError(tc("emailInvalid"));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("unableToConnect"));
        return;
      }
      setSuccess(true);
    } catch {
      setError(t("unableToConnect"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-dolce-bg via-dolce-secondary to-dolce-bg px-4 dark:from-[#1a120e] dark:via-[#241912] dark:to-[#1a120e]">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-[#241912] dark:ring-1 dark:ring-white/10">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size="md" href="/" />
          <h1 className="mt-4 font-playfair text-2xl font-semibold">{t("forgotTitle")}</h1>
          <p className="mt-2 text-sm text-dolce-text/60 dark:text-white/50">
            {t("forgotSubtitle")}
          </p>
        </div>

        {success ? (
          <div className="space-y-4 text-center">
            <p className="rounded-xl border border-green-600/30 bg-green-50 px-4 py-3 text-sm font-medium text-green-900 dark:border-green-400/40 dark:bg-green-950 dark:text-green-200">
              {t("checkEmail")}
            </p>
            <Link
              href="/admin/login"
              className="text-sm text-dolce-primary hover:underline dark:text-dolce-accent"
            >
              {t("backToLogin")}
            </Link>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-dolce-accent/40 bg-dolce-secondary/50 px-4 py-3 text-sm text-dolce-text dark:border-dolce-accent/50 dark:bg-[#2a1f18] dark:text-dolce-secondary">
                {error}
              </div>
            )}
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
                  setEmailError("");
                }}
                className={`input-field ${fieldErrorClass(!!emailError)}`}
                placeholder="admin@dolce.tn"
              />
              <FieldError message={emailError} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? t("sending") : t("sendResetLink")}
            </button>
            <div className="text-center">
              <Link
                href="/admin/login"
                className="text-sm text-dolce-primary hover:underline dark:text-dolce-accent"
              >
                {t("backToLogin")}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
