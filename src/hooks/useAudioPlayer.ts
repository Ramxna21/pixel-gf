'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getAudioUrl } from '@/lib/audioService';

interface UseAudioPlayerOptions {
  /** Storage path inside the `audio` bucket, e.g. "background.mp3" */
  storagePath: string;
  /** Whether to loop the track */
  loop?: boolean;
  /** Initial volume 0–1 */
  volume?: number;
  /** Auto-play as soon as the URL is resolved (requires user gesture first) */
  autoPlay?: boolean;
}

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  isLoading: boolean;
  isReady: boolean;
  hasError: boolean;
  volume: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setVolume: (v: number) => void;
  /** Smoothly fade volume to 0 over `durationMs` ms, then pause */
  fadeOut: (durationMs?: number) => Promise<void>;
  /** Set volume to 0, play, then smoothly fade up to `targetVolume` over `durationMs` ms */
  fadeIn: (targetVolume?: number, durationMs?: number) => Promise<void>;
}

/**
 * Custom hook that streams audio from Supabase storage with play/pause controls.
 * Resolves the public URL once on mount, then manages an HTMLAudioElement.
 */
export function useAudioPlayer({
  storagePath,
  loop = false,
  volume: initialVolume = 0.5,
  autoPlay = false,
}: UseAudioPlayerOptions): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [volume, setVolumeState] = useState(initialVolume);
  const autoPlayRef = useRef(autoPlay);
  const fadeRafRef = useRef<number | null>(null);

  // Resolve URL from Supabase storage on mount
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setIsReady(false);
    setHasError(false);

    getAudioUrl(storagePath).then((url) => {
      if (cancelled || !url) {
        if (!cancelled) {
          setIsLoading(false);
          setHasError(true);
        }
        return;
      }

      const audio = new Audio(url);
      audio.loop = loop;
      audio.volume = initialVolume;
      audio.preload = 'metadata';

      audio.addEventListener('canplaythrough', () => {
        if (cancelled) return;
        setIsLoading(false);
        setIsReady(true);
        if (autoPlayRef.current) {
          audio.play().catch(() => {/* browser blocked autoplay — user must interact first */});
        }
      });

      audio.addEventListener('play', () => { if (!cancelled) setIsPlaying(true); });
      audio.addEventListener('pause', () => { if (!cancelled) setIsPlaying(false); });
      audio.addEventListener('ended', () => { if (!cancelled && !loop) setIsPlaying(false); });
      audio.addEventListener('error', () => {
        if (!cancelled) {
          setIsLoading(false);
          setHasError(true);
        }
      });

      audioRef.current = audio;
    });

    return () => {
      cancelled = true;
      if (fadeRafRef.current) cancelAnimationFrame(fadeRafRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      setIsPlaying(false);
      setIsReady(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storagePath]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const toggle = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    setVolumeState(clamped);
  }, []);

  /** Smoothly fade volume to 0 over durationMs, then pause */
  const fadeOut = useCallback((durationMs = 600): Promise<void> => {
    return new Promise((resolve) => {
      const audio = audioRef.current;
      if (!audio || audio.paused) {
        resolve();
        return;
      }
      if (fadeRafRef.current) cancelAnimationFrame(fadeRafRef.current);
      const startVolume = audio.volume;
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const newVol = startVolume * (1 - progress);
        audio.volume = Math.max(0, newVol);
        if (progress < 1) {
          fadeRafRef.current = requestAnimationFrame(tick);
        } else {
          audio.pause();
          audio.volume = startVolume; // restore for next play
          resolve();
        }
      };
      fadeRafRef.current = requestAnimationFrame(tick);
    });
  }, [isPlaying]);

  /** Set volume to 0, play, then fade up to targetVolume over durationMs */
  const fadeIn = useCallback((targetVolume = initialVolume, durationMs = 600): Promise<void> => {
    return new Promise((resolve) => {
      const audio = audioRef.current;
      if (!audio || !isReady) {
        resolve();
        return;
      }
      if (fadeRafRef.current) cancelAnimationFrame(fadeRafRef.current);
      audio.volume = 0;
      audio.play().catch(() => { resolve(); return; });
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const newVol = targetVolume * progress;
        audio.volume = Math.max(0, Math.min(1, newVol));
        setVolumeState(audio.volume);
        if (progress < 1) {
          fadeRafRef.current = requestAnimationFrame(tick);
        } else {
          resolve();
        }
      };
      fadeRafRef.current = requestAnimationFrame(tick);
    });
  }, [isReady, initialVolume]);

  return { isPlaying, isLoading, isReady, hasError, volume, play, pause, toggle, setVolume, fadeOut, fadeIn };
}
