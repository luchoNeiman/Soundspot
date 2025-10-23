<script setup>
import { ref, computed } from 'vue'
// Importo mi store de conciertos
import { useConciertosStore } from '@/stores/conciertos.js'
// Importaré el componente CardConcierto aca cuando lo cree
// import CardConcierto from '@/components/CardConcierto.vue'

// Inicializo el store
const storeConciertos = useConciertosStore()

// Accedo a la lista de conciertos del store de forma reactiva
const conciertos = computed(() => storeConciertos.conciertos)

// Variables (refs) para los filtros
const filtroCiudad = ref('')
const filtroFecha = ref('')
const conciertosFiltrados = computed(() => {
    let resultado = conciertos.value;

    // Lógica de filtrado
    if (filtroCiudad.value) {
        resultado = resultado.filter(c =>
            c.ciudad.toLowerCase().includes(filtroCiudad.value.toLowerCase())
        );
    }
    if (filtroFecha.value) {
        resultado = resultado.filter(c => c.fecha === filtroFecha.value);
    }

    // Aca podría añadir la lógica de ordenar por cercanía si tengo la ubicación del usuario
    // Por ahora, solo devuelvo el resultado filtrado por ciudad/fecha
    return resultado;
});


// --- Geolocalización ---
const ubicacionUsuario = ref(null) // Para guardar latitud/longitud
const errorGeolocalizacion = ref('') // Para mostrar mensajes de error

function obtenerUbicacion() {
    errorGeolocalizacion.value = '' // Limpio errores previos
    if (!navigator.geolocation) {
        errorGeolocalizacion.value = 'Tu navegador no soporta geolocalización.'
        return
    }

    navigator.geolocation.getCurrentPosition(
        (posicion) => {
            ubicacionUsuario.value = {
                lat: posicion.coords.latitude,
                lng: posicion.coords.longitude
            }
            console.log('Ubicación obtenida:', ubicacionUsuario.value)
            // Aca podría llamar a una función para ordenar los conciertos por distancia
        },
        (error) => {
            console.error("Error obteniendo ubicación:", error)
            if (error.code === error.PERMISSION_DENIED) {
                errorGeolocalizacion.value = 'Permiso de ubicación denegado. No podemos mostrar conciertos cercanos.'
            } else {
                errorGeolocalizacion.value = 'No se pudo obtener la ubicación.'
            }
        }
    )
}

// Intento obtener la ubicación al cargar la vista
// obtenerUbicacion() // Puedo llamar a esta función aquí o con un botón
</script>

<template>
    <div class="vista-inicio">
        <h1 class="mb-4">Próximos Conciertos</h1>

        <div class="row mb-4 g-3 align-items-center">
            <div class="col-md-4">
                <label for="filtroCiudad" class="form-label">Filtrar por Ciudad:</label>
                <input type="text" id="filtroCiudad" class="form-control" v-model="filtroCiudad"
                    placeholder="Ej: Buenos Aires" />
            </div>
            <div class="col-md-4">
                <label for="filtroFecha" class="form-label">Filtrar por Fecha:</label>
                <input type="date" id="filtroFecha" class="form-control" v-model="filtroFecha" />
            </div>
            <div class="col-md-4 d-flex align-items-end">
                <button @click="obtenerUbicacion" class="btn btn-outline-primary w-100">
                    <i class="bi bi-geo-alt"></i> Usar mi ubicación
                </button>
            </div>
        </div>

        <div v-if="errorGeolocalizacion" class="alert alert-warning" role="alert">
            {{ errorGeolocalizacion }}
        </div>

        <div v-if="ubicacionUsuario && !errorGeolocalizacion" class="alert alert-info" role="alert">
            Ubicación obtenida: Lat {{ ubicacionUsuario.lat.toFixed(4) }}, Lng {{ ubicacionUsuario.lng.toFixed(4) }}.
            (Funcionalidad de ordenar por cercanía pendiente)
        </div>

        <div v-if="conciertosFiltrados.length > 0" class="row g-4">
            <div v-for="concierto in conciertosFiltrados" :key="concierto.id" class="col-md-6 col-lg-4 d-flex">
                <div class="card h-100 shadow-sm">
                    <img :src="concierto.imagen" class="card-img-top" :alt="concierto.artista"
                        style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">{{ concierto.artista }}</h5>
                        <p class="card-text mb-1"><i class="bi bi-geo-alt-fill me-1"></i> {{ concierto.lugar }}, {{
                            concierto.ciudad }}</p>
                        <p class="card-text mb-1"><i class="bi bi-calendar-event me-1"></i> {{ concierto.fecha }}</p>
                        <p class="card-text fw-bold fs-5 text-end">${{ concierto.precio }}</p>
                        <RouterLink :to="{ name: 'detalle-concierto', params: { id: concierto.id } }"
                            class="btn btn-primary w-100">
                            Ver Detalles
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="alert alert-secondary text-center">
            No se encontraron conciertos que coincidan con tu búsqueda.
        </div>
    </div>
</template>

<style scoped>
/* .vista-inicio { */
/* Estilos específicos para esta vista si los necesito */
/* } */

.card-img-top {
    /* Estilos para asegurar que las imágenes se vean bien */
    height: 200px;
    object-fit: cover;
    /* Recortar la imagen para llenar el espacio sin deformarla */
}
</style>