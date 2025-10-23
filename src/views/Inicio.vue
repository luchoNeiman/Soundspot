<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useConciertosStore } from '@/stores/conciertos.js'
// import CardConcierto from '@/components/CardConcierto.vue' // Lo importaremos cuando exista

const storeConciertos = useConciertosStore()
const conciertos = computed(() => storeConciertos.conciertos)
const filtroCiudad = ref('')
const filtroFecha = ref('')

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

        <form @submit.prevent class="row g-3 mb-4 align-items-end" role="search">
            <div class="col-md-4">
                <label for="filtroCiudad" class="form-label">Ciudad:</label>
                <input type="search" id="filtroCiudad" class="form-control" v-model="filtroCiudad"
                    placeholder="Buscar por ciudad..." aria-label="Filtrar conciertos por ciudad" />
            </div>
            <div class="col-md-4">
                <label for="filtroFecha" class="form-label">Fecha:</label>
                <input type="date" id="filtroFecha" class="form-control" v-model="filtroFecha"
                    aria-label="Filtrar conciertos por fecha" />
            </div>
            <div class="col-md-4">
                <button @click="obtenerUbicacion" class="btn btn-outline-light w-100" :disabled="buscandoUbicacion">
                    <span v-if="buscandoUbicacion" class="spinner-border spinner-border-sm me-1" role="status"
                        aria-hidden="true"></span>
                    <i v-else class="bi bi-geo-alt me-1"></i>
                    {{ buscandoUbicacion ? 'Buscando...' : 'Usar mi ubicación' }}
                </button>
            </div>
        </form>

        <div v-if="errorGeolocalizacion" class="alert alert-warning" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ errorGeolocalizacion }}
        </div>
        <div v-if="ubicacionUsuario && !errorGeolocalizacion" class="alert alert-info" role="status">
            <i class="bi bi-check-circle-fill me-2"></i> Ubicación obtenida: Lat {{ ubicacionUsuario.lat.toFixed(4) }},
            Lng {{ ubicacionUsuario.lng.toFixed(4) }}.
            <em class="d-block small">(Funcionalidad de ordenar por cercanía pendiente)</em>
        </div>

        <section aria-labelledby="resultados-titulo">
            <h2 id="resultados-titulo" class="visually-hidden">Resultados de Conciertos</h2>

            <div v-if="conciertosFiltrados.length > 0" class="row g-4">
                <div v-for="concierto in conciertosFiltrados" :key="concierto.id"
                    class="col-md-6 col-lg-4 d-flex align-items-stretch">
                    <article class="card h-100 shadow-sm d-flex flex-column">
                        <img :src="concierto.imagen" class="card-img-top" :alt="`Foto de ${concierto.artista}`">
                        <div class="card-body d-flex flex-column">
                            <h3 class="card-title h5 mb-2">{{ concierto.artista }}</h3>
                            <p class="card-text text-body-secondary small mb-1">
                                <i class="bi bi-geo-alt-fill me-1" aria-hidden="true"></i> {{ concierto.lugar }}, {{
                                    concierto.ciudad }}
                            </p>
                            <p class="card-text text-body-secondary small mb-3">
                                <i class="bi bi-calendar-event me-1" aria-hidden="true"></i> {{ concierto.fecha }}
                            </p>
                            <p class="card-text fs-5 fw-semibold text-end mt-auto mb-3">
                                ${{ concierto.precio }}
                            </p>
                            <RouterLink :to="{ name: 'detalle-concierto', params: { id: concierto.id } }"
                                class="btn btn-primary mt-auto">
                                Ver Detalles <i class="bi bi-arrow-right-short" aria-hidden="true"></i>
                            </RouterLink>
                        </div>
                    </article>
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

/* Ajustes  para la imagen de la tarjeta */
.card-img-top {
    height: 12.5rem;
    object-fit: cover;
    border-bottom: 1px solid var(--color-borde);
}

.card-title {
    font-family: var(--fuente-titulos);
}

.card-body {
    font-family: var(--fuente-parrafos);
}

.card-text.small {
    font-size: 0.875rem;
    /* ~14px */
}

/* Estilo para botón de ubicación deshabilitado */
.btn:disabled {
    cursor: wait;
}
</style>