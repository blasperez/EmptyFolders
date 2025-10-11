# 🔧 SOLUCIÓN: "Enforce HTTPS — Unavailable"

## 🔴 El Problema

GitHub Pages muestra:
- ✅ DNS check successful
- ❌ **Enforce HTTPS — Unavailable** porque tu dominio no está configurado correctamente para HTTPS

Esto significa que los DNS están llegando a GitHub pero **NO con las IPs correctas para SSL**.

## ✅ La Solución

### PASO 1: Verificar tus DNS actuales

Los registros DNS actuales probablemente están:
- Apuntando a IPs antiguas de GitHub (192.30.252.X)
- O usando un "Domain Parking" de GoDaddy
- O tienen configuración de redirección/forwarding

### PASO 2: Configuración en GoDaddy

#### 1. Accede a tu panel de GoDaddy
- Inicia sesión en https://godaddy.com
- Ve a "Mis productos"
- Busca `apptools.online`
- Click en "DNS"

#### 2. ELIMINA estos registros (IMPORTANTE)
- ❌ ELIMINA todos los registros tipo **A** existentes
- ❌ ELIMINA cualquier registro de **Parking**
- ❌ ELIMINA cualquier **Forwarding** o redirección
- ❌ ELIMINA registros **CNAME** para @ (si existen)

#### 3. AGREGA estos 4 registros A exactamente

| Tipo | Nombre | Datos | TTL |
|------|--------|-------|-----|
| A | @ | 185.199.108.153 | 600 segundos |
| A | @ | 185.199.109.153 | 600 segundos |
| A | @ | 185.199.110.153 | 600 segundos |
| A | @ | 185.199.111.153 | 600 segundos |

**IMPORTANTE:** 
- En "Nombre" pon solo **@** (no pongas apptools.online)
- Los 4 registros son necesarios
- NO uses las IPs antiguas (192.30.252.153/154)

#### 4. Guarda los cambios

### PASO 3: Esperar la propagación

1. Los cambios DNS tardan 15-60 minutos en propagarse
2. Puedes verificar el progreso en: https://dnschecker.org/#A/apptools.online
3. Deberías ver las 4 IPs: 185.199.108-111.153

### PASO 4: Activar HTTPS en GitHub

1. Después de 15-60 minutos, vuelve a: https://github.com/blasperez/EmptyFolders/settings/pages
2. Refresca la página (F5)
3. Ahora "Enforce HTTPS" debería estar **disponible** ✅
4. **MARCA LA CASILLA** "Enforce HTTPS"
5. GitHub generará el certificado SSL (puede tardar hasta 24h, normalmente menos de 1h)

## 🔍 Verificación

### Verifica tus DNS actuales:
```bash
nslookup apptools.online
# O en Windows:
nslookup apptools.online 8.8.8.8
```

Deberías ver:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

### Si NO ves esas IPs:
- Los DNS no se han propagado (espera más)
- La configuración en GoDaddy es incorrecta
- Hay caché DNS (prueba desde otro dispositivo/red)

## ⚠️ Errores Comunes

### ❌ "Enforce HTTPS" sigue sin aparecer después de 1 hora:

**Causa 1:** Registros DNS incorrectos
- Solución: Verifica que tengas las 4 IPs exactas

**Causa 2:** Domain Parking activo
- Solución: Desactiva cualquier "Parking" en GoDaddy

**Causa 3:** Forwarding/Redirección activa
- Solución: Elimina cualquier redirección en GoDaddy

**Causa 4:** Caché DNS
- Solución: Espera más tiempo o prueba desde otra red

### ❌ Sale advertencia de certificado al acceder:

- El certificado se está generando (espera hasta 24h)
- Accede con https:// no con http://
- Limpia caché del navegador

## 📱 Solución Alternativa Temporal

Mientras esperas, puedes:
1. Acceder desde: https://blasperez.github.io/EmptyFolders/
2. Funcionará igual pero sin tu dominio personalizado

## 🆘 Si Nada Funciona

1. En GitHub Pages, quita el dominio personalizado
2. Guarda
3. Vuelve a agregar `apptools.online`
4. Esto forzará una nueva verificación

## 📞 Soporte

- **GoDaddy**: Pueden ayudarte a configurar los registros A
- **GitHub**: https://support.github.com si el problema persiste después de 24h