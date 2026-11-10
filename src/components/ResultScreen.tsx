import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, ShieldCheck } from 'lucide-react';

interface ResultScreenProps {
  outcome: 'accepted' | 'declined';
  onReset?: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ outcome }) => {
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const floatingHearts = useMemo(() => {
    const count = isMobile ? 10 : 18;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${6 + Math.random() * 88}%`,
      size: (isMobile ? 12 : 14) + Math.random() * (isMobile ? 14 : 20),
      duration: 5 + Math.random() * 4,
      delay: Math.random() * 4,
      opacity: 0.25 + Math.random() * 0.45,
      drift: (Math.random() - 0.5) * 60,
    }));
  }, [isMobile]);

  if (outcome === 'accepted') {
    return (
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 max-w-sm sm:max-w-md w-full mx-auto select-none">
        {/* Floating rising hearts for celebration */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-10 gpu-layer" aria-hidden="true">
          {floatingHearts.map((heart) => (
            <motion.div
              key={heart.id}
              initial={{ y: '108vh', opacity: 0, x: 0 }}
              animate={{
                y: '-18vh',
                opacity: [0, heart.opacity, heart.opacity, 0],
                x: heart.drift,
              }}
              transition={{
                duration: heart.duration,
                repeat: Infinity,
                delay: heart.delay,
                ease: 'easeInOut',
              }}
              className="absolute will-change-transform"
              style={{ left: heart.left }}
            >
              <Heart
                className="text-rose-400 fill-rose-400/40"
                style={{ width: `${heart.size}px`, height: `${heart.size}px` }}
              />
            </motion.div>
          ))}
        </div>

        {/* Cinematic Acceptance Content */}
        <motion.main
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-20 flex flex-col items-center text-center w-full"
          role="region"
          aria-label="Acceptance response"
        >
          {/* Subtle glowing heart emblem with trust badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.15, 1] }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="mb-4 sm:mb-5 relative"
          >
            <div className="absolute inset-0 rounded-full bg-pink-500/30 blur-lg sm:blur-xl animate-pulse" />
            <div className="relative p-3 sm:p-3.5 rounded-full bg-rose-500/20 border border-rose-400/30 shadow-xl shadow-rose-950/60">
              <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-rose-400 fill-rose-500" />
            </div>
          </motion.div>

          {/* Heading: Thank you, Vichu ❤️ */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.9 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-glow text-white mb-2 sm:mb-3"
          >
            Thank you, Vichu <span className="inline-block text-rose-400">❤️</span>
          </motion.h1>

          {/* Message: Let's take it one day at a time. */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9 }}
            className="font-serif italic text-lg sm:text-xl md:text-2xl text-pink-100/90 font-light tracking-wide max-w-[280px] sm:max-w-xs mb-5"
          >
            "Let's take it one day at a time."
          </motion.p>

          {/* Sincere Promise Card */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.9 }}
            className="glass-panel px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border border-pink-400/25 shadow-xl max-w-xs sm:max-w-sm flex items-start gap-2.5 text-left"
          >
            <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-sans text-pink-100/85 leading-relaxed">
              I promise I will never break your trust. I will protect your heart, be patient with you, and prove to you every single day that you made the right choice. 🤞❤️
            </p>
          </motion.div>
        </motion.main>
      </div>
    );
  }

  // Outcome: declined
  return (
    <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 max-w-sm sm:max-w-md w-full mx-auto select-none">
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 flex flex-col items-center text-center w-full"
        role="region"
        aria-label="Respectful response"
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-4 sm:mb-6 p-2.5 sm:p-3 rounded-full bg-purple-900/20 border border-pink-400/20"
        >
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-pink-300/80" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-glow text-white mb-3"
        >
          I understand <span className="inline-block text-rose-400">❤️</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8 }}
          className="font-serif italic text-base sm:text-lg md:text-xl text-pink-100/90 font-light tracking-wide max-w-[280px] sm:max-w-xs"
        >
          "Your feelings and your choice matter."
        </motion.p>
      </motion.main>
    </div>
  );
};
