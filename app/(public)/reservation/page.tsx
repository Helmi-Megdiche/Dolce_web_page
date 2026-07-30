"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function ReservationPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const form = new FormData(e.currentTarget);
    const payload = {
      customerName: form.get("customerName"),
      phone: form.get("phone"),
      email: form.get("email"),
      reservationDate: form.get("reservationDate"),
      reservationTime: form.get("reservationTime"),
      numberOfPeople: Number(form.get("numberOfPeople")),
      specialRequests: form.get("specialRequests"),
    };

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
        return;
      }
      setSuccess(true);
      e.currentTarget.reset();
    } catch {
      setError("Impossible d'envoyer la réservation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="section-title">Réservation</h1>
        <p className="mt-3 text-dolce-text/70">
          Nous avons hâte de vous accueillir chez Dolce !
        </p>
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3 text-green-800">
          <CheckCircle2 size={20} />
          <p>
            Réservation envoyée ! Nous vous confirmerons bientôt par téléphone.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-dolce-secondary/50 md:p-8"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="customerName">
            Nom *
          </label>
          <input
            id="customerName"
            name="customerName"
            required
            className="input-field"
            placeholder="Votre nom"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="phone">
              Téléphone *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className="input-field"
              placeholder="XX XXX XXX"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input-field"
              placeholder="optionnel"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              htmlFor="reservationDate"
            >
              Date *
            </label>
            <input
              id="reservationDate"
              name="reservationDate"
              type="date"
              min={today}
              required
              className="input-field"
            />
          </div>
          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              htmlFor="reservationTime"
            >
              Heure *
            </label>
            <input
              id="reservationTime"
              name="reservationTime"
              type="time"
              step={1800}
              required
              className="input-field"
            />
          </div>
          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              htmlFor="numberOfPeople"
            >
              Personnes *
            </label>
            <input
              id="numberOfPeople"
              name="numberOfPeople"
              type="number"
              min={1}
              max={20}
              defaultValue={2}
              required
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label
            className="mb-1.5 block text-sm font-medium"
            htmlFor="specialRequests"
          >
            Demandes spéciales
          </label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            rows={3}
            className="input-field resize-none"
            placeholder="Allergies, occasion spéciale…"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Envoi…" : "Confirmer la réservation"}
        </button>
      </form>
    </div>
  );
}
