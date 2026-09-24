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

La app consume la [API de Ticketmaster Discovery](https://developer.ticketmaster.com/) y necesita una API key propia:

1. Copiá `.env.example` a `.env.local`.
2. Completá `VITE_TM_API_KEY` con tu clave (se consigue gratis registrándote en el portal de Ticketmaster).

`.env.local` no se sube al repositorio (está en `.gitignore`), así que cada persona que clone el proyecto usa su propia clave.

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
