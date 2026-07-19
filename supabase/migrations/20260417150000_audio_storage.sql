-- Create audio storage bucket for background music and per-memory songs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio',
  'audio',
  true,
  52428800, -- 50MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/aac', 'audio/flac', 'audio/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to audio files
DROP POLICY IF EXISTS "audio_public_read" ON storage.objects;
CREATE POLICY "audio_public_read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'audio');

-- Allow authenticated users to upload audio files
DROP POLICY IF EXISTS "audio_authenticated_upload" ON storage.objects;
CREATE POLICY "audio_authenticated_upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio');

-- Allow authenticated users to delete their own audio files
DROP POLICY IF EXISTS "audio_authenticated_delete" ON storage.objects;
CREATE POLICY "audio_authenticated_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'audio');
