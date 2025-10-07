// Configuración de Google AdSense
export const ADSENSE_CONFIG = {
  // Reemplaza con tu Client ID real de AdSense
  CLIENT_ID: 'ca-pub-TU_CLIENT_ID_AQUI',
  
  // IDs de los slots de anuncios (reemplaza con los tuyos)
  AD_SLOTS: {
    BANNER_TOP: '1234567890',
    BANNER_BOTTOM: '1234567891', 
    INLINE_CONTENT: '1234567892',
    SIDEBAR: '1234567893'
  },
  
  // Configuración de anuncios
  AD_SETTINGS: {
    // Habilitar anuncios solo en producción
    ENABLED: process.env.NODE_ENV === 'production',
    
    // Configuración de anuncios responsivos
    RESPONSIVE: true,
    
    // Límite de anuncios por página
    MAX_ADS_PER_PAGE: 3
  }
};

// Función para verificar si AdSense está habilitado
export const isAdSenseEnabled = (): boolean => {
  return ADSENSE_CONFIG.AD_SETTINGS.ENABLED;
};

// Función para obtener el Client ID
export const getAdSenseClientId = (): string => {
  return ADSENSE_CONFIG.CLIENT_ID;
};