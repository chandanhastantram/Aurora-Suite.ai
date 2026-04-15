import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Volume2, VolumeX, Type, Trash2 } from 'lucide-react';
import { uiAudio } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  autoTTS: boolean;
  setAutoTTS: (val: boolean) => void;
  chatFontSize: string;
  setChatFontSize: (val: string) => void;
  accentColor: string;
  onClearData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  toggleDarkMode,
  autoTTS,
  setAutoTTS,
  chatFontSize,
  setChatFontSize,
  accentColor,
  onClearData,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              uiAudio.playClick();
              onClose();
            }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden font-['Outfit']"
          >
            <div 
              className="p-6 relative overflow-hidden flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40"
              style={{ background: `linear-gradient(135deg, ${accentColor}15, transparent)` }}
            >
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Settings
              </h2>
              <button
                onClick={() => {
                  uiAudio.playClick();
                  onClose();
                }}
                className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 text-sm transition-all shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* Appearance */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Appearance</h3>
                
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    <div>
                      <p className="font-semibold text-sm">Theme</p>
                      <p className="text-[10px] text-slate-500">Toggle light or dark mode</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      uiAudio.playClick();
                      toggleDarkMode();
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isDarkMode ? 'bg-indigo-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        isDarkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Accessibility */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Accessibility</h3>
                
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                    <Type className="w-5 h-5" />
                    <div>
                      <p className="font-semibold text-sm">Chat Text Size</p>
                      <p className="text-[10px] text-slate-500">Adjust the font scale</p>
                    </div>
                  </div>
                  
                  <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1">
                    {[{ label: 'A', val: 'text-sm' }, { label: 'A', val: 'text-base' }, { label: 'A', val: 'text-lg' }].map((opt, i) => (
                      <button
                        key={opt.val}
                        onClick={() => {
                          uiAudio.playClick();
                          setChatFontSize(opt.val);
                        }}
                        className={`px-3 py-1 rounded-md transition-all ${
                          chatFontSize === opt.val 
                            ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                        style={{ fontSize: i === 0 ? '0.75rem' : i === 1 ? '1rem' : '1.125rem' }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Audio */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Audio Experience</h3>
                
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                    {autoTTS ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    <div>
                      <p className="font-semibold text-sm">Auto-Voice (TTS)</p>
                      <p className="text-[10px] text-slate-500 overflow-hidden line-clamp-1 max-w-[180px]">Automatically speak AI responses</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      uiAudio.playClick();
                      setAutoTTS(!autoTTS);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoTTS ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        autoTTS ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Data Management */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Data Management</h3>
                <button
                  onClick={() => {
                     uiAudio.playClick();
                     onClearData();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Reset App Defaults
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
