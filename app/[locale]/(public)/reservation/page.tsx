"use client";

import {
  FormEvent,
  ReactNode,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Minus,
  Plus,
  Sparkles,
  Tag,
  Users,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
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

type AttachedOffer = {
  _id: string;
  title: string;
  discountLabel?: string;
  description?: string;
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-dolce-primary dark:text-dolce-accent">
      {children}
    </p>
  );
}

function ReservationForm() {
  const t = useTranslations("reservation");
  const tc = useTranslations("common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const offerIdParam = searchParams.get("offer") || "";

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [guests, setGuests] = useState(2);
  const [attachedOffer, setAttachedOffer] = useState<AttachedOffer | null>(
    null
  );
  const [successOfferLabel, setSuccessOfferLabel] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const timeSlots = useMemo(() => buildTimeSlots(), []);

  useEffect(() => {
    if (!offerIdParam) {
      setAttachedOffer(null);
      return;
    }

    let cancelled = false;
    fetch("/api/offers")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;
        const found = data.find(
          (o: AttachedOffer) => String(o._id) === offerIdParam
        );
        setAttachedOffer(found || null);
      })
      .catch(() => {
        if (!cancelled) setAttachedOffer(null);
      });

    return () => {
      cancelled = true;
    };
  }, [offerIdParam]);

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
    const offerId =
      attachedOffer?._id ||
      String(form.get("offerId") || "").trim() ||
      offerIdParam;
    const offerTitle =
      attachedOffer?.title || String(form.get("offerTitle") || "").trim();
    const offerDiscountLabel =
      attachedOffer?.discountLabel ||
      String(form.get("offerDiscountLabel") || "").trim();

    const payload = {
      customerName: String(form.get("customerName") || "").trim(),
      phone: digitsOnly(String(form.get("phone") || "")),
      email: String(form.get("email") || "").trim(),
      reservationDate: String(form.get("reservationDate") || ""),
      reservationTime: String(form.get("reservationTime") || ""),
      numberOfPeople: guests,
      specialRequests: String(form.get("specialRequests") || "").trim(),
      offerId,
      offerTitle,
      offerDiscountLabel,
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

      const offerLabel = [offerTitle, offerDiscountLabel]
        .filter(Boolean)
        .join(" · ");
      setSuccessOfferLabel(offerLabel);
      setSuccess(true);
      formEl.reset();
      setPhone("");
      setEmail("");
      setTimeValue("");
      setGuests(2);
      setFieldErrors({});
      setAttachedOffer(null);
      if (offerIdParam) router.replace(pathname);
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
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-dolce-brand/15 blur-3xl dark:bg-dolce-brand/10" />
      <div className="pointer-events-none absolute -left-20 top-48 h-64 w-64 rounded-full bg-dolce-accent/20 blur-3xl dark:bg-dolce-accent/10" />

      <div className="relative mx-auto max-w-2xl px-4 py-12 md:py-16">
        <div className="mb-8 text-center md:mb-10">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-dolce-accent/40 bg-white/70 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-dolce-primary backdrop-blur-sm dark:border-dolce-accent/25 dark:bg-white/5 dark:text-dolce-accent">
            <Sparkles size={13} className="shrink-0" />
            {t("eyebrow")}
          </p>
          <h1 className="section-title mt-4">{t("title")}</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-dolce-text/65 dark:text-white/55 md:text-base">
            {t("subtitle")}
          </p>
          <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-dolce-accent to-transparent" />
        </div>

        {attachedOffer && (
          <div className="mb-5 overflow-hidden rounded-2xl border border-dolce-accent/40 bg-gradient-to-r from-dolce-secondary/80 via-white to-white p-4 shadow-sm dark:border-dolce-accent/30 dark:from-[#2a1f18] dark:via-[#241912] dark:to-[#241912]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dolce-brand/20 text-dolce-brand">
                  <Tag size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-dolce-primary dark:text-dolce-accent">
                    {t("offerAttached")}
                  </p>
                  <p className="mt-0.5 font-semibold text-dolce-text dark:text-[#f5e6d3]">
                    {attachedOffer.title}
                    {attachedOffer.discountLabel
                      ? ` · ${attachedOffer.discountLabel}`
                      : ""}
                  </p>
                  <p className="mt-1 text-xs text-dolce-text/55 dark:text-white/45">
                    {t("offerAttachedHint")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAttachedOffer(null);
                  router.replace(pathname);
                }}
                className="rounded-lg p-1.5 text-dolce-text/50 transition hover:bg-black/5 hover:text-dolce-text dark:hover:bg-white/10 dark:hover:text-white"
                aria-label={t("removeOffer")}
                title={t("removeOffer")}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-5 overflow-hidden rounded-2xl border border-green-500/25 bg-gradient-to-r from-green-50 to-white px-4 py-4 dark:border-green-400/20 dark:from-green-900/30 dark:to-[#241912]">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/15 text-green-700 dark:text-green-300">
                <CheckCircle2 size={20} />
              </span>
              <div>
                <p className="font-semibold text-green-900 dark:text-green-200">
                  {t("successTitle")}
                </p>
                <p className="mt-1 text-sm text-green-800/90 dark:text-green-300/90">
                  {successOfferLabel
                    ? t("successWithOffer", { offer: successOfferLabel })
                    : t("success")}
                </p>
                {successOfferLabel && (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800 dark:bg-green-800/40 dark:text-green-200">
                    <Tag size={12} />
                    {successOfferLabel}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-300/50 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-900/25 dark:text-red-200">
            {error}
          </div>
        )}

        <form
          noValidate
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_-28px_rgba(139,94,60,0.45)] ring-1 ring-dolce-secondary/60 dark:bg-[#241912] dark:ring-white/10"
        >
          {(attachedOffer || offerIdParam) && (
            <>
              <input
                type="hidden"
                name="offerId"
                value={attachedOffer?._id || offerIdParam}
              />
              <input
                type="hidden"
                name="offerTitle"
                value={attachedOffer?.title || ""}
              />
              <input
                type="hidden"
                name="offerDiscountLabel"
                value={attachedOffer?.discountLabel || ""}
              />
            </>
          )}

          <div className="space-y-7 p-5 md:p-8">
            {/* Details */}
            <section>
              <SectionLabel>{t("detailsSection")}</SectionLabel>
              <div className="space-y-4">
                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium text-dolce-text dark:text-[#f5e6d3]"
                    htmlFor="customerName"
                  >
                    {t("name")} *
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    autoComplete="name"
                    className={`input-field ${fieldErrorClass(!!fieldErrors.customerName)}`}
                    placeholder={t("namePlaceholder")}
                    onChange={() =>
                      setFieldErrors((prev) => ({
                        ...prev,
                        customerName: undefined,
                      }))
                    }
                  />
                  <FieldError message={fieldErrors.customerName} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <label
                        className="block text-sm font-medium text-dolce-text dark:text-[#f5e6d3]"
                        htmlFor="phone"
                      >
                        {t("phone")} *
                      </label>
                      <span className="text-[11px] text-dolce-text/40 dark:text-white/35">
                        {t("phoneHint")}
                      </span>
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(digitsOnly(e.target.value).slice(0, 8));
                        setFieldErrors((prev) => ({
                          ...prev,
                          phone: undefined,
                        }));
                      }}
                      maxLength={8}
                      className={`input-field ${fieldErrorClass(!!fieldErrors.phone)}`}
                      placeholder={t("phonePlaceholder")}
                    />
                    <FieldError message={fieldErrors.phone} />
                  </div>
                  <div>
                    <label
                      className="mb-1.5 block text-sm font-medium text-dolce-text dark:text-[#f5e6d3]"
                      htmlFor="email"
                    >
                      {t("email")}{" "}
                      <span className="font-normal text-dolce-text/40 dark:text-white/35">
                        ({t("emailOptional")})
                      </span>
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
                        setFieldErrors((prev) => ({
                          ...prev,
                          email: undefined,
                        }));
                      }}
                      className={`input-field ${fieldErrorClass(!!fieldErrors.email)}`}
                      placeholder="name@email.com"
                    />
                    <FieldError message={fieldErrors.email} />
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-dolce-secondary to-transparent dark:via-white/10" />

            {/* When */}
            <section>
              <SectionLabel>{t("whenSection")}</SectionLabel>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium text-dolce-text dark:text-[#f5e6d3]"
                    htmlFor="reservationDate"
                  >
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
                  <label
                    className="mb-1.5 block text-sm font-medium text-dolce-text dark:text-[#f5e6d3]"
                    htmlFor="reservationTime"
                  >
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

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-dolce-text dark:text-[#f5e6d3]">
                    {t("guests")} *
                  </label>
                  <input type="hidden" name="numberOfPeople" value={guests} />
                  <div
                    className={`flex items-center justify-between rounded-xl border bg-dolce-bg/60 px-3 py-2 dark:bg-[#2a1f18]/80 ${
                      fieldErrors.numberOfPeople
                        ? "border-red-400 dark:border-red-400/60"
                        : "border-dolce-secondary dark:border-white/15"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 text-sm text-dolce-text/70 dark:text-white/60">
                      <Users size={16} className="text-dolce-accent" />
                      {t("guests")}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="-"
                        disabled={guests <= 1}
                        onClick={() => {
                          setGuests((g) => Math.max(1, g - 1));
                          setFieldErrors((prev) => ({
                            ...prev,
                            numberOfPeople: undefined,
                          }));
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-dolce-secondary text-dolce-text transition hover:bg-dolce-secondary disabled:opacity-40 dark:border-white/15 dark:text-[#f5e6d3] dark:hover:bg-white/10"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="min-w-[2rem] text-center text-lg font-semibold text-dolce-text dark:text-[#f5e6d3]">
                        {guests}
                      </span>
                      <button
                        type="button"
                        aria-label="+"
                        disabled={guests >= 20}
                        onClick={() => {
                          setGuests((g) => Math.min(20, g + 1));
                          setFieldErrors((prev) => ({
                            ...prev,
                            numberOfPeople: undefined,
                          }));
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-dolce-secondary text-dolce-text transition hover:bg-dolce-secondary disabled:opacity-40 dark:border-white/15 dark:text-[#f5e6d3] dark:hover:bg-white/10"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <FieldError message={fieldErrors.numberOfPeople} />
                </div>
              </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-dolce-secondary to-transparent dark:via-white/10" />

            {/* Notes */}
            <section>
              <SectionLabel>{t("notesSection")}</SectionLabel>
              <label
                className="mb-1.5 block text-sm font-medium text-dolce-text dark:text-[#f5e6d3]"
                htmlFor="specialRequests"
              >
                {t("specialRequests")}
              </label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                rows={3}
                className="input-field resize-none"
                placeholder={t("specialPlaceholder")}
              />
            </section>
          </div>

          <div className="border-t border-dolce-secondary/60 bg-dolce-bg/50 px-5 py-5 dark:border-white/10 dark:bg-[#1e1510]/80 md:px-8">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base disabled:opacity-70"
            >
              {loading
                ? t("sending")
                : attachedOffer
                  ? t("submitWithOffer")
                  : t("submit")}
              {!loading && <ArrowRight size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ReservationPage() {
  const tc = useTranslations("common");

  return (
    <Suspense
      fallback={
        <p className="py-20 text-center text-dolce-text/60">{tc("loading")}</p>
      }
    >
      <ReservationForm />
    </Suspense>
  );
}
