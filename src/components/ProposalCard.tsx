import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShieldCheck } from 'lucide-react';
import { notifyDodgeAttempt } from '../services/notificationService';

interface ProposalCardProps {
  onSelectYes: () => void;
  onSelectNo: () => void;
  onInteraction: () => void;
}

// Heartfelt, pleading labels that address trust issues and promise safety
const PLAYFUL_NO_LABELS = [
  'NO 😭',
  'Please? 🥺',
  'I promise! 🤞',
  'Won\'t break trust ❤️',
  'Trust me once? 🥺',
  'I\'ll protect you 🌸',
  'Give a chance 🙈',
  'I won\'t hurt you 🥺',
  'Never let down 🤞',
  'Just one chance? 💖',
  'Take your time 🥺',
  'I\'m here to stay ❤️',
  'Please Vichu? 🥺👉👈',
  'Your heart is safe 🌹',
  'Believe in me? 🥺',
  'Pleeease? 🥺❤️',
];

// Deeply reassuring, comforting messages addressing her trust issues as she chases NO
const PLAYFUL_HINTS = [
  'I know you have trust issues... and that\'s okay. I\'ll earn your trust every day 🥺',
  'I swear with all my heart, I will never break your trust 🤞❤️',
  'You don\'t have to rush into anything... we can take it one tiny step at a time 🌸',
  'I\'ll be the one person who proves you right for believing again 💕',
  'I promise I will never walk away or take you for granted, Vichu 🥺',
  'Please give me just one chance to show you that you are safe with me 🥺👉👈',
  'Your heart, your feelings, and your trust mean the world to me 🌹',
];

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

const triggerHaptic = (pattern: number | number[] = 20) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore if unsupported
    }
  }
};

export const ProposalCard: React.FC<ProposalCardProps> = ({
  onSelectYes,
  onInteraction,
}) => {
  const [dodgeCount, setDodgeCount] = useState<number>(0);
  const [noFixedPos, setNoFixedPos] = useState<{ x: number; y: number } | null>(null);
  const [initialRect, setInitialRect] = useState<{ left: number; top: number } | null>(null);

  const noButtonRef = useRef<HTMLButtonElement | null>(null);
  const yesButtonRef = useRef<HTMLButtonElement | null>(null);

  const getNoButtonLabel = () => {
    return PLAYFUL_NO_LABELS[dodgeCount % PLAYFUL_NO_LABELS.length];
  };

  const getHint = () => {
    if (dodgeCount === 0) return '';
    const index = (dodgeCount - 1) % PLAYFUL_HINTS.length;
    return PLAYFUL_HINTS[index];
  };

  useEffect(() => {
    const handleResize = () => {
      setNoFixedPos((current) => {
        if (!current) return null;
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const btnW = winW < 640 ? 140 : 160;
        const btnH = 48;

        const padLeft = 16;
        const padRight = 16;
        const padTop = Math.max(70, winH * 0.1);
        const padBottom = Math.max(75, winH * 0.12);

        const screenMinX = padLeft;
        const screenMaxX = Math.max(padLeft, winW - btnW - padRight);
        const screenMinY = padTop;
        const screenMaxY = Math.max(padTop, winH - btnH - padBottom);

        return {
          x: clamp(current.x, screenMinX, screenMaxX),
          y: clamp(current.y, screenMinY, screenMaxY),
        };
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const dodgeButton = useCallback(() => {
    onInteraction();
    triggerHaptic(18);

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const btnW = winW < 640 ? 140 : 160;
    const btnH = 48;

    const padLeft = 16;
    const padRight = 16;
    const padTop = Math.max(70, Math.round(winH * 0.1));
    const padBottom = Math.max(75, Math.round(winH * 0.12));

    const screenMinX = padLeft;
    const screenMaxX = Math.max(padLeft, winW - btnW - padRight);
    const screenMinY = padTop;
    const screenMaxY = Math.max(padTop, winH - btnH - padBottom);

    const yesRect = yesButtonRef.current?.getBoundingClientRect();

    if (noFixedPos === null && noButtonRef.current) {
      const startRect = noButtonRef.current.getBoundingClientRect();
      setInitialRect({ left: startRect.left, top: startRect.top });
    }

    let searchMinX = screenMinX;
    let searchMaxX = screenMaxX;
    let searchMinY = screenMinY;
    let searchMaxY = screenMaxY;

    if (winW > 768) {
      const centerX = winW / 2;
      const centerY = winH / 2;
      searchMinX = clamp(centerX - 240, screenMinX, screenMaxX);
      searchMaxX = clamp(centerX + 240 - btnW, screenMinX, screenMaxX);
      searchMinY = clamp(centerY - 160, screenMinY, screenMaxY);
      searchMaxY = clamp(centerY + 160 - btnH, screenMinY, screenMaxY);
    }

    let targetX = searchMinX;
    let targetY = searchMinY;
    let attempts = 0;
    const currentX = noFixedPos?.x ?? (initialRect?.left ?? winW / 2);
    const currentY = noFixedPos?.y ?? (initialRect?.top ?? winH / 2);

    while (attempts < 25) {
      const candX = searchMinX + Math.random() * Math.max(10, searchMaxX - searchMinX);
      const candY = searchMinY + Math.random() * Math.max(10, searchMaxY - searchMinY);

      const dist = Math.hypot(candX - currentX, candY - currentY);

      const overlapsYes =
        yesRect &&
        candX < yesRect.right + 12 &&
        candX + btnW > yesRect.left - 12 &&
        candY < yesRect.bottom + 12 &&
        candY + btnH > yesRect.top - 12;

      if ((dist > 75 && !overlapsYes) || attempts > 18) {
        targetX = candX;
        targetY = candY;
        break;
      }
      attempts++;
    }

    const finalX = clamp(Math.round(targetX), screenMinX, screenMaxX);
    const finalY = clamp(Math.round(targetY), screenMinY, screenMaxY);

    setNoFixedPos({ x: finalX, y: finalY });
    const nextCount = dodgeCount + 1;
    setDodgeCount(nextCount);
    notifyDodgeAttempt(nextCount, getNoButtonLabel());
  }, [dodgeCount, initialRect?.left, initialRect?.top, noFixedPos, onInteraction]);

  const handlePointerEnterNo = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') {
      dodgeButton();
    }
  };

  const handlePointerDownNo = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') {
      e.preventDefault();
      dodgeButton();
    }
  };

  const handleTouchStartNo = (e: React.TouchEvent) => {
    e.preventDefault();
    dodgeButton();
  };

  const handleClickNo = (e: React.MouseEvent) => {
    e.preventDefault();
    dodgeButton();
  };

  const handleYes = () => {
    onInteraction();
    triggerHaptic([35, 60, 45, 60, 70]);
    onSelectYes();
  };

  const yesScaleMultiplier = Math.min(1 + dodgeCount * 0.02, 1.18);

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-20 flex flex-col items-center justify-center text-center px-4 max-w-sm sm:max-w-md w-full mx-auto select-none"
      role="region"
      aria-label="Proposal"
    >
      {/* Decorative delicate heart accent with trust shield */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="mb-3 sm:mb-4 inline-flex items-center justify-center gap-2"
      >
        <span className="p-2 sm:p-2.5 rounded-full bg-rose-500/10 border border-rose-400/20 shadow-lg shadow-rose-950/50 flex items-center gap-1.5">
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 fill-rose-400/30 animate-pulse-subtle" />
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-300" />
        </span>
      </motion.div>

      {/* Main Title: Vichu ❤️ */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.8 }}
        className="font-serif text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-glow text-white mb-2 sm:mb-3"
      >
        Vichu <span className="inline-block text-rose-400 animate-pulse-subtle">❤️</span>
      </motion.h1>

      {/* Question: "Will you give me a chance?" */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="font-serif italic text-lg sm:text-xl md:text-2xl text-pink-100/90 font-light tracking-wide mb-2 max-w-[280px] sm:max-w-xs"
      >
        "Will you give me a chance?"
      </motion.p>

      {/* Tender Trust Reassurance Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ delay: 0.65, duration: 0.9 }}
        className="text-xs sm:text-sm font-sans text-pink-200/75 max-w-[290px] sm:max-w-xs mb-8 leading-relaxed font-light"
      >
        I know trust takes time, and I promise I won't ever break yours. Please? 🥺
      </motion.p>

      {/* Buttons Container */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.7 }}
        className="relative flex items-center justify-center gap-3 sm:gap-5 w-full pt-1"
      >
        {/* YES BUTTON */}
        <motion.button
          ref={yesButtonRef}
          onClick={handleYes}
          animate={{ scale: yesScaleMultiplier }}
          whileHover={{ scale: yesScaleMultiplier * 1.05 }}
          whileTap={{ scale: yesScaleMultiplier * 0.94 }}
          type="button"
          aria-label="Yes, give a chance"
          className="relative group w-[130px] sm:w-[150px] min-h-[48px] py-3 rounded-full bg-gradient-to-r from-rose-500 via-rose-500 to-pink-500 text-white font-medium text-sm sm:text-base tracking-wide button-glow-pink transition-all duration-300 active:shadow-inner cursor-pointer"
        >
          <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <span className="relative flex items-center justify-center gap-1.5 drop-shadow-sm font-sans">
            YES <span className="text-lg">🙈</span>
          </span>
        </motion.button>

        {/* Resting Placeholder when NO is dodging */}
        {noFixedPos !== null && (
          <div
            className="w-[140px] sm:w-[160px] min-h-[48px] opacity-0 pointer-events-none"
            aria-hidden="true"
          />
        )}

        {/* NO BUTTON (Initial resting state) */}
        {noFixedPos === null && (
          <motion.button
            ref={noButtonRef}
            onClick={handleClickNo}
            onPointerDown={handlePointerDownNo}
            onPointerEnter={handlePointerEnterNo}
            onTouchStart={handleTouchStartNo}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            type="button"
            aria-label="No"
            className="w-[140px] sm:w-[160px] min-h-[48px] max-w-[140px] sm:max-w-[160px] py-3 rounded-full glass-panel border border-pink-300/25 text-pink-200/90 hover:text-white font-medium text-xs sm:text-sm tracking-wide transition-colors duration-200 cursor-pointer shadow-lg shadow-black/40 touch-none select-none overflow-hidden"
          >
            <span className="relative flex items-center justify-center gap-1 font-sans select-none whitespace-nowrap overflow-hidden text-ellipsis px-2">
              {getNoButtonLabel()}
            </span>
          </motion.button>
        )}
      </motion.div>

      {/* Fixed NO BUTTON once dodging is triggered */}
      {noFixedPos !== null && (
        <motion.button
          ref={noButtonRef}
          onClick={handleClickNo}
          onPointerDown={handlePointerDownNo}
          onPointerEnter={handlePointerEnterNo}
          onTouchStart={handleTouchStartNo}
          initial={initialRect ? { x: initialRect.left, y: initialRect.top } : { x: noFixedPos.x, y: noFixedPos.y }}
          animate={{
            x: noFixedPos.x,
            y: noFixedPos.y,
          }}
          transition={{
            type: 'spring',
            stiffness: 450,
            damping: 24,
            mass: 0.45,
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            margin: 0,
            zIndex: 40,
          }}
          type="button"
          aria-label="No"
          className="w-[140px] sm:w-[160px] min-h-[48px] max-w-[140px] sm:max-w-[160px] py-3 rounded-full glass-panel border border-pink-300/25 text-pink-200/90 hover:text-white font-medium text-xs sm:text-sm tracking-wide transition-colors duration-200 cursor-pointer shadow-xl shadow-black/50 touch-none select-none overflow-hidden"
        >
          <span className="relative flex items-center justify-center gap-1 font-sans select-none whitespace-nowrap overflow-hidden text-ellipsis px-2">
            {getNoButtonLabel()}
          </span>
        </motion.button>
      )}

      {/* Deeply comforting, begging & reassuring message below buttons */}
      <AnimatePresence mode="wait">
        {dodgeCount > 0 && (
          <motion.div
            key={dodgeCount}
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 0.95, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="mt-6 sm:mt-8 text-xs sm:text-sm font-sans text-pink-200/90 tracking-wide px-4 py-2 rounded-2xl glass-panel border border-pink-400/20 shadow-md max-w-[320px] sm:max-w-sm leading-relaxed"
          >
            {getHint()}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
};
