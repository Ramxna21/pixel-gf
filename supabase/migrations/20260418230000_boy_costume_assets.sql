-- Migration: seed boy costume assets for CharacterShowcase
-- Slugs: boy_dress, boy_casual, boy_traditional, boy_fantasy

DO $$
DECLARE
  boy_fallback_url TEXT;
BEGIN
  -- Get the existing boy_character public_url as fallback, or use empty string
  SELECT public_url INTO boy_fallback_url
  FROM public.assets
  WHERE slug = 'boy_character'
  LIMIT 1;

  IF boy_fallback_url IS NULL THEN
    boy_fallback_url := '';
  END IF;

  -- boy_dress
  IF NOT EXISTS (SELECT 1 FROM public.assets WHERE slug = 'boy_dress') THEN
    INSERT INTO public.assets (id, name, asset_type, slug, storage_path, public_url, description, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Boy — Evening Dress',
      'character',
      'boy_dress',
      '',
      boy_fallback_url,
      'Boy character for Evening Dress costume in CharacterShowcase',
      NOW(),
      NOW()
    );
  END IF;

  -- boy_casual
  IF NOT EXISTS (SELECT 1 FROM public.assets WHERE slug = 'boy_casual') THEN
    INSERT INTO public.assets (id, name, asset_type, slug, storage_path, public_url, description, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Boy — Casual Chic',
      'character',
      'boy_casual',
      '',
      boy_fallback_url,
      'Boy character for Casual Chic costume in CharacterShowcase',
      NOW(),
      NOW()
    );
  END IF;

  -- boy_traditional
  IF NOT EXISTS (SELECT 1 FROM public.assets WHERE slug = 'boy_traditional') THEN
    INSERT INTO public.assets (id, name, asset_type, slug, storage_path, public_url, description, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Boy — Traditional',
      'character',
      'boy_traditional',
      '',
      boy_fallback_url,
      'Boy character for Traditional costume in CharacterShowcase',
      NOW(),
      NOW()
    );
  END IF;

  -- boy_fantasy
  IF NOT EXISTS (SELECT 1 FROM public.assets WHERE slug = 'boy_fantasy') THEN
    INSERT INTO public.assets (id, name, asset_type, slug, storage_path, public_url, description, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Boy — Fantasy',
      'character',
      'boy_fantasy',
      '',
      boy_fallback_url,
      'Boy character for Fantasy costume in CharacterShowcase',
      NOW(),
      NOW()
    );
  END IF;
END $$;
