# Configuración SSL en GitHub Pages

## Pasos para Activar el Certificado SSL

### 1. En tu Repositorio de GitHub:

1. Ve a https://github.com/blasperez/EmptyFolders
2. Click en **Settings** (Configuración)
3. En el menú lateral, busca **Pages**

### 2. Configuración de Pages:

En la sección de Pages, verifica:

1. **Source**: GitHub Actions (IMPORTANTE: NO uses "Deploy from a branch")
2. **Custom domain**: 
   - Si no está, escribe: `apptools.online`
   - Click en "Save"
   
**NOTA IMPORTANTE**: Este proyecto USA React + TypeScript + Vite, por lo que NECESITA GitHub Actions para compilar el código. Si usas "Deploy from a branch" NO funcionará porque serviría archivos .tsx sin compilar.

### 3. Proceso de Verificación DNS:

Después de agregar el dominio personalizado:

1. GitHub comenzará a verificar los DNS
2. Verás un mensaje: "DNS check in progress..."
3. Esto puede tardar hasta 24 horas
4. Cuando termine, verás: "✅ DNS check successful"

### 4. Activar HTTPS (IMPORTANTE):

Una vez que el DNS check sea exitoso:

1. Aparecerá una casilla: **"Enforce HTTPS"**
2. **MARCA ESTA CASILLA** ✅
3. Si no aparece inmediatamente:
   - Espera que termine la verificación DNS
   - Refresca la página
   - La casilla aparecerá cuando el certificado SSL esté listo

## ⚠️ Solución de Problemas Comunes

### Si ves "DNS check unsuccessful":

1. Verifica que los registros DNS en GoDaddy estén correctos
2. Espera al menos 1 hora para la propagación DNS
3. Quita y vuelve a agregar el dominio personalizado en GitHub Pages

### Si no aparece la opción "Enforce HTTPS":

1. El certificado SSL aún se está generando (puede tardar hasta 24 horas)
2. Los DNS no están configurados correctamente
3. Hay un conflicto con registros DNS antiguos

### Si aparece advertencia de certificado en el navegador:

1. Verifica que estés accediendo a `apptools.online` (sin www)
2. Limpia la caché del navegador (Ctrl+Shift+Del)
3. Verifica que "Enforce HTTPS" esté activado en GitHub Pages

## 🔍 Verificar el Estado del Certificado

### En Chrome/Edge:
1. Accede a https://apptools.online
2. Click en el candado en la barra de direcciones
3. Click en "La conexión es segura"
4. Click en "El certificado es válido"
5. Deberías ver un certificado emitido por Let's Encrypt o DigiCert

### Herramientas Online:
- https://www.sslshopper.com/ssl-checker.html#hostname=apptools.online
- https://www.ssllabs.com/ssltest/analyze.html?d=apptools.online

## 📅 Tiempos de Espera Típicos:

- **Verificación DNS**: 5 minutos a 1 hora
- **Generación de Certificado SSL**: 15 minutos a 24 horas
- **Activación completa**: Normalmente menos de 1 hora, máximo 24 horas

## 🚨 IMPORTANTE:

- **NUNCA** necesitas comprar un certificado SSL para GitHub Pages
- GitHub proporciona certificados SSL **GRATIS** automáticamente
- Solo necesitas configurar los DNS correctamente y esperar