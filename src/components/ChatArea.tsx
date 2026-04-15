import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Volume2, Sparkles, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { uiAudio } from '../utils/audio';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  imageUrl?: string;
};

interface ChatAreaProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (text: string, imageFile?: File | null) => void;
  accentColor: string;
  onVoiceSpeak: (text: string) => void;
  chatFontSize: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isTyping,
  onSendMessage,
  accentColor,
  onVoiceSpeak,
  chatFontSize,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle Speech Recognition for dictation
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Your browser does not support Voice Dictation / Speech Recognition.');
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      uiAudio.playChime();
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText((prev) => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    uiAudio.playClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || isTyping) return;
    uiAudio.playClick();
    onSendMessage(inputText.trim(), selectedImage);
    setInputText('');
    setSelectedImage(null);
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full px-4 md:px-8 relative z-10">
      {/* Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-2">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isAI = msg.role === 'assistant';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 max-w-2xl ${isAI ? 'self-start mr-auto' : 'self-end ml-auto flex-row-reverse'}`}
              >
                {/* Micro avatar for AI messages */}
                {isAI && (
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md border border-white/20 shrink-0"
                    style={{ backgroundColor: accentColor + '22', color: accentColor }}
                  >
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`relative p-4 rounded-2xl shadow-sm backdrop-blur-md border ${
                    isAI
                      ? 'bg-white/70 dark:bg-slate-900/70 border-slate-200/50 dark:border-slate-800/50 text-slate-800 dark:text-slate-100 rounded-tl-sm'
                      : 'bg-gradient-to-r text-white rounded-tr-sm border-transparent'
                  }`}
                  style={!isAI ? { backgroundImage: `linear-gradient(to right, ${accentColor}, ${accentColor}dd)` } : {}}
                >
                  <div className="flex flex-col gap-2">
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="attachment" className="rounded-lg max-w-full h-auto max-h-64 object-cover shadow-sm bg-black/10" />
                    )}
                    {msg.content && (
                      <div className={`${chatFontSize} leading-relaxed overflow-hidden transition-all duration-300`}>
                        <ReactMarkdown
                          components={{
                            code({ node, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              const isInline = !match && !String(children).includes('\n');
                              return !isInline && match ? (
                                <SyntaxHighlighter
                                  style={vscDarkPlus as any}
                                  language={match[1]}
                                  PreTag="div"
                                  className="rounded-lg my-3 !text-xs !bg-slate-900/90"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className="bg-slate-200/50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded text-[11px] font-mono text-pink-500 dark:text-pink-400" {...props}>
                                  {children}
                                </code>
                              );
                            },
                            p: ({ children }) => <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="pl-1">{children}</li>,
                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-4 text-slate-900 dark:text-white">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-md font-bold mb-2 mt-3 text-slate-800 dark:text-slate-100">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2 text-slate-800 dark:text-slate-200">{children}</h3>,
                            a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">{children}</a>,
                            strong: ({ children }) => <strong className="font-bold text-slate-900 dark:text-slate-100">{children}</strong>
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar for AI Response */}
                  {isAI && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                      {/* Text-To-Speech Reader */}
                      <button
                        onClick={() => {
                          uiAudio.playClick();
                          onVoiceSpeak(msg.content);
                        }}
                        className="p-1 rounded bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1 text-[10px]"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Read
                      </button>

                      {/* Copy to Clipboard */}
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1 rounded bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1 text-[10px]"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === msg.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}

                  {/* Timestamp */}
                  <span className={`block text-[9px] mt-1 text-right ${isAI ? 'text-slate-400' : 'text-white/70'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Real-time Streaming Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 max-w-sm mr-auto"
          >
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/20 shrink-0"
              style={{ backgroundColor: accentColor + '22', color: accentColor }}
            >
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
              <span 
                className="w-1.5 h-1.5 rounded-full animate-bounce" 
                style={{ backgroundColor: accentColor, animationDelay: '0s' }}
              />
              <span 
                className="w-1.5 h-1.5 rounded-full animate-bounce" 
                style={{ backgroundColor: accentColor, animationDelay: '0.2s' }}
              />
              <span 
                className="w-1.5 h-1.5 rounded-full animate-bounce" 
                style={{ backgroundColor: accentColor, animationDelay: '0.4s' }}
              />
            </div>
          </motion.div>
        )}

        <div ref={endOfMessagesRef} />
      </div>

      {/* Futuristic Floating Input Box */}
      <div className="py-4 backdrop-blur-md sticky bottom-0 z-20">
        <form 
          onSubmit={handleSubmit} 
          className="relative flex items-center bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-xl p-2 transition-all focus-within:ring-2 focus-within:ring-opacity-40"
          style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
        >
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-2.5 rounded-xl transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Voice Dictation"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Image Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2.5 rounded-xl transition-all ${
              selectedImage ? 'text-indigo-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Upload Image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedImage(e.target.files[0]);
              }
            }}
            accept="image/*"
            className="hidden"
          />

          {/* Text Input Field */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            placeholder={isListening ? 'Listening... Speak now' : 'Ask Aurora or type your commands here...'}
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />

          {/* Premium Animated Send Button */}
          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedImage) || isTyping}
            className="p-3 rounded-xl flex items-center justify-center text-white font-semibold transition-all shadow-md disabled:opacity-40 hover:scale-105 active:scale-95 disabled:hover:scale-100"
            style={{ backgroundColor: accentColor }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-400 dark:text-slate-600 mt-2">
          Conversations are securely managed. Stream typing mode is fully responsive.
        </p>
      </div>
    </div>
  );
};
