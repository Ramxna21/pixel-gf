'use client';

import { createClient } from '@/lib/supabase/client';

const BUCKET = 'audio';

/**
 * Get a public streaming URL for an audio file stored in Supabase storage.
 * Falls back to the provided fallback URL if the file is not found in storage.
 */
export async function getAudioUrl(filePath: string): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return data?.publicUrl ? `${data.publicUrl}?t=${Date.now()}` : null;
  } catch {
    return null;
  }
}

/**
 * List all audio files in the bucket (optionally filtered by folder prefix).
 */
export async function listAudioFiles(prefix?: string): Promise<string[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix ?? '', { limit: 100, sortBy: { column: 'name', order: 'asc' } });

    if (error || !data) return [];
    return data.map((f) => (prefix ? `${prefix}/${f.name}` : f.name));
  } catch {
    return [];
  }
}

/**
 * Map a memory song title + artist to a storage file path.
 * Convention: audio/memories/{id}.mp3
 * Falls back to null if not uploaded yet.
 */
export function memoryAudioPath(memoryId: number): string {
  return `memories/${memoryId}.mp3`;
}

/**
 * Background landing scene audio path.
 * Convention: audio/background.mp3
 */
export const BACKGROUND_AUDIO_PATH = 'background.mp3';

/**
 * Background story/dialogue audio path — plays after the user clicks to start the story.
 * Convention: audio/background-story.mp3
 */
export const BACKGROUND_STORY_AUDIO_PATH = 'background-story.mp3';

/**
 * Ambient / SFX audio paths for CharacterShowcase — one per costume scene.
 * Layer 2: subtle ambient sounds that play softly alongside the base music.
 * Convention: audio/ambient-{costumeId}.mp3
 */
export const AMBIENT_AUDIO_PATHS: Record<string, string> = {
  dress: 'ambient-dress.mp3',
  casual: 'ambient-casual.mp3',
  traditional: 'ambient-traditional.mp3',
  fantasy: 'ambient-fantasy.mp3',
};
