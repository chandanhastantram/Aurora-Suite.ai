import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type AIState = 'idle' | 'listening' | 'thinking' | 'talking';

interface AvatarProps {
  state: AIState;
  accentColor: string;
}

export const Avatar: React.FC<AvatarProps> = ({ state, accentColor }) => {
  const [blink, setBlink] = useState(false);

  // Random eye blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 4000);

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className="relative flex items-center justify-center w-48 h-48 md:w-56 md:h-56">
      {/* Outer Holographic Glow Rings */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-dashed opacity-40"
        style={{ borderColor: accentColor }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: state === 'thinking' ? 4 : 12, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-2 rounded-full border border-dotted opacity-30"
        style={{ borderColor: accentColor }}
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: state === 'listening' ? 3 : 8, ease: 'linear' }}
      />

      {/* Main Avatar Wrapper with Floating / Breathing Animation */}
      <motion.div
        className="relative w-40 h-40 flex items-center justify-center rounded-full overflow-hidden shadow-2xl backdrop-blur-md bg-white/5 border border-white/10"
        animate={{
          y: state === 'listening' ? [0, -4, 0] : [0, -8, 0],
          scale: state === 'talking' ? [1, 1.03, 1] : 1,
        }}
        transition={{
          repeat: Infinity,
          duration: state === 'talking' ? 0.8 : 3,
          ease: 'easeInOut',
        }}
      >
        {/* Soft Background Gradient Glow */}
        <div 
          className="absolute inset-0 opacity-20 blur-xl"
          style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
        />

        {/* Custom SVG Avatar - Premium AI Maid Aesthetic */}
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
          {/* Base Head / Face Silhouette */}
          <circle cx="100" cy="110" r="45" fill="#FFEBE5" />
          {/* Cute Blush / Subsurface scattering glow */}
          <ellipse cx="78" cy="118" rx="7" ry="3.5" fill="#FF8A8A" opacity="0.5" />
          <ellipse cx="122" cy="118" rx="7" ry="3.5" fill="#FF8A8A" opacity="0.5" />

          {/* Hair - Front Bangs and Side Locks (Soft pastel styling) */}
          <path d="M 50 110 Q 50 60, 100 60 Q 150 60, 150 110 Q 135 150, 125 105 Q 100 80, 75 105 Q 65 150, 50 110" fill="#E8EDF8" />
          
          {/* Eyes & Expressions */}
          {/* Left Eye */}
          <g>
            {blink ? (
              <path d="M 72 108 Q 80 113, 88 108" stroke="#4A5568" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            ) : (
              <>
                <ellipse cx="80" cy="106" rx="6" ry="8" fill="#1A202C" />
                {/* Highlights */}
                <circle cx="78" cy="103" r="2.5" fill="#FFFFFF" />
                <circle cx="83" cy="108" r="1" fill={accentColor} />
              </>
            )}
          </g>

          {/* Right Eye */}
          <g>
            {blink ? (
              <path d="M 112 108 Q 120 113, 128 108" stroke="#4A5568" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            ) : (
              <>
                <ellipse cx="120" cy="106" rx="6" ry="8" fill="#1A202C" />
                {/* Highlights */}
                <circle cx="118" cy="103" r="2.5" fill="#FFFFFF" />
                <circle cx="123" cy="108" r="1" fill={accentColor} />
              </>
            )}
          </g>

          {/* Mouth / Smile (Changes with state) */}
          {state === 'talking' ? (
            <motion.path
              d="M 94 125 Q 100 133, 106 125 Z"
              fill="#FF8A8A"
              animate={{ d: ["M 94 125 Q 100 133, 106 125 Z", "M 96 125 Q 100 128, 104 125 Z"] }}
              transition={{ repeat: Infinity, duration: 0.2 }}
            />
          ) : state === 'listening' ? (
            <path d="M 95 125 Q 100 128, 105 125" stroke="#4A5568" strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M 94 126 Q 100 130, 106 126" stroke="#4A5568" strokeWidth="2" fill="none" strokeLinecap="round" />
          )}

          {/* Maid Headband / Cybernetic Ribbon */}
          <path d="M 52 75 Q 100 50, 148 75" stroke={accentColor} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M 55 70 L 65 50 L 80 62 Z" fill="#FFFFFF" />
          <path d="M 145 70 L 135 50 L 120 62 Z" fill="#FFFFFF" />

          {/* Futuristic Collar / Frilly Ribbon */}
          <path d="M 75 145 Q 100 155, 125 145 L 120 160 L 80 160 Z" fill="#FFFFFF" />
          {/* Glowing node at center collar */}
          <circle cx="100" cy="150" r="5" fill={accentColor} />
          <circle cx="100" cy="150" r="2" fill="#FFFFFF" />

          {/* Digital Cyber-Ears / Headset Nodes */}
          <circle cx="45" cy="110" r="8" fill="#1A202C" stroke={accentColor} strokeWidth="2" />
          <circle cx="155" cy="110" r="8" fill="#1A202C" stroke={accentColor} strokeWidth="2" />
        </svg>

        {/* Floating status tag */}
        <div className="absolute bottom-2 px-3 py-0.5 rounded-full bg-black/40 border border-white/20 backdrop-blur-md text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1.5">
          <span 
            className="w-1.5 h-1.5 rounded-full animate-pulse" 
            style={{ backgroundColor: accentColor }}
          />
          {state}
        </div>
      </motion.div>
    </div>
  );
};
