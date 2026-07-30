import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { InstagramIcon, FacebookIcon, TikTokIcon } from "@/components/SocialIcons";

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
  return (
    <footer className="mt-auto border-t border-dolce-secondary bg-dolce-text text-dolce-secondary">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <h3 className="font-playfair text-2xl font-bold text-white">Dolce</h3>
          <p className="mt-2 text-sm opacity-80">
            Exploring the sweet side of life
          </p>
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
          <p className="text-sm font-medium text-white">Suivez-nous</p>
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
            Admin
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs opacity-60">
        © {new Date().getFullYear()} Dolce.tn — Ariana, Tunisia
      </div>
    </footer>
  );
}
