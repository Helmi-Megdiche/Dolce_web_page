"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Mail, MessageCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Logo from "@/components/ui/Logo";
import FieldError, { fieldErrorClass } from "@/components/ui/FieldError";
import { isValidEmail } from "@/lib/validation";

type ResetMethod = "email" | "whatsapp";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [method, setMethod] = useState<ResetMethod>("email");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMethod, setSuccessMethod] = useState<ResetMethod>("email");
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
        body: JSON.stringify({
          email: emailValue,
          method,
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("unableToConnect"));
        return;
      }
      setSuccessMethod(data.method === "whatsapp" ? "whatsapp" : "email");
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
          <h1 className="mt-4 font-playfair text-2xl font-semibold">
            {t("forgotTitle")}
          </h1>
          <p className="mt-2 text-sm text-dolce-text/60 dark:text-white/50">
            {t("forgotSubtitleChoice")}
          </p>
        </div>

        {success ? (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
              <CheckCircle2 size={28} />
            </div>
            <div className="rounded-xl border border-green-600/30 bg-green-50 px-4 py-4 text-sm dark:border-green-400/40 dark:bg-green-950 dark:text-green-200">
              <p className="font-medium text-green-900 dark:text-green-200">
                {successMethod === "whatsapp"
                  ? t("checkWhatsApp")
                  : t("checkEmail")}
              </p>
              <p className="mt-2 text-green-800/80 dark:text-green-200/70">
                {successMethod === "whatsapp"
                  ? t("checkWhatsAppHint")
                  : t("checkEmailHint")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setError("");
              }}
              className="text-sm text-dolce-primary hover:underline dark:text-dolce-accent"
            >
              {t("tryOtherMethod")}
            </button>
            <div>
              <Link
                href="/admin/login"
                className="text-sm text-dolce-primary hover:underline dark:text-dolce-accent"
              >
                {t("backToLogin")}
              </Link>
            </div>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-dolce-accent/40 bg-dolce-secondary/50 px-4 py-3 text-sm text-dolce-text dark:border-dolce-accent/50 dark:bg-[#2a1f18] dark:text-dolce-secondary">
                {error}
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-dolce-text dark:text-[#f5e6d3]">
                {t("resetVia")}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod("email")}
                  aria-pressed={method === "email"}
                  className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center transition ${
                    method === "email"
                      ? "border-dolce-primary bg-dolce-primary/10 ring-2 ring-dolce-primary/30 dark:border-dolce-accent dark:bg-dolce-accent/15 dark:ring-dolce-accent/30"
                      : "border-dolce-secondary/80 bg-dolce-secondary/20 hover:border-dolce-accent dark:border-white/10 dark:bg-[#2a1f18] dark:hover:border-dolce-accent"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      method === "email"
                        ? "bg-dolce-primary text-white dark:bg-dolce-accent dark:text-dolce-text"
                        : "bg-white text-dolce-primary dark:bg-white/10 dark:text-dolce-accent"
                    }`}
                  >
                    <Mail size={20} />
                  </span>
                  <span className="text-sm font-semibold text-dolce-text dark:text-[#f5e6d3]">
                    {t("methodEmail")}
                  </span>
                  <span className="text-[11px] leading-snug text-dolce-text/50 dark:text-white/40">
                    {t("methodEmailHint")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("whatsapp")}
                  aria-pressed={method === "whatsapp"}
                  className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center transition ${
                    method === "whatsapp"
                      ? "border-[#25D366] bg-[#25D366]/10 ring-2 ring-[#25D366]/30 dark:bg-[#25D366]/15"
                      : "border-dolce-secondary/80 bg-dolce-secondary/20 hover:border-[#25D366]/70 dark:border-white/10 dark:bg-[#2a1f18] dark:hover:border-[#25D366]/70"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      method === "whatsapp"
                        ? "bg-[#25D366] text-white"
                        : "bg-white text-[#25D366] dark:bg-white/10"
                    }`}
                  >
                    <MessageCircle size={20} />
                  </span>
                  <span className="text-sm font-semibold text-dolce-text dark:text-[#f5e6d3]">
                    {t("methodWhatsApp")}
                  </span>
                  <span className="text-[11px] leading-snug text-dolce-text/50 dark:text-white/40">
                    {t("methodWhatsAppHint")}
                  </span>
                </button>
              </div>
            </div>

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
              <p className="mt-2 text-xs text-dolce-text/50 dark:text-white/40">
                {method === "whatsapp"
                  ? t("whatsappIdentifyHint")
                  : t("emailIdentifyHint")}
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading
                ? t("sending")
                : method === "whatsapp"
                  ? t("sendResetWhatsApp")
                  : t("sendResetLink")}
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
