import React from 'react';
import { Sparkles, Mic, MessageSquare, Zap, ShieldCheck } from 'lucide-react';
import { Persona } from './Sidebar';

interface WelcomeBannerProps {
  persona: Persona;
  onQuickReply: (text: string) => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ persona, onQuickReply }) => {
  const quickQuestions = [
    "Tell me about your features and abilities.",
    "Can you organize my schedule for today?",
    "Give me some tech/productivity advice.",
    "Tell me a short bedtime story/relaxing thought."
  ];

  return (
    <div className="max-w-2xl mx-auto mt-6 mb-8 p-6 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/40 shadow-xl text-center">
      <div 
        className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg"
        style={{ backgroundColor: persona.accent + '33', color: persona.accent }}
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        Welcome! I am {persona.name}
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-lg mx-auto leading-relaxed">
        I am your premium AI assistant and virtual maid companion. Enjoy highly interactive memory-aware chats, customizable persona tones, streaming responses, and responsive voice feedback.
      </p>

      {/* Feature Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        <span className="flex items-center gap-1 text-[11px] bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-200/40 dark:border-slate-700/40 text-slate-600 dark:text-slate-300">
          <Zap className="w-3.5 h-3.5 text-amber-500" /> Fast Response Streaming
        </span>
        <span className="flex items-center gap-1 text-[11px] bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-200/40 dark:border-slate-700/40 text-slate-600 dark:text-slate-300">
          <Mic className="w-3.5 h-3.5 text-emerald-500" /> Speech to Text & TTS
        </span>
        <span className="flex items-center gap-1 text-[11px] bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-200/40 dark:border-slate-700/40 text-slate-600 dark:text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Offline Privacy Mode
        </span>
      </div>

      {/* Suggested Quick Replies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
        {quickQuestions.map((text, idx) => (
          <button
            key={idx}
            onClick={() => onQuickReply(text)}
            className="flex items-center gap-2 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-800/30 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all text-xs text-slate-700 dark:text-slate-300"
          >
            <MessageSquare className="w-4 h-4 shrink-0" style={{ color: persona.accent }} />
            <span className="line-clamp-1">{text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
