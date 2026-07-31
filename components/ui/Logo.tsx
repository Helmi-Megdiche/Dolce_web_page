"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
}

const sizes = {
  sm: { width: 40, height: 40, className: "h-9 w-9" },
  md: { width: 56, height: 56, className: "h-12 w-12" },
  lg: { width: 96, height: 96, className: "h-20 w-20" },
};

export default function Logo({
  href = "/",
  size = "md",
  className = "",
  priority = false,
}: LogoProps) {
  const s = sizes[size];

  const image = (
    <Image
      src="/images/dolce-logo.png"
      alt="Dolce"
      width={s.width}
      height={s.height}
      priority={priority}
      className={`${s.className} rounded-xl object-cover shadow-md ring-1 ring-black/5 drop-shadow-sm dark:ring-white/10 ${className}`}
    />
  );

  if (!href) return image;

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 transition hover:opacity-90"
      aria-label="Dolce"
    >
      {image}
    </Link>
  );
}
