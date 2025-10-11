# Guía de Deployment - Limpiador de Carpetas Vacías

## Configuración del Dominio Personalizado

Tu aplicación está configurada para funcionar con el dominio personalizado `apptools.online` en GitHub Pages.

### Archivos de Configuración

1. **vite.config.ts**: Configurado con `base: '/'` para servir assets desde la raíz del dominio
2. **public/CNAME**: Contiene `apptools.online` para configurar el dominio personalizado
3. **public/404.html**: Página de error que redirige a la SPA principal
4. **.github/workflows/deploy.yml**: Workflow de GitHub Actions para deployment automático

### Pasos para el Deployment

1. **Hacer commit y push de los cambios**:
   ```bash
   git add .
   git commit -m "Fix: Configurar dominio personalizado para apptools.online"
   git push origin main
   ```

2. **Verificar el deployment**:
   - Ve a tu repositorio en GitHub
   - Navega a Settings > Pages
   - Verifica que el dominio personalizado esté configurado como `apptools.online`
   - El deployment se ejecutará automáticamente

3. **Configuración en GoDaddy**:
   - Asegúrate de que tu dominio `apptools.online` apunte a GitHub Pages
   - Los registros DNS deben apuntar a `username.github.io` (donde `username` es tu nombre de usuario de GitHub)

### Verificación Post-Deployment

Una vez desplegado, verifica que:
- ✅ La página carga correctamente en `http://apptools.online`
- ✅ Los assets se cargan desde `/assets/` (no desde `/EmptyFolders/assets/`)
- ✅ El favicon se muestra correctamente
- ✅ No hay errores 404 en la consola del navegador

### Solución de Problemas

Si la página sigue mostrando errores 404:

1. **Verifica la configuración del dominio en GitHub Pages**:
   - Ve a Settings > Pages
   - En "Custom domain", debe aparecer `apptools.online`
   - Debe mostrar "✓ DNS check successful"

2. **Limpia la caché del navegador**:
   - Ctrl+F5 o Cmd+Shift+R para forzar la recarga

3. **Verifica los archivos generados**:
   ```bash
   npm run build
   ls -la dist/
   cat dist/CNAME
   ```

### Estructura de Archivos Importantes

```
dist/
├── index.html          # Página principal
├── CNAME              # Configuración del dominio personalizado
├── favicon.svg        # Icono del sitio
├── 404.html           # Página de error personalizada
└── assets/
    ├── index-*.js     # JavaScript de la aplicación
    └── index-*.css    # Estilos CSS
```

### Comandos Útiles

- `npm run build`: Construir la aplicación para producción
- `npm run dev`: Ejecutar en modo desarrollo
- `npm run preview`: Previsualizar el build localmente