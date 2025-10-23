import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

// Acá creo la instancia del router
const router = createRouter({
  // Uso createWebHistory para tener URLs limpias (sin el # hash)
  history: createWebHistory(import.meta.env.BASE_URL),

  // Defino las rutas (páginas) de mi aplicación
  routes: [
    {
      path: '/', // La ruta raíz
      name: 'inicio', // Le doy un nombre a la ruta
      component: HomeView // El componente que se debe mostrar en esta ruta
    },
    {
      // Esta es una ruta dinámica. El ':id' significa que recibirá un parámetro
      // que cambiará según el concierto que quiera ver el usuario.
      path: '/concierto/:id',
      name: 'detalle-concierto',

      // Esto es 'lazy loading' (carga diferida).
      // El componente ConcertDetailView.vue no se cargará hasta que
      // yo no visite esta ruta. Esto hace que la carga inicial de la app sea más rápida.
      component: () => import('../views/ConcertDetailView.vue')
    }
  ]
})

export default router