/*
  # Create uploaded files storage system with duplicate tracking

  1. New Tables
    - `uploaded_files`
      - `id` (uuid, primary key)
      - `file_name` (text) - Original name of the file
      - `file_path` (text) - Path in Supabase Storage
      - `file_type` (text) - MIME type of the file
      - `file_size` (bigint) - Size in bytes
      - `directory_path` (text) - Original directory path
      - `file_hash` (text, nullable) - SHA-256 hash for duplicate detection
      - `is_duplicate` (boolean) - Flag for duplicate files
      - `uploaded_at` (timestamptz) - Upload timestamp
      
  2. Storage
    - Create 'media-files' bucket for storing photos and videos
    - Create 'duplicates' bucket for storing duplicate files
    
  3. Security
    - Enable RLS on `uploaded_files` table
    - Add policies for public access
    - Configure storage buckets as public
*/

-- Create the uploaded_files table
CREATE TABLE IF NOT EXISTS uploaded_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  directory_path text NOT NULL,
  file_hash text,
  is_duplicate boolean DEFAULT false,
  uploaded_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a utility tool)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'uploaded_files' 
    AND policyname = 'Anyone can insert files'
  ) THEN
    CREATE POLICY "Anyone can insert files"
      ON uploaded_files
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'uploaded_files' 
    AND policyname = 'Anyone can read files'
  ) THEN
    CREATE POLICY "Anyone can read files"
      ON uploaded_files
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-files', 'media-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for duplicate files
INSERT INTO storage.buckets (id, name, public)
VALUES ('duplicates', 'duplicates', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for media-files bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Anyone can upload media files'
  ) THEN
    CREATE POLICY "Anyone can upload media files"
      ON storage.objects
      FOR INSERT
      TO anon
      WITH CHECK (bucket_id = 'media-files');
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Anyone can read media files'
  ) THEN
    CREATE POLICY "Anyone can read media files"
      ON storage.objects
      FOR SELECT
      TO anon
      USING (bucket_id = 'media-files');
  END IF;
END $$;

-- Create storage policies for duplicates bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Anyone can upload duplicates'
  ) THEN
    CREATE POLICY "Anyone can upload duplicates"
      ON storage.objects
      FOR INSERT
      TO anon
      WITH CHECK (bucket_id = 'duplicates');
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Anyone can read duplicates'
  ) THEN
    CREATE POLICY "Anyone can read duplicates"
      ON storage.objects
      FOR SELECT
      TO anon
      USING (bucket_id = 'duplicates');
  END IF;
END $$;
