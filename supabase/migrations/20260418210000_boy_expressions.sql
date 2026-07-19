-- Add boy character expression assets
-- Each expression can be independently replaced in the admin panel

DO $$
DECLARE
  v_base_url TEXT;
BEGIN
  -- Get the current boy_character public_url to use as default for all expressions
  SELECT public_url INTO v_base_url FROM public.assets WHERE slug = 'boy_character' LIMIT 1;

  -- Fallback if boy_character not found
  IF v_base_url IS NULL THEN
    v_base_url := '/assets/images/ChatGPT_Image_Apr_17__2026__04_14_16_PM-1776424610884.png';
  END IF;

  -- boy_idle
  IF NOT EXISTS (SELECT 1 FROM public.assets WHERE slug = 'boy_idle') THEN
    INSERT INTO public.assets (id, name, asset_type, slug, storage_path, public_url, description)
    VALUES (
      gen_random_uuid(),
      'Boy Character — Idle',
      'character',
      'boy_idle',
      '',
      v_base_url,
      'Boy character idle/neutral expression shown in HeroScene dialogue'
    );
  END IF;

  -- boy_happy
  IF NOT EXISTS (SELECT 1 FROM public.assets WHERE slug = 'boy_happy') THEN
    INSERT INTO public.assets (id, name, asset_type, slug, storage_path, public_url, description)
    VALUES (
      gen_random_uuid(),
      'Boy Character — Happy',
      'character',
      'boy_happy',
      '',
      v_base_url,
      'Boy character happy/excited expression shown in HeroScene dialogue'
    );
  END IF;

  -- boy_shy
  IF NOT EXISTS (SELECT 1 FROM public.assets WHERE slug = 'boy_shy') THEN
    INSERT INTO public.assets (id, name, asset_type, slug, storage_path, public_url, description)
    VALUES (
      gen_random_uuid(),
      'Boy Character — Shy',
      'character',
      'boy_shy',
      '',
      v_base_url,
      'Boy character shy/blushing expression shown in HeroScene dialogue'
    );
  END IF;

  -- boy_wave
  IF NOT EXISTS (SELECT 1 FROM public.assets WHERE slug = 'boy_wave') THEN
    INSERT INTO public.assets (id, name, asset_type, slug, storage_path, public_url, description)
    VALUES (
      gen_random_uuid(),
      'Boy Character — Wave',
      'character',
      'boy_wave',
      '',
      v_base_url,
      'Boy character waving expression shown in HeroScene dialogue'
    );
  END IF;
END $$;
