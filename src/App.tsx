import React, { useState, useEffect } from 'react';
import { Sidebar, Persona, personas } from './components/Sidebar';
import { Avatar } from './components/Avatar';
import { ChatArea, Message } from './components/ChatArea';
import { WelcomeBanner } from './components/WelcomeBanner';
import { AnimatedBackground } from './components/AnimatedBackground';
import { UserProfile } from './components/UserProfile';
import { fetchAIResponse, fetchImageAnalysis, fetchImageGeneration } from './utils/aiEngine';
import { uiAudio } from './utils/audio';
import { Download } from 'lucide-react';
import { Login } from './components/Login';
import { getLocalSession, clearLocalSession } from './utils/localAuth';

type UserData = {
  email: string;
  name: string;
  avatar_url: string;
  provider: string;
};

type Session = {
  id: string;
  name: string;
  messages: Message[];
};

export const App: React.FC = () => {
  // ── Authentication State ──
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const localSession = getLocalSession();
      if (localSession) {
        setCurrentUser({
          email: localSession.email,
          name: localSession.name,
          avatar_url: localSession.avatar_url,
          provider: localSession.provider,
        });
        setIsAuthenticated(true);
      }
      setAuthChecked(true);
    };

    checkAuth();
  }, []);

  // ── Theme & Persona State ──
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('aurora_theme');
    return saved ? JSON.parse(saved) : true;
  });
  const [selectedPersona, setSelectedPersona] = useState<Persona>(() => {
    const saved = localStorage.getItem('aurora_persona');
    return saved ? JSON.parse(saved) : personas[0];
  });

  // ── Chat Sessions ──
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('aurora_sessions');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'sess-default',
        name: 'Initial Conversation',
        messages: [
          {
            id: 'msg-welcome',
            role: 'assistant',
            content: `Greetings! I am ${personas[0].name}, your premium AI Maid and virtual companion. How may I assist you today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      },
    ];
  });
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    const saved = localStorage.getItem('aurora_sessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed[0]?.id || 'sess-default';
    }
    return 'sess-default';
  });

  // ── Action/Animation State ──
  const [aiState, setAiState] = useState<'idle' | 'listening' | 'thinking' | 'talking'>('idle');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // ── Persist Settings ──
  useEffect(() => {
    localStorage.setItem('aurora_theme', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('aurora_persona', JSON.stringify(selectedPersona));
  }, [selectedPersona]);

  useEffect(() => {
    localStorage.setItem('aurora_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // ── Current Active Session ──
  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];

  // ── TTS ──
  const handleTTS = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setAiState('talking');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1.1;
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(
      (v) => v.name.includes('Female') || v.name.includes('Google US English') || v.name.includes('Zira')
    );
    if (femaleVoice) utterance.voice = femaleVoice;
    utterance.onend = () => setAiState('idle');
    utterance.onerror = () => setAiState('idle');
    window.speechSynthesis.speak(utterance);
  };

  // ── Send Message Handler ──
  const handleSendMessage = async (text: string, imageFile?: File | null) => {
    if ((!text.trim() && !imageFile) || isTyping) return;

    const isImagine = text.trim().startsWith('/imagine');
    
    let imageUrl: string | undefined;
    if (imageFile) {
        imageUrl = URL.createObjectURL(imageFile);
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      imageUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          let newName = s.name;
          if (s.messages.length <= 1 && text.trim()) {
            newName = text.slice(0, 25) + (text.length > 25 ? '...' : '');
          }
          return { ...s, name: newName, messages: [...s.messages, userMsg] };
        }
        return s;
      })
    );

    setIsTyping(true);
    setAiState('thinking');

    const aiMessageId = `msg-ai-${Date.now()}`;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [
              ...s.messages,
              {
                id: aiMessageId,
                role: 'assistant',
                content: '',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ],
          };
        }
        return s;
      })
    );

    uiAudio.playTypingBlip();

    try {
      if (isImagine) {
        const prompt = text.replace('/imagine', '').trim();
        const generatedImageUrl = await fetchImageGeneration(prompt);
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === currentSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) => (m.id === aiMessageId ? { ...m, content: 'Here is your generated image:', imageUrl: generatedImageUrl } : m)),
              };
            }
            return s;
          })
        );
      } else if (imageFile) {
        const analysisResult = await fetchImageAnalysis(imageFile, text);
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === currentSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) => (m.id === aiMessageId ? { ...m, content: analysisResult } : m)),
              };
            }
            return s;
          })
        );
      } else {
        const currentMessages = currentSession.messages;
        await fetchAIResponse(
          text,
          currentMessages,
          selectedPersona,
          (currentChunk: string) => {
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id === currentSessionId) {
                  return {
                    ...s,
                    messages: s.messages.map((m) => (m.id === aiMessageId ? { ...m, content: currentChunk } : m)),
                  };
                }
                return s;
              })
            );
          }
        );
      }
    } catch (error) {
      console.error(error);
      setSessions((prev) =>
          prev.map((s) => {
            if (s.id === currentSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) => (m.id === aiMessageId ? { ...m, content: 'Sorry, I encountered an error processing your request. Please try again.' } : m)),
              };
            }
            return s;
          })
        );
    }

    setIsTyping(false);
    setAiState('idle');
    uiAudio.playChime();
  };

  // ── Session Management ──
  const createNewSession = () => {
    const newSess: Session = {
      id: `sess-${Date.now()}`,
      name: `Conversation ${sessions.length + 1}`,
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `New session started. How may I serve you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
    setSessions((prev) => [newSess, ...prev]);
    setCurrentSessionId(newSess.id);
  };

  const deleteSession = (id: string) => {
    if (sessions.length <= 1) return;
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(sessions[0].id);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Clear all chat sessions and history?')) {
      const defaultSess: Session = {
        id: 'sess-default',
        name: 'Initial Conversation',
        messages: [
          {
            id: 'msg-welcome',
            role: 'assistant',
            content: `History reset. Ready for a new beginning.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      };
      setSessions([defaultSess]);
      setCurrentSessionId('sess-default');
    }
  };

  const handleLogout = async () => {
    clearLocalSession();
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('aurora_sessions');
  };

  // ── Export Chat ──
  const handleExportChat = () => {
    let content = `Chat Session: ${currentSession.name}\n`;
    content += `Persona: ${selectedPersona.name} (${selectedPersona.role})\n`;
    content += `Exported on: ${new Date().toLocaleString()}\n\n`;
    content += `-------------------------------------------------\n\n`;
    
    currentSession.messages.forEach(msg => {
      const author = msg.role === 'user' ? 'You' : selectedPersona.name;
      content += `[${msg.timestamp}] ${author}:\n${msg.content || (msg.imageUrl ? '[Attached Image]' : '')}\n\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSession.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Auth Loading Splash ──
  if (!authChecked) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 font-['Outfit']">
        <AnimatedBackground state="thinking" accentColor={selectedPersona.accent} isDarkMode={true} />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <Avatar state="thinking" accentColor={selectedPersona.accent} />
          <p className="text-sm text-slate-400 animate-pulse">Initializing Aurora Suite...</p>
        </div>
      </div>
    );
  }

  // ── Login Screen ──
  if (!isAuthenticated) {
    return (
      <Login
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }}
        accentColor={selectedPersona.accent}
      />
    );
  }

  // ── Main Dashboard ──
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-['Outfit'] transition-colors duration-300 relative selection:bg-indigo-500/30">
      {/* Animated Background */}
      <AnimatedBackground state={aiState} accentColor={selectedPersona.accent} isDarkMode={isDarkMode} />

      {/* Left Sidebar */}
      <Sidebar
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        selectedPersona={selectedPersona}
        setSelectedPersona={setSelectedPersona}
        sessions={sessions.map((s) => ({ id: s.id, name: s.name }))}
        currentSessionId={currentSessionId}
        createNewSession={createNewSession}
        loadSession={(id) => setCurrentSessionId(id)}
        deleteSession={deleteSession}
        onClearHistory={handleClearHistory}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        {/* Header with User Profile */}
        <header className="p-4 flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: selectedPersona.accent }}
              />
              Aurora Suite
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your context-aware, animated AI companion
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Export Chat Button */}
            <button
              onClick={handleExportChat}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 transition-all text-[10px] font-semibold tracking-wide uppercase shadow-sm"
              title="Export conversation to TXT file"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>

            {/* AI Status Badge */}
            <div className="hidden md:flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 px-3 py-1.5 rounded-full shadow-sm">
              <span
                className="w-1.5 h-1.5 rounded-full animate-ping"
                style={{ backgroundColor: selectedPersona.accent }}
              />
              <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                {aiState}
              </span>
            </div>

            {/* User Profile Dropdown */}
            {currentUser && (
              <UserProfile
                user={currentUser}
                onLogout={handleLogout}
                accentColor={selectedPersona.accent}
              />
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Avatar */}
          <div className="flex flex-col items-center justify-center pt-8 pb-4 shrink-0">
            <Avatar state={aiState} accentColor={selectedPersona.accent} />
          </div>

          {/* Welcome Banner */}
          {currentSession.messages.length <= 1 && (
            <WelcomeBanner persona={selectedPersona} onQuickReply={handleSendMessage} />
          )}

          {/* Chat Area */}
          <ChatArea
            messages={currentSession.messages}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            accentColor={selectedPersona.accent}
            onVoiceSpeak={handleTTS}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
