"use client";

import { FormEvent, ReactNode, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  MessageSquareHeart,
  Shield,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import FieldError, { fieldErrorClass } from "@/components/ui/FieldError";
import { digitsOnly, isValidEmail, isValidPhone } from "@/lib/validation";

type FieldErrors = {
  email?: string;
  phone?: string;
  message?: string;
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-dolce-primary dark:text-dolce-accent">
      {children}
    </p>
  );
}

export default function ReclamationPage() {
  const t = useTranslations("reclamation");
  const tc = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    const next: FieldErrors = {};
    const trimmedMessage = message.trim();
    const trimmedEmail = email.trim();
    const phoneDigits = digitsOnly(phone);

    if (!trimmedMessage) next.message = tc("fieldRequired");
    else if (trimmedMessage.length < 5) next.message = t("messageMin");

    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      next.email = tc("emailInvalid");
    }
    if (phoneDigits && !isValidPhone(phoneDigits)) {
      next.phone = tc("phoneInvalid");
    }

    if (Object.keys(next).length > 0) {
      setFieldErrors(next);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/reclamations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: trimmedEmail,
          phone: phoneDigits,
          message: trimmedMessage,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || t("error"));
        return;
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 top-16 h-64 w-64 rounded-full bg-dolce-brand/15 blur-3xl dark:bg-dolce-brand/10" />
        <div className="relative mx-auto max-w-xl px-4 py-16">
          <div className="overflow-hidden rounded-3xl bg-white p-8 text-center shadow-[0_20px_50px_-28px_rgba(139,94,60,0.45)] ring-1 ring-dolce-secondary/60 dark:bg-[#241912] dark:ring-white/10 md:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
              <CheckCircle2 size={28} />
            </div>
            <h1 className="mt-5 font-playfair text-3xl font-semibold text-dolce-text dark:text-[#f5e6d3]">
              {t("thankYouTitle")}
            </h1>
            <p className="mt-3 text-sm text-dolce-text/70 dark:text-white/60">
              {t("success")}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/" className="btn-primary text-sm">
                {t("backHome")}
              </Link>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="btn-secondary text-sm"
              >
                {t("sendAnother")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-dolce-brand/15 blur-3xl dark:bg-dolce-brand/10" />
      <div className="pointer-events-none absolute -left-20 top-48 h-64 w-64 rounded-full bg-dolce-accent/20 blur-3xl dark:bg-dolce-accent/10" />

      <div className="relative mx-auto max-w-2xl px-4 py-12 md:py-16">
        <div className="mb-8 text-center md:mb-10">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-dolce-accent/40 bg-white/70 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-dolce-primary backdrop-blur-sm dark:border-dolce-accent/25 dark:bg-white/5 dark:text-dolce-accent">
            <MessageSquareHeart size={13} className="shrink-0" />
            {t("eyebrow")}
          </p>
          <h1 className="section-title mt-4">{t("title")}</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-dolce-text/65 dark:text-white/55 md:text-base">
            {t("subtitle")}
          </p>
          <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-dolce-accent to-transparent" />
        </div>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_-28px_rgba(139,94,60,0.45)] ring-1 ring-dolce-secondary/60 dark:bg-[#241912] dark:ring-white/10"
        >
          <div className="space-y-7 p-5 md:p-8">
            <div className="flex items-start gap-3 rounded-2xl border border-dolce-accent/35 bg-gradient-to-r from-dolce-secondary/70 to-transparent px-4 py-3.5 dark:border-dolce-accent/25 dark:from-[#2a1f18]">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-dolce-accent/20 text-dolce-primary dark:text-dolce-accent">
                <Shield size={16} />
              </span>
              <p className="text-sm leading-relaxed text-dolce-text/75 dark:text-white/65">
                {t("anonymous")}
              </p>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-300/50 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-900/25 dark:text-red-200">
                {error}
              </div>
            )}

            <section>
              <SectionLabel>{t("contactSection")}</SectionLabel>
              <div className="space-y-4">
                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium text-dolce-text dark:text-[#f5e6d3]"
                    htmlFor="rec-name"
                  >
                    {t("name")}{" "}
                    <span className="font-normal text-dolce-text/40 dark:text-white/35">
                      ({t("optional")})
                    </span>
                  </label>
                  <input
                    id="rec-name"
                    className="input-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder={t("namePlaceholder")}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      className="mb-1.5 block text-sm font-medium text-dolce-text dark:text-[#f5e6d3]"
                      htmlFor="rec-email"
                    >
                      {t("email")}{" "}
                      <span className="font-normal text-dolce-text/40 dark:text-white/35">
                        ({t("optional")})
                      </span>
                    </label>
                    <input
                      id="rec-email"
                      type="text"
                      inputMode="email"
                      autoComplete="email"
                      className={`input-field ${fieldErrorClass(!!fieldErrors.email)}`}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setFieldErrors((prev) => ({
                          ...prev,
                          email: undefined,
                        }));
                      }}
                      placeholder="name@email.com"
                    />
                    <FieldError message={fieldErrors.email} />
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <label
                        className="block text-sm font-medium text-dolce-text dark:text-[#f5e6d3]"
                        htmlFor="rec-phone"
                      >
                        {t("phone")}{" "}
                        <span className="font-normal text-dolce-text/40 dark:text-white/35">
                          ({t("optional")})
                        </span>
                      </label>
                      <span className="text-[11px] text-dolce-text/40 dark:text-white/35">
                        {t("phoneHint")}
                      </span>
                    </div>
                    <input
                      id="rec-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      className={`input-field ${fieldErrorClass(!!fieldErrors.phone)}`}
                      value={phone}
                      onChange={(e) => {
                        setPhone(digitsOnly(e.target.value).slice(0, 8));
                        setFieldErrors((prev) => ({
                          ...prev,
                          phone: undefined,
                        }));
                      }}
                      maxLength={8}
                      placeholder={t("phonePlaceholder")}
                    />
                    <FieldError message={fieldErrors.phone} />
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-dolce-secondary to-transparent dark:via-white/10" />

            <section>
              <SectionLabel>{t("messageSection")}</SectionLabel>
              <label
                className="mb-1.5 block text-sm font-medium text-dolce-text dark:text-[#f5e6d3]"
                htmlFor="rec-message"
              >
                {t("message")} *
              </label>
              <textarea
                id="rec-message"
                rows={5}
                className={`input-field resize-none ${fieldErrorClass(!!fieldErrors.message)}`}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setFieldErrors((prev) => ({
                    ...prev,
                    message: undefined,
                  }));
                }}
                placeholder={t("messagePlaceholder")}
              />
              <FieldError message={fieldErrors.message} />
            </section>
          </div>

          <div className="border-t border-dolce-secondary/60 bg-dolce-bg/50 px-5 py-5 dark:border-white/10 dark:bg-[#1e1510]/80 md:px-8">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base disabled:opacity-70"
            >
              {loading ? t("sending") : t("submit")}
              {!loading && <ArrowRight size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
