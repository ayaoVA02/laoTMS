"use client";

import { motion } from "framer-motion";
import { Lock, ShieldCheck, UserPlus, LogIn } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface LoginRequiredProps {
  title?: string;
  description?: string;
  redirectTo?: string;
}

export default function LoginRequired({
  title,
  description,
  redirectTo = "/dashboard",
}: LoginRequiredProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm text-center"
      >
        {/* Icon */}
        <div className="relative w-18 h-18 mx-auto mb-6">
          <div className="w-[72px] h-[72px] mx-auto relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-[20px] bg-muted border border-border" />
            <div className="absolute inset-[6px] rounded-[14px] bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Label */}
        <p className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase mb-2">
          {t("loginRequired.authRequired", "Authentication required")}
        </p>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-foreground mb-3 leading-snug">
          {title || t("loginRequired.title", "Sign in to continue")}
        </h2>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-xs mx-auto">
          {description || t("loginRequired.description", "This page is only available to registered users. Sign in or create a free account to access it.")}
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap mb-8">
          <Link
            href={`/auth/login?redirect=${redirectTo}`}
            className="inline-flex items-center gap-2 px-5 h-10 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-sm font-medium transition-all shadow-sm shadow-teal-500/20"
          >
            <LogIn className="w-4 h-4" />
            {t("loginRequired.signIn", "Sign in")}
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-5 h-10 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-sm font-medium transition-all"
          >
            <UserPlus className="w-4 h-4" />
            {t("loginRequired.createAccount", "Create account")}
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 pt-5 border-t border-border flex-wrap">
          {(
            [
            { icon: ShieldCheck, label: t("loginRequired.secureLogin", "Secure login") },
            { icon: (props: any) => (
              <svg className="w-3.5 h-3.5 text-teal-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            ), label: t("loginRequired.googleSupported", "Google supported") },
            { icon: () => <span className="text-teal-500 text-xs">✦</span>, label: t("loginRequired.freeToJoin", "Free to join") },
            ] as Array<{ icon: React.ElementType; label: string }>
          ).map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="w-3.5 h-3.5 text-teal-500" />
                {item.label}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}