# SoundSpot

SoundSpot es una SPA (Single Page Application) hecha con Vue 3 que permite buscar y explorar
conciertos y funciones musicales próximas, usando datos reales de la
[API de Ticketmaster Discovery](https://developer.ticketmaster.com/).

Es un proyecto de la materia Programación Multimedial II (UMAI).

## Funcionalidades

- **Búsqueda de conciertos** por país, ciudad, artista, género, mes, año y rango de precio,
  cada filtro con su opción general ("todos/as") y las opciones de ciudad/artista/género
  calculadas a partir de los eventos ya cargados para el país elegido.
- **Ordenar por cercanía**: usando la geolocalización del navegador, ordena los resultados
  por distancia a la ubicación del usuario (fórmula de Haversine).
- **Detalle del concierto**: mapa interactivo (Leaflet + OpenStreetMap) con la ubicación del
  evento, enlace directo para comprar entradas y botón para agregar el evento al calendario
  (descarga un archivo `.ics`).
- **"Me interesa" / "Asistiré"**: marcar eventos favoritos, guardados en `localStorage` y
  visibles en la sección "Mis Eventos".
- **Carga progresiva** ("Cargar más") para no renderizar de una sola vez todos los resultados
  encontrados.

## Stack

Vue 3 (Composition API) + Vite, Pinia para el estado global, Vue Router, Bootstrap 5 para los
estilos base y Leaflet para el mapa.

## Project Setup

```sh
npm install
```

### Configurar la API de Ticketmaster

La app consume la [API de Ticketmaster Discovery](https://developer.ticketmaster.com/), pero el
frontend nunca le pega directo: pasa por una función serverless propia
(`api/eventos.js`, pensada para desplegarse en Vercel) que guarda la clave del
lado del servidor y nunca la expone en el navegador.

1. Copiá `.env.example` a `.env.local`.
2. Completá `TM_API_KEY` con tu clave (se consigue gratis registrándote en el portal de Ticketmaster).

`.env.local` no se sube al repositorio (está en `.gitignore`), así que cada persona que clone el
proyecto usa su propia clave. Ojo: la variable **no** lleva el prefijo `VITE_` a propósito, porque
solo la necesita la función serverless, no el código del navegador.

### Desarrollo local

```sh
npm run dev
```

Alcanza con esto. `vite.config.js` incluye un plugin que simula `/api/eventos` (el mismo handler de
`api/eventos.js`) mientras desarrollás, así que la búsqueda de conciertos funciona igual que en
producción sin depender de ninguna herramienta extra.

Si en algún momento querés probar el setup real de Vercel antes de desplegar (funciones serverless
de verdad, los rewrites de `vercel.json`, etc.), podés usar:

```sh
npm run dev:full
```

Esto corre `vercel dev` ([CLI de Vercel](https://vercel.com/docs/cli)); la primera vez te va a pedir
loguearte y vincular el proyecto a tu cuenta.

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Despliegue en Vercel

1. Importá el repositorio en Vercel (detecta Vite automáticamente, no hace falta configurar nada
   del build).
2. En **Settings → Environment Variables** del proyecto, agregá `TM_API_KEY` con tu clave de
   Ticketmaster. Esa variable solo la lee `api/eventos.js` en el servidor.
3. `vercel.json` ya incluye el rewrite necesario para que las rutas de Vue Router
   (`/concierto/:id`, `/mis-eventos`) funcionen al entrar por URL directa o al refrescar la página,
   en vez de devolver 404.
