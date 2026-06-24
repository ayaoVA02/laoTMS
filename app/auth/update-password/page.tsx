
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };

export default function UpdatePasswordPage() {
  const { t } = useTranslation();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // AIRTIGHT BROWSER LOCKDOWN
  useEffect(() => {
    // 1. Blocks reloading or closing the tab entirely
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Security Action Required: You cannot leave this page.';
      return e.returnValue;
    };

    // 2. Traps back/forward browser navigation buttons completely
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };

    // 3. Blocks system keys (F5, Ctrl+R, Alt+Left/Right arrows)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F5' || 
        ((e.ctrlKey || e.metaKey) && e.key === 'r') || 
        (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight'))
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch', 'Passwords do not match'));
      return;
    }

    setIsLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      setIsLoading(false);
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut();
    setIsLoading(false);
    setIsSuccess(true);

    // Only allowed exit point: Redirect to clean login window after success
    setTimeout(() => {
      window.location.href = '/auth/login';
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 min-h-screen w-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 select-none">
      {/* Background Decorative Gradients - Unclickable */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div 
        variants={staggerContainer} 
        initial="initial" 
        animate="animate" 
        className="w-full max-w-md relative z-10"
      >
        <Card className="border border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl shadow-black/50">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              {isSuccess ? t('auth.passwordUpdated', 'Password Updated!') : t('auth.createNewPassword', 'Security Update Required')}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {isSuccess 
                ? t('auth.redirectingToLogin', 'Your account is secured. Redirecting to login...') 
                : t('auth.enterNewPasswordDesc', 'You must set a new password before you can access the platform.')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isSuccess ? (
              <motion.div variants={fadeInUp} className="flex flex-col items-center justify-center py-6 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-pulse" />
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">
                    {t('auth.newPassword', 'New Password')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter modern strong password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null); }}
                      className="pl-10 pr-10 h-11 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-teal-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">
                    {t('auth.confirmNewPassword', 'Confirm New Password')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                      className="pl-10 h-11 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-teal-500"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-red-400 text-sm bg-red-950/30 px-3 py-2 rounded-lg border border-red-900/50">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium shadow-lg shadow-teal-500/20 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Configuration...</>
                  ) : (
                    t('auth.updatePasswordBtn', 'Confirm & Unlock Account')
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}