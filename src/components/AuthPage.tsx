import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, X, Loader2, Eye, EyeOff, CheckCircle, ChevronLeft, Briefcase, GraduationCap, Building2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface RoleOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface AuthFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  focus: string;
  otp: string;
}

interface InputFieldProps {
  icon: LucideIcon;
  type?: React.HTMLInputTypeAttribute;
  placeholder: string;
  field: keyof AuthFormData;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  showError?: boolean;
  passwordToggle?: boolean;
  autoComplete?: string;
}

const ROLES: RoleOption[] = [
  { id: 'pro', label: 'Working Professional', icon: Briefcase },
  { id: 'uni', label: 'University/College Student', icon: GraduationCap },
  { id: 'grad', label: 'Graduate Student', icon: GraduationCap },
  { id: 'self', label: 'Self-Employed', icon: User },
  { id: 'entre', label: 'Entrepreneur', icon: Building2 },
  { id: 'high', label: 'High School Student', icon: GraduationCap },
];

const InputField = ({ icon: Icon, type = 'text', placeholder, field, value, onChange, onBlur, error, showError = false, passwordToggle = false, autoComplete }: InputFieldProps) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div className="relative group w-full">
        <Icon className={`absolute left-6 top-6 transition-colors ${showError ? 'text-orange-500' : 'text-white/40 group-focus-within:text-primary'}`} size={24} />
        <input 
          id={field} name={field} autoComplete={autoComplete}
          type={passwordToggle && showPassword ? 'text' : type}
          placeholder={placeholder} 
          value={value}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-white/[0.03] border rounded-3xl pl-16 pr-16 py-6 text-lg text-white outline-none transition-all font-bold placeholder:text-white/20 ${showError ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/5 focus:border-primary focus:bg-white/[0.08]'}`} 
        />
        {passwordToggle && (
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-6 text-white/40 hover:text-white transition-colors">
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
        )}
        {showError && <p className="text-orange-500 text-xs font-bold mt-2 ml-4">{error}</p>}
      </div>
    );
};

export const AuthPage = ({ onClose }: { onClose: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({ name: '', email: '', password: '', role: '', focus: '', otp: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (field: keyof AuthFormData, value: string) => {
    const trimmed = value.trim();
    if (field === 'name' && !isLogin && trimmed.length < 2) return 'Name too short.';
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Invalid email.';
    if (field === 'password' && !isLogin) {
        if (trimmed.length < 8) return 'Minimum 8 characters.';
        if (!/[A-Z]/.test(trimmed) || !/[a-z]/.test(trimmed) || !/[0-9]/.test(trimmed) || !/[^A-Za-z0-9]/.test(trimmed)) 
            return 'Include uppercase, lowercase, number and symbol.';
    }
    return '';
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setErrors({});
    
    const nameErr = !isLogin ? validate('name', formData.name) : '';
    const emailErr = validate('email', formData.email);
    const passErr = validate('password', formData.password);
    
    if (emailErr || passErr || nameErr) {
        setTouched({ email: true, password: true, name: !isLogin });
        setErrors({ email: emailErr, password: passErr, name: nameErr });
        return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: formData.email.trim(), password: formData.password });
        if (error) throw new Error('Invalid email or password.');
        onClose();
      } else if (step === 1) {
        setStep(2);
      } else if (step === 2) {
        const { error } = await supabase.auth.signUp({ email: formData.email.trim(), password: formData.password });
        if (error) throw new Error(error.message);
        setSuccessMsg('Account created! Please check your email.');
      }
    } catch (err: unknown) { 
        const message = err instanceof Error ? err.message : 'Authentication failed.';
        setTimeout(() => toast.error(message), 0);
    } finally { 
        setLoading(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-4xl bg-[#0A0A0A]/50 backdrop-blur-[48px] border border-white/20 rounded-[48px] p-16 flex flex-col items-center">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/10 text-white/70 transition-all"><X size={28} /></button>
        <form onSubmit={handleAuth} noValidate className="w-full flex flex-col items-center">
            {step !== 1 && <button type="button" onClick={() => setStep(1)} className="absolute top-8 left-8 p-3 rounded-full hover:bg-white/10 text-white/70 transition-all z-[210]"><ChevronLeft size={28} /></button>}
            {step === 1 ? (
                <>
                    <div className="w-full text-center mb-16">
                        <h2 className="text-6xl font-black text-white mb-5 tracking-tighter">{isLogin ? 'Welcome back' : 'Create account'}</h2>
                        <p className="text-xl text-white/80 font-medium">Log in to continue your focus journey.</p>
                    </div>
                    <div className="w-full max-w-lg space-y-6">
                        {!isLogin && <InputField icon={User} placeholder="First name" field="name" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} onBlur={() => setErrors({ ...errors, name: validate('name', formData.name) })} error={errors.name} showError={Boolean(touched.name && errors.name)} autoComplete="name" />}
                        <InputField icon={Mail} type="email" placeholder="name@example.com" field="email" value={formData.email} onChange={(v: string) => setFormData({ ...formData, email: v })} onBlur={() => setErrors({ ...errors, email: validate('email', formData.email) })} error={errors.email} showError={Boolean(touched.email && errors.email)} autoComplete="email" />
                        <InputField icon={Lock} type="password" placeholder="Password" field="password" passwordToggle value={formData.password} onChange={(v: string) => setFormData({ ...formData, password: v })} onBlur={() => setErrors({ ...errors, password: validate('password', formData.password) })} error={errors.password} showError={Boolean(touched.password && errors.password)} autoComplete="current-password" />
                    </div>
                </>
            ) : (
                <div className="w-full max-w-lg text-center">
                    <h2 className="text-4xl font-black text-white mb-10">Setup your profile</h2>
                    <div className="grid grid-cols-2 gap-4 w-full mb-8">
                        {ROLES.map((r) => (
                            <button key={r.id} type="button" onClick={() => setFormData({ ...formData, role: r.id })} className={`p-4 rounded-2xl border ${formData.role === r.id ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5'}`}>
                                <r.icon className="mx-auto mb-2 text-primary" size={24} />
                                <div className="text-xs font-bold text-white">{r.label}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {!successMsg && (
                <button type="submit" className="w-full max-w-lg py-7 mt-12 rounded-3xl bg-primary text-white text-xl font-black flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="animate-spin" /> : 'Continue'}
                </button>
            )}
        </form>
        {successMsg && <motion.div className="mt-8 text-green-400 font-bold text-lg flex items-center gap-3"><CheckCircle /> {successMsg}</motion.div>}
        {!successMsg && step === 1 && (
            <>
            <p className="text-base text-white/70 mt-8 font-bold cursor-pointer hover:text-white transition-all">
            {isLogin ? "Don't have an account? " : "Have an account? "}
            <span className="text-primary hover:underline" onClick={() => { setIsLogin(!isLogin); setStep(1); setErrors({}); setTouched({}); }}>
                {isLogin ? 'Sign up here' : 'Log in here'}
            </span>
            </p>
            <button type="button" onClick={onClose} className="text-sm text-white/40 hover:text-white mt-4 font-bold transition-all">
                Continue without account →
            </button>
            </>
        )}
        {step === 2 && (
            <button type="button" onClick={onClose} className="text-sm text-white/40 hover:text-white mt-4 font-bold transition-all">
                Skip for now →
            </button>
        )}
      </motion.div>
    </div>
  );
};