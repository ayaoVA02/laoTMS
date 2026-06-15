"use client";

import { Globe, Mail, Phone, MapPin, Heart } from "lucide-react";
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

const socialLinks = [
  { name: "Facebook", href: "#" },
  { name: "Instagram", href: "#" },
  { name: "Twitter", href: "#" },
  { name: "YouTube", href: "#" },
];

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 pb-16 md:pb-0">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Logo & Description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center overflow-hidden">
                <Image
                  src={logoLaoTMS}
                  alt="LaoTMS"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                LaoTMS
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              {t("footer.description", "Your gateway to discovering the beauty, culture, and adventure of Laos. Plan your perfect trip with ease.")}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
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
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t("footer.contact", "Contact")}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:info@laotms.com"
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-teal-400 transition-colors duration-200"
                >
                  <Mail className="w-4 h-4 shrink-0 text-teal-500" />
                  info@laotms.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+8562012345678"
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-teal-400 transition-colors duration-200"
                >
                  <Phone className="w-4 h-4 shrink-0 text-teal-500" />
                  +856 20 1234 5678
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2.5 text-sm text-slate-400">
                  <MapPin className="w-4 h-4 shrink-0 text-teal-500 mt-0.5" />
                  <span>
                    {t("footer.address", "Vientiane Capital, Laos")}
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Follow Us */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t("footer.followUs", "Follow Us")}
            </h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-teal-500/20 border border-slate-700 hover:border-teal-500/50 flex items-center justify-center text-slate-400 hover:text-teal-400 transition-all duration-200"
                >
                  <span className="text-xs font-semibold">
                    {social.name.charAt(0)}
                  </span>
                </a>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500">
              {t("footer.socialHint", "Stay connected for travel tips and updates")}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} LaoTMS. {t("footer.rights", "All rights reserved.")}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              {t("footer.madeWith", "Made with")}{" "}
              <Heart className="w-3.5 h-3.5 text-teal-500 fill-teal-500" />{" "}
              {t("footer.inLaos", "in Laos")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
