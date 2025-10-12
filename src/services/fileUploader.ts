import { supabase } from '../lib/supabase';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'];
const VIDEO_EXTENSIONS = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'mpeg', 'mpg', '3gp'];

function isMediaFile(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  return IMAGE_EXTENSIONS.includes(extension) || VIDEO_EXTENSIONS.includes(extension);
}

async function ensureBucketExists(): Promise<void> {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'media-files');

    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket('media-files', {
        public: true,
        fileSizeLimit: 52428800,
      });

      if (error && !error.message.includes('already exists')) {
        console.error('Error creating bucket:', error);
      }
    }
  } catch (error) {
    console.error('Error checking bucket:', error);
  }
}

let bucketChecked = false;

export async function uploadFileToSupabase(
  file: File,
  directoryPath: string,
  rootFolder: string
): Promise<void> {
  try {
    if (!bucketChecked) {
      await ensureBucketExists();
      bucketChecked = true;
    }

    const filePath = `uploads/${rootFolder}/${directoryPath}`;

    console.log('Uploading file:', file.name, 'to path:', filePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return;
    }

    console.log('Upload successful:', uploadData);

    const { error: dbError } = await supabase
      .from('uploaded_files')
      .insert({
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        directory_path: directoryPath,
      });

    if (dbError) {
      console.error('Database error:', dbError);
    } else {
      console.log('Database record created for:', file.name);
    }
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

export async function scanAndUploadFiles(
  dirHandle: any,
  basePath: string = '',
  rootFolder: string = '',
  onProgress?: (current: number, total: number, status: string) => void
): Promise<{ uploaded: number; total: number }> {
  if (!rootFolder) {
    console.error('Root folder name is required');
    return { uploaded: 0, total: 0 };
  }

  let totalFiles = 0;
  let uploadedFiles = 0;

  async function countMediaFiles(handle: any): Promise<number> {
    let count = 0;
    for await (const entry of handle.values()) {
      if (entry.kind === 'file') {
        if (isMediaFile(entry.name)) {
          count++;
        }
      } else if (entry.kind === 'directory') {
        count += await countMediaFiles(entry);
      }
    }
    return count;
  }

  totalFiles = await countMediaFiles(dirHandle);
  if (onProgress) {
    onProgress(0, totalFiles || 1, 'Iniciando subida de archivos...');
  }

  async function processFiles(handle: any, path: string): Promise<void> {
    for await (const entry of handle.values()) {
      if (entry.kind === 'file') {
        const fileName = entry.name;
        if (isMediaFile(fileName)) {
          try {
            const fileHandle = await handle.getFileHandle(fileName);
            const file = await fileHandle.getFile();
            const currentPath = path ? `${path}/${fileName}` : fileName;

            await uploadFileToSupabase(file, currentPath, rootFolder);

            uploadedFiles++;
            if (onProgress) {
              onProgress(
                uploadedFiles,
                totalFiles || 1,
                `Subiendo archivos: ${uploadedFiles}/${totalFiles}`
              );
            }
          } catch (error) {
            console.error(`Error processing file ${fileName}:`, error);
          }
        }
      } else if (entry.kind === 'directory') {
        const subDirPath = path ? `${path}/${entry.name}` : entry.name;
        await processFiles(entry, subDirPath);
      }
    }
  }

  await processFiles(dirHandle, basePath);

  if (onProgress) {
    onProgress(uploadedFiles, totalFiles || 1, `¡${uploadedFiles} archivos subidos exitosamente!`);
  }

  return { uploaded: uploadedFiles, total: totalFiles };
}
