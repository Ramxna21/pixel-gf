'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import AppLogo from '@/components/ui/AppLogo';
import Image from 'next/image';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { BACKGROUND_AUDIO_PATH, BACKGROUND_STORY_AUDIO_PATH } from '@/lib/audioService';
import Link from 'next/link';
import { useAssets } from '@/hooks/useAssets';

const STARS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.floor((i * 137.508) % 100),
  y: Math.floor((i * 97.3) % 80),
  size: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1,
  delay: (i * 0.3) % 4,
}));

// ── VN Dialogue Script ──────────────────────────────────────────────────────
// Each step: who speaks, what they say, which sprite state (boy/girl)
type Speaker = 'boy' | 'girl';
type BoySprite = 'idle' | 'happy' | 'shy' | 'wave';
type GirlSprite = 'idle' | 'happy' | 'shy' | 'blush';

interface DialogueStep {
  speaker: Speaker;
  text: string;
  boySprite: BoySprite;
  girlSprite: GirlSprite;
}

const DIALOGUE_SCRIPT: DialogueStep[] = [
  {
    speaker: 'boy',
    text: 'Hey… I made something special for you. 💫',
    boySprite: 'shy',
    girlSprite: 'idle',
  },
  {
    speaker: 'girl',
    text: 'For me? What is it? 🌸',
    boySprite: 'happy',
    girlSprite: 'happy',
  },
  {
    speaker: 'boy',
    text: 'A little world — just for us. Every memory, every moment.',
    boySprite: 'happy',
    girlSprite: 'shy',
  },
  {
    speaker: 'girl',
    text: 'Oh my… this is so beautiful! 💕',
    boySprite: 'shy',
    girlSprite: 'blush',
  },
  {
    speaker: 'boy',
    text: 'Scroll down and explore our story, scene by scene. ✨',
    boySprite: 'wave',
    girlSprite: 'happy',
  },
];

// ── Sprite color palettes per state ─────────────────────────────────────────
const BOY_SPRITES: Record<BoySprite, { jacket: string; face: string; eyeExpr: string }> = {
  idle:  { jacket: '#2D1B4E', face: '#F5C9A0', eyeExpr: 'open' },
  happy: { jacket: '#3D2B6E', face: '#F5C9A0', eyeExpr: 'happy' },
  shy:   { jacket: '#2D1B4E', face: '#F5B0A0', eyeExpr: 'shy' },
  wave:  { jacket: '#4A2D7A', face: '#F5C9A0', eyeExpr: 'open' },
};

const GIRL_SPRITES: Record<GirlSprite, { dress: string; face: string; eyeExpr: string }> = {
  idle:  { dress: '#1A1A2E', face: '#FDDCB5', eyeExpr: 'closed' },
  happy: { dress: '#2A1A4E', face: '#FDDCB5', eyeExpr: 'open' },
  shy:   { dress: '#1A1A2E', face: '#FDDCB5', eyeExpr: 'closed' },
  blush: { dress: '#2A1040', face: '#FDDCC5', eyeExpr: 'blush' },
};

export default function HeroScene() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [dialogueIndex, setDialogueIndex] = useState(-1); // start at initial hero view
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [clickHint, setClickHint] = useState(false);
  const [storyStarted, setStoryStarted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // ── Lock scroll until all dialogues are done ──
  useEffect(() => {
    if (!allDone) {
      // Lock scroll
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Unlock scroll
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      // Auto-scroll to memories section
      const memoriesSection = document.getElementById('memories');
      if (memoriesSection) {
        setTimeout(() => {
          memoriesSection.scrollIntoView({ behavior: 'smooth' });
        }, 400);
      }
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [allDone]);

  // ── Background audio — pre-click (before story starts) ──
  const {
    isPlaying: musicPlaying,
    isLoading: musicLoading,
    isReady: musicReady,
    hasError: musicError,
    toggle: toggleMusic,
    volume: musicVolume,
    setVolume: setMusicVolume,
    fadeOut: musicFadeOut,
    fadeIn: musicFadeIn,
    play: playMusic,
    pause: pauseMusic,
  } = useAudioPlayer({
    storagePath: BACKGROUND_AUDIO_PATH,
    loop: true,
    volume: 0.4,
    autoPlay: true,
  });

  // ── Background audio — post-click (during story/dialogue) ──
  const {
    isPlaying: storyMusicPlaying,
    isReady: storyMusicReady,
    hasError: storyMusicError,
    fadeOut: storyMusicFadeOut,
    fadeIn: storyMusicFadeIn,
    play: playStoryMusic,
    pause: pauseStoryMusic,
    toggle: toggleStoryMusic,
  } = useAudioPlayer({
    storagePath: BACKGROUND_STORY_AUDIO_PATH,
    loop: true,
    volume: 0,
    autoPlay: false,
  });

  // Track whether we've already crossfaded to story music
  const hasCrossfadedRef = useRef(false);

  // Auto-play pre-click music on first user interaction (browser autoplay policy workaround)
  const hasTriedAutoPlay = useRef(false);
  useEffect(() => {
    if (musicReady && !musicPlaying && !hasTriedAutoPlay.current) {
      hasTriedAutoPlay.current = true;
      playMusic();
    }
  }, [musicReady, musicPlaying, playMusic]);

  const handleFirstInteractionPlay = useCallback(() => {
    if (musicReady && !musicPlaying && !musicError) {
      playMusic();
    }
  }, [musicReady, musicPlaying, musicError, playMusic]);

  // Crossfade from pre-click music to story music when story starts
  const crossfadeToStoryMusic = useCallback(async () => {
    if (hasCrossfadedRef.current) return;
    hasCrossfadedRef.current = true;
    // Fade out pre-click music and fade in story music simultaneously
    await Promise.all([
      musicFadeOut(800),
      storyMusicReady && !storyMusicError ? storyMusicFadeIn(0.4, 800) : Promise.resolve(),
    ]);
  }, [musicFadeOut, storyMusicFadeIn, storyMusicReady, storyMusicError]);

  // Listen for cross-component fade events from memory song players
  const isShowcaseVisibleRef = useRef(false);
  const isMemoryPlayingRef = useRef(false);

  useEffect(() => {
    const handleFadeOut = (e: Event) => {
      const detail = (e as CustomEvent).detail as { delay?: number; fade?: boolean; source?: string } | undefined;
      const delay = detail?.delay ?? 0;
      const fade = detail?.fade ?? true;

      if (detail?.source === 'showcase') {
        isShowcaseVisibleRef.current = true;
      }
      if (detail?.source === 'memory') {
        isMemoryPlayingRef.current = true;
      }

      const stopMusic = () => {
        if (fade) {
          storyMusicFadeOut(500);
          musicFadeOut(500);
        } else {
          pauseStoryMusic();
          pauseMusic();
        }
      };

      if (delay > 0) {
        setTimeout(stopMusic, delay);
      } else {
        stopMusic();
      }
    };
    const handleFadeIn = (e: Event) => {
      const detail = (e as CustomEvent).detail as { volume?: number; source?: string } | undefined;
      if (detail?.source === 'showcase') {
        isShowcaseVisibleRef.current = false;
      }
      if (detail?.source === 'memory') {
        isMemoryPlayingRef.current = false;
      }
      
      // Do not resume hero scene music if we are in the showcase section or a memory is playing
      if (isShowcaseVisibleRef.current || isMemoryPlayingRef.current) return;

      const targetVol = detail?.volume ?? 0.4;
      if (storyStarted) {
        storyMusicFadeIn(targetVol, 500);
      } else {
        musicFadeIn(targetVol, 500);
      }
    };
    window.addEventListener('bgmusic:fadeout', handleFadeOut);
    window.addEventListener('bgmusic:fadein', handleFadeIn);
    return () => {
      window.removeEventListener('bgmusic:fadeout', handleFadeOut);
      window.removeEventListener('bgmusic:fadein', handleFadeIn);
    };
  }, [musicFadeOut, musicFadeIn, storyMusicFadeOut, storyMusicFadeIn, storyStarted, pauseMusic, pauseStoryMusic]);

  useEffect(() => {
    const t = setTimeout(() => {
      setHeroVisible(true);
      setClickHint(true);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const handleSceneClick = useCallback(() => {
    // Try to start music on first user interaction (browser autoplay policy)
    handleFirstInteractionPlay();

    if (allDone) return;

    if (dialogueIndex === -1) {
      // Start the dialogue from the first step
      setClickHint(false);
      setDialogueIndex(0);
      setBubbleVisible(true);
      // Crossfade to story music
      if (!storyStarted) {
        setStoryStarted(true);
        crossfadeToStoryMusic();
      }
      return;
    }

    const next = dialogueIndex + 1;
    if (next < DIALOGUE_SCRIPT.length) {
      setBubbleVisible(false);
      setClickHint(false);
      setTimeout(() => {
        setDialogueIndex(next);
        setBubbleVisible(true);
      }, 150);
    } else {
      // All dialogues done → stay on hero, no auto-scroll
      setAllDone(true);
      setBubbleVisible(false);
    }
  }, [dialogueIndex, allDone, handleFirstInteractionPlay, storyStarted, crossfadeToStoryMusic]);

  const currentStep = dialogueIndex >= 0 ? DIALOGUE_SCRIPT[dialogueIndex] : null;
  const boySprite = currentStep ? currentStep.boySprite : 'idle';
  const girlSprite = currentStep ? currentStep.girlSprite : 'idle';

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col overflow-hidden cursor-pointer select-none"
      onClick={handleSceneClick}
      style={{ userSelect: 'none' }}
    >
      {/* ── Sky gradient background ── */}
      <div
        className="fixed inset-0 scroll-blur-bg"
        style={{
          background:
            'linear-gradient(180deg, #0D0618 0%, #1A0A2E 18%, #2D1B4E 32%, #5C2D5E 48%, #8B3A5A 58%, #C45C3A 72%, #E8713A 82%, #F4A261 92%, #FFD4A3 100%)',
          zIndex: 0,
        }}
      />

      {/* ── Atmospheric glow layers ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div
          className="absolute bottom-0 left-0 right-0 h-64"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(244,162,97,0.35) 0%, rgba(232,113,58,0.2) 40%, transparent 70%)',
          }}
        />
        <div
          className="absolute"
          style={{
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(231,111,138,0.12) 0%, transparent 70%)',
            top: '10%', left: '-10%', filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute"
          style={{
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,113,58,0.15) 0%, transparent 70%)',
            top: '30%', right: '-8%', filter: 'blur(50px)',
          }}
        />
      </div>

      {/* ── Stars ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        {STARS.map(star => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`, top: `${star.y}%`,
              width: star.size, height: star.size,
              opacity: 0.6,
              animation: `twinkle ${2 + star.delay * 0.5}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
        <div className="absolute" style={{ top: '8%', right: '12%', width: 40, height: 40 }}>
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M28 8C22 8 16 13 16 20C16 27 22 32 28 32C24 32 12 28 12 20C12 12 24 8 28 8Z"
              fill="rgba(255,240,200,0.85)"
            />
          </svg>
        </div>
      </div>

      {/* ── Pixel art ground / beach ── */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none" style={{ zIndex: 3, height: 100 }}>
        {/* ── Ground base ── */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 10, background: 'linear-gradient(180deg, rgba(92,45,94,0.6) 0%, rgba(26,10,46,0.9) 100%)' }}
        />
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          className="absolute bottom-[8px] left-0 w-full"
          style={{ height: 80 }}
        >
          <path
            d="M0,80 L0,60 Q80,40 160,55 Q240,70 320,50 Q400,30 480,45 Q560,60 640,40 Q720,20 800,35 Q880,50 960,30 Q1040,10 1120,25 Q1200,40 1280,30 L1440,20 L1440,100 L0,100 Z"
            fill="#1A0A2E"
          />
          <path
            d="M0,90 Q120,75 240,85 Q360,95 480,80 Q600,65 720,75 Q840,85 960,70 Q1080,55 1200,65 L1440,55 L1440,100 L0,100 Z"
            fill="#0D0618"
          />
        </svg>
      </div>

      {/* ── Navigation ── */}
      <header
        className="relative flex items-center justify-between px-6 pt-6 pb-4"
        style={{ zIndex: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <AppLogo size={32} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          <span className="font-display font-bold text-lg tracking-tight" style={{ color: '#FFF1E6' }}>
Memogift
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {['Memories', 'Characters'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="font-display text-sm font-medium transition-colors duration-200"
              style={{ color: 'rgba(255,241,230,0.7)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#F4A261')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,241,230,0.7)')}
            >
              {item}
            </a>
          ))}
        </nav>
      </header>

      {/* ── Hero content ── */}
      <div
        className="relative flex flex-col items-center justify-center flex-1 px-4 sm:px-6 pt-4 pb-16 sm:pb-24"
        style={{ zIndex: 10, minHeight: '70vh' }}
      >
        {/* Music toggle button */}
        <div
          className="absolute top-0 right-6 flex items-center gap-2"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => {
              if (storyStarted) {
                // Toggle story music
                if (!storyMusicError) {
                  if (!storyMusicPlaying && storyMusicReady) {
                    playStoryMusic();
                  } else {
                    toggleStoryMusic();
                  }
                }
              } else {
                // Toggle pre-click music
                if (!musicError) {
                  if (!musicPlaying && musicReady) {
                    playMusic();
                  } else {
                    toggleMusic();
                  }
                }
              }
            }}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono font-medium transition-all duration-300"
            style={{
              background: 'rgba(26,10,46,0.7)',
              border: `1px solid ${(storyStarted ? storyMusicPlaying : (musicPlaying || musicLoading)) ? 'rgba(244,162,97,0.7)' : 'rgba(244,162,97,0.4)'}`,
              color: (storyStarted ? storyMusicPlaying : (musicPlaying || musicLoading)) ? '#F4A261' : 'rgba(255,241,230,0.6)',
              backdropFilter: 'blur(12px)',
              animation: (storyStarted ? storyMusicPlaying : musicPlaying) ? 'musicPulse 2s ease-in-out infinite' : 'none',
              cursor: musicLoading && !musicReady ? 'wait' : 'pointer',
            }}
          >
            <span style={{ fontSize: 16 }}>🎵</span>
            {musicLoading && !musicReady ? 'Loading…' : (storyStarted ? storyMusicPlaying : musicPlaying) ? 'Music On' : 'Music On'}
          </button>
        </div>

        {/* Title — hidden once VN starts */}
        {dialogueIndex === -1 && (
          <>
            <div
              className="text-center mb-4"
              style={{
                opacity: heroVisible ? 1 : 0,
                animation: heroVisible ? 'fadeInDown 1s ease-out 0.2s both' : 'none',
              }}
            >
              <span className="font-pixel text-xs uppercase tracking-widest mb-3 block" style={{ color: '#F4A261' }}>
                ✨ A love story in 2D anime
              </span>
            </div>

            <h1
              className="font-display font-black text-center leading-none mb-4 sm:mb-6"
              style={{
                fontSize: 'clamp(2rem, 10vw, 7rem)',
                letterSpacing: '-0.03em',
                color: '#FFF1E6',
                textShadow: '0 0 60px rgba(232,113,58,0.4), 0 4px 20px rgba(0,0,0,0.5)',
                opacity: heroVisible ? 1 : 0,
                animation: heroVisible ? 'fadeInUp 1s ease-out 0.4s both' : 'none',
              }}
            >
              Our Story,
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #E8713A 0%, #F4A261 40%, #E76F8A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Scene by Scene.
              </span>
            </h1>

            <p
              className="font-display text-center max-w-xs sm:max-w-md mb-6 sm:mb-8 px-2"
              style={{
                fontSize: 'clamp(0.85rem, 2.5vw, 1.15rem)',
                color: 'rgba(255,241,230,0.75)',
                lineHeight: 1.7,
                opacity: heroVisible ? 1 : 0,
                animation: heroVisible ? 'fadeInUp 1s ease-out 0.6s both' : 'none',
              }}
            >
              A little world just for us. Every memory, every laugh, and every moment we've shared, captured in our own 2D anime story. To the day we first met! 💕
            </p>
          </>
        )}

        {/* VN Dialogue Bubble */}
        {currentStep && (
          <div
            className="relative w-full mx-auto mb-4 px-2 sm:px-0"
            style={{
              maxWidth: 'min(92vw, 380px)',
              zIndex: 25,
              opacity: bubbleVisible ? 1 : 0,
              transform: bubbleVisible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.96)',
              transition: 'opacity 0.25s ease, transform 0.25s ease',
            }}
          >
            {/* Speaker label */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-2 font-pixel text-xs"
              style={{
                background: currentStep.speaker === 'boy' ?'linear-gradient(135deg, #2D1B4E, #4A2D7A)' :'linear-gradient(135deg, #3D1A3A, #7A2D5A)',
                color: '#FFF1E6',
                border: '1px solid rgba(244,162,97,0.4)',
              }}
            >
              <span>{currentStep.speaker === 'boy' ? '👦' : '👧'}</span>
              <span>{currentStep.speaker === 'boy' ? 'nanu nanu' : 'ara ara'}</span>
            </div>

            {/* Bubble */}
            <div
              className="relative rounded-2xl px-4 py-3 sm:px-5 sm:py-4 font-display text-sm leading-relaxed"
              style={{
                background: 'rgba(13,6,24,0.85)',
                border: '1.5px solid rgba(244,162,97,0.5)',
                color: '#FFF1E6',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(244,162,97,0.1)',
              }}
            >
              {currentStep.text}
              {/* Tail */}
              <div
                className="absolute"
                style={{
                  bottom: -10,
                  left: currentStep.speaker === 'boy' ? 24 : 'auto',
                  right: currentStep.speaker === 'girl' ? 24 : 'auto',
                  width: 0, height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: '10px solid rgba(244,162,97,0.5)',
                }}
              />
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3 sm:mt-4">
              {DIALOGUE_SCRIPT.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === dialogueIndex ? 16 : 6,
                    height: 6,
                    background: i <= dialogueIndex ? '#F4A261' : 'rgba(244,162,97,0.25)',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Click hint */}
        {clickHint && dialogueIndex === -1 && heroVisible && (
          <div
            className="flex flex-col items-center gap-2 mt-2"
            style={{
              opacity: heroVisible ? 1 : 0,
              animation: 'fadeInUp 1s ease-out 1s both',
            }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full font-pixel text-xs"
              style={{
                background: 'rgba(244,162,97,0.15)',
                border: '1px solid rgba(244,162,97,0.4)',
                color: '#F4A261',
                animation: 'musicPulse 2s ease-in-out infinite',
              }}
            >
              <span>👆</span>
              <span>Click anywhere to start the story</span>
            </div>
          </div>
        )}

        {/* Next click hint during dialogue */}
        {dialogueIndex >= 0 && !allDone && (
          <div
            className="absolute font-pixel text-xs"
            style={{
              bottom: 'clamp(60px, 15vw, 120px)',
              right: 16,
              color: 'rgba(244,162,97,0.6)',
              animation: 'musicPulse 1.5s ease-in-out infinite',
            }}
          >
            {dialogueIndex < DIALOGUE_SCRIPT.length - 1 ? 'click to continue ▶' : 'explore ✨'}
          </div>
        )}
      </div>

      {/* ── 2D anime characters with VN sprite swap ── */}
      <VNCharacters boySprite={boySprite} girlSprite={girlSprite} dialogueIndex={dialogueIndex} />
    </section>
  );
}

// ── VN Characters Component ──────────────────────────────────────────────────
interface VNCharactersProps {
  boySprite: BoySprite;
  girlSprite: GirlSprite;
  dialogueIndex: number;
}

function VNCharacters({ boySprite, girlSprite, dialogueIndex }: VNCharactersProps) {
  const [prevBoy, setPrevBoy] = useState<BoySprite>('idle');
  const [prevGirl, setPrevGirl] = useState<GirlSprite>('idle');
  const [boyFlash, setBoyFlash] = useState(false);
  const [girlFlash, setGirlFlash] = useState(false);
  const { getAssetUrl } = useAssets();

  // Per-expression asset lookup with fallback chain: expression slug → character slug → null
  const boyCharFallback = getAssetUrl('boy_character', null);
  const boyExpressionSrc = getAssetUrl(`boy_${boySprite}`, boyCharFallback);

  const girlCharFallback = getAssetUrl('girl_character', null);
  const girlExpressionSrc = getAssetUrl(`girl_${girlSprite}`, girlCharFallback);

  useEffect(() => {
    if (boySprite !== prevBoy) {
      setBoyFlash(true);
      setTimeout(() => setBoyFlash(false), 200);
      setPrevBoy(boySprite);
    }
  }, [boySprite, prevBoy]);

  useEffect(() => {
    if (girlSprite !== prevGirl) {
      setGirlFlash(true);
      setTimeout(() => setGirlFlash(false), 200);
      setPrevGirl(girlSprite);
    }
  }, [girlSprite, prevGirl]);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 pointer-events-none"
      style={{ zIndex: 15, height: 'clamp(240px, 42vw, 440px)' }}
    >
      {/* Boy character (left) */}
      <div
        className="absolute"
        style={{
          bottom: -16,
          left: 'clamp(8px, 8%, 28%)',
          transform: 'translateX(0)',
          animation: 'idleBobSlow 4s ease-in-out infinite',
          animationDelay: '0.5s',
          filter: boyFlash ? 'brightness(2)' : 'brightness(1)',
          transition: 'filter 0.1s ease',
        }}
      >
        <PixelBoyCharacter sprite={boySprite} src={boyExpressionSrc} />
      </div>

      {/* Girl character (right) */}
      <div
        className="absolute"
        style={{
          bottom: -16,
          right: 'clamp(8px, 8%, 28%)',
          transform: 'translateX(0)',
          animation: dialogueIndex === -1 ? 'idleBob 3.5s ease-in-out infinite' : 'idleBob 3.5s ease-in-out infinite',
          filter: girlFlash ? 'brightness(2)' : 'brightness(1)',
          transition: 'filter 0.1s ease',
        }}
      >
        <PixelGirlCharacter sprite={girlSprite} src={girlExpressionSrc} />
      </div>
    </div>
  );
}

// ── Girl character using uploaded image ──────────────────────────────────────

function PixelGirlCharacter({ sprite, src }: { sprite: GirlSprite; src: string | null }) {
  if (!src) {
    return (
      <div className="relative w-32 sm:w-44 md:w-[200px] flex flex-col items-center justify-center" style={{ aspectRatio: '90/170' }}>
        <div className="w-16 h-16 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
        <p className="mt-4 text-white/50 font-pixel text-xs text-center leading-relaxed">loading<br/>memories...</p>
      </div>
    );
  }

  return (
    <div className="relative w-32 sm:w-44 md:w-[200px]" style={{ aspectRatio: '90/170' }}>
      <Image
        src={src}
        alt="2D anime girl character"
        fill
        style={{
          imageRendering: 'pixelated',
          transition: 'filter 0.2s ease',
          mixBlendMode: 'multiply',
          filter: sprite === 'blush' ? 'hue-rotate(10deg) saturate(1.3)' :
                  sprite === 'happy' ? 'brightness(1.1) saturate(1.2)' : 'none',
        }}
      />
      {sprite === 'blush' && (
        <div
          className="absolute font-pixel text-xs sm:text-sm"
          style={{ top: 20, right: -14, opacity: 0.9 }}
        >
          💕
        </div>
      )}
    </div>
  );
}

// ── Boy character using uploaded image with sprite overlay effects ────────────
function PixelBoyCharacter({ sprite, src }: { sprite: BoySprite; src: string | null }) {
  if (!src) {
    return (
      <div className="relative w-32 sm:w-44 md:w-[200px] flex flex-col items-center justify-center" style={{ aspectRatio: '90/170' }}>
        <div className="w-16 h-16 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
        <p className="mt-4 text-white/50 font-pixel text-xs text-center leading-relaxed">loading<br/>memories...</p>
      </div>
    );
  }

  return (
    <div className="relative w-32 sm:w-44 md:w-[200px]" style={{ aspectRatio: '90/170' }}>
      <Image
        src={src}
        alt="2D anime boy character"
        fill
        style={{
          imageRendering: 'pixelated',
          transform: 'scaleX(-1)',
          transition: 'filter 0.2s ease',
          mixBlendMode: 'multiply',
          filter: sprite === 'shy' ? 'hue-rotate(20deg) saturate(1.3)' :
                  sprite === 'happy' ? 'brightness(1.15) saturate(1.2)' :
                  sprite === 'wave' ? 'brightness(1.1) hue-rotate(-10deg)' : 'none',
        }}
      />
      {/* Wave indicator */}
      {sprite === 'wave' && (
        <div
          className="absolute font-pixel text-base sm:text-lg"
          style={{
            top: -10, right: -10,
            animation: 'idleBob 0.5s ease-in-out infinite',
          }}
        >
          👋
        </div>
      )}
      {/* Shy blush */}
      {sprite === 'shy' && (
        <div
          className="absolute font-pixel text-xs sm:text-sm"
          style={{ top: 20, left: -14, opacity: 0.9 }}
        >
          💕
        </div>
      )}
    </div>
  );
}