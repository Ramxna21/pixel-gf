-- Add slug column to assets for identifying specific app assets
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_assets_slug ON public.assets(slug) WHERE slug IS NOT NULL;

-- Seed all app assets with slugs if not already present
DO $$
BEGIN
  -- Boy character (used in HeroScene, MemorySection, CharacterShowcase)
  INSERT INTO public.assets (name, asset_type, slug, storage_path, public_url, description)
  VALUES (
    'Pixel Boy Character', 'character', 'boy_character',
    'characters/pixel-boy.png',
    '/assets/images/ChatGPT_Image_Apr_17__2026__04_14_16_PM-1776424610884.png',
    'Main male pixel character used across the app'
  )
  ON CONFLICT DO NOTHING;

  -- Memory photos (6 polaroid memories)
  INSERT INTO public.assets (name, asset_type, slug, storage_path, public_url, description)
  VALUES
    ('Memory 1 - First Date', 'memory', 'memory_1', 'memories/memory-1.jpg',
     'https://images.unsplash.com/photo-1596474971295-65d4f8963dcf',
     'First date photo — April 14, 2023'),
    ('Memory 2 - Dessert Date', 'memory', 'memory_2', 'memories/memory-2.jpg',
     'https://img.rocket.new/generatedImages/rocket_gen_img_1924b85b5-1770356483842.png',
     'Dessert date photo — June 22, 2023'),
    ('Memory 3 - Fireworks Night', 'memory', 'memory_3', 'memories/memory-3.jpg',
     'https://images.unsplash.com/photo-1705153302372-4efa2f076e65',
     'Fireworks night photo — August 17, 2023'),
    ('Memory 4 - Cooking Disaster', 'memory', 'memory_4', 'memories/memory-4.jpg',
     'https://images.unsplash.com/photo-1686668914767-2163445b36d0',
     'Cooking disaster photo — October 5, 2023'),
    ('Memory 5 - New Year Countdown', 'memory', 'memory_5', 'memories/memory-5.jpg',
     'https://images.unsplash.com/photo-1620996149152-277fddb58133',
     'New Year countdown photo — December 31, 2023'),
    ('Memory 6 - Sunrise Hike', 'memory', 'memory_6', 'memories/memory-6.jpg',
     'https://images.unsplash.com/photo-1699754493225-3b0a60e12d06',
     'Sunrise hike photo — February 14, 2024')
  ON CONFLICT DO NOTHING;

  -- Background per costume (4 costumes)
  INSERT INTO public.assets (name, asset_type, slug, storage_path, public_url, description)
  VALUES
    ('Background - Evening Dress (Sunset Beach)', 'background', 'bg_dress', 'backgrounds/bg-dress.png', '', 'SVG scene for Evening Dress costume — Sunset Beach'),
    ('Background - Casual Chic (Park)', 'background', 'bg_casual', 'backgrounds/bg-casual.png', '', 'SVG scene for Casual Chic costume — Park / Nature'),
    ('Background - Traditional (Japan Sakura)', 'background', 'bg_traditional', 'backgrounds/bg-traditional.png', '', 'SVG scene for Traditional costume — Japan Sakura'),
    ('Background - Fantasy (Castle Night)', 'background', 'bg_fantasy', 'backgrounds/bg-fantasy.png', '', 'SVG scene for Fantasy costume — Castle Night')
  ON CONFLICT DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed skipped: %', SQLERRM;
END $$;
