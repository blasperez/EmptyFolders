import { useState, useEffect } from 'react';

interface BrowserCompatibility {
  supportsFileSystemAPI: boolean;
  isSecureContext: boolean;
  browserName: string;
  isCompatible: boolean;
  errorMessage?: string;
}

export function useBrowserCompatibility(): BrowserCompatibility {
  const [compatibility, setCompatibility] = useState<BrowserCompatibility>({
    supportsFileSystemAPI: false,
    isSecureContext: false,
    browserName: 'Unknown',
    isCompatible: false,
  });

  useEffect(() => {
    const checkCompatibility = () => {
      const supportsFileSystemAPI = 'showDirectoryPicker' in window;
      const isSecureContext = window.isSecureContext;
      
      // Detectar el navegador
      const userAgent = navigator.userAgent;
      let browserName = 'Unknown';
      
      if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browserName = 'Chrome';
      } else if (userAgent.includes('Edg')) {
        browserName = 'Edge';
      } else if (userAgent.includes('Firefox')) {
        browserName = 'Firefox';
      } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browserName = 'Safari';
      } else if (userAgent.includes('Opera')) {
        browserName = 'Opera';
      }

      const isCompatible = supportsFileSystemAPI && isSecureContext;
      
      let errorMessage: string | undefined;
      if (!supportsFileSystemAPI) {
        errorMessage = 'Tu navegador no soporta la selección de directorios. Por favor usa Chrome, Edge u Opera.';
      } else if (!isSecureContext) {
        errorMessage = 'Esta funcionalidad requiere HTTPS. Por favor accede a la página usando https://apptools.online';
      }

      setCompatibility({
        supportsFileSystemAPI,
        isSecureContext,
        browserName,
        isCompatible,
        errorMessage,
      });
    };

    checkCompatibility();
  }, []);

  return compatibility;
}