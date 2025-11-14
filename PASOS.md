# Pasos para iniciar y actualizar el proyecto

Este checklist resume lo que debes hacer cada vez que inicias a trabajar en la web y cuando realizas cambios.

## Requisitos previos
- Node.js 18+ y `npm` instalados.
- Acceso al proyecto y, si aplica, a credenciales/variables de entorno.

## Inicio rápido (primera vez o al retomar)
1. Instalar dependencias: `npm install`
2. Levantar entorno de desarrollo: `npm run dev`
3. Abrir en el navegador: `http://localhost:5173`
4. Verifica que no haya errores en la terminal ni en la consola del navegador.

## Al hacer cambios
- Edita el código en `src/` (JS/React/CSS) y los estáticos en `public/` (imágenes, videos y algunas páginas HTML).
- Con `npm run dev` activo, los cambios recargan automáticamente (HMR).
- Revisa la terminal (Vite) y la consola del navegador por errores.
- Si cambias recursos estáticos (imágenes/videos), fuerza recarga del navegador si no se actualizan (Ctrl/Cmd+Shift+R).

## Compilar y probar producción
1. Construir: `npm run build` (genera la carpeta `dist/`).
2. Probar el build localmente: `npm run preview`.
3. Publicar: sube el contenido de `dist/` a tu hosting/CDN.

## Supabase (datos y autenticación)
- El cliente está configurado en `src/js/database.js`.
- Si cambias URL/keys, reinicia el servidor de desarrollo y vuelve a construir para producción.
- Recomendado: mover credenciales a variables de entorno Vite (más seguro):
  - Crea un archivo `.env` con: 
    - `VITE_SUPABASE_URL=...`
    - `VITE_SUPABASE_ANON_KEY=...`
  - En el código, lee con `import.meta.env.VITE_SUPABASE_URL` y `import.meta.env.VITE_SUPABASE_ANON_KEY`.

## Estructura útil del proyecto
- `index.html` → página principal servida por Vite.
- `src/main.jsx` → punto de entrada del frontend.
- `src/js/*.js` → lógica (Supabase, UI, etc.).
- `src/components/*` → componentes React.
- `src/css/*` → estilos.
- `public/assets/*` → imágenes y videos estáticos.
- `public/*.html` → páginas estáticas adicionales (por ejemplo `client-login.html`, `login.html`, `register.html`, `dashboard.html`).
- `dist/` → resultado de `npm run build` (no se edita a mano).

## Checklist antes de subir cambios
- `npm run dev` sin errores y navegación fluida.
- Verificar: inicio, productos, carrito/reservas y acceso de clientes.
- `npm run build` sin errores.
- `npm run preview` carga correctamente.
- Si publicas, subir `dist/` y limpiar caché del hosting/CDN si aplica.

## Comandos útiles
- Instalar dependencias: `npm install`
- Desarrollo: `npm run dev`
- Build producción: `npm run build`
- Previsualización estática: `npm run preview`

