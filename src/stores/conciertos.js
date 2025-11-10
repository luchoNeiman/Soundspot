import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// API Key de Ticketmaster
const API_KEY = '5TjrtE9vOIGvZPpAZFvhODr9pyZcivHD'
// URL de la API de Ticketmaster para eventos de música en Argentina
// const API_URL = `https://app.ticketmaster.com/discovery/v2/events.json?classificationName=music&apikey=${API_KEY}`
// https://app.ticketmaster.com/discovery/v2/events.json?classificationName=music&apikey={TU_API_KEY}
const API_URL = `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=US&classificationName=music&apikey=${API_KEY}`

// https://app.ticketmaster.com/discovery/v2/events.json?countryCode=US&classificationName=music&apikey=TU_API_KEY



// Función para transformar los datos de la API a mi formato
function transformarDatosApi(evento) {
  // imagen con la mejor calidad (ratio 16_9 y tamaño mediano)
  const imagen = evento.images.find(img => img.ratio === '16_9' && img.width > 400)?.url || evento.images[0].url

  // Obtenemos los datos de ubicación
  const venue = evento._embedded?.venues?.[0];

  // Obtener información de precios
  const precioRango = evento.priceRanges?.[0]
  const precioMin = precioRango?.min
  const precioMax = precioRango?.max
  const moneda = precioRango?.currency || 'ARS'

  return {
    id: evento.id,
    artista: evento._embedded?.attractions?.[0]?.name || evento.name, // Nombre de la atracción o del evento
    lugar: venue?.name || 'Lugar a confirmar',
    ciudad: venue?.city?.name || 'Ciudad no disponible',
    fecha: evento.dates?.start?.localDate || 'Fecha a confirmar',
    precio: {
      min: precioMin,
      max: precioMax,
      moneda,
      disponible: !!precioRango
    },
    imagen: imagen,
    lat: parseFloat(venue?.location?.latitude) || null, // Latitud (default a Bs As si no hay)
    lng: parseFloat(venue?.location?.longitude) || null // Longitud (default a Bs As si no hay)
  }
}

// Defino mi store de Pinia llamado 'conciertos'.
export const useConciertosStore = defineStore('conciertos', () => {

  // STATE 
  const conciertos = ref([])
  const estaCargando = ref(false) // Estado para saber si estamos cargando datos
  const errorApi = ref(null) // Para guardar errores de la API

  // Creo un array reactivo para guardar únicamente los IDs de los conciertos a los que el usuario marque como "Asistiré" o "Interesado".
  const eventosUsuario = ref([])

  // GETTERS 
  // Creo una propiedad computada que me dice la cantidad de eventos a los que voy a asistir. Simplemente cuenta los elementos en 'eventosUsuario'.
  const conteoAsistire = computed(() => eventosUsuario.value.length)

  // Lista única de ciudades disponibles, ordenada alfabéticamente
  const ciudadesDisponibles = computed(() => {
    const ciudades = new Set(conciertos.value.map(c => c.ciudad))
    return Array.from(ciudades).sort()
  })


  // Funciones 
  async function buscarConciertos() {
    if (conciertos.value.length > 0) return // No buscar si ya tengo datos

    estaCargando.value = true
    errorApi.value = null

    console.log("Buscando conciertos en Ticketmaster...");

    try {
      const respuesta = await fetch(API_URL)
      console.log("probando para ver si entra");

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: No se pudo conectar con la API.`)
      }
      const data = await respuesta.json()
      console.log(data);
      // Ticketmaster devuelve los eventos en data._embedded.events
      if (data._embedded && data._embedded.events) {
        // Transformo los datos de la API a nuestro formato
        conciertos.value = data._embedded.events
          .map(transformarDatosApi)
          .filter(c => c.lat && c.lng); // Filtro solo los que tienen latitud y longitud
        console.log("Conciertos cargados:", conciertos.value);
      } else {
        conciertos.value = [] // No se encontraron eventos
      }

    } catch (error) {
      console.error("Error al buscar conciertos:", error)
      errorApi.value = error.message
    } finally {
      estaCargando.value = false // Dejo de cargar, sea éxito o error
    }
  }


  function alternarAsistencia(conciertoId) {
    // Busco si el ID ya existe en mi array 'eventosUsuario'
    const indice = eventosUsuario.value.indexOf(conciertoId)

    if (indice === -1) {
      // Si no está (indexOf devuelve -1), lo agrego a la lista
      eventosUsuario.value.push(conciertoId)
    } else {
      // Si ya está, lo elimino de la lista usando su índice (splice)
      eventosUsuario.value.splice(indice, 1)
    }
  }

  function vaAAsistir(conciertoId) {
    // .includes() lo uso para ver si el ID está en el array 'eventosUsuario'
    return eventosUsuario.value.includes(conciertoId)
  }

  // Retorno todas las variables y funciones que quiero que estén disponibles para mis componentes de Vue.
  return {
    conciertos,
    estaCargando,
    errorApi,
    eventosUsuario,
    conteoAsistire,
    ciudadesDisponibles,
    buscarConciertos,
    alternarAsistencia,
    vaAAsistir
  }
})