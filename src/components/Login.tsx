import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, ShieldCheck, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { validateLocalLogin, registerLocalUser, handleOAuthLocal, saveLocalSession } from '../utils/localAuth';
import { Avatar } from './Avatar';
import { AnimatedBackground } from './AnimatedBackground';

interface LoginProps {
  onLoginSuccess: (user: { email: string; name: string; avatar_url: string; provider: string }) => void;
  accentColor?: string;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, accentColor = '#7F5AF0' }) => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Real-time validation
  const [emailValid, setEmailValid] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  useEffect(() => {
    setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  }, [email]);

  useEffect(() => {
    let strength = 0;
    if (password.length > 5) strength += 20;
    if (password.length > 8) strength += 20;
    if (password.length > 12) strength += 10;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength += 10;
    setPasswordStrength(Math.min(100, strength));
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return 'from-red-500 to-red-400';
    if (passwordStrength <= 50) return 'from-amber-500 to-orange-400';
    if (passwordStrength <= 75) return 'from-blue-500 to-indigo-400';
    return 'from-emerald-500 to-teal-400';
  };

  const getStrengthLabel = () => {
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Strong';
    return 'Excellent';
  };

  // Auth Submit Handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Please fill in all fields to proceed.');
      return;
    }

    if (!emailValid) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      // Always use local authentication for user privacy
      await new Promise((resolve) => setTimeout(resolve, 600)); // slightly faster mock delay
      
      const pseudoHash = btoa(password); // Simple hash-like representation for mock DB

      if (isLogin) {
        const localUser = validateLocalLogin(email, pseudoHash);
        const sessionUser = saveLocalSession(localUser);
        onLoginSuccess({
          email: sessionUser.email,
          name: sessionUser.name,
          avatar_url: sessionUser.avatar_url,
          provider: 'local',
        });
      } else {
        registerLocalUser(email, pseudoHash);
        setSuccessMessage('Local account created successfully! You can now sign in.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Local mock OAuth
      await new Promise((resolve) => setTimeout(resolve, 800));
      const displayName = provider === 'google' ? 'Google User' : 'GitHub Dev';
      const localUser = handleOAuthLocal(displayName, provider);
      
      onLoginSuccess({
        email: localUser.email,
        name: localUser.name,
        avatar_url: localUser.avatar_url,
        provider,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || `${provider} authentication failed.`);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 overflow-hidden font-['Outfit']">
      {/* Animated Canvas Background */}
      <AnimatedBackground state={isLoading ? 'thinking' : 'idle'} accentColor={accentColor} isDarkMode={true} />

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(circle, ${accentColor}, transparent)` }}
          animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 -right-20 w-[400px] h-[400px] rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #FF6584, transparent)' }}
          animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-20 left-1/3 w-[450px] h-[450px] rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, #00D4FF, transparent)' }}
          animate={{ x: [0, 15, 0], y: [0, -25, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
        />
      </div>

      {/* Glassmorphic Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md relative z-10 bg-slate-900/50 backdrop-blur-2xl border border-slate-700/40 rounded-3xl shadow-2xl shadow-black/30 flex flex-col items-center overflow-hidden"
      >
        {/* Top Gradient Accent Line */}
        <div
          className="w-full h-1"
          style={{ background: `linear-gradient(to right, ${accentColor}, #00D4FF, ${accentColor})` }}
        />

        <div className="w-full p-8 flex flex-col items-center">
          {/* Animated AI Avatar */}
          <motion.div
            className="-mt-2 mb-3"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Avatar state={isLoading ? 'thinking' : 'listening'} accentColor={accentColor} />
          </motion.div>

          {/* Title */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center justify-center gap-2">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: accentColor }}
              />
              Aurora Suite
            </h2>
            <p className="text-sm text-slate-400 mt-1.5">
              {isLogin
                ? 'Sign in to access your AI companion'
                : 'Create your account and meet Aurora'}
            </p>
          </motion.div>

          {/* Sign In / Sign Up Toggle */}
          <div className="flex bg-slate-950/70 p-1 rounded-xl w-full mb-6 relative border border-slate-800/50">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setErrorMessage(null); setSuccessMessage(null); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all relative z-10 ${
                isLogin ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setErrorMessage(null); setSuccessMessage(null); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all relative z-10 ${
                !isLogin ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Sign Up
            </button>
            <motion.div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg shadow-lg"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
              animate={{ left: isLogin ? '4px' : 'calc(50%)' }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          </div>

          {/* Success / Error Messages */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="w-full p-3 rounded-xl text-xs flex items-start gap-2 border overflow-hidden bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              >
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </motion.div>
            )}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="w-full p-3 rounded-xl text-xs flex items-start gap-2 border overflow-hidden bg-rose-500/10 border-rose-500/30 text-rose-400"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-slate-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailTouched(true); }}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder-slate-600"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
                {emailTouched && email && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {emailValid ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                    )}
                  </motion.div>
                )}
              </div>
              {emailTouched && email && !emailValid && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] text-rose-400 mt-1 ml-1"
                >
                  Please enter a valid email address
                </motion.p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-slate-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true); }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder-slate-600"
                  required
                  disabled={isLoading}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter — only for Sign Up */}
              {!isLogin && passwordTouched && password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2.5"
                >
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                    <span>Password Strength</span>
                    <span className={
                      passwordStrength > 75 ? 'text-emerald-400' :
                      passwordStrength > 50 ? 'text-blue-400' :
                      passwordStrength > 25 ? 'text-amber-400' : 'text-rose-400'
                    }>
                      {getStrengthLabel()}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${getStrengthColor()} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                    {[
                      { label: '6+ chars', ok: password.length >= 6 },
                      { label: 'Uppercase', ok: /[A-Z]/.test(password) },
                      { label: 'Number', ok: /[0-9]/.test(password) },
                      { label: 'Special', ok: /[!@#$%^&*]/.test(password) },
                    ].map((rule) => (
                      <span key={rule.label} className={`text-[9px] flex items-center gap-0.5 ${rule.ok ? 'text-emerald-400' : 'text-slate-600'}`}>
                        {rule.ok ? <CheckCircle className="w-2.5 h-2.5" /> : <span className="w-2.5 h-2.5 rounded-full border border-slate-700 inline-block" />}
                        {rule.label}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 text-white text-sm font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed mt-2 relative overflow-hidden group"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                boxShadow: `0 8px 30px ${accentColor}30`,
              }}
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.99 }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Dashboard</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </motion.button>
          </form>

          {/* OAuth Divider */}
          <div className="w-full flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          </div>

          {/* OAuth Social Buttons */}
          <div className="w-full grid grid-cols-2 gap-3">
            <motion.button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
              className="py-3 px-4 bg-slate-800/40 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-slate-300 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="group-hover:text-white transition-colors">Google</span>
            </motion.button>

            <motion.button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              disabled={isLoading}
              className="py-3 px-4 bg-slate-800/40 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-slate-300 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="group-hover:text-white transition-colors">GitHub</span>
            </motion.button>
          </div>

          {/* Security Badge */}
          <motion.div
            className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
            <span>End-to-end encrypted · Secured with Local Storage</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
