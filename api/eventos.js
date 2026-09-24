// Función serverless de Vercel: hace de intermediaria con la API de
// Ticketmaster para que la API key (TM_API_KEY) nunca llegue al navegador.
// El frontend (src/stores/conciertos.js) le pega a /api/eventos en vez de
// pegarle directo a Ticketmaster.

const TICKETMASTER_URL = 'https://app.ticketmaster.com/discovery/v2/events.json'

const REGEX_FECHA_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
const REGEX_PAIS = /^[A-Z]{2}$/

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.status(405).json({ error: 'Método no permitido.' })
    return
  }

  const apiKey = process.env.TM_API_KEY
  if (!apiKey) {
    console.error('Falta configurar TM_API_KEY en las variables de entorno del servidor.')
    response.status(500).json({ error: 'El servidor no tiene configurada la clave de la API de Ticketmaster.' })
    return
  }

  const { startDateTime, endDateTime, page, size, countryCode } = request.query

  if (!REGEX_FECHA_ISO.test(startDateTime) || !REGEX_FECHA_ISO.test(endDateTime)) {
    response.status(400).json({ error: 'Parámetros de fecha inválidos.' })
    return
  }

  const pagina = Number(page)
  const tamanioPagina = Number(size)
  if (!Number.isInteger(pagina) || pagina < 0 || pagina > 50) {
    response.status(400).json({ error: 'Parámetro "page" inválido.' })
    return
  }
  if (!Number.isInteger(tamanioPagina) || tamanioPagina < 1 || tamanioPagina > 200) {
    response.status(400).json({ error: 'Parámetro "size" inválido.' })
    return
  }
  if (countryCode && !REGEX_PAIS.test(countryCode)) {
    response.status(400).json({ error: 'Parámetro "countryCode" inválido.' })
    return
  }

  // classificationName y sort quedan fijos acá: el frontend no puede pedir
  // nada distinto de conciertos ordenados por fecha a través de este proxy.
  const parametros = new URLSearchParams({
    apikey: apiKey,
    classificationName: 'music',
    sort: 'date,asc',
    startDateTime,
    endDateTime,
    page: String(pagina),
    size: String(tamanioPagina)
  })
  if (countryCode) parametros.set('countryCode', countryCode)

  try {
    const respuestaTm = await fetch(`${TICKETMASTER_URL}?${parametros.toString()}`)
    const datos = await respuestaTm.json()

    if (!respuestaTm.ok) {
      response.status(respuestaTm.status).json({ error: 'No se pudo conectar con la API de Ticketmaster.' })
      return
    }

    // Cache corta a nivel de CDN de Vercel: si mucha gente pide el mismo
    // país/año casi al mismo tiempo, no se gasta la cuota diaria de la API
    // en cada visita.
    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    response.status(200).json(datos)
  } catch (error) {
    console.error('Error al consultar Ticketmaster:', error)
    response.status(502).json({ error: 'No se pudo conectar con la API de Ticketmaster.' })
  }
}
