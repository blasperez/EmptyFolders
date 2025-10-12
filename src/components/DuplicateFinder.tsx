import { useState } from 'react';
import { Copy, Image, Video, FileText, File, AlertCircle, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { uploadDuplicateToSupabase } from '../services/duplicateUploader';

type FileType = 'all' | 'images' | 'videos' | 'documents' | 'others';

interface DuplicateFile {
  path: string;
  name: string;
  size: number;
  hash?: string;
  handle?: any;
  parentHandle?: any;
  file?: File;
}

interface DuplicateGroup {
  files: DuplicateFile[];
  size: number;
  totalSize: number;
}

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'heic', 'heif'];
const VIDEO_EXTENSIONS = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'mpeg', 'mpg', '3gp', 'm4v'];
const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp'];

function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

function getFileType(fileName: string): FileType {
  const ext = getFileExtension(fileName);
  if (IMAGE_EXTENSIONS.includes(ext)) return 'images';
  if (VIDEO_EXTENSIONS.includes(ext)) return 'videos';
  if (DOCUMENT_EXTENSIONS.includes(ext)) return 'documents';
  return 'others';
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function DuplicateFinder() {
  const [selectedType, setSelectedType] = useState<FileType>('all');
  const [processing, setProcessing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0, status: '' });
  const [deleteProgress, setDeleteProgress] = useState({ current: 0, total: 0 });

  const handleScanDirectory = async () => {
    try {
      setError(null);
      setDuplicates([]);
      setSelectedFiles(new Set());

      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });

      setScanning(true);
      setScanProgress({ current: 0, total: 0, status: 'Analizando archivos...' });

      const fileMap = new Map<string, DuplicateFile[]>();
      const files: DuplicateFile[] = [];

      async function scanDirectory(handle: any, basePath: string = '', parentHandle?: any): Promise<void> {
        for await (const entry of handle.values()) {
          if (entry.kind === 'file') {
            const fileType = getFileType(entry.name);
            if (selectedType === 'all' || fileType === selectedType) {
              const fileHandle = await handle.getFileHandle(entry.name);
              const file = await fileHandle.getFile();
              const filePath = basePath ? `${basePath}/${entry.name}` : entry.name;

              files.push({
                path: filePath,
                name: entry.name,
                size: file.size,
                handle: fileHandle,
                parentHandle: handle,
                file: file
              });
            }
          } else if (entry.kind === 'directory') {
            const subPath = basePath ? `${basePath}/${entry.name}` : entry.name;
            await scanDirectory(entry, subPath, handle);
          }
        }
      }

      await scanDirectory(dirHandle);

      setScanProgress({ current: 0, total: files.length, status: 'Calculando hashes...' });

      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];
        try {
          const fileHandle = fileData.handle;
          const file = await fileHandle.getFile();
          const hash = await calculateFileHash(file);
          fileData.hash = hash;

          if (!fileMap.has(hash)) {
            fileMap.set(hash, []);
          }
          fileMap.get(hash)?.push(fileData);

          setScanProgress({
            current: i + 1,
            total: files.length,
            status: `Analizando: ${i + 1}/${files.length} archivos`
          });
        } catch (err) {
          console.error('Error processing file:', fileData.name, err);
        }
      }

      const duplicateGroups: DuplicateGroup[] = [];
      fileMap.forEach((files, hash) => {
        if (files.length > 1) {
          duplicateGroups.push({
            files,
            size: files[0].size,
            totalSize: files[0].size * files.length
          });
        }
      });

      duplicateGroups.sort((a, b) => b.totalSize - a.totalSize);

      setDuplicates(duplicateGroups);
      setScanning(false);
      setScanProgress({ current: 0, total: 0, status: '' });

      if (duplicateGroups.length === 0) {
        setError('No se encontraron archivos duplicados');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Operación cancelada');
      } else {
        setError(`Error: ${err.message}`);
      }
      setScanning(false);
      setScanProgress({ current: 0, total: 0, status: '' });
    }
  };

  const toggleFileSelection = (filePath: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filePath)) {
      newSelected.delete(filePath);
    } else {
      newSelected.add(filePath);
    }
    setSelectedFiles(newSelected);
  };

  const selectAllButFirst = (group: DuplicateGroup) => {
    const newSelected = new Set(selectedFiles);
    group.files.slice(1).forEach(file => {
      newSelected.add(file.path);
    });
    setSelectedFiles(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar ${selectedFiles.size} archivo(s)? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setProcessing(true);
    setDeleteProgress({ current: 0, total: selectedFiles.size });

    let deleted = 0;
    const filesToDelete: DuplicateFile[] = [];

    duplicates.forEach(group => {
      group.files.forEach(file => {
        if (selectedFiles.has(file.path)) {
          filesToDelete.push(file);
        }
      });
    });

    for (const file of filesToDelete) {
      try {
        if (file.file) {
          await uploadDuplicateToSupabase(file.file, file.path, file.hash || '');
        }

        await file.parentHandle.removeEntry(file.name);
        deleted++;
        setDeleteProgress({ current: deleted, total: selectedFiles.size });
      } catch (err) {
        console.error('Error deleting file:', file.path, err);
      }
    }

    const updatedDuplicates = duplicates
      .map(group => ({
        ...group,
        files: group.files.filter(file => !selectedFiles.has(file.path)),
        totalSize: group.size * group.files.filter(file => !selectedFiles.has(file.path)).length
      }))
      .filter(group => group.files.length > 1);

    setDuplicates(updatedDuplicates);
    setSelectedFiles(new Set());
    setProcessing(false);
    setDeleteProgress({ current: 0, total: 0 });
  };

  const getTotalWastedSpace = () => {
    return duplicates.reduce((total, group) => {
      return total + (group.size * (group.files.length - 1));
    }, 0);
  };

  const getSelectedSize = () => {
    let size = 0;
    duplicates.forEach(group => {
      group.files.forEach(file => {
        if (selectedFiles.has(file.path)) {
          size += file.size;
        }
      });
    });
    return size;
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-6">
          <Copy className="w-24 h-24 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-blue-800 mb-3">
          Eliminar Archivos Duplicados
        </h1>
        <p className="text-slate-700 text-lg">
          Encuentra y elimina archivos duplicados para liberar espacio
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Tipo de archivo:
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button
              onClick={() => setSelectedType('all')}
              className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                selectedType === 'all'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <File className="w-5 h-5" />
              Todos
            </button>
            <button
              onClick={() => setSelectedType('images')}
              className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                selectedType === 'images'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Image className="w-5 h-5" />
              Fotos
            </button>
            <button
              onClick={() => setSelectedType('videos')}
              className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                selectedType === 'videos'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Video className="w-5 h-5" />
              Videos
            </button>
            <button
              onClick={() => setSelectedType('documents')}
              className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                selectedType === 'documents'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-5 h-5" />
              Documentos
            </button>
            <button
              onClick={() => setSelectedType('others')}
              className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                selectedType === 'others'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <File className="w-5 h-5" />
              Otros
            </button>
          </div>
        </div>

        <button
          onClick={handleScanDirectory}
          disabled={scanning || processing}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-blue-300 disabled:to-purple-300 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
        >
          {scanning ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Escaneando...</span>
            </>
          ) : (
            <>
              <Copy className="w-6 h-6" />
              <span>Escanear Directorio</span>
            </>
          )}
        </button>

        {scanning && scanProgress.total > 0 && (
          <div className="mt-6 bg-slate-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">{scanProgress.status}</span>
              <span className="text-sm font-bold text-blue-600">
                {scanProgress.total > 0 ? Math.round((scanProgress.current / scanProgress.total) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{
                  width: `${scanProgress.total > 0 ? (scanProgress.current / scanProgress.total) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>
        )}

        {processing && deleteProgress.total > 0 && (
          <div className="mt-6 bg-red-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-red-700">
                Eliminando archivos: {deleteProgress.current}/{deleteProgress.total}
              </span>
              <span className="text-sm font-bold text-red-600">
                {Math.round((deleteProgress.current / deleteProgress.total) * 100)}%
              </span>
            </div>
            <div className="w-full bg-red-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${(deleteProgress.current / deleteProgress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Información</p>
              <p className="text-amber-700">{error}</p>
            </div>
          </div>
        )}

        {duplicates.length > 0 && (
          <>
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-green-700 font-medium mb-1">Grupos duplicados</p>
                  <p className="text-2xl font-bold text-green-800">{duplicates.length}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium mb-1">Espacio desperdiciado</p>
                  <p className="text-2xl font-bold text-green-800">{formatFileSize(getTotalWastedSpace())}</p>
                </div>
              </div>
            </div>

            {selectedFiles.size > 0 && (
              <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    {selectedFiles.size} archivo(s) seleccionado(s)
                  </p>
                  <p className="text-xs text-blue-700">
                    Espacio a liberar: {formatFileSize(getSelectedSize())}
                  </p>
                </div>
                <button
                  onClick={handleDeleteSelected}
                  disabled={processing}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            )}

            <div className="mt-6 space-y-4 max-h-[600px] overflow-y-auto">
              {duplicates.map((group, groupIndex) => (
                <div key={groupIndex} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">
                        {group.files.length} copias idénticas
                      </p>
                      <p className="text-xs text-slate-600">
                        Tamaño: {formatFileSize(group.size)} cada una
                        {' • '}
                        Desperdicio: {formatFileSize(group.size * (group.files.length - 1))}
                      </p>
                    </div>
                    <button
                      onClick={() => selectAllButFirst(group)}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-3 rounded-lg transition-all duration-200"
                    >
                      Seleccionar duplicados
                    </button>
                  </div>
                  <div className="space-y-2">
                    {group.files.map((file, fileIndex) => (
                      <div
                        key={fileIndex}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                          selectedFiles.has(file.path)
                            ? 'bg-blue-100 border-2 border-blue-400'
                            : 'bg-white border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(file.path)}
                          onChange={() => toggleFileSelection(file.path)}
                          className="w-5 h-5 rounded border-slate-300 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate" title={file.path}>
                            {file.path}
                          </p>
                          {fileIndex === 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              Original
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
