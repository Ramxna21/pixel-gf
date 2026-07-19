'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import AppImage from '@/components/ui/AppImage';
import Image from 'next/image';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { memoryAudioPath } from '@/lib/audioService';
import { useAssets } from '@/hooks/useAssets';

interface Memory {
  id: number;
  photo: string;
  alt: string;
  date: string;
  caption: string;
  song: string;
  artist: string;
  tilt: string;
}

// ── VN Dialogue per memory ───────────────────────────────────────────────────
type Speaker = 'boy' | 'girl';
type BoySprite = 'idle' | 'happy' | 'shy' | 'wave';
type GirlSprite = 'idle' | 'happy' | 'shy' | 'blush';

interface DialogueLine {
  speaker: Speaker;
  text: string;
  boySprite: BoySprite;
  girlSprite: GirlSprite;
}

const MEMORY_DIALOGUES: Record<number, DialogueLine[]> = {
  1: [
    { speaker: 'boy',  text: 'The temple looked beautiful that day… 🛕',             boySprite: 'shy',   girlSprite: 'idle'  },
    { speaker: 'girl', text: 'Not as beautiful as the sunset though! 🌅',             boySprite: 'shy',   girlSprite: 'happy' },
    { speaker: 'boy',  text: 'I wasn\'t looking at the sunset anyway. 😏',            boySprite: 'happy', girlSprite: 'happy' },
    { speaker: 'girl', text: 'Stop it, you\'re making me blush! 💕',                  boySprite: 'happy', girlSprite: 'blush' },
  ],
  2: [
    { speaker: 'girl', text: 'The reptiles were so adorable! 🦎 I wanted to pet them all!', boySprite: 'idle',  girlSprite: 'happy' },
    { speaker: 'boy',  text: 'Even that huge python? You\'re so brave! 🐍', boySprite: 'shy', girlSprite: 'happy' },
    { speaker: 'girl', text: 'Of course! They are just misunderstood noodles! 🥺', boySprite: 'happy', girlSprite: 'blush' },
    { speaker: 'boy',  text: 'Haha, alright, next time I\'ll let you hold it then! 😂', boySprite: 'happy', girlSprite: 'blush' },
  ],
  3: [
    { speaker: 'boy',  text: 'We took so many silly pictures here! 🤪',               boySprite: 'idle',  girlSprite: 'idle'  },
    { speaker: 'girl', text: 'I still keep them in my wallet! 📸',                    boySprite: 'happy', girlSprite: 'shy'   },
    { speaker: 'boy',  text: 'Even the one where I blinked?',                         boySprite: 'happy', girlSprite: 'blush' },
    { speaker: 'girl', text: 'Especially the one where you blinked! 💕',              boySprite: 'shy',   girlSprite: 'blush' },
  ],
  4: [
    { speaker: 'girl', text: 'Our last bowl of ramen before you left… 🍜',            boySprite: 'idle',  girlSprite: 'shy'   },
    { speaker: 'boy',  text: 'I promised we\'d eat it again when I get back.',        boySprite: 'happy', girlSprite: 'shy'   },
    { speaker: 'girl', text: 'Distance means so little when someone means so much. 💕', boySprite: 'happy', girlSprite: 'happy' },
    { speaker: 'boy',  text: 'I\'ll be back before you know it. ✨',                   boySprite: 'wave',  girlSprite: 'happy' },
  ],
};

// ── Sprite palettes (same as HeroScene) ─────────────────────────────────────
const GIRL_SPRITES: Record<GirlSprite, { dress: string; face: string; eyeExpr: string }> = {
  idle:  { dress: '#1A1A2E', face: '#FDDCB5', eyeExpr: 'closed' },
  happy: { dress: '#2A1A4E', face: '#FDDCB5', eyeExpr: 'open'   },
  shy:   { dress: '#1A1A2E', face: '#FDDCB5', eyeExpr: 'closed' },
  blush: { dress: '#2A1040', face: '#FDDCC5', eyeExpr: 'blush'  },
};

// ── Fallback memory photos (used when Supabase asset not found) ──────────────
const MEMORY_FALLBACKS: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1596474971295-65d4f8963dcf',
  2: 'https://img.rocket.new/generatedImages/rocket_gen_img_1924b85b5-1770356483842.png',
  3: 'https://images.unsplash.com/photo-1705153302372-4efa2f076e65',
  4: 'https://images.unsplash.com/photo-1686668914767-2163445b36d0',
  5: 'https://images.unsplash.com/photo-1620996149152-277fddb58133',
  6: 'https://images.unsplash.com/photo-1699754493225-3b0a60e12d06',
};

const MEMORIES_BASE: Omit<Memory, 'photo'>[] = [
  {
    id: 1,
    alt: 'Couple on a golden sunset beach, warm amber light, soft ocean waves in background',
    date: 'July 15, 2026',
    caption: 'Prambanan Temple🛕',
    story: 'I was so nervous I spilled my coffee twice. You laughed and said "that\'s okay, now I have a story to tell." That was the moment I knew.',
    song: 'Those Eyes',
    artist: 'New West',
    tilt: '-3deg'
  },
  {
    id: 2,
    alt: 'Two people sharing a dessert at a cozy dimly lit restaurant, candlelight, warm tones',
    date: 'July 16, 2026',
    caption: 'Zoo date🐅',
    story: 'One slice of cake, two forks. You said "this is the best thing I\'ve ever eaten." I still don\'t know if you meant the cake or the company.',
    song: 'Sunday Best',
    artist: 'Surfaces',
    tilt: '2deg'
  },
  {
    id: 3,
    alt: 'Silhouette of two people watching fireworks in a night sky, purple and gold explosions',
    date: 'July 16, 2026',
    caption: 'Photo booth📸',
    story: 'You grabbed my hand when the first one went off. By the tenth, neither of us was watching the sky anymore.',
    song: 'Photograph',
    artist: 'Ed Sheeran',
    tilt: '-2deg'
  },
  {
    id: 4,
    alt: 'Cozy home cooking scene, pasta and wine, warm kitchen lighting, soft shadows',
    date: 'July 17, 2026',
    caption: 'Last meal before the distance takes over 🍜',
    story: 'You said "I\'ll cook something special." Three smoke alarms later, we ordered pizza and ate it on the kitchen floor. Best night.',
    song: 'Hey There Delilah',
    artist: 'Plain White T\'s',
    tilt: '4deg'
  },
];

// ── Girl SVG sprite (same as HeroScene) ─────────────────────────────────────
function PixelGirlCharacter({ sprite }: { sprite: GirlSprite }) {
  const s = GIRL_SPRITES[sprite];
  return (
    <svg
      className="w-12 h-auto sm:w-[80px]"
      viewBox="0 0 90 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated', transition: 'all 0.15s ease' }}
    >
      <rect x="28" y="8" width="34" height="8" fill="#1A0A0A" />
      <rect x="24" y="12" width="4" height="20" fill="#1A0A0A" />
      <rect x="62" y="12" width="4" height="20" fill="#1A0A0A" />
      <rect x="28" y="8" width="34" height="4" fill="#2A1010" />
      <rect x="28" y="16" width="34" height="30" fill={s.face} />
      {s.eyeExpr === 'closed' && (<><rect x="34" y="26" width="8" height="3" rx="1" fill="#1A0A0A" /><rect x="48" y="26" width="8" height="3" rx="1" fill="#1A0A0A" /></>)}
      {s.eyeExpr === 'open' && (<><rect x="34" y="24" width="8" height="6" rx="1" fill="#1A0A0A" /><rect x="48" y="24" width="8" height="6" rx="1" fill="#1A0A0A" /><rect x="36" y="25" width="3" height="2" fill="white" opacity="0.7" /><rect x="50" y="25" width="3" height="2" fill="white" opacity="0.7" /></>)}
      {s.eyeExpr === 'blush' && (<><rect x="34" y="26" width="8" height="3" rx="1" fill="#1A0A0A" /><rect x="48" y="26" width="8" height="3" rx="1" fill="#1A0A0A" /><rect x="28" y="32" width="10" height="4" rx="2" fill="#F4A0A0" opacity="0.8" /><rect x="52" y="32" width="10" height="4" rx="2" fill="#F4A0A0" opacity="0.8" /></>)}
      {s.eyeExpr !== 'blush' && (<><rect x="30" y="32" width="6" height="3" rx="1" fill="#F4A0A0" opacity="0.6" /><rect x="54" y="32" width="6" height="3" rx="1" fill="#F4A0A0" opacity="0.6" /></>)}
      <rect x="37" y="38" width="16" height="3" rx="1" fill={sprite === 'happy' ? '#F4A261' : '#E8713A'} />
      <rect x="24" y="28" width="4" height="4" rx="1" fill="#F4A261" />
      <rect x="62" y="28" width="4" height="4" rx="1" fill="#F4A261" />
      <rect x="38" y="46" width="14" height="10" fill={s.face} />
      <rect x="34" y="54" width="22" height="2" fill="#F4A261" />
      <rect x="43" y="56" width="4" height="4" rx="1" fill="#F4A261" />
      <rect x="22" y="56" width="46" height="50" rx="2" fill={s.dress} />
      <rect x="26" y="56" width="38" height="4" fill={sprite === 'happy' ? '#3A2A5E' : '#2A2A4E'} />
      <rect x="10" y="58" width="12" height="36" rx="4" fill={s.face} />
      <rect x="68" y="58" width="12" height="36" rx="4" fill={s.face} />
      <rect x="30" y="106" width="12" height="44" rx="3" fill={s.dress} />
      <rect x="48" y="106" width="12" height="44" rx="3" fill={s.dress} />
      <rect x="28" y="146" width="16" height="8" rx="2" fill="#1A0A0A" />
      <rect x="46" y="146" width="16" height="8" rx="2" fill="#1A0A0A" />
      {sprite === 'blush' && (<><rect x="72" y="20" width="4" height="4" fill="#F4A261" opacity="0.9" /><rect x="74" y="18" width="2" height="8" fill="#F4A261" opacity="0.6" /><rect x="70" y="22" width="8" height="2" fill="#F4A261" opacity="0.6" /></>)}
    </svg>
  );
}

// ── Girl character using uploaded image (same as HeroScene) ─────────────────
function MemoryGirlCharacter({ sprite, src }: { sprite: GirlSprite; src: string }) {
  return (
    <div className="relative w-32 sm:w-40 md:w-[170px]" style={{ aspectRatio: '90/170' }}>
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
        <div className="absolute font-pixel text-xs sm:text-sm" style={{ top: 20, right: -14, opacity: 0.9 }}>💕</div>
      )}
    </div>
  );
}

// ── Boy character using uploaded image ───────────────────────────────────────
function PixelBoyCharacter({ sprite, src }: { sprite: BoySprite; src: string }) {
  return (
    <div className="relative w-32 sm:w-40 md:w-[170px]" style={{ aspectRatio: '80/152' }}>
      <Image
        src={src}
        alt="2D anime boy character"
        fill
        style={{
          imageRendering: 'pixelated',
          transform: 'scaleX(-1)',
          transition: 'filter 0.2s ease',
          filter: sprite === 'shy'   ? 'hue-rotate(20deg) saturate(1.3)' :
                  sprite === 'happy' ? 'brightness(1.15) saturate(1.2)' :
                  sprite === 'wave'  ? 'brightness(1.1) hue-rotate(-10deg)' : 'none',
        }}
      />
      {sprite === 'wave' && (
        <div className="absolute font-pixel text-sm sm:text-base" style={{ top: -8, right: -10, animation: 'idleBob 0.5s ease-in-out infinite' }}>👋</div>
      )}
      {sprite === 'shy' && (
        <div className="absolute font-pixel text-xs sm:text-sm" style={{ top: 16, left: -12, opacity: 0.9 }}>💕</div>
      )}
    </div>
  );
}

const BOY_CHARACTER_FALLBACK = '/assets/images/ChatGPT_Image_Apr_17__2026__04_14_16_PM-1776424610884.png';
const GIRL_CHARACTER_FALLBACK = '/assets/images/CW_senyum-1776546037986.png';

// ── VN Memory Overlay ────────────────────────────────────────────────────────
interface VNOverlayProps {
  memory: Memory;
  allMemories: Memory[];
  onClose: () => void;
  onNextMemory: (next: Memory) => void;
  boyCharSrc: string;
  girlCharSrc: string;
}

function VNMemoryOverlay({ memory, allMemories, onClose, onNextMemory, boyCharSrc, girlCharSrc }: VNOverlayProps) {
  const script = MEMORY_DIALOGUES[memory.id] ?? [];
  const [lineIndex, setLineIndex] = useState(0);
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const [done, setDone] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [girlFlash, setGirlFlash] = useState(false);
  const [boyFlash, setBoyFlash] = useState(false);
  const prevGirlSprite = useRef<GirlSprite>('idle');
  const prevBoySprite = useRef<BoySprite>('idle');

  const currentLine = script[lineIndex] ?? script[0];
  const boySprite: BoySprite = currentLine?.boySprite ?? 'idle';
  const girlSprite: GirlSprite = currentLine?.girlSprite ?? 'idle';

  // Flash on sprite change
  useEffect(() => {
    if (girlSprite !== prevGirlSprite.current) {
      setGirlFlash(true);
      setTimeout(() => setGirlFlash(false), 180);
      prevGirlSprite.current = girlSprite;
    }
  }, [girlSprite]);

  useEffect(() => {
    if (boySprite !== prevBoySprite.current) {
      setBoyFlash(true);
      setTimeout(() => setBoyFlash(false), 180);
      prevBoySprite.current = boySprite;
    }
  }, [boySprite]);

  // Pause background music immediately when overlay opens
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('bgmusic:fadeout', { detail: { source: 'memory', fade: true } }));
    return () => {
      // Resume background music when overlay is closed
      window.dispatchEvent(new CustomEvent('bgmusic:fadein', { detail: { volume: 0.4, source: 'memory' } }));
    };
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isPreviewOpen) {
        if (e.key === 'Escape') setIsPreviewOpen(false);
        return;
      }
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' || e.key === 'Enter') advance();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIndex, done, isPreviewOpen]);

  const advance = useCallback(() => {
    if (done || isPreviewOpen) return;
    const next = lineIndex + 1;
    if (next < script.length) {
      setBubbleVisible(false);
      setTimeout(() => {
        setLineIndex(next);
        setBubbleVisible(true);
      }, 140);
    } else {
      // Dialogue finished — show Next Photo button instead of auto-advancing
      setDone(true);
      setBubbleVisible(false);
    }
  }, [done, lineIndex, script.length]);

  const handleNextPhoto = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIdx = allMemories.findIndex(m => m.id === memory.id);
    const nextMemory = allMemories[currentIdx + 1] ?? null;
    if (nextMemory) {
      onNextMemory(nextMemory);
    } else {
      onClose();
      setTimeout(() => {
        const next = document.getElementById('characters');
        if (next) next.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [allMemories, memory.id, onNextMemory, onClose]);

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ zIndex: 1000, background: 'rgba(13,6,24,0.96)', backdropFilter: 'blur(20px)' }}
      onClick={advance}
    >
      {/* ── Top: polaroid photo strip ── */}
      <div
        className="relative flex-shrink-0 cursor-pointer"
        style={{ height: 'clamp(140px, 30vw, 220px)' }}
        onClick={e => { e.stopPropagation(); setIsPreviewOpen(true); }}
        title="Click to view full photo"
      >
        <AppImage
          src={memory.photo}
          alt={memory.alt}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="100vw"
          style={{ opacity: 0.8 }}
        />
        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px)',
          }}
        />
        {/* Gradient fade bottom */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 80, background: 'linear-gradient(to bottom, transparent, rgba(13,6,24,0.96))' }}
        />
        {/* Caption + date */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <span className="font-pixel text-xs sm:text-sm font-bold" style={{ color: '#F4A261' }}>{memory.caption}</span>
          <span className="font-pixel" style={{ color: 'rgba(255,241,230,0.5)', fontSize: 9 }}>{memory.date}</span>
        </div>
        {/* Close button */}
        <button
          onClick={e => { e.stopPropagation(); onClose(); }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-200"
          style={{ background: 'rgba(26,10,46,0.85)', border: '1px solid rgba(244,162,97,0.4)', color: '#F4A261' }}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* ── Middle: characters + dialogue ── */}
      <div className="flex-1 flex flex-col items-center justify-end pb-8 sm:pb-10 px-3 sm:px-4 relative" style={{ minHeight: 0 }}>
        
        {/* Dialogue bubble (center) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-[92%] sm:w-[80%] max-w-2xl"
          style={{
            bottom: 'clamp(70px, 15vh, 90px)',
            zIndex: 30,
            opacity: bubbleVisible && !done ? 1 : 0,
            transform: bubbleVisible && !done ? 'translate(-50%, 0) scale(1)' : 'translate(-50%, 12px) scale(0.96)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
          }}
        >
          {/* Speaker label */}
          <div
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full mb-1.5 sm:mb-2 font-pixel"
            style={{
              fontSize: 'clamp(8px, 2.5vw, 12px)',
              background: currentLine?.speaker === 'boy' ?'linear-gradient(135deg, #2D1B4E, #4A2D7A)' :'linear-gradient(135deg, #3D1A3A, #7A2D5A)',
              color: '#FFF1E6',
              border: '1px solid rgba(244,162,97,0.4)',
            }}
          >
            <span>{currentLine?.speaker === 'boy' ? '👦' : '👧'}</span>
            <span>{currentLine?.speaker === 'boy' ? 'nanu nanu' : 'ara ara'}</span>
          </div>

          {/* Bubble */}
          <div
            className="relative rounded-xl sm:rounded-2xl px-4 py-3 sm:px-5 sm:py-4 font-display leading-relaxed"
            style={{
              fontSize: 'clamp(13px, 3.5vw, 15px)',
              background: 'rgba(26,10,46,0.92)',
              border: '1.5px solid rgba(244,162,97,0.5)',
              color: '#FFF1E6',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 6px 24px rgba(0,0,0,0.5), 0 0 16px rgba(244,162,97,0.1)',
            }}
          >
            {currentLine?.text}
            {/* Bubble tail toward active speaker */}
            <div
              className="absolute"
              style={{
                bottom: -9,
                left: currentLine?.speaker === 'boy' ? 12 : 'auto',
                right: currentLine?.speaker === 'girl' ? 12 : 'auto',
                width: 0, height: 0,
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: '9px solid rgba(244,162,97,0.5)',
              }}
            />
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-2 sm:mt-3">
            {script.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === lineIndex ? 12 : 4,
                  height: 4,
                  background: i <= lineIndex ? '#F4A261' : 'rgba(244,162,97,0.25)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Boy (absolute bottom left) */}
        <div
          className="absolute left-1 sm:left-12 pointer-events-none"
          style={{
            bottom: '0px',
            zIndex: 10,
            filter: boyFlash ? 'brightness(2)' : 'brightness(1)',
            transition: 'filter 0.1s ease, opacity 0.2s ease, transform 0.2s ease',
            animation: 'idleBobSlow 4s ease-in-out infinite',
            opacity: currentLine?.speaker === 'boy' ? 1 : 0.6,
            transform: currentLine?.speaker === 'boy' ? 'scale(1.05)' : 'scale(1)',
          } as React.CSSProperties}
        >
          <PixelBoyCharacter sprite={boySprite} src={boyCharSrc} />
        </div>

        {/* Girl (absolute bottom right) */}
        <div
          className="absolute right-1 sm:right-12 pointer-events-none"
          style={{
            bottom: '0px',
            zIndex: 10,
            filter: girlFlash ? 'brightness(2)' : 'brightness(1)',
            transition: 'filter 0.1s ease, opacity 0.2s ease, transform 0.2s ease',
            animation: 'idleBob 3.5s ease-in-out infinite',
            opacity: currentLine?.speaker === 'girl' ? 1 : 0.6,
            transform: currentLine?.speaker === 'girl' ? 'scale(1.05)' : 'scale(1)',
          } as React.CSSProperties}
        >
          <MemoryGirlCharacter sprite={girlSprite} src={girlCharSrc} />
        </div>

        {/* Song pill — now with play/pause from Supabase storage */}
        <SongPlayer memoryId={memory.id} song={memory.song} artist={memory.artist} />

        {/* Click hint / Next Photo button */}
        {!done ? (
          <div
            className="font-pixel text-xs"
            style={{ color: 'rgba(244,162,97,0.55)', animation: 'musicPulse 1.5s ease-in-out infinite' }}
          >
            {lineIndex < script.length - 1 ? 'tap to continue ▶' : 'tap to finish ✨'}
          </div>
        ) : (
          <button
            onClick={handleNextPhoto}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 font-pixel text-xs font-bold transition-all duration-200 mt-1 relative z-20"
            style={{
              background: 'linear-gradient(135deg, #E8713A, #F4A261)',
              color: '#FFF1E6',
              border: 'none',
              boxShadow: '0 4px 16px rgba(232,113,58,0.4)',
              animation: 'fadeInUp 0.4s ease-out both',
            }}
          >
            {allMemories.findIndex(m => m.id === memory.id) < allMemories.length - 1
              ? '📸 Next Photo →' :'✨ Finish'}
          </button>
        )}
      </div>

      {/* Image Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 sm:p-8"
          style={{ zIndex: 2000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
          onClick={(e) => { e.stopPropagation(); setIsPreviewOpen(false); }}
        >
          <div className="relative w-full h-full max-w-5xl max-h-[85vh] rounded-lg overflow-hidden shadow-2xl border border-white/10">
            <AppImage
              src={memory.photo}
              alt={memory.alt}
              fill
              className="object-contain"
              sizes="100vw"
            />
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center bg-black/50 text-white hover:bg-black/80 transition-colors border border-white/20"
              onClick={(e) => { e.stopPropagation(); setIsPreviewOpen(false); }}
              aria-label="Close Preview"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Per-memory song player pill ───────────────────────────────────────────────
interface SongPlayerProps {
  memoryId: number;
  song: string;
  artist: string;
}

function SongPlayer({ memoryId, song, artist }: SongPlayerProps) {
  const { isPlaying, isLoading, isReady, hasError, fadeOut, fadeIn, play, pause } = useAudioPlayer({
    storagePath: memoryAudioPath(memoryId),
    loop: true,
    volume: 0.6,
  });

  // Auto-play on mount when ready
  useEffect(() => {
    if (isReady && !isPlaying) {
      setTimeout(() => fadeIn(0.6, 500), 200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isReady) return;
    if (isPlaying) {
      pause();
      window.dispatchEvent(new CustomEvent('bgmusic:fadein', { detail: { volume: 0.4, source: 'memory' } }));
    } else {
      window.dispatchEvent(new CustomEvent('bgmusic:fadeout', { detail: { source: 'memory', fade: true } }));
      play();
    }
  }, [isReady, isPlaying, play, pause]);

  return (
    <button
      onClick={handleToggle}
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-3 transition-all duration-200"
      style={{
        background: isPlaying
          ? 'linear-gradient(135deg, rgba(232,113,58,0.25), rgba(244,162,97,0.25))'
          : 'linear-gradient(135deg, rgba(232,113,58,0.12), rgba(244,162,97,0.12))',
        border: `1px solid ${isPlaying ? 'rgba(232,113,58,0.6)' : 'rgba(232,113,58,0.3)'}`,
        cursor: isReady ? 'pointer' : 'default',
        opacity: isLoading && !isReady ? 0.6 : 1,
        boxShadow: isPlaying ? '0 0 12px rgba(232,113,58,0.3)' : 'none',
        animation: isPlaying ? 'musicPulse 2s ease-in-out infinite' : 'none',
      }}
      title={hasError ? `Upload ${memoryId}.mp3 to the audio/memories/ bucket folder` : undefined}
      aria-label={isPlaying ? `Pause ${song}` : `Play ${song}`}
    >
      <span style={{ fontSize: 13 }}>
        {isLoading && !isReady ? '⏳' : hasError ? '🎵' : isPlaying ? '⏸' : '▶'}
      </span>
      <span className="font-pixel text-xs font-medium" style={{ color: '#E8713A' }}>
        {song} — {artist}
      </span>
      {isPlaying && (
        <span
          className="flex gap-0.5 items-end"
          style={{ height: 12 }}
          aria-hidden="true"
        >
          {[1, 2, 3].map((b) => (
            <span
              key={b}
              style={{
                display: 'inline-block',
                width: 3,
                background: '#F4A261',
                borderRadius: 1,
                animation: `musicBar${b} 0.6s ease-in-out infinite`,
                animationDelay: `${b * 0.1}s`,
                height: b === 2 ? 10 : 6,
              }}
            />
          ))}
        </span>
      )}
    </button>
  );
}

// ── Main Section ─────────────────────────────────────────────────────────────
export default function MemorySection() {
  const [activeMemory, setActiveMemory] = useState<Memory | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [visible, setVisible] = useState(false);
  const { getAssetUrl } = useAssets();
  // Use boy_memory slug first, fall back to boy_character, then local image
  const boyCharSrc = getAssetUrl('boy_memory', getAssetUrl('boy_character', BOY_CHARACTER_FALLBACK));
  // Use girl_memory slug first, fall back to girl_character, then local image
  const girlCharSrc = getAssetUrl('girl_memory', getAssetUrl('girl_character', GIRL_CHARACTER_FALLBACK));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(e => { if (e.isIntersecting) setVisible(true); }); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleNextMemory = useCallback((next: Memory) => {
    setActiveMemory(next);
    // Scroll the next card into view in the background
    setTimeout(() => {
      const el = cardRefs.current[next.id];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  }, []);

  return (
    <>
      <section
        id="memories"
        ref={sectionRef}
        className="relative py-16 sm:py-24 px-4 sm:px-6"
        style={{
          background: 'linear-gradient(180deg, #0D0618 0%, #1A0A2E 50%, #0D0618 100%)',
          zIndex: 20
        }}
      >
        {/* Section header */}
        <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-16">
          <span
            className="font-pixel text-xs uppercase tracking-widest mb-4 block"
            style={{
              color: '#F4A261',
              opacity: visible ? 1 : 0,
              animation: visible ? 'fadeInUp 0.7s ease-out 0.1s both' : 'none'
            }}
          >
            📸 our memories
          </span>
          <h2
            className="font-display font-black leading-none mb-4"
            style={{
              fontSize: 'clamp(1.75rem, 6vw, 4rem)',
              letterSpacing: '-0.03em',
              color: '#FFF1E6',
              opacity: visible ? 1 : 0,
              animation: visible ? 'fadeInUp 0.7s ease-out 0.2s both' : 'none'
            }}
          >
            Click a Memory.
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #E8713A, #F4A261)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Relive the Feeling.
            </span>
          </h2>
          <p
            className="font-display text-sm sm:text-base max-w-xs sm:max-w-md mx-auto px-2"
            style={{
              color: 'rgba(255,241,230,0.6)',
              lineHeight: 1.7,
              opacity: visible ? 1 : 0,
              animation: visible ? 'fadeInUp 0.7s ease-out 0.3s both' : 'none'
            }}
          >
            Every polaroid holds a story. Tap to open the memory, read the moment, and hear the song that was playing.
          </p>
        </div>

        {/* Polaroid grid — 1 col on mobile, 2 on sm, 3 on md+ */}
        <div
          className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8"
          style={{ perspective: '1000px' }}
        >
          {MEMORIES_BASE.map((memory, idx) => {
            const insideUrl = getAssetUrl(`memory_${memory.id}`, MEMORY_FALLBACKS[memory.id] ?? '');
            const coverUrl = getAssetUrl(`memory_cover_${memory.id}`, insideUrl);
            return (
              <div
                key={memory.id}
                ref={el => { cardRefs.current[memory.id] = el; }}
                className="polaroid-card rounded-sm cursor-pointer mx-auto w-full max-w-xs sm:max-w-none"
                style={{
                  transform: `rotate(${memory.tilt})`,
                  ['--tilt' as string]: memory.tilt,
                  opacity: visible ? 1 : 0,
                  animation: visible ? `fadeInScale 0.6s ease-out ${0.1 + idx * 0.1}s both` : 'none'
                }}
                onClick={() => setActiveMemory({ ...memory, photo: insideUrl })}
                role="button"
                tabIndex={0}
                aria-label={`Open memory: ${memory.caption}`}
                onKeyDown={e => e.key === 'Enter' && setActiveMemory({ ...memory, photo: insideUrl })}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'rotate(0deg) scale(1.05)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = `rotate(${memory.tilt}) scale(1)`; }}
              >
                <div className="relative overflow-hidden" style={{ height: 'clamp(140px, 40vw, 160px)', background: '#E8D5C0' }}>
                  <AppImage
                    src={coverUrl}
                    alt={memory.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 90vw, (max-width: 768px) 50vw, 33vw"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 3px)'
                    }}
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300"
                    style={{ background: 'rgba(232,113,58,0.3)' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0'; }}
                  >
                    <span className="font-pixel text-xs text-white font-bold">▶ open</span>
                  </div>
                </div>
                <div className="pt-2 px-1 pb-1">
                  <p className="font-pixel text-xs font-bold truncate" style={{ color: '#1A0A2E', fontSize: 11 }}>
                    {memory.caption}
                  </p>
                  <p className="font-pixel" style={{ color: 'rgba(26,10,46,0.45)', fontSize: 9, marginTop: 2 }}>
                    {memory.date}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Decorative anime elements */}
        <div className="absolute top-20 left-8 font-pixel text-lg pointer-events-none select-none" style={{ color: 'rgba(244,162,97,0.2)' }}>♥</div>
        <div className="absolute bottom-20 right-10 font-pixel text-2xl pointer-events-none select-none" style={{ color: 'rgba(231,111,138,0.15)' }}>✦</div>
      </section>

      {activeMemory && (
        <VNMemoryOverlay
          key={activeMemory.id}
          memory={activeMemory}
          allMemories={MEMORIES_BASE.map(m => ({ ...m, photo: getAssetUrl(`memory_${m.id}`, MEMORY_FALLBACKS[m.id] ?? '') }))}
          onClose={() => setActiveMemory(null)}
          onNextMemory={handleNextMemory}
          boyCharSrc={boyCharSrc}
          girlCharSrc={girlCharSrc}
        />
      )}
    </>
  );
}
