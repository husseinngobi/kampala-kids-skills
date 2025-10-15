-- Enable public access to video files in storage
-- This allows videos to be streamed from the videos bucket

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public videos are accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public images are accessible" ON storage.objects;

-- Create policy to allow public SELECT access to videos bucket
CREATE POLICY "Public videos are accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'videos');

-- Create policy to allow public SELECT access to images bucket  
CREATE POLICY "Public images are accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'images');