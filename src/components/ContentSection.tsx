import { FileQuestion, Shield, Zap, HardDrive } from 'lucide-react';

export function ContentSection() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
      {/* SEO-friendly content */}
      <article className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-blue-600" />
            ¿Qué son las carpetas vacías y por qué ocupan espacio?
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Las <strong>carpetas vacías</strong> son directorios en tu sistema de archivos que no contienen ningún archivo.
            Aunque técnicamente ocupan muy poco espacio en disco, su acumulación puede generar desorganización y ralentizar
            la navegación por tus archivos. Nuestro limpiador de carpetas vacías te permite identificar y eliminar estos
            directorios de forma segura y recursiva.
          </p>
          <p className="text-slate-700 leading-relaxed">
            Con <strong>AppTools.online</strong>, puedes mantener tu sistema de archivos limpio y organizado. Esta herramienta
            es especialmente útil después de desinstalar aplicaciones, mover grandes cantidades de archivos o realizar
            migraciones de datos.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-green-600" />
            Características principales
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-slate-800 mb-2">Limpieza recursiva</h3>
              <p className="text-sm text-slate-700">
                Analiza todas las subcarpetas de forma automática, detectando carpetas vacías en cualquier nivel de profundidad.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-slate-800 mb-2">Eliminación de duplicados</h3>
              <p className="text-sm text-slate-700">
                Encuentra archivos duplicados por hash SHA-256 y libera espacio eliminando copias innecesarias.
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold text-slate-800 mb-2">Liberación de espacio</h3>
              <p className="text-sm text-slate-700">
                Elimina archivos temporales, cachés y basura del sistema como lo haría CCleaner, pero desde tu navegador.
              </p>
            </div>
            <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
              <h3 className="font-semibold text-slate-800 mb-2">100% seguro y privado</h3>
              <p className="text-sm text-slate-700">
                Todo se procesa en tu navegador. No se suben archivos a servidores externos. Tu privacidad está garantizada.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileQuestion className="w-6 h-6 text-purple-600" />
            Preguntas frecuentes (FAQ)
          </h2>

          <div className="space-y-4">
            <details className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <summary className="font-semibold text-slate-800 cursor-pointer">
                ¿Es seguro usar esta herramienta?
              </summary>
              <p className="text-sm text-slate-700 mt-2">
                Sí, completamente seguro. La herramienta utiliza la File System Access API de tu navegador,
                que requiere permisos explícitos del usuario. No se envían datos a servidores externos, todo
                el procesamiento se realiza localmente en tu navegador.
              </p>
            </details>

            <details className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <summary className="font-semibold text-slate-800 cursor-pointer">
                ¿Qué navegadores y sistemas operativos son compatibles?
              </summary>
              <p className="text-sm text-slate-700 mt-2">
                <strong>Compatible con sistemas de escritorio:</strong>
              </p>
              <ul className="text-sm text-slate-700 mt-2 ml-4 list-disc">
                <li><strong>Windows:</strong> Chrome 86+, Edge 86+, Opera 72+</li>
                <li><strong>macOS:</strong> Chrome 86+, Edge 86+, Opera 72+</li>
                <li><strong>Linux:</strong> Chrome 86+, Opera 72+</li>
              </ul>
              <p className="text-sm text-slate-700 mt-2">
                <strong>⚠️ No compatible con dispositivos móviles</strong> (Android, iOS) ya que la File System Access API
                no está disponible en navegadores móviles por razones de seguridad. El sitio debe accederse mediante HTTPS.
              </p>
            </details>

            <details className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <summary className="font-semibold text-slate-800 cursor-pointer">
                ¿Puedo recuperar carpetas eliminadas?
              </summary>
              <p className="text-sm text-slate-700 mt-2">
                La eliminación es permanente. Sin embargo, antes de eliminar cualquier elemento, la herramienta
                muestra una lista completa de lo que se va a eliminar para que puedas revisar. Recomendamos
                hacer una copia de seguridad de datos importantes antes de realizar limpiezas masivas.
              </p>
            </details>

            <details className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <summary className="font-semibold text-slate-800 cursor-pointer">
                ¿Cuánto espacio puedo liberar?
              </summary>
              <p className="text-sm text-slate-700 mt-2">
                Depende del estado de tu sistema. Las carpetas vacías ocupan espacio mínimo, pero la herramienta
                de eliminación de duplicados y limpieza de archivos basura puede liberar desde varios MB hasta
                varios GB, especialmente en sistemas que no han sido limpiados recientemente.
              </p>
            </details>

            <details className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <summary className="font-semibold text-slate-800 cursor-pointer">
                ¿Cómo funciona la detección de duplicados?
              </summary>
              <p className="text-sm text-slate-700 mt-2">
                Utilizamos el algoritmo SHA-256 para calcular un hash único de cada archivo. Si dos archivos
                tienen el mismo hash, son idénticos byte por byte, incluso si tienen nombres diferentes.
                Esto garantiza una detección precisa sin falsos positivos.
              </p>
            </details>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Privacidad y seguridad
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            En <strong>AppTools.online</strong> tomamos muy en serio tu privacidad:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700">
            <li>No almacenamos ninguno de tus archivos en nuestros servidores</li>
            <li>Todo el procesamiento ocurre localmente en tu navegador</li>
            <li>No recopilamos información personal identificable</li>
            <li>Utilizamos análisis anónimos solo para mejorar la experiencia del usuario</li>
            <li>El código es transparente y se ejecuta completamente del lado del cliente</li>
          </ul>
        </section>

        <section className="mb-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Cómo usar el limpiador de carpetas vacías
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-slate-700">
            <li className="font-medium">
              Haz clic en el botón <strong>"Seleccionar Directorio"</strong> en la herramienta que desees usar
            </li>
            <li className="font-medium">
              Otorga permisos de lectura y escritura a la carpeta que deseas analizar
            </li>
            <li className="font-medium">
              Espera a que la herramienta termine el análisis (verás una barra de progreso)
            </li>
            <li className="font-medium">
              Revisa los resultados y selecciona los elementos que deseas eliminar
            </li>
            <li className="font-medium">
              Confirma la eliminación y libera espacio en tu disco
            </li>
          </ol>
          <p className="text-sm text-slate-600 mt-4 italic">
            Importante: No cierres la ventana del navegador mientras la herramienta está trabajando,
            especialmente durante el proceso de eliminación.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Beneficios de mantener tu sistema limpio
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Mantener un sistema de archivos ordenado y sin duplicados ni basura ofrece múltiples beneficios:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
            <li>Mejora el rendimiento de tu sistema operativo</li>
            <li>Reduce el tiempo de búsqueda de archivos</li>
            <li>Libera espacio en disco para nuevos proyectos</li>
            <li>Facilita las copias de seguridad al reducir el tamaño total</li>
            <li>Mejora la organización y productividad</li>
          </ul>
          <p className="text-slate-700 leading-relaxed">
            Te recomendamos realizar una limpieza completa de tu sistema al menos una vez al mes usando nuestras
            tres herramientas: limpiador de carpetas vacías, eliminador de duplicados y liberador de espacio.
          </p>
        </section>
      </article>
    </div>
  );
}
