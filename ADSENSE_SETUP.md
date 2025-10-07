# Configuración de Google AdSense

## Pasos para configurar AdSense en tu proyecto

### 1. Crear cuenta de Google AdSense
1. Ve a [Google AdSense](https://www.google.com/adsense/)
2. Crea una cuenta con tu dominio personalizado
3. Completa el proceso de verificación
4. Espera la aprobación (puede tomar varios días)

### 2. Obtener tu Client ID
1. Una vez aprobado, ve a tu panel de AdSense
2. Ve a "Anuncios" > "Por unidad de anuncio"
3. Crea nuevas unidades de anuncio
4. Copia tu Client ID (formato: ca-pub-XXXXXXXXXX)

### 3. Configurar el proyecto

#### Actualizar configuración:
Edita `/src/config/adsense.ts`:
```typescript
export const ADSENSE_CONFIG = {
  CLIENT_ID: 'ca-pub-TU_CLIENT_ID_REAL', // Reemplaza con tu ID real
  AD_SLOTS: {
    BANNER_TOP: 'TU_SLOT_ID_1',
    BANNER_BOTTOM: 'TU_SLOT_ID_2', 
    INLINE_CONTENT: 'TU_SLOT_ID_3',
    SIDEBAR: 'TU_SLOT_ID_4'
  }
};
```

#### Actualizar HTML:
Edita `/index.html` y reemplaza:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-TU_CLIENT_ID_REAL"
        crossorigin="anonymous"></script>
```

### 4. Desplegar en GitHub Pages

#### Opción A: Con dominio personalizado (Recomendado)
1. Compra un dominio (ej: tu-dominio.com)
2. Configura DNS para apuntar a GitHub Pages
3. En GitHub, ve a Settings > Pages > Custom domain
4. Añade tu dominio personalizado

#### Opción B: Sin dominio personalizado
- AdSense puede rechazar sitios en subdominios de github.io
- Considera usar un dominio personalizado para mejor aprobación

### 5. Verificar implementación
1. Despliega tu sitio
2. Verifica que los anuncios aparezcan
3. Usa las herramientas de AdSense para verificar el código
4. Monitorea el rendimiento en tu panel de AdSense

## Estructura de anuncios implementada

- **Banner superior**: Anuncio horizontal en la parte superior
- **Anuncio inline**: Después del botón principal
- **Anuncio inferior**: Al final de la página

## Consideraciones importantes

### Requisitos de AdSense:
- ✅ Contenido original y de calidad
- ✅ Tráfico regular de visitantes
- ✅ Dominio personalizado (recomendado)
- ✅ Política de privacidad
- ✅ Términos de servicio

### Optimización de ingresos:
- Coloca anuncios en posiciones visibles
- No satures la página con anuncios
- Mantén un buen balance contenido/anuncios
- Monitorea el rendimiento regularmente

### Cumplimiento:
- Asegúrate de cumplir con las políticas de AdSense
- No hagas clic en tus propios anuncios
- Mantén contenido apropiado
- Respeta las directrices de Google

## Troubleshooting

### Los anuncios no aparecen:
1. Verifica que el Client ID sea correcto
2. Asegúrate de estar en producción (no en desarrollo)
3. Verifica que el sitio esté desplegado
4. Revisa la consola del navegador por errores

### AdSense no aprueba:
1. Asegúrate de tener contenido original
2. Verifica que el sitio esté completamente funcional
3. Añade una política de privacidad
4. Genera tráfico orgánico antes de aplicar

## Monitoreo de ingresos

Una vez configurado:
1. Revisa regularmente tu panel de AdSense
2. Monitorea métricas como RPM (Revenue Per Mille)
3. Ajusta la posición de anuncios según el rendimiento
4. Considera A/B testing para optimizar

¡Buena suerte con tu monetización! 🚀