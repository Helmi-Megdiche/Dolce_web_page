"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/menu", label: "Menu" },
  { href: "/reservation", label: "Réservation" },
  { href: "/about", label: "À propos" },
];

export default function Navbar({ phone }: { phone?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-dolce-secondary/60 bg-dolce-bg/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-playfair text-2xl font-bold text-dolce-primary">
          Dolce
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition hover:text-dolce-primary ${
                pathname === link.href
                  ? "text-dolce-primary"
                  : "text-dolce-text/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="flex items-center gap-1.5 text-sm text-dolce-accent"
            >
              <Phone size={16} />
              {phone}
            </a>
          )}
        </div>

        <button
          type="button"
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-dolce-secondary bg-dolce-bg px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === link.href
                    ? "bg-dolce-secondary text-dolce-primary"
                    : "text-dolce-text/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
