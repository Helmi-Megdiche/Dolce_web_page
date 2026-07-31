"use client";

import {
  ChangeEvent,
  DragEvent,
  KeyboardEvent,
  useRef,
  useState,
} from "react";
import { ImagePlus, Link2, Loader2, Trash2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";

type ImageUploadFieldProps = {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export default function ImageUploadField({
  value,
  onChange,
  disabled = false,
}: ImageUploadFieldProps) {
  const t = useTranslations("admin");
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [showUrl, setShowUrl] = useState(false);

  async function uploadFile(file: File) {
    if (disabled || uploading) return;

    setError("");
    setUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || t("imageUploadFailed"));
        return;
      }

      onChange(data.url as string);
      setShowUrl(false);
    } catch {
      setError(t("imageUploadFailed"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  }

  return (
    <div className="space-y-2">
      <p className="admin-label mb-0">{t("image")}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        disabled={disabled || uploading}
        onChange={onFileChange}
      />

      {value ? (
        <div className="overflow-hidden rounded-2xl border border-dolce-secondary/70 bg-dolce-secondary/20 dark:border-white/10 dark:bg-[#2a1f18]">
          <div className="relative aspect-[16/10] bg-dolce-secondary/40 dark:bg-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt=""
              className="h-full w-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-white">
                <Loader2 size={28} className="animate-spin" />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 p-3">
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full bg-dolce-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#6f4a2f] disabled:opacity-50 dark:bg-dolce-accent dark:text-dolce-text dark:hover:bg-[#c4925f]"
            >
              <Upload size={13} />
              {t("changeImage")}
            </button>
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => {
                onChange("");
                setError("");
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              <Trash2 size={13} />
              {t("removeImage")}
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
          onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!disabled && !uploading) inputRef.current?.click();
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragging(false);
          }}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
            dragging
              ? "border-dolce-accent bg-dolce-accent/10"
              : "border-dolce-secondary/80 bg-dolce-secondary/20 hover:border-dolce-accent hover:bg-dolce-secondary/40 dark:border-white/15 dark:bg-[#2a1f18] dark:hover:border-dolce-accent dark:hover:bg-white/5"
          } ${disabled || uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-dolce-primary/15 text-dolce-primary dark:bg-dolce-accent/20 dark:text-dolce-accent">
            {uploading ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <ImagePlus size={22} />
            )}
          </div>
          <p className="text-sm font-medium text-dolce-text dark:text-[#f5e6d3]">
            {uploading ? t("imageUploading") : t("imageDropHint")}
          </p>
          <p className="mt-1 text-xs text-dolce-text/50 dark:text-white/40">
            {t("imageFormatsHint")}
          </p>
        </div>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setShowUrl((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-dolce-primary transition hover:underline dark:text-dolce-accent"
      >
        <Link2 size={12} />
        {showUrl ? t("hideImageUrl") : t("useImageUrl")}
      </button>

      {showUrl && (
        <input
          className="input-field"
          placeholder={t("imageUrl")}
          value={value}
          disabled={disabled || uploading}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {error && <p className="admin-alert-error">{error}</p>}
    </div>
  );
}
