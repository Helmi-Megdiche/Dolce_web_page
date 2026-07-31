"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3 } from "lucide-react";
import { useTranslations } from "next-intl";
import FieldError, { fieldErrorClass } from "@/components/ui/FieldError";
import { digitsOnly, isValidEmail, isValidPhone } from "@/lib/validation";

function buildTimeSlots() {
  const slots: string[] = [];
  for (let hour = 10; hour <= 22; hour++) {
    for (const minute of [0, 30]) {
      if (hour === 22 && minute > 0) continue;
      slots.push(
        `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
      );
    }
  }
  return slots;
}

type FieldErrors = {
  customerName?: string;
  phone?: string;
  email?: string;
  reservationDate?: string;
  reservationTime?: string;
  numberOfPeople?: string;
};

export default function ReservationPage() {
  const t = useTranslations("reservation");
  const tc = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const timeSlots = useMemo(() => buildTimeSlots(), []);

  function validate(payload: {
    customerName: string;
    phone: string;
    email: string;
    reservationDate: string;
    reservationTime: string;
    numberOfPeople: number;
  }) {
    const next: FieldErrors = {};

    if (!payload.customerName) next.customerName = tc("fieldRequired");
    if (!payload.phone) next.phone = tc("phoneRequired");
    else if (!isValidPhone(payload.phone)) next.phone = tc("phoneInvalid");
    if (payload.email && !isValidEmail(payload.email)) {
      next.email = tc("emailInvalid");
    }
    if (!payload.reservationDate) next.reservationDate = tc("fieldRequired");
    if (!payload.reservationTime) next.reservationTime = tc("fieldRequired");
    if (payload.numberOfPeople < 1 || payload.numberOfPeople > 20) {
      next.numberOfPeople = tc("fieldRequired");
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const payload = {
      customerName: String(form.get("customerName") || "").trim(),
      phone: digitsOnly(String(form.get("phone") || "")),
      email: String(form.get("email") || "").trim(),
      reservationDate: String(form.get("reservationDate") || ""),
      reservationTime: String(form.get("reservationTime") || ""),
      numberOfPeople: Number(form.get("numberOfPeople")) || 1,
      specialRequests: String(form.get("specialRequests") || "").trim(),
    };

    if (!validate(payload)) {
      setLoading(false);
      return;
    }

    const url = `${window.location.origin}/api/reservations`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const rawText = await res.text();
      let data: { error?: string; success?: boolean } = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        setError(
          rawText
            ? `Server error (${res.status}): ${rawText.slice(0, 120)}`
            : `Server error (${res.status})`
        );
        return;
      }

      if (!res.ok) {
        setError(data.error || t("errorGeneric"));
        return;
      }

      setSuccess(true);
      formEl.reset();
      setPhone("");
      setEmail("");
      setTimeValue("");
      setFieldErrors({});
    } catch (err) {
      setError(
        err instanceof Error
          ? `${t("errorNetwork")} (${err.message})`
          : t("errorNetwork")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="section-title">{t("title")}</h1>
        <p className="mt-3 text-dolce-text/70 dark:text-white/60">{t("subtitle")}</p>
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircle2 size={20} />
          <p>{t("success")}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-dolce-accent/40 bg-dolce-secondary/40 px-4 py-3 text-dolce-text dark:border-dolce-accent/50 dark:bg-[#2a1f18] dark:text-dolce-secondary">
          {error}
        </div>
      )}

      <form
        noValidate
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-dolce-secondary/50 dark:bg-[#241912] dark:ring-white/10 md:p-8"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="customerName">
            {t("name")} *
          </label>
          <input
            id="customerName"
            name="customerName"
            className={`input-field ${fieldErrorClass(!!fieldErrors.customerName)}`}
            placeholder={t("namePlaceholder")}
            onChange={() =>
              setFieldErrors((prev) => ({ ...prev, customerName: undefined }))
            }
          />
          <FieldError message={fieldErrors.customerName} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="phone">
              {t("phone")} *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={phone}
              onChange={(e) => {
                setPhone(digitsOnly(e.target.value));
                setFieldErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              className={`input-field ${fieldErrorClass(!!fieldErrors.phone)}`}
              placeholder={t("phonePlaceholder")}
            />
            <FieldError message={fieldErrors.phone} />
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
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className={`input-field ${fieldErrorClass(!!fieldErrors.email)}`}
              placeholder={t("emailOptional")}
            />
            <FieldError message={fieldErrors.email} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="reservationDate">
              {t("date")} *
            </label>
            <div className="relative">
              <CalendarDays
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 z-[1] -translate-y-1/2 text-dolce-accent"
                aria-hidden
              />
              <input
                id="reservationDate"
                name="reservationDate"
                type="date"
                min={today}
                className={`input-datetime pl-10 ${fieldErrorClass(!!fieldErrors.reservationDate)}`}
                onChange={() =>
                  setFieldErrors((prev) => ({
                    ...prev,
                    reservationDate: undefined,
                  }))
                }
              />
            </div>
            <FieldError message={fieldErrors.reservationDate} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="reservationTime">
              {t("time")} *
            </label>
            <div className="relative">
              <Clock3
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 z-[1] -translate-y-1/2 text-dolce-accent"
                aria-hidden
              />
              <select
                id="reservationTime"
                name="reservationTime"
                value={timeValue}
                onChange={(e) => {
                  setTimeValue(e.target.value);
                  setFieldErrors((prev) => ({
                    ...prev,
                    reservationTime: undefined,
                  }));
                }}
                className={`input-datetime appearance-none pl-10 pr-9 dark:[color-scheme:dark] ${fieldErrorClass(!!fieldErrors.reservationTime)}`}
              >
                <option value="" disabled>
                  --:--
                </option>
                {timeSlots.map((slot) => (
                  <option
                    key={slot}
                    value={slot}
                    className="bg-white text-dolce-text dark:bg-[#2a1f18] dark:text-[#f5e6d3]"
                  >
                    {slot}
                  </option>
                ))}
              </select>
              <span
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-dolce-accent"
                aria-hidden
              >
                ▾
              </span>
            </div>
            <FieldError message={fieldErrors.reservationTime} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="numberOfPeople">
              {t("guests")} *
            </label>
            <input
              id="numberOfPeople"
              name="numberOfPeople"
              type="number"
              min={1}
              max={20}
              defaultValue={2}
              className={`input-field ${fieldErrorClass(!!fieldErrors.numberOfPeople)}`}
            />
            <FieldError message={fieldErrors.numberOfPeople} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="specialRequests">
            {t("specialRequests")}
          </label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            rows={3}
            className="input-field resize-none"
            placeholder={t("specialPlaceholder")}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? t("sending") : t("submit")}
        </button>
      </form>
    </div>
  );
}
