# Compatibilidad del Navegador - Limpiador de Carpetas Vacías

## Error: `window.showDirectoryPicker is not a function`

Este error ocurre cuando el navegador no soporta la **File System Access API** o cuando la página no se está ejecutando en un contexto seguro.

## Solución Implementada

### 1. Verificación de Compatibilidad
- ✅ Detección automática del navegador
- ✅ Verificación de soporte para `showDirectoryPicker`
- ✅ Verificación de contexto seguro (HTTPS)
- ✅ Mensajes de error específicos y útiles

### 2. Navegadores Compatibles
- **Chrome 86+** ✅
- **Edge 86+** ✅  
- **Opera 72+** ✅

### 3. Navegadores NO Compatibles
- **Firefox** ❌
- **Safari** ❌
- **Internet Explorer** ❌

## Requisitos Técnicos

### Contexto Seguro
La aplicación debe ejecutarse en un contexto seguro:
- ✅ `https://apptools.online` (tu dominio)
- ✅ `http://localhost` (desarrollo local)
- ❌ `http://` en dominios públicos

### Permisos del Navegador
El usuario debe otorgar permisos para:
- Leer el directorio seleccionado
- Escribir/eliminar carpetas vacías

## Mensajes de Error Mejorados

### Navegador No Compatible
```
Tu navegador no soporta la selección de directorios. 
Por favor usa Chrome, Edge u Opera.
```

### Contexto No Seguro
```
Esta funcionalidad requiere HTTPS. 
Por favor accede a la página usando https://apptools.online
```

### Permisos Denegados
```
Permisos denegados. 
Por favor permite el acceso al directorio.
```

## Detección Automática

La aplicación ahora detecta automáticamente:
- Tipo de navegador
- Soporte para File System Access API
- Contexto seguro (HTTPS)
- Estado de compatibilidad general

## Recomendaciones para Usuarios

1. **Usar navegadores compatibles**: Chrome, Edge u Opera
2. **Acceder vía HTTPS**: `https://apptools.online`
3. **Permitir permisos**: Cuando el navegador lo solicite
4. **Actualizar navegador**: Usar versiones recientes

## Desarrollo Local

Para desarrollo local, la aplicación funciona en:
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173`
- Cualquier puerto local

## Testing

Para probar la funcionalidad:
1. Abre `https://apptools.online` en Chrome/Edge/Opera
2. Haz clic en "Seleccionar Directorio"
3. Elige una carpeta con subcarpetas vacías
4. Verifica que se eliminen las carpetas vacías