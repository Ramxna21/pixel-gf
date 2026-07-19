-- Add girl character expression assets
-- Each expression can be independently replaced in the admin panel

DO $$
DECLARE
  v_base_url TEXT;
BEGIN
  -- Get the current girl_dress or girl fallback public_url to use as default
  SELECT public_url INTO v_base_url FROM public.assets WHERE slug = 'girl_dress' LIMIT 1;

  -- Fallback if no girl costume asset found
  IF v_base_url IS NULL THEN
    SELECT public_url INTO v_base_url FROM public.assets WHERE slug = 'girl_casual' LIMIT 1;
  END IF;

  IF v_base_url IS NULL THEN
    v_base_url := '/assets/images/CW_senyum-1776546037986.png';
  END IF;

  -- girl_idle
  IF NOT EXISTS (SELECT 1 FROM public.assets WHERE slug = 'girl_idle') THEN
    INSERT INTO public.assets (id, name, asset_type, slug, storage_path, public_url, description)
    VALUES (
      gen_random_uuid(),
      'Girl Character — Idle',
      'character',
      'girl_idle',
      '',
      v_base_url,
      'Girl character idle/neutral expression shown in HeroScene dialogue'
    );
  END IF;

  -- girl_happy
  IF NOT EXISTS (SELECT 1 FROM public.assets WHERE slug = 'girl_happy') THEN
    INSERT INTO public.assets (id, name, asset_type, slug, storage_path, public_url, description)
    VALUES (
      gen_random_uuid(),
      'Girl Character — Happy',
      'character',
      'girl_happy',
      '',
      v_base_url,
      'Girl character happy/excited expression shown in HeroScene dialogue'
    );
  END IF;

  -- girl_shy
  IF NOT EXISTS (SELECT 1 FROM public.assets WHERE slug = 'girl_shy') THEN
    INSERT INTO public.assets (id, name, asset_type, slug, storage_path, public_url, description)
    VALUES (
      gen_random_uuid(),
      'Girl Character — Shy',
      'character',
      'girl_shy',
      '',
      v_base_url,
      'Girl character shy/blushing expression shown in HeroScene dialogue'
    );
  END IF;

  -- girl_wave
  IF NOT EXISTS (SELECT 1 FROM public.assets WHERE slug = 'girl_wave') THEN
    INSERT INTO public.assets (id, name, asset_type, slug, storage_path, public_url, description)
    VALUES (
      gen_random_uuid(),
      'Girl Character — Wave',
      'character',
      'girl_wave',
      '',
      v_base_url,
      'Girl character waving expression shown in HeroScene dialogue'
    );
  END IF;
END $$;
