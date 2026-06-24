// app/auth/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Globe, Loader2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };

function ForgotPasswordForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="w-full max-w-md text-center">
        <motion.div variants={fadeInUp} className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('auth.checkYourEmail', 'Check your email')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            {t('auth.resetLinkSent', 'We have sent a password reset link to')} <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>.
          </p>
          <Button variant="outline" className="mt-6 w-full h-11 border-slate-200 dark:border-slate-700" onClick={() => setIsSubmitted(false)}>
            {t('auth.tryAnotherEmail', 'Try another email')}
          </Button>
          <a href="/auth/login" className="flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 transition-colors pt-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('auth.backToSignIn', 'Back to sign in')}
          </a>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="w-full max-w-md">
      <motion.div variants={fadeInUp}>
        <Card className="border-0 shadow-none sm:border sm:shadow-sm bg-transparent sm:bg-card">
          <CardHeader className="space-y-1 px-0 sm:px-6">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('auth.resetPassword', 'Reset password')}
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              {t('auth.resetPasswordDescription', "Enter your email address and we'll send you a link to reset your password.")}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0 sm:px-6">
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

              {error && (
                <p className="text-red-500 text-sm bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg border border-red-200 dark:border-red-500/20">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full h-11 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('auth.sendingLink', 'Sending link...')}
                  </>
                ) : (
                  t('auth.sendResetLink', 'Send reset link')
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              <a href="/auth/login" className="inline-flex items-center font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('auth.backToSignIn', 'Back to sign in')}
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default function ForgotPasswordPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full border-2 border-white" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full border-2 border-white" />
        </div>
        <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-32 right-24 w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center mx-auto mb-8">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">{t('auth.welcomeTo', 'Welcome to')} LaoTMS</h1>
            <p className="text-lg text-teal-100 max-w-md mx-auto leading-relaxed">
              {t('auth.loginSubtitle', 'Discover the beauty of Laos. Manage attractions, plan trips, and explore the land of a million elephants.')}
            </p>
          </motion.div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-slate-950">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}