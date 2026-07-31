"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, MessageSquareWarning } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import FieldError, { fieldErrorClass } from "@/components/ui/FieldError";
import { digitsOnly, isValidEmail, isValidPhone } from "@/lib/validation";

type FieldErrors = {
  email?: string;
  phone?: string;
  message?: string;
};

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
    if (phone && !isValidPhone(phoneDigits)) {
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
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="admin-card space-y-5 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="font-playfair text-2xl font-semibold text-dolce-text dark:text-[#f5e6d3]">
            {t("thankYouTitle")}
          </h1>
          <p className="text-sm text-dolce-text/70 dark:text-white/60">
            {t("success")}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
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
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-dolce-primary/15 text-dolce-primary dark:bg-dolce-accent/20 dark:text-dolce-accent">
          <MessageSquareWarning size={28} />
        </div>
        <h1 className="section-title">{t("title")}</h1>
        <p className="mt-3 text-dolce-text/70 dark:text-white/60">
          {t("subtitle")}
        </p>
      </div>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="admin-card space-y-4 p-6 shadow-sm md:p-8"
      >
        <p className="rounded-xl border border-dolce-accent/40 bg-dolce-secondary/40 px-4 py-3 text-sm text-dolce-text dark:border-dolce-accent/30 dark:bg-[#2a1f18] dark:text-dolce-secondary">
          {t("anonymous")}
        </p>

        {error && <p className="admin-alert-error">{error}</p>}

        <div>
          <label className="admin-label" htmlFor="rec-name">
            {t("name")}{" "}
            <span className="font-normal text-dolce-text/45 dark:text-white/35">
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

        <div>
          <label className="admin-label" htmlFor="rec-email">
            {t("email")}{" "}
            <span className="font-normal text-dolce-text/45 dark:text-white/35">
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
              setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder="name@example.com"
          />
          <FieldError message={fieldErrors.email} />
        </div>

        <div>
          <label className="admin-label" htmlFor="rec-phone">
            {t("phone")}{" "}
            <span className="font-normal text-dolce-text/45 dark:text-white/35">
              ({t("optional")})
            </span>
          </label>
          <input
            id="rec-phone"
            type="text"
            inputMode="numeric"
            autoComplete="tel"
            className={`input-field ${fieldErrorClass(!!fieldErrors.phone)}`}
            value={phone}
            onChange={(e) => {
              setPhone(digitsOnly(e.target.value));
              setFieldErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            placeholder="XX XXX XXX"
          />
          <FieldError message={fieldErrors.phone} />
        </div>

        <div>
          <label className="admin-label" htmlFor="rec-message">
            {t("message")}
          </label>
          <textarea
            id="rec-message"
            required
            rows={5}
            className={`input-field resize-none ${fieldErrorClass(!!fieldErrors.message)}`}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setFieldErrors((prev) => ({ ...prev, message: undefined }));
            }}
            placeholder={t("messagePlaceholder")}
          />
          <FieldError message={fieldErrors.message} />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? t("sending") : t("submit")}
        </button>
      </form>
    </div>
  );
}
