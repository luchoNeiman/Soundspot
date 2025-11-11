<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// Importo el store para buscar el concierto y manejar asistencia
import { useConciertosStore } from '@/stores/conciertos.js'
// Importo Leaflet para el mapa
import L from 'leaflet'
// Importo los estilos de Leaflet
import 'leaflet/dist/leaflet.css'

// Obtenemos acceso a la ruta actual y al router
const route = useRoute()
const router = useRouter()
const storeConciertos = useConciertosStore()
const cargandoDatos = ref(true)

// extraigo el ID del concierto directamente desde la URL
// Uso String() para asegurar que siempre sea una cadena de texto
// (la API de Ticketmaster devuelve IDs alfanuméricos)
const conciertoId = computed(() => String(route.params.id))

// Esta función se encarga de cargar los conciertos si no están disponibles en el store
// Se ejecuta cuando el usuario accede directamente a la URL (sin pasar por la lista)
async function cargarDatos() {
    cargandoDatos.value = true
    try {
        // Si el store está vacío, hago fetch a la API
        if (storeConciertos.conciertos.length === 0) {
            await storeConciertos.buscarConciertos()
        }
    } catch (error) {
        console.error('Error cargando datos:', error)
    } finally {
        // En cualquier caso, termino la carga (mostrar datos o error)
        cargandoDatos.value = false
    }
}

// Busco el concierto dentro del array disponible en el store
// Uso computed para que se actualice automáticamente si el store cambia
const concierto = computed(() => {
    // Comparo con strings para evitar problemas de coerción de tipos
    // (por ejemplo, "123" !== 123 en JavaScript)
    return storeConciertos.conciertos.find(c => String(c.id) === conciertoId.value)
})

// Esta propiedad calcula si el usuario ha marcado este concierto
// Primero verifico que el concierto exista, luego consulto el store
const asistiendo = computed(() => {
    return concierto.value ? storeConciertos.vaAAsistir(concierto.value.id) : false
})

// Cuando el usuario hace clic en el botón "Asistiré", llamo a esta función
// que alterna el estado en el store (agrega o quita el concierto de la lista)
function manejarAsistencia() {
    if (concierto.value) {
        storeConciertos.alternarAsistencia(concierto.value.id)
    }
}

// Lógica del Mapa Leaflet
// Leaflet es una librería para mostrar mapas interactivos
// Necesito referencias a variables para controlar la instancia del mapa

const mapContainer = ref(null) // Referencia al elemento HTML donde irá el mapa
let mapInstance = null // Guardo aca la instancia del mapa para poder destruirla después

// Inicializa el mapa cuando tenemos todas las coordenadas disponibles
// Se usa Leaflet para renderizar OpenStreetMap con un marcador en la ubicación del evento
function inicializarMapa() {
    // verifico todos los requisitos antes de crear el mapa:
    // - Que el contenedor exista en el DOM
    // - Que tengo datos del concierto
    // - Que tengo coordenadas válidas (no null, no undefined)
    // - Que no se haya creado un mapa ya
    if (mapContainer.value && concierto.value && concierto.value.lat != null && concierto.value.lng != null && !mapInstance) {
        // Crear el mapa centrado en las coordenadas del evento
        // Zoom 15 es un buen nivel de detalle para ver la zona del evento
        mapInstance = L.map(mapContainer.value).setView([concierto.value.lat, concierto.value.lng], 15);

        // Agregar la capa de OpenStreetMap (el mapa base que ven los usuarios)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance);

        // Colocar un marcador (pin) en la ubicación exacta del evento
        // El popup muestra el lugar y el artista cuando haces clic en el pin
        L.marker([concierto.value.lat, concierto.value.lng]).addTo(mapInstance)
            .bindPopup(`<b>${concierto.value.lugar}</b><br>${concierto.value.artista}`)
            .openPopup(); // Abrimos el popup automáticamente
    }
}

// Es importante limpiar el mapa cuando salimos de esta página
// Si no lo hacemos, Leaflet puede causar errores o consumir recursos innecesarios
function destruirMapa() {
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }
}

// Inicializo el mapa cuando el componente se monta y tengo el concierto
onMounted(async () => {
    // Primero cargamos los datos si es necesario
    await cargarDatos()

    // uso watch para reaccionar cuando el concierto cambia
    // immediate: true hace que se ejecute también cuando se monta (si ya hay datos)
    watch(concierto, (nuevoConcierto) => {
        if (nuevoConcierto) {
            // hago un pequeño delay para asegurar que el DOM esté listo
            // (a veces Leaflet necesita que el contenedor esté completamente renderizado)
            setTimeout(inicializarMapa, 100);
        }
    }, { immediate: true });
});

// Destruyo el mapa cuando el componente se desmonta (cambio de página)
// Esto evita que Leaflet interfiera con otras páginas
onUnmounted(() => {
    destruirMapa();
});

// Función para navegar hacia atrás
// El usuario puede volver a la lista o página anterior
function volverAtras() {
    router.back()
}
</script>

<template>
    <article v-if="concierto" class="detalle-concierto">
        <div class="row g-4 g-lg-5">
            <!-- Columna Izquierda: Imagen e Info -->
            <div class="col-lg-6">
                <header class="mb-4">
                    <h1 class="titulo-artista display-5">{{ concierto.artista }}</h1>
                    <p class="lead text-body-secondary">{{ concierto.lugar }}, {{ concierto.ciudad }}</p>
                </header>
                <figure class="mb-4 shadow rounded overflow-hidden">
                    <img :src="concierto.imagen" class="img-fluid" :alt="`Foto o afiche de ${concierto.artista}`" />
                </figure>

                <section class="info-adicional">
                    <h2 class="h4 mb-3">Detalles del Evento</h2>
                    <p><i class="bi bi-calendar-event me-2 icono-detalle"></i> Fecha: <strong>{{ concierto.fecha
                            }}</strong></p>
                    <p><i class="bi bi-cash-coin me-2 icono-detalle"></i> Precio: <strong>
                            <template v-if="concierto.precio && concierto.precio.disponible">
                                <template
                                    v-if="concierto.precio.min != null && concierto.precio.min === concierto.precio.max">
                                    {{ concierto.precio.moneda }} ${{ concierto.precio.min }}
                                </template>
                                <template v-else-if="concierto.precio.min != null && concierto.precio.max != null">
                                    {{ concierto.precio.moneda }} ${{ concierto.precio.min }} - ${{ concierto.precio.max
                                    }}
                                </template>
                                <template v-else-if="concierto.precio.min != null">
                                    {{ concierto.precio.moneda }} ${{ concierto.precio.min }}
                                </template>
                                <template v-else>
                                    Precio a confirmar
                                </template>
                            </template>
                            <template v-else>Precio a confirmar</template>
                        </strong></p>
                    <!-- Si la API provee descripción, género, o info extra, se muestra aquí -->
                    <template v-if="concierto.descripcion">
                        <p class="mb-2"><i class="bi bi-info-circle me-2 icono-detalle"></i> <strong>Descripción:</strong> {{ concierto.descripcion }}</p>
                    </template>
                    <template v-if="concierto.genero">
                        <p class="mb-2"><i class="bi bi-music-note-list me-2 icono-detalle"></i> <strong>Género:</strong> {{ concierto.genero }}</p>
                    </template>
                    <template v-if="concierto.organizador">
                        <p class="mb-2"><i class="bi bi-person-badge me-2 icono-detalle"></i> <strong>Organizador:</strong> {{ concierto.organizador }}</p>
                    </template>
                    <template v-if="concierto.web">
                        <p class="mb-2"><i class="bi bi-link-45deg me-2 icono-detalle"></i> <strong>Web:</strong> <a :href="concierto.web" target="_blank" rel="noopener">{{ concierto.web }}</a></p>
                    </template>
                </section>
            </div>

            <!-- Columna Derecha: Mapa y Acciones -->
            <div class="col-lg-6 d-flex flex-column">
                <section class="mapa-seccion mb-4 flex-grow-1" aria-label="Mapa de ubicación del evento">
                    <h2 class="h4 mb-3">Ubicación</h2>
                    <!-- Contenedor del mapa con altura definida -->
                    <div ref="mapContainer" class="mapa-leaflet shadow rounded"></div>
                </section>

                <!-- Botones de Acción -->
                <div class="d-grid gap-2 mt-auto">
                    <button @click="manejarAsistencia"
                        :class="['btn', asistiendo ? 'btn-success' : 'btn-outline-success']">
                        <i :class="['bi me-2', asistiendo ? 'bi-check-circle-fill' : 'bi-plus-circle']"
                            aria-hidden="true"></i>
                        {{ asistiendo ? 'Asistiré' : 'Me interesa' }}
                    </button>
                    <button @click="volverAtras" class="btn btn-secondary">
                        <i class="bi bi-arrow-left me-2" aria-hidden="true"></i> Volver al listado
                    </button>
                </div>
            </div>
        </div>
    </article>

    <!-- Estado de carga -->
    <div v-else-if="cargandoDatos" class="text-center my-5">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
            <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3 text-body-secondary">Cargando detalles del evento...</p>
    </div>

    <!-- Mensaje si el concierto no se encuentra -->
    <div v-else class="alert alert-danger text-center" role="alert">
        <h2 class="h4">Concierto no encontrado</h2>
        <p>No pudimos encontrar los detalles para este concierto.</p>
        <button @click="volverAtras" class="btn btn-secondary mt-3">
            <i class="bi bi-arrow-left me-2" aria-hidden="true"></i> Volver al listado
        </button>
    </div>
</template>

<style scoped>
.detalle-concierto {
    /* Espaciado general si es necesario */
    padding-top: 1rem;
}

.titulo-artista {
    font-family: var(--fuente-titulos);
    color: var(--bs-emphasis-color);
    font-weight: 700;
    /* Asegurar bold */
}

.lead {
    font-family: var(--fuente-parrafos);
}

figure img {
    width: 100%;
    /* Asegurar que la imagen ocupe el contenedor */
}

.info-adicional p {
    font-family: var(--fuente-parrafos);
    font-size: 1.1rem;
    /* Ligeramente más grande */
    margin-bottom: 0.75rem;
}

.icono-detalle {
    color: var(--color-secundario);
    /* Color de acento para iconos */
    min-width: 1.5em;
    /* Espacio reservado para el icono */
    display: inline-block;
    /* Para alinear correctamente */
}

.mapa-seccion {
    /* Asegurar que la sección del mapa pueda crecer */
    display: flex;
    flex-direction: column;
    min-height: 25rem;
    /* Altura mínima para el mapa */
}

.mapa-leaflet {
    width: 100%;
    /* height: 25rem; */
    /* 400px aprox */
    flex-grow: 1;
    /* Ocupa el espacio disponible en la columna flex */
    z-index: 1;
    /* A veces necesario para que los controles del mapa funcionen */
}

/* Ajuste para asegurar que los popups de Leaflet tengan el estilo oscuro */
:deep(.leaflet-popup-content-wrapper),
:deep(.leaflet-popup-tip) {
    background: var(--color-superficie);
    color: var(--color-texto-principal);
    box-shadow: 0 3px 14px rgba(0, 0, 0, 0.4);
}

:deep(.leaflet-popup-content a) {
    color: var(--color-secundario);
}

:deep(.leaflet-control-attribution a) {
    color: var(--color-texto-secundario);
    /* Hacer link de atribución menos prominente */
}

:deep(.leaflet-control-attribution) {
    background: rgba(var(--color-fondo-rgb), 0.8) !important;
    color: var(--color-texto-secundario);
}


.d-grid .btn {
    padding-top: 0.75rem;
    /* Botones un poco más altos */
    padding-bottom: 0.75rem;
    font-size: 1.1rem;
}
</style>