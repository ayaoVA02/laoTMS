'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Globe, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };

// Unnested Form Component to fix Next.js 13 dynamic/lazy component mounting rules
function LoginFormContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error ?? 'Invalid email or password');
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="w-full max-w-md">
      <motion.div variants={fadeInUp}>
        <Card className="border-0 shadow-none sm:border sm:shadow-sm bg-transparent sm:bg-card">
          <CardHeader className="space-y-1 px-0 sm:px-6">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('auth.signIn', 'Sign in')}
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              {t('auth.signInDescription', 'Enter your credentials to access your account')}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0 sm:px-6">
            {/* Google Login */}
            <Button
              variant="outline"
              className="w-full h-11 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 mb-4"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t('auth.continueWithGoogle', 'Continue with Google')}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-950 px-3 text-slate-400 sm:bg-card">
                  {t('auth.orContinueWith', 'Or continue with')}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                  {t('auth.email', 'Email')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                    {t('auth.password', 'Password')}
                  </Label>
                  <a href="/auth/forgot-password" className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 transition-colors font-medium">
                    {t('auth.forgotPassword', 'Forgot password?')}
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    className="pl-10 pr-10 h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg border border-red-200 dark:border-red-500/20">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</>
                ) : (
                  t('auth.signIn', 'Sign in')
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              {t("auth.dontHaveAccount", "Don't have an account?")}{' '}
              <a href="/auth/register" className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 transition-colors">
                {t('auth.signUp', 'Sign up')}
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// Main Page Component (Must always be default export)
export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full border-2 border-white" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full border-2 border-white" />
        </div>
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-32 right-24 w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
        />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center mx-auto mb-8">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to LaoTMS
            </h1>
            <p className="text-lg text-teal-100 max-w-md mx-auto leading-relaxed">
              {t('auth.loginSubtitle', 'Discover the beauty of Laos. Manage attractions, plan trips, and explore the land of a million elephants.')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-slate-950">
        {/* We keep the inner content component safe directly inside the document hierarchy */}
        <LoginFormContent />
      </div>
    </div>
  );
}