'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, User, Phone, Globe, MapPin, Briefcase, ChevronRight, Loader2, Check } from 'lucide-react';
import { useAuthStore, UserRole } from '@/stores/auth-store';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import toast from 'react-hot-toast';

const R2_UPLOAD_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_URL;

// ─── Upload helper ────────────────────────────────────────────────────────────
async function uploadToR2(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const key = `profiles/${userId}-${Date.now()}.${ext}`;
  const res = await fetch(`${R2_UPLOAD_URL}/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!res.ok) throw new Error('Upload failed');
  // Return the public URL — adjust if your R2 bucket has a custom domain
  return `${R2_UPLOAD_URL}/${key}`;
}

// ─── Gender options ───────────────────────────────────────────────────────────
const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
];

// ─── Avatar options ───────────────────────────────────────────────────────────
const DEFAULT_AVATARS = [
  { id: 1, emoji: '👨‍💼', label: 'Professional' },
  { id: 2, emoji: '👩‍💼', label: 'Professional F' },
  { id: 3, emoji: '👨‍🌾', label: 'Farmer' },
  { id: 4, emoji: '👩‍🌾', label: 'Farmer F' },
  { id: 5, emoji: '👨‍🎓', label: 'Student' },
  { id: 6, emoji: '👩‍🎓', label: 'Student F' },
  { id: 7, emoji: '🧑‍🚀', label: 'Traveler' },
  { id: 8, emoji: '👳‍♂️', label: 'Tourist' },
];

// ─── Lao provinces ───────────────────────────────────────────────────────────
const PROVINCES = [
  'Vientiane Capital', 'Phongsali', 'Luang Namtha', 'Oudomxay', 'Bokeo',
  'Luang Prabang', 'Huaphanh', 'Xayabury', 'Xieng Khouang', 'Vientiane',
  'Borikhamxay', 'Khammouane', 'Savannakhet', 'Saravane', 'Sekong',
  'Champasack', 'Attapeu', 'Xaysomboun',
];

// ─── Fade variants ────────────────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const  // ✅ add "as const"
    }
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.25 }
  },
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const { user, initAuth } = useAuthStore();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);




  // shared
  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] ?? '');
  const [lastName, setLastName] = useState(user?.name?.split(' ').slice(1).join(' ') ?? '');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('');
  const [gender, setGender] = useState('MALE');
  const [profileImg, setProfileImg] = useState(user?.avatar ?? '');
  const [previewUrl, setPreviewUrl] = useState(user?.avatar ?? '');
  const [selectedRole, setSelectedRole] = useState<'TOURIST' | 'ENTREPRENEUR'>(
    (user?.role as 'TOURIST' | 'ENTREPRENEUR') ?? 'TOURIST'
  );

  const isTourist = selectedRole === 'TOURIST';
  const isEntrepreneur = selectedRole === 'ENTREPRENEUR';;

  // tourist only
  const [preferences, setPreferences] = useState('');

  // entrepreneur only
  const [position, setPosition] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');

  const [saving, setSaving] = useState(false);

  // ── localStorage persistence ──────────────────────────────────────────────────
  const STORAGE_KEY = 'onboarding_form_data';


  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }
      setSessionUser(session.user);
      setLoadingSession(false);

      // Pre-fill name from Google metadata if available
      const meta = session.user.user_metadata;
      if (meta?.full_name) {
        const parts = meta.full_name.split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || '');
      }

      console.log('User metadata:', meta.avatar_url);
      if (meta?.avatar_url) {
        setPreviewUrl(meta.avatar_url);
        setProfileImg(meta.avatar_url);
      }
      // If user already has a role, pre-select it
      if (meta?.role) {
        setSelectedRole(meta.role);
      }
    };
    getSession();
  }, []);


  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setPhone(data.phone || '');
          setNationality(data.nationality || '');
          setGender(data.gender || 'MALE');
          setSelectedRole(data.selectedRole || 'TOURIST');
          setPreferences(data.preferences || '');
          setPosition(data.position || '');
          setProvince(data.province || '');
          setDistrict(data.district || '');
          setVillage(data.village || '');
          // Image data is not restored from localStorage
        } catch (err) {
          console.error('Failed to load saved form data:', err);
        }
      }
    }
  }, []);

  // Save to localStorage whenever form data changes (excluding large image data)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const formData = {
        firstName,
        lastName,
        phone,
        nationality,
        gender,
        selectedRole,
        preferences,
        position,
        province,
        district,
        village,
        // Note: profileImg and previewUrl are NOT saved to avoid exceeding localStorage quota
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      } catch (err) {
        console.warn('Failed to save form data to localStorage:', err);
      }
    }
  }, [firstName, lastName, phone, nationality, gender, selectedRole, preferences, position, province, district, village]);

  // ── avatar pick ──────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create blob URL for immediate preview
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);

    // Convert to data URL for persistent storage
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setProfileImg(dataUrl); // Save data URL for persistence
      toast.success('Photo selected!');
    };
    reader.readAsDataURL(file);
  };

  // ── save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!sessionUser) return;
    const userId = sessionUser.id;

    setSaving(true);
    try {
      // ✅ STEP 1: Save role to auth metadata FIRST
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          role: selectedRole,
          is_active: true,
          first_name: firstName,
          last_name: lastName,
        }
      });

      if (updateError) throw updateError;
      console.log('Role saved to metadata:', selectedRole);

      // ✅ STEP 2: Save to profile table
      if (selectedRole === 'TOURIST') {
        const { data: existing } = await supabase
          .from('tourists')
          .select('tourist_id')
          .eq('user_id', userId)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from('tourists')
            .update({
              first_name: firstName,
              last_name: lastName,
              phone,
              nationality,
              gender,
              profile_img: profileImg,
              preferences,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('tourists')
            .insert({
              user_id: userId,
              first_name: firstName,
              last_name: lastName,
              phone,
              nationality,
              gender,
              profile_img: profileImg,
              preferences,
            });
          if (error) throw error;
        }
      }

      if (selectedRole === 'ENTREPRENEUR') {
        const { data: existing } = await supabase
          .from('entrepreneurs')
          .select('en_id')
          .eq('user_id', userId)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from('entrepreneurs')
            .update({
              first_name: firstName,
              last_name: lastName,
              phone,
              nationality,
              gender,
              profile_img: profileImg,
              position,
              province,
              district,
              village,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('entrepreneurs')
            .insert({
              user_id: userId,
              first_name: firstName,
              last_name: lastName,
              phone,
              nationality,
              gender,
              profile_img: profileImg,
              position,
              province,
              district,
              village,
            });
          if (error) throw error;
        }
      }

      // ✅ STEP 3: Refresh auth store — now role exists so initAuth will work
      await initAuth();

      if (typeof window !== 'undefined') {
        localStorage.removeItem('onboarding_form_data');
      }

      toast.success('Profile saved! Welcome to LaoTMS 🎉');
      router.push('/dashboard');
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  // ── role badge ────────────────────────────────────────────────────────────────
  const roleBadge = isTourist
    ? { icon: '🧳', label: 'Tourist', color: 'from-teal-500 to-cyan-500' }
    : { icon: '🏢', label: 'Entrepreneur', color: 'from-emerald-500 to-green-500' };


  if (loadingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20 flex items-center justify-center p-4">

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-teal-500/10 dark:bg-teal-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl" />
      </div>

      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        className="relative w-full max-w-xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${roleBadge.color} text-white text-sm font-medium mb-4`}>
            <span>{roleBadge.icon}</span>
            <span>{roleBadge.label}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white mb-2">Set up your profile</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Tell us a bit about yourself to personalise your experience
          </p>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800 rounded-2xl p-8 shadow-2xl">

          {/* Avatar */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 group-hover:border-teal-500 transition-colors flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-500" />
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-teal-500 hover:bg-teal-400 flex items-center justify-center shadow-lg transition-colors"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Form grid */}
          <div className="space-y-5">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" icon={<User className="w-4 h-4" />}>
                <Input
                  placeholder="Somchai"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-teal-500 h-11"
                />
              </Field>
              <Field label="Last name" icon={<User className="w-4 h-4" />}>
                <Input
                  placeholder="Vongvichit"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-teal-500 h-11"
                />
              </Field>
            </div>


            <div className="space-y-1.5 mb-6">
              <Label className="text-slate-700 dark:text-slate-300 text-sm">I am a...</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedRole('TOURIST')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${selectedRole === 'TOURIST'
                      ? 'border-teal-500 bg-teal-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                    }`}
                >
                  <div className="text-2xl mb-1">🧳</div>
                  <div className="font-semibold text-slate-950 dark:text-white text-sm">Tourist</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Explore Laos</div>
                </button>

                <button
                  onClick={() => setSelectedRole('ENTREPRENEUR')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${selectedRole === 'ENTREPRENEUR'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                    }`}
                >
                  <div className="text-2xl mb-1">🏢</div>
                  <div className="font-semibold text-slate-950 dark:text-white text-sm">Entrepreneur</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">List attractions</div>
                </button>
              </div>
            </div>

            {/* Phone + Gender */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone" icon={<Phone className="w-4 h-4" />}>
                <Input
                  placeholder="+856 20 XXXX XXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-teal-500 h-11"
                />
              </Field>
              <Field label="Gender" icon={<User className="w-4 h-4" />}>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-11 focus:border-teal-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    {GENDERS.map(g => (
                      <SelectItem key={g.value} value={g.value} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Nationality */}
            <Field label="Nationality" icon={<Globe className="w-4 h-4" />}>
              <Input
                placeholder="Lao"
                value={nationality}
                onChange={e => setNationality(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-teal-500 h-11"
              />
            </Field>

            {/* ── TOURIST ONLY ─────────────────────────────────────────────── */}
            <AnimatePresence>
              {isTourist && (
                <motion.div variants={fadeUp} initial="initial" animate="animate" exit="exit">
                  <Field label="Travel preferences" icon={<Globe className="w-4 h-4" />}>
                    <Input
                      placeholder="e.g. nature, culture, food..."
                      value={preferences}
                      onChange={e => setPreferences(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-teal-500 h-11"
                    />
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── ENTREPRENEUR ONLY ────────────────────────────────────────── */}
            <AnimatePresence>
              {isEntrepreneur && (
                <motion.div
                  variants={fadeUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-5"
                >
                  <Field label="Position / Job title" icon={<Briefcase className="w-4 h-4" />}>
                    <Input
                      placeholder="e.g. Business Owner"
                      value={position}
                      onChange={e => setPosition(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-teal-500 h-11"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Province" icon={<MapPin className="w-4 h-4" />}>
                      <Select value={province} onValueChange={setProvince}>
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-11 focus:border-teal-500">
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-h-60">
                          {PROVINCES.map(p => (
                            <SelectItem key={p} value={p} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="District" icon={<MapPin className="w-4 h-4" />}>
                      <Input
                        placeholder="District"
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-teal-500 h-11"
                      />
                    </Field>
                  </div>

                  <Field label="Village" icon={<MapPin className="w-4 h-4" />}>
                    <Input
                      placeholder="Village"
                      value={village}
                      onChange={e => setVillage(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-teal-500 h-11"
                    />
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Save button */}
          <div className="mt-8 flex flex-col gap-3">
            <Button
              onClick={handleSave}
              disabled={!isValid || saving}
              className="w-full h-12 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-teal-500/20 transition-all"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" /> Complete profile<ChevronRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>

            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors text-center"
            >
              Skip for now
            </button>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === 1 ? 'w-6 bg-teal-500' : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Small helper component ───────────────────────────────────────────────────
function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-slate-700 dark:text-slate-300 text-sm flex items-center gap-1.5">
        <span className="text-slate-500 dark:text-slate-400">{icon}</span>
        {label}
      </Label>
      {children}
    </div>
  );
}