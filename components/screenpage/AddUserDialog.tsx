'use client';

import { useState, useEffect } from 'react';
import {
    User, Phone, Globe, MapPin, Shield, Loader2, Check, Mail, Search
} from 'lucide-react';
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

const APP_ROLES = [
    { value: 'TOURIST', label: 'Tourist (Regular User)' },
    { value: 'STAFF', label: 'Staff Member' },
    { value: 'ADMIN', label: 'Administrator' },
];

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

interface Props {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onSuccess?: () => void;
    staffUser?: any; 
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

export default function AddStaffDialog({ open, onOpenChange, onSuccess, staffUser }: Props) {
    const isEditMode = !!staffUser;

    const [email, setEmail] = useState('');
    const [role, setRole] = useState('STAFF');
    const [isVerified, setIsVerified] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [nationality, setNationality] = useState('');
    const [gender, setGender] = useState('MALE');
    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');
    const [village, setVillage] = useState('');
    const [status, setStatus] = useState('active');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            if (staffUser) {
                setEmail(staffUser.email || '');
                setRole(staffUser.role || 'STAFF');
                const nameParts = (staffUser.name || '').split(' ');
                setFirstName(nameParts[0] || '');
                setLastName(nameParts.slice(1).join(' ') || '');
                setPhone(staffUser.phone || '');
                setStatus(staffUser.staffStatus || 'active');
                setProvince(staffUser.province || '');
                setDistrict(staffUser.district || '');
                setVillage(staffUser.village || '');
                setGender(staffUser.gender || 'MALE');
                setNationality(staffUser.nationality || '');
                setIsVerified(true);
            } else {
                reset();
            }
        }
    }, [open, staffUser]);

    const handleVerifyEmail = async () => {
        if (!email.trim() || isEditMode) return;
        setIsVerifying(true);
        setIsVerified(false);

        try {
            const res = await fetch('/api/admin/users');
            if (!res.ok) throw new Error('Failed to query system user index.');
            
            const data = await res.json();
            const existingUser = data?.users?.find(
                (u: any) => u.email.toLowerCase() === email.trim().toLowerCase()
            );

            if (existingUser) {
                setRole(existingUser.role || 'STAFF');
                const nameParts = (existingUser.name || '').split(' ');
                setFirstName(nameParts[0] || '');
                setLastName(nameParts.slice(1).join(' ') || '');
                if (existingUser.phone) setPhone(existingUser.phone);
                
                toast.success(`User located. Role auto-set to: ${existingUser.role}`);
            } else {
                toast.success('No existing account found. Creating new auth account credentials.');
            }

            setIsVerified(true);
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || 'Verification pipeline error.');
        } finally {
            setIsVerifying(false);
        }
    };

    const reset = () => {
        setEmail(''); setRole('STAFF'); setIsVerified(false);
        setFirstName(''); setLastName(''); setPhone('');
        setNationality(''); setGender('MALE');
        setProvince(''); setDistrict(''); setVillage(''); setStatus('active');
    };

    const handleClose = () => { reset(); onOpenChange(false); };

    const handleSave = async () => {
        if (!isVerified) return;
        if (role !== 'TOURIST' && (!firstName.trim() || !lastName.trim())) {
            toast.error('First and Last names are mandatory for staff records.');
            return;
        }

        setSaving(true);
        try {
            const fullName = `${firstName.trim()} ${lastName.trim()}`;
            
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: staffUser?.id || undefined,
                    email: email.trim(),
                    name: role === 'TOURIST' ? undefined : fullName,
                    role: role,
                    phone: role === 'TOURIST' ? undefined : phone.trim(),
                    nationality: role === 'TOURIST' ? undefined : nationality.trim(),
                    province: role === 'TOURIST' ? undefined : province,
                    district: role === 'TOURIST' ? undefined : district.trim(),
                    village: role === 'TOURIST' ? undefined : village.trim(),
                    gender: role === 'TOURIST' ? undefined : gender,
                    status: role === 'TOURIST' ? undefined : status
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Server rejected configuration change.');

            toast.success(result.message || 'Permissions updated successfully!');
            handleClose(); onSuccess?.();
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || 'Failed to modify account permissions.');
        } finally { setSaving(false); }
    };

    const isTouristMode = role === 'TOURIST';
    const isValid = isVerified && (isTouristMode || (firstName.trim() && lastName.trim()));

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="p-0 gap-0 max-w-lg w-full overflow-hidden border-0 shadow-2xl bg-background rounded-xl flex flex-col max-h-[90vh]">
                <DialogHeader className="sr-only">
                    <DialogTitle>{isEditMode ? 'Manage User Permissions' : 'Assign System Access'}</DialogTitle>
                </DialogHeader>
                
                <div className="relative h-24 bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-700 overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 flex items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-semibold text-base leading-tight">
                                    {isEditMode ? 'Modify User Privilege' : 'Add System Identity'}
                                </p>
                                <p className="text-white/70 text-xs mt-0.5">
                                    Configure core roles. Setting to Tourist wipes database staff table associations.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="space-y-6">
                        
                        {/* Account Verification Row */}
                        <div className="space-y-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Security Lookup</p>
                            <div className="flex items-end gap-2 w-full">
                                <div className="flex-1">
                                    <Field label="User Email address" icon={<Mail className="w-3.5 h-3.5" />}>
                                        <Input 
                                            type="email" 
                                            placeholder="user@laotms.la" 
                                            value={email} 
                                            onChange={e => { setEmail(e.target.value); setIsVerified(false); }} 
                                            disabled={isVerifying || saving || isEditMode}
                                            className="h-10 text-sm" 
                                        />
                                    </Field>
                                </div>
                                {!isEditMode && (
                                    <Button
                                        type="button"
                                        onClick={handleVerifyEmail}
                                        disabled={!email.trim() || isVerifying || isVerified}
                                        className={`h-10 px-4 font-medium transition-colors ${
                                            isVerified ? "bg-emerald-500 text-white cursor-default" : "bg-teal-600 text-white"
                                        }`}
                                    >
                                        {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : isVerified ? <Check className="w-4 h-4" /> : <Search className="w-4 h-4 mr-1.5" />}
                                        {!isVerifying && !isVerified && "Verify"}
                                        {isVerified && "Verified"}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Global App Role Selection */}
                        <div className={`transition-opacity duration-200 ${isVerified ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                            <Field label="Global Account Role" icon={<Shield className="w-3.5 h-3.5" />}>
                                <Select value={role} onValueChange={setRole} disabled={!isVerified || saving}>
                                    <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {APP_ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </Field>
                            {isTouristMode && (
                                <p className="text-amber-600 dark:text-amber-400 text-xs font-medium mt-2 bg-amber-500/10 border border-amber-500/20 rounded-md p-2">
                                    ⚠️ Warning: Selecting Tourist will delete this profile row completely from the staffs database table when saved.
                                </p>
                            )}
                        </div>

                        {/* Staff Profiles Form */}
                        <div className={`space-y-6 transition-all duration-300 ${isVerified && !isTouristMode ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
                            
                            <div className="space-y-4 pt-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Personal Info</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="First name" icon={<User className="w-3.5 h-3.5" />}>
                                        <Input placeholder="Somchai" value={firstName} onChange={e => setFirstName(e.target.value)} disabled={!isVerified || isTouristMode} className="h-10 text-sm" />
                                    </Field>
                                    <Field label="Last name" icon={<User className="w-3.5 h-3.5" />}>
                                        <Input placeholder="Vongvichit" value={lastName} onChange={e => setLastName(e.target.value)} disabled={!isVerified || isTouristMode} className="h-10 text-sm" />
                                    </Field>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Phone" icon={<Phone className="w-3.5 h-3.5" />}>
                                        <Input placeholder="+856 20..." value={phone} onChange={e => setPhone(e.target.value)} disabled={!isVerified || isTouristMode} className="h-10 text-sm" />
                                    </Field>
                                    <Field label="Gender" icon={<User className="w-3.5 h-3.5" />}>
                                        <Select value={gender} onValueChange={setGender} disabled={!isVerified || isTouristMode}>
                                            <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                                            <SelectContent>{GENDERS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </Field>
                                </div>
                                <Field label="Nationality" icon={<Globe className="w-3.5 h-3.5" />}>
                                    <Input placeholder="Lao" value={nationality} onChange={e => setNationality(e.target.value)} disabled={!isVerified || isTouristMode} className="h-10 text-sm" />
                                </Field>
                            </div>

                            <div className="space-y-4 pt-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Assignment Details</p>
                                
                                <Field label="Status" icon={<Shield className="w-3.5 h-3.5" />}>
                                    <Select value={status} onValueChange={setStatus} disabled={!isVerified || isTouristMode}>
                                        <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                                        <SelectContent>{STAFF_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                                    </Select>
                                </Field>

                                <Field label="Province" icon={<MapPin className="w-3.5 h-3.5" />}>
                                    <Select value={province} onValueChange={setProvince} disabled={!isVerified || isTouristMode}>
                                        <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Select province" /></SelectTrigger>
                                        <SelectContent className="max-h-52">{PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                    </Select>
                                </Field>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="District" icon={<MapPin className="w-3.5 h-3.5" />}>
                                        <Input placeholder="District" value={district} onChange={e => setDistrict(e.target.value)} disabled={!isVerified || isTouristMode} className="h-10 text-sm" />
                                    </Field>
                                    <Field label="Village" icon={<MapPin className="w-3.5 h-3.5" />}>
                                        <Input placeholder="Village" value={village} onChange={e => setVillage(e.target.value)} disabled={!isVerified || isTouristMode} className="h-10 text-sm" />
                                    </Field>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-border/50 flex gap-3 bg-muted/30 flex-shrink-0">
                    <Button type="button" variant="outline" className="flex-1 h-11" onClick={handleClose}>Cancel</Button>
                    <Button
                        type="button"
                        className="flex-1 h-11 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-semibold shadow-lg shadow-teal-500/20"
                        disabled={!isValid || saving} onClick={handleSave}
                    >
                        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Check className="w-4 h-4 mr-2" />Apply Changes</>}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}