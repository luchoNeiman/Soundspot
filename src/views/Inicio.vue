<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useConciertosStore } from '@/stores/conciertos.js'
import CardConcierto from '@/components/CardConcierto.vue'
import FiltrosBusqueda from '@/components/FiltrosBusqueda.vue'
import TarjetaUbicacion from '@/components/TarjetaUbicacion.vue'

defineOptions({ name: 'VistaInicio' })

const storeConciertos = useConciertosStore()

const filtroCiudad = ref('')
const filtroArtista = ref('')
const filtroGenero = ref('')
const filtroMes = ref(0) // 0 = Todos los Meses
const filtroAnio = ref(0) // 0 = Todos los Años
const filtroPrecioMin = ref(null)
const filtroPrecioMax = ref(null)
const filtroPais = ref('US')
const cantidadVisible = ref(12)

const ubicacionUsuario = ref(null)
const errorGeolocalizacion = ref(null)
const buscandoUbicacion = ref(false)

// Lógica de Conciertos (API)
// Uso onMounted para llamar a la API solo una vez, cuando el componente se carga
onMounted(() => {
    storeConciertos.buscarConciertos(filtroPais.value)
})

watch(filtroPais, (pais) => {
    storeConciertos.buscarConciertos(pais, true)
})

watch([filtroCiudad, filtroArtista, filtroGenero, filtroMes, filtroAnio, filtroPrecioMin, filtroPrecioMax, filtroPais], () => {
    cantidadVisible.value = 12
})

// Accedeo a los estados de carga y error del store
const estaCargando = computed(() => storeConciertos.estaCargando)
const errorApi = computed(() => storeConciertos.errorApi)
const resultadosLimitados = computed(() => storeConciertos.resultadosLimitados)

function obtenerPartesFecha(fecha) {
    const [anio, mes] = String(fecha).split('-').map(Number)
    return { anio, mes }
}

function tieneCoordenadas(concierto) {
    return Number.isFinite(concierto.lat) && Number.isFinite(concierto.lng)
}

/*
 * Calcula la distancia entre dos puntos (Lat/Lng) usando la fórmula de Haversine.
 * Devuelve la distancia en kilómetros.
 */
function getDistanciaHaversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
}



const conciertosFiltrados = computed(() => {
    let resultado = storeConciertos.conciertos;

    // Filtrar por Ciudad
    const ciudadLower = filtroCiudad.value.toLowerCase().trim();
    if (ciudadLower) {
        resultado = resultado.filter(c =>
            c.ciudad.toLowerCase().includes(ciudadLower)
        );
    }

    const artistaLower = filtroArtista.value.toLowerCase().trim();
    if (artistaLower) {
        resultado = resultado.filter(c => c.artista.toLowerCase().includes(artistaLower));
    }

    if (filtroGenero.value) {
        resultado = resultado.filter(c => c.genero === filtroGenero.value);
    }

    // Filtrar por Año
    if (filtroAnio.value > 0) {
        resultado = resultado.filter(c => obtenerPartesFecha(c.fecha).anio === filtroAnio.value);
    }

    // Filtrar por Mes
    if (filtroMes.value > 0) {
        resultado = resultado.filter(c => obtenerPartesFecha(c.fecha).mes === filtroMes.value);
    }

    const tienePrecioMinimo = filtroPrecioMin.value !== null && filtroPrecioMin.value !== '';
    const tienePrecioMaximo = filtroPrecioMax.value !== null && filtroPrecioMax.value !== '';
    if (tienePrecioMinimo || tienePrecioMaximo) {
        resultado = resultado.filter(c => {
            if (!c.precio.disponible) return false;

            const menorPrecio = c.precio.min ?? c.precio.max;
            const mayorPrecio = c.precio.max ?? c.precio.min;
            return (!tienePrecioMinimo || mayorPrecio >= filtroPrecioMin.value) &&
                (!tienePrecioMaximo || menorPrecio <= filtroPrecioMax.value);
        });
    }

    // ORDENACIÓN POR CERCANÍA (si tengo ubicación del usuario)
    if (ubicacionUsuario.value) {
        // Si tengo la ubicación del usuario, calculo la distancia para cada concierto
        // y ordeno el array 'resultado'.
        // Uso .slice() para crear una copia y no mutar el array original
        resultado = resultado.slice().sort((a, b) => {
            if (!tieneCoordenadas(a)) return tieneCoordenadas(b) ? 1 : 0
            if (!tieneCoordenadas(b)) return -1

            const distA = getDistanciaHaversine(
                ubicacionUsuario.value.lat, ubicacionUsuario.value.lng,
                a.lat, a.lng
            );
            const distB = getDistanciaHaversine(
                ubicacionUsuario.value.lat, ubicacionUsuario.value.lng,
                b.lat, b.lng
            );
            return distA - distB; // Ordena de más cercano a más lejano
        });
    }

    // Si no tengo ubicación, ordeno por fecha
    else {
        resultado = resultado.slice().sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
    }

    return resultado;
});

const conciertosVisibles = computed(() => conciertosFiltrados.value.slice(0, cantidadVisible.value))
const hayMasConciertos = computed(() => cantidadVisible.value < conciertosFiltrados.value.length)

function cargarMasConciertos() {
    cantidadVisible.value += 12
}

function obtenerUbicacion() {
    // Si ya hay una ubicación activa, la desactivamos
    if (ubicacionUsuario.value) {
        ubicacionUsuario.value = null
        errorGeolocalizacion.value = null
        return
    }

    errorGeolocalizacion.value = null // Reseteo errores previos
    buscandoUbicacion.value = true // Indico que estoy buscando

    if (!navigator.geolocation) {
        errorGeolocalizacion.value = 'Tu navegador no soporta geolocalización.'
        buscandoUbicacion.value = false
        return
    }

    navigator.geolocation.getCurrentPosition(
        (posicion) => {
            ubicacionUsuario.value = {
                lat: posicion.coords.latitude,
                lng: posicion.coords.longitude
            }
            console.log('Ubicación obtenida:', ubicacionUsuario.value)
            // TODO: Llamar a función para ordenar conciertos por distancia
            buscandoUbicacion.value = false

        },
        (error) => {
            console.error("Error obteniendo ubicación:", error)
            if (error.code === error.PERMISSION_DENIED) {
                errorGeolocalizacion.value = 'Permiso de ubicación denegado. No podemos mostrar conciertos cercanos.'
            } else {
                errorGeolocalizacion.value = `No se pudo obtener la ubicación (Error ${error.code}).`
            }
            buscandoUbicacion.value = false
        },
        { // Opciones de getCurrentPosition
            enableHighAccuracy: false, // Más rápido, menos preciso
            timeout: 10000, // 10 segundos máximo
            maximumAge: 60000 // Reusar ubicación si tiene menos de 1 minuto
        }
    )
}
</script>


<template>
    <section class="vista-inicio mb-5">
        <h1 class="mb-4">Próximos Conciertos</h1>

        <FiltrosBusqueda v-model:ciudad="filtroCiudad" v-model:artista="filtroArtista" v-model:genero="filtroGenero"
            v-model:mes="filtroMes" v-model:anio="filtroAnio" v-model:precio-min="filtroPrecioMin"
            v-model:precio-max="filtroPrecioMax" v-model:pais="filtroPais"
            :buscando-ubicacion="buscandoUbicacion" :ubicacion-activa="!!ubicacionUsuario"
            @buscar-ubicacion="obtenerUbicacion" />

        <div v-if="errorGeolocalizacion" class="alert alert-warning d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2 flex-shrink-0 fs-4"></i>
            <div>
                <h4 class="alert-heading h5 mb-0">{{ errorGeolocalizacion }}</h4>
            </div>
        </div>

        <TarjetaUbicacion v-if="ubicacionUsuario && !errorGeolocalizacion" :ubicacion="ubicacionUsuario" />

        <section aria-labelledby="resultados-titulo" class="mt-4">
            <h2 id="resultados-titulo" class="visually-hidden">Resultados de Conciertos</h2>

            <div v-if="estaCargando" class="text-center my-5">
                <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-3 text-body-secondary">Buscando conciertos...</p>
            </div>

            <div v-else-if="errorApi" class="alert alert-danger text-center">
                <h4 class="alert-heading">Error de Conexión</h4>
                <p>{{ errorApi }}</p>
            </div>

            <div v-else>
                <div v-if="resultadosLimitados" class="alert alert-info" role="status">
                    Se encontraron más funciones de las que se pueden mostrar con fluidez. Se cargaron hasta 170, repartidas entre los tres años disponibles.
                </div>
                <div v-if="conciertosFiltrados.length > 0" class="row g-4">
                    <div v-for="concierto in conciertosVisibles" :key="concierto.id"
                        class="col-md-6 col-lg-4 d-flex align-items-stretch">
                        <CardConcierto :concierto="concierto" />
                    </div>
                </div>
                <div v-if="hayMasConciertos" class="text-center mt-4">
                    <button type="button" class="btn btn-outline-light" @click="cargarMasConciertos">
                        Cargar más funciones
                    </button>
                </div>
                <div v-else class="alert alert-secondary text-center mt-4" role="status">
                    <p class="mb-0">No se encontraron conciertos que coincidan con tu búsqueda.</p>
                </div>
            </div>

        </section>

    </section>
</template>

<style scoped>
.vista-inicio {
    padding-top: 1rem;
}

.alert {
    margin-top: 1.5rem;

    i.bi {
        flex-shrink: 0;
    }
}
</style>
