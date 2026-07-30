import { Phone, MapPin, ExternalLink } from "lucide-react";
import { getSettings, getHours } from "@/lib/data";
import {
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
} from "@/components/SocialIcons";

export const dynamic = "force-dynamic";

const dayFr: Record<string, string> = {
  Monday: "Lundi",
  Tuesday: "Mardi",
  Wednesday: "Mercredi",
  Thursday: "Jeudi",
  Friday: "Vendredi",
  Saturday: "Samedi",
  Sunday: "Dimanche",
};

export default async function AboutPage() {
  const [settings, hours] = await Promise.all([getSettings(), getHours()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="section-title">À propos & Contact</h1>
        <p className="mt-3 text-dolce-text/70">
          Venez découvrir Dolce à Ariana
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-8">
          <div>
            <h2 className="font-playfair text-2xl font-semibold">Nous trouver</h2>
            <p className="mt-3 flex items-start gap-2 text-dolce-text/80">
              <MapPin size={18} className="mt-0.5 shrink-0 text-dolce-primary" />
              {settings.address || "V5HH+4FX, Ariana, Tunisia"}
            </p>
            <a
              href={`tel:${(settings.phone || "42386082").replace(/\s/g, "")}`}
              className="mt-3 flex items-center gap-2 text-dolce-primary transition hover:underline"
            >
              <Phone size={18} />
              {settings.phone || "42 386 082"}
            </a>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-semibold">Horaires</h2>
            <ul className="mt-4 space-y-2">
              {hours.map((h: { day: string; openTime: string; closeTime: string; isClosed: boolean }) => (
                <li
                  key={h.day}
                  className="flex justify-between border-b border-dolce-secondary/50 py-2 text-sm"
                >
                  <span>{dayFr[h.day] || h.day}</span>
                  <span className="text-dolce-text/70">
                    {h.isClosed
                      ? "Fermé"
                      : `${h.openTime} – ${h.closeTime}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-semibold">Réseaux</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-dolce-secondary px-4 py-2 text-sm transition hover:bg-dolce-accent/40"
                >
                  <InstagramIcon size={18} /> Instagram
                </a>
              )}
              {settings.tiktok_url && (
                <a
                  href={settings.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-dolce-secondary px-4 py-2 text-sm transition hover:bg-dolce-accent/40"
                >
                  <TikTokIcon size={18} /> TikTok
                </a>
              )}
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-dolce-secondary px-4 py-2 text-sm transition hover:bg-dolce-accent/40"
                >
                  <FacebookIcon size={18} /> Facebook
                </a>
              )}
            </div>
          </div>

          {settings.glovo_url && (
            <a
              href={settings.glovo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex"
            >
              Commander sur Glovo
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-dolce-secondary/50">
          <iframe
            title="Dolce location map"
            src="https://www.google.com/maps?q=V5HH%2B4FX,+Ariana,+Tunisia&output=embed"
            className="h-[420px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
