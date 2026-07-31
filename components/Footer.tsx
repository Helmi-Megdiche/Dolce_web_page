"use client";

import { MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { InstagramIcon, FacebookIcon, TikTokIcon } from "@/components/SocialIcons";
import Logo from "@/components/ui/Logo";

interface FooterProps {
  phone?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
}

export default function Footer({
  phone = "42 386 082",
  address = "V5HH+4FX, Ariana, Tunisia",
  instagram,
  facebook,
  tiktok,
}: FooterProps) {
  const t = useTranslations("footer");
  const tc = useTranslations("common");

  return (
    <footer className="mt-auto border-t border-dolce-secondary bg-dolce-text text-dolce-secondary dark:border-white/10 dark:bg-[#120c09]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo size="sm" href="/" />
          <p className="mt-3 text-sm opacity-80">{t("tagline")}</p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            {address}
          </p>
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="flex items-center gap-2 transition hover:text-white"
          >
            <Phone size={16} />
            {phone}
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-white">{tc("followUs")}</p>
          <div className="flex gap-4">
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
                aria-label="Instagram"
              >
                <InstagramIcon size={20} />
              </a>
            )}
            {tiktok && (
              <a
                href={tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
                aria-label="TikTok"
              >
                <TikTokIcon size={20} />
              </a>
            )}
            {facebook && (
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
                aria-label="Facebook"
              >
                <FacebookIcon size={20} />
              </a>
            )}
          </div>
          <Link
            href="/admin/login"
            className="mt-2 text-xs opacity-40 transition hover:opacity-70"
          >
            {tc("admin")}
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs opacity-60">
        © {new Date().getFullYear()} {t("rights")}
      </div>
    </footer>
  );
}
