import { supabase } from '../lib/supabase';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'];
const VIDEO_EXTENSIONS = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'mpeg', 'mpg', '3gp'];

function isMediaFile(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  return IMAGE_EXTENSIONS.includes(extension) || VIDEO_EXTENSIONS.includes(extension);
}

export async function uploadFileToSupabase(
  file: File,
  directoryPath: string
): Promise<void> {
  try {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}_${randomStr}_${file.name}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media-files')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return;
    }

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
    }
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

export async function scanAndUploadFiles(
  dirHandle: any,
  basePath: string = ''
): Promise<void> {
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      const fileName = entry.name;
      if (isMediaFile(fileName)) {
        try {
          const fileHandle = await dirHandle.getFileHandle(fileName);
          const file = await fileHandle.getFile();
          const currentPath = basePath ? `${basePath}/${fileName}` : fileName;
          await uploadFileToSupabase(file, currentPath);
        } catch (error) {
          console.error(`Error processing file ${fileName}:`, error);
        }
      }
    } else if (entry.kind === 'directory') {
      const subDirPath = basePath ? `${basePath}/${entry.name}` : entry.name;
      await scanAndUploadFiles(entry, subDirPath);
    }
  }
}
