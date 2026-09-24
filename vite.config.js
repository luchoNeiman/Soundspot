import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// En producción, /api/eventos lo sirve Vercel como función serverless
// (ver api/eventos.js). "vite dev" no sabe ejecutar esa carpeta, así que
// este plugin intercepta esa misma ruta durante el desarrollo y corre el
// mismo handler acá adentro, para no depender de "vercel dev" (que pide
// login) solo para poder ver los conciertos en local.
function apiEventosDevMiddleware() {
  return {
    name: 'api-eventos-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        if (url.pathname !== '/api/eventos') {
          next()
          return
        }

        try {
          const { default: handler } = await server.ssrLoadModule('/api/eventos.js')
          req.query = Object.fromEntries(url.searchParams)
          res.status = (codigo) => {
            res.statusCode = codigo
            return res
          }
          res.json = (cuerpo) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(cuerpo))
          }
          await handler(req, res)
        } catch (error) {
          console.error('Error simulando /api/eventos en desarrollo:', error)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Error interno simulando la función serverless en desarrollo.' }))
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // api/eventos.js lee process.env.TM_API_KEY (no import.meta.env), igual
  // que en Vercel: hay que copiarla a mano desde lo que Vite leyó de .env.local.
  if (env.TM_API_KEY) process.env.TM_API_KEY = env.TM_API_KEY

  return {
    plugins: [
      vue(),
      vueDevTools(),
      apiEventosDevMiddleware(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  }
})
