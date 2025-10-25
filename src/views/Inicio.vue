<script setup>
import { ref, computed } from 'vue'
import { useConciertosStore } from '@/stores/conciertos.js'
import CardConcierto from '@/components/CardConcierto.vue'
import FiltrosBusqueda from '@/components/FiltrosBusqueda.vue'

const storeConciertos = useConciertosStore()
const filtroCiudad = ref('')
const filtroFecha = ref('')

const conciertos = computed(() => storeConciertos.conciertos)
const conciertosFiltrados = computed(() => {
    let resultado = conciertos.value;
    const ciudadLower = filtroCiudad.value.toLowerCase().trim();

    if (ciudadLower) {
        resultado = resultado.filter(c =>
            c.ciudad.toLowerCase().includes(ciudadLower)
        );
    }
    if (filtroFecha.value) {
        resultado = resultado.filter(c => c.fecha === filtroFecha.value);
    }
    // Lógica de ordenación por distancia (pendiente)
    return resultado;
});

const ubicacionUsuario = ref(null)
const errorGeolocalizacion = ref('')
const buscandoUbicacion = ref(false) // Para feedback visual

function obtenerUbicacion() {
    errorGeolocalizacion.value = ''
    ubicacionUsuario.value = null // Reseteo ubicación previa
    buscandoUbicacion.value = true // Indico que estoy buscando

    if (!navigator.geolocation) {
        errorGeolocalizacion.value = 'Tu navegador no soporta geolocalización.'
        buscandoUbicacion.value = false
        return
    }

    navigator.geolocation.getCurrentPosition(
        (posicion) => {
            ubicacionUsuario.value = {
                lat: posicion.coords.latitude,  // Latitud
                lng: posicion.coords.longitude  // Longitud
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

        <FiltrosBusqueda v-model:ciudad="filtroCiudad" v-model:fecha="filtroFecha"
            :buscando-ubicacion="buscandoUbicacion" @buscar-ubicacion="obtenerUbicacion" />

        <div v-if="errorGeolocalizacion" class="alert alert-warning d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2 flex-shrink-0"></i>
            <div>{{ errorGeolocalizacion }}</div>
        </div>

        <div v-if="ubicacionUsuario && !errorGeolocalizacion" class="alert alert-info d-flex align-items-center"
            role="status">
            <i class="bi bi-check-circle-fill me-2 flex-shrink-0"></i>
            <div>
                Ubicación obtenida: Lat {{ ubicacionUsuario.lat.toFixed(4) }}, Lng {{ ubicacionUsuario.lng.toFixed(4)
                }}.
                <em class="d-block small">(Funcionalidad de ordenar por cercanía pendiente)</em>
            </div>
        </div>

        <section aria-labelledby="resultados-titulo">
            <h2 id="resultados-titulo" class="visually-hidden">Resultados de Conciertos</h2>

            <div v-if="conciertosFiltrados.length > 0" class="row g-4">
                <div v-for="concierto in conciertosFiltrados" :key="concierto.id"
                    class="col-md-6 col-lg-4 d-flex align-items-stretch">

                    <CardConcierto :concierto="concierto" />
                </div>
            </div>

            <div v-else class="alert alert-secondary text-center mt-4" role="status">
                <p class="mb-0">No se encontraron conciertos que coincidan.</p>
            </div>
        </section>

    </section>
</template>

<style scoped>
.vista-inicio {
    padding-top: 1rem;
}


/* Estilo para botón de ubicación deshabilitado */
.btn:disabled {
    cursor: wait;
}

.alert {
    margin-top: 1.5rem;

    i.bi {
        flex-shrink: 0;
    }

    /* Asegurar que el icono no se encoja */
}
</style>