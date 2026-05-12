"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
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

const demoRoles = [
  { role: "ADMIN" as const, label: "Admin", color: "from-teal-500 to-emerald-600" },
  { role: "STAFF" as const, label: "Staff", color: "from-emerald-500 to-teal-600" },
  { role: "ENTREPRENEUR" as const, label: "Entrepreneur", color: "from-teal-600 to-emerald-700" },
  { role: "TOURIST" as const, label: "Tourist", color: "from-emerald-600 to-teal-700" },
];

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { loginAsDemo, login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await login(email, password);
    if (result.success) {
      router.push("/dashboard");
    }
    setIsLoading(false);

    if(result.success === false) {
      setError("Invalid email or password");
    }
  };

  const handleDemoLogin = (role: "ADMIN" | "STAFF" | "ENTREPRENEUR" | "TOURIST") => {
    // loginAsDemo(role);
    router.push("/dashboard");
  };

  const handleGoogleLogin = async() => {
    // loginAsDemo("TOURIST");
    const {data, error} = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })

    console.log("Google login data:", data, "error:", error);
    // router.push("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full border-2 border-white" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full border-2 border-white" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full border border-white" />
        </div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 right-24 w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
        />
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-40 left-24 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
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
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {t("auth.welcomeTo", "Welcome to")} LaoTMS
            </h1>
            <p className="text-lg text-teal-100 max-w-md mx-auto leading-relaxed">
              {t(
                "auth.loginSubtitle",
                "Discover the beauty of Laos. Manage attractions, plan trips, and explore the land of a million elephants."
              )}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-12 grid grid-cols-3 gap-8 text-center"
          >
            <div>
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-sm text-teal-200">
                {t("auth.attractions", "Attractions")}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-sm text-teal-200">
                {t("auth.tourists", "Tourists")}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">17</div>
              <div className="text-sm text-teal-200">
                {t("auth.provinces", "Provinces")}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-slate-950">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          {/* <motion.div variants={fadeInUp} className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              LaoTMS
            </span>
          </motion.div> */}

          <motion.div variants={fadeInUp}>
            <Card className="border-0 shadow-none sm:border sm:shadow-sm bg-transparent sm:bg-card">
              <CardHeader className="space-y-1 px-0 sm:px-6">
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                  {t("auth.signIn", "Sign in")}
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  {t(
                    "auth.signInDescription",
                    "Enter your credentials to access your account"
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
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#4285F4" />
                    <path
                      d="M12 6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6z"
                      fill="white"
                    />
                    <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" fill="#4285F4" />
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

                {/* Login form */}
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        className="pl-10 h-11 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                        {t("auth.password", "Password")}
                      </Label>
                      <a
                        href="#"
                        className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                      >
                        {t("auth.forgotPassword", "Forgot password?")}
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-11 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
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

                  <div>
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? t("auth.signingIn", "Signing in...")
                      : t("auth.signIn", "Sign in")}
                  </Button>
                </form>

                {/* Demo login buttons */}
                <div className="mt-6">
                  <p className="text-xs text-center text-slate-400 mb-3">
                    {t("auth.demoAccounts", "Demo Accounts")}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {demoRoles.map(({ role, label, color }) => (
                      <Button
                        key={role}
                        variant="outline"
                        size="sm"
                        className={`h-9 border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 transition-all`}
                        onClick={() => handleDemoLogin(role)}
                      >
                        <span
                          className={`w-2 h-2 rounded-full bg-gradient-to-r ${color} mr-2`}
                        />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Register link */}
                <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  {t("auth.dontHaveAccount", "Don't have an account?")}{" "}
                  <a
                    href="/auth/register"
                    className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                  >
                    {t("auth.signUp", "Sign up")}
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
