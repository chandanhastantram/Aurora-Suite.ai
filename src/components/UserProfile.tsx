import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, LogOut, ChevronDown, Cpu, Key } from 'lucide-react';

interface UserProfileProps {
  user: {
    email: string;
    name: string;
    avatar_url: string;
    provider: string;
  };
  onLogout: () => void;
  accentColor: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, accentColor }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const getProviderIcon = () => {
    switch (user.provider) {
      case 'google': return '🔵';
      case 'github': return '⚫';
      default: return '✉️';
    }
  };

  const getInitials = () => {
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative">
      {/* Profile Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-2 pr-3 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/40 backdrop-blur-md hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all group"
        whileTap={{ scale: 0.97 }}
      >
        {/* Avatar */}
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            className="w-8 h-8 rounded-lg object-cover border border-white/30"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md"
            style={{ backgroundColor: accentColor }}
          >
            {getInitials()}
          </div>
        )}
        <div className="hidden md:block text-left">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[100px]">
            {user.name}
          </p>
          <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[100px]">
            {user.email}
          </p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Dropdown Card */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Profile Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-72 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/50 rounded-2xl shadow-2xl shadow-black/20 z-50 overflow-hidden"
          >
            {/* Profile Header */}
            <div
              className="p-5 text-center relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}05)` }}
            >
              <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at top, ${accentColor}, transparent)` }} />
              
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40 mx-auto shadow-lg relative z-10"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto shadow-lg relative z-10"
                  style={{ backgroundColor: accentColor }}
                >
                  {getInitials()}
                </div>
              )}
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-3 relative z-10">{user.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 relative z-10">{user.email}</p>
            </div>

            {/* Profile Details */}
            <div className="p-3 space-y-1 border-t border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center gap-3 p-2.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30">
                <User className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Name</span>
                  <span className="font-medium">{user.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Email</span>
                  <span className="font-medium">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30">
                <Key className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Auth Provider</span>
                  <span className="font-medium capitalize">{getProviderIcon()} {user.provider}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30">
                <Shield className="w-4 h-4 text-emerald-500" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Status</span>
                  <span className="font-medium text-emerald-500">Verified & Active</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Session</span>
                  <span className="font-medium">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30">
                <Cpu className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Plan</span>
                  <span className="font-medium" style={{ color: accentColor }}>Premium AI Access</span>
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/50">
              <button
                onClick={() => { setIsOpen(false); onLogout(); }}
                className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};
