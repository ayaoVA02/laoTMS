'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, User, Phone, Globe, MapPin, Briefcase,
    Loader2, Check, Mail, Shield, X, Search
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import toast from 'react-hot-toast';

const R2_UPLOAD_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_URL;

const GENDERS = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
];

const PROVINCES = [
    'Vientiane Capital', 'Phongsali', 'Luang Namtha', 'Oudomxay', 'Bokeo',
    'Luang Prabang', 'Huaphanh', 'Xayabury', 'Xieng Khouang', 'Vientiane',
    'Borikhamxay', 'Khammouane', 'Savannakhet', 'Saravane', 'Sekong',
    'Champasack', 'Attapeu', 'Xaysomboun',
];

const STAFF_STATUSES = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
];

async function uploadToR2(file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const key = `laotms/staff-${Date.now()}.${ext}`;
    const res = await fetch(`${R2_UPLOAD_URL}/${key}`, {
        method: 'PUT', headers: { 'Content-Type': file.type }, body: file,
    });
    if (!res.ok) throw new Error('Upload failed');
    return `${R2_UPLOAD_URL}/${key}`;
}

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

export default function AddStaffDialog({ open, onOpenChange, onSuccess }: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [email, setEmail] = useState('');
    const [verifiedUserId, setVerifiedUserId] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [nationality, setNationality] = useState('');
    const [gender, setGender] = useState('MALE');
    const [previewUrl, setPreviewUrl] = useState('');
    const [profileImg, setProfileImg] = useState('');
    const [uploading, setUploading] = useState(false);
    const [staffCode, setStaffCode] = useState('');
    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');
    const [village, setVillage] = useState('');
    const [status, setStatus] = useState('active');
    const [saving, setSaving] = useState(false);

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

    const handleVerifyEmail = async () => {
        if (!email.trim()) return;
        setIsVerifying(true);
        setVerifiedUserId(null);

        try {
            // 1. Check if user exists in the public users table
            const { data: userAccount, error: userError } = await supabase
                .from('users')
                .select('id, first_name, last_name, role')
                .eq('email', email.trim())
                .maybeSingle();

            if (userError) throw userError;

            if (!userAccount) {
                toast.error('No account found with this email.');
                setIsVerifying(false);
                return;
            }

            // 2. Check if they already have a staff record setup
            const { data: staffProfile, error: staffError } = await supabase
                .from('staffs')
                .select('id')
                .eq('user_id', userAccount.id)
                .maybeSingle();

            if (staffError) throw staffError;

            if (staffProfile) {
                toast.error('This user is already a registered staff member.');
                setIsVerifying(false);
                return;
            }

            // Auto-populate what we know and lock verification success
            setVerifiedUserId(userAccount.id);
            if (userAccount.first_name) setFirstName(userAccount.first_name);
            if (userAccount.last_name) setLastName(userAccount.last_name);
            toast.success('User verified! You can now complete the staff profile.');

        } catch (err: any) {
            console.error(err);
            toast.error(err?.message ?? 'Verification failed.');
        } finally {
            setIsVerifying(false);
        }
    };

    const reset = () => {
        setEmail(''); setVerifiedUserId(null);
        setFirstName(''); setLastName(''); setPhone('');
        setNationality(''); setGender('MALE');
        setPreviewUrl(''); setProfileImg('');
        setStaffCode(''); setProvince(''); setDistrict(''); setVillage(''); setStatus('active');
    };

    const handleClose = () => { reset(); onOpenChange(false); };

    const handleSave = async () => {
        if (!verifiedUserId || !firstName.trim() || !lastName.trim()) return;

        setSaving(true);
        try {
            // 1. Update user role to STAFF
            const { error: updateRoleError } = await supabase
                .from('users')
                .update({ role: 'STAFF' })
                .eq('id', verifiedUserId);

            if (updateRoleError) throw updateRoleError;

            // 2. Create the staff record
            const { error: profileError } = await supabase.from('staffs').insert({
                user_id: verifiedUserId,
                staff_code: staffCode || `STF-${Date.now()}`,
                first_name: firstName,
                last_name: lastName,
                phone,
                nationality,
                gender,
                profile_img: profileImg,
                province,
                district,
                village,
                status
            });

            if (profileError) throw profileError;

            toast.success('Staff profile created successfully!');
            reset(); handleClose(); onSuccess?.();
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message ?? 'Failed to process staff profile creation.');
        } finally { setSaving(false); }
    };

    const isValid = verifiedUserId && firstName.trim() && lastName.trim();

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="p-0 gap-0 max-w-lg w-full overflow-hidden border-0 shadow-2xl bg-background rounded-xl flex flex-col max-h-[90vh]">
                <DialogHeader className="sr-only">
                    <DialogTitle>Add New Staff Member</DialogTitle>
                </DialogHeader>
                
                {/* Header Container */}
                <div className="relative h-24 bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-700 overflow-hidden flex-shrink-0">
                    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
                    <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
                    
                    <div className="absolute inset-0 flex items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-semibold text-base leading-tight">Add Staff Profile</p>
                                <p className="text-white/70 text-xs mt-0.5">Verify email to convert an existing user account</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Body - Scrollable Area */}
                <div className="px-6 py-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="space-y-6">
                        
                        {/* Account Lookup Section */}
                        <div className="space-y-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Account Lookup</p>
                            <div className="flex items-end gap-2 w-full">
                                <div className="flex-1">
                                    <Field label="User Email address" icon={<Mail className="w-3.5 h-3.5" />}>
                                        <Input 
                                            type="email" 
                                            placeholder="user@laotms.la" 
                                            value={email} 
                                            onChange={e => { setEmail(e.target.value); setVerifiedUserId(null); }} 
                                            disabled={isVerifying || saving}
                                            className="h-10 text-sm" 
                                        />
                                    </Field>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleVerifyEmail}
                                    disabled={!email.trim() || isVerifying || !!verifiedUserId}
                                    className={`h-10 px-4 shadow-sm font-medium transition-colors ${
                                        verifiedUserId 
                                        ? "bg-emerald-500 hover:bg-emerald-500 text-white cursor-default" 
                                        : "bg-teal-600 hover:bg-teal-500 text-white"
                                    }`}
                                >
                                    {isVerifying ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : verifiedUserId ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <Search className="w-4 h-4 mr-1.5" />
                                    )}
                                    {!isVerifying && !verifiedUserId && "Verify"}
                                    {verifiedUserId && "Verified"}
                                </Button>
                            </div>
                        </div>

                        {/* Hidden/Disabled fields until email is verified */}
                        <div className={`space-y-6 transition-all duration-300 ${verifiedUserId ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                            
                            {/* Avatar Picker */}
                            <div className="flex justify-center pb-2">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-2xl bg-muted border-2 border-border overflow-hidden flex items-center justify-center shadow-md">
                                        {previewUrl ? <img src={previewUrl} alt="avatar" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-muted-foreground" />}
                                        {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl"><Loader2 className="w-5 h-5 text-white animate-spin" /></div>}
                                    </div>
                                    <button type="button" disabled={!verifiedUserId} onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-teal-500 hover:bg-teal-400 flex items-center justify-center shadow-md transition-colors">
                                        <Camera className="w-3.5 h-3.5 text-white" />
                                    </button>
                                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                                </div>
                            </div>

                            {/* Personal Info Section */}
                            <div className="space-y-4 pt-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Personal Info</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="First name" icon={<User className="w-3.5 h-3.5" />}>
                                        <Input placeholder="Somchai" value={firstName} onChange={e => setFirstName(e.target.value)} disabled={!verifiedUserId} className="h-10 text-sm" />
                                    </Field>
                                    <Field label="Last name" icon={<User className="w-3.5 h-3.5" />}>
                                        <Input placeholder="Vongvichit" value={lastName} onChange={e => setLastName(e.target.value)} disabled={!verifiedUserId} className="h-10 text-sm" />
                                    </Field>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Phone" icon={<Phone className="w-3.5 h-3.5" />}>
                                        <Input placeholder="+856 20..." value={phone} onChange={e => setPhone(e.target.value)} disabled={!verifiedUserId} className="h-10 text-sm" />
                                    </Field>
                                    <Field label="Gender" icon={<User className="w-3.5 h-3.5" />}>
                                        <Select value={gender} onValueChange={setGender} disabled={!verifiedUserId}>
                                            <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                                            <SelectContent>{GENDERS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </Field>
                                </div>
                                <Field label="Nationality" icon={<Globe className="w-3.5 h-3.5" />}>
                                    <Input placeholder="Lao" value={nationality} onChange={e => setNationality(e.target.value)} disabled={!verifiedUserId} className="h-10 text-sm" />
                                </Field>
                            </div>

                            {/* Work & Location Section */}
                            <div className="space-y-4 pt-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Assignment Details</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Staff Code" icon={<Briefcase className="w-3.5 h-3.5" />}>
                                        <Input placeholder="STF-001" value={staffCode} onChange={e => setStaffCode(e.target.value)} disabled={!verifiedUserId} className="h-10 text-sm" />
                                    </Field>
                                    <Field label="Status" icon={<Shield className="w-3.5 h-3.5" />}>
                                        <Select value={status} onValueChange={setStatus} disabled={!verifiedUserId}>
                                            <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                                            <SelectContent>{STAFF_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </Field>
                                </div>
                                <Field label="Province" icon={<MapPin className="w-3.5 h-3.5" />}>
                                    <Select value={province} onValueChange={setProvince} disabled={!verifiedUserId}>
                                        <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Select province" /></SelectTrigger>
                                        <SelectContent className="max-h-52">{PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                    </Select>
                                </Field>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="District" icon={<MapPin className="w-3.5 h-3.5" />}>
                                        <Input placeholder="District" value={district} onChange={e => setDistrict(e.target.value)} disabled={!verifiedUserId} className="h-10 text-sm" />
                                    </Field>
                                    <Field label="Village" icon={<MapPin className="w-3.5 h-3.5" />}>
                                        <Input placeholder="Village" value={village} onChange={e => setVillage(e.target.value)} disabled={!verifiedUserId} className="h-10 text-sm" />
                                    </Field>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Container */}
                <div className="px-6 py-4 border-t border-border/50 flex gap-3 bg-muted/30 flex-shrink-0">
                    <Button type="button" variant="outline" className="flex-1 h-11" onClick={handleClose}>Cancel</Button>
                    <Button
                        type="button"
                        className="flex-1 h-11 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-semibold shadow-lg shadow-teal-500/20"
                        disabled={!isValid || saving || uploading} onClick={handleSave}
                    >
                        {saving
                            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                            : <><Check className="w-4 h-4 mr-2" />Register Staff</>
                        }
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}