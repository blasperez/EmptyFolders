import { supabase } from '../lib/supabase';

async function ensureBucketExists(): Promise<void> {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'duplicates');

    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket('duplicates', {
        public: true,
        fileSizeLimit: 52428800,
      });

      if (error && !error.message.includes('already exists')) {
        console.error('Error creating duplicates bucket:', error);
      }
    }
  } catch (error) {
    console.error('Error checking duplicates bucket:', error);
  }
}

let bucketChecked = false;

export async function uploadDuplicateToSupabase(
  file: File,
  originalPath: string,
  fileHash: string
): Promise<void> {
  try {
    if (!bucketChecked) {
      await ensureBucketExists();
      bucketChecked = true;
    }

    const timestamp = new Date().getTime();
    const filePath = `uploads_duplicados/${timestamp}_${file.name}`;

    console.log('Uploading duplicate file:', file.name, 'to path:', filePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('duplicates')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return;
    }

    console.log('Duplicate upload successful:', uploadData);

    const { error: dbError } = await supabase
      .from('uploaded_files')
      .insert({
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        directory_path: originalPath,
        file_hash: fileHash,
        is_duplicate: true
      });

    if (dbError) {
      console.error('Database error:', dbError);
    } else {
      console.log('Database record created for duplicate:', file.name);
    }
  } catch (error) {
    console.error('Error uploading duplicate file:', error);
  }
}
