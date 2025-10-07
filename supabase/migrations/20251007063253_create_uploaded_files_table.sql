/*
  # Create uploaded files storage system

  1. New Tables
    - `uploaded_files`
      - `id` (uuid, primary key)
      - `file_name` (text) - Original name of the file
      - `file_path` (text) - Path in Supabase Storage
      - `file_type` (text) - MIME type of the file
      - `file_size` (bigint) - Size in bytes
      - `directory_path` (text) - Original directory path
      - `uploaded_at` (timestamptz) - Upload timestamp
      
  2. Storage
    - Create 'media-files' bucket for storing photos and videos
    
  3. Security
    - Enable RLS on `uploaded_files` table
    - Add policy for inserting files (public access for this use case)
    - Add policy for reading files (public access for this use case)
    - Configure storage bucket as public
*/

-- Create the uploaded_files table
CREATE TABLE IF NOT EXISTS uploaded_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  directory_path text NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a utility tool)
CREATE POLICY "Anyone can insert files"
  ON uploaded_files
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read files"
  ON uploaded_files
  FOR SELECT
  TO anon
  USING (true);

-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-files', 'media-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for public access
CREATE POLICY "Anyone can upload files"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'media-files');

CREATE POLICY "Anyone can read files"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'media-files');