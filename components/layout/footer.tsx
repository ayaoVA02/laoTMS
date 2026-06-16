"use client";

import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { logoLaoTMS } from "@/assets";

const quickLinks = [
  { href: "/", labelKey: "nav.home" },
  { href: "/attractions", labelKey: "nav.attractions" },
  { href: "/travel-plans", labelKey: "nav.travelPlans" },
  { href: "/map", labelKey: "nav.map" },
];

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  );
}

const socialLinks = [
  { name: "Facebook",  href: "https://www.facebook.com/share/17kVMKDmFm/", icon: Facebook  },
  { name: "Instagram", href: "https://instagram.com",                         icon: Instagram },
  { name: "TikTok",    href: "https://tiktok.com",                            icon: TikTokIcon },
  { name: "YouTube",   href: "https://youtube.com",                           icon: Youtube   },
];

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Column 1: Logo & Description — Centered on mobile, aligned left on desktop */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex flex-col items-center text-center lg:items-start lg:text-left gap-4">
            <Link href="/" className="inline-block">
              <Image
                src={logoLaoTMS}
                alt="LaoTMS Logo"
                width={220} 
                height={65}
                className="w-56 h-auto sm:w-64 lg:w-52 object-contain"
                priority
              />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              {t(
                "footer.description",
                "Your gateway to discovering the beauty, culture, and adventure of Laos. Plan your perfect trip with ease.",
              )}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col items-start">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t("footer.quickLinks", "Quick Links")}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-teal-400 transition-colors duration-200"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="flex flex-col items-start">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t("footer.contact", "Contact")}
            </h3>
            <ul className="space-y-3 w-full">
              <li>
                <a
                  href="mailto:laotms.travel@gmail.com"
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-teal-400 transition-colors duration-200 break-all"
                >
                  <Mail className="w-4 h-4 shrink-0 text-teal-500" />
                  laotms.travel@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+8562098009597"
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-teal-400 transition-colors duration-200"
                >
                  <Phone className="w-4 h-4 shrink-0 text-teal-500" />
                  +856 20 98009597
                </a>
              </li>
              <li>
                <a
                  href="tel:+8562054344402"
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-teal-400 transition-colors duration-200"
                >
                  <Phone className="w-4 h-4 shrink-0 text-teal-500" />
                  +856 20 54344402
                </a>
              </li>
              <li>
                <a
                  href="tel:+8562077846748"
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-teal-400 transition-colors duration-200"
                >
                  <Phone className="w-4 h-4 shrink-0 text-teal-500" />
                  +856 20 77846748
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2.5 text-sm text-slate-400">
                  <MapPin className="w-4 h-4 shrink-0 text-teal-500 mt-0.5" />
                  <span>{t("footer.address", "Vientiane Capital, Laos")}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Follow Us */}
          <div className="flex flex-col items-start">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t("footer.followUs", "Follow Us")}
            </h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-teal-500/20 border border-slate-700 hover:border-teal-500/50 flex items-center justify-center text-slate-400 hover:text-teal-400 transition-all duration-200"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-slate-500">
              {t("footer.socialHint", "Stay connected for travel tips and updates")}
            </p>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} LaoTMS.{" "}
              {t("footer.rights", "All rights reserved.")}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              {t("footer.madeWith", "Made with 🇱🇦")}{" "}
              {t("footer.inLaos", "in Laos")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}