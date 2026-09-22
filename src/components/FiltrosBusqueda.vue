<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useConciertosStore } from '@/stores/conciertos.js'

const storeConciertos = useConciertosStore()
const ciudadInput = ref('')
const mostrarSugerencias = ref(false)
const mantenerDropdownAbierto = ref(false)
const windowWidth = ref(window.innerWidth)

const ciudad = defineModel('ciudad', { default: '' })
const artista = defineModel('artista', { default: '' })
const genero = defineModel('genero', { default: '' })
const mes = defineModel('mes', { default: 0 })
const anio = defineModel('anio', { default: 0 })
const precioMin = defineModel('precioMin', { default: null })
const precioMax = defineModel('precioMax', { default: null })
const pais = defineModel('pais', { default: 'US' })

const props = defineProps({
    buscandoUbicacion: { type: Boolean, default: false },
    ubicacionActiva: { type: Boolean, default: false }
})

const emit = defineEmits(['buscarUbicacion'])

const paises = [
    { valor: 'US', nombre: 'Estados Unidos' },
    { valor: 'AR', nombre: 'Argentina' },
    { valor: 'BR', nombre: 'Brasil' },
    { valor: 'CA', nombre: 'Canadá' },
    { valor: 'ES', nombre: 'España' },
    { valor: 'GB', nombre: 'Reino Unido' },
    { valor: 'MX', nombre: 'México' }
]

const meses = [
    { valor: 0, nombre: 'Todos los meses' },
    { valor: 1, nombre: 'Enero' }, { valor: 2, nombre: 'Febrero' }, { valor: 3, nombre: 'Marzo' },
    { valor: 4, nombre: 'Abril' }, { valor: 5, nombre: 'Mayo' }, { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' }, { valor: 8, nombre: 'Agosto' }, { valor: 9, nombre: 'Septiembre' },
    { valor: 10, nombre: 'Octubre' }, { valor: 11, nombre: 'Noviembre' }, { valor: 12, nombre: 'Diciembre' }
]

const anios = computed(() => {
    const anioActual = new Date().getFullYear()
    return [
        { valor: 0, nombre: 'Todos los años' },
        { valor: anioActual - 1, nombre: String(anioActual - 1) },
        { valor: anioActual, nombre: String(anioActual) },
        { valor: anioActual + 1, nombre: String(anioActual + 1) }
    ]
})

const sugerenciasCiudades = computed(() => {
    const busqueda = ciudadInput.value.toLowerCase().trim()
    const disponibles = storeConciertos.ciudadesDisponibles
    if (!busqueda) {
        return [...new Set([...storeConciertos.busquedasRecientes, ...disponibles])]
    }
    return disponibles.filter((nombreCiudad) => nombreCiudad.toLowerCase().includes(busqueda))
})

const isMobileOrTablet = computed(() => windowWidth.value < 992)

function manejarInput() {
    ciudad.value = ciudadInput.value
    mostrarSugerencias.value = true
}

function seleccionarCiudad(sugerencia) {
    ciudadInput.value = sugerencia
    ciudad.value = sugerencia
    mostrarSugerencias.value = false
    storeConciertos.guardarBusquedaCiudad(sugerencia)
}

function ocultarSugerencias() {
    setTimeout(() => {
        if (!mantenerDropdownAbierto.value) mostrarSugerencias.value = false
    }, 150)
}

function restablecerFiltros() {
    ciudadInput.value = ''
    ciudad.value = ''
    artista.value = ''
    genero.value = ''
    mes.value = 0
    anio.value = 0
    precioMin.value = null
    precioMax.value = null
}

function actualizarAncho() {
    windowWidth.value = window.innerWidth
}

onMounted(() => window.addEventListener('resize', actualizarAncho))
onUnmounted(() => window.removeEventListener('resize', actualizarAncho))
</script>

<template>
    <form class="row g-3 mb-4 align-items-end" role="search" @submit.prevent>
        <div class="col-lg-2 col-md-4 col-sm-6">
            <label for="filtroPais" class="form-label">País:</label>
            <select id="filtroPais" v-model="pais" class="form-select" aria-label="Elegir país">
                <option v-for="opcion in paises" :key="opcion.valor" :value="opcion.valor">{{ opcion.nombre }}</option>
            </select>
        </div>

        <div class="col-lg-3 col-md-4 col-sm-6">
            <label for="filtroCiudad" class="form-label">Ciudad:</label>
            <div class="dropdown">
                <input id="filtroCiudad" v-model="ciudadInput" type="search" class="form-control border-light"
                    placeholder="Buscar por ciudad..." autocomplete="off" aria-label="Filtrar por ciudad"
                    @input="manejarInput" @focus="mostrarSugerencias = true" @blur="ocultarSugerencias">
                <ul class="dropdown-menu w-100"
                    :class="{ show: mostrarSugerencias && sugerenciasCiudades.length > 0 }"
                    @mouseenter="mantenerDropdownAbierto = true" @mouseleave="mantenerDropdownAbierto = false">
                    <li v-if="!ciudadInput && storeConciertos.busquedasRecientes.length > 0" class="dropdown-header">
                        Búsquedas recientes
                    </li>
                    <li v-for="sugerencia in sugerenciasCiudades" :key="sugerencia">
                        <button type="button" class="dropdown-item" @click="seleccionarCiudad(sugerencia)">{{ sugerencia }}</button>
                    </li>
                </ul>
            </div>
        </div>

        <div class="col-lg-3 col-md-4 col-sm-6">
            <label for="filtroArtista" class="form-label">Artista:</label>
            <input id="filtroArtista" v-model.trim="artista" type="search" class="form-control" placeholder="Nombre del artista">
        </div>

        <div class="col-lg-4 col-md-6 col-sm-6">
            <label for="filtroGenero" class="form-label">Género:</label>
            <select id="filtroGenero" v-model="genero" class="form-select" aria-label="Filtrar por género">
                <option value="">Todos los géneros</option>
                <option v-for="nombreGenero in storeConciertos.generosDisponibles" :key="nombreGenero" :value="nombreGenero">
                    {{ nombreGenero }}
                </option>
            </select>
        </div>

        <div class="col-lg-2 col-md-3 col-sm-6">
            <label for="filtroMes" class="form-label">Mes:</label>
            <select id="filtroMes" v-model.number="mes" class="form-select" aria-label="Filtrar por mes">
                <option v-for="opcion in meses" :key="opcion.valor" :value="opcion.valor">{{ opcion.nombre }}</option>
            </select>
        </div>

        <div class="col-lg-2 col-md-3 col-sm-6">
            <label for="filtroAnio" class="form-label">Año:</label>
            <select id="filtroAnio" v-model.number="anio" class="form-select" aria-label="Filtrar por año">
                <option v-for="opcion in anios" :key="opcion.valor" :value="opcion.valor">{{ opcion.nombre }}</option>
            </select>
        </div>

        <div class="col-lg-2 col-md-3 col-sm-6">
            <label for="filtroPrecioMin" class="form-label">Precio desde:</label>
            <input id="filtroPrecioMin" v-model.number="precioMin" type="number" min="0" class="form-control" placeholder="Sin mínimo">
        </div>

        <div class="col-lg-2 col-md-3 col-sm-6">
            <label for="filtroPrecioMax" class="form-label">Precio hasta:</label>
            <input id="filtroPrecioMax" v-model.number="precioMax" type="number" min="0" class="form-control" placeholder="Sin máximo">
        </div>

        <div class="col-lg-2 col-md-6 col-sm-6 d-grid">
            <button type="button" class="btn btn-outline-secondary" @click="restablecerFiltros">
                <i class="bi bi-arrow-counterclockwise me-1" aria-hidden="true"></i> Limpiar
            </button>
        </div>

        <div class="col-lg-2 col-md-6 col-sm-6 d-grid">
            <button type="button" class="btn btn-outline-light" :disabled="props.buscandoUbicacion" @click="emit('buscarUbicacion')">
                <span v-if="props.buscandoUbicacion" class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                <i v-else :class="['bi', props.ubicacionActiva ? 'bi-geo-alt-fill' : 'bi-geo-alt', { 'me-1': !isMobileOrTablet }]" aria-hidden="true"></i>
                <span :class="{ 'd-none': isMobileOrTablet }">{{ props.ubicacionActiva ? 'Quitar ubicación' : 'Usar mi ubicación' }}</span>
            </button>
        </div>
    </form>
</template>

<style scoped>
.btn:disabled { cursor: wait; }
.dropdown { position: relative; }
.dropdown-menu { max-height: 200px; overflow-y: auto; margin-top: 0.25rem; background-color: var(--bs-form-control-bg); border-color: var(--bs-form-control-border-color); }
.dropdown-item { color: var(--bs-form-control-color); }
.dropdown-item:hover, .dropdown-item:focus { background-color: var(--color-primario); color: var(--bs-light); }
.dropdown-header { color: var(--color-secundario); }
</style>
