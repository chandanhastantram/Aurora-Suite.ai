import React from 'react';
import { Sparkles, Sun, Moon, PlusCircle, Trash2, Play, Settings2, LogOut } from 'lucide-react';
import { uiAudio } from '../utils/audio';

export type Persona = {
  id: string;
  name: string;
  role: string;
  tone: string;
  accent: string;
  description: string;
  bgLight: string;
  bgDark: string;
};

export const personas: Persona[] = [
  {
    id: 'elegance',
    name: 'Aurora (Maid)',
    role: 'Premium AI Maid',
    tone: 'Gentle, attentive, sophisticated, soft and highly respectful.',
    accent: '#7F5AF0',
    description: 'An exceptionally polite and graceful virtual maid tailored for your digital comfort.',
    bgLight: 'bg-violet-50/50',
    bgDark: 'bg-indigo-950/20',
  },
  {
    id: 'sakura',
    name: 'Sakura (Caring)',
    role: 'Affectionate Companion',
    tone: 'Sweet, empathetic, warmly expressive, highly supportive.',
    accent: '#FF6584',
    description: 'Warm and comforting, Sakura listens attentively and offers encouraging words.',
    bgLight: 'bg-pink-50/50',
    bgDark: 'bg-rose-950/20',
  },
  {
    id: 'nova',
    name: 'Nova (Automaton)',
    role: 'Futuristic Cyber-Agent',
    tone: 'Crisp, logical, hyper-efficient, uses tech-forward expressions.',
    accent: '#00D4FF',
    description: 'A cybernetic assistant optimized for fast, data-driven, and highly precise answers.',
    bgLight: 'bg-cyan-50/50',
    bgDark: 'bg-slate-950/40',
  },
  {
    id: 'celeste',
    name: 'Celeste (Nanny)',
    role: 'Gentle Caretaker',
    tone: 'Maternal, patient, nurturing, highly considerate.',
    accent: '#10B981',
    description: 'Caring and protective, offering thoughtful advice for your daily health and productivity.',
    bgLight: 'bg-emerald-50/50',
    bgDark: 'bg-teal-950/20',
  },
];

interface SidebarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  selectedPersona: Persona;
  setSelectedPersona: (p: Persona) => void;
  sessions: Array<{ id: string; name: string }>;
  currentSessionId: string;
  createNewSession: () => void;
  loadSession: (id: string) => void;
  deleteSession: (id: string) => void;
  onClearHistory: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isDarkMode,
  toggleDarkMode,
  selectedPersona,
  setSelectedPersona,
  sessions,
  currentSessionId,
  createNewSession,
  loadSession,
  deleteSession,
  onClearHistory,
  onLogout,
}) => {
  return (
    <aside className="w-80 flex flex-col h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-r border-slate-200/50 dark:border-slate-800/50 overflow-y-auto overflow-x-hidden transition-colors duration-300 relative z-20">
      {/* Top Header & Branding */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden"
              style={{ backgroundColor: selectedPersona.accent }}
            >
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
              <Sparkles className="w-5 h-5 text-white animate-pulse relative z-10" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                {selectedPersona.name}
              </h1>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Premium AI Experience
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              uiAudio.playClick();
              toggleDarkMode();
            }}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Personas Selector */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50">
        <h2 className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-2">
          <Settings2 className="w-3.5 h-3.5" /> Select Persona
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {personas.map((persona) => {
            const isActive = selectedPersona.id === persona.id;
            return (
              <button
                key={persona.id}
                onClick={() => {
                  uiAudio.playClick();
                  setSelectedPersona(persona);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'border-transparent shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
                style={
                  isActive
                    ? { backgroundColor: persona.accent + '22', borderColor: persona.accent }
                    : {}
                }
              >
                <div
                  className="w-3 h-3 rounded-full mb-2"
                  style={{ backgroundColor: persona.accent }}
                />
                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                  {persona.name.split(' ')[0]}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {persona.role}
                </p>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50 leading-relaxed">
          {selectedPersona.description}
        </p>
      </div>

      {/* Powered by Groq Badge */}
      <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-cyan-500/10 dark:from-violet-500/20 dark:to-cyan-500/20 border border-violet-200/30 dark:border-violet-800/30">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">⚡ Powered by Groq AI</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Llama 3.3 70B Versatile · Live</p>
          </div>
        </div>
      </div>

      {/* Sessions / Chat History */}
      <div className="p-6 flex-1 flex flex-col min-h-[220px]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-2">
            <Play className="w-3.5 h-3.5" /> Chat History
          </h2>
          <button
            onClick={() => {
              uiAudio.playChime();
              createNewSession();
            }}
            className="flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-opacity"
            style={{ color: selectedPersona.accent }}
          >
            <PlusCircle className="w-3.5 h-3.5" /> New
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[160px] pr-1">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              onClick={() => {
                uiAudio.playClick();
                loadSession(sess.id);
              }}
              className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                sess.id === currentSessionId
                  ? 'border-transparent shadow-sm'
                  : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
              style={
                sess.id === currentSessionId
                  ? { backgroundColor: selectedPersona.accent + '22', borderColor: selectedPersona.accent }
                  : {}
              }
            >
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate pr-2">
                {sess.name}
              </span>
              {sessions.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    uiAudio.playClick();
                    deleteSession(sess.id);
                  }}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onClearHistory}
          className="mt-4 py-2 border border-dashed border-red-500/40 text-red-500 text-xs rounded-xl hover:bg-red-500/10 transition-colors w-full flex items-center justify-center gap-2"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear All History
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="mt-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition-colors w-full flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 text-center text-[10px] text-slate-400">
        <p>Premium Futuristic AI Assistant</p>
        <p className="mt-0.5">React + Tailwind + Groq AI</p>
      </div>
    </aside>
  );
};
