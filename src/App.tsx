import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { PetalCanvas } from './components/PetalCanvas';
import { AmbientStarfield } from './components/AmbientStarfield';
import { ProposalCard } from './components/ProposalCard';
import { ResultScreen } from './components/ResultScreen';
import { AudioController } from './components/AudioController';
import { notifySiteVisit, notifyYesCelebration } from './services/notificationService';

export const App: React.FC = () => {
  const [outcome, setOutcome] = useState<'idle' | 'accepted' | 'declined'>('idle');
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);

  // Send real-time notification to Discord & ntfy when the site is opened
  useEffect(() => {
    notifySiteVisit();
  }, []);

  const handleInteraction = useCallback(() => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
  }, [hasUserInteracted]);

  const handleSelectYes = useCallback(() => {
    setOutcome('accepted');

    // Send real-time victory notification to Discord & ntfy
    notifyYesCelebration();

    // Trigger celebratory cherry blossom & heart confetti burst
    try {
      const count = 120;
      const defaults = {
        origin: { y: 0.65 },
        zIndex: 30,
        disableForReducedMotion: true,
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      // Multi-stage romantic firework burst in rose and pastel tones
      fire(0.25, {
        spread: 40,
        startVelocity: 45,
        colors: ['#ff7597', '#f43f5e', '#ffd1dc', '#fda4af'],
        shapes: ['circle'],
      });

      fire(0.2, {
        spread: 60,
        colors: ['#ffe4e6', '#f472b6', '#fb7185'],
      });

      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.9,
        colors: ['#fda4af', '#f43f5e', '#ffffff'],
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
        colors: ['#fb7185', '#ffe4e6'],
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 45,
        colors: ['#ffb6c1', '#f43f5e'],
      });
    } catch {
      // Confetti fallback if disabled
    }
  }, []);

  const handleSelectNo = useCallback(() => {
    setOutcome('declined');
  }, []);

  return (
    <div
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      className="relative w-full h-[100dvh] overflow-hidden flex flex-col justify-between items-center pt-safe pb-safe pl-safe pr-safe bg-[#080312]"
    >
      {/* Background Starfield and Ambient Glowing Orbs */}
      <AmbientStarfield />

      {/* Floating Cherry Blossom Petals */}
      <PetalCanvas
        intensity={outcome === 'accepted' ? 'celebration' : 'normal'}
      />

      {/* Music Audio Controller */}
      <AudioController hasUserInteracted={hasUserInteracted} />

      {/* Main Content Area */}
      <div className="flex-1 w-full flex items-center justify-center relative z-20">
        <AnimatePresence mode="wait">
          {outcome === 'idle' && (
            <ProposalCard
              key="proposal-card"
              onSelectYes={handleSelectYes}
              onSelectNo={handleSelectNo}
              onInteraction={handleInteraction}
            />
          )}

          {outcome === 'accepted' && (
            <ResultScreen key="result-accepted" outcome="accepted" />
          )}

          {outcome === 'declined' && (
            <ResultScreen key="result-declined" outcome="declined" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
