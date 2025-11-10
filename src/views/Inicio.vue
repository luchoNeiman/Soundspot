<script setup>
import { ref, computed, onMounted } from 'vue'
import { useConciertosStore } from '@/stores/conciertos.js'
import CardConcierto from '@/components/CardConcierto.vue'
import FiltrosBusqueda from '@/components/FiltrosBusqueda.vue'
import TarjetaUbicacion from '@/components/TarjetaUbicacion.vue'

const storeConciertos = useConciertosStore()

const filtroCiudad = ref('')
const filtroMes = ref(0) // 0 = Todos los Meses
const filtroAnio = ref(0) // 0 = Todos los Años

const ubicacionUsuario = ref(null)
const errorGeolocalizacion = ref(null)
const buscandoUbicacion = ref(false)

const conciertos = computed(() => storeConciertos.conciertos)  //ver que hago con esto

// Lógica de Conciertos (API)
// Uso onMounted para llamar a la API solo una vez, cuando el componente se carga
onMounted(() => {
    storeConciertos.buscarConciertos()
})

// Accedeo a los estados de carga y error del store
const estaCargando = computed(() => storeConciertos.estaCargando)
const errorApi = computed(() => storeConciertos.errorApi)

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

    // Filtrar por Año
    if (filtroAnio.value > 0) {
        resultado = resultado.filter(c => new Date(c.fecha).getFullYear() === filtroAnio.value);
    }

    // Filtrar por Mes
    if (filtroMes.value > 0) {
        resultado = resultado.filter(c => (new Date(c.fecha).getUTCMonth() + 1) === filtroMes.value);
    }

    // ORDENACIÓN POR CERCANÍA (si tengo ubicación del usuario)
    if (ubicacionUsuario.value) {
        // Si tengo la ubicación del usuario, calculo la distancia para cada concierto
        // y ordeno el array 'resultado'.
        // Uso .slice() para crear una copia y no mutar el array original
        resultado = resultado.slice().sort((a, b) => {
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
        resultado = resultado.slice().sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    }

    return resultado;
});

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

        <FiltrosBusqueda v-model:ciudad="filtroCiudad" v-model:mes="filtroMes" v-model:anio="filtroAnio"
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
                <div v-if="conciertosFiltrados.length > 0" class="row g-4">
                    <div v-for="concierto in conciertosFiltrados" :key="concierto.id"
                        class="col-md-6 col-lg-4 d-flex align-items-stretch">
                        <CardConcierto :concierto="concierto" />
                    </div>
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