"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

const PRESET_VALUES = [
  "-10%",
  "-15%",
  "-20%",
  "-30%",
  "-50%",
  "2×1",
  "Happy Hour",
] as const;

type PresetValue = (typeof PRESET_VALUES)[number];
type Mode = "none" | PresetValue | "custom";

type DiscountLabelPickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function resolveMode(value: string): Mode {
  const trimmed = value.trim();
  if (!trimmed) return "none";
  if ((PRESET_VALUES as readonly string[]).includes(trimmed)) {
    return trimmed as PresetValue;
  }
  return "custom";
}

export default function DiscountLabelPicker({
  value,
  onChange,
  disabled = false,
}: DiscountLabelPickerProps) {
  const t = useTranslations("admin.offersPanel");
  const [mode, setMode] = useState<Mode>(() => resolveMode(value));
  const [customText, setCustomText] = useState(() =>
    resolveMode(value) === "custom" ? value : ""
  );

  useEffect(() => {
    const next = resolveMode(value);
    setMode(next);
    if (next === "custom") setCustomText(value);
    if (next === "none") setCustomText("");
  }, [value]);

  const presets = useMemo(
    () => [
      { id: "none" as const, label: t("discountNone"), value: "" },
      { id: "-10%" as const, label: "-10%", value: "-10%" },
      { id: "-15%" as const, label: "-15%", value: "-15%" },
      { id: "-20%" as const, label: "-20%", value: "-20%" },
      { id: "-30%" as const, label: "-30%", value: "-30%" },
      { id: "-50%" as const, label: "-50%", value: "-50%" },
      { id: "2×1" as const, label: t("discountBogo"), value: "2×1" },
      {
        id: "Happy Hour" as const,
        label: t("discountHappyHour"),
        value: "Happy Hour",
      },
      { id: "custom" as const, label: t("discountCustom"), value: "__custom__" },
    ],
    [t]
  );

  function selectMode(next: Mode) {
    setMode(next);
    if (next === "none") {
      onChange("");
      return;
    }
    if (next === "custom") {
      onChange(customText.trim());
      return;
    }
    onChange(next);
  }

  const preview = value.trim();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="admin-label mb-0">{t("discountLabel")}</label>
        {preview ? (
          <span className="rounded-full bg-[#ff9e8d] px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            {preview}
          </span>
        ) : (
          <span className="text-xs text-dolce-text/40 dark:text-white/30">
            {t("discountPreviewEmpty")}
          </span>
        )}
      </div>

      <p className="text-xs text-dolce-text/50 dark:text-white/40">
        {t("discountHint")}
      </p>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const active = mode === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => selectMode(preset.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                active
                  ? preset.id === "none"
                    ? "bg-dolce-text text-white dark:bg-white dark:text-dolce-text"
                    : "bg-[#ff9e8d] text-white shadow-sm"
                  : "border border-dolce-secondary/80 bg-white text-dolce-text hover:border-dolce-accent dark:border-white/15 dark:bg-[#2a1f18] dark:text-[#f5e6d3] dark:hover:border-dolce-accent"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {mode === "custom" && (
        <input
          className="input-field"
          disabled={disabled}
          value={customText}
          maxLength={24}
          placeholder={t("discountCustomPlaceholder")}
          onChange={(e) => {
            const next = e.target.value;
            setCustomText(next);
            onChange(next);
          }}
        />
      )}
    </div>
  );
}
