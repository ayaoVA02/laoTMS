"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next"; // Removed ChevronDown from import
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { register, user } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Removed role state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch", "Passwords do not match"));
      return;
    }
    setIsLoading(true);
    setError(null); // Clear previous errors
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Default role to TOURIST. Onboarding allows changing this if needed.
    const result = await register(email, password, 'TOURIST', firstName, lastName);

    if (result.success) {
      toast.success(t("auth.registrationSuccessCheckEmail", `Registration successful! Please check your email (${email}) to verify your account.`));
      router.push("/onboarding");
    }
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || "Something went wrong. Please try again.");
    }
  };

  const onboardingCompleted = user?.user_metadata?.onboarding_completed === true
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
    })
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-16 right-16 w-64 h-64 rounded-full border-2 border-white" />
          <div className="absolute bottom-32 left-16 w-80 h-80 rounded-full border-2 border-white" />
          <div className="absolute top-1/2 right-1/3 w-40 h-40 rounded-full border border-white" />
        </div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-28 left-20 w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-28 right-28 w-16 h-16 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center mx-auto mb-8">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {t("auth.joinLaoTMS", "Join LaoTMS")}
            </h1>
            <p className="text-lg text-emerald-100 max-w-md mx-auto leading-relaxed">
              {t(
                "auth.registerSubtitle",
                "Create your account and start exploring the wonders of Laos. Whether you're a tourist or an entrepreneur, we have something for you."
              )}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-12 space-y-4 text-center"
          >
            <div className="flex items-center gap-3 text-emerald-100">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                <span className="text-sm font-bold text-white">1</span>
              </div>
              <span className="text-sm">
                {t("auth.step1", "Create your free account")}
              </span>
            </div>
            <div className="flex items-center gap-3 text-emerald-100">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                <span className="text-sm font-bold text-white">2</span>
              </div>
              <span className="text-sm">
                {t("auth.step2", "Choose your role and preferences")}
              </span>
            </div>
            <div className="flex items-center gap-3 text-emerald-100">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                <span className="text-sm font-bold text-white">3</span>
              </div>
              <span className="text-sm">
                {t("auth.step3", "Start your Laos journey")}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Register form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-slate-950">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <motion.div variants={fadeInUp} className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              LaoTMS
            </span>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="border-0 shadow-none sm:border sm:shadow-sm bg-transparent sm:bg-card">
              <CardHeader className="space-y-1 px-0 sm:px-6">
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                  {t("auth.createAccount", "Create an account")}
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  {t(
                    "auth.registerDescription",
                    "Fill in the details below to get started"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                {/* Google sign in */}
                <Button
                  variant="outline"
                  className="w-full h-11 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 mb-4"
                  onClick={handleGoogleLogin}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {t("auth.continueWithGoogle", "Continue with Google")}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-950 px-3 text-slate-400 sm:bg-card">
                      {t("auth.orContinueWith", "Or continue with")}
                    </span>
                  </div>
                </div>

                {/* Register form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300">
                      {t("auth.fullName", "Full name")}
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={isLoading}
                        className="pl-10 h-11 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                      {t("auth.email", "Email")}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="pl-10 h-11 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                      {t("auth.password", "Password")}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-11 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">
                      {t("auth.confirmPassword", "Confirm password")}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 h-11 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500">
                        {t("auth.passwordMismatch", "Passwords do not match")}
                      </p>
                    )}
                  </div>

                  {/* Removed role selection */}
                  <div>
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25"
                    disabled={isLoading || !fullName || !email || !password || !confirmPassword || password !== confirmPassword}
                  >
                    {isLoading
                      ? t("auth.creatingAccount", "Creating account...")
                      : t("auth.createAccount", "Create an account")}
                  </Button>
                </form>

                {/* Login link */}
                <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  {t("auth.alreadyHaveAccount", "Already have an account?")}{" "}
                  <a
                    href="/auth/login"
                    className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                  >
                    {t("auth.signIn", "Sign in")}
                  </a>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
