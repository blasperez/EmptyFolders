import { useEffect } from 'react';
import { ADSENSE_CONFIG, isAdSenseEnabled, getAdSenseClientId } from '../config/adsense';

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
    if (!isAdSenseEnabled()) return;
    
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('Error loading AdSense:', error);
    }
  }, []);

  // No mostrar anuncios en desarrollo
  if (!isAdSenseEnabled()) {
    return (
      <div className={`adsense-placeholder ${className}`} style={adStyle}>
        <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-500 text-sm">
          [Anuncio AdSense - Solo visible en producción]
        </div>
      </div>
    );
  }

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client={getAdSenseClientId()}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

// Componentes predefinidos para diferentes tipos de anuncios
export const BannerAd: React.FC<{ className?: string }> = ({ className }) => (
  <AdSense 
    adSlot={ADSENSE_CONFIG.AD_SLOTS.BANNER_TOP} 
    adFormat="horizontal"
    className={`w-full h-32 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg ${className}`}
    adStyle={{ display: 'block', width: '100%', height: '100px' }}
  />
);

export const SidebarAd: React.FC<{ className?: string }> = ({ className }) => (
  <AdSense 
    adSlot={ADSENSE_CONFIG.AD_SLOTS.SIDEBAR} 
    adFormat="vertical"
    className={`w-48 h-96 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg ${className}`}
    adStyle={{ display: 'block', width: '200px', height: '400px' }}
  />
);

export const InlineAd: React.FC<{ className?: string }> = ({ className }) => (
  <AdSense 
    adSlot={ADSENSE_CONFIG.AD_SLOTS.INLINE_CONTENT} 
    adFormat="rectangle"
    className={`w-full max-w-md mx-auto flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg ${className}`}
    adStyle={{ display: 'block', width: '100%', height: '250px' }}
  />
);