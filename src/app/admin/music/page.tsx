'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const BUCKET = 'audio';

interface AudioTrack {
  label: string;
  storagePath: string;
  description: string;
  icon: string;
}

const TRACKS: AudioTrack[] = [
  {
    label: 'Background Music — Before Story',
    storagePath: 'background.mp3',
    description: 'Plays on the homepage hero scene before the user clicks to start',
    icon: '🎵',
  },
  {
    label: 'Background Music — During Story',
    storagePath: 'background-story.mp3',
    description: 'Plays automatically when the user clicks to start the dialogue',
    icon: '🎶',
  },
  {
    label: 'Memory 1 — First Date',
    storagePath: 'memories/1.mp3',
    description: 'Song for "Our first date ✨" memory',
    icon: '🎶',
  },
  {
    label: 'Memory 2 — Dessert Date',
    storagePath: 'memories/2.mp3',
    description: 'Song for "The dessert we shared 🍰" memory',
    icon: '🎶',
  },
  {
    label: 'Memory 3 — Fireworks Night',
    storagePath: 'memories/3.mp3',
    description: 'Song for "Fireworks night 🎆" memory',
    icon: '🎶',
  },
  {
    label: 'Memory 4 — Cooking Disaster',
    storagePath: 'memories/4.mp3',
    description: 'Song for "Cooking disaster 🍝" memory',
    icon: '🎶',
  },
  {
    label: 'Memory 5 — New Year Countdown',
    storagePath: 'memories/5.mp3',
    description: 'Song for "New Year countdown ⭐" memory',
    icon: '🎶',
  },
  {
    label: 'Memory 6 — Sunrise Hike',
    storagePath: 'memories/6.mp3',
    description: 'Song for "Sunrise hike 🌅" memory',
    icon: '🎶',
  },
];

const AMBIENT_TRACKS: AudioTrack[] = [
  {
    label: 'Ambient — Evening Dress',
    storagePath: 'ambient-dress.mp3',
    description: 'Subtle ambient SFX for the Garden Night scene (Evening Dress costume)',
    icon: '🌙',
  },
  {
    label: 'Ambient — Casual Chic',
    storagePath: 'ambient-casual.mp3',
    description: 'Subtle ambient SFX for the Park / Nature scene (Casual Chic costume)',
    icon: '🌳',
  },
  {
    label: 'Ambient — Traditional',
    storagePath: 'ambient-traditional.mp3',
    description: 'Subtle ambient SFX for the Japan Sakura scene (Traditional costume)',
    icon: '🌸',
  },
  {
    label: 'Ambient — Fantasy',
    storagePath: 'ambient-fantasy.mp3',
    description: 'Subtle ambient SFX for the Fantasy Castle scene (Fantasy costume)',
    icon: '✨',
  },
];

interface TrackState {
  uploading: boolean;
  success: boolean;
  error: string | null;
  exists: boolean;
  dragging: boolean;
  fileName: string | null;
}

function AudioUploadCard({ track }: { track: AudioTrack }) {
  const [state, setState] = useState<TrackState>({
    uploading: false,
    success: false,
    error: null,
    exists: false,
    dragging: false,
    fileName: null,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if file already exists in storage
  useEffect(() => {
    const check = async () => {
      try {
        const supabase = createClient();
        const folder = track.storagePath.includes('/') ? track.storagePath.split('/')[0] : '';
        const fileName = track.storagePath.includes('/') ? track.storagePath.split('/').pop()! : track.storagePath;
        const { data } = await supabase.storage.from(BUCKET).list(folder || undefined, { search: fileName });
        if (data && data.length > 0) {
          setState((s) => ({ ...s, exists: true, fileName: data[0].name }));
        }
      } catch {
        // ignore
      }
    };
    check();
  }, [track.storagePath]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|aac|flac|m4a)$/i)) {
        setState((s) => ({ ...s, error: 'Please upload an audio file (mp3, wav, ogg, etc.)' }));
        return;
      }
      setState((s) => ({ ...s, uploading: true, error: null, success: false }));
      try {
        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(track.storagePath, file, { upsert: true, contentType: file.type || 'audio/mpeg' });
        if (uploadError) throw uploadError;
        setState((s) => ({
          ...s,
          uploading: false,
          success: true,
          exists: true,
          fileName: file.name,
          error: null,
        }));
        setTimeout(() => setState((s) => ({ ...s, success: false })), 3000);
      } catch (err: any) {
        setState((s) => ({ ...s, uploading: false, error: err.message || 'Upload failed' }));
      }
    },
    [track.storagePath]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setState((s) => ({ ...s, dragging: false }));
      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const isBackground = track.storagePath === 'background.mp3';

  return (
    <div
      className={`bg-gray-900 border rounded-xl p-4 transition-all ${
        state.success
          ? 'border-green-500/50'
          : state.dragging
          ? 'border-violet-400 bg-violet-500/5'
          : 'border-gray-800 hover:border-gray-700'
      }`}
      onDragOver={(e) => { e.preventDefault(); setState((s) => ({ ...s, dragging: true })); }}
      onDragLeave={() => setState((s) => ({ ...s, dragging: false }))}
      onDrop={handleDrop}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${
            isBackground ? 'bg-violet-500/20' : 'bg-orange-500/15'
          }`}
        >
          {track.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-white">{track.label}</p>
            {state.exists && !state.success && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-green-500/15 text-green-400 border border-green-500/20">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Uploaded
              </span>
            )}
            {state.success && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-green-500/20 text-green-300 border border-green-500/30">
                ✓ Saved!
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{track.description}</p>
          <p className="text-xs font-mono text-gray-600 mt-0.5">{track.storagePath}</p>
          {state.error && <p className="text-xs text-red-400 mt-1">{state.error}</p>}
        </div>

        {/* Upload button */}
        <button
          onClick={() => !state.uploading && inputRef.current?.click()}
          disabled={state.uploading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
            state.uploading
              ? 'bg-gray-800 text-gray-500 cursor-wait'
              : state.exists
              ? 'bg-gray-800 hover:bg-violet-500/20 text-gray-300 hover:text-violet-300 border border-gray-700 hover:border-violet-500/40'
              : 'bg-violet-600 hover:bg-violet-500 text-white'
          }`}
        >
          {state.uploading ? (
            <>
              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
              Uploading…
            </>
          ) : state.exists ? (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Replace
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload
            </>
          )}
        </button>
        <input ref={inputRef} type="file" accept="audio/*,.mp3,.wav,.ogg,.aac,.flac,.m4a" onChange={handleFileChange} className="hidden" />
      </div>

      {/* Drag hint */}
      {state.dragging && (
        <div className="mt-3 text-center text-xs text-violet-300 font-medium">
          Drop audio file to upload
        </div>
      )}
    </div>
  );
}

export default function MusicPage() {
  const backgroundTrack = TRACKS[0];
  const storyTrack = TRACKS[1];
  const memoryTracks = TRACKS.slice(2);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Music</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload audio files for the homepage background music and per-memory songs
        </p>
      </div>

      {/* Info banner */}
      <div className="mb-6 bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
        <svg className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-violet-300 leading-relaxed">
          Upload <span className="font-semibold text-violet-200">MP3</span> files (recommended) or any audio format.
          Files are stored in the <span className="font-mono text-violet-200">audio</span> bucket and stream directly to the homepage.
          Replacing a file takes effect immediately — no cache to clear.
          You can also drag &amp; drop audio files onto each card.
        </p>
      </div>

      {/* Background Music — two separate tracks */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
          <span className="text-xs font-medium text-violet-300 uppercase tracking-wider">Homepage Background Music</span>
        </div>
        <div className="space-y-3">
          <AudioUploadCard track={backgroundTrack} />
          <AudioUploadCard track={storyTrack} />
        </div>
      </div>

      {/* Ambient / SFX — Layer 2 per costume */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" />
          <span className="text-xs font-medium text-teal-300 uppercase tracking-wider">Character Showcase — Ambient / SFX (Layer 2)</span>
        </div>
        <p className="text-xs text-gray-500 mb-3 ml-4">
          Soft ambient sounds that play quietly per costume scene in the Character Showcase section. Volume is kept low automatically (18%).
        </p>
        <div className="space-y-3">
          {AMBIENT_TRACKS.map((track) => (
            <AudioUploadCard key={track.storagePath} track={track} />
          ))}
        </div>
      </div>

      {/* Memory Songs */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
          <span className="text-xs font-medium text-orange-300 uppercase tracking-wider">Memory Songs</span>
        </div>
        <div className="space-y-3">
          {memoryTracks.map((track) => (
            <AudioUploadCard key={track.storagePath} track={track} />
          ))}
        </div>
      </div>
    </div>
  );
}
