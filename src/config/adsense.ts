// Configuración de Google AdSense
export const ADSENSE_CONFIG = {
  // Reemplaza con tu Publisher ID de AdSense
  PUBLISHER_ID: 'ca-pub-XXXXXXXXXXXXXXXX',
  
  // Reemplaza con tus Ad Slots reales
  AD_SLOTS: {
    BANNER_TOP: '1234567890',      // Banner superior
    BANNER_BOTTOM: '0987654321',   // Banner inferior
    SQUARE: '1122334455',          // Anuncio cuadrado
    VERTICAL: '5544332211',        // Anuncio vertical
  },
  
  // Configuración de anuncios
  AD_SETTINGS: {
    ENABLED: process.env.NODE_ENV === 'production', // Solo en producción
    AUTO_ADS: false, // Desactivar auto ads para control manual
    RESPONSIVE: true,
    FORMAT: 'auto' as const,
  },
  
  // Estilos personalizados
  STYLES: {
    BANNER: {
      display: 'block',
      width: '100%',
      height: '90px',
      margin: '20px 0',
    },
    SQUARE: {
      display: 'block',
      width: '300px',
      height: '250px',
      margin: '20px auto',
    },
    VERTICAL: {
      display: 'block',
      width: '160px',
      height: '600px',
      margin: '20px 0',
    },
  },
  
  // Posiciones de anuncios
  PLACEMENTS: {
    HEADER: true,      // Anuncio en el header
    BETWEEN_CONTENT: true, // Entre contenido
    FOOTER: true,      // Anuncio en footer
    SIDEBAR: false,    // Anuncio lateral (solo desktop)
  },
};

// Función para obtener configuración de anuncio
export const getAdConfig = (type: keyof typeof ADSENSE_CONFIG.AD_SLOTS) => ({
  publisherId: ADSENSE_CONFIG.PUBLISHER_ID,
  adSlot: ADSENSE_CONFIG.AD_SLOTS[type],
  style: ADSENSE_CONFIG.STYLES[type.toUpperCase() as keyof typeof ADSENSE_CONFIG.STYLES],
  enabled: ADSENSE_CONFIG.AD_SETTINGS.ENABLED,
});

// Función para verificar si AdSense está configurado
export const isAdSenseConfigured = (): boolean => {
  return ADSENSE_CONFIG.PUBLISHER_ID !== 'ca-pub-XXXXXXXXXXXXXXXX' &&
         ADSENSE_CONFIG.AD_SLOTS.BANNER_TOP !== '1234567890';
};

// Función para obtener el script de AdSense
export const getAdSenseScript = (): string => {
  return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.PUBLISHER_ID}`;
};