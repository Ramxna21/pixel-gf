'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface AssetRecord {
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

interface UseAssetsReturn {
  assets: AssetRecord[];
  loading: boolean;
  getAssetUrl: (slug: string, fallback?: string) => string;
  refetch: () => Promise<void>;
}

// Global version counter — incrementing forces ALL mounted useAssets to re-fetch
let globalVersion = 0;
const versionListeners = new Set<() => void>();

function notifyAll() {
  globalVersion++;
  versionListeners.forEach((fn) => fn());
}

export function useAssets(): UseAssetsReturn {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(globalVersion);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Subscribe to global invalidation
  useEffect(() => {
    const listener = () => setVersion(globalVersion);
    versionListeners.add(listener);
    return () => { versionListeners.delete(listener); };
  }, []);

  const fetchAssets = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      if (isMounted.current) {
        setAssets(data ?? []);
      }
    } catch (err) {
      console.error('useAssets: failed to fetch', err);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  // Re-fetch whenever version changes (triggered by invalidateAssetsCache)
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets, version]);

  const getAssetUrl = useCallback(
    (slug: string, fallback = '') => {
      const asset = assets.find((a) => a.slug === slug);
      return asset?.public_url || fallback;
    },
    [assets]
  );

  return { assets, loading, getAssetUrl, refetch: fetchAssets };
}

// Call after any admin save — notifies ALL mounted useAssets instances immediately
export function invalidateAssetsCache() {
  notifyAll();
  // Also fire window event for cross-tab/cross-component compatibility
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('assets:invalidated'));
  }
}
