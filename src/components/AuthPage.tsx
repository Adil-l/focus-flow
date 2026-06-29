import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, X, Loader2, Eye, EyeOff, ShieldCheck, ChevronLeft, Briefcase, GraduationCap, Building2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { track } from '@/lib/analytics';
import { isTauri } from '@/platform';
import { useTranslation } from '@/lib/i18n';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface RoleOption {
  id: string;
  labelKey: 'roleWorkingProfessional' | 'roleUniversityStudent' | 'roleGraduateStudent' | 'roleSelfEmployed' | 'roleEntrepreneur' | 'roleHighSchoolStudent';
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
  { id: 'pro', labelKey: 'roleWorkingProfessional', icon: Briefcase },
  { id: 'uni', labelKey: 'roleUniversityStudent', icon: GraduationCap },
  { id: 'grad', labelKey: 'roleGraduateStudent', icon: GraduationCap },
  { id: 'self', labelKey: 'roleSelfEmployed', icon: User },
  { id: 'entre', labelKey: 'roleEntrepreneur', icon: Building2 },
  { id: 'high', labelKey: 'roleHighSchoolStudent', icon: GraduationCap },
];

const InputField = ({ icon: Icon, type = 'text', placeholder, field, value, onChange, onBlur, error, showError = false, passwordToggle = false, autoComplete }: InputFieldProps) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div className="relative group w-full">
        <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${showError ? 'text-orange-500' : 'text-white/40 group-focus-within:text-primary'}`} size={18} />
        <input
          id={field} name={field} autoComplete={autoComplete}
          type={passwordToggle && showPassword ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full min-h-[48px] bg-white/[0.03] border rounded-2xl pl-11 pr-11 py-3 text-base sm:text-sm text-white outline-none transition-all font-bold placeholder:text-white/20 ${showError ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/5 focus:border-primary focus:bg-white/[0.08]'}`}
        />
        {passwordToggle && (
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        )}
        {showError && <p className="text-orange-500 text-xs font-bold mt-1.5 ml-3">{error}</p>}
      </div>
    );
};

export const AuthPage = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({ name: '', email: '', password: '', role: '', focus: '', otp: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  // Countdown for the "resend code" button on the verification step.
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  const validate = (field: keyof AuthFormData, value: string) => {
    const trimmed = value.trim();
    if (field === 'name' && !isLogin && trimmed.length < 2) return t.errNameTooShort;
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return t.errInvalidEmail;
    if (field === 'password' && !isLogin) {
        if (trimmed.length < 8) return t.errPasswordMin;
        if (!/[A-Z]/.test(trimmed) || !/[a-z]/.test(trimmed) || !/[0-9]/.test(trimmed) || !/[^A-Za-z0-9]/.test(trimmed))
            return t.errPasswordComplexity;
    }
    return '';
  };

  const signInWithGoogle = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/app` },
    });
    if (error) toast.error(error.message);
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
        if (error) throw new Error(t.errInvalidCredentials);
        track('login_completed', { method: 'email' });
        onClose();
      } else if (step === 1) {
        track('signup_started', { method: 'email' });
        setStep(2);
      } else if (step === 2) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: { data: { full_name: formData.name.trim(), role: formData.role } },
        });
        if (error) throw new Error(error.message);
        // Supabase returns a user with an empty identities array (no error) when
        // the email is already registered — surface that instead of a silent no-op.
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          throw new Error(t.errEmailInUse);
        }
        track('signup_completed', { method: 'email', role: formData.role });
        // If the project has email confirmation OFF, a session comes back now.
        if (data.session) { onClose(); return; }
        // Otherwise require the 6-digit code we just emailed.
        setResendCooldown(45);
        setStep(3);
      } else if (step === 3) {
        const code = formData.otp.trim();
        if (code.length !== 6) { setErrors({ otp: t.errOtpIncomplete }); return; }
        const { error } = await supabase.auth.verifyOtp({ email: formData.email.trim(), token: code, type: 'signup' });
        if (error) throw new Error(t.errOtpInvalid);
        track('signup_verified', { method: 'email' });
        toast.success(t.accountVerified);
        onClose();
      }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t.errAuthFailed;
        setTimeout(() => toast.error(message), 0);
    } finally {
        setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({ type: 'signup', email: formData.email.trim() });
      if (error) throw error;
      toast.success(t.codeResent);
      setResendCooldown(45);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.errAuthFailed);
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/30 backdrop-blur-sm overflow-y-auto"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
      }}
    >
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md max-h-[100dvh] overflow-y-auto bg-[#0A0A0A]/60 backdrop-blur-[40px] border border-white/15 rounded-[28px] p-6 sm:p-8 flex flex-col items-center">
        <button onClick={onClose} aria-label="Close" className="absolute top-2 right-2 sm:top-3 sm:right-3 flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10 text-white/70 transition-all"><X size={20} /></button>
        <form onSubmit={handleAuth} noValidate className="w-full flex flex-col items-center">
            {step !== 1 && <button type="button" onClick={() => setStep(1)} aria-label="Back" className="absolute top-2 left-2 sm:top-3 sm:left-3 flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10 text-white/70 transition-all z-[210]"><ChevronLeft size={20} /></button>}
            {step === 1 ? (
                <>
                    <div className="w-full text-center mb-6 sm:mb-7 mt-6 sm:mt-2">
                        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tighter">{isLogin ? t.welcomeBack : t.createAccountTitle}</h2>
                        <p className="text-sm text-white/70 font-medium">{t.authSubtitle}</p>
                    </div>
                    {!isTauri() && (
                    <div className="w-full mb-5">
                        <button type="button" onClick={signInWithGoogle}
                          className="w-full min-h-[48px] flex items-center justify-center gap-2.5 bg-white text-black/80 font-bold rounded-2xl py-3 text-sm hover:bg-white/90 transition-all">
                          <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
                            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
                            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                            <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5c-2 1.5-4.7 2.5-7.6 2.5-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.5 5.5C41.4 36 44 30.5 44 24c0-1.3-.1-2.3-.4-3.5z"/>
                          </svg>
                          {isLogin ? t.continueWithGoogle : t.signUpWithGoogle}
                        </button>
                        <div className="flex items-center gap-4 my-4">
                          <span className="flex-1 h-px bg-white/10" />
                          <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{t.or}</span>
                          <span className="flex-1 h-px bg-white/10" />
                        </div>
                    </div>
                    )}

                    <div className="w-full space-y-3">
                        {!isLogin && <InputField icon={User} placeholder={t.firstName} field="name" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} onBlur={() => setErrors({ ...errors, name: validate('name', formData.name) })} error={errors.name} showError={Boolean(touched.name && errors.name)} autoComplete="name" />}
                        <InputField icon={Mail} type="email" placeholder={t.emailPlaceholder} field="email" value={formData.email} onChange={(v: string) => setFormData({ ...formData, email: v })} onBlur={() => setErrors({ ...errors, email: validate('email', formData.email) })} error={errors.email} showError={Boolean(touched.email && errors.email)} autoComplete="email" />
                        <InputField icon={Lock} type="password" placeholder={t.passwordPlaceholder} field="password" passwordToggle value={formData.password} onChange={(v: string) => setFormData({ ...formData, password: v })} onBlur={() => setErrors({ ...errors, password: validate('password', formData.password) })} error={errors.password} showError={Boolean(touched.password && errors.password)} autoComplete="current-password" />
                    </div>
                </>
            ) : step === 2 ? (
                <div className="w-full text-center">
                    <h2 className="text-2xl font-black text-white mb-6 mt-6 sm:mt-2">{t.setupProfile}</h2>
                    <div className="grid grid-cols-2 gap-3 w-full mb-6">
                        {ROLES.map((r) => (
                            <button key={r.id} type="button" onClick={() => setFormData({ ...formData, role: r.id })} className={`p-4 rounded-2xl border ${formData.role === r.id ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5'}`}>
                                <r.icon className="mx-auto mb-2 text-primary" size={24} />
                                <div className="text-xs font-bold text-white">{t[r.labelKey]}</div>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="w-full text-center flex flex-col items-center">
                    <div className="mb-4 mt-6 sm:mt-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                        <ShieldCheck className="text-primary" size={28} />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2 tracking-tighter">{t.verifyEmailTitle}</h2>
                    <p className="text-sm text-white/70 font-medium mb-6 px-2">
                        {t.verifyEmailSubtitle} <span className="text-white font-bold break-all">{formData.email.trim()}</span>
                    </p>
                    <InputOTP
                        maxLength={6}
                        value={formData.otp}
                        onChange={(v: string) => { setFormData({ ...formData, otp: v }); if (errors.otp) setErrors({ ...errors, otp: '' }); }}
                        containerClassName="justify-center"
                    >
                        <InputOTPGroup className="gap-2">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                <InputOTPSlot key={i} index={i} className="h-12 w-11 rounded-xl border border-white/15 bg-white/[0.04] text-lg font-black text-white" />
                            ))}
                        </InputOTPGroup>
                    </InputOTP>
                    {errors.otp && <p className="text-orange-500 text-xs font-bold mt-3">{errors.otp}</p>}
                    <div className="mt-5 text-xs font-bold text-white/40">
                        {resendCooldown > 0 ? (
                            <span>{t.resendIn} {resendCooldown}s</span>
                        ) : (
                            <button type="button" onClick={handleResend} disabled={resending} className="text-primary hover:underline disabled:opacity-50">
                                {resending ? <Loader2 className="inline animate-spin" size={14} /> : t.resendCode}
                            </button>
                        )}
                    </div>
                    <p className="mt-2 text-[11px] text-white/30 font-medium">{t.checkSpam}</p>
                </div>
            )}
            <button type="submit" className="w-full min-h-[48px] py-3.5 mt-6 rounded-2xl bg-primary text-white text-base font-black flex items-center justify-center gap-3 active:bg-primary/90 transition-colors">
                {loading ? <Loader2 className="animate-spin" size={18} /> : (step === 3 ? t.verifyCta : t.continue)}
            </button>
        </form>
        {step === 1 && (
            <>
            <p className="text-sm text-white/70 mt-6 font-bold cursor-pointer hover:text-white transition-all">
            {isLogin ? `${t.dontHaveAccount} ` : `${t.haveAccount} `}
            <span className="text-primary hover:underline" onClick={() => { setIsLogin(!isLogin); setStep(1); setErrors({}); setTouched({}); }}>
                {isLogin ? t.signUpHere : t.logInHere}
            </span>
            </p>
            <button type="button" onClick={onClose} className="text-sm text-white/40 hover:text-white mt-4 font-bold transition-all">
                {t.continueWithoutAccount}
            </button>
            </>
        )}
        {(step === 2 || step === 3) && (
            <button type="button" onClick={onClose} className="text-sm text-white/40 hover:text-white mt-4 font-bold transition-all">
                {t.skipForNow}
            </button>
        )}
      </motion.div>
    </div>
  );
};