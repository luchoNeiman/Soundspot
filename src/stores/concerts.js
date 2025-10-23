import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import datosConciertos from '@/assets/data/mock-concerts.json'

// Defino mi store de Pinia llamado 'conciertos'.
// Uso la sintaxis de 'setup function' (la función flecha) 
export const useConciertosStore = defineStore('conciertos', () => {

  // --- STATE ---
  // Guardo la lista completa de conciertos en una referencia reactiva (ref) que inicializo con mis datos del archivo JSON.
  const conciertos = ref(datosConciertos)

  // Creo un array reactivo para guardar únicamente los IDs de los conciertos a los que el usuario marque como "Asistiré" o "Interesado".
  const eventosUsuario = ref([])


  // --- GETTERS ---
  // Creo una propiedad computada que me dice la cantidad de eventos a los que voy a asistir. Simplemente cuenta los elementos en 'eventosUsuario'.
  const conteoAsistire = computed(() => eventosUsuario.value.length)


  // --- Funciones ---

  /**
   * Esta función agrega o quita un ID de concierto de mi lista 'eventosUsuario'.
   * Es la que voy a usar para el botón "Asistiré".
   * @param {number} conciertoId - El ID del concierto que quiero agregar o quitar.
   */
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

  /**
   * Esta función simple me sirve para chequear rápidamente si un concierto
   * ya está en mi lista de asistencia. La voy a usar para, por ejemplo,
   * cambiar el estilo del botón "Asistiré" si ya fue presionado.
   * Devuelve true o false.
   * @param {number} conciertoId - El ID del concierto que quiero chequear.
   */
  function vaAAsistir(conciertoId) {
    // .includes() lo uso para ver si el ID está en el array 'eventosUsuario'
    return eventosUsuario.value.includes(conciertoId)
  }

  // Finalmente, retorno todas las variables y funciones que quiero que estén disponibles para mis componentes de Vue.
  return {
    conciertos,
    eventosUsuario,
    conteoAsistire,
    alternarAsistencia,
    vaAAsistir
  }
})