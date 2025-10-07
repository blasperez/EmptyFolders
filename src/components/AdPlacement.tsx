import { AdBanner, AdSquare, AdVertical } from './AdSense';

interface AdPlacementProps {
  showAds?: boolean;
  adSlots?: {
    banner?: string;
    square?: string;
    vertical?: string;
  };
}

export const AdPlacement: React.FC<AdPlacementProps> = ({ 
  showAds = true, 
  adSlots = {} 
}) => {
  // Solo mostrar anuncios en producción
  if (!showAds || process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <div className="ad-placement">
      {/* Banner superior */}
      {adSlots.banner && (
        <div className="mb-6 flex justify-center">
          <AdBanner adSlot={adSlots.banner} />
        </div>
      )}

      {/* Anuncio cuadrado en el contenido */}
      {adSlots.square && (
        <div className="my-6 flex justify-center">
          <AdSquare adSlot={adSlots.square} />
        </div>
      )}

      {/* Anuncio vertical lateral */}
      {adSlots.vertical && (
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 hidden lg:block">
          <AdVertical adSlot={adSlots.vertical} />
        </div>
      )}
    </div>
  );
};

// Componente para anuncios entre contenido
export const AdBetweenContent: React.FC<{ adSlot: string }> = ({ adSlot }) => (
  <div className="my-8 flex justify-center">
    <AdBanner adSlot={adSlot} />
  </div>
);

// Componente para anuncios en el footer
export const AdFooter: React.FC<{ adSlot: string }> = ({ adSlot }) => (
  <div className="mt-8 pt-6 border-t border-slate-200">
    <div className="flex justify-center">
      <AdBanner adSlot={adSlot} />
    </div>
  </div>
);