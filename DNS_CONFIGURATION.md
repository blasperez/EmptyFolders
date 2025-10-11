# Configuración DNS para apptools.online en GoDaddy

## Opción A: Usando registros A (RECOMENDADO)

En el panel de GoDaddy, configura estos registros:

### Registros A
Elimina cualquier registro A existente y agrega estos 4:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | @ | 185.199.108.153 | 600 |
| A | @ | 185.199.109.153 | 600 |
| A | @ | 185.199.110.153 | 600 |
| A | @ | 185.199.111.153 | 600 |

### Registro CNAME para www (opcional)
| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| CNAME | www | blasperez.github.io | 3600 |

## Opción B: Usando CNAME (alternativa)

Si prefieres usar CNAME:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| CNAME | @ | blasperez.github.io | 3600 |
| CNAME | www | blasperez.github.io | 3600 |

**Nota**: Algunos proveedores DNS no permiten CNAME en el registro raíz (@). Si es el caso, usa la Opción A.

## Pasos en GoDaddy:

1. Inicia sesión en tu cuenta de GoDaddy
2. Ve a "Mis productos" → "DNS" del dominio apptools.online
3. Elimina todos los registros A existentes
4. Agrega los 4 registros A mostrados arriba
5. Guarda los cambios

## Tiempo de Propagación:

- Los cambios DNS pueden tardar de 5 minutos a 48 horas en propagarse
- Normalmente toma entre 15-30 minutos

## Verificar la Propagación:

Puedes verificar si los DNS se han propagado usando:
- https://dnschecker.org/#A/apptools.online
- https://www.whatsmydns.net/#A/apptools.online

Los registros A deben mostrar las IPs de GitHub Pages (185.199.108-111.153)