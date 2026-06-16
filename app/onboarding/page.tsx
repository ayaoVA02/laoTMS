'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, User, Phone, Globe, MapPin, Briefcase, ChevronRight, Loader2, Check, AlertCircle } from 'lucide-react';
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
import { useTranslation } from 'react-i18next';
import provincesData from "@/laos_provinces_districts.json";
import { uploadToR2, getR2Url } from "@/lib/upload";

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
  const { t, i18n } = useTranslation();
  const isLao = i18n.language === 'la';
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [errors, setErrors] = useState<Set<string>>(new Set());

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

  const [uploading, setUploading] = useState(false);
  const provinces = provincesData[0].provinces;
  const availableDistricts = provinces.find(p => p.province_en === province)?.districts || [];

  const [saving, setSaving] = useState(false);

  // ── localStorage persistence ──────────────────────────────────────────────────
  const STORAGE_KEY = 'onboarding_form_data';


  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      console.log("OnboardingPage session:", session?.access_token); // Debug: log session info
      if (!session) {
        router.push('/auth/login'); // Redirect to login if no session is found
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
        setProfileImg(getR2Url(meta.avatar_url)); // Store full URL
        setPreviewUrl(getR2Url(meta.avatar_url)); // Display full URL
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
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create blob URL for immediate preview
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);
    setUploading(true);

    try {
      const key = await uploadToR2(file, 'profiles');
      setProfileImg(getR2Url(key)); // Store full URL in state
      setPreviewUrl(getR2Url(key));
      toast.success('Photo uploaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload photo');
      setPreviewUrl(profileImg ? getR2Url(profileImg) : '');
    } finally {
      setUploading(false);
    }
  };

  // ── validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = new Set<string>();
    
    // Common requirements
    if (!firstName.trim()) newErrors.add('firstName');
    if (!lastName.trim()) newErrors.add('lastName');
    if (!nationality.trim()) newErrors.add('nationality');

    if (isTourist) {
      if (!preferences.trim()) newErrors.add('preferences');
    }

    if (isEntrepreneur) {
      if (!phone.trim()) newErrors.add('phone');
      if (!position.trim()) newErrors.add('position');
      if (!province) newErrors.add('province');
      if (!district) newErrors.add('district');
      if (!village.trim()) newErrors.add('village');
    }

    setErrors(newErrors);
    return newErrors.size === 0;
  };

  // ── save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!sessionUser) return;
    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const userId = sessionUser.id;

    setSaving(true);
    try {
      // ✅ STEP 1: Save role and completion status to auth metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          role: selectedRole,
          is_active: true,
          first_name: firstName,
          last_name: lastName,
          onboarding_completed: true, // This flag is used by middleware
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

  // ── role badge ────────────────────────────────────────────────────────────────
  const roleBadge = isTourist
    ? { icon: '🧳', label: 'Tourist', color: 'from-teal-500 to-cyan-500' }
    : { icon: '🏢', label: 'Entrepreneur', color: 'from-emerald-500 to-green-500' };

  // Fix: Show loader while loading, not after it finishes
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
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
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
              <Field 
                label={isEntrepreneur ? "Username (First Name)" : "First name"} 
                icon={<User className="w-4 h-4" />} 
                required 
                error={errors.has('firstName') ? "Required" : undefined}
              >
                <Input
                  placeholder="Somchai"
                  value={firstName}
                  onChange={e => { setFirstName(e.target.value); if(errors.has('firstName')) setErrors(prev => { const n = new Set(prev); n.delete('firstName'); return n; }); }}
                  className={`bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 h-11 ${errors.has('firstName') ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500'}`}
                />
              </Field>
              <Field label="Last name" icon={<User className="w-4 h-4" />} required error={errors.has('lastName') ? "Required" : undefined}>
                <Input
                  placeholder="Vongvichit"
                  value={lastName}
                  onChange={e => { setLastName(e.target.value); if(errors.has('lastName')) setErrors(prev => { const n = new Set(prev); n.delete('lastName'); return n; }); }}
                  className={`bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 h-11 ${errors.has('lastName') ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500'}`}
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
              <Field label="Phone" icon={<Phone className="w-4 h-4" />} required={isEntrepreneur} error={isEntrepreneur && errors.has('phone') ? "Required" : undefined}>
                <Input
                  placeholder="+856 20 XXXX XXXX"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); if(errors.has('phone')) setErrors(prev => { const n = new Set(prev); n.delete('phone'); return n; }); }}
                  className={`bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 h-11 ${isEntrepreneur && errors.has('phone') ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500'}`}
                />
              </Field>
              <Field label="Gender" icon={<User className="w-4 h-4" />}>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-900">
                    {GENDERS.map(g => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Nationality */}
            <Field label="Nationality" icon={<Globe className="w-4 h-4" />} required error={errors.has('nationality') ? "Required" : undefined}>
              <Input
                placeholder="Lao"
                value={nationality}
                onChange={e => { setNationality(e.target.value); if(errors.has('nationality')) setErrors(prev => { const n = new Set(prev); n.delete('nationality'); return n; }); }}
                className={`bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 h-11 ${errors.has('nationality') ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500'}`}
              />
            </Field>

            {/* ── TOURIST ONLY ─────────────────────────────────────────────── */}
            <AnimatePresence>
              {isTourist && (
                <motion.div variants={fadeUp} initial="initial" animate="animate" exit="exit">
                  <Field label="Travel preferences" icon={<Globe className="w-4 h-4" />} required error={errors.has('preferences') ? "Required" : undefined}>
                    <Input
                      placeholder="e.g. nature, culture, food..."
                      value={preferences}
                      onChange={e => { setPreferences(e.target.value); if(errors.has('preferences')) setErrors(prev => { const n = new Set(prev); n.delete('preferences'); return n; }); }}
                      className={`bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 h-11 ${errors.has('preferences') ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500'}`}
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
                  <Field label="Position / Job title" icon={<Briefcase className="w-4 h-4" />} required error={errors.has('position') ? "Required" : undefined}>
                    <Input
                      placeholder="e.g. Business Owner"
                      value={position}
                      onChange={e => { setPosition(e.target.value); if(errors.has('position')) setErrors(prev => { const n = new Set(prev); n.delete('position'); return n; }); }}
                      className={`bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 h-11 ${errors.has('position') ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500'}`}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Province" icon={<MapPin className="w-4 h-4" />} required error={errors.has('province') ? "Required" : undefined}>
                      <Select value={province} onValueChange={val => { setProvince(val); setDistrict(''); if(errors.has('province')) setErrors(prev => { const n = new Set(prev); n.delete('province'); return n; }); }}>
                        <SelectTrigger className={`bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-11 ${errors.has('province') ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700'}`}>
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 dark:bg-slate-900">
                          {provinces.map(p => (
                            <SelectItem key={p.province_id} value={p.province_en}>
                              {isLao ? p.province_la : p.province_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="District" icon={<MapPin className="w-4 h-4" />} required error={errors.has('district') ? "Required" : undefined}>
                      <Select 
                        value={district} 
                        onValueChange={val => { setDistrict(val); if(errors.has('district')) setErrors(prev => { const n = new Set(prev); n.delete('district'); return n; }); }}
                        disabled={!province}
                      >
                        <SelectTrigger className={`bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-11 ${errors.has('district') ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700'}`}>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 dark:bg-slate-900">
                          {availableDistricts.map((d: any) => (
                            <SelectItem key={d.district_en} value={d.district_en}>
                              {isLao ? d.district_la : d.district_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <Field label="Village" icon={<MapPin className="w-4 h-4" />} required error={errors.has('village') ? "Required" : undefined}>
                    <Input
                      placeholder="Village"
                      value={village}
                      onChange={e => { setVillage(e.target.value); if(errors.has('village')) setErrors(prev => { const n = new Set(prev); n.delete('village'); return n; }); }}
                      className={`bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 h-11 ${errors.has('village') ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500'}`}
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
              disabled={saving}
              className="w-full h-12 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-teal-500/20 transition-all"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" /> Complete profile<ChevronRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
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
  required,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-slate-700 dark:text-slate-300 text-sm flex items-center gap-1.5">
        <span className="text-slate-500 dark:text-slate-400">{icon}</span>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}