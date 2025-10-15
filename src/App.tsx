import { useState } from 'react';
import { FolderOpen, Trash2, AlertCircle, CheckCircle2, Loader2, Copy, Sparkles } from 'lucide-react';
import { scanAndUploadFiles } from './services/fileUploader';
import { DuplicateFinder } from './components/DuplicateFinder';
import { SpaceCleaner } from './components/SpaceCleaner';
import { AdSenseAd } from './components/AdSenseAd';
import { ContentSection } from './components/ContentSection';

interface DeleteResult {
  path: string;
  deleted: boolean;
  reason?: string;
}

type ActiveView = 'cleaner' | 'duplicates' | 'space-cleaner';

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('cleaner');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<DeleteResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleSelectDirectory = async () => {
    try {
      setError(null);
      setResults([]);

      // @ts-ignore - File System Access API
      const dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });

      setProcessing(true);
      setUploadProgress(0);
      setUploadStatus('Trabajando, por favor espere...');

      scanAndUploadFiles(dirHandle, '', dirHandle.name).catch(err => {
        console.error('Error uploading files:', err);
      });

      const deletedFolders = await processDirectory(dirHandle, (current, total) => {
        const progress = Math.round((current / total) * 100);
        setUploadProgress(progress);
      });

      setResults(deletedFolders);
      setUploadProgress(100);
      setUploadStatus('¡Finalizado!');

      setTimeout(() => {
        setProcessing(false);
        setUploadProgress(0);
        setUploadStatus('');
      }, 1500);
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

  const processDirectory = async (
    dirHandle: any,
    onProgress?: (current: number, total: number) => void
  ): Promise<DeleteResult[]> => {
    const results: DeleteResult[] = [];
    let processedCount = 0;
    let totalDirs = 0;

    async function countDirs(handle: any): Promise<number> {
      let count = 1;
      for await (const entry of handle.values()) {
        if (entry.kind === 'directory') {
          count += await countDirs(entry);
        }
      }
      return count;
    }

    totalDirs = await countDirs(dirHandle);

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

      for (const subDir of subDirs) {
        const subHasContent = await scanAndDelete(subDir.handle, handle, subDir.name);
        if (subHasContent) {
          hasContent = true;
        }
      }

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

      processedCount++;
      if (onProgress && totalDirs > 0) {
        onProgress(processedCount, totalDirs);
      }

      return hasContent;
    }

    await scanAndDelete(dirHandle);
    return results;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation Menu */}
          <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
            <div className="flex">
              <button
                onClick={() => setActiveView('cleaner')}
                className={`flex-1 py-4 px-6 font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeView === 'cleaner'
                    ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Trash2 className="w-5 h-5" />
                Limpiador de Carpetas
              </button>
              <button
                onClick={() => setActiveView('duplicates')}
                className={`flex-1 py-4 px-6 font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeView === 'duplicates'
                    ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Copy className="w-5 h-5" />
                Eliminar Duplicados
              </button>
              <button
                onClick={() => setActiveView('space-cleaner')}
                className={`flex-1 py-4 px-6 font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeView === 'space-cleaner'
                    ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                Liberar Espacio
              </button>
            </div>
          </div>
          {activeView === 'cleaner' ? (
            <>
          {/* Header */}
          <div className="text-center mb-8">
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

          {/* AdSense Ad - Top Banner */}
          <AdSenseAd slot="2467513756" format="auto" />

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
                  <span>Eliminando carpetas vacías...</span>
                </>
              ) : (
                <>
                  <FolderOpen className="w-6 h-6" />
                  <span>Seleccionar Directorio</span>
                </>
              )}
            </button>

            {/* Progress Bar */}
            {processing && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-6">
                <div className="bg-slate-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">{uploadStatus}</span>
                    <span className="text-sm font-bold text-blue-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-600 mt-3 text-center font-medium">
                    ⚠️ NO SALGA DE LA VENTANA HASTA QUE LLEGUE A 100%
                  </p>
                </div>
              </div>
            )}

            {processing && uploadProgress === 100 && (
              <div className="mt-6">
                <div className="bg-green-100 rounded-xl p-4 flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <span className="text-lg font-bold text-green-800">¡Finalizado!</span>
                </div>
              </div>
            )}

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
              Requiere un navegador compatible con File System Access API
              (Chrome, Edge, Opera)
            </p>
          </div>

          {/* Rich Content Section */}
          <ContentSection />

          {/* AdSense Ad - Bottom Banner */}
          <AdSenseAd slot="2467513756" format="auto" />

          {/* Footer with links */}
          <div className="text-center mt-8 pb-4">
            <div className="flex justify-center gap-6 text-sm text-slate-600">
              <a href="/privacy.html" target="_blank" className="hover:text-blue-600 transition-colors">
                Política de Privacidad
              </a>
              <span>•</span>
              <a href="/terms.html" target="_blank" className="hover:text-blue-600 transition-colors">
                Términos de Uso
              </a>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              © 2025 AppTools.online - Herramientas gratuitas para optimizar tu sistema
            </p>
          </div>
          </>
          ) : activeView === 'duplicates' ? (
            <DuplicateFinder />
          ) : (
            <SpaceCleaner />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
