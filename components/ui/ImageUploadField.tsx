"use client";

import { useState } from "react";
import { ImagePlus, Link2, Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { UploadDropzone } from "@/lib/uploadthing";

type ImageUploadFieldProps = {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

function fileUrl(
  file: { ufsUrl?: string; url?: string; appUrl?: string }
): string {
  return file.ufsUrl || file.url || file.appUrl || "";
}

export default function ImageUploadField({
  value,
  onChange,
  disabled = false,
}: ImageUploadFieldProps) {
  const t = useTranslations("admin");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showUrl, setShowUrl] = useState(false);

  return (
    <div className="space-y-2">
      <p className="admin-label mb-0">{t("image")}</p>

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
          <div className="flex flex-wrap items-center gap-2 p-3">
            <div className={disabled ? "pointer-events-none opacity-50" : ""}>
              <UploadDropzone
                endpoint="imageUploader"
                config={{ mode: "auto" }}
                appearance={{
                  container:
                    "!mt-0 !min-h-0 !w-auto !border-0 !bg-transparent !p-0 !shadow-none",
                  uploadIcon: "hidden",
                  label: "hidden",
                  allowedContent: "hidden",
                  button:
                    "ut-ready:bg-dolce-primary ut-ready:text-white ut-uploading:cursor-not-allowed ut-uploading:bg-dolce-primary/70 after:bg-dolce-accent m-0 rounded-full bg-dolce-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#6f4a2f] dark:bg-dolce-accent dark:text-dolce-text dark:hover:bg-[#c4925f]",
                }}
                content={{
                  button({ ready, isUploading }) {
                    if (isUploading) return t("imageUploading");
                    if (ready) return t("changeImage");
                    return t("imageUploading");
                  },
                }}
                onUploadBegin={() => {
                  setError("");
                  setUploading(true);
                }}
                onClientUploadComplete={(res) => {
                  setUploading(false);
                  const url = res?.[0] ? fileUrl(res[0]) : "";
                  if (url) {
                    onChange(url);
                    setShowUrl(false);
                  } else {
                    setError(t("imageUploadFailed"));
                  }
                }}
                onUploadError={(err) => {
                  setUploading(false);
                  setError(err.message || t("imageUploadFailed"));
                }}
              />
            </div>
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
          className={`rounded-2xl border-2 border-dashed border-dolce-secondary/80 bg-dolce-secondary/20 p-2 transition dark:border-white/15 dark:bg-[#2a1f18] ${
            disabled ? "pointer-events-none opacity-60" : ""
          }`}
        >
          <div className="mb-1 flex flex-col items-center pt-4 text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-dolce-primary/15 text-dolce-primary dark:bg-dolce-accent/20 dark:text-dolce-accent">
              {uploading ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <ImagePlus size={22} />
              )}
            </div>
          </div>
          <UploadDropzone
            endpoint="imageUploader"
            config={{ mode: "auto" }}
            appearance={{
              container:
                "!mt-0 min-h-[8rem] w-full border-0 bg-transparent p-2 shadow-none",
              uploadIcon: "hidden",
              label:
                "text-sm font-medium text-dolce-text dark:text-[#f5e6d3]",
              allowedContent:
                "text-xs text-dolce-text/50 dark:text-white/40",
              button:
                "ut-ready:bg-dolce-primary ut-ready:text-white ut-uploading:cursor-not-allowed ut-uploading:bg-dolce-primary/70 after:bg-dolce-accent rounded-full bg-dolce-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6f4a2f] dark:bg-dolce-accent dark:text-dolce-text dark:hover:bg-[#c4925f]",
            }}
            content={{
              label({ ready, isUploading }) {
                if (isUploading) return t("imageUploading");
                if (ready) return t("imageDropHint");
                return t("imageUploading");
              },
              allowedContent: t("imageFormatsHint"),
              button({ ready, isUploading }) {
                if (isUploading) return t("imageUploading");
                if (ready) return t("changeImage");
                return t("imageUploading");
              },
            }}
            onUploadBegin={() => {
              setError("");
              setUploading(true);
            }}
            onClientUploadComplete={(res) => {
              setUploading(false);
              const url = res?.[0] ? fileUrl(res[0]) : "";
              if (url) {
                onChange(url);
                setShowUrl(false);
              } else {
                setError(t("imageUploadFailed"));
              }
            }}
            onUploadError={(err) => {
              setUploading(false);
              setError(err.message || t("imageUploadFailed"));
            }}
          />
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
