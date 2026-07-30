"use client";

import { FormEvent, useState } from "react";

export default function ProfileTab({ email }: { email: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const form = new FormData(e.currentTarget);
    const oldPassword = form.get("oldPassword") as string;
    const newPassword = form.get("newPassword") as string;
    const confirm = form.get("confirm") as string;

    if (newPassword !== confirm) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to change password");
        return;
      }
      setMessage("Password updated successfully");
      e.currentTarget.reset();
    } catch {
      setError("Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md">
      <div className="mb-6 rounded-xl bg-white p-6 ring-1 ring-dolce-secondary/50">
        <p className="text-sm text-dolce-text/60">Signed in as</p>
        <p className="mt-1 font-medium">{email}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl bg-white p-6 ring-1 ring-dolce-secondary/50"
      >
        <h2 className="font-playfair text-lg font-semibold">Change password</h2>

        {message && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <input
          name="oldPassword"
          type="password"
          required
          className="input-field"
          placeholder="Current password"
        />
        <input
          name="newPassword"
          type="password"
          required
          minLength={6}
          className="input-field"
          placeholder="New password"
        />
        <input
          name="confirm"
          type="password"
          required
          minLength={6}
          className="input-field"
          placeholder="Confirm new password"
        />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
