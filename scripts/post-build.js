#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Ejecutando post-build script...');

// Verificar que el directorio dist existe
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  console.error('❌ Error: Directorio dist no encontrado');
  process.exit(1);
}

// Verificar archivos críticos
const criticalFiles = ['index.html', 'CNAME', 'favicon.svg'];
for (const file of criticalFiles) {
  const filePath = path.join(distDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: Archivo crítico no encontrado: ${file}`);
    process.exit(1);
  }
  console.log(`✅ ${file} encontrado`);
}

// Verificar que los assets se generaron correctamente
const assetsDir = path.join(distDir, 'assets');
if (!fs.existsSync(assetsDir)) {
  console.error('❌ Error: Directorio assets no encontrado');
  process.exit(1);
}

const assets = fs.readdirSync(assetsDir);
console.log(`✅ Directorio assets encontrado con ${assets.length} archivos`);

// Verificar que el CNAME tiene el dominio correcto
const cnamePath = path.join(distDir, 'CNAME');
const cnameContent = fs.readFileSync(cnamePath, 'utf8').trim();
if (cnameContent !== 'apptools.online') {
  console.error(`❌ Error: CNAME contiene dominio incorrecto: ${cnameContent}`);
  process.exit(1);
}
console.log(`✅ CNAME configurado correctamente: ${cnameContent}`);

console.log('🎉 Post-build script completado exitosamente');