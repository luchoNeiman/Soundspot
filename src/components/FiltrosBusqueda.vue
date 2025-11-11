<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useConciertosStore } from '@/stores/conciertos.js'

const storeConciertos = useConciertosStore()
const ciudadInput = ref('') // Texto que escribe el usuario en el input
const mostrarSugerencias = ref(false) // Controla si el dropdown está visible
const mantenerDropdownAbierto = ref(false) // Evita cerrar el dropdown si el mouse está sobre él

// Manejadores del dropdown de ciudades
// Actualiza el filtro mientras el usuario escribe y muestra sugerencias
function manejarInput() {
    ciudad.value = ciudadInput.value
    mostrarSugerencias.value = true
}

// Cuando el usuario selecciona una ciudad del dropdown
// La guardo en el historial y cerramos el dropdown
function seleccionarCiudad(sugerencia) {
    ciudadInput.value = sugerencia
    ciudad.value = sugerencia
    mostrarSugerencias.value = false
    // Guardar en el historial de búsquedas
    storeConciertos.guardarBusquedaCiudad(sugerencia)
}

// Oculta el dropdown con un pequeño delay
// Esto permite que el usuario pueda hacer clic en las opciones sin que se cierre
function ocultarSugerencias() {
    setTimeout(() => {
        if (!mantenerDropdownAbierto.value) {
            mostrarSugerencias.value = false
        }
    }, 150)
}

// obtengo la lista de ciudades disponibles desde el store
const ciudadesDisponibles = computed(() => storeConciertos.ciudadesDisponibles)

// calculo las sugerencias que mostrar en el dropdown
// Si el usuario está escribiendo, filtro las ciudades disponibles
// Si no escribe nada, muestro sus búsquedas recientes primero, luego todas las ciudades
const sugerenciasCiudades = computed(() => {
    const busqueda = ciudadInput.value.toLowerCase().trim()
    if (!busqueda) {
        // Mostrar recientes + disponibles sin duplicados
        const recientes = storeConciertos.busquedasRecientes
        const disponibles = ciudadesDisponibles.value
        // Set elimina duplicados automáticamente
        const todasLasCiudades = [...new Set([...recientes, ...disponibles])]
        return todasLasCiudades
    }
    // Filtrar ciudades que contengan el texto de búsqueda
    return ciudadesDisponibles.value.filter(ciudad =>
        ciudad.toLowerCase().includes(busqueda)
    )
})

// Detecto si estoy en un dispositivo pequeño (móvil o tablet)
// 992px es el breakpoint de Bootstrap para pantallas "lg" (large)
// Usamos esto para ajustar la visibilidad del texto del botón de ubicación
const isMobileOrTablet = computed(() => window.innerWidth < 992)

// Guardo el ancho actual de la ventana
// Esto nos permite reaccionar a cambios de tamaño de pantalla
const windowWidth = ref(window.innerWidth)

// Función que se ejecuta cuando el usuario redimensiona la ventana
// Actualiza nuestro conocimiento del ancho para que computed funcione correctamente
const updateWidth = () => {
    windowWidth.value = window.innerWidth
}

// Agrego y remuevo el listener para detectar cambios de tamaño
// onMounted: se ejecuta cuando el componente se carga
// onUnmounted: se ejecuta cuando salimos del componente (cleanup)
onMounted(() => {
    window.addEventListener('resize', updateWidth)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
})

// Defino los 'modelos' que este componente manejará.
// 'defineModel' crea una prop reactiva y emite 'update:nombreModelo' automáticamente cuando el valor cambia internamente (gracias a v-model en los inputs).
const ciudad = defineModel('ciudad') // Vinculado a v-model:ciudad en el padre
const mes = defineModel('mes')   // Vinculado a v-model:mes
const anio = defineModel('anio')  // Vinculado a v-model:fecha en el padre

// Defino una prop normal para saber si se está buscando la ubicación
const props = defineProps({
    buscandoUbicacion: {
        type: Boolean,
        default: false
    },
    ubicacionActiva: {
        type: Boolean,
        default: false
    }
})

// Defino los eventos que este componente puede emitir hacia el padre.
const emit = defineEmits(['buscarUbicacion'])

// Función simple que solo emite el evento cuando se hace clic en el botón.
// La lógica de geolocalización sigue estando en el componente padre (Inicio.vue).
function solicitarUbicacion() {
    emit('buscarUbicacion')
}

// Listas para los Dropdowns 
const meses = computed(() => [
    { valor: 0, nombre: 'Todos los Meses' },
    { valor: 1, nombre: 'Enero' },
    { valor: 2, nombre: 'Febrero' },
    { valor: 3, nombre: 'Marzo' },
    { valor: 4, nombre: 'Abril' },
    { valor: 5, nombre: 'Mayo' },
    { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' },
    { valor: 8, nombre: 'Agosto' },
    { valor: 9, nombre: 'Septiembre' },
    { valor: 10, nombre: 'Octubre' },
    { valor: 11, nombre: 'Noviembre' },
    { valor: 12, nombre: 'Diciembre' }
])

// Creo una lista de años (puedes hacerla más dinámica si quieres)
const anios = computed(() => [
    { valor: 0, nombre: 'Todos los Años' },
    { valor: 2025, nombre: '2025' },
    { valor: 2026, nombre: '2026' }
])
</script>

<template>
    <form @submit.prevent class="row g-3 mb-4 align-items-end" role="search">
        <div class="col-md-4 col-sm-12">
            <label for="filtroCiudad" class="form-label">Ciudad:</label>
            <div class="dropdown">
                <input type="search" id="filtroCiudad" class="form-control border-light" v-model="ciudadInput"
                    @input="manejarInput" @focus="mostrarSugerencias = true" @blur="ocultarSugerencias"
                    placeholder="Buscar por ciudad..." autocomplete="off" aria-label="Filtrar conciertos por ciudad" />
                <ul class="dropdown-menu w-100" :class="{ show: mostrarSugerencias && sugerenciasCiudades.length > 0 }"
                    @mouseenter="mantenerDropdownAbierto = true" @mouseleave="mantenerDropdownAbierto = false">
                    <!-- Búsquedas recientes -->
                    <li v-if="!ciudadInput && storeConciertos.busquedasRecientes.length > 0" class="dropdown-header">
                        Búsquedas recientes
                    </li>
                    <li v-for="sugerencia in sugerenciasCiudades" :key="sugerencia">
                        <button type="button" class="dropdown-item"
                            :class="{ 'reciente': !ciudadInput && storeConciertos.busquedasRecientes.includes(sugerencia) }"
                            @click="seleccionarCiudad(sugerencia)">
                            <i v-if="!ciudadInput && storeConciertos.busquedasRecientes.includes(sugerencia)"
                                class="bi bi-clock-history me-2"></i>
                            {{ sugerencia }}
                        </button>
                    </li>
                </ul>
            </div>
        </div>

        <div class="col-md-3 col-sm-6 text-white">
            <label for="filtroMes" class="form-label">Mes:</label>
            <select id="filtroMes" class="form-select" v-model.number="mes" aria-label="Filtrar por mes">
                <option v-for="m in meses" :key="m.valor" :value="m.valor">{{ m.nombre }}</option>
            </select>
        </div>

        <div class="col-md-2 col-sm-6">
            <label for="filtroAnio" class="form-label">Año:</label>
            <select id="filtroAnio" class="form-select" v-model.number="anio" aria-label="Filtrar por año">
                <option v-for="a in anios" :key="a.valor" :value="a.valor">{{ a.nombre }}</option>
            </select>
        </div>

        <div class="col-md-3 col-sm-12">
            <label class="form-label d-none d-md-block">&nbsp;</label> <button @click="solicitarUbicacion"
                class="btn btn-outline-light w-100" :disabled="props.buscandoUbicacion">
                <span v-if="props.buscandoUbicacion" class="spinner-border spinner-border-sm me-1" role="status"
                    aria-hidden="true"></span>
                <i v-else :class="[
                    'bi',
                    props.ubicacionActiva ? 'bi-geo-alt-fill' : 'bi-geo-alt',
                    { 'me-1': !isMobileOrTablet }
                ]"></i>
                <span :class="{ 'd-none': isMobileOrTablet }">
                    {{ props.buscandoUbicacion ? 'Buscando...' :
                        props.ubicacionActiva ? 'Quitar ubicación' : 'Usar mi ubicación' }}
                </span>
            </button>
        </div>
    </form>
</template>

<style scoped>
.form-select {
    background-color: var(--bs-form-control-bg);
    color: var(--bs-form-control-color);
    border-color: var(--bs-form-control-border-color);
}

.btn:disabled {
    cursor: wait;
}

@media (max-width: 991.98px) {
    .btn i.bi {
        font-size: 1.2rem;
        margin: 0;
    }

    .btn {
        padding: 0.375rem 1rem;
    }
}

/* Estilos para el dropdown de ciudades */
.dropdown {
    position: relative;
}

.dropdown-menu {
    max-height: 200px;
    overflow-y: auto;
    margin-top: 0.25rem;
    background-color: var(--bs-form-control-bg);
    border-color: var(--bs-form-control-border-color);
}

.dropdown-item {
    color: var(--bs-form-control-color);
    padding: 0.5rem 1rem;
}

.dropdown-item:hover,
.dropdown-item:focus {
    background-color: var(--color-primario);
    color: var(--bs-light);
}

.dropdown-header {
    color: var(--color-secundario);
    font-weight: 500;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
}

.dropdown-item.reciente {
    color: var(--color-secundario);
}

.dropdown-item.reciente:hover {
    color: var(--bs-light);
}
</style>