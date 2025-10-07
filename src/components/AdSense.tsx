import { useEffect } from 'react';
import { ADSENSE_CONFIG, getAdSenseScript } from '../config/adsense';

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  adStyle?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const AdSense: React.FC<AdSenseProps> = ({
  adSlot,
  adFormat = 'auto',
  adStyle = { display: 'block' },
  className = ''
}) => {
  useEffect(() => {
    // Solo cargar AdSense si está habilitado
    if (!ADSENSE_CONFIG.AD_SETTINGS.ENABLED) {
      return;
    }

    try {
      // Cargar el script de AdSense si no está cargado
      if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
        const script = document.createElement('script');
        script.async = true;
        script.src = getAdSenseScript();
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }

      // Inicializar el anuncio
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('Error loading AdSense:', error);
    }
  }, []);

  // No mostrar anuncios si no está configurado o habilitado
  if (!ADSENSE_CONFIG.AD_SETTINGS.ENABLED) {
    return null;
  }

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client={ADSENSE_CONFIG.PUBLISHER_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={ADSENSE_CONFIG.AD_SETTINGS.RESPONSIVE.toString()}
      />
    </div>
  );
};

// Componente para banner horizontal
export const AdBanner: React.FC<{ adSlot: string; className?: string }> = ({ 
  adSlot, 
  className = '' 
}) => (
  <AdSense
    adSlot={adSlot}
    adFormat="horizontal"
    adStyle={{ display: 'block', width: '100%', height: '90px' }}
    className={`ad-banner ${className}`}
  />
);

// Componente para anuncio cuadrado
export const AdSquare: React.FC<{ adSlot: string; className?: string }> = ({ 
  adSlot, 
  className = '' 
}) => (
  <AdSense
    adSlot={adSlot}
    adFormat="rectangle"
    adStyle={{ display: 'block', width: '300px', height: '250px' }}
    className={`ad-square ${className}`}
  />
);

// Componente para anuncio vertical
export const AdVertical: React.FC<{ adSlot: string; className?: string }> = ({ 
  adSlot, 
  className = '' 
}) => (
  <AdSense
    adSlot={adSlot}
    adFormat="vertical"
    adStyle={{ display: 'block', width: '160px', height: '600px' }}
    className={`ad-vertical ${className}`}
  />
);