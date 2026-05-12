'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, User, Phone, Globe, MapPin, Briefcase,
  Loader2, Check, Mail, Lock, Shield, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import toast from 'react-hot-toast';

const R2_UPLOAD_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_URL;

const GENDERS = [
  { value: 'MALE',   label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
];

const PROVINCES = [
  'Vientiane Capital','Phongsali','Luang Namtha','Oudomxay','Bokeo',
  'Luang Prabang','Huaphanh','Xayabury','Xieng Khouang','Vientiane',
  'Borikhamxay','Khammouane','Savannakhet','Saravane','Sekong',
  'Champasack','Attapeu','Xaysomboun',
];

const STAFF_STATUSES = [
  { value: 'active',    label: 'Active' },
  { value: 'inactive',  label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
];

async function uploadToR2(file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const key = `profiles/staff-${Date.now()}.${ext}`;
  const res = await fetch(`${R2_UPLOAD_URL}/${key}`, {
    method: 'PUT', headers: { 'Content-Type': file.type }, body: file,
  });
  if (!res.ok) throw new Error('Upload failed');
  return `${R2_UPLOAD_URL}/${key}`;
}

type AddRole = 'ADMIN' | 'STAFF';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
        <span className="text-muted-foreground">{icon}</span>{label}
      </Label>
      {children}
    </div>
  );
}

export default function AddUserDialog({ open, onOpenChange, onSuccess }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [role, setRole]         = useState<AddRole>('STAFF');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [nationality, setNationality] = useState('');
  const [gender, setGender]       = useState('MALE');
  const [previewUrl, setPreviewUrl] = useState('');
  const [profileImg, setProfileImg] = useState('');
  const [uploading, setUploading]   = useState(false);
  const [staffCode, setStaffCode]   = useState('');
  const [province, setProvince]     = useState('');
  const [district, setDistrict]     = useState('');
  const [village, setVillage]       = useState('');
  const [status, setStatus]         = useState('active');
  const [saving, setSaving]         = useState(false);

  const isStaff = role === 'STAFF';

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadToR2(file);
      setProfileImg(url);
      toast.success('Photo uploaded!');
    } catch { toast.error('Upload failed'); setPreviewUrl(''); }
    finally { setUploading(false); }
  };

  const reset = () => {
    setRole('STAFF'); setEmail(''); setPassword('');
    setFirstName(''); setLastName(''); setPhone('');
    setNationality(''); setGender('MALE');
    setPreviewUrl(''); setProfileImg('');
    setStaffCode(''); setProvince(''); setDistrict(''); setVillage(''); setStatus('active');
  };

  const handleClose = () => { reset(); onOpenChange(false); };

  const handleSave = async () => {
    if (!email || !password) return;
    if (isStaff && (!firstName.trim() || !lastName.trim())) return;
    setSaving(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email, password,
        options: {
          data: {
            role, is_active: true,
            first_name: isStaff ? firstName : email.split('@')[0],
            last_name:  isStaff ? lastName  : '',
          },
        },
      });
      if (authError || !authData.user) throw authError ?? new Error('Signup failed');

      const userId = authData.user.id;

      const { error: profileError } = await supabase.from('staffs').insert(
        isStaff
          ? { user_id: userId, staff_code: staffCode || `STF-${Date.now()}`, first_name: firstName, last_name: lastName, phone, nationality, gender, profile_img: profileImg, province, district, village, status }
          : { user_id: userId, staff_code: `ADM-${Date.now()}`, first_name: email.split('@')[0], last_name: '', status: 'active' }
      );
      if (profileError) throw profileError;

      toast.success(`${role === 'ADMIN' ? 'Admin' : 'Staff'} account created!`);
      reset(); onOpenChange(false); onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Failed to create user');
    } finally { setSaving(false); }
  };

  const isValid = email.trim() && password.trim().length >= 6
    && (isStaff ? firstName.trim() && lastName.trim() : true);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 gap-0 max-w-lg w-full overflow-hidden border-0 shadow-2xl bg-background">

        {/* Header */}
        <div className="relative h-24 bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-700 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute top-4 left-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-base leading-tight">Add Team Member</p>
              <p className="text-white/70 text-xs">Create a new staff or admin account</p>
            </div>
          </div>
          <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Role toggle */}
        <div className="px-6 pt-5 pb-2">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted">
            {(['STAFF', 'ADMIN'] as AddRole[]).map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`py-2 rounded-lg text-sm font-medium transition-all ${role === r ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {r === 'STAFF' ? '👤 Staff' : '🛡️ Admin'}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="px-6 pb-4 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">

            {/* ── ADMIN form — email + password only ─────────────────────── */}
            {!isStaff && (
              <motion.div key="admin"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }} className="space-y-4 pt-2"
              >
                <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <Shield className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">Admin Account</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Full system access. Only email and password required — profile details can be completed after login.
                    </p>
                  </div>
                </div>
                <Field label="Email address" icon={<Mail className="w-3.5 h-3.5" />}>
                  <Input type="email" placeholder="admin@laotms.la" value={email} onChange={e => setEmail(e.target.value)} className="h-10 text-sm" />
                </Field>
                <Field label="Password" icon={<Lock className="w-3.5 h-3.5" />}>
                  <Input type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} className="h-10 text-sm" />
                </Field>
              </motion.div>
            )}

            {/* ── STAFF form — full details ───────────────────────────────── */}
            {isStaff && (
              <motion.div key="staff"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }} className="space-y-4 pt-2"
              >
                {/* Avatar */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-muted border-2 border-border overflow-hidden flex items-center justify-center shadow-md">
                      {previewUrl ? <img src={previewUrl} alt="avatar" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-muted-foreground" />}
                      {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl"><Loader2 className="w-5 h-5 text-white animate-spin" /></div>}
                    </div>
                    <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-teal-500 hover:bg-teal-400 flex items-center justify-center shadow-md transition-colors">
                      <Camera className="w-3.5 h-3.5 text-white" />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                  </div>
                </div>

                {/* Credentials */}
                <div className="space-y-3 pb-3 border-b border-border/50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Login Credentials</p>
                  <Field label="Email address" icon={<Mail className="w-3.5 h-3.5" />}>
                    <Input type="email" placeholder="staff@laotms.la" value={email} onChange={e => setEmail(e.target.value)} className="h-10 text-sm" />
                  </Field>
                  <Field label="Password" icon={<Lock className="w-3.5 h-3.5" />}>
                    <Input type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} className="h-10 text-sm" />
                  </Field>
                </div>

                {/* Personal */}
                <div className="space-y-3 pb-3 border-b border-border/50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Personal Info</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="First name" icon={<User className="w-3.5 h-3.5" />}>
                      <Input placeholder="Somchai" value={firstName} onChange={e => setFirstName(e.target.value)} className="h-10 text-sm" />
                    </Field>
                    <Field label="Last name" icon={<User className="w-3.5 h-3.5" />}>
                      <Input placeholder="Vongvichit" value={lastName} onChange={e => setLastName(e.target.value)} className="h-10 text-sm" />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Phone" icon={<Phone className="w-3.5 h-3.5" />}>
                      <Input placeholder="+856 20..." value={phone} onChange={e => setPhone(e.target.value)} className="h-10 text-sm" />
                    </Field>
                    <Field label="Gender" icon={<User className="w-3.5 h-3.5" />}>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>{GENDERS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <Field label="Nationality" icon={<Globe className="w-3.5 h-3.5" />}>
                    <Input placeholder="Lao" value={nationality} onChange={e => setNationality(e.target.value)} className="h-10 text-sm" />
                  </Field>
                </div>

                {/* Staff details */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Staff Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Staff Code" icon={<Briefcase className="w-3.5 h-3.5" />}>
                      <Input placeholder="STF-001" value={staffCode} onChange={e => setStaffCode(e.target.value)} className="h-10 text-sm" />
                    </Field>
                    <Field label="Status" icon={<Shield className="w-3.5 h-3.5" />}>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>{STAFF_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <Field label="Province" icon={<MapPin className="w-3.5 h-3.5" />}>
                    <Select value={province} onValueChange={setProvince}>
                      <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Select province" /></SelectTrigger>
                      <SelectContent className="max-h-52">{PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="District" icon={<MapPin className="w-3.5 h-3.5" />}>
                      <Input placeholder="District" value={district} onChange={e => setDistrict(e.target.value)} className="h-10 text-sm" />
                    </Field>
                    <Field label="Village" icon={<MapPin className="w-3.5 h-3.5" />}>
                      <Input placeholder="Village" value={village} onChange={e => setVillage(e.target.value)} className="h-10 text-sm" />
                    </Field>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-3 border-t border-border/50 flex gap-3">
          <Button variant="outline" className="flex-1 h-11" onClick={handleClose}>Cancel</Button>
          <Button
            className="flex-1 h-11 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-semibold shadow-lg shadow-teal-500/20"
            disabled={!isValid || saving || uploading} onClick={handleSave}
          >
            {saving
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
              : <><Check className="w-4 h-4 mr-2" />Create {role === 'ADMIN' ? 'Admin' : 'Staff'}</>
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}