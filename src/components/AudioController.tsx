import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioControllerProps {
  hasUserInteracted: boolean;
}

export const AudioController: React.FC<AudioControllerProps> = ({ hasUserInteracted }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  // Initialize romantic ambient music generator using Web Audio API
  const initAudio = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      isInitializedRef.current = true;
    } catch {
      // AudioContext not supported or disabled - gracefully ignore
    }
  };

  // Play a gentle, dreamy piano-like note
  const playTone = (freq: number, startTime: number, duration: number, volume: number = 0.08) => {
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;

    const osc = ctx.createOscillator();
    const oscHarmonic = ctx.createOscillator();
    const noteGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Warm lowpass filter for romantic softness
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, startTime);
    filter.frequency.exponentialRampToValueAtTime(450, startTime + duration);

    // Fundamental note (sine wave)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Subtle gentle harmonic (warm triangle wave)
    oscHarmonic.type = 'triangle';
    oscHarmonic.frequency.setValueAtTime(freq * 2, startTime);

    // Piano-style envelope: instantaneous soft attack, natural exponential decay
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.linearRampToValueAtTime(volume, startTime + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(volume * 0.4, startTime + 0.5);
    noteGain.gain.exponentialRampToValueAtTime(0.00001, startTime + duration);

    osc.connect(filter);
    oscHarmonic.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(master);

    osc.start(startTime);
    oscHarmonic.start(startTime);
    osc.stop(startTime + duration + 0.1);
    oscHarmonic.stop(startTime + duration + 0.1);
  };

  // Chords progression for romantic, dreamy melody (Db Major, Bbm9, GbM7, Ab)
  const CHORD_PROGRESSION = [
    // Db Major 7: Db4, F4, Ab4, C5, F5
    [277.18, 349.23, 415.3, 523.25, 698.46],
    // Bb minor 9: Bb3, F4, Ab4, C5, Db5
    [233.08, 349.23, 415.3, 523.25, 554.37],
    // Gb Major 7: Gb3, Db4, F4, Bb4, Db5
    [185.0, 277.18, 349.23, 466.16, 554.37],
    // Ab suspended 4 to Ab: Ab3, Eb4, Ab4, C5, Eb5
    [207.65, 311.13, 415.3, 523.25, 622.25],
  ];

  const startMusicLoop = () => {
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Fade in master volume
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.8);

    let chordIndex = 0;
    const chordDuration = 4.2; // seconds per chord

    const scheduleNextChord = () => {
      const now = ctx.currentTime;
      const notes = CHORD_PROGRESSION[chordIndex % CHORD_PROGRESSION.length];

      // Bass note
      playTone(notes[0], now, 3.8, 0.12);

      // Delicate arpeggiated romantic chimes
      for (let i = 1; i < notes.length; i++) {
        const delay = 0.35 * i + Math.random() * 0.08;
        playTone(notes[i], now + delay, 3.2, 0.08);
      }

      // Occasional sweet high bell chime
      if (Math.random() > 0.4) {
        const topNote = notes[notes.length - 1] * (Math.random() > 0.5 ? 1.5 : 1.25);
        playTone(topNote, now + 2.0, 2.6, 0.04);
      }

      chordIndex++;
    };

    // Schedule immediately then loop
    scheduleNextChord();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(scheduleNextChord, chordDuration * 1000);

    setIsPlaying(true);
  };

  const stopMusic = () => {
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (master && ctx) {
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  };

  // Toggle button handler
  const handleToggle = () => {
    if (!audioCtxRef.current) {
      initAudio();
    }
    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    if (isPlaying && !isMuted) {
      setIsMuted(true);
      stopMusic();
    } else {
      setIsMuted(false);
      startMusicLoop();
    }
  };

  // Autoplay on first user interaction if not explicitly muted
  useEffect(() => {
    if (hasUserInteracted && !isPlaying && !isMuted) {
      initAudio();
      startMusicLoop();
    }
  }, [hasUserInteracted, isMuted, isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 pt-safe pr-safe pointer-events-auto">
      <button
        onClick={handleToggle}
        type="button"
        className="group relative flex items-center gap-2 px-3.5 py-2 rounded-full glass-panel border border-pink-400/20 text-pink-200/90 hover:text-pink-100 hover:border-pink-300/40 hover:bg-rose-950/40 active:scale-95 transition-all duration-300 shadow-lg shadow-black/40"
        aria-label={isPlaying ? 'Mute romantic music' : 'Play romantic music'}
        title={isPlaying ? 'Music: Playing' : 'Music: Paused'}
      >
        <span className="relative flex h-2 w-2">
          {isPlaying && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isPlaying ? 'bg-pink-400' : 'bg-gray-500'
            }`}
          />
        </span>

        {isPlaying ? (
          <Volume2 className="w-4 h-4 text-pink-300 animate-pulse" />
        ) : (
          <VolumeX className="w-4 h-4 text-pink-300/60" />
        )}

        <span className="text-xs font-serif italic tracking-wide text-pink-200/80 group-hover:text-pink-100">
          {isPlaying ? 'Melody' : 'Music Off'}
        </span>
      </button>
    </div>
  );
};
