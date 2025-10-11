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
        if (browserName === 'Firefox' || browserName === 'Safari') {
          errorMessage = `${browserName} no soporta la API de selección de directorios. Por favor usa Chrome, Edge u Opera.`;
        } else {
          errorMessage = 'Tu navegador no soporta la selección de directorios. Por favor usa Chrome 86+, Edge 86+ u Opera 72+.';
        }
      } else if (!isSecureContext) {
        errorMessage = '⚠️ Debes acceder al sitio usando HTTPS. Redirigiendo a https://apptools.online...';
        // Intentar redirigir automáticamente
        if (window.location.protocol === 'http:') {
          setTimeout(() => {
            window.location.replace('https:' + window.location.href.substring(window.location.protocol.length));
          }, 2000);
        }
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