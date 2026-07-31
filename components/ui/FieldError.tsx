"use client";

import { AlertCircle } from "lucide-react";

export default function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="mt-1.5 flex items-start gap-1.5 text-sm text-amber-800 dark:text-amber-200"
    >
      <AlertCircle
        size={15}
        className="mt-0.5 shrink-0 text-dolce-accent"
        aria-hidden
      />
      <span>{message}</span>
    </p>
  );
}

export function fieldErrorClass(hasError: boolean) {
  return hasError
    ? "border-dolce-accent ring-2 ring-dolce-accent/35 dark:border-dolce-accent"
    : "";
}
