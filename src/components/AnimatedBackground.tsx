import React, { useEffect, useRef } from 'react';

type AIState = 'idle' | 'listening' | 'thinking' | 'talking';

interface BackgroundProps {
  state: AIState;
  accentColor: string; // e.g., '#7F5AF0', '#00D4FF', etc.
  isDarkMode: boolean;
}

export const AnimatedBackground: React.FC<BackgroundProps> = ({ state, accentColor, isDarkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      phase: number;
    }> = [];

    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Create particles
    const particleCount = 60;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Convert hex to rgb for glow effects
    const hexToRgb = (hex: string) => {
      let r = 127, g = 90, b = 240;
      if (hex.startsWith('#')) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
          r = parseInt(result[1], 16);
          g = parseInt(result[2], 16);
          b = parseInt(result[3], 16);
        }
      }
      return { r, g, b };
    };

    let time = 0;

    const render = () => {
      time += 0.01;
      // Clear with soft trail effect
      ctx.fillStyle = isDarkMode ? 'rgba(11, 15, 25, 0.25)' : 'rgba(248, 250, 255, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const rgb = hexToRgb(accentColor);

      // Draw futuristic wave/aura at the bottom or center
      ctx.save();
      const waveCenterY = canvas.height * 0.75;
      const amplitude = state === 'listening' ? 80 : state === 'thinking' ? 40 : state === 'talking' ? 60 : 20;
      const frequency = state === 'listening' ? 0.03 : state === 'thinking' ? 0.05 : 0.015;

      ctx.beginPath();
      ctx.moveTo(0, waveCenterY);
      for (let x = 0; x < canvas.width; x += 10) {
        const yOffset = Math.sin(x * frequency + time * (state === 'talking' ? 5 : 2)) * amplitude;
        ctx.lineTo(x, waveCenterY + yOffset);
      }
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
      ctx.lineWidth = state === 'listening' ? 4 : 2;
      ctx.stroke();

      // Second layered wave
      ctx.beginPath();
      ctx.moveTo(0, waveCenterY);
      for (let x = 0; x < canvas.width; x += 10) {
        const yOffset = Math.cos(x * frequency * 0.8 + time * 3) * amplitude * 0.6;
        ctx.lineTo(x, waveCenterY + yOffset);
      }
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Update and draw particles
      particles.forEach((p, i) => {
        // State-based movement modifiers
        let speedMult = state === 'listening' ? 2 : state === 'thinking' ? 3 : 1;
        p.x += p.vx * speedMult;
        p.y += p.vy * speedMult;

        // Wrap edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Pulsing glow effect
        p.phase += 0.05;
        const currentAlpha = p.alpha + Math.sin(p.phase) * 0.15;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.max(0.05, currentAlpha)})`;
        ctx.fill();

        // Draw connections between nearby particles (Neural-network vibe)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const lineAlpha = (1 - dist / 120) * 0.15;
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [state, accentColor, isDarkMode]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};
