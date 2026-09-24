<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useConciertosStore } from '@/stores/conciertos.js'

const storeConciertos = useConciertosStore()
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
    { valor: '', nombre: 'Todos los países' },
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

const isMobileOrTablet = computed(() => windowWidth.value < 992)

// Mientras se están cargando los conciertos del país elegido, las listas de
// ciudades/artistas/géneros pueden estar vacías o desactualizadas: deshabilito
// esos selects para que no se puedan elegir valores que todavía no cargaron.
const filtrosDependientesDeshabilitados = computed(() => storeConciertos.estaCargando)

function restablecerFiltros() {
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
        <fieldset class="row g-3 flex-grow-1">
            <legend class="visually-hidden">Filtros de búsqueda de conciertos</legend>

            <div class="col-lg-2 col-md-4 col-sm-6">
                <label for="filtroPais" class="form-label">País:</label>
                <select id="filtroPais" v-model="pais" class="form-select" aria-label="Filtrar por país">
                    <option v-for="opcion in paises" :key="opcion.valor" :value="opcion.valor">{{ opcion.nombre }}</option>
                </select>
            </div>

            <div class="col-lg-3 col-md-4 col-sm-6">
                <label for="filtroCiudad" class="form-label">Ciudad:</label>
                <select id="filtroCiudad" v-model="ciudad" class="form-select"
                    aria-label="Filtrar por ciudad" :disabled="filtrosDependientesDeshabilitados">
                    <option value="">Todas las ciudades</option>
                    <option v-for="nombreCiudad in storeConciertos.ciudadesDisponibles" :key="nombreCiudad" :value="nombreCiudad">
                        {{ nombreCiudad }}
                    </option>
                </select>
            </div>

            <div class="col-lg-3 col-md-4 col-sm-6">
                <label for="filtroArtista" class="form-label">Artista:</label>
                <select id="filtroArtista" v-model="artista" class="form-select"
                    aria-label="Filtrar por artista" :disabled="filtrosDependientesDeshabilitados">
                    <option value="">Todos los artistas</option>
                    <option v-for="nombreArtista in storeConciertos.artistasDisponibles" :key="nombreArtista" :value="nombreArtista">
                        {{ nombreArtista }}
                    </option>
                </select>
            </div>

            <div class="col-lg-4 col-md-6 col-sm-6">
                <label for="filtroGenero" class="form-label">Género:</label>
                <select id="filtroGenero" v-model="genero" class="form-select"
                    aria-label="Filtrar por género" :disabled="filtrosDependientesDeshabilitados">
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
        </fieldset>

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

/* Reseteo los estilos por defecto del navegador para que el fieldset
   no rompa el sistema de grillas de Bootstrap (row/col). */
fieldset {
    border: 0;
    margin: 0;
    padding: 0;
    min-width: 0;
}
</style>
