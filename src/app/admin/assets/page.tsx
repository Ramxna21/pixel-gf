'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { invalidateAssetsCache } from '@/hooks/useAssets';

interface Asset {
  id: string;
  name: string;
  asset_type: string;
  slug: string | null;
  storage_path: string;
  public_url: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

const ASSET_TYPES = ['all', 'character', 'memory', 'background'];

const SLUG_HINTS: Record<string, string> = {
  boy_character: 'Boy character — generic fallback (used when no expression-specific asset exists)',
  boy_memory: 'Boy character — shown in Memories VN overlay (overrides boy_character for memories)',
  boy_idle: 'Boy character — idle expression (default/neutral state)',
  boy_happy: 'Boy character — happy expression (excited/joyful state)',
  boy_shy: 'Boy character — shy expression (blushing/embarrassed state)',
  boy_wave: 'Boy character — wave expression (waving/greeting state)',
  boy_dress: 'Boy character — Evening Dress costume (shown in CharacterShowcase)',
  boy_casual: 'Boy character — Casual Chic costume (shown in CharacterShowcase)',
  boy_traditional: 'Boy character — Traditional costume (shown in CharacterShowcase)',
  boy_fantasy: 'Boy character — Fantasy costume (shown in CharacterShowcase)',
  girl_character: 'Girl character — generic fallback (used when no expression-specific asset exists)',
  girl_memory: 'Girl character — shown in Memories VN overlay (overrides girl_character for memories)',
  girl_idle: 'Girl character — idle expression (default/neutral state)',
  girl_happy: 'Girl character — happy expression (excited/joyful state)',
  girl_shy: 'Girl character — shy expression (blushing/embarrassed state)',
  girl_wave: 'Girl character — wave expression (waving/greeting state)',
  girl_dress: 'Girl character — Evening Dress costume (shown in CharacterShowcase)',
  girl_casual: 'Girl character — Casual Chic costume (shown in CharacterShowcase)',
  girl_traditional: 'Girl character — Traditional costume (shown in CharacterShowcase)',
  girl_fantasy: 'Girl character — Fantasy costume (shown in CharacterShowcase)',
  memory_1: 'Memory photo #1 (Inside/VN) — First Date',
  memory_2: 'Memory photo #2 (Inside/VN) — Dessert Date',
  memory_3: 'Memory photo #3 (Inside/VN) — Fireworks Night',
  memory_4: 'Memory photo #4 (Inside/VN) — Cooking Disaster',
  memory_5: 'Memory photo #5 (Inside/VN) — New Year Countdown',
  memory_6: 'Memory photo #6 (Inside/VN) — Sunrise Hike',
  memory_cover_1: 'Memory photo #1 (Front Cover) — First Date',
  memory_cover_2: 'Memory photo #2 (Front Cover) — Dessert Date',
  memory_cover_3: 'Memory photo #3 (Front Cover) — Fireworks Night',
  memory_cover_4: 'Memory photo #4 (Front Cover) — Cooking Disaster',
  memory_cover_5: 'Memory photo #5 (Front Cover) — New Year Countdown',
  memory_cover_6: 'Memory photo #6 (Front Cover) — Sunrise Hike',
  bg_dress: 'Background for Evening Dress costume',
  bg_casual: 'Background for Casual Chic costume',
  bg_traditional: 'Background for Traditional costume',
  bg_fantasy: 'Background for Fantasy costume',
};

const COSTUME_SLUGS = [
  { slug: 'boy_character', label: 'Boy — Default (Hero & Memories)', gender: 'boy' },
  { slug: 'boy_memory', label: 'Boy — Memories VN Overlay', gender: 'boy' },
  { slug: 'boy_dress', label: 'Boy — Evening Dress', gender: 'boy' },
  { slug: 'boy_casual', label: 'Boy — Casual Chic', gender: 'boy' },
  { slug: 'boy_traditional', label: 'Boy — Traditional', gender: 'boy' },
  { slug: 'boy_fantasy', label: 'Boy — Fantasy', gender: 'boy' },
  { slug: 'girl_character', label: 'Girl — Default (Hero & Memories)', gender: 'girl' },
  { slug: 'girl_memory', label: 'Girl — Memories VN Overlay', gender: 'girl' },
  { slug: 'girl_dress', label: 'Girl — Evening Dress', gender: 'girl' },
  { slug: 'girl_casual', label: 'Girl — Casual Chic', gender: 'girl' },
  { slug: 'girl_traditional', label: 'Girl — Traditional', gender: 'girl' },
  { slug: 'girl_fantasy', label: 'Girl — Fantasy', gender: 'girl' },
];

interface CostumeUploadState {
  dragging: boolean;
  uploading: boolean;
  preview: string | null;
  error: string | null;
  success: boolean;
}

function CostumeDropZone({
  slug,
  label,
  gender,
  existingUrl,
  onUploaded,
}: {
  slug: string;
  label: string;
  gender: string;
  existingUrl: string | null;
  onUploaded: (slug: string, url: string) => void;
}) {
  const [state, setState] = useState<CostumeUploadState>({
    dragging: false,
    uploading: false,
    preview: existingUrl,
    error: null,
    success: false,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadAndUpsert = useCallback(
    async (file: File) => {
      setState((s) => ({ ...s, uploading: true, error: null, success: false }));
      try {
        const supabase = createClient();
        const ext = file.name.split('.').pop();
        // Use timestamp in path so URL always changes (cache-busting)
        const ts = Date.now();
        let storagePath = `character/${slug}_${ts}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(storagePath, file, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('images').getPublicUrl(storagePath);
        let publicUrl = urlData.publicUrl;

        // Check if asset with this slug already exists
        const { data: existing } = await supabase
          .from('assets')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (existing) {
          const { error: updateError } = await supabase
            .from('assets')
            .update({
              public_url: publicUrl,
              storage_path: storagePath,
              updated_at: new Date().toISOString(),
            })
            .eq('slug', slug);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase.from('assets').insert({
            id: crypto.randomUUID(),
            name: label,
            asset_type: 'character',
            slug,
            description: SLUG_HINTS[slug] || '',
            storage_path: storagePath,
            public_url: publicUrl,
          });
          if (insertError) throw insertError;
        }

        invalidateAssetsCache();
        const reader = new FileReader();
        reader.onload = (ev) => {
          setState((s) => ({ ...s, uploading: false, preview: ev.target?.result as string, success: true }));
          setTimeout(() => setState((s) => ({ ...s, success: false })), 2500);
        };
        reader.readAsDataURL(file);
        onUploaded(slug, publicUrl);
      } catch (err: any) {
        setState((s) => ({ ...s, uploading: false, error: err.message || 'Upload failed' }));
      }
    },
    [slug, label, onUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setState((s) => ({ ...s, dragging: false }));
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) uploadAndUpsert(file);
    },
    [uploadAndUpsert]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadAndUpsert(file);
  };

  const genderColor = gender === 'boy' ? 'blue' : 'pink';
  const borderClass = state.dragging
    ? genderColor === 'blue' ?'border-blue-400 bg-blue-500/10' :'border-pink-400 bg-pink-500/10'
    : state.success
    ? 'border-green-500 bg-green-500/10' :'border-gray-700 hover:border-violet-500 bg-gray-800/50';

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${borderClass}`}
        style={{ aspectRatio: slug.startsWith('memory_') ? '16/9' : '3/4' }}
        onDragOver={(e) => { e.preventDefault(); setState((s) => ({ ...s, dragging: true })); }}
        onDragLeave={() => setState((s) => ({ ...s, dragging: false }))}
        onDrop={handleDrop}
        onClick={() => !state.uploading && inputRef.current?.click()}
      >
        {(state.preview || existingUrl) ? (
          <img src={state.preview || existingUrl} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-2">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-xs text-center leading-tight">Drop image or click</span>
          </div>
        )}

        {/* Overlay on hover when image exists */}
        {(state.preview || existingUrl) && !state.uploading && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
            <span className="text-white text-xs bg-black/60 px-2 py-1 rounded-lg">Replace</span>
          </div>
        )}

        {/* Uploading spinner */}
        {state.uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Success tick */}
        {state.success && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center pointer-events-none">
            <div className="bg-green-500 rounded-full p-1.5">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        {/* Drag active overlay */}
        {state.dragging && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs font-medium text-violet-300 bg-black/60 px-2 py-1 rounded-lg">Drop to upload</span>
          </div>
        )}

        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>

      <div>
        <p className="text-xs font-medium text-white truncate">{label}</p>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono bg-violet-500/15 text-violet-400 border border-violet-500/20">
          {slug}
        </span>
        {state.error && <p className="text-xs text-red-400 mt-1 truncate">{state.error}</p>}
      </div>
    </div>
  );
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [editDragging, setEditDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', asset_type: 'character', slug: '', description: '' });
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const [addFile, setAddFile] = useState<File | null>(null);
  const [addPreview, setAddPreview] = useState<string | null>(null);
  const [addDragging, setAddDragging] = useState(false);
  const [costumeAssets, setCostumeAssets] = useState<Record<string, string>>({});

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase.from('assets').select('*').order('created_at', { ascending: false });
      if (typeFilter !== 'all') query = query.eq('asset_type', typeFilter);
      const { data, error } = await query;
      if (error) throw error;
      const list = data || [];
      setAssets(list);

      // Build slug → url map
      const map: Record<string, string> = {};
      for (const a of list) {
        if (a.slug) {
          map[a.slug] = a.public_url;
        }
      }
      setCostumeAssets(map);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleCostumeUploaded = useCallback((slug: string, url: string) => {
    setCostumeAssets((prev) => ({ ...prev, [slug]: url }));
    // Refresh full list silently
    const supabase = createClient();
    supabase.from('assets').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setAssets(data);
    });
  }, []);

  const processFile = (file: File, setter: (f: File) => void, previewSetter: (s: string) => void) => {
    setter(file);
    const reader = new FileReader();
    reader.onload = (ev) => previewSetter(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file, setUploadFile, setUploadPreview);
  };

  const handleAddFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file, setAddFile, setAddPreview);
  };

  const handleEditDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setEditDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) processFile(file, setUploadFile, setUploadPreview);
  };

  const handleAddDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setAddDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) processFile(file, setAddFile, setAddPreview);
  };

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const supabase = createClient();
    const { error: uploadError } = await supabase.storage.from('images').upload(path, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSaveEdit = async () => {
    if (!editingAsset) return;
    setSaving(true);
    setError('');
    try {
      const supabase = createClient();
      let publicUrl = editingAsset.public_url;
      let storagePath = editingAsset.storage_path;

      if (uploadFile) {
        const ext = uploadFile.name.split('.').pop();
        // Use timestamp so the URL always changes — prevents browser cache serving old image
        const ts = Date.now();
        storagePath = `${editingAsset.asset_type}/${editingAsset.id}_${ts}.${ext}`;
        publicUrl = await uploadImage(uploadFile, storagePath);
      }

      const { error: updateError } = await supabase
        .from('assets')
        .update({
          name: editingAsset.name,
          description: editingAsset.description,
          asset_type: editingAsset.asset_type,
          slug: editingAsset.slug || null,
          public_url: publicUrl,
          storage_path: storagePath,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingAsset.id);

      if (updateError) throw updateError;

      // Invalidate cache so all useAssets instances re-fetch fresh data
      invalidateAssetsCache();
      setEditingAsset(null);
      setUploadFile(null);
      setUploadPreview(null);
      await fetchAssets();
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAsset = async () => {
    if (!newAsset.name || !addFile) {
      setError('Name and image are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const supabase = createClient();
      const id = crypto.randomUUID();
      const ext = addFile.name.split('.').pop();
      const ts = Date.now();
      let storagePath = `${newAsset.asset_type}/${id}_${ts}.${ext}`;
      let publicUrl = await uploadImage(addFile, storagePath);

      const { error: insertError } = await supabase.from('assets').insert({
        id,
        name: newAsset.name,
        asset_type: newAsset.asset_type,
        slug: newAsset.slug || null,
        description: newAsset.description,
        storage_path: storagePath,
        public_url: publicUrl,
      });

      if (insertError) throw insertError;
      invalidateAssetsCache();
      setShowAddModal(false);
      setNewAsset({ name: '', asset_type: 'character', slug: '', description: '' });
      setAddFile(null);
      setAddPreview(null);
      await fetchAssets();
    } catch (err: any) {
      setError(err.message || 'Failed to add asset');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (asset: Asset) => {
    if (!confirm(`Delete "${asset.name}"? This cannot be undone.`)) return;
    setDeleting(asset.id);
    try {
      const supabase = createClient();
      if (asset.storage_path && !asset.storage_path.startsWith('/')) {
        await supabase.storage.from('images').remove([asset.storage_path]);
      }
      const { error } = await supabase.from('assets').delete().eq('id', asset.id);
      if (error) throw error;
      invalidateAssetsCache();
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    } catch (err) {
      console.error('Failed to delete asset:', err);
    } finally {
      setDeleting(null);
    }
  };

  const typeGroups = ASSET_TYPES.filter((t) => t !== 'all');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Assets</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage platform images and media — changes reflect live on the homepage</p>
        </div>
        <button
          onClick={() => { setShowAddModal(true); setError(''); }}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Asset
        </button>
      </div>

      {/* Info banner */}
      <div className="mb-5 bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
        <svg className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-violet-300 leading-relaxed">
          Assets with a <span className="font-semibold text-violet-200">Slug</span> are linked to specific parts of the app.
          Editing an asset&apos;s image will automatically update it everywhere it appears on the homepage.{' '}
          <span className="font-semibold text-violet-200">Boy expressions:</span>{' '}
          <span className="font-mono text-violet-200">boy_idle</span>,{' '}
          <span className="font-mono text-violet-200">boy_happy</span>,{' '}
          <span className="font-mono text-violet-200">boy_shy</span>,{' '}
          <span className="font-mono text-violet-200">boy_wave</span>{' '}
          (fallback: <span className="font-mono text-violet-200">boy_character</span>).{' '}
          <span className="font-semibold text-violet-200">Girl expressions:</span>{' '}
          <span className="font-mono text-violet-200">girl_idle</span>,{' '}
          <span className="font-mono text-violet-200">girl_happy</span>,{' '}
          <span className="font-mono text-violet-200">girl_shy</span>,{' '}
          <span className="font-mono text-violet-200">girl_wave</span>.{' '}
          <span className="font-semibold text-violet-200">Boy per costume:</span>{' '}
          <span className="font-mono text-violet-200">boy_dress</span>,{' '}
          <span className="font-mono text-violet-200">boy_casual</span>,{' '}
          <span className="font-mono text-violet-200">boy_traditional</span>,{' '}
          <span className="font-mono text-violet-200">boy_fantasy</span>.{' '}
          <span className="font-semibold text-violet-200">Girl per costume:</span>{' '}
          <span className="font-mono text-violet-200">girl_dress</span>,{' '}
          <span className="font-mono text-violet-200">girl_casual</span>,{' '}
          <span className="font-mono text-violet-200">girl_traditional</span>,{' '}
          <span className="font-mono text-violet-200">girl_fantasy</span>.{' '}
          Memories: <span className="font-mono text-violet-200">memory_1</span>–<span className="font-mono text-violet-200">memory_6</span>.{' '}
          Backgrounds: <span className="font-mono text-violet-200">bg_dress</span>, <span className="font-mono text-violet-200">bg_casual</span>, <span className="font-mono text-violet-200">bg_traditional</span>, <span className="font-mono text-violet-200">bg_fantasy</span>.
        </p>
      </div>

      {/* ── Costume Quick-Upload ── */}
      <div className="mb-8 bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <h2 className="text-sm font-semibold text-white">Costume Quick-Upload</h2>
        </div>
        <p className="text-xs text-gray-500 mb-5">
          Drag &amp; drop or click each card to upload a costume image. It will be saved and linked to that slug automatically.
        </p>

        {/* Boy row */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
            <span className="text-xs font-medium text-blue-300 uppercase tracking-wider">Boy Costumes</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {COSTUME_SLUGS.filter((c) => c.gender === 'boy').map((c) => (
              <CostumeDropZone
                key={c.slug}
                slug={c.slug}
                label={c.label}
                gender={c.gender}
                existingUrl={costumeAssets[c.slug] || null}
                onUploaded={handleCostumeUploaded}
              />
            ))}
          </div>
        </div>

        {/* Girl row */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-pink-400 flex-shrink-0" />
            <span className="text-xs font-medium text-pink-300 uppercase tracking-wider">Girl Costumes</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {COSTUME_SLUGS.filter((c) => c.gender === 'girl').map((c) => (
              <CostumeDropZone
                key={c.slug}
                slug={c.slug}
                label={c.label}
                gender={c.gender}
                existingUrl={costumeAssets[c.slug] || null}
                onUploaded={handleCostumeUploaded}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Memory Quick-Upload ── */}
      <div className="mb-8 bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="text-sm font-semibold text-white">Memory Photo Quick-Upload</h2>
        </div>
        <p className="text-xs text-gray-500 mb-5">
          Drag &amp; drop or click each card to upload a cover photo and an inside photo for your polaroid memories.
        </p>

        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
            <span className="text-xs font-medium text-orange-300 uppercase tracking-wider">Front Covers (Polaroids)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <CostumeDropZone
                key={`memory_cover_${num}`}
                slug={`memory_cover_${num}`}
                label={`Cover ${num}`}
                gender="boy"
                existingUrl={costumeAssets[`memory_cover_${num}`] || null}
                onUploaded={handleCostumeUploaded}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
            <span className="text-xs font-medium text-violet-300 uppercase tracking-wider">Inside Content (VN Overlay)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <CostumeDropZone
                key={`memory_${num}`}
                slug={`memory_${num}`}
                label={`Inside ${num}`}
                gender="boy"
                existingUrl={costumeAssets[`memory_${num}`] || null}
                onUploaded={handleCostumeUploaded}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 mb-5">
        {ASSET_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              typeFilter === t
                ? 'bg-violet-600 text-white'
                : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
            }`}
          >
            {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-sm">No assets found</div>
      ) : (
        <div>
          {(typeFilter === 'all' ? typeGroups : [typeFilter]).map((type) => {
            const group = assets.filter((a) => a.asset_type === type);
            if (group.length === 0) return null;
            return (
              <div key={type} className="mb-8">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  {type} <span className="text-gray-600">({group.length})</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {group.map((asset) => (
                    <div key={asset.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group">
                      <div className="aspect-square bg-gray-800 relative overflow-hidden">
                        {asset.public_url ? (
                          <img
                            src={asset.public_url}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm text-white font-medium truncate">{asset.name}</p>
                        {asset.slug && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono bg-violet-500/15 text-violet-400 border border-violet-500/20 truncate max-w-full">
                              {asset.slug}
                            </span>
                          </div>
                        )}
                        {asset.description && <p className="text-xs text-gray-500 mt-1 truncate">{asset.description}</p>}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => { setEditingAsset(asset); setUploadPreview(null); setUploadFile(null); setError(''); }}
                            className="flex-1 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 py-1.5 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(asset)}
                            disabled={deleting === asset.id}
                            className="flex-1 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {deleting === asset.id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingAsset && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setEditingAsset(null)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Edit Asset</h2>
              <button onClick={() => setEditingAsset(null)} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400 mb-4">{error}</div>}

            {editingAsset.slug && SLUG_HINTS[editingAsset.slug] && (
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-2.5 text-xs text-violet-300 mb-4 flex items-start gap-2">
                <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Used as: <span className="text-violet-200">{SLUG_HINTS[editingAsset.slug]}</span></span>
              </div>
            )}

            <div className="space-y-4">
              {/* Drag-and-drop image zone */}
              <div
                className={`aspect-video rounded-xl overflow-hidden cursor-pointer border-2 border-dashed transition-colors relative ${
                  editDragging ? 'border-violet-400 bg-violet-500/10' : 'border-gray-700 hover:border-violet-500 bg-gray-800'
                }`}
                onDragOver={(e) => { e.preventDefault(); setEditDragging(true); }}
                onDragLeave={() => setEditDragging(false)}
                onDrop={handleEditDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {(uploadPreview || editingAsset.public_url) ? (
                  <img
                    src={uploadPreview || editingAsset.public_url}
                    alt={editingAsset.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-2">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-xs">Drop image or click to upload</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                  <span className="text-white text-xs bg-black/50 px-3 py-1.5 rounded-lg">
                    {editDragging ? 'Drop to replace' : 'Replace Image'}
                  </span>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Name</label>
                <input
                  type="text"
                  value={editingAsset.name}
                  onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Type</label>
                <select
                  value={editingAsset.asset_type}
                  onChange={(e) => setEditingAsset({ ...editingAsset, asset_type: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                >
                  {typeGroups.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Slug <span className="text-gray-600 font-normal">(links asset to app location)</span>
                </label>
                <input
                  type="text"
                  value={editingAsset.slug || ''}
                  onChange={(e) => setEditingAsset({ ...editingAsset, slug: e.target.value })}
                  placeholder="e.g. boy_character, memory_1, bg_dress"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
                <textarea
                  value={editingAsset.description || ''}
                  onChange={(e) => setEditingAsset({ ...editingAsset, description: e.target.value })}
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setEditingAsset(null)}
                  className="flex-1 py-2.5 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-600 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 py-2.5 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Add New Asset</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400 mb-4">{error}</div>}

            <div className="space-y-4">
              {/* Drag-and-drop image zone */}
              <div
                className={`aspect-video rounded-xl overflow-hidden cursor-pointer border-2 border-dashed transition-colors ${
                  addDragging ? 'border-violet-400 bg-violet-500/10' : 'border-gray-700 hover:border-violet-500 bg-gray-800'
                }`}
                onDragOver={(e) => { e.preventDefault(); setAddDragging(true); }}
                onDragLeave={() => setAddDragging(false)}
                onDrop={handleAddDrop}
                onClick={() => addFileInputRef.current?.click()}
              >
                {addPreview ? (
                  <img src={addPreview} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-2">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-xs">{addDragging ? 'Drop to upload' : 'Drop image or click to upload'}</span>
                  </div>
                )}
              </div>
              <input ref={addFileInputRef} type="file" accept="image/*" onChange={handleAddFileChange} className="hidden" />

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Name</label>
                <input
                  type="text"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  placeholder="Asset name"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Type</label>
                <select
                  value={newAsset.asset_type}
                  onChange={(e) => setNewAsset({ ...newAsset, asset_type: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                >
                  {typeGroups.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Slug <span className="text-gray-600 font-normal">(optional — links to app location)</span>
                </label>
                <input
                  type="text"
                  value={newAsset.slug}
                  onChange={(e) => setNewAsset({ ...newAsset, slug: e.target.value })}
                  placeholder="e.g. boy_character, memory_1, bg_dress"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
                <textarea
                  value={newAsset.description}
                  onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                  rows={2}
                  placeholder="Optional description"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-600 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAsset}
                  disabled={saving}
                  className="flex-1 py-2.5 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Uploading...' : 'Add Asset'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
