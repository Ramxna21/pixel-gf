-- Admin dashboard: assets table + storage bucket + admin auth

-- 1. Assets table for managing platform images
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'character',
  storage_path TEXT NOT NULL,
  public_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assets_asset_type ON public.assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON public.assets(created_at);

-- 2. Add status column to orders if not exists
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Enable RLS on assets
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- 4. RLS: only authenticated (admin) can manage assets
DROP POLICY IF EXISTS "authenticated_can_manage_assets" ON public.assets;
CREATE POLICY "authenticated_can_manage_assets"
ON public.assets
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. RLS: allow public read for assets (for frontend display)
DROP POLICY IF EXISTS "public_can_read_assets" ON public.assets;
CREATE POLICY "public_can_read_assets"
ON public.assets
FOR SELECT
TO public
USING (true);

-- 6. Allow authenticated admins to update/delete orders
DROP POLICY IF EXISTS "authenticated_can_update_orders" ON public.orders;
CREATE POLICY "authenticated_can_update_orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_can_delete_orders" ON public.orders;
CREATE POLICY "authenticated_can_delete_orders"
ON public.orders
FOR DELETE
TO authenticated
USING (true);

-- 7. Create storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']::TEXT[]
)
ON CONFLICT (id) DO NOTHING;

-- 8. Storage RLS: authenticated can upload/manage images
DROP POLICY IF EXISTS "authenticated_can_upload_images" ON storage.objects;
CREATE POLICY "authenticated_can_upload_images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "authenticated_can_update_images" ON storage.objects;
CREATE POLICY "authenticated_can_update_images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'images');

DROP POLICY IF EXISTS "authenticated_can_delete_images" ON storage.objects;
CREATE POLICY "authenticated_can_delete_images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'images');

DROP POLICY IF EXISTS "public_can_read_images" ON storage.objects;
CREATE POLICY "public_can_read_images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'images');

-- 9. Mock admin user
DO $$
DECLARE
  admin_uuid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES (
    admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'admin@pixelgift.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
    jsonb_build_object('full_name', 'Admin PixelGift', 'role', 'admin'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
    false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
  )
  ON CONFLICT (id) DO NOTHING;

  -- Sample assets
  INSERT INTO public.assets (name, asset_type, storage_path, public_url, description)
  VALUES
    ('Pixel Boy Character', 'character', 'characters/pixel-boy.png', '/assets/images/ChatGPT_Image_Apr_17__2026__04_14_16_PM-1776424610884.png', 'Main male pixel character'),
    ('App Logo', 'background', 'backgrounds/logo.png', '/assets/images/app_logo.png', 'Application logo asset')
  ON CONFLICT (id) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Mock data insertion skipped: %', SQLERRM;
END $$;
