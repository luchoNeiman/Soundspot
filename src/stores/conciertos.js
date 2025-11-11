import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

// API Key de Ticketmaster
const API_KEY = '5TjrtE9vOIGvZPpAZFvhODr9pyZcivHD'
// URL de la API de Ticketmaster para eventos de música en Argentina
// const API_URL = `https://app.ticketmaster.com/discovery/v2/events.json?classificationName=music&apikey=${API_KEY}`
// https://app.ticketmaster.com/discovery/v2/events.json?classificationName=music&apikey={TU_API_KEY}
const API_URL = `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=US&classificationName=music&apikey=${API_KEY}`

// https://app.ticketmaster.com/discovery/v2/events.json?countryCode=US&classificationName=music&apikey=TU_API_KEY



// Función para transformar los datos de la API a mi formato personalizado
// Esto es necesario porque la API devuelve una estructura muy anidada y con muchos datos innecesarios
// Aca extraigo solo lo que necesito y lo organizo de forma más clara
function transformarDatosApi(evento) {
  // Buscomos la imagen con mejor calidad: Prefiero las que tengan ratio 16:9 y ancho mayor a 400px
  // Si no la encuentro, uso la primera imagen disponible del evento
  const imagen = evento.images.find(img => img.ratio === '16_9' && img.width > 400)?.url || evento.images[0].url

  // Extraigo los datos de ubicación (venue) del evento
  // Uso optional chaining (?.) para evitar errores si la propiedad no existe
  const venue = evento._embedded?.venues?.[0];

  // Obtengo la información de precios. Los precios vienen en un array, tomo el primero
  // También extraigo la moneda, que por defecto será 'ARS' si no está disponible
  const precioRango = evento.priceRanges?.[0]
  const precioMin = precioRango?.min
  const precioMax = precioRango?.max
  const moneda = precioRango?.currency || 'ARS'

  // Retorno un objeto con la estructura que uso en toda la aplicación
  return {
    id: evento.id,
    artista: evento._embedded?.attractions?.[0]?.name || evento.name,
    lugar: venue?.name || 'Lugar a confirmar',
    ciudad: venue?.city?.name || 'Ciudad no disponible',
    fecha: evento.dates?.start?.localDate || 'Fecha a confirmar',
    // El precio lo guardo como un objeto para poder mostrar rangos (min-max)
    precio: {
      min: precioMin,
      max: precioMax,
      moneda,
      disponible: !!precioRango // Convierto a booleano: true si hay datos, false si no
    },
    imagen: imagen,
    // Las coordenadas las parseo a número para poder usar con Leaflet (mapa)
    lat: parseFloat(venue?.location?.latitude) || null,
    lng: parseFloat(venue?.location?.longitude) || null
  }
}

// Defino mi store de Pinia llamado 'conciertos'.
export const useConciertosStore = defineStore('conciertos', () => {

  // Clave para localStorage
  const STORAGE_KEY = 'soundspot-eventos-usuario'

  // STATE 
  const conciertos = ref([])
  const estaCargando = ref(false) // Estado para saber si estoy cargando datos
  const errorApi = ref(null) // Para guardar errores de la API

  // Creo un array reactivo para guardar únicamente los IDs de los conciertos a los que el usuario marque como "Asistiré" o "Interesado".
  // Inicializo con datos del localStorage si existen
  const eventosUsuario = ref(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  )

  // Watch para guardar cambios en localStorage
  watch(eventosUsuario, (nuevosEventos) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosEventos))
  }, { deep: true })

  // GETTERS 
  // Creo una propiedad computada que me dice la cantidad de eventos a los que voy a asistir. Simplemente cuenta los elementos en 'eventosUsuario'.
  const conteoAsistire = computed(() => eventosUsuario.value.length)

  // Lista única de ciudades disponibles, ordenada alfabéticamente
  const ciudadesDisponibles = computed(() => {
    const ciudades = new Set(conciertos.value.map(c => c.ciudad))
    return Array.from(ciudades).sort()
  })


  // Función principal para buscar conciertos desde la API
  // La llamamos con "await" para esperar a que termine antes de continuar
  async function buscarConciertos() {
    // Si ya tenemos conciertos cargados, no volvemos a llamar la API (ahorro de datos)
    if (conciertos.value.length > 0) return Promise.resolve()

    estaCargando.value = true
    errorApi.value = null

    try {
      // Hago la solicitud a la API de Ticketmaster
      const respuesta = await fetch(API_URL)

      // Verifico que la respuesta sea exitosa (código 200, etc)
      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: No se pudo conectar con la API.`)
      }

      // Convierto la respuesta a JSON
      const data = await respuesta.json()

      // Ticketmaster devuelve los eventos dentro de data._embedded.events
      // Primero verifico que esta estructura exista, luego proceso los datos
      if (data._embedded && data._embedded.events) {
        // Transformo cada evento al formato que usamos en nuestra app
        // Luego filtro solo los que tengan coordenadas (para poder mostrarlos en el mapa)
        conciertos.value = data._embedded.events
          .map(transformarDatosApi)
          .filter(c => c.lat && c.lng);
      } else {
        // Si la API no devuelve eventos, dejo el array vacío
        conciertos.value = []
      }

    } catch (error) {
      // Si hay error (sin conexión, error de la API, etc), lo guardamos para mostrar en la UI
      console.error("Error al buscar conciertos:", error)
      errorApi.value = error.message
    } finally {
      // Siempre ejecuto esto al final, sin importar si hubo error o no
      // Esto detiene el spinner de carga
      estaCargando.value = false
    }
  }


  // Esta función alterna el estado de asistencia de un usuario a un concierto
  // Si no asistía → lo marcamos como que va a asistir
  // Si ya iba a asistir → lo desmarco (quita su interés)
  function alternarAsistencia(conciertoId) {
    const indice = eventosUsuario.value.indexOf(conciertoId)

    if (indice === -1) {
      // El ID no está en la lista, así que lo agregamos
      eventosUsuario.value.push(conciertoId)
    } else {
      // El ID ya está, lo remuevo de la lista
      // splice() modifica el array en el lugar, eliminando 1 elemento desde 'indice'
      eventosUsuario.value.splice(indice, 1)
    }
  }

  // Verifico si el usuario va a asistir a un concierto específico
  // Retorna true si el ID está en la lista, false si no
  function vaAAsistir(conciertoId) {
    return eventosUsuario.value.includes(conciertoId)
  }

  // Búsquedas recientes de ciudades
  const STORAGE_KEY_BUSQUEDAS = 'soundspot-busquedas-recientes'
  const busquedasRecientes = ref(
    JSON.parse(localStorage.getItem(STORAGE_KEY_BUSQUEDAS) || '[]')
  )

  // Guardo el historial de búsquedas de ciudades del usuario
  // Esto permite mostrar "búsquedas recientes" en el dropdown del filtrador
  function guardarBusquedaCiudad(ciudad) {
    if (!ciudad) return // Si no hay ciudad, no hacemos nada

    const busquedas = busquedasRecientes.value

    // Evitamos duplicados: si la ciudad ya está en el historial, la remuevo
    const index = busquedas.indexOf(ciudad)
    if (index > -1) {
      busquedas.splice(index, 1)
    }

    // Agregamos la ciudad al inicio del array (la más reciente va primero)
    busquedas.unshift(ciudad)

    // Mantener solo las últimas 5 búsquedas para no acumular datos innecesarios
    busquedasRecientes.value = busquedas.slice(0, 5)

    // Guardo en localStorage para que persista incluso después de cerrar el navegador
    localStorage.setItem(STORAGE_KEY_BUSQUEDAS, JSON.stringify(busquedasRecientes.value))
  }

  // Retorno todas las variables y funciones que quiero que estén disponibles para mis componentes de Vue.
  return {
    conciertos,
    estaCargando,
    errorApi,
    eventosUsuario,
    conteoAsistire,
    ciudadesDisponibles,
    busquedasRecientes,
    buscarConciertos,
    alternarAsistencia,
    vaAAsistir,
    guardarBusquedaCiudad
  }
})