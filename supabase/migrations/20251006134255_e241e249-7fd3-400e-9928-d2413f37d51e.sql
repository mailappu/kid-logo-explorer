-- Create a public storage bucket for airline logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'airline-logos',
  'airline-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
);

-- Create policy for public read access
CREATE POLICY "Public read access for airline logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'airline-logos');

-- Create policy for authenticated users to upload (for admin purposes)
CREATE POLICY "Authenticated users can upload airline logos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'airline-logos' AND auth.role() = 'authenticated');