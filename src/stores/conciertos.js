import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

const API_KEY = '5TjrtE9vOIGvZPpAZFvhODr9pyZcivHD'
const API_URL = 'https://app.ticketmaster.com/discovery/v2/events.json'
const LIMITE_SEGURIDAD = 170

function transformarDatosApi(evento) {
  const imagen = evento.images?.find((img) => img.ratio === '16_9' && img.width > 400)?.url ||
    evento.images?.[0]?.url ||
    '/favicon.ico'
  const venue = evento._embedded?.venues?.[0]
  const precioRango = evento.priceRanges?.[0]

  return {
    id: evento.id,
    artista: evento._embedded?.attractions?.[0]?.name || evento.name,
    lugar: venue?.name || 'Lugar a confirmar',
    ciudad: venue?.city?.name || 'Ciudad no disponible',
    fecha: evento.dates?.start?.localDate || 'Fecha a confirmar',
    genero: evento.classifications?.[0]?.genre?.name || 'Sin género definido',
    web: evento.url || null,
    precio: {
      min: precioRango?.min,
      max: precioRango?.max,
      moneda: precioRango?.currency || 'ARS',
      disponible: Boolean(precioRango)
    },
    imagen,
    lat: Number(venue?.location?.latitude) || null,
    lng: Number(venue?.location?.longitude) || null
  }
}

function crearUrlEventos(anio, pagina, tamanioPagina, pais) {
  const parametros = new URLSearchParams({
    apikey: API_KEY,
    countryCode: pais,
    classificationName: 'music',
    startDateTime: `${anio}-01-01T00:00:00Z`,
    endDateTime: `${anio}-12-31T23:59:59Z`,
    sort: 'date,asc',
    page: String(pagina),
    size: String(tamanioPagina)
  })

  return `${API_URL}?${parametros.toString()}`
}

export const useConciertosStore = defineStore('conciertos', () => {
  const STORAGE_KEY = 'soundspot-eventos-usuario'
  const STORAGE_KEY_BUSQUEDAS = 'soundspot-busquedas-recientes'

  const conciertos = ref([])
  const estaCargando = ref(false)
  const errorApi = ref(null)
  const resultadosLimitados = ref(false)
  const paisConsultado = ref('US')
  const eventosUsuario = ref(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))
  const busquedasRecientes = ref(JSON.parse(localStorage.getItem(STORAGE_KEY_BUSQUEDAS) || '[]'))
  let controladorConsulta = null

  watch(eventosUsuario, (nuevosEventos) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosEventos))
  }, { deep: true })

  const conteoAsistire = computed(() => eventosUsuario.value.length)
  const ciudadesDisponibles = computed(() => {
    const ciudades = new Set(conciertos.value.map((concierto) => concierto.ciudad))
    return Array.from(ciudades).sort()
  })
  const generosDisponibles = computed(() => {
    const generos = new Set(conciertos.value.map((concierto) => concierto.genero))
    return Array.from(generos).sort()
  })

  async function buscarConciertos(pais = paisConsultado.value, forzar = false) {
    if (!forzar && conciertos.value.length > 0 && pais === paisConsultado.value) return

    controladorConsulta?.abort()
    const controladorActual = new AbortController()
    controladorConsulta = controladorActual
    estaCargando.value = true
    errorApi.value = null
    resultadosLimitados.value = false
    paisConsultado.value = pais
    conciertos.value = []

    try {
      const anioActual = new Date().getFullYear()
      const aniosAConsultar = [anioActual - 1, anioActual, anioActual + 1]
      const eventosRecibidos = []
      let totalDisponible = 0

      // Cada año se consulta por separado para asegurar el alcance dinámico
      // anterior / actual / siguiente sin fechas escritas a mano.
      for (const [indice, anio] of aniosAConsultar.entries()) {
        let pagina = 0
        let totalPaginas = 1
        const limiteParaAnio = Math.floor(LIMITE_SEGURIDAD / aniosAConsultar.length) +
          (indice < LIMITE_SEGURIDAD % aniosAConsultar.length ? 1 : 0)
        const eventosDelAnio = []

        while (pagina < totalPaginas && eventosDelAnio.length < limiteParaAnio) {
          const restantes = limiteParaAnio - eventosDelAnio.length
          const respuesta = await fetch(crearUrlEventos(anio, pagina, restantes, pais), {
            signal: controladorActual.signal
          })

          if (!respuesta.ok) {
            throw new Error(`Error ${respuesta.status}: No se pudo conectar con la API.`)
          }

          const data = await respuesta.json()
          const eventosPagina = data._embedded?.events || []

          if (pagina === 0) {
            totalDisponible += data.page?.totalElements || eventosPagina.length
          }

          eventosDelAnio.push(...eventosPagina)
          totalPaginas = data.page?.totalPages || 0
          pagina += 1
        }

        eventosRecibidos.push(...eventosDelAnio)
      }

      // No se excluyen funciones sin coordenadas: simplemente no pueden
      // priorizarse por cercanía.
      const idsVistos = new Set()
      conciertos.value = eventosRecibidos
        .filter((evento) => !idsVistos.has(evento.id) && idsVistos.add(evento.id))
        .slice(0, LIMITE_SEGURIDAD)
        .map(transformarDatosApi)

      resultadosLimitados.value = totalDisponible > conciertos.value.length
    } catch (error) {
      if (error.name === 'AbortError') return
      console.error('Error al buscar conciertos:', error)
      errorApi.value = error.message
    } finally {
      if (controladorConsulta === controladorActual) estaCargando.value = false
    }
  }

  function alternarAsistencia(conciertoId) {
    const indice = eventosUsuario.value.indexOf(conciertoId)
    if (indice === -1) eventosUsuario.value.push(conciertoId)
    else eventosUsuario.value.splice(indice, 1)
  }

  function vaAAsistir(conciertoId) {
    return eventosUsuario.value.includes(conciertoId)
  }

  function guardarBusquedaCiudad(ciudad) {
    if (!ciudad) return

    const busquedas = busquedasRecientes.value
    const indice = busquedas.indexOf(ciudad)
    if (indice > -1) busquedas.splice(indice, 1)

    busquedas.unshift(ciudad)
    busquedasRecientes.value = busquedas.slice(0, 5)
    localStorage.setItem(STORAGE_KEY_BUSQUEDAS, JSON.stringify(busquedasRecientes.value))
  }

  return {
    conciertos,
    estaCargando,
    errorApi,
    resultadosLimitados,
    paisConsultado,
    eventosUsuario,
    conteoAsistire,
    ciudadesDisponibles,
    generosDisponibles,
    busquedasRecientes,
    buscarConciertos,
    alternarAsistencia,
    vaAAsistir,
    guardarBusquedaCiudad
  }
})
