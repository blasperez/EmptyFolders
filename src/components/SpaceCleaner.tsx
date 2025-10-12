import { useMemo, useState } from 'react';
import {
  Sparkles,
  FolderOpen,
  Loader2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  HardDrive
} from 'lucide-react';

interface JunkMatchContext {
  path: string;
  name: string;
  size: number;
  lastModified: number;
}

interface JunkCategory {
  id: string;
  label: string;
  description: string;
  match: (context: JunkMatchContext) => boolean;
}

interface JunkFile {
  path: string;
  name: string;
  size: number;
  parentHandle: any;
  handle: any;
  lastModified: number;
  categories: string[];
}

interface ProgressState {
  current: number;
  total: number;
  status: string;
}

interface CleanProgressState {
  current: number;
  total: number;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const JUNK_CATEGORIES: JunkCategory[] = [
  {
    id: 'temp-system',
    label: 'Temporales del sistema',
    description: 'Archivos .tmp, .temp, ~ y carpetas "Temp" generadas por Windows y aplicaciones.',
    match: ({ path, name }) => {
      const isTempExtension = /\.(tmp|temp|bak|old)$/i.test(name);
      const startsWithTilde = name.startsWith('~');
      const inTempFolder = path.includes('/temp/') || path.endsWith('/temp');
      return isTempExtension || startsWithTilde || inTempFolder;
    }
  },
  {
    id: 'cache-browser',
    label: 'Cachés de navegadores y apps',
    description: 'Archivos almacenados en carpetas Cache, Code Cache, GPUCache o AppData/Local/Temp.',
    match: ({ path, name }) => {
      const lowerPath = path.toLowerCase();
      const cacheKeywords = ['cache', 'code cache', 'gpu cache', 'appdata/local/temp', 'appdata/local/cache'];
      const cacheExtension = /\.(cache|tmp|temp|dat)$/i.test(name);
      return cacheKeywords.some(keyword => lowerPath.includes(keyword)) || cacheExtension;
    }
  },
  {
    id: 'log-files',
    label: 'Logs y reportes antiguos',
    description: 'Archivos .log, .etl o .txt antiguos usados para diagnóstico.',
    match: ({ name, lastModified }) => {
      const isLog = /\.(log|etl|txt)$/i.test(name);
      const age = Date.now() - lastModified;
      return isLog && age > 7 * ONE_DAY_MS;
    }
  },
  {
    id: 'installer-residuals',
    label: 'Residuos de instaladores',
    description: 'Restos de actualizaciones: .msi, .cab, .part guardados en Temp o Descargas.',
    match: ({ path, name }) => {
      const isInstallerFile = /\.(msi|cab|part|crdownload)$/i.test(name);
      const lowerPath = path.toLowerCase();
      return isInstallerFile && (lowerPath.includes('/temp') || lowerPath.includes('/download'));
    }
  },
  {
    id: 'thumb-cache',
    label: 'Caché de miniaturas',
    description: 'Archivos thumbs.db, desktop.ini, IconCache.db generados por el Explorador.',
    match: ({ name }) => {
      const normalized = name.toLowerCase();
      return ['thumbs.db', 'desktop.ini', 'iconcache.db', 'ehthumbs.db'].includes(normalized);
    }
  },
  {
    id: 'crash-dumps',
    label: 'Reportes de fallos',
    description: 'Archivos .dmp, .mdmp o .wer creados después de un crash o pantalla azul.',
    match: ({ path, name }) => {
      const isDump = /\.(dmp|mdmp|wer)$/i.test(name);
      const lowerPath = path.toLowerCase();
      return isDump && (lowerPath.includes('/temp') || lowerPath.includes('crash') || lowerPath.includes('reports'));
    }
  }
];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function detectCategories(context: JunkMatchContext): string[] {
  return JUNK_CATEGORIES.filter(category => category.match(context)).map(category => category.id);
}

export function SpaceCleaner() {
  const [scanning, setScanning] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [junkFiles, setJunkFiles] = useState<JunkFile[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [scanProgress, setScanProgress] = useState<ProgressState>({ current: 0, total: 0, status: '' });
  const [cleanProgress, setCleanProgress] = useState<CleanProgressState>({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [lastScanFolder, setLastScanFolder] = useState<string>('');

  const handleScan = async () => {
    try {
      setError(null);
      setJunkFiles([]);
      setSelectedCategories(new Set());
      setScanProgress({ current: 0, total: 0, status: '' });
      setCleanProgress({ current: 0, total: 0 });

      // @ts-ignore - File System Access API
      const dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });

      setLastScanFolder(dirHandle.name || 'directorio seleccionado');
      setScanning(true);
      setScanProgress({ current: 0, total: 0, status: 'Preparando análisis...' });

      const collectedFiles: Array<{ path: string; fileHandle: any; parentHandle: any }> = [];

      async function traverseDirectory(handle: any, basePath: string = ''): Promise<void> {
        for await (const entry of handle.values()) {
          if (entry.kind === 'file') {
            const fileHandle = await handle.getFileHandle(entry.name);
            const filePath = basePath ? `${basePath}/${entry.name}` : entry.name;
            collectedFiles.push({ path: filePath, fileHandle, parentHandle: handle });
          } else if (entry.kind === 'directory') {
            const subPath = basePath ? `${basePath}/${entry.name}` : entry.name;
            await traverseDirectory(entry, subPath);
          }
        }
      }

      await traverseDirectory(dirHandle);

      if (collectedFiles.length === 0) {
        setScanProgress({ current: 0, total: 0, status: '' });
        setScanning(false);
        setError('No se encontraron archivos en el directorio seleccionado.');
        return;
      }

      setScanProgress({ current: 0, total: collectedFiles.length, status: 'Analizando archivos...' });

      const detectedJunk: JunkFile[] = [];

      for (let i = 0; i < collectedFiles.length; i++) {
        const { path, fileHandle, parentHandle } = collectedFiles[i];

        try {
          const file = await fileHandle.getFile();
          const context: JunkMatchContext = {
            path: path.toLowerCase(),
            name: file.name.toLowerCase(),
            size: file.size,
            lastModified: file.lastModified
          };

          const categories = detectCategories(context);
          if (categories.length > 0) {
            detectedJunk.push({
              path,
              name: file.name,
              size: file.size,
              parentHandle,
              handle: fileHandle,
              lastModified: file.lastModified,
              categories
            });
          }
        } catch (scanError) {
          console.error('Error analizando archivo:', path, scanError);
        }

        if ((i + 1) % 20 === 0 || i === collectedFiles.length - 1) {
          setScanProgress({
            current: i + 1,
            total: collectedFiles.length,
            status: `Analizando ${i + 1}/${collectedFiles.length} archivos`
          });
        }
      }

      const matchedCategories = new Set<string>();
      detectedJunk.forEach(file => {
        file.categories.forEach(categoryId => matchedCategories.add(categoryId));
      });

      setJunkFiles(detectedJunk);
      setSelectedCategories(matchedCategories);
      setScanning(false);
      setScanProgress({ current: 0, total: 0, status: '' });

      if (detectedJunk.length === 0) {
        setError('¡Excelente! No se detectaron archivos basura en el directorio analizado.');
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setError('Operación cancelada por el usuario.');
      } else if (err?.name === 'NotAllowedError') {
        setError('Permisos denegados. Autoriza el acceso al directorio para continuar.');
      } else if (err?.message?.includes('showDirectoryPicker')) {
        setError('Tu navegador no soporta esta función. Usa Chrome, Edge u Opera en modo HTTPS.');
      } else {
        setError(`Error inesperado: ${err?.message || err}`);
      }
      setScanning(false);
      setScanProgress({ current: 0, total: 0, status: '' });
    }
  };

  const categorySummaries = useMemo(() => {
    const baseSummaries = JUNK_CATEGORIES.map(category => ({
      id: category.id,
      label: category.label,
      description: category.description,
      size: 0,
      count: 0
    }));

    const map = new Map<string, { size: number; count: number }>();
    baseSummaries.forEach(summary => {
      map.set(summary.id, { size: 0, count: 0 });
    });

    junkFiles.forEach(file => {
      file.categories.forEach(categoryId => {
        const current = map.get(categoryId);
        if (current) {
          current.size += file.size;
          current.count += 1;
        }
      });
    });

    return baseSummaries.map(summary => {
      const stats = map.get(summary.id) || { size: 0, count: 0 };
      return {
        ...summary,
        size: stats.size,
        count: stats.count
      };
    });
  }, [junkFiles]);

  const filesToClean = useMemo(() => {
    if (selectedCategories.size === 0) return [];
    return junkFiles.filter(file => file.categories.some(categoryId => selectedCategories.has(categoryId)));
  }, [junkFiles, selectedCategories]);

  const totalDetectedSize = useMemo(() => {
    return junkFiles.reduce((acc, file) => acc + file.size, 0);
  }, [junkFiles]);

  const totalSelectedSize = useMemo(() => {
    return filesToClean.reduce((acc, file) => acc + file.size, 0);
  }, [filesToClean]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleClean = async () => {
    if (filesToClean.length === 0) {
      window.alert('Selecciona al menos una categoría para eliminar archivos.');
      return;
    }

    const confirmed = window.confirm(
      `Se eliminarán ${filesToClean.length} archivo(s) basura y se liberarán aproximadamente ${formatFileSize(
        totalSelectedSize
      )}. Esta acción no se puede deshacer. ¿Deseas continuar?`
    );

    if (!confirmed) return;

    setCleaning(true);
    setCleanProgress({ current: 0, total: filesToClean.length });

    let deleted = 0;
    const remainingFiles: JunkFile[] = [];

    for (const file of junkFiles) {
      const shouldDelete = file.categories.some(categoryId => selectedCategories.has(categoryId));
      if (!shouldDelete) {
        remainingFiles.push(file);
        continue;
      }

      try {
        await file.parentHandle.removeEntry(file.name);
        deleted += 1;
        setCleanProgress({ current: deleted, total: filesToClean.length });
      } catch (deleteError) {
        console.error('Error eliminando archivo:', file.path, deleteError);
        remainingFiles.push(file);
      }
    }

    setJunkFiles(remainingFiles);
    const categoriesRemaining = new Set<string>();
    remainingFiles.forEach(file => {
      file.categories.forEach(categoryId => categoriesRemaining.add(categoryId));
    });
    setSelectedCategories(categoriesRemaining);

    setCleaning(false);
    setCleanProgress({ current: 0, total: 0 });

    if (deleted === 0) {
      window.alert('No se pudo eliminar ningún archivo. Revisa los permisos e inténtalo de nuevo.');
    } else {
      window.alert(`¡Listo! Se eliminaron ${deleted} archivo(s) y liberaste ${formatFileSize(totalSelectedSize)}.`);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-6">
          <Sparkles className="w-24 h-24 text-purple-500" />
        </div>
        <h1 className="text-4xl font-bold text-purple-800 mb-3">Liberar espacio en Windows</h1>
        <p className="text-slate-700 text-lg">
          Elimina archivos temporales, cachés y residuos del sistema como lo haría CCleaner.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-purple-900">
            <p className="font-semibold mb-1">Recomendado para liberar espacio rápidamente</p>
            <ul className="space-y-1 text-purple-800">
              <li>• Selecciona la carpeta raíz que deseas limpiar (ej. Disco C, Descargas, AppData).</li>
              <li>• Analizamos archivos comunes de basura sin tocar tus documentos personales.</li>
              <li>• Revisa las categorías detectadas y elimina lo innecesario en un clic.</li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleScan}
          disabled={scanning || cleaning}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-purple-300 disabled:to-blue-300 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
        >
          {scanning ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Analizando archivos basura...</span>
            </>
          ) : (
            <>
              <FolderOpen className="w-6 h-6" />
              <span>Seleccionar carpeta para limpiar</span>
            </>
          )}
        </button>

        {(scanning || cleaning) && (scanProgress.total > 0 || cleanProgress.total > 0) && (
          <div className="mt-6 bg-slate-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">
                {scanning ? scanProgress.status : `Eliminando archivos: ${cleanProgress.current}/${cleanProgress.total}`}
              </span>
              <span className="text-sm font-bold text-purple-600">
                {scanning && scanProgress.total > 0
                  ? Math.round((scanProgress.current / scanProgress.total) * 100)
                  : cleanProgress.total > 0
                  ? Math.round((cleanProgress.current / cleanProgress.total) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${scanning ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gradient-to-r from-red-500 to-orange-500'} transition-all duration-300`}
                style={{
                  width: `${
                    scanning && scanProgress.total > 0
                      ? (scanProgress.current / scanProgress.total) * 100
                      : cleanProgress.total > 0
                      ? (cleanProgress.current / cleanProgress.total) * 100
                      : 0
                  }%`
                }}
              ></div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Atención</p>
              <p className="text-amber-700">{error}</p>
            </div>
          </div>
        )}

        {junkFiles.length > 0 && (
          <>
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <HardDrive className="w-6 h-6 text-green-700" />
                  <p className="text-sm text-green-700 font-medium">Carpeta analizada</p>
                  <p className="text-lg font-bold text-green-800">{lastScanFolder}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <CheckCircle2 className="w-6 h-6 text-green-700" />
                  <p className="text-sm text-green-700 font-medium">Archivos basura encontrados</p>
                  <p className="text-lg font-bold text-green-800">{junkFiles.length}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Trash2 className="w-6 h-6 text-green-700" />
                  <p className="text-sm text-green-700 font-medium">Espacio recuperable</p>
                  <p className="text-lg font-bold text-green-800">{formatFileSize(totalDetectedSize)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Categorías detectadas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categorySummaries.map(category => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                      selectedCategories.has(category.id)
                        ? 'border-purple-400 bg-purple-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-800">{category.label}</p>
                      <span
                        className={`text-xs font-bold ${
                          selectedCategories.has(category.id) ? 'text-purple-600' : 'text-slate-500'
                        }`}
                      >
                        {selectedCategories.has(category.id) ? 'Seleccionado' : 'Omitido'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{category.description}</p>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>{category.count} archivo(s)</span>
                      <span>{formatFileSize(category.size)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    {filesToClean.length} archivo(s) listos para eliminar
                  </p>
                  <p className="text-xs text-blue-700">
                    Espacio a liberar: {formatFileSize(totalSelectedSize)}
                  </p>
                </div>
                <button
                  onClick={handleClean}
                  disabled={cleaning || filesToClean.length === 0}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  {cleaning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {cleaning ? 'Eliminando...' : 'Eliminar archivos basura'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


